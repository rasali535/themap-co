import { BandEventPayload, EventType } from './events';
import WebSocket from 'ws';

export class BandRoom {
  private listeners: Record<string, ((event: BandEventPayload) => void)[]> = {};
  private ws: WebSocket | null = null;
  private messageRef = 1;
  private joinRef = 1;

  constructor(
    public name: string,
    private apiKey: string,
    private roomId: string = "daca00d0-eb6b-4db1-8201-c46015c93d04" // Default mock UUID for hackathon
  ) {
    this.connect();
  }

  private connect() {
    // Connect to the official Band Platform Phoenix Channels
    this.ws = new WebSocket('wss://app.band.ai/api/v1/socket/websocket');

    this.ws.on('open', () => {
      console.log(`[Band WebSocket] Connected to wss://app.band.ai/api/v1/socket/websocket`);
      
      // Join the chat room channel
      const topic = `chat_room:${this.roomId}`;
      const payload = { token: this.apiKey }; 
      this.ws?.send(JSON.stringify([
        this.joinRef.toString(),
        this.messageRef.toString(),
        topic,
        "phx_join",
        payload
      ]));
      this.messageRef++;
    });

    this.ws.on('message', (data: string) => {
      try {
        const msg = JSON.parse(data);
        const [joinRef, ref, topic, event, payload] = msg;
        
        if (event === "message_created" && payload?.content) {
            try {
                // Strip out the Band @mention routing prefix before JSON parsing
                const rawContent = payload.content.replace(/^@[a-zA-Z0-9_-]+\s+/, '');
                const innerEvent: BandEventPayload = JSON.parse(rawContent);
                
                const eventListeners = this.listeners[innerEvent.type] || [];
                eventListeners.forEach((cb) => cb(innerEvent));
            } catch (e) {
                // Payload wasn't JSON or wasn't our system event
            }
        }
      } catch (e) {
        console.error("Failed to parse websocket message", e);
      }
    });

    this.ws.on('error', (err) => {
      console.error(`[Band WebSocket Error] ${err.message}`);
    });
  }

  on(eventType: EventType, callback: (event: BandEventPayload) => void) {
    if (!this.listeners[eventType]) {
      this.listeners[eventType] = [];
    }
    this.listeners[eventType].push(callback);
  }

  async send(event: BandEventPayload) {
    // Determine strict routing destination based on event type
    let targetAgent = "";
    switch(event.type) {
      case EventType.TASK_CREATED:
      case EventType.QA_RESULT:
      case EventType.RISK_ASSESSMENT:
        targetAgent = "OrchestratorAgent";
        break;
      case EventType.TASK_ASSIGNED:
        targetAgent = event.data?.agentId || "GeoIntelligenceAgent";
        break;
      case EventType.WORKFLOW_ESCALATED:
        targetAgent = "DeveloperAgent";
        break;
      case EventType.MAP_UPDATE:
        targetAgent = "QaTestAgent";
        break;
    }

    // Apply Band's strictly-required @mention routing pattern
    let contentString = JSON.stringify(event);
    if (targetAgent) {
      contentString = `@${targetAgent} ${contentString}`;
    }

    console.log(`[Band Room ${this.name}] ${targetAgent ? `Routing to @${targetAgent}` : 'Broadcasting'}: [${event.type}] from ${event.sourceAgent}`);
    
    // Simulate real REST API call to Band Platform via POST /messages
    try {
        const response = await fetch(`https://app.band.ai/api/v1/agent/chats/${this.roomId}/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': this.apiKey
            },
            body: JSON.stringify({
                content: contentString
            })
        });

        // For the hackathon demo, if the network fails or key is a placeholder, gracefully fallback
        if (!response.ok) {
            console.warn(`[Band REST] POST failed (using local fallback mode) - Status: ${response.status}`);
            const eventListeners = this.listeners[event.type] || [];
            eventListeners.forEach((cb) => cb(event));
        }
    } catch (e) {
        console.warn(`[Band REST] Network error (using local fallback mode)`);
        const eventListeners = this.listeners[event.type] || [];
        eventListeners.forEach((cb) => cb(event));
    }
  }
}

export class BandClient {
  private rooms: Record<string, BandRoom> = {};
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.BAND_API_KEY || 'sk-test-key';
  }

  joinRoom(name: string, roomId?: string): BandRoom {
    if (!this.rooms[name]) {
      this.rooms[name] = new BandRoom(name, this.apiKey, roomId);
    }
    return this.rooms[name];
  }
}

export const bandClient = new BandClient();
