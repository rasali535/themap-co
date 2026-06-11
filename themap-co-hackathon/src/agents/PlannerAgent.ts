import { BandRoom } from '../band/client';
import { EventType } from '../band/events';
import { v4 as uuidv4 } from 'uuid';

export class PlannerAgent {
  constructor(private room: BandRoom) {}

  public receiveRequest(request: string) {
    const taskId = uuidv4();
    const correlationId = uuidv4();
    
    this.room.send({
      type: EventType.TASK_CREATED,
      timestamp: new Date().toISOString(),
      sourceAgent: 'PlannerAgent',
      correlationId,
      data: {
        taskId,
        request,
        plan: ['Extract features', 'Validate', 'Assess Risk']
      }
    });
    
    return { taskId, correlationId };
  }
}
