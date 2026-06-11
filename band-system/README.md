# themap-co Multi-Agent System

This is a Cross-Framework Multi-Agent System integrated with Band as the core coordination layer.

## Architecture

The system uses Band as an event bus to coordinate communication between multiple agents.
No direct agent-to-agent communication is allowed.

### Agents
1. **Planner Agent**: Breaks down requests and emits `TASK_CREATED` events.
2. **Geo Agent**: Listens for assignments, processes geospatial data, and emits `MAP_FEATURE_EXTRACTED`.
3. **QA Agent**: Validates features and emits `QA_RESULT`.
4. **Orchestrator**: Controls workflow logic, moving tasks from creation to assignment, and finalizes map updates based on QA results.

### Technology Partners
This system is designed to optionally integrate with AI/ML API and Featherless AI for external LLM reasoning. See the `integrations/` directory for sample clients.

## Running the Demo

Make sure you have Node.js and `ts-node` installed, then run:

```bash
npx ts-node band-system/index.ts
```
