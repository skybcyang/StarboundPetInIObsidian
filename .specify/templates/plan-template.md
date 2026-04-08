# Implementation Plan: [FEATURE NAME]

**Short Name**: [SHORT-NAME]  
**Created**: [DATE]  
**Status**: Draft  

---

## Technical Context

### Technology Stack
- **Runtime**: [e.g., Node.js 18+, Python 3.11+]
- **Framework**: [e.g., React 18, FastAPI]
- **Database**: [e.g., PostgreSQL 15, MongoDB 6]
- **Key Libraries**: [e.g., Prisma, Redis, Bull MQ]

### Existing System
- [Current architecture overview]
- [Relevant existing services/modules]
- [Integration points]

### Constraints
- **Performance**: [Latency, throughput requirements]
- **Security**: [Auth, encryption requirements]
- **Scalability**: [Expected load, growth projections]
- **Compliance**: [GDPR, SOC2, etc.]

### Unknowns (Research Needed)
- [NEEDS CLARIFICATION: specific technical question]

---

## Constitution Check

[Reference to `.specify/memory/constitution.md` principles]

### Design Principles Applied
- [ ] Principle 1: [How this design follows it]
- [ ] Principle 2: [How this design follows it]

### Gate Evaluation
| Gate | Status | Evidence |
|------|--------|----------|
| Gate 1: [Name] | ✅/❌ | [Justification if failed] |
| Gate 2: [Name] | ✅/❌ | [Justification if failed] |

---

## Architecture

### High-Level Design
```
[Diagram or description of system architecture]
```

### Component Breakdown

#### Component 1: [Name]
**Responsibility**: [What it does]
**Interface**: [How others interact with it]
**Dependencies**: [What it needs]

#### Component 2: [Name]
...

### Data Flow
```
[Step-by-step data flow through the system]
```

---

## Phase Breakdown

### Phase 0: Research & Foundation
**Goal**: [What this phase achieves]
**Deliverables**:
- [ ] research.md
- [ ] Technical decisions documented

**Duration**: [Estimated time]

---

### Phase 1: Data & Contracts
**Goal**: [What this phase achieves]
**Prerequisites**: Phase 0 complete

**Deliverables**:
- [ ] data-model.md
- [ ] contracts/ (API schemas)
- [ ] quickstart.md

**Tasks**:
| ID | Task | Owner | Est. |
|----|------|-------|------|
| T1 | [Task description] | [Who] | [Hours] |

---

### Phase 2: Core Implementation
**Goal**: [What this phase achieves]
**Prerequisites**: Phase 1 complete

**Deliverables**:
- [ ] [Deliverable 1]
- [ ] [Deliverable 2]

**Tasks**:
| ID | Task | Owner | Est. |
|----|------|-------|------|
| T2 | [Task description] | [Who] | [Hours] |

---

### Phase 3: Integration & Testing
**Goal**: [What this phase achieves]
**Prerequisites**: Phase 2 complete

**Deliverables**:
- [ ] [Deliverable 1]
- [ ] [Deliverable 2]

---

### Phase 4: Polish & Release
**Goal**: [What this phase achieves]
**Prerequisites**: Phase 3 complete

**Deliverables**:
- [ ] [Deliverable 1]
- [ ] [Deliverable 2]

---

## Risk Mitigation

| Risk | Probability | Impact | Mitigation Strategy |
|------|-------------|--------|---------------------|
| [Risk 1] | High/Med/Low | High/Med/Low | [How to address] |

---

## Rollback Plan

[How to undo changes if something goes wrong]

---

## Appendix

### A. Research Findings
[Links to research.md]

### B. API Contracts
[Links to contracts/ directory]

### C. Data Model
[Links to data-model.md]
