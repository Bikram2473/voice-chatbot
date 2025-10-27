import React from "react";

export default function MicButton({ listening, onStart, onStop }) {
  return (
    <div>
      {listening ? (
        <button className="mic-btn listening" onClick={onStop}>
          Stop
        </button>
      ) : (
        <button className="mic-btn" onClick={onStart}>
          Speak
        </button>
      )}
    </div>
  );
}
