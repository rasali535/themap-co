export enum EventType {
  TASK_CREATED = 'TASK_CREATED',
  TASK_ASSIGN = 'TASK_ASSIGN',
  MAP_FEATURE_EXTRACTED = 'MAP_FEATURE_EXTRACTED',
  QA_RESULT = 'QA_RESULT',
  MAP_UPDATE = 'MAP_UPDATE'
}

export interface BaseEvent {
  type: EventType;
  timestamp: string;
  payload: any;
}

export interface TaskCreatedEvent extends BaseEvent {
  type: EventType.TASK_CREATED;
  payload: {
    taskId: string;
    description: string;
    region: string;
  };
}

export interface TaskAssignEvent extends BaseEvent {
  type: EventType.TASK_ASSIGN;
  payload: {
    taskId: string;
    agentId: string;
  };
}

export interface MapFeatureExtractedEvent extends BaseEvent {
  type: EventType.MAP_FEATURE_EXTRACTED;
  payload: {
    taskId: string;
    featureId: string;
    coordinates: [number, number][];
    featureType: string;
    confidence: number;
  };
}

export interface QaResultEvent extends BaseEvent {
  type: EventType.QA_RESULT;
  payload: {
    taskId: string;
    featureId: string;
    approved: boolean;
    reason?: string;
  };
}

export interface MapUpdateEvent extends BaseEvent {
  type: EventType.MAP_UPDATE;
  payload: {
    taskId: string;
    featureId: string;
    status: 'COMMITTED' | 'REJECTED';
  };
}

export type BandEvent =
  | TaskCreatedEvent
  | TaskAssignEvent
  | MapFeatureExtractedEvent
  | QaResultEvent
  | MapUpdateEvent;
