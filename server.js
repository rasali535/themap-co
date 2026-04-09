import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { setGlobalDispatcher, Agent } from 'undici';

// Increase timeouts for global fetch to handle slow LLM responses
setGlobalDispatcher(new Agent({
  headersTimeout: 600000, // 10 minutes
  bodyTimeout: 600000,    // 10 minutes
  connectTimeout: 60000   // 1 minute
}));

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3004;
const OLLAMA_URL = process.env.OLLAMA_API_URL || 'http://localhost:11434/api/generate';
const LLAMA_MODEL = process.env.VITE_LLAMA_MODEL || 'llama3.2';
const QWEN_MODEL = process.env.VITE_QWEN_MODEL || 'qwen2.5-coder';

app.use(cors());
app.use(express.json());

app.get('/debug', async (req, res) => {
  try {
    const versionUrl = OLLAMA_URL.replace('/api/generate', '/api/version');
    const response = await fetch(versionUrl);
    const data = await response.json();
    res.json({ status: 'ok', ollama_version: data, internal_url: OLLAMA_URL });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message, target: OLLAMA_URL });
  }
});

app.post('/llama', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'prompt is required' });
    }
    
    console.log(`Llama request: ${prompt}`);
    console.log(`Ollama URL: ${OLLAMA_URL}`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 600000); // 10 minutes
    
    const response = await fetch(OLLAMA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: LLAMA_MODEL,
        prompt: prompt,
        stream: false
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    console.log(`Ollama response: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: `Ollama error (${response.status}): ${errorText}` });
    }
    
    const data = await response.json();
    res.json({ content: data.response });
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('Llama error: Request timed out');
      res.status(504).json({ error: 'Request timed out' });
    } else {
      console.error('Llama error:', error.message);
      res.status(500).json({ error: error.message });
    }
  }
});

app.post('/qwen', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'prompt is required' });
    }
    
    console.log(`Qwen request: ${prompt}`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 600000); // 10 minutes
    
    const response = await fetch(OLLAMA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: QWEN_MODEL,
        prompt: prompt,
        stream: false
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    console.log(`Ollama response: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: `Ollama error (${response.status}): ${errorText}` });
    }
    
    const data = await response.json();
    res.json({ content: data.response });
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('Qwen error: Request timed out');
      res.status(504).json({ error: 'Request timed out' });
    } else {
      console.error('Qwen error:', error.message);
      res.status(500).json({ error: error.message });
    }
  }
});

app.listen(PORT, () => {
  console.log(`Model Proxy running on http://localhost:${PORT}`);
  console.log(`- Llama Reasoning at /llama (Model: ${LLAMA_MODEL})`);
  console.log(`- Qwen Coding at /qwen (Model: ${QWEN_MODEL})`);
  console.log(`- Ollama URL: ${OLLAMA_URL}`);
});
