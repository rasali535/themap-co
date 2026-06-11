import { BandRoom } from '../band/client';
import { EventType, MapFeatureExtractedEvent } from '../types/events';

export class QaAgent {
  constructor(private room: BandRoom) {
    this.init();
  }

  private init() {
    console.log('[QaAgent] Initialized and listening to Band room...');
    
    this.room.on<MapFeatureExtractedEvent>(EventType.MAP_FEATURE_EXTRACTED, (event) => {
      this.validateFeature(event.payload);
    });
  }

  private async validateFeature(payload: MapFeatureExtractedEvent['payload']) {
    console.log(`[QaAgent] Validating feature ${payload.featureId} for task ${payload.taskId}...`);
    
    // Simulate validation time
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const isApproved = payload.confidence > 0.90;
    
    this.room.send({
      type: EventType.QA_RESULT,
      timestamp: new Date().toISOString(),
      payload: {
        taskId: payload.taskId,
        featureId: payload.featureId,
        approved: isApproved,
        reason: isApproved ? undefined : 'Confidence below threshold'
      }
    });
  }
}
