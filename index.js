import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const GEMINI_MODEL = "gemini-1.5-flash";

app.post('/api/chat', async (req, res) => {
    const { conversation } = req.body;

    try {
        if (!Array.isArray(conversation)) {
            throw new Error('Messages must be an array');
        }

        const model = genAI.getGenerativeModel({ 
            model: GEMINI_MODEL,
            // Creative Parameters & System Instruction
            systemInstruction: "Kamu adalah 'WanderBot', asisten perjalanan yang sangat ahli tentang pariwisata di Indonesia. Gaya bahasamu santai, ramah, dan sering menggunakan emoji ✈️. Berikan rekomendasi destinasi, estimasi budget, dan tips perjalanan yang sangat detail."
        });

        const chat = model.startChat({
            history: conversation.slice(0, -1).map(msg => ({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.text }],
            })),
            generationConfig: {
                temperature: 0.9, // Kreativitas tinggi untuk saran perjalanan
                topP: 0.95,
                topK: 40,
            },
        });

        const lastMessage = conversation[conversation.length - 1].text;
        const result = await chat.sendMessage(lastMessage);
        const response = await result.response;
        
        res.json({ result: response.text() });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`WanderBot server running on http://localhost:${PORT}`);
});