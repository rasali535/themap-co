import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3004;
const OLLAMA_URL = process.env.OLLAMA_API_URL || 'http://localhost:11434/api/generate';

app.use(cors());
app.use(express.json());

app.post('/llama', async (req, res) => {
  try {
    const { prompt } = req.body;
    const response = await fetch(OLLAMA_URL, {
      method: 'POST',
      body: JSON.stringify({
        model: 'llama3.2',
        prompt: prompt,
        stream: false
      })
    });
    const data = await response.json();
    res.json({ content: data.response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/qwen', async (req, res) => {
  try {
    const { prompt } = req.body;
    const response = await fetch(OLLAMA_URL, {
      method: 'POST',
      body: JSON.stringify({
        model: 'qwen2.5-coder',
        prompt: prompt,
        stream: false
      })
    });
    const data = await response.json();
    res.json({ content: data.response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Model Proxy running on http://localhost:${PORT}`);
  console.log(`- Llama Reasoning at /llama`);
  console.log(`- Qwen Coding at /qwen`);
});
