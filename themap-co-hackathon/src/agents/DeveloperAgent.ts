import { BandRoom } from '../band/client';
import { EventType } from '../band/events';

export class DeveloperAgent {
  constructor(private room: BandRoom) {}

  public suggestCode(prompt: string) {
    return `Suggested code for ${prompt}`;
  }
}
