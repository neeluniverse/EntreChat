from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit
from datetime import datetime
import random
import time

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-here'
socketio = SocketIO(app, cors_allowed_origins="*")

# Hardcoded passkey for demo purposes
CORRECT_PASSKEY = "chat123"

# Store for startup ideas and motivational quotes
STARTUP_IDEAS = [
    "An AI-powered personal shopping assistant",
    "A platform connecting local farmers directly with consumers",
    "A mental wellness app with personalized meditation programs",
    "Sustainable packaging as a service for e-commerce businesses",
    "A virtual interior design service using AR technology"
]

MOTIVATIONAL_QUOTES = [
    "The only way to do great work is to love what you do. - Steve Jobs",
    "Don't watch the clock; do what it does. Keep going. - Sam Levenson",
    "Believe you can and you're halfway there. - Theodore Roosevelt",
    "Everything you've ever wanted is on the other side of fear. - George Addair",
    "It always seems impossible until it's done. - Nelson Mandela"
]

# Store connected users (in production, use a proper database)
users = {}

@app.route('/')
def index():
    return render_template('index.html')

@socketio.on('connect')
def handle_connect():
    print('Client connected:', request.sid)

@socketio.on('disconnect')
def handle_disconnect():
    if request.sid in users:
        username = users[request.sid]
        del users[request.sid]
        emit('user_left', {'username': username, 'timestamp': datetime.now().strftime('%H:%M:%S')}, broadcast=True)
    print('Client disconnected:', request.sid)

@socketio.on('login')
def handle_login(data):
    passkey = data.get('passkey', '')
    username = data.get('username', 'Anonymous')
    
    if passkey == CORRECT_PASSKEY:
        users[request.sid] = username
        emit('login_success', {
            'username': username,
            'message': f'Welcome to the chat, {username}!',
            'timestamp': datetime.now().strftime('%H:%M:%S')
        })
        emit('user_joined', {
            'username': username,
            'timestamp': datetime.now().strftime('%H:%M:%S')
        }, broadcast=True, include_self=False)
    else:
        emit('login_failed', {'message': 'Invalid passkey'})

@socketio.on('chat_message')
def handle_chat_message(data):
    if request.sid not in users:
        emit('login_required', {'message': 'Please login first'})
        return
        
    username = users[request.sid]
    message = data.get('message', '')
    timestamp = datetime.now().strftime('%H:%M:%S')
    
    # Check for special commands
    if message.startswith('/'):
        if message == '/idea':
            random_idea = random.choice(STARTUP_IDEAS)
            emit('command_response', {
                'username': 'System',
                'message': f'Startup Idea: {random_idea}',
                'timestamp': timestamp
            })
        elif message == '/focus':
            random_quote = random.choice(MOTIVATIONAL_QUOTES)
            emit('command_response', {
                'username': 'System',
                'message': f'Motivational Quote: {random_quote}',
                'timestamp': timestamp
            })
        else:
            emit('command_response', {
                'username': 'System',
                'message': 'Unknown command. Available commands: /idea, /focus, /timer',
                'timestamp': timestamp
            })
    else:
        # Broadcast regular message to all clients
        emit('new_message', {
            'username': username,
            'message': message,
            'timestamp': timestamp
        }, broadcast=True)

if __name__ == '__main__':
    socketio.run(app, debug=True)
