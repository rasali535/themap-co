
from flask import Flask, request, jsonify
import os
try:
    from llamaserver import LlamaServer
except ImportError:
    LlamaServer = None
try:
    from qwen import Qwen
except ImportError:
    Qwen = None

# Initialize APIs if available
llama_api = LlamaServer(os.environ["LLAMA_SERVER_URL"]) if LlamaServer and "LLAMA_SERVER_URL" in os.environ else None
qwen_api = Qwen(os.environ["QWEN_API_URL"]) if Qwen and "QWEN_API_URL" in os.environ else None

app = Flask(__name__)

@app.route('/', methods=['GET'])
def index():
    return 'Hello World from Themap- Co!'

@app.route('/llama', methods=['POST'])
def llama_reasoning():
    if not llama_api:
        return jsonify({'error': 'LlamaServer not configured'}), 500
    text = request.json.get('text')
    prompt = request.json.get('prompt')
    response = llama_api.generate(text, prompt)
    return jsonify({'response': response})

@app.route('/qwen', methods=['POST'])
def qwen_code_snippet():
    if not qwen_api:
        return jsonify({'error': 'Qwen not configured'}), 500
    code = request.json.get('code')
    snippet = qwen_api.generate(code)
    return jsonify({'snippet': snippet})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 3004))
    app.run(host='0.0.0.0', port=port, debug=True)
