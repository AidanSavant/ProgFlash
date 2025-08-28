import express from "express"
import bodyParser from "body-parser"
import dotenv from "dotenv"
import OpenAI from "openai"

dotenv.config()

const app = express()
const port = process.env.PORT || 3000
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

app.use(bodyParser.json())
app.use(express.static("."))
