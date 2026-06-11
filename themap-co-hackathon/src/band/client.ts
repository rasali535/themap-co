import { BandEventPayload, EventType } from './events';

export class BandRoom {
  private listeners: Record<string, ((event: BandEventPayload) => void)[]> = {};

  constructor(public name: string) {}

  on(eventType: EventType, callback: (event: BandEventPayload) => void) {
    if (!this.listeners[eventType]) {
      this.listeners[eventType] = [];
    }
    this.listeners[eventType].push(callback);
  }

  send(event: BandEventPayload) {
    console.log(`[Band Room ${this.name}] [${event.type}] from ${event.sourceAgent}`);
    const eventListeners = this.listeners[event.type] || [];
    setTimeout(() => {
      eventListeners.forEach((cb) => cb(event));
    }, 0);
  }
}

export class BandClient {
  private rooms: Record<string, BandRoom> = {};

  joinRoom(name: string): BandRoom {
    if (!this.rooms[name]) {
      this.rooms[name] = new BandRoom(name);
    }
    return this.rooms[name];
  }
}

export const bandClient = new BandClient();
