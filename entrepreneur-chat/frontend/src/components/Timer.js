import React, { useState, useEffect } from 'react';

const Timer = ({ onComplete }) => {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    let interval = null;
    
    if (isActive) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            clearInterval(interval);
            setIsActive(false);
            onComplete();
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(seconds - 1);
        }
      }, 1000);
    } else if (!isActive && seconds !== 0) {
      clearInterval(interval);
    }
    
    return () => clearInterval(interval);
  }, [isActive, minutes, seconds, onComplete]);

  const toggle = () => {
    setIsActive(!isActive);
  };

  const reset = () => {
    setIsActive(false);
    setMinutes(25);
    setSeconds(0);
  };

  const formatTime = () => {
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center space-x-2 bg-gray-700 px-3 py-1 rounded-full">
      <span className="text-sm font-medium">⏰ {formatTime()}</span>
      <button
        onClick={toggle}
        className="text-xs bg-gray-600 hover:bg-gray-500 px-2 py-1 rounded"
      >
        {isActive ? 'Pause' : 'Start'}
      </button>
      <button
        onClick={reset}
        className="text-xs bg-red-600 hover:bg-red-500 px-2 py-1 rounded"
      >
        Reset
      </button>
    </div>
  );
};

export default Timer;
