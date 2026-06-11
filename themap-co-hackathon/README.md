# 🌍 THEMAP-CO: Band-Powered Geospatial Intelligence Platform

![Architecture](https://via.placeholder.com/800x400?text=THEMAP-CO+Architecture)

themap-co is an enterprise-grade collaborative geospatial intelligence platform built exclusively for the **Band of Agents Hackathon**. 

We have architected a **10-agent autonomous system** where **Band is the absolute source of truth**. Every task, validation, risk check, and map update is coordinated exclusively through the `themap-co-core` Band room. **Zero direct agent-to-agent function calls exist in this platform.**

## 🎯 Hackathon Tracks Conquered

### 🥇 Track 1: Internal Enterprise Workflows (Primary)
The platform orchestrates complex internal geospatial extraction. The `OrchestratorAgent` acts as a workflow brain, routing `TASK_CREATED` to the `GeoIntelligenceAgent` and catching `QA_RESULT` failures to trigger re-assignments automatically.

### 🥈 Track 2: Multi-Agent Software Development
We integrated a `DeveloperAgent` and `QaTestAgent`. When the Orchestrator emits a `WORKFLOW_ESCALATED` due to a code-level failure or logic loop, the `DeveloperAgent` reads the event stream and suggests code-level fixes, while the `QaTestAgent` runs regression validations on all `MAP_UPDATE` publishes.

### 🥉 Track 3: Regulated & High-Stakes Workflows
Geospatial data changes infrastructure. We built a `RiskAgent` that uses Featherless AI reasoning to assign confidence scores to map updates, gating approvals. The `AuditComplianceAgent` creates an immutable trace of every Band event, ensuring military-grade traceability.

## 🧠 Technology Partners
- **AI/ML API**: Supercharges the `GeoIntelligenceAgent` and `DeveloperAgent` for serverless, high-speed multimodal inferences.
- **Featherless AI**: Powers the `RiskAgent` and `ValidationAgent` for deep chain-of-thought reasoning without holding state.
- **Note:** External models provide *intelligence* only. **Band manages 100% of state, transitions, and workflow orchestration.**

## 🤖 10 Collaborating Agents via Band
1. **Planner Agent** (`TASK_CREATED`)
2. **Geo Intelligence Agent** (`GEO_FEATURE_EXTRACTED`)
3. **Validation Agent** (`QA_RESULT`)
4. **Orchestrator Agent** (Workflow Brain, `TASK_ASSIGNED`, `MAP_UPDATE`, `APPROVAL_GRANTED`)
5. **Operations Agent** (`OPERATIONS_ALERT`)
6. **Reporting Agent** (`REPORT_GENERATED`)
7. **Developer Agent** (`SYSTEM_NOTIFICATION`)
8. **QA/Test Agent** (`SYSTEM_NOTIFICATION`)
9. **Risk Agent** (`RISK_ASSESSMENT`)
10. **Audit & Compliance Agent** (`AUDIT_LOGGED`)

## ⚡ Real-Time Workflow Example (Band Room Trace)
1. **User** submits request.
2. `PlannerAgent` ➡ `TASK_CREATED`
3. `OrchestratorAgent` ➡ `TASK_ASSIGNED`
4. `GeoIntelligenceAgent` ➡ `GEO_FEATURE_EXTRACTED`
5. `ValidationAgent` ➡ `QA_RESULT` (Failed!)
6. `OrchestratorAgent` ➡ `WORKFLOW_ESCALATED`
7. `DeveloperAgent` ➡ `SYSTEM_NOTIFICATION` (Suggests fix)
8. *...task is re-routed...*
9. `ValidationAgent` ➡ `QA_RESULT` (Passed!)
10. `RiskAgent` ➡ `RISK_ASSESSMENT`
11. `AuditComplianceAgent` ➡ `AUDIT_LOGGED` (Records all of the above)
12. `OrchestratorAgent` ➡ `MAP_UPDATE`

## 🚀 Deployment
```bash
docker-compose up -d
npm install
npx prisma generate
npm run dev
```

Next.js frontend will be running at `http://localhost:3000`.
