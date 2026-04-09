interface LLMResponse {
  content: string;
}

const LLAMA_URL = import.meta.env.VITE_LLAMA_SERVER_URL || 'http://localhost:3004/llama';
const QWEN_URL = import.meta.env.VITE_QWEN_API_URL || 'http://localhost:3004/qwen';
const SAVE_URL = 'http://localhost:3004/save-output';

const fetchWithRetry = async (url: string, options: RequestInit, retries: number = 2, backoff: number = 1000): Promise<Response> => {
  try {
    const response = await fetch(url, options);
    if (response.ok) return response;
    
    // Retry on 5xx or specific errors
    if (retries > 0 && response.status >= 500) {
      console.warn(`Retrying request to ${url} (status: ${response.status})...`);
      await new Promise(resolve => setTimeout(resolve, backoff));
      return fetchWithRetry(url, options, retries - 1, backoff * 2);
    }
    return response;
  } catch (error) {
    if (retries > 0 && (error.name !== 'AbortError')) {
      console.warn(`Retrying request to ${url} due to error: ${error.message}...`);
      await new Promise(resolve => setTimeout(resolve, backoff));
      return fetchWithRetry(url, options, retries - 1, backoff * 2);
    }
    throw error;
  }
};

export const streamLlama = async (
  prompt: string, 
  onUpdate: (token: string) => void,
  context: string = ''
): Promise<void> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 600000); // 10 minutes

  try {
    const response = await fetch(LLAMA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: `Context: ${context}\n\nUser: ${prompt}\n\nAssistant (Reasoning):`,
        stream: true
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`Ollama error: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('Response body is not readable');

    const decoder = new TextDecoder();
    let fullResponse = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const parsed = JSON.parse(line);
          if (parsed.response) {
            fullResponse += parsed.response;
            onUpdate(fullResponse);
          }
          if (parsed.done) break;
        } catch (e) {
          console.warn('Failed to parse stream line:', line);
        }
      }
    }
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('Llama Stream Error:', error);
    throw error;
  }
};

export const callLlama = async (prompt: string, context: string = ''): Promise<string> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 600000); // 10 minutes

  try {
    const response = await fetchWithRetry(LLAMA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: `Context: ${context}\n\nUser: ${prompt}\n\nAssistant (Reasoning):`,
        stream: false
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: response.statusText }));
      return `Error: ${errorData.error || response.statusText}`;
    }

    const data = await response.json();
    return data.content || data.response || 'I encountered an error while reasoning.';
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('Llama Error:', error);
    if (error.name === 'AbortError') {
      return 'Llama reasoning timed out (max 10 minutes). The model might be loading or the prompt is too long.';
    }
    return 'Llama is currently unavailable for reasoning.';
  }
};

export const callQwen = async (prompt: string, taskDescription: string = ''): Promise<string> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 600000); // 10 minutes

  try {
    const response = await fetchWithRetry(QWEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: `Task: ${taskDescription}\n\nInstructions: ${prompt}\n\nOutput (Coding/Implementation):`,
        stream: false
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: response.statusText }));
      return `Error: ${errorData.error || response.statusText}`;
    }

    const data = await response.json();
    return data.content || data.response || 'I encountered an error while coding.';
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('Qwen Error:', error);
    if (error.name === 'AbortError') {
      return 'Qwen coding timed out (max 10 minutes).';
    }
    return 'Qwen is currently unavailable for coding.';
  }
};

export const saveTaskOutput = async (filename: string, content: string): Promise<boolean> => {
  try {
    const response = await fetch(SAVE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename, content })
    });
    return response.ok;
  } catch (error) {
    console.error('Save Error:', error);
    return false;
  }
};
