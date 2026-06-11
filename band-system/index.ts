import { bandClient } from './band/client';
import { PlannerAgent } from './agents/PlannerAgent';
import { GeoAgent } from './agents/GeoAgent';
import { QaAgent } from './agents/QaAgent';
import { Orchestrator } from './workflows/Orchestrator';

// Initialize Band room
const room = bandClient.joinRoom('themap-co-core');

// Initialize agents
console.log('--- Booting Multi-Agent System ---');
const orchestrator = new Orchestrator(room);
const planner = new PlannerAgent(room);
const geoAgent = new GeoAgent(room);
const qaAgent = new QaAgent(room);

console.log('--- System Ready ---');

// Simulate a workflow execution
console.log('\nStarting demonstration flow...\n');
planner.createMappingTask('Extract building footprints in region X', 'us-west-1');
