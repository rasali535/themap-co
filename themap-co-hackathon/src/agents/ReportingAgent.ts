import { BandRoom } from '../band/client';
import { EventType } from '../band/events';

export class ReportingAgent {
  constructor(private room: BandRoom) {
    this.init();
  }

  private init() {
    this.room.on(EventType.MAP_UPDATE, (e) => this.generateReport(e));
  }

  private generateReport(event: any) {
    this.room.send({
      type: EventType.REPORT_GENERATED,
      timestamp: new Date().toISOString(),
      sourceAgent: 'ReportingAgent',
      correlationId: event.correlationId,
      data: { taskId: event.data.taskId, summary: 'Task completed successfully.' }
    });
  }
}
