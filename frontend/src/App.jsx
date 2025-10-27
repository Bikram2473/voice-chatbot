import React, { useEffect, useRef, useState } from "react";
import MicButton from "./components/MicButton";

const API_BASE = "http://localhost:4000";

export default function App() {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [messages, setMessages] = useState([
    { role: "system", content: "You are a helpful voice assistant." },
  ]);
  const recognitionRef = useRef(null);

  // 🔹 Initialize browser speech recognition
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("SpeechRecognition is not supported in this browser.");
      return;
    }

    const rec = new SpeechRecognition();
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    rec.onresult = (e) => {
      const text = e.results[0][0].transcript;
      setTranscript(text);
      const newMsgs = [...messages, { role: "user", content: text }];
      setMessages(newMsgs);
      sendToServer(newMsgs);
    };

    rec.onerror = (err) => console.error("Speech recognition error:", err);
    rec.onend = () => setListening(false);

    recognitionRef.current = rec;
  }, [messages]);

  // 🔹 Send messages to backend
  async function sendToServer(msgs) {
    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: msgs }),
      });
      const data = await res.json();
      if (data.text) {
        const botReply = data.text;
        const newMsgs = [...msgs, { role: "assistant", content: botReply }];
        setMessages(newMsgs);
        speak(botReply);
      }
    } catch (err) {
      console.error("Error sending to server:", err);
    }
  }

  // 🔹 Convert bot reply to speech
  function speak(text) {
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "en-US";
    window.speechSynthesis.speak(utter);
  }

  // 🔹 Start and stop listening
  function startListening() {
    if (recognitionRef.current) {
      setTranscript("");
      setListening(true);
      recognitionRef.current.start();
    }
  }

  function stopListening() {
    recognitionRef.current?.stop();
    setListening(false);
  }

  return (
    <div className="app">
      <h1>🎙️ Voice Chatbot</h1>
      <div className="chatbox">
        <div className="history">
          {messages
            .filter((m) => m.role !== "system")
            .map((m, i) => (
              <div
                key={i}
                className={m.role === "user" ? "user-msg" : "bot-msg"}
              >
                <strong>{m.role === "user" ? "You" : "Bot"}:</strong>{" "}
                {m.content}
              </div>
            ))}
        </div>

        <div className="controls">
          <MicButton
            listening={listening}
            onStart={startListening}
            onStop={stopListening}
          />
          <div className="transcript">{transcript}</div>
        </div>
      </div>
    </div>
  );
}
