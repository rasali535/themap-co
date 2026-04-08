interface LLMResponse {
  content: string;
}

const LLAMA_URL = import.meta.env.VITE_LLAMA_SERVER_URL || 'http://localhost:3004/llama';
const QWEN_URL = import.meta.env.VITE_QWEN_API_URL || 'http://localhost:3004/qwen';

export const callLlama = async (prompt: string, context: string = ''): Promise<string> => {
  try {
    const response = await fetch(LLAMA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: `Context: ${context}\n\nUser: ${prompt}\n\nAssistant (Reasoning):`,
        stream: false
      }),
    });
    const data = await response.json();
    return data.response || data.content || 'I encountered an error while reasoning.';
  } catch (error) {
    console.error('Llama Error:', error);
    return 'Llama is currently unavailable for reasoning.';
  }
};

export const callQwen = async (prompt: string, taskDescription: string = ''): Promise<string> => {
  try {
    const response = await fetch(QWEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: `Task: ${taskDescription}\n\nInstructions: ${prompt}\n\nOutput (Coding/Implementation):`,
        stream: false
      }),
    });
    const data = await response.json();
    return data.response || data.content || 'I encountered an error while coding.';
  } catch (error) {
    console.error('Qwen Error:', error);
    return 'Qwen is currently unavailable for coding.';
  }
};
