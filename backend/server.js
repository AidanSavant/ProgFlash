import express from "express"
import bodyParser from "body-parser"
import dotenv from "dotenv"
import OpenAI from "openai"

dotenv.config()
const port = process.env.PORT || 3000;

const app = express();
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

app.use(bodyParser.json());
app.use(express.static("../frontend"));

app.get("api/quiz", async (req, res) => {
    try {
        const topic = req.query.topic || "general programming";
        const difficulty = req.query.difficulty || "easy";

        const prompt = `
        Generate 10 multiple-choice questions about ${topic}.
        Difficulty: ${difficulty}.
        Each question should have exactly 4 options and one correct answer.
        Format the response as valid JSON like this:
        [
          {
            "question": "string",
            "options": ["A", "B", "C", "D"],
            "answer": "string"
          }
        ]`;

        const resp = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: "You are a helpful assistant that generates quiz questions." },
                { role: "user", content: prompt }
            ],
            max_tokens: 1500,
            temperature: 0.7,
        });

        let quiz;
        try {
            quiz = JSON.parse(resp.choices[0].message.content);
        } catch(error) {
            return res.status(500).json({ error: "Failed to parse quiz data from AI response." });
        }

        res.json({
            quiz: quiz,
            topic: topic,
            difficulty: difficulty
        });
    } catch(error) {
        console.error("Error generating quiz:", error);
        res.status(500).json({ error: "Failed to generate quiz." });
    }
});

app.get("/", (_, res) => {
    res.sendFile("index.html", { root: "../frontend/Index.html" });
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
