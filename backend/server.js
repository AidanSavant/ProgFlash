import path from "path";
import dotenv from "dotenv"
import OpenAI from "openai"
import express from "express"
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config()
const port = process.env.PORT || 3030;

const app = express();
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend")));

app.get("/api/get-quiz", async (req, res) => {
    try {
        const lang = req.query.lang || "general programming";
        const difficulty = req.query.difficulty || "easy";

        const prompt = `Generate 10 multiple-choice questions about ${lang}. Difficulty: ${difficulty}. Each question should have exactly 4 options and one correct answer. Respond ONLY with valid JSON like: [{"question":"string","options":["A","B","C","D"],"answer":0}]`;

        const resp = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 1500,
        });

        let questions;
        let raw_resp = resp.choices[0].message.content;

        try {
            raw_resp = raw_resp.replace(/```json\n?/, "").replace(/```/, "").trim();
            questions = JSON.parse(raw_resp);
        } catch(error) {
            return res.status(500).json({
                error: "Failed to parse quiz data from AI response.",
                raw: raw_resp
            });
        }

        res.json(questions);
    } catch(error) {
        console.error("Error generating quiz:", error);
        res.status(500).json({ error: "Failed to generate quiz!", error_msg: error.message });
    }
});

app.get("/", (_, res) => {
    res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
