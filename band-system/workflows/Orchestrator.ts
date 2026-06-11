import { BandRoom } from '../band/client';
import { EventType, TaskCreatedEvent, QaResultEvent } from '../types/events';

export class Orchestrator {
  constructor(private room: BandRoom) {
    this.init();
  }

  private init() {
    console.log('[Orchestrator] Initialized and orchestrating workflow...');

    this.room.on<TaskCreatedEvent>(EventType.TASK_CREATED, (event) => {
      console.log(`[Orchestrator] Detected new task ${event.payload.taskId}, assigning to GeoAgent...`);
      this.room.send({
        type: EventType.TASK_ASSIGN,
        timestamp: new Date().toISOString(),
        payload: {
          taskId: event.payload.taskId,
          agentId: 'geo-agent-1'
        }
      });
    });

    this.room.on<QaResultEvent>(EventType.QA_RESULT, (event) => {
      console.log(`[Orchestrator] Detected QA result for feature ${event.payload.featureId}: ${event.payload.approved ? 'APPROVED' : 'REJECTED'}`);
      
      this.room.send({
        type: EventType.MAP_UPDATE,
        timestamp: new Date().toISOString(),
        payload: {
          taskId: event.payload.taskId,
          featureId: event.payload.featureId,
          status: event.payload.approved ? 'COMMITTED' : 'REJECTED'
        }
      });
    });
  }
}
