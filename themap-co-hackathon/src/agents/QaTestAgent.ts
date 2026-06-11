import { BandRoom } from '../band/client';
import { EventType } from '../band/events';

export class QaTestAgent {
  constructor(private room: BandRoom) {
    this.init();
  }

  private init() {
    this.room.on(EventType.MAP_UPDATE, (e) => this.runTests(e));
  }

  private runTests(event: any) {
    console.log('[QaTestAgent] Testing published map features for accuracy...');
  }
}
