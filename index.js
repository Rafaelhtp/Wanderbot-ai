import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai'; // 1. Import menggunakan GoogleGenAI

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// 2. Inisialisasi client menggunakan pola yang baru
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const GEMINI_MODEL = "gemini-2.5-flash";

app.post('/api/chat', async (req, res) => {
    const { conversation } = req.body;

    try {
        if (!Array.isArray(conversation)) {
            throw new Error('Messages must be an array');
        }

        // Memisahkan pesan terakhir dari history
        const lastMessage = conversation[conversation.length - 1].text;
        
        // Memformat history sesuai format struktur baru SDK
        const history = conversation.slice(0, -1).map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
        }));

        // 3. Membuat sesi chat dengan fungsi ai.chats.create()
        const chat = ai.chats.create({
            model: GEMINI_MODEL,
            config: {
                systemInstruction: "Kamu adalah 'WanderBot', asisten perjalanan yang sangat ahli tentang pariwisata di Indonesia. Gaya bahasamu santai, ramah, dan sering menggunakan emoji ✈️. Berikan rekomendasi destinasi, estimasi budget, dan tips perjalanan yang sangat detail.",
                temperature: 0.9,
                topP: 0.95,
                topK: 40,
            },
            history: history
        });

        // 4. Mengirim pesan menggunakan properti objek { message: ... }
        const response = await chat.sendMessage({ message: lastMessage });
        
        // 5. Mengambil teks balasan. Pada SDK baru, .text adalah properti (bukan fungsi .text() lagi)
        res.json({ result: response.text });

    } catch (error) {
        console.error("ERROR GEMINI:", error);
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`WanderBot server running on http://localhost:${PORT}`);
});