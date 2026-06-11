export class AiMlApi {
  constructor(private apiKey: string = process.env.AIML_API_KEY || '') {}
  
  async complete(prompt: string) {
    return { text: `[AI/ML API Response] ${prompt}` };
  }
}
