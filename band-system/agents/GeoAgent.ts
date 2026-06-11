import { BandRoom } from '../band/client';
import { EventType, TaskAssignEvent, MapFeatureExtractedEvent } from '../types/events';
import { v4 as uuidv4 } from 'uuid';

export class GeoAgent {
  constructor(private room: BandRoom) {
    this.init();
  }

  private init() {
    console.log('[GeoAgent] Initialized and listening to Band room...');
    
    this.room.on<TaskAssignEvent>(EventType.TASK_ASSIGN, (event) => {
      if (event.payload.agentId === 'geo-agent-1') {
        this.processTask(event.payload.taskId);
      }
    });
  }

  private async processTask(taskId: string) {
    console.log(`[GeoAgent] Extracting features for task ${taskId}...`);
    
    // Simulate feature extraction processing time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const featureId = uuidv4();
    
    this.room.send({
      type: EventType.MAP_FEATURE_EXTRACTED,
      timestamp: new Date().toISOString(),
      payload: {
        taskId,
        featureId,
        coordinates: [[0, 0], [1, 1], [1, 0]],
        featureType: 'building',
        confidence: 0.92
      }
    });
  }
}
