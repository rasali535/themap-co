<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/03b3e592-f42c-4592-97da-458d26cd19de

## Run Locally (Flask API)

**Prerequisites:**  Python 3.8+, pip

1. (Optional) Create and activate a virtual environment:
   ```
   python -m venv env
   .\env\Scripts\activate  # Windows
   source env/bin/activate  # Linux/Mac
   ```
2. Install Python dependencies:
   ```
   pip install flask llamaserver qwen
   ```
3. Set environment variables in your `.env` file:
   - `LLAMA_SERVER_URL` (for Llama endpoint)
   - `QWEN_API_URL` (for Qwen endpoint)
   - `PORT` (optional, default 3004)
4. Run the Flask app:
   ```
   python app.py
   ```

## API Endpoints

- `POST /llama` — JSON: `{ "text": ..., "prompt": ... }`
- `POST /qwen` — JSON: `{ "code": ... }`

Example curl:
```
curl -X POST http://localhost:3004/llama \
  -H "Content-Type: application/json" \
  -d '{"text": "What is a good way to learn programming?", "prompt": "Explain the importance of understanding data structures."}'
```
