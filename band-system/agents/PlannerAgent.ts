import { BandRoom } from '../band/client';
import { EventType, TaskCreatedEvent } from '../types/events';
import { v4 as uuidv4 } from 'uuid';

export class PlannerAgent {
  constructor(private room: BandRoom) {
    this.init();
  }

  private init() {
    console.log('[PlannerAgent] Initialized and listening to Band room...');
    // Planner doesn't necessarily listen to standard events to start, it's triggered externally,
    // but it could listen to higher-level directives.
  }

  public createMappingTask(description: string, region: string) {
    const taskId = uuidv4();
    console.log(`[PlannerAgent] Creating task ${taskId} for region ${region}`);
    
    this.room.send({
      type: EventType.TASK_CREATED,
      timestamp: new Date().toISOString(),
      payload: {
        taskId,
        description,
        region
      }
    });
  }
}
