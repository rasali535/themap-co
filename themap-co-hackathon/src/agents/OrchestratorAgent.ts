import { BandRoom } from '../band/client';
import { EventType } from '../band/events';

export class OrchestratorAgent {
  constructor(private room: BandRoom) {
    this.init();
  }

  private init() {
    this.room.on(EventType.TASK_CREATED, (e) => this.assignTask(e));
    this.room.on(EventType.QA_RESULT, (e) => this.processQA(e));
    this.room.on(EventType.RISK_ASSESSMENT, (e) => this.processRisk(e));
  }

  private assignTask(event: any) {
    this.room.send({
      type: EventType.TASK_ASSIGNED,
      timestamp: new Date().toISOString(),
      sourceAgent: 'OrchestratorAgent',
      correlationId: event.correlationId,
      data: { taskId: event.data.taskId, agentId: 'GeoIntelligenceAgent' }
    });
  }

  private processQA(event: any) {
    if (!event.data.approved) {
      // Recovery System: Escalation on QA Failure
      this.room.send({
        type: EventType.WORKFLOW_ESCALATED,
        timestamp: new Date().toISOString(),
        sourceAgent: 'OrchestratorAgent',
        correlationId: event.correlationId,
        data: { taskId: event.data.taskId, reason: 'QA Failed', action: 'Re-assigning' }
      });
      // Re-assign logic would go here
    }
  }

  private processRisk(event: any) {
    // Gate Map Updates behind Risk Checks
    if (event.data.confidence >= 0.90) {
      this.room.send({
        type: EventType.APPROVAL_GRANTED,
        timestamp: new Date().toISOString(),
        sourceAgent: 'OrchestratorAgent',
        correlationId: event.correlationId,
        data: { taskId: event.data.taskId }
      });
      
      this.room.send({
        type: EventType.MAP_UPDATE,
        timestamp: new Date().toISOString(),
        sourceAgent: 'OrchestratorAgent',
        correlationId: event.correlationId,
        data: { taskId: event.data.taskId, status: 'PUBLISHED' }
      });
    } else {
      this.room.send({
        type: EventType.APPROVAL_REJECTED,
        timestamp: new Date().toISOString(),
        sourceAgent: 'OrchestratorAgent',
        correlationId: event.correlationId,
        data: { taskId: event.data.taskId, reason: 'High Risk / Low Confidence' }
      });
    }
  }
}
