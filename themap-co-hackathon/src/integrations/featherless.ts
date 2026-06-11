export class FeatherlessAi {
  constructor(private apiKey: string = process.env.FEATHERLESS_API_KEY || '') {}
  
  async reason(prompt: string) {
    return { reasoning: `[Featherless Reasoning] ${prompt}` };
  }
}
