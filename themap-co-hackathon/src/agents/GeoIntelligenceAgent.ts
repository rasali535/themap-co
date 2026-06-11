import { BandRoom } from '../band/client';
import { EventType } from '../band/events';

export class GeoIntelligenceAgent {
  constructor(private room: BandRoom) {
    this.init();
  }

  private init() {
    this.room.on(EventType.TASK_ASSIGNED, (e) => {
      if (e.data.agentId === 'GeoIntelligenceAgent') {
        this.processGeo(e);
      }
    });
  }

  private async processGeo(event: any) {
    this.room.send({
      type: EventType.TASK_STARTED,
      timestamp: new Date().toISOString(),
      sourceAgent: 'GeoIntelligenceAgent',
      correlationId: event.correlationId,
      data: { taskId: event.data.taskId }
    });

    // simulated extraction
    this.room.send({
      type: EventType.GEO_FEATURE_EXTRACTED,
      timestamp: new Date().toISOString(),
      sourceAgent: 'GeoIntelligenceAgent',
      correlationId: event.correlationId,
      data: {
        taskId: event.data.taskId,
        features: [{ type: 'Road', coordinates: [0,0] }]
      }
    });
  }
}
