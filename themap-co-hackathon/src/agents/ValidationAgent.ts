import { BandRoom } from '../band/client';
import { EventType } from '../band/events';

export class ValidationAgent {
  constructor(private room: BandRoom) {
    this.init();
  }

  private init() {
    this.room.on(EventType.GEO_FEATURE_EXTRACTED, (e) => this.validate(e));
  }

  private validate(event: any) {
    // Simulate complex validation logic that can sometimes fail
    const isValid = Math.random() > 0.1; // 90% success rate
    
    this.room.send({
      type: EventType.QA_RESULT,
      timestamp: new Date().toISOString(),
      sourceAgent: 'ValidationAgent',
      correlationId: event.correlationId,
      data: { taskId: event.data.taskId, approved: isValid }
    });
  }
}
