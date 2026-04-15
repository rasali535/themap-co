import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const app = express();
const PORT = process.env.PORT || 9999;
const OLLAMA_URL = 'http://127.0.0.1:11434/api/generate';
// Global fetch settings are handled per-request to ensure stability across different Node.js environments.
const LLAMA_MODEL = process.env.VITE_LLAMA_MODEL || 'llama3.2';
const QWEN_MODEL = process.env.VITE_QWEN_MODEL || 'qwen2.5-coder';

app.use(cors());
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf.toString();
  }
}));

// Better logging and error handling
app.use((req, res, next) => {
  if (req.method === 'POST') {
    console.log(`[${new Date().toISOString()}] Incoming POST ${req.url}`);
  }
  next();
});

// JSON error handler
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('JSON Parsing Error:', err.message);
    console.error('Raw Body was:', req.rawBody);
    return res.status(400).json({ error: 'Invalid JSON', detail: err.message, raw: req.rawBody });
  }
  next();
});

app.use((req, res, next) => {
  if (req.method === 'POST') {
    if (req.body && Object.keys(req.body).length > 0) {
      console.log(` - Body:`, JSON.stringify(req.body).substring(0, 200));
      console.log(` - Stream param:`, req.body.stream);
    }
  }
  next();
});



// Serve results directory statically
const resultsPath = path.join(__dirname, 'results');
if (!fs.existsSync(resultsPath)) {
  fs.mkdirSync(resultsPath);
}
app.use('/results', express.static(resultsPath));


app.get('/debug', async (req, res) => {
  try {
    console.log('Debug: Checking Ollama version...');
    const versionUrl = OLLAMA_URL.replace('/api/generate', '/api/version');
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 seconds for debug
    
    const response = await fetch(versionUrl, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    const data = await response.json();
    console.log('Debug: Ollama version response:', data);
    res.json({ 
      status: 'ok', 
      ollama_version: data, 
      internal_url: OLLAMA_URL,
      node_version: process.version,
      env: {
        PORT,
        OLLAMA_URL
      }
    });
  } catch (error) {
    console.error('Debug Error:', error.message);
    res.status(500).json({ 
      status: 'error', 
      message: error.message, 
      name: error.name,
      target: OLLAMA_URL 
    });
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
    const timeoutId = setTimeout(() => controller.abort(), 3600000); // 1 hour
    
    const response = await fetch(OLLAMA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: LLAMA_MODEL,
        prompt: prompt,
        stream: req.body.stream || false
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    console.log(`Ollama response status: ${response.status}, streaming: ${req.body.stream || false}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: `Ollama error (${response.status}): ${errorText}` });
    }

    // Handle Streaming
    if (req.body.stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        res.write(chunk);
      }
      res.end();
      return;
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
    const timeoutId = setTimeout(() => controller.abort(), 3600000); // 1 hour
    
    const response = await fetch(OLLAMA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: QWEN_MODEL,
        prompt: prompt,
        stream: req.body.stream || false
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    console.log(`Ollama response status: ${response.status}, streaming: ${req.body.stream || false}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: `Ollama error (${response.status}): ${errorText}` });
    }

    // Handle Streaming
    if (req.body.stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        res.write(chunk);
      }
      res.end();
      return;
    }
    
    const data = await response.json();
    res.json({ content: data.response });
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('Qwen error: Request timed out');
      res.status(504).json({ error: 'Request timed out' });
    } else {
      console.error('Qwen error details:', error);
      res.status(500).json({ error: error.message, stack: error.stack });
    }
  }
});

app.post('/save-output', async (req, res) => {
  try {
    const { filename, content, format = 'txt' } = req.body;
    if (!filename || !content) {
      return res.status(400).json({ error: 'filename and content are required' });
    }

    const extension = format.toLowerCase();
    const safeFilename = filename.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.' + extension;
    const filePath = path.join(__dirname, 'results', safeFilename);

    // Ensure results directory exists
    const resultsDir = path.join(__dirname, 'results');
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir);
    }

    fs.writeFileSync(filePath, content);
    console.log(`Saved output to ${filePath}`);
    res.json({ 
      status: 'success', 
      path: filePath,
      url: `http://localhost:${PORT}/results/${safeFilename}`
    });
  } catch (error) {
    console.error('Save Output Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Model Proxy running on http://localhost:${PORT}`);
  console.log(`- Llama Reasoning at /llama (Model: ${LLAMA_MODEL})`);
  console.log(`- Qwen Coding at /qwen (Model: ${QWEN_MODEL})`);
  console.log(`- Ollama URL: ${OLLAMA_URL}`);
});

// Set server timeout to 0 (infinity) to prevent Node.js from closing connections
// while waiting for extremely slow LLM responses.
server.timeout = 0;
server.keepAliveTimeout = 0;

