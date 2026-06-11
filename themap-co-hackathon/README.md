# THEMAP-CO: Band-Powered Geospatial Intelligence Platform

![Architecture](https://via.placeholder.com/800x400?text=THEMAP-CO+Architecture)

themap-co is an enterprise-grade collaborative geospatial intelligence platform built exclusively for the **Band of Agents Hackathon**. 

This system uses **Band** as its central nervous system—coordinating a fleet of 10 AI agents to analyze, extract, validate, and publish geospatial map intelligence.

## 🎯 Hackathon Tracks Addressed
- **Track 1: Internal Enterprise Workflows (Primary)** - Orchestrating internal geospatial extraction and QA loops.
- **Track 2: Multi-Agent Software Development** - Utilizes `DeveloperAgent` and `QaTestAgent` for systems improvement.
- **Track 3: Regulated & High-Stakes Workflows** - Features an `AuditComplianceAgent` and `RiskAgent` tracking all system transitions via Band.

## 🧠 Technology Partners
- **AI/ML API**: Used by the `GeoIntelligenceAgent` and `DeveloperAgent` for serverless high-speed LLM inferences.
- **Featherless AI**: Used by the `RiskAgent` and `ValidationAgent` for deep reasoning capabilities without holding state.
- **Note:** External models provide *intelligence* only. **Band manages 100% of state and workflow orchestration.**

## 🤖 10 Collaborating Agents
1. **Planner Agent** (`TASK_CREATED`)
2. **Geo Intelligence Agent** (`GEO_FEATURE_EXTRACTED`)
3. **Validation Agent** (`GEO_FEATURE_VALIDATED`, `QA_RESULT`)
4. **Orchestrator Agent** (Workflow Control, `MAP_UPDATE`)
5. **Operations Agent** (`WORKFLOW_ESCALATED`)
6. **Reporting Agent** (`REPORT_GENERATED`)
7. **Developer Agent** (Implementation plans)
8. **QA/Test Agent** (Testing verification)
9. **Risk Agent** (`RISK_ASSESSMENT`)
10. **Audit & Compliance Agent** (`AUDIT_LOGGED`)

## ⚡ Workflow Example via Band
1. **User** submits request.
2. **PlannerAgent** pushes `TASK_CREATED` to Band room.
3. **OrchestratorAgent** sees it, pushes `TASK_ASSIGNED`.
4. **GeoIntelligenceAgent** sees assignment, extracts, pushes `GEO_FEATURE_EXTRACTED`.
5. **ValidationAgent** validates, pushes `QA_RESULT`.
6. **RiskAgent** assesses, pushes `RISK_ASSESSMENT`.
7. **AuditComplianceAgent** listens to transitions and pushes `AUDIT_LOGGED`.
8. **OrchestratorAgent** reviews approvals and pushes `MAP_UPDATE`.

*No agent ever talks to another agent via API calls. Band is the exclusive coordination layer.*

## 🚀 Deployment
```bash
docker-compose up -d
npx prisma generate
npx prisma db push
npm run dev
```

Next.js frontend will be running at `http://localhost:3000`.
