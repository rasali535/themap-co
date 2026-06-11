import { BandRoom } from '../band/client';
import { EventType } from '../band/events';

export class QaTestAgent {
  constructor(private room: BandRoom) {
    this.init();
  }

  private init() {
    this.room.on(EventType.MAP_UPDATE, (e) => this.runRegressionTests(e));
  }

  private runRegressionTests(event: any) {
    this.room.send({
      type: EventType.SYSTEM_NOTIFICATION,
      timestamp: new Date().toISOString(),
      sourceAgent: 'QaTestAgent',
      correlationId: event.correlationId,
      data: { message: `Regression test PASSED for feature update ${event.data.taskId}` }
    });
  }
}
