import { BandRoom } from '../band/client';
import { EventType } from '../band/events';

export class RiskAgent {
  constructor(private room: BandRoom) {
    this.init();
  }

  private init() {
    this.room.on(EventType.GEO_FEATURE_VALIDATED, (e) => this.assessRisk(e));
  }

  private assessRisk(event: any) {
    this.room.send({
      type: EventType.RISK_ASSESSMENT,
      timestamp: new Date().toISOString(),
      sourceAgent: 'RiskAgent',
      correlationId: event.correlationId,
      data: { taskId: event.data.taskId, score: 0.12, confidence: 0.98 }
    });
  }
}
