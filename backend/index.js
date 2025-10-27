// backend/index.js
import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Gemini Chat Endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const messages = req.body.messages;
    const userMessage = messages[messages.length - 1].content;

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    // ✅ Use the latest available model
    const model = "models/gemini-2.0-flash";

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/${model}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: userMessage }] }],
        }),
      }
    );

    const data = await response.json();
    console.log("Gemini raw response:", JSON.stringify(data, null, 2));

    if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      const botReply = data.candidates[0].content.parts[0].text;
      res.json({ text: botReply });
    } else {
      res.json({
        text:
          "Sorry, I didn’t get that. (Debug Info: " +
          JSON.stringify(data?.error || "no content") +
          ")",
      });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to fetch response from Gemini API" });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
