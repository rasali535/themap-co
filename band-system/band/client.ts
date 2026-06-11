import { BandEvent, EventType } from '../types/events';

// Mock implementation of Band SDK to satisfy compilation
export class BandRoom {
  private listeners: Record<string, ((event: any) => void)[]> = {};

  constructor(public name: string) {}

  on<T extends BandEvent>(eventType: EventType, callback: (event: T) => void) {
    if (!this.listeners[eventType]) {
      this.listeners[eventType] = [];
    }
    this.listeners[eventType].push(callback);
  }

  send(event: BandEvent) {
    console.log(`[Band Room ${this.name}] Broadcasting event: ${event.type}`, event.payload);
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

// Singleton Band Client instance for the application
export const bandClient = new BandClient();
