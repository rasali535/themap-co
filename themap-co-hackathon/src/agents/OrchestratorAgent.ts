import { BandRoom } from '../band/client';
import { EventType } from '../band/events';
import { v4 as uuidv4 } from 'uuid';

export class OrchestratorAgent {
  constructor(private room: BandRoom) {
    this.init();
  }

  private init() {
    this.room.on(EventType.TASK_CREATED, (e) => this.assignTask(e));
    this.room.on(EventType.QA_RESULT, (e) => this.processQA(e));
    this.room.on(EventType.APPROVAL_GRANTED, (e) => this.finalizeUpdate(e));
  }

  private assignTask(event: any) {
    const taskId = event.data.taskId;
    this.room.send({
      type: EventType.TASK_ASSIGNED,
      timestamp: new Date().toISOString(),
      sourceAgent: 'OrchestratorAgent',
      correlationId: event.correlationId,
      data: { taskId, agentId: 'GeoIntelligenceAgent' }
    });
  }

  private processQA(event: any) {
    if (event.data.approved) {
      this.room.send({
        type: EventType.APPROVAL_GRANTED,
        timestamp: new Date().toISOString(),
        sourceAgent: 'OrchestratorAgent',
        correlationId: event.correlationId,
        data: { taskId: event.data.taskId }
      });
    } else {
      this.room.send({
        type: EventType.APPROVAL_REJECTED,
        timestamp: new Date().toISOString(),
        sourceAgent: 'OrchestratorAgent',
        correlationId: event.correlationId,
        data: { taskId: event.data.taskId }
      });
    }
  }

  private finalizeUpdate(event: any) {
    this.room.send({
      type: EventType.MAP_UPDATE,
      timestamp: new Date().toISOString(),
      sourceAgent: 'OrchestratorAgent',
      correlationId: event.correlationId,
      data: { taskId: event.data.taskId, status: 'PUBLISHED' }
    });
  }
}
