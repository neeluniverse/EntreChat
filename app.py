import os
import random
from flask import Flask, render_template, request, redirect, url_for, session
from flask_socketio import SocketIO, send

# Setup
app = Flask(__name__)
app.secret_key = "supersecret"  # change this
socketio = SocketIO(app, cors_allowed_origins="*")

# Simple passkey system
VALID_PASSKEYS = {"entre123", "team456"}

# Sample data
startup_ideas = [
    "AI tool for students 🚀",
    "SaaS for personal finance 💸",
    "Marketplace for digital assets 🎨",
    "Remote team collaboration app 🌍",
    "Habit tracker with AI coach 📈"
]

quotes = [
    "Stay hungry, stay foolish. – Steve Jobs",
    "Move fast and break things. – Mark Zuckerberg",
    "The best way to predict the future is to create it. – Peter Drucker",
    "Opportunities don't happen. You create them. – Chris Grosser",
    "Do something today that your future self will thank you for."
]


@app.route("/", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        passkey = request.form.get("passkey")
        username = request.form.get("username")
        if passkey in VALID_PASSKEYS:
            session["username"] = username
            return redirect(url_for("chat"))
        else:
            return render_template("index.html", error="Invalid passkey")
    return render_template("index.html")


@app.route("/chat")
def chat():
    if "username" not in session:
        return redirect(url_for("login"))
    return render_template("chat.html", username=session["username"])


@socketio.on("message")
def handle_message(msg):
    username = session.get("username", "Anonymous")

    # Handle commands
    if msg.strip().lower() == "/idea":
        msg = random.choice(startup_ideas)
    elif msg.strip().lower() == "/focus":
        msg = random.choice(quotes)

    send({"user": username, "msg": msg}, broadcast=True)


if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))

