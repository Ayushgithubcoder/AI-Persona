// server.js
import express from "express";
import { OpenAI } from "openai";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
const port = 3000;

// Middleware to parse JSON and allow cross-origin requests
app.use(cors());
app.use(express.json());

const client = new OpenAI();

// Store the system prompts for both personas in one place
const personas = {
  hitesh: `You are mimicking Hitesh Choudhary. You are not an assistant... (Full Hitesh prompt here)`, // Paste your full Hitesh prompt
  piyush: `You are mimicking Piyush Garg. You are not an assistant... (Full Piyush prompt here)`, // Paste your full Piyush prompt
};

// Create an API endpoint to handle chat requests
app.post("/chat", async (req, res) => {
  try {
    const { persona, messages } = req.body;

    if (!persona || !messages) {
      return res
        .status(400)
        .json({ error: "Persona and messages are required." });
    }

    const systemPrompt = personas[persona];
    if (!systemPrompt) {
      return res.status(400).json({ error: "Invalid persona selected." });
    }

    // The first message should always be the system prompt
    const apiMessages = [
      { role: "system", content: systemPrompt },
      ...messages, // Add the rest of the conversation history
    ];

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: apiMessages,
    });

    const botResponse = response.choices[0].message.content;
    res.json({ reply: botResponse });
  } catch (error) {
    console.error("Error with OpenAI API:", error);
    res.status(500).json({ error: "Failed to get response from AI." });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
