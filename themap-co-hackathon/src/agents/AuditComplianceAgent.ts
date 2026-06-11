import { BandRoom } from '../band/client';
import { EventType } from '../band/events';

export class AuditComplianceAgent {
  constructor(private room: BandRoom) {
    this.init();
  }

  private init() {
    this.room.on(EventType.QA_RESULT, (e) => this.logAudit(e));
    this.room.on(EventType.APPROVAL_GRANTED, (e) => this.logAudit(e));
    this.room.on(EventType.APPROVAL_REJECTED, (e) => this.logAudit(e));
  }

  private logAudit(event: any) {
    this.room.send({
      type: EventType.AUDIT_LOGGED,
      timestamp: new Date().toISOString(),
      sourceAgent: 'AuditComplianceAgent',
      correlationId: event.correlationId,
      data: { eventType: event.type, logged: true }
    });
  }
}
