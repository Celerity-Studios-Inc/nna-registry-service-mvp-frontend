**Document Version**: 1.0.3

**Last Updated**: May 3, 2025

**Previous Update**: March 20, 2025

**Status**: Published

## Executive Summary

The Naming, Numbering, and Addressing (NNA) Framework is a core infrastructure for ReViz’s AI-powered video remixing platform, inspired by ITU-T standards like E.164 and E.212 (NNA Framework Whitepaper, Section 2.3). It provides standardized, scalable asset identification, supporting 10M+ concurrent users with sub-20ms latency and 99.999% uptime. This updated plan (v1.0.3) elevates the NNA Registry Service as a foundational component, enabling early asset registration, lookup, and management for creators and developers. The implementation leverages a lean team (one senior full-stack engineer [FSE], two back-end engineers [BE1, BE2]) and AI tools (Cursor for code generation, Claude for validation) over 18 weeks (March 3 - July 4, 2025). A 2-day MVP for the Registry Service (March 3-4, 2025) ensures rapid deployment, followed by phased development of core infrastructure, advanced features, content moderation, and AlgoRhythm integration using Nest.js, PostgreSQL, Redis, and Google Cloud Storage (GCS).

## Changelog

**v1.0.3 (2025-05-03)**:

- Standardized references to **Naming, Numbering, and Addressing (NNA) Framework**, emphasizing ITU-T inspiration.
- Updated **Section 1.1** to add NNA Registry Service to the architecture diagram and description.
- Expanded **Section 2.1** to detail Registry Service’s role and scalability goals.
- Updated **Section 2.3** with a RACI matrix and AI tool prompts for a 2-day Registry Service MVP.
- Added **Milestone 0** in **Section 3.7** for a 2-day Registry Service MVP (March 3-4, 2025).
- Updated **Sections 4.1 and 4.2** to specify Registry Service’s AlgoRhythm and Clearity integrations with sequence diagrams.
- Added tasks in **Section 4.6** for Registry Service MVP deployment.
- Added **Section 6.1.1** for Registry Service implementation details.
- Updated **Section 6.1.2** to reference Registry Service for HFN/MFA resolution.
- Added Registry Service-specific risk in **Section 7.1**.
- Added **NNA Registry Service** definition in **Appendix A**.

**v1.0.2 (2025-05-05)**: Removed Vibe (V) layer, updated taxonomy to 10 MVP and 5 future layers, switched MongoDB to PostgreSQL, and standardized URLs.

**v1.0.1 (2025-03-15)**: Added third-party integration requirements, updated milestones for new layers, and expanded scope for scalability.

**v1.0.0 (2025-02-01)**: Initial draft.

# 1. Architecture Overview

## 1.1 System Components

```mermaid
graph TD
    Client[Client Applications] --> APIGateway[API Gateway]
    
    subgraph "NNA Core"
        APIGateway --> AuthService[Authentication Service]
        APIGateway --> RegistryService[NNA Registry Service]
        APIGateway --> AssetService[Asset Resolution Service]
        APIGateway --> CompositionService[Composition Service]
        APIGateway --> RightsService[Rights Management Service]
        RegistryService --> CacheService[Cache Service]
        AssetService --> CacheService
        CompositionService --> CacheService
        RightsService --> CacheService
        CacheService --> StorageService[Storage Service]
    end
    
    subgraph "AlgoRhythm Integration"
        RegistryService <--> AlgoRhythm[AlgoRhythm]
        AssetService <--> AlgoRhythm
        CompositionService <--> AlgoRhythm
    end
    
    subgraph "Clearity Integration"
        RegistryService <--> Clearity[Clearity]
        RightsService <--> Clearity
    end
    
    subgraph "Data Storage"
        StorageService --> PostgreSQL[(PostgreSQL)]
        StorageService --> Redis[(Redis)]
        StorageService --> GCS[Google Cloud Storage]
    end
    
    subgraph "Monitoring & Operations"
        MonitoringService[Monitoring Service] --> APIGateway
        MonitoringService --> AuthService
        MonitoringService --> RegistryService
        MonitoringService --> AssetService
        MonitoringService --> CompositionService
        MonitoringService --> RightsService
        MonitoringService --> CacheService
        MonitoringService --> StorageService
        MonitoringService --> AlgoRhythm
        MonitoringService --> Clearity
    end
```

**NNA Registry Service**: Manages asset registration, lookup, and management using Human-Friendly Names (HFN, e.g., G.POP.TSW.001.mp3) and Machine-Friendly Addresses (MFA, e.g., G.001.012.001.mp3). Built with Nest.js, it uses PostgreSQL for HFN/MFA mappings, Redis for caching (95%+ hit rate), and GCS for files.

**API Gateway**: Routes requests with OAuth 2.0 and JWT authentication.

**Asset Resolution Service**: Resolves assets across 10 MVP layers (G, S, L, M, W, B, P, T, R, C) and 5 future layers (E, N, A, F, X).

**Composition Service**: Creates composite assets (C layer).

**Rights Management Service**: Validates rights with Clearity.

**Cache Service**: Multi-tier caching (edge, regional, global) using Redis.

**Storage Service**: Manages asset storage in GCS and metadata in PostgreSQL.

**AlgoRhythm**: Provides AI-driven recommendations.

**Clearity**: Ensures rights compliance.

**Monitoring Service**: Tracks performance with Prometheus, Grafana, ELK, and Jaeger.

## 1.2 Key Technical Decisions

### Infrastructure

- **Cloud Provider**: Google Cloud Platform (GCP), AWS (secondary)
- **Container Orchestration**: Kubernetes
- **CI/CD**: GitHub Actions
- **Infrastructure as Code**: Terraform

### Core Technologies

- **Framework**: Nest.js (Node.js) for backend services, supporting RESTful and WebSocket APIs.
- **Language**: Python (FastAPI) for ML integration and edge processing.
- **Database**: PostgreSQL (metadata), Redis (caching).
- **Storage**: Google Cloud Storage (GCS) for assets.
- **Messaging**: RabbitMQ for asynchronous processing.
- **API Protocols**: RESTful APIs, GraphQL for flexible queries, WebSocket for real-time updates.

### Multi-tier Caching

- **Edge Cache**: In-memory Redis (300s TTL), optimized for platform-specific formats (e.g., `Social_Media_Format` for TikTok, Instagram).
- **Regional Cache**: Redis Cluster (3600s TTL), supporting regional compliance for rights and content moderation.
- **Global Cache**: Distributed Redis cluster with ARC eviction (86400s TTL, see [NNA Technical Implementation Guide, Section 3.2.3](https://grok.com/chat/78d298fd-95d3-48f2-8fa4-92ae66aeb0c0#section-3.2.3-multi-tier-cache-manager)).

### Monitoring & Observability

- **Prometheus & Grafana**: Metrics and dashboards for API performance, cache hit rates, and edge processing latency.
- **ELK Stack**: Logging for debugging asset resolution, rights verification, and moderation workflows.
- **Jaeger**: Distributed tracing for end-to-end request tracking, including edge-to-origin fallbacks.

# 2. Implementation Approach

## 2.1 Scope

The Naming, Numbering, and Addressing (NNA) Framework provides a standardized, scalable system for asset identification in ReViz’s platform, inspired by ITU-T standards (e.g., E.164, E.212) ([NNA Framework Whitepaper Ver 1.1.2](https://celerity.slab.com/posts/0jsj4gsl#he2l1-2-3-nna-framework-foundation)). The **NNA Registry Service** is a foundational component, enabling:

- **Asset Registration**: Upload and categorize assets for Songs (G), Stars (S), Looks (L), Moves (M), Worlds (W), Branded (B), Personalize (P), Training Data (T), Rights (R), and Composites (C) layers, with metadata per Taxonomy v1.3 (e.g., Movement_Speed, Font_Style).
- **Dual Addressing**: Supports HFN (e.g., G.POP.TSW.001.mp3.v1) and MFA (e.g., G.001.012.001.mp3.v1) for all layers.
- **Asset Lookup**: Resolves HFN/MFA and searches via taxonomy-based filters.
- **Asset Management**: Edits, curates, and deletes assets with role-based access control (RBAC).
- **Scalability**: Handles 10M+ users with sub-20ms latency, 95%+ cache hit rate (Redis), and 99.999% uptime (multi-region GCS).
- **Integrations**: Provides metadata to AlgoRhythm for recommendations and verifies rights via Clearity using API Specification v1.3.2 endpoints (e.g., /v1/asset/resolve/{asset_id}, /v1/rights/verify/{asset_id}).

The Registry Service is prioritized for a 2-day MVP (March 3-4, 2025) to enable early creator uploads and developer consumption, forming the backbone of the NNA ecosystem. The project excludes legacy systems and non-ReViz platforms ([NNA Framework Whitepaper Ver 1.1.2](https://celerity.slab.com/posts/0jsj4gsl#hewv8-2-introduction)).

## 2.2 Methodology

- **Agile**: Two-week sprints with weekly demos, daily standups.
- **DevOps**: CI/CD with automated testing, vulnerability scanning, and canary deployments.
- **API & SDK Parallel Development**: OpenAPI specs defined upfront, SDKs start early.
- **Iterative Development**: Core functionality first, enhanced with feedback.
- **Microservices**: Independent, scalable services.
- **Documentation-as-Code**: Auto-generated API docs from code annotations.

## 2.3 Team Roles

The NNA Framework implementation, including the NNA Registry Service, involves a lean team supported by AI tools (Cursor, Claude) to achieve a 2-day MVP rebuild. Roles and responsibilities are defined in the RACI matrix below:

| **Role** | **Responsibilities** | **AI Tool Support** | **RACI (R=Responsible, A=Accountable, C=Consulted, I=Informed)** |
| --- | --- | --- | --- |
| Full-Stack Engineer (FSE) | Develop Nest.js backend, React frontend for Registry Service, unit tests | Cursor: Generate controllers, components; Claude: Write Jest tests | R, A |
| Back-End Engineer 1 (BE1) | Deploy infrastructure (GCP, Kubernetes, Redis), optimize caching | Cursor: Generate Terraform scripts | R, I |
| Back-End Engineer 2 (BE2) | Develop integration endpoints, Moves layer enhancements (biomechanical metadata) | Claude: Generate integration code | R, I |
| Non-Technical Lead | Coordinate, test, validate requirements, UX for Registry Service | Claude: Review requirements, validate UX | C, I |

**AI Tool Prompts**:

- **Cursor**: “Generate a Nest.js controller for /v1/asset/register with TypeScript, PostgreSQL integration, and class-validator.”
- **Claude**: “Write Jest unit tests for a React component handling asset registration, ensuring Taxonomy v1.3 compliance.”
- **Validation**: ESLint (Airbnb style guide), Jest (80%+ coverage).

## 2.4 AI Strategy

- **Endpoints**: Cursor scaffolds Nest.js endpoints; Claude generates OpenAPI specs.
- **SDKs**: Claude generates TypeScript definitions; Cursor builds SDK boilerplate.
- **Docs**: Claude auto-generates API docs with examples.
- **Testing**: Claude generates test cases; Grok 3 reviews performance/security.
- **Infrastructure**: Claude assists with Terraform and Kubernetes manifests.

## 2.5 Resource Allocation & Budget

**Team Capacity**: FSE, BE1, BE2 (40 hrs/week each, 2,160 hrs total over 18 weeks).

**Task Distribution**:

- FSE: 40% Registry Service endpoints/UI, 30% testing, 20% docs, 10% edge processing.
- BE1: 50% infra/caching, 30% optimization, 20% deployment.
- BE2: 40% integrations, 30% Moves enhancements, 20% testing, 10% moderation.

**Budget Estimate (GCP Costs)**: ~$26,183.03 (4.5 months) + 10% contingency (~$2,618).

**Registry Service MVP (2 days)**: Minimal additional cost (~$50 for GCS/Redis usage).

## 2.6 Kubernetes Resource Configuration

### 2.6.1 Production Resource Requirements

- **API Pods**: 4 replicas, 1 vCPU, 2GB RAM per pod (requests), 2 vCPU, 4GB (limits).
- **Worker Pods**: 2 replicas, 2 vCPU, 4GB RAM (requests), 4 vCPU, 8GB (limits).
- **Redis**: 3 nodes (1 master, 2 replicas), 1 vCPU, 2GB RAM each.

| **Service** | **CPU Request** | **CPU Limit** | **Memory Request** | **Memory Limit** | **Replicas** |
| --- | --- | --- | --- | --- | --- |
| API Gateway | 0.5 | 1.0 | 512Mi | 1Gi | 4-10 |
| NNA Registry Service | 1.0 | 2.0 | 1Gi | 2Gi | 4-10 |
| Asset Service | 1.0 | 2.0 | 1Gi | 2Gi | 4-10 |
| Composition Service | 2.0 | 4.0 | 2Gi | 4Gi | 2-6 |
| Cache Service | 1.0 | 2.0 | 4Gi | 8Gi | 3 |
| Rights Service | 0.5 | 1.0 | 512Mi | 1Gi | 2-4 |
| WebSocket Service | 0.5 | 1.0 | 512Mi | 1Gi | 2-6 |

### 2.6.2 Autoscaling Parameters

- **HPA**: CPU utilization target 70%, min 4 pods, max 20 pods.
- **Cluster Autoscaler**: Scale nodes on 80% memory usage, 5-15 nodes.

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: registry-service-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: registry-service
  minReplicas: 4
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

# 3. Core System Components

The NNA Framework’s architecture integrates the NNA Registry Service as a core microservice, ensuring standardized naming, numbering, and addressing for assets (NNA Framework Whitepaper, Section 2.3).

```mermaid
flowchart TD
    subgraph "NNA Framework"
        APIGateway[API Gateway]
        RegistryService[NNA Registry Service]
        AssetService[Asset Service]
        CompositionService[Composition Service]
        AlgoRhythm[AlgoRhythm]
        Clearity[Clearity]
    end
    subgraph "External"
        GCP[Google Cloud Storage]
        PostgreSQL[(PostgreSQL)]
        Redis[(Redis)]
    end
    APIGateway --> RegistryService
    RegistryService --> AssetService
    RegistryService --> CompositionService
    RegistryService --> AlgoRhythm
    RegistryService --> Clearity
    RegistryService --> GCP
    RegistryService --> PostgreSQL
    RegistryService --> Redis
```

**NNA Registry Service**: Manages asset registration, lookup, and management using HFN (e.g., G.POP.TSW.001.mp3) and MFA (e.g., G.001.012.001.mp3). Built with Nest.js, it uses PostgreSQL for mappings, Redis for caching, and Google Cloud Storage for files.

**API Gateway**: Routes requests with OAuth 2.0 and JWT authentication.

**Asset Service**: Processes assets (e.g., transcoding).

**Composition Service**: Creates composite assets (C layer).

**AlgoRhythm**: Consumes metadata for recommendations.

**Clearity**: Verifies rights for assets.

## 3.1 API Layer (RESTful & WebSocket)

- **Purpose**: Expose endpoints for asset registration, resolution, composition, and real-time updates.
- **Tech**: Nest.js, Node.js (Express), WebSocket (ws library).
- **Structure**: Modular microservices (Registry Service, Asset Service, Rights Service).

## 3.2 Authentication & Security Layer

- **Purpose**: Handle API Key, JWT, and OAuth 2.0 authentication.
- **Tech**: OAuth 2.0 (Keycloak), JWT, HMAC-SHA256.
- **Structure**: Centralized auth service with middleware.

## 3.3 Data Layer

- **Purpose:** Store assets, metadata, and relationships.
- **Tech:** PostgreSQL, Redis, Google Cloud Storage (GCS).
- **Structure:** Multi-tier caching with GCS for durable storage.

## 3.4 Processing Layer

- **Purpose**: Handle asset composition, preview generation, ML integration, edge processing.
- **Tech**: Python (FastAPI), RabbitMQ/Celery for asynchronous tasks.
- **Structure**: Asynchronous workers for heavy processing.

## 3.5 Infrastructure Layer

- **Purpose**: Ensure scalability, resilience, and observability.
- **Tech**: Kubernetes (container orchestration), Prometheus (monitoring), Grafana (dashboards), ELK stack (logging), Jaeger.
- **Structure**: Cloud-agnostic deployment (e.g., AWS, GCP) with auto-scaling.

## 3.6 Implementation Approach

- **Modular Design**: Independent microservices.
- **CI/CD Pipeline**: GitHub Actions for testing and deployment.
- **AI Assistance**: Cursor for coding, Claude for validation, Grok 3 for reviews.
- **Security First**: Authentication, rate limiting, error handling.
- **Observability**: Monitoring and logging at every layer.

## 3.7 Implementation Milestones

### Milestone 0: NNA Registry Service MVP (March 3-4, 2025)

- **Task 0.1**: Deploy Registry Service with /v1/asset/register, /v1/asset/resolve/{asset_id}, /v1/asset/search endpoints for G, S, L, M, W, B, P, T, R, C layers.
- **Task 0.2**: Configure PostgreSQL for HFN/MFA mappings, Redis for caching, GCS for files.
- **Task 0.3**: Implement basic React frontend for asset registration, browsing, and curation.
- **Task 0.4**: Write Jest unit tests (80%+ coverage) and deploy to GCP.

### Milestone 1: Infrastructure Setup (Q1 2025)

- **Task 1.1**: Deploy PostgreSQL cluster for metadata storage.
- **Task 1.2**: Configure GCS buckets under /reviz-assets/.
- **Task 1.3**: Set up API endpoints at https://api.reviz.dev/v1.

### Milestone 2: Asset Management Implementation (Q2 2025)

- **Task 2.1**: Implement /v1/asset/batch/resolve and enhance /v1/asset/search.
- **Task 2.2**: Develop Moves tutorial video retrieval (/v1/asset/moves/tutorial/{asset_id}).

### Milestone 3: Composition and Compatibility (Q3 2025)

- **Task 3.1**: Deploy /v1/composition/create for all layers.
- **Task 3.2**: Implement graph-based compatibility resolution using Neo4j.
- **Task 3.3**: Configure WebSocket (wss://api.reviz.dev/v1/collaborate).

### Milestone 4: Integrations and Webhooks (Q4 2025)

- **Task 4.1**: Integrate AlgoRhythm (/v1/recommendations).
- **Task 4.2**: Integrate Clearity (/v1/rights/verify/{asset_id}).
- **Task 4.3**: Implement webhooks (/v1/webhooks/create).

### Milestone 5: Testing and Deployment (Q1 2026)

- **Task 5.1**: Execute integration tests using https://api.reviz.dev/explorer.
- **Task 5.2**: Conduct load testing for 10M+ users.
- **Task 5.3**: Deploy production environment.

## 3.8 SDK Development Strategy

- **TypeScript Foundation**: Type-safe SDKs.
- **Parallel Development**: SDKs start alongside Registry Service MVP.
- **Auto-Generated Types**: From OpenAPI specs.
- **Progressive Enhancement**: Core functionality first.
- **Multi-Platform**: JavaScript/TypeScript (v1.0.0 by Week 6), Python (v1.0.0 by Week 16).

# 4. Project Phases & Milestones

## 4.1 AlgoRhythm Integration

The NNA Registry Service integrates with AlgoRhythm to provide metadata for rights-aware recommendations, using the `/v1/asset/resolve/{asset_id}` endpoint (API Specification v1.3.2).

```mermaid
sequenceDiagram
    participant User
    participant APIGateway
    participant RegistryService
    participant AlgoRhythm
    User->>APIGateway: POST /v1/asset/resolve/G.POP.TSW.001
    APIGateway->>RegistryService: Resolve HFN
    RegistryService->>PostgreSQL: Query MFA
    PostgreSQL-->>RegistryService: G.001.012.001
    RegistryService->>AlgoRhythm: POST /recommendations
    note right of RegistryService: Payload: { asset_id: "G.POP.TSW.001", metadata: { tags: ["pop"], popularity_score: 85 } }
    AlgoRhythm-->>RegistryService: Recommendations
    RegistryService-->>APIGateway: Asset + Recommendations
    APIGateway-->>User: Response
```

- **Payload Example:**

```json
{
  "asset_id": "G.POP.TSW.001",
  "metadata": {
    "tags": ["pop", "taylor swift"],
    "popularity_score": 85,
    "engagement_rate": 0.75
  }
}
```

## 4.2 Clearity Integration

The Registry Service verifies rights via  `/v1/rights/verify/{asset_id}` .

```mermaid
sequenceDiagram
    participant User
    participant APIGateway
    participant RegistryService
    participant Clearity
    User->>APIGateway: POST /v1/asset/resolve/G.POP.TSW.001
    APIGateway->>RegistryService: Resolve HFN
    RegistryService->>Clearity: POST /rights/verify
    note right of RegistryService: Payload: { asset_id: "G.POP.TSW.001", usage_context: { platform: "TikTok", territories: ["US"] } }
    Clearity-->>RegistryService: Rights Status
    RegistryService->>PostgreSQL: Query MFA
    PostgreSQL-->>RegistryService: G.001.012.001
    RegistryService-->>APIGateway: Asset + Rights
    APIGateway-->>User: Response
```

- **Payload Example:**

```json
{
  "asset_id": "G.POP.TSW.001",
  "usage_context": {
    "publication_platform": "TikTok",
    "territories": ["US"],
    "usage_type": "non_commercial"
  }
}
```

## 4.3 Webhook Integration

- **Endpoint**: `POST /v1/webhooks/create`
- **Events**: `branded.added, personalize.uploaded, text.added, moves.tutorial.updated`.

## 4.4 Asset Storage

- **Location**: GCS at `/reviz-assets/ `(e.g., `/reviz-assets/G/POP/TSW`).
- **Access**: Via `https://cdn.reviz.dev` with caching headers.

## 4.5 Testing

- **Task**: Use `https://api.reviz.dev/explorer `to test endpoints and webhooks ( [API Specification, Section 11.4 - Testing and Validation](https://celerity.slab.com/posts/nna-framework-api-specification-ver-1-3-2-1fupkzwa#h7b3l-11-4-testing-and-validation)).

## 4.6 Phase 1: Foundation & Endpoints (Weeks 1-3)

- **Objective**: Deploy Registry Service MVP and core endpoints.
- **Deliverables**:
    - Registry Service MVP: /v1/asset/register, /v1/asset/resolve/{asset_id}, /v1/asset/search, basic React UI.
    - Kubernetes cluster, CI/CD, monitoring.
    - Authentication service.
- **Milestones**:
    - March 3-4, 2025: Registry Service MVP live.
    - Week 2: Infra and endpoints operational.
    - Week 3: Auth and endpoint tests ready.

## 4.7 Phase 2: Caching & SDK Wrapping (Weeks 4-6)

- **Deliverables**: Multi-tier caching, Asset Service, JavaScript/TypeScript SDK v0.1, AlgoRhythm mock.

## 4.8 Phase 3: Composition & Rights (Weeks 7-10)

- **Deliverables**: Composition Service, Rights Service, WebSocket, Moves enhancements.

## 4.9 Phase 4: AlgoRhythm & Optimization (Weeks 11-14)

- **Deliverables**: AlgoRhythm integration, Clearity integration, performance optimizations, Python SDK v0.1.

## 4.10 Phase 5: Testing & Deployment (Weeks 15-18)

- **Deliverables**: Test suites, production deployment, complete SDKs and docs.

## 4.11 Progress Tracking & Reporting

- **Weekly Deliverables**: Demos, code reviews, test coverage updates.
- **KPIs**: API response <50ms, cache hit rate >80%, uptime 99.999%.
- **Reporting**: Weekly status to PM (Ajay Madhok).

# 5. Development Phases,  Timelines & Tasks

The NNA Registry Service is prioritized for a 2-day MVP rebuild, focusing on core functionality (HFN/MFA registration, upload, browsing, editing, curation) to enable creators and developers.

| **Phase** | **Duration** | **Tasks** | **Deliverables** | **AI Tool Support** |
| --- | --- | --- | --- | --- |
| Setup (Day 1) | 4 hours | Configure Nest.js, React, PostgreSQL, Redis | Project structure, auth endpoints | Cursor: Generate setup scripts |
| Core (Day 1) | 8 hours | Implement registration, upload, browsing | `/v1/asset/*` endpoints, basic UI | Cursor: Controllers, components; Claude: Unit tests |
| Management (Day 2) | 8 hours | Add editing, curation, RBAC | Update/delete endpoints, admin UI | Cursor: Admin endpoints; Claude: RBAC validation |
| Testing (Day 2) | 4 hours | Write Jest tests, deploy to Google Cloud | Test coverage (80%+), deployed MVP | Claude: Write Jest tests |

## 5.1 Weeks 1-2 (March 3-16): Foundation & Endpoints

| **Task** | **Owner** | **Duration** | **Dependencies** | **AI Acceleration** |
| --- | --- | --- | --- | --- |
| Deploy Kubernetes cluster (gcloud container clusters create nna-cluster) | BE1 | 3d | None | Claude: Terraform scripts |
| Scaffold basic endpoints (GET /v1/asset/resolve/:id) | FSE | 3d | Infra setup | Cursor: Nest.js endpoints |
| Set up API Gateway with Nest.js | FSE | 2d | Infra setup | Cursor: Scaffold APIs |
| Initialize Auth Service (Keycloak setup) | BE2 | 3d | None | Claude: Auth flows |

## 5.2 Weeks 3-4: Authentication & Storage Setup

| **Task** | **Owner** | **Duration** | **Dependencies** | **AI Acceleration** |
| --- | --- | --- | --- | --- |
| Auth middleware | BE2 | 2d | Auth Service | Claude: Middleware code |
| GCS Integration | BE1 | 3d | Infra setup | Claude: Storage code |
| Asset DB schema | BE2 | 2d | GCS Integration | Cursor: Schema generation |
| Endpoint tests | FSE | 2d | Basic endpoints | Claude: Test cases |
| Monitoring setup | BE1 | 3d | Infra setup | Claude: Prometheus config |

## 5.3 Weeks 5-6: Caching & SDK Wrapping

| **Task** | **Owner** | **Duration** | **Dependencies** | **AI Acceleration** |
| --- | --- | --- | --- | --- |
| Asset Service | BE2 | 3d | Basic endpoints | Cursor: Nest.js service |
| Edge/Regional Cache | BE1 | 3d | Asset Service | Cursor: Redis setup |
| SDK v0.1 (JS/TS) | FSE | 3d | Basic endpoints | Claude: SDK boilerplate |
| Cache tests | BE1 | 2d | Edge/Regional Cache | Claude: Test cases |
| AlgoRhythm mock | BE2 | 2d | Asset Service | Claude: Mock code |

## 5.4 Weeks 7-8: Composition

| **Task** | **Owner** | **Duration** | **Dependencies** | **AI Acceleration** |
| --- | --- | --- | --- | --- |
| Composition Endpoints | BE2 | 3d | Asset Service | Cursor: Nest.js service |
| WebSocket Setup | FSE | 2d | Composition Endpoints | Claude: Event system |
| RabbitMQ Integration | BE1 | 3d | Composition Endpoints | Claude: Queue setup |
| Moderation Pre-checks | BE2 | 2d | Composition Endpoints | Claude: Moderation code |
| Composition tests | FSE | 2d | Composition Endpoints | Claude: Test cases |

## 5.5 Weeks 9-10: Rights Management

| **Task** | **Owner** | **Duration** | **Dependencies** | **AI Acceleration** |
| --- | --- | --- | --- | --- |
| Rights Endpoints | BE2 | 3d | Asset Service | Cursor: Nest.js service |
| Rights DB schema | BE1 | 2d | Rights Endpoints | Claude: Schema generation |
| WebSocket Events | FSE | 2d | WebSocket Setup | Claude: Event code |
| Rights tests | BE2 | 2d | Rights Endpoints | Claude: Test cases |
| Global Cache | BE1 | 3d | Edge/Regional Cache | Cursor: Redis config |
| Moves Biomechanical Metadata Validation | BE2 | 2d | Asset Service | Claude: Validation code |

## 5.6 Weeks 11-12: AlgoRhythm Integration

| **Task** | **Owner** | **Duration** | **Dependencies** | **AI Acceleration** |
| --- | --- | --- | --- | --- |
| Interface Definition | BE2 | 2d | Composition Endpts | Claude: Specs |
| AlgoRhythm Integration | BE2 | 3d | Interface Def | Claude: Integration code |
| SDK Enhancements | FSE | 2d | SDK v0.1 | Cursor: Feature adds |
| Cache Optimization | BE1 | 3d | Global Cache | Cursor: Optimization code |
| Integration tests | FSE | 2d | AlgoRhythm Int | Claude: Test cases |
| Moves Tutorial Video Integration | BE2 | 2d | Asset Service | Claude: Video processing code |

## 5.7 Weeks 13-14: Optimization & Moderation

| **Task** | **Owner** | **Duration** | **Dependencies** | **AI Acceleration** |
| --- | --- | --- | --- | --- |
| Performance profiling | BE1 | 2d | All services | Claude: Profiling scripts |
| Asset optimization | BE2 | 3d | Performance prof | Cursor: Optimization code |
| Clearity Integration | BE2 | 3d | Rights Endpoints | Claude: Integration code |
| Moderation Workflow | FSE | 2d | Clearity Int | Claude: Workflow code |
| Load testing | BE1 | 3d | All services | Claude: Load test suite |
| Edge Processing for AR/Filters/Text | BE1 | 2d | Asset Service | Claude: Edge processing code |

## 5.8 Weeks 15-16: SDK Expansion & Testing

| **Task** | **Owner** | **Duration** | **Dependencies** | **AI Acceleration** |
| --- | --- | --- | --- | --- |
| Python SDK v0.1 | FSE | 3d | SDK Enhancements | Claude: SDK boilerplate |
| Full integration tests | BE2 | 3d | All services | Claude: Test cases |
| Composition tuning | BE2 | 2d | Composition Endpts | Cursor: Tuning code |
| SDK docs | FSE | 2d | Python SDK | Claude: Docs generation |
| Performance benchmarks | BE1 | 2d | Load testing | Claude: Benchmark suite |

## 5.9 Weeks 17-18: Finalization & Deployment

| **Task** | **Owner** | **Duration** | **Dependencies** | **AI Acceleration** |
| --- | --- | --- | --- | --- |
| Final integration tests | FSE | 3d | All services | Claude: Test cases |
| Production Deploy | BE1 | 2d | Integration Tests | Claude: Deploy docs |
| Final SDK release | FSE | 2d | Python SDK | Cursor: SDK polish |
| Final docs | BE2 | 2d | All services | Claude: Docs completion |

_Note_: If deployment fails, rollback to last stable version using kubectl rollout undo and re-run integration tests.

## 5.10 Dependency Graph

```mermaid
graph TD
    A[Infra setup] --> B[Basic endpoints]
    A --> C[API Gateway]
    D[Auth Service] --> E[Auth middleware]
    A --> F[GCS Integration] --> G[Asset DB schema]
    B --> H[Endpoint tests]
    B --> I[Asset Service] --> J[Edge/Regional Cache]
    B --> K[SDK v0.1]
    J --> L[Cache tests]
    I --> M[AlgoRhythm mock]
    I --> N[Composition Endpoints] --> O[WebSocket Setup]
    N --> P[RabbitMQ Integration]
    N --> Q[Moderation Pre-checks]
    N --> R[Composition tests]
    I --> S[Rights Endpoints] --> T[Rights DB schema]
    O --> U[WebSocket Events]
    S --> V[Rights tests]
    J --> W[Global Cache]
    I --> X[Moves Biomechanical Metadata Validation]
    S --> Y[Interface Definition] --> Z[AlgoRhythm Integration]
    K --> AA[SDK Enhancements]
    W --> AB[Cache Optimization]
    Z --> AC[Integration tests]
    X --> AD[Moves Tutorial Video Integration]
    AC --> AE[Performance profiling] --> AF[Asset optimization]
    S --> AG[Clearity Integration] --> AH[Moderation Workflow]
    AE --> AI[Load testing]
    AF --> AJ[Edge Processing for AR/Filters/Text]
    AH --> AK[Python SDK v0.1] --> AL[Full integration tests]
    AF --> AM[Composition tuning]
    AK --> AN[SDK docs]
    AI --> AO[Performance benchmarks]
    AL --> AP[Production Deploy]
    AK --> AQ[Final SDK release]
    AP --> AR[Final docs]
```

## 5.11 Dependency Table

| **Task** | **Phase** | **Week** | **Effort (pd)** | **Depends On** | **Critical Path** | **Risk Impact** |
| --- | --- | --- | --- | --- | --- | --- |
| Infra setup (GCP/K8s) | 1 | 1-2 | 3pd | None | Yes | Scalability |
| Basic endpoints | 1 | 1-2 | 3pd | Infra setup | Yes | Performance |
| Auth Service | 1 | 1-2 | 3pd | None | Yes | Security |
| GCS Integration | 1 | 3-4 | 3pd | Infra setup | Yes | Scalability |
| Asset Service | 2 | 5-6 | 3pd | Basic endpoints | Yes | Performance |
| Edge/Regional Cache | 2 | 5-6 | 3pd | Asset Service | Yes | Cache Consistency |
| SDK v0.1 (JS/TS) | 2 | 5-6 | 3pd | Basic endpoints | No | Developer Experience |
| Composition Endpoints | 3 | 7-8 | 3pd | Asset Service | Yes | Performance |
| Rights Endpoints | 3 | 9-10 | 3pd | Asset Service | Yes | Security |
| Moves Bio-mechanical Metadata Validation | 3 | 9-10 | 2pd | Asset Service | Yes | Data Integrity |
| AlgoRhythm Integration | 4 | 11-12 | 3pd | Composition Endpoints | Yes | Integration |
| Moves Tutorial Video Integration | 4 | 11-12 | 2pd | Asset Service | Yes | User Experience |
| Clearity Integration | 4 | 13-14 | 3pd | Rights Endpoints | Yes | Security |
| Edge Processing for AR/Filters/Text | 4 | 13-14 | 2pd | Asset Service | Yes | Performance |
| Python SDK v0.1 | 5 | 15-16 | 3pd | SDK Enhancements | No | Developer Experience |
| Production Deploy | 5 | 17-18 | 2pd | Full integration tests | Yes | Scalability |

# 6. Implementation Details

## 6.1 Core Service Implementation

### 6.1.1 NNA Registry Service

The NNA Registry Service manages asset registration, lookup, and management, supporting 10 MVP layers (G, S, L, M, W, B, P, T, R, C) and 5 future layers (E, N, A, F, X).

- **Endpoints**:
    - `POST /v1/asset/register:` Registers assets with HFN/MFA.
    - `GET /v1/asset/resolve`/{asset_id}: Resolves HFN/MFA.
    - `GET /v1/asset/search`: Searches by taxonomy/metadata.
    - `PUT/DELETE /v1/asset/{id}`: Updates/deletes assets.
- **Tech**: Nest.js, PostgreSQL (HFN/MFA mappings), Redis (95%+ cache hit rate), GCS (files).
- **Performance**: Sub-20ms latency, 10M+ users.
- **Example**:

```typescript
@Post('register')
async registerAsset(@Body() body: RegisterAssetDto) {
  const { layer, categoryCode, subcategoryCode, type, metadata, file } = body;
  await this.taxonomyService.validate(layer, categoryCode, subcategoryCode);
  const counter = await this.sequentialCounterModel.findOneAndUpdate(
    { layer, categoryCode, subcategoryCode },
    { $inc: { next_sequential: 1 } },
    { upsert: true, new: true }
  );
  const category = await this.categoryMappingModel.findOne({ layer, categoryCode });
  const subcategory = await this.subcategoryMappingModel.findOne({ layer, categoryCode, subcategoryCode });
  const sequential = counter.next_sequential.toString().padStart(3, '0');
  const friendlyName = `${layer}.${categoryCode}.${subcategoryCode}.${sequential}.${type}`;
  const nnaAddress = `${layer}.${category.category_num}.${subcategory.subcategory_num}.${sequential}.${type}`;
  const gcpUrl = await this.gcpService.upload(file, friendlyName);
  return this.registryEntryModel.create({
    friendly_name: friendlyName,
    nna_address: nnaAddress,
    layer,
    category_code: categoryCode,
    category_num: category.category_num,
    subcategory_code: subcategoryCode,
    subcategory_num: subcategory.subcategory_num,
    sequential: counter.next_sequential,
    type,
    metadata,
    gcp_storage_url: gcpUrl
  });
}
```

### 6.1.2 Asset Resolution Service

Resolves assets using the Registry Service for HFN/MFA lookup.

- **Endpoint**: `POST /v1/asset/resolve`.
- **Dependencies**: Registry Service, Cache Manager, Rights Management.

```typescript
// src/asset/asset.service.ts
import { Injectable } from '@nestjs/common';
import { CacheService } from '../cache/cache.service';
import { StorageService } from '../storage/storage.service';
import { RightsService } from '../rights/rights.service';
import { NNAError } from '../common/errors/nna-error';

@Injectable()
export class AssetService {
  constructor(
    private readonly cache: CacheService,
    private readonly storage: StorageService,
    private readonly rights: RightsService,
  ) {}

  async resolveAsset(assetId: string): Promise<any> {
    try {
      const cached = await this.cache.get(assetId);
      if (cached) return cached;

      const asset = await this.storage.getAsset(assetId);
      if (!asset) throw new NNAError('NNA_RESOURCE_NOT_FOUND', `Asset ${assetId} not found`);

      await this.rights.verify(assetId);
      await this.cache.set(assetId, asset, 300); // 5 min TTL
      return asset;
    } catch (error) {
      NNAError.handle(error);
    }
  }
}
```

### 6.1.3 Cache Manager Implementation

The Cache Manager implements a three-tier caching system (Edge, Regional, Global) to achieve sub-20ms asset resolution and 95%+ cache hit rates.

**Key Features**:

- Supports caching for 10 MVP layers (Songs [G], Stars [S], Looks [L], Moves [M], Worlds [W], Branded [B], Personalize [P], Training_Data [T], Rights [R], Composites [C]) and 5 future layers (Audio Effects [E], Transitions [N], Augmented Reality [A], Filters [F], Text [X]).
- Uses Cache_Priority metadata field to prioritize caching (e.g., "High" for trending assets like M.017.002.001).
- Optimizes for Social_Media_Format to pre-cache assets in platform-specific formats (e.g., TikTok 9:16 aspect ratio).
- Implements intelligent invalidation based on Version and Deprecated fields to ensure cache consistency.

**Cache Tiers**:

- **Edge Cache (L1)**: 5-minute TTL, LRU eviction, local to request.
- **Regional Cache (L2)**: 1-hour TTL, LFU eviction, geographic distribution.
- **Global Cache (L3)**: 24-hour TTL, ARC eviction, central coordination.

**Implementation Details**:

- **Cache Key Format**: [Layer].[CategoryCode].[SubCategoryCode].[Sequential].[Type].[Version] (e.g., M.017.002.001.mp4.v1).
- **Cache Update Logic**:
    - On asset update, propagate changes from Global to Regional to Edge.
    - Use Cache_Priority to determine retention (e.g., "High" assets retained longer).
- **Performance Metrics**:
    - Cache Hit Rate: 95%+ (target)
    - Cache Miss Latency: <50ms (P95)
    - Cache Update Latency: <10ms (P95)

**Dependencies**:

- Asset Resolution Service (Section 6.1.1) for cache lookups.
- Rights Management (Section 6.4) for cache invalidation based on rights changes.

```typescript
// src/cache/cache.service.ts
import { Injectable, Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { NNAError } from '../common/errors/nna-error';

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async get(key: string): Promise<any> {
    try {
      return await this.cacheManager.get(key);
    } catch (error) {
      throw new NNAError('NNA_CACHE_ERROR', `Failed to get cache key ${key}`, error);
    }
  }

  async set(key: string, value: any, ttl: number): Promise<void> {
    try {
      await this.cacheManager.set(key, value, { ttl }); // TTL in seconds
    } catch (error) {
      throw new NNAError('NNA_CACHE_ERROR', `Failed to set cache key ${key}`, error);
    }
  }

  async invalidate(key: string): Promise<void> {
    try {
      await this.cacheManager.del(key);
    } catch (error) {
      throw new NNAError('NNA_CACHE_ERROR', `Failed to invalidate cache key ${key}`, error);
    }
  }

  async getAsset(assetId: string): Promise<any> {
    const edgeKey = `edge:${assetId}`;
    let asset = await this.get(edgeKey);
    if (asset) return asset;

    const regionalKey = `regional:${assetId}`;
    asset = await this.get(regionalKey);
    if (asset) {
      await this.set(edgeKey, asset, 300); // 5 min TTL
      return asset;
    }

    const globalKey = `global:${assetId}`;
    asset = await this.get(globalKey);
    if (asset) {
      await this.set(regionalKey, asset, 3600); // 1 hr TTL
      await this.set(edgeKey, asset, 300);      // 5 min TTL
      return asset;
    }

    return null; // Cache miss
  }
}
```

### 6.1.4 Multi-tier Cache Implementation

Implements edge, regional, and global caching for Registry Service.

```typescript
// src/cache/multi-tier-cache.service.ts
import { Injectable, Inject } from '@nestjs/common';
import { Redis } from 'ioredis';
import { NNAError } from '../common/errors/nna-error';

@Injectable()
export class MultiTierCacheService {
  constructor(
    @Inject('EDGE_CACHE') private edgeCache: Redis,
    @Inject('REGIONAL_CACHE') private regionalCache: Redis,
    @Inject('GLOBAL_CACHE') private globalCache: Redis,
  ) {}

  async get(key: string): Promise<any> {
    try {
      // Try edge cache (fastest, closest to request)
      const edgeResult = await this.edgeCache.get(key);
      if (edgeResult) {
        return JSON.parse(edgeResult);
      }

      // Try regional cache
      const regionalResult = await this.regionalCache.get(key);
      if (regionalResult) {
        // Propagate to edge cache
        await this.edgeCache.set(key, regionalResult, 'EX', 300); // 5 min TTL
        return JSON.parse(regionalResult);
      }

      // Try global cache
      const globalResult = await this.globalCache.get(key);
      if (globalResult) {
        // Propagate up the tiers
        await this.regionalCache.set(key, globalResult, 'EX', 3600); // 1 hour TTL
        await this.edgeCache.set(key, globalResult, 'EX', 300); // 5 min TTL
        return JSON.parse(globalResult);
      }

      return null; // Cache miss
    } catch (error) {
      throw new NNAError('NNA_CACHE_ERROR', `Multi-tier cache get failure: ${key}`, error);
    }
  }

  async set(key: string, value: any): Promise<void> {
    const stringValue = JSON.stringify(value);
    try {
      // Set in all cache tiers with appropriate TTLs
      await Promise.all([
        this.edgeCache.set(key, stringValue, 'EX', 300), // 5 min TTL
        this.regionalCache.set(key, stringValue, 'EX', 3600), // 1 hour TTL
        this.globalCache.set(key, stringValue, 'EX', 86400), // 24 hour TTL
      ]);
    } catch (error) {
      throw new NNAError('NNA_CACHE_ERROR', `Multi-tier cache set failure: ${key}`, error);
    }
  }

  async invalidate(key: string, pattern: boolean = false): Promise<void> {
    try {
      if (pattern) {
        // Pattern-based invalidation (more expensive)
        await Promise.all([
          this.edgeCache.eval('return redis.call("KEYS", ARGV[1])', 0, key).then(keys => {
            if (keys.length > 0) return this.edgeCache.del(...keys);
            return 0;
          }),
          this.regionalCache.eval('return redis.call("KEYS", ARGV[1])', 0, key).then(keys => {
            if (keys.length > 0) return this.regionalCache.del(...keys);
            return 0;
          }),
          this.globalCache.eval('return redis.call("KEYS", ARGV[1])', 0, key).then(keys => {
            if (keys.length > 0) return this.globalCache.del(...keys);
            return 0;
          })
        ]);
      } else {
        // Direct key invalidation
        await Promise.all([
          this.edgeCache.del(key),
          this.regionalCache.del(key),
          this.globalCache.del(key)
        ]);
      }
    } catch (error) {
      throw new NNAError('NNA_CACHE_ERROR', `Multi-tier cache invalidation failure: ${key}`, error);
    }
  }
}
```

## 6.2 API Implementation

### 6.2.1 Asset Resolution API

```typescript
// src/asset/asset.controller.ts
import { Controller, Get, Param } from '@nestjs/common';
import { AssetService } from './asset.service';
import { NNAError } from '../common/errors/nna-error';

@Controller('v1/asset')
export class AssetController {
  constructor(private readonly assetService: AssetService) {}

  @Get('resolve/:assetId')
  async resolveAsset(@Param('assetId') assetId: string) {
    try {
      const asset = await this.assetService.resolveAsset(assetId);
      return {
        success: true,
        data: asset,
        metadata: {
          timestamp: new Date().toISOString(),
          request_id: `req_${Math.random().toString(36).substr(2, 9)}`,
        },
      };
    } catch (error) {
      NNAError.handle(error);
    }
  }
}
```

## 6.3 SDK Implementation

### 6.3.1 TypeScript SDK Core

```typescript
// Core SDK implementation
import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';

export interface NNAClientOptions {
  baseURL: string;
  apiKey: string;
  timeout?: number;
  cache?: { enabled: boolean; ttl: number };
}

export class NNAClient {
  private client: AxiosInstance;
  private cache: Map<string, { data: any; expiry: number }> | null = null;
  private options: NNAClientOptions;

  constructor(options: NNAClientOptions) {
    this.options = options;
    const config: AxiosRequestConfig = {
      baseURL: options.baseURL,
      timeout: options.timeout || 10000,
      headers: {
        'X-API-Key': options.apiKey,
        'Content-Type': 'application/json',
      },
    };

    this.client = axios.create(config);
    if (options.cache?.enabled) this.cache = new Map();
  }

  async resolveAsset(assetId: string): Promise<any> {
    try {
      if (this.cache) {
        const cacheKey = `asset:${assetId}`;
        const cached = this.cache.get(cacheKey);
        if (cached && cached.expiry > Date.now()) return cached.data;
      }

      const response = await this.client.get(`/v1/asset/resolve/${assetId}`);
      const data = response.data;

      if (this.cache) {
        const cacheKey = `asset:${assetId}`;
        this.cache.set(cacheKey, {
          data,
          expiry: Date.now() + (this.options.cache?.ttl || 300) * 1000,
        });
      }
      return data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new Error(
        `Failed to resolve asset ${assetId}: ${axiosError.response?.data?.error || axiosError.message}`
      );
    }
  }

  async batchResolveAssets(assetIds: string[]): Promise<any> {
    try {
      const response = await this.client.post('/v1/asset/batch/resolve', { asset_ids: assetIds });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new Error(
        `Failed to batch resolve assets: ${axiosError.response?.data?.error || axiosError.message}`
      );
    }
  }
}
```

## 6.4 Moderation Service

### 6.4.1 Moderation Service Implementation

```typescript
// src/moderation/moderation.service.ts
import { Injectable } from '@nestjs/common';
import { AssetService } from '../asset/asset.service';
import { RightsService } from '../rights/rights.service';
import { NNAError } from '../common/errors/nna-error';

interface ModerationResult {
  approved: boolean;
  confidenceScore: number;
  flags: Array<{ type: string; severity: string; details: string }>;
  recommendedAction: 'approve' | 'review' | 'reject';
}

@Injectable()
export class ModerationService {
  constructor(
    private readonly assetService: AssetService,
    private readonly rightsService: RightsService,
  ) {}

  async moderateAsset(assetId: string): Promise<ModerationResult> {
    try {
      const asset = await this.assetService.resolveAsset(assetId);

      const [identityCheck, rightsCheck, contentCheck, biomechanicalCheck] = await Promise.all([
        this.checkIdentity(asset),
        this.rightsService.verifyUsageRights(assetId, { context: 'publication' }),
        this.scanContent(asset),
        this.checkBiomechanicalMetadata(asset),
      ]);

      const flags = [
        ...(identityCheck.flags || []),
        ...(rightsCheck.permitted ? [] : [{ type: 'rights', severity: 'high', details: rightsCheck.reason }]),
        ...(contentCheck.flags || []),
        ...(biomechanicalCheck.flags || []),
      ];

      const approved = flags.length === 0 || !flags.some(flag => flag.severity === 'high');
      const recommendedAction = flags.some(flag => flag.severity === 'high')
        ? 'reject'
        : flags.some(flag => flag.severity === 'medium')
        ? 'review'
        : 'approve';

      return {
        approved,
        confidenceScore: Math.min(
          identityCheck.confidenceScore,
          rightsCheck.permitted ? 1 : 0,
          contentCheck.confidenceScore,
          biomechanicalCheck.confidenceScore,
        ),
        flags,
        recommendedAction,
      };
    } catch (error) {
      NNAError.handle(error);
    }
  }

  private async checkIdentity(asset: any): Promise<any> { /* Mock implementation */ }
  private async scanContent(asset: any): Promise<any> {
    // Check for inappropriate content in AR, filters, text
    const flags = [];
    if (asset.layer === 'A' && asset.metadata?.content?.includes('inappropriate')) {
      flags.push({ type: 'inappropriate', severity: 'high', details: 'Inappropriate AR content detected' });
    }
    if (asset.layer === 'X' && asset.metadata?.text?.toLowerCase().includes('prohibited')) {
      flags.push({ type: 'inappropriate', severity: 'high', details: 'Prohibited text content detected' });
    }
    return { confidenceScore: 0.95, flags };
  }
  private async checkBiomechanicalMetadata(asset: any): Promise<any> {
    // Validate Moves layer biomechanical metadata
    const flags = [];
    if (asset.layer === 'M') {
      if (!asset.metadata?.Movement_Speed || !['Slow', 'Medium', 'Fast'].includes(asset.metadata.Movement_Speed)) {
        flags.push({ type: 'biomechanical_invalid', severity: 'medium', details: 'Invalid or missing Movement_Speed' });
      }
      if (!asset.metadata?.Tutorial_Link || !asset.metadata.Tutorial_Available) {
        flags.push({ type: 'biomechanical_invalid', severity: 'low', details: 'Missing tutorial link for Moves asset' });
      }
    }
    return { confidenceScore: 0.98, flags };
  }
}
```

### 6.4.2 Moderation Workflow Integration

The NNA system integrates moderation into the content lifecycle:

1. **Pre-Composition Check**: Validate individual assets before allowing composition, including AR, filters, and text assets.
1. **Pre-Publication Check**: Full moderation scan before allowing public sharing, including Moves tutorial videos.
1. **Post-Publication Monitoring**: Ongoing monitoring for reported content across all layers.
1. **Rights Verification**: Continuous verification of rights clearance for all assets.

### 6.4.3 Performance Considerations

Moderation checks are optimized to minimize impact on user experience:

- Parallel processing of different moderation aspects (e.g., identity, rights, content, biomechanical).
- Caching of moderation results for reused assets.
- Tiered approach with quick checks followed by deeper analysis only when needed.
- Asynchronous processing for non-blocking user experience, especially for AR transformations and text rendering.

## 6.5 Developer Setup Guide

### 6.5.1 Prerequisites

- **Node.js**: v18.x or later
- **TypeScript**: v5.x
- **Redis**: v7.x (local or cloud instance)
- **PostgreSQL**: v15.x
- **GCP SDK**: Installed and authenticated (`gcloud auth login`)
- **Dependencies**:

```bash
npm install @nestjs/core @nestjs/cache-manager cache-manager-redis-store @nestjs/typeorm pg axios
```

### 6.5.2 Local Environment Setup

1. **Clone Repository**:

```bash
git clone https://github.com/reviz/nna-framework.git
cd nna-framework
npm install
```

1. **Configure Environment**:
    - Create `.env`:

```
DATABASE_URL=postgres://user:pass@localhost:5432/nna
REDIS_URL=redis://localhost:6379
GCS_BUCKET=nna-assets
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
API_KEY=your-api-key
```

1. **Run Services**:

```bash
docker-compose up -d # Starts Redis, PostgreSQL
npm run start:dev # Starts Nest.js app
```

1. **Verify Setup**:
    - Test endpoint:

```bash
curl -H "Authorization: Bearer $API_KEY" http://localhost:3000/v1/asset/resolve/S.01.01.001
```

- Expected response: JSON asset data or 404 if not found (see [Section 6.2.1 - Asset Resolution API](/NNA Framework/Implementation Plan/v1.0.2#section-6.2.1-asset-resolution-api)).
1. **Quick Start**:

```typescript
// Example: Using TypeScript SDK
import { NNAClient } from '@nna/sdk';

const client = new NNAClient({
  baseURL: 'http://localhost:3000',
  apiKey: process.env.API_KEY,
});
const asset = await client.resolveAsset('S.01.01.001');
console.log(asset.data);
```

```typescript
// Core SDK implementation
import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';

export interface NNAClientOptions {
  baseURL: string;
  apiKey: string;
  timeout?: number;
  cache?: { enabled: boolean; ttl: number };
}

export class NNAClient {
  private client: AxiosInstance;
  private cache: Map<string, { data: any; expiry: number }> | null = null;
  private options: NNAClientOptions;

  constructor(options: NNAClientOptions) {
    this.options = options;
    const config: AxiosRequestConfig = {
      baseURL: options.baseURL,
      timeout: options.timeout || 10000,
      headers: {
        'X-API-Key': options.apiKey,
        'Content-Type': 'application/json',
      },
    };

    this.client = axios.create(config);
    if (options.cache?.enabled) this.cache = new Map();
  }

  async resolveAsset(assetId: string): Promise<any> {
    try {
      if (this.cache) {
        const cacheKey = `asset:${assetId}`;
        const cached = this.cache.get(cacheKey);
        if (cached && cached.expiry > Date.now()) return cached.data;
      }

      const response = await this.client.get(`/v1/asset/resolve/${assetId}`);
      const data = response.data;

      if (this.cache) {
        const cacheKey = `asset:${assetId}`;
        this.cache.set(cacheKey, {
          data,
          expiry: Date.now() + (this.options.cache?.ttl || 300) * 1000,
        });
      }
      return data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new Error(
        `Failed to resolve asset ${assetId}: ${axiosError.response?.data?.error || axiosError.message}`
      );
    }
  }

  async batchResolveAssets(assetIds: string[]): Promise<any> {
    try {
      const response = await this.client.post('/v1/asset/batch/resolve', { asset_ids: assetIds });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new Error(
        `Failed to batch resolve assets: ${axiosError.response?.data?.error || axiosError.message}`
      );
    }
  }
}
```

```python
# Python SDK Example
from nna_client import NNAClient

client = NNAClient(base_url='http://localhost:3000', api_key='your-api-key')
asset = client.resolve_asset('S.01.01.001')
print(asset['data'])
```

## 6.6 Error Handling Best Practices

### 6.6.1 Troubleshooting

- **Redis Connection Error**: Ensure REDIS_URL is correct; run redis-cli ping to test.
- **GCS Auth Failure**: Verify GOOGLE_APPLICATION_CREDENTIALS points to a valid JSON key file.
- **Endpoint 404**: Confirm Nest.js app is running (npm run start:dev).

### 6.6.2 Error Handling Best Practices

```typescript
// src/common/errors/nna-error.ts
export class NNAError extends Error {
  constructor(public code: string, message: string, public details?: any) {
    super(message);
    this.name = 'NNAError';
  }

  static handle(error: any): never {
    if (error instanceof NNAError) throw error;
    throw new NNAError('NNA_UNKNOWN_ERROR', 'Unexpected error', error);
  }
}

// Usage in service
async resolveAsset(assetId: string): Promise<any> {
  try {
    const asset = await this.storage.getAsset(assetId);
    if (!asset) throw new NNAError('NNA_RESOURCE_NOT_FOUND', `Asset ${assetId} not found`);
    return asset;
  } catch (error) {
    NNAError.handle(error);
  }
}
```

## 6.7 Troubleshooting

This section provides guidance on diagnosing and resolving common issues in the NNA Framework, updated to include the new layers and enhanced metadata.

**6.7.1 Common Issues and Resolutions**:

- **Issue**: Asset resolution fails for new layers (E, N, A, F, X).
    - **Cause**: Cache miss or unsupported layer in the resolution service.
    - **Resolution**: Verify the layer is supported in the Asset Resolution Service (Section 6.1.1). Check cache status (Section 6.1.2) and force a cache update if needed.
- **Issue**: Moves layer asset missing biomechanical metadata (e.g., Movement_Speed).
    - **Cause**: Incomplete metadata during asset ingestion.
    - **Resolution**: Re-ingest the asset with complete metadata. Ensure the ingestion pipeline validates biomechanical fields (e.g., Movement_Speed, Energy_Level).
- **Issue**: Tutorial link for Moves asset is broken (e.g., Tutorial_Link returns 404).
    - **Cause**: Invalid or outdated link in metadata.
    - **Resolution**: Update the Tutorial_Link field in the asset metadata. Implement a link validation check in the ingestion pipeline.
- **Issue**: Rights verification fails for composite with new layers.
    - **Cause**: Rights (R) layer metadata missing for new layers (e.g., E, N, A, F, X).
    - **Resolution**: Ensure the Rights Management Service (Section 6.4) includes rights data for all layers. Update the composite’s rights record (e.g., R.001.001.001.json.v1).

**6.7.2 Diagnostic Tools**:

- **Asset Resolution Logs**: Check /v1/asset/resolve logs for errors.
- **Cache Status**: Use /v1/cache/status to verify cache hits/misses.
- **Rights Verification Logs**: Check /v1/rights/verify logs for compliance issues.

For detailed troubleshooting steps, refer to the [NNA Framework Technical Implementation Guide VER 1.0.7](https://celerity.slab.com/posts/xfxe04qg#hi4jk-10-troubleshooting-guide).

## 6.8 Security Implementation

### 6.8.1 Authentication Middleware

```typescript
// src/auth/auth.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { NNAError } from '../common/errors/nna-error';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import Redis from 'ioredis';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  private readonly rateLimiter: RateLimiterRedis;
  
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {
    // Initialize rate limiter
    const redisClient = new Redis(this.configService.get('REDIS_URL'));
    this.rateLimiter = new RateLimiterRedis({
      storeClient: redisClient,
      keyPrefix: 'ratelimit',
      points: 1000, // Number of requests
      duration: 60, // Per 1 minute
    });
  }
  
  async use(req: Request, res: Response, next: NextFunction) {
    try {
      // Apply rate limiting
      const clientIp = req.ip;
      await this.rateLimiter.consume(clientIp, 1);
      
      // Extract token from header
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        throw new NNAError('NNA_AUTH_ERROR', 'Missing authorization header', { status: 401 });
      }
      
      // Handle different auth types
      if (authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        
        try {
          // Verify JWT
          const payload = this.jwtService.verify(token, {
            secret: this.configService.get('JWT_SECRET'),
          });
          
          // Attach user to request
          req['user'] = payload;
        } catch (error) {
          throw new NNAError('NNA_AUTH_ERROR', 'Invalid or expired token', { status: 401 });
        }
      } else if (authHeader.startsWith('ApiKey ')) {
        const apiKey = authHeader.substring(7);
        
        // Verify API key
        const apiKeyValid = await this.validateApiKey(apiKey);
        if (!apiKeyValid) {
          throw new NNAError('NNA_AUTH_ERROR', 'Invalid API key', { status: 401 });
        }
        
        // Attach API client info to request
        req['client'] = apiKeyValid;
      } else {
        throw new NNAError('NNA_AUTH_ERROR', 'Unsupported authorization method', { status: 401 });
      }
      
      // Add request tracking
      req['requestId'] = `req_${Math.random().toString(36).substr(2, 9)}`;
      
      next();
    } catch (error) {
      if (error.name === 'RateLimiterRes') {
        // Rate limit exceeded
        const secs = Math.round(error.msBeforeNext / 1000) || 1;
        res.set('Retry-After', String(secs));
        res.status(429).json({
          success: false,
          error: {
            code: 'NNA_RATE_LIMIT_EXCEEDED',
            message: 'Too many requests',
            details: {
              retryAfter: secs
            }
          },
          metadata: {
            timestamp: new Date().toISOString(),
            path: req.path,
            method: req.method
          }
        });
      } else if (error instanceof NNAError) {
        // NNA specific errors
        res.status(error.details?.status || 500).json({
          success: false,
          error: {
            code: error.code,
            message: error.message,
            details: error.details
          },
          metadata: {
            timestamp: new Date().toISOString(),
            path: req.path,
            method: req.method
          }
        });
      } else {
        // Generic errors
        res.status(500).json({
          success: false,
          error: {
            code: 'NNA_INTERNAL_ERROR',
            message: 'An internal error occurred'
          },
          metadata: {
            timestamp: new Date().toISOString(),
            path: req.path,
            method: req.method
          }
        });
      }
    }
  }
  
  private async validateApiKey(apiKey: string): Promise<any> {
    // Implementation would validate against database/cache
    // This is a placeholder
    const validKeys = {
      'YOUR_API_KEY': {
        clientId: 'client_123',
        scopes: ['asset.read', 'asset.write'],
      }
    };
    
    return validKeys[apiKey] || false;
  }
}
```

## 6.9 Database Schema

### 6.9.1 Asset Schema

```typescript
// src/asset/schemas/asset.schema.ts
import { Entity, Column, PrimaryColumn, Index, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('assets')
export class Asset {
  @PrimaryColumn({ type: 'varchar', length: 50 })
  asset_id: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  friendly_name: string;

  @Column({ type: 'char', length: 1 })
  layer: string;

  @Column({ type: 'int' })
  category: number;

  @Column({ type: 'int' })
  subcategory: number;

  @Column({ type: 'int' })
  sequential: number;

  @Column({ type: 'jsonb' })
  metadata: {
    // Standard fields
    Training_Set_ID?: string;
    Source: string;
    Target_Asset?: string;
    Premium: string;
    Tags: string[];
    Provenance: string;
    Rights_Split: string;
    Popularity_Score: number;
    Trending_Factor: number;
    Engagement_Rate: number;
    Creator_Boost: number;
    Version: string;
    Deprecated: boolean;
    Replacement?: string;
    License_Expiration?: string;
    Seasonal_Relevance?: string;
    Content_Rating: string;
    Cultural_Context?: string;
    Regional_Popularity?: string[];
    Demographic_Appeal?: string[];
    Festival_Relevance?: string;
    Locale?: string;
    Cache_Priority: string;
    File_Size: number;
    Duration?: number;
    Resolution?: string;
    Social_Media_Format?: {
      TikTok?: { aspect_ratio: string; max_duration: number };
      Instagram?: { aspect_ratio: string; max_duration: number };
      YouTube?: { aspect_ratio: string; max_duration: number };
    };
    Export_Settings?: {
      TikTok?: { format: string; bitrate: string };
      Instagram?: { format: string; bitrate: string };
    };
    Hashtags_Suggested?: string[];
    // Layer-specific fields
    Movement_Speed?: string; // Moves layer
    Energy_Level?: string; // Moves layer
    Cultural_Origin?: string; // Moves layer
    Tutorial_Available?: boolean; // Moves layer
    Tutorial_Link?: string; // Moves layer
    Brand_Name?: string; // Branded layer
    Privacy_Level?: string; // Personalize layer
    Intensity?: number; // Audio Effects layer
    Transition_Type?: string; // Transitions layer
    Interaction_Type?: string; // AR layer
    Color_Grade_Type?: string; // Filters layer
    Font_Style?: string; // Text layer
  };

  @Column({ type: 'jsonb' })
  urls: {
    preview: string;
    thumbnail: string;
    full: string;
  };

  @Column({ type: 'jsonb', default: '{}' })
  relationships: {
    compatible_with?: string[];
    requires?: string[];
    versions?: string[];
  };

  @Column({ type: 'varchar', length: 100, nullable: true })
  storage_path: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'varchar', length: 50, nullable: true })
  created_by: string;

  @Index()
  @Column({ type: 'varchar', length: 50, nullable: true })
  version: string;
}
```

### 6.9.2 Composition Schema

```typescript
// src/composition/schemas/composition.schema.ts
import { Entity, Column, PrimaryColumn, Index, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('compositions')
export class Composition {
  @PrimaryColumn({ type: 'varchar', length: 50 })
  composite_id: string;

  @Column({ type: 'jsonb' })
  components: {
    song?: string;
    star?: string;
    look?: string;
    moves?: string;
    world?: string;
    branded?: string;
    personalize?: string;
    training_data?: string;
    rights?: string;
    audio_effects?: string;
    transitions?: string;
    augmented_reality?: string;
    filters?: string;
    text?: string;
  };

  @Column({ type: 'jsonb' })
  options: {
    resolution: string;
    format: string;
    quality: number;
    output_formats: string[];
  };

  @Column({ type: 'jsonb', default: '{}' })
  urls: {
    preview?: string;
    final?: string;
    thumbnail?: string;
  };

  @Column({ type: 'varchar', length: 20, default: 'processing' })
  status: 'processing' | 'ready' | 'failed';

  @Column({ type: 'jsonb', nullable: true })
  progress: {
    percentage: number;
    current_stage: string;
    stages_completed: string[];
    stages_remaining: string[];
  };

  @Column({ type: 'varchar', length: 50 })
  user_id: string;

  @Column({ type: 'jsonb', nullable: true })
  rights: {
    clearance_id?: string;
    status: 'pending' | 'cleared' | 'denied';
    details?: any;
  };

  @Column({ type: 'timestamp', nullable: true })
  estimated_completion: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  completed_at: Date;
}
```

## 6.10 CI/CD Pipeline

### 6.10.1 GitHub Actions Workflow

```yaml
# .github/workflows/main.yml
name: NNA CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: nna_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      redis:
        image: redis:7
        ports:
          - 6379:6379
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Lint
        run: npm run lint
        
      - name: Test
        run: npm run test
        env:
          DATABASE_URL: postgres://postgres:postgres@localhost:5432/nna_test
          REDIS_URL: redis://localhost:6379
          JWT_SECRET: test-secret
          
      - name: E2E Tests
        run: npm run test:e2e
        env:
          DATABASE_URL: postgres://postgres:postgres@localhost:5432/nna_test
          REDIS_URL: redis://localhost:6379
          JWT_SECRET: test-secret
          
      - name: Build
        run: npm run build
        
      - name: Upload build artifact
        uses: actions/upload-artifact@v3
        with:
          name: nna-build
          path: dist/

  security-scan:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run OWASP dependency check
        run: npx @cyclonedx/cyclonedx-npm --output bom.xml
        
      - name: Run Snyk to check for vulnerabilities
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high

  deploy-dev:
    runs-on: ubuntu-latest
    needs: [test, security-scan]
    if: github.ref == 'refs/heads/develop'
    steps:
      - uses: actions/checkout@v3
      
      - name: Download build artifact
        uses: actions/download-artifact@v3
        with:
          name: nna-build
          path: dist/
          
      - name: Set up Google Cloud SDK
        uses: google-github-actions/setup-gcloud@v1
        with:
          service_account_key: ${{ secrets.GCP_SA_KEY }}
          project_id: ${{ vars.GCP_PROJECT_ID }}
          
      - name: Configure Docker for GCR
        run: gcloud auth configure-docker
        
      - name: Build and push Docker image
        run: |
          docker build -t gcr.io/${{ vars.GCP_PROJECT_ID }}/nna-api:dev-${{ github.sha }} .
          docker push gcr.io/${{ vars.GCP_PROJECT_ID }}/nna-api:dev-${{ github.sha }}
          
      - name: Deploy to GKE
        run: |
          gcloud container clusters get-credentials ${{ vars.GKE_CLUSTER }} --zone ${{ vars.GKE_ZONE }}
          kubectl set image deployment/nna-api nna-api=gcr.io/${{ vars.GCP_PROJECT_ID }}/nna-api:dev-${{ github.sha }} --namespace=development
          
      - name: Verify deployment
        run: |
          kubectl rollout status deployment/nna-api --namespace=development --timeout=300s

  deploy-prod:
    runs-on: ubuntu-latest
    needs: [test, security-scan]
    if: github.ref == 'refs/heads/main'
    environment: production
    steps:
      - uses: actions/checkout@v3
      
      - name: Download build artifact
        uses: actions/download-artifact@v3
        with:
          name: nna-build
          path: dist/
          
      - name: Set up Google Cloud SDK
        uses: google-github-actions/setup-gcloud@v1
        with:
          service_account_key: ${{ secrets.GCP_SA_KEY }}
          project_id: ${{ vars.GCP_PROJECT_ID }}
          
      - name: Configure Docker for GCR
        run: gcloud auth configure-docker
        
      - name: Build and push Docker image
        run: |
          docker build -t gcr.io/${{ vars.GCP_PROJECT_ID }}/nna-api:prod-${{ github.sha }} .
          docker push gcr.io/${{ vars.GCP_PROJECT_ID }}/nna-api:prod-${{ github.sha }}
          
      - name: Deploy to GKE
        run: |
          gcloud container clusters get-credentials ${{ vars.GKE_CLUSTER }} --zone ${{ vars.GKE_ZONE }}
          kubectl set image deployment/nna-api nna-api=gcr.io/${{ vars.GCP_PROJECT_ID }}/nna-api:prod-${{ github.sha }} --namespace=production
          
      - name: Verify deployment
        run: |
          kubectl rollout status deployment/nna-api --namespace=production --timeout=300s
```

## 6.11 AlgoRhythm Integration

### 6.11.1 API Integration

The AlgoRhythm Integration enables AI-powered recommendations for asset selection and compatibility analysis across all NNA layers, supporting the updated taxonomy.

**Key Features**:

- Provides recommendations for 10 MVP layers (Songs [G], Stars [S], Looks [L], Moves [M], Worlds [W], Branded [B], Personalize [P], Training_Data [T], Rights [R], Composites [C]) and 5 future layers (Audio Effects [E], Transitions [N], Augmented Reality [A], Filters [F], Text [X]).
- Leverages enhanced Moves (M) layer metadata (e.g., `Movement_Speed`, `Energy_Level`, `Cultural_Origin`) to recommend compatible dance movements.
- Uses metadata fields like `Popularity_Score`, `Trending_Factor`, `Engagement_Rate`, `Cultural_Context`, and `Social_Media_Format` to prioritize trending and platform-optimized assets.
- Supports compatibility scoring for composites by analyzing component assets (e.g., ensuring a Moves asset matches the Song’s tempo).

**Implementation Details**:

- **Endpoint**: `POST /v1/recommendations`
- **Request Example**:

```json
{
  "context": {
    "song": "G.POP.TSW.001.mp3.v1",
    "region": "US",
    "platform": "TikTok"
  },
  "layers": ["S", "L", "M", "W", "B", "P", "E", "N", "A", "F", "X"]
}
```

- **Response Example**:

```json
{
  "status": "success",
  "recommendations": {
    "S": [
      {
        "address": "S.POP.PNK.001.png.v1",
        "compatibility_score": 0.95,
        "metadata": {
          "Tags": ["Pop", "Diva"],
          "Popularity_Score": 85
        }
      }
    ],
    "M": [
      {
        "address": "M.017.002.001.mp4.v1",
        "compatibility_score": 0.92,
        "metadata": {
          "Movement_Speed": "Medium",
          "Energy_Level": "High",
          "Cultural_Origin": "Social Media",
          "Associated_Music": "Pop"
        }
      }
    ],
    "X": [
      {
        "address": "X.001.001.001.json.v1",
        "compatibility_score": 0.90,
        "metadata": {
          "Font_Style": "Bold",
          "Text_Alignment": "Center"
        }
      }
    ]
  }
}
```

- **Performance Targets**:
    - Recommendation Latency: <50ms (P95)
    - Recommendation Accuracy: 90%+

**Dependencies**:

- Asset Resolution Service (Section 6.1.1) for asset metadata.
- Cache Manager (Section 6.1.3) for caching recommendations.

```typescript
// src/algorhythm/algorhythm.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { catchError, firstValueFrom } from 'rxjs';
import { NNAError } from '../common/errors/nna-error';

@Injectable()
export class AlgoRhythmService {
  private readonly logger = new Logger(AlgoRhythmService.name);
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>('ALGORHYTHM_API_URL');
    this.apiKey = this.configService.get<string>('ALGORHYTHM_API_KEY');
  }

  async getRecommendations(context: RecommendationContext): Promise<any> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/v1/recommendations`, context, {
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': this.apiKey,
          },
        }).pipe(
          catchError((error) => {
            this.logger.error(`AlgoRhythm recommendation error: ${error.message}`);
            throw new NNAError(
              'NNA_ALGORHYTHM_ERROR', 
              'Failed to get recommendations from AlgoRhythm',
              { originalError: error.response?.data || error.message }
            );
          }),
        ),
      );
      
      return data;
    } catch (error) {
      if (error instanceof NNAError) throw error;
      
      throw new NNAError(
        'NNA_ALGORHYTHM_ERROR',
        'Failed to get recommendations from AlgoRhythm',
        { originalError: error.message }
      );
    }
  }

  async getCompatibilityScore(components: any): Promise<any> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/v1/compatibility`, components, {
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': this.apiKey,
          },
        }).pipe(
          catchError((error) => {
            this.logger.error(`AlgoRhythm compatibility error: ${error.message}`);
            throw new NNAError(
              'NNA_ALGORHYTHM_ERROR', 
              'Failed to get compatibility score from AlgoRhythm',
              { originalError: error.response?.data || error.message }
            );
          }),
        ),
      );
      
      return data;
    } catch (error) {
      if (error instanceof NNAError) throw error;
      
      throw new NNAError(
        'NNA_ALGORHYTHM_ERROR',
        'Failed to get compatibility score from AlgoRhythm',
        { originalError: error.message }
      );
    }
  }

  async trainFeedback(feedbackData: any): Promise<any> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/v1/feedback`, feedbackData, {
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': this.apiKey,
          },
        }).pipe(
          catchError((error) => {
            this.logger.error(`AlgoRhythm feedback error: ${error.message}`);
            throw new NNAError(
              'NNA_ALGORHYTHM_ERROR', 
              'Failed to send feedback to AlgoRhythm',
              { originalError: error.response?.data || error.message }
            );
          }),
        ),
      );
      
      return data;
    } catch (error) {
      if (error instanceof NNAError) throw error;
      
      throw new NNAError(
        'NNA_ALGORHYTHM_ERROR',
        'Failed to send feedback to AlgoRhythm',
        { originalError: error.message }
      );
    }
  }
}
```

## 6.12 Edge Processing Implementation

The NNA Framework implements advanced edge processing capabilities to minimize latency and optimize delivery based on client context. This approach moves computation closer to users while maintaining system integrity.

### 6.12.1 Edge Processing Architecture

```mermaid
graph TD
    Client[Client Application] --> EdgeCache[Edge Cache]
    EdgeCache --> EdgeCompute[Edge Compute Functions]
    EdgeCompute --> RegCache[Regional Cache]
    EdgeCompute --> AssetTrans[Asset Transformation]
    EdgeCompute --> AccessCtrl[Access Control]
    RegCache --> GlobalSvc[Global Services]
    
    subgraph "Edge Location"
        EdgeCache
        EdgeCompute
        AssetTrans
        AccessCtrl
    end
    
    subgraph "Regional Data Center"
        RegCache
    end
    
    subgraph "Central Services"
        GlobalSvc
    end
```

### 6.12.2 Edge Function Implementation

```typescript
// src/edge/asset-resolver.ts
import { Context } from '@edge-runtime/types';

export async function handleRequest(
  request: Request,
  context: Context
): Promise<Response> {
  // Parse request
  const url = new URL(request.url);
  const assetId = url.pathname.split('/').pop();
  
  // Check edge cache first
  const cacheKey = `asset:${assetId}`;
  const cachedAsset = await context.cache.get(cacheKey);
  
  if (cachedAsset) {
    return new Response(cachedAsset.body, {
      headers: {
        'Content-Type': cachedAsset.contentType,
        'Cache-Control': 'max-age=300',
        'Edge-Cache': 'hit'
      }
    });
  }
  
  // Check if we have edge-capable resolution for this asset type
  if (canResolveAtEdge(assetId)) {
    try {
      // Resolve asset at edge
      const asset = await resolveAssetAtEdge(assetId, context);
      
      // Cache result
      await context.cache.set(cacheKey, {
        body: asset.body,
        contentType: asset.contentType
      }, { ttl: 300 });
      
      return new Response(asset.body, {
        headers: {
          'Content-Type': asset.contentType,
          'Cache-Control': 'max-age=300',
          'Edge-Cache': 'miss',
          'Edge-Resolution': 'true'
        }
      });
    } catch (error) {
      // Log edge resolution failure
      context.log.error(`Edge resolution failed: ${error.message}`);
    }
  }
  
  // Fallback to origin request
  return await fetchFromOrigin(assetId, context);
}

async function resolveAssetAtEdge(
  assetId: string,
  context: Context
): Promise<EdgeAsset> {
  // Get asset metadata from edge data store
  const metadata = await context.kv.get(`metadata:${assetId}`);
  
  // Get asset content location
  const contentLocation = metadata.contentLocation;
  
  // Fetch content from edge-optimized storage
  const content = await context.storage.get(contentLocation);
  
  // Check for transformations needed
  const transformations = parseTransformations(context.request);
  if (Object.keys(transformations).length > 0) {
    return await transformAssetAtEdge(content, transformations, context);
  }
  
  return {
    body: content,
    contentType: metadata.contentType
  };
}

async function transformAssetAtEdge(
  content: ArrayBuffer,
  transformations: Transformations,
  context: Context
): Promise<EdgeAsset> {
  // Apply transformations at edge
  let transformedContent = content;
  let contentType = 'application/octet-stream';
  
  if (transformations.resize) {
    const { width, height } = transformations.resize;
    transformedContent = await context.imageProcessor.resize(
      transformedContent,
      width,
      height
    );
    contentType = 'image/jpeg';
  }
  
  if (transformations.format) {
    const { format, quality } = transformations.format;
    transformedContent = await context.imageProcessor.convert(
      transformedContent,
      format,
      quality
    );
    contentType = `image/${format}`;
  }
  
  return {
    body: transformedContent,
    contentType
  };
}

async function fetchFromOrigin(
  assetId: string,
  context: Context
): Promise<Response> {
  const originUrl = `https://api.reviz.dev/v1/asset/resolve/${assetId}`;
  
  const response = await fetch(originUrl, {
    headers: {
      'Edge-Request': 'true',
      'User-Agent': context.request.headers.get('User-Agent') || '',
      'X-Forwarded-For': context.request.headers.get('X-Forwarded-For') || ''
    }
  });
  
  return response;
}
```

### 6.12.3 Edge Deployment Configuration

```yaml
# edge/config.yaml
name: nna-edge-functions
runtime: edge-runtime-v1
routes:
  - pattern: /v1/asset/resolve/*
    function: asset-resolver
  - pattern: /v1/asset/transform/*
    function: asset-transformer
  - pattern: /v1/rights/verify/*
    function: rights-verifier

functions:
  asset-resolver:
    entry_point: src/edge/asset-resolver.ts
    memory: 128
    timeout: 50
    environment:
      ORIGIN_URL: https://api.reviz.dev
      ENABLE_EDGE_TRANSFORMATION: true
      
  asset-transformer:
    entry_point: src/edge/asset-transformer.ts
    memory: 256
    timeout: 500
    environment:
      MAX_IMAGE_SIZE: 10485760
      SUPPORTED_FORMATS: jpeg,png,webp
      
  rights-verifier:
    entry_point: src/edge/rights-verifier.ts
    memory: 128
    timeout: 50
    environment:
      RIGHTS_SERVICE_URL: https://api.reviz.dev
      ENABLE_EDGE_VERIFICATION: true
```

### 6.12.4 Edge Processing Benefits

1. **Reduced Latency**: Asset resolution happens closer to users, minimizing round-trip time.
1. **Bandwidth Optimization**: Transform assets at the edge to match device capabilities.
1. **Improved Cache Hit Rates**: Edge-level caching increases hit rates and reduces load on origin.
1. **Reduced Origin Load**: Common operations handled at edge reduce central infrastructure costs.
1. **Regional Compliance**: Apply region-specific rules and transformations at edge locations.
1. **Personalization**: Apply user-specific transformations without round-trips to origin.

### 6.12.5 Implementation Considerations

1. **State Management**: Edge functions must be stateless or use edge-specific storage.
1. **Synchronization**: Ensure metadata is consistently replicated to edge locations.
1. **Error Handling**: Implement graceful fallback to origin for edge processing failures.
1. **Monitoring**: Track edge vs. origin resolution metrics to optimize performance.
1. **Security**: Apply consistent authentication and authorization at edge nodes.
1. **Resource Limitations**: Account for memory and CPU constraints in edge environments.

## 6.13 Graph-Based Compatibility Resolution

The Graph-Based Compatibility Resolution service models asset relationships using a graph database to ensure compatible asset combinations in composite creation, as described in [Technical Implementation Guide, Section 3.1.4](/NNA Framework/Technical Implementation Guide/v1.0.7#section-3.1.4-graph-based-compatibility).

**6.13.1 Key Features**:

- Models relationships for 10 MVP layers (Songs [G], Stars [S], Looks [L], Moves [M], Worlds [W], Branded [B], Personalize [P], Training_Data [T], Rights [R], Composites [C]) and 5 future layers (Audio Effects [E], Transitions [N], Augmented Reality [A], Filters [F], Text [X]).
- Supports compatibility rules (e.g., Text layer requires Song layer, Moves layer matches Song tempo).
- Uses metadata fields like `Movement_Speed`, `Cultural_Origin`, and `Font_Style` to refine compatibility scores.
- Achieves sub-50ms query latency for compatibility checks.

**6.13.2 Implementation Details**:

- **Tech**: Neo4j graph database, Cypher queries for relationship traversal.
- **Endpoint**: `POST /v1/composition/validate`
- **Request Example**:

```json
{
  "components": {
    "song": "G.POP.TSW.001.mp3.v1",
    "moves": "M.POP.BRK.001.mp4.v1",
    "text": "X.001.001.001.json.v1"
  }
}
```

- **Response Example**:

```json
{
  "success": true,
  "data": {
    "is_compatible": true,
    "compatibility_score": 0.95,
    "details": {
      "rules_checked": [
        "Text requires Song: Passed",
        "Moves tempo matches Song: Passed (Movement_Speed: Fast, Song Tempo: 120 BPM)"
      ],
      "warnings": []
    }
  }
}
```

- **Performance Targets**:
    - Query Latency: <50ms (P95)
    - Accuracy: >95%

**6.13.3 Dependencies**:

- Asset Resolution Service (Section 6.1.1) for asset metadata.
- Cache Manager (Section 6.1.3) for caching compatibility results.

```typescript
// src/composition/compatibility.service.ts
import { Injectable } from '@nestjs/common';
import { Neo4jService } from '../neo4j/neo4j.service';
import { AssetService } from '../asset/asset.service';
import { NNAError } from '../common/errors/nna-error';

@Injectable()
export class CompatibilityService {
  constructor(
    private readonly neo4jService: Neo4jService,
    private readonly assetService: AssetService,
  ) {}

  async validateComposition(components: Record<string, string>): Promise<any> {
    try {
      const assets = await Promise.all(
        Object.values(components).map(id => this.assetService.resolveAsset(id))
      );

      const query = `
        MATCH (a:Asset)
        WHERE a.asset_id IN $assetIds
        OPTIONAL MATCH (a)-[:COMPATIBLE_WITH]->(b:Asset)
        OPTIONAL MATCH (a)-[:REQUIRES]->(c:Asset)
        RETURN a, collect(b) as compatible, collect(c) as required
      `;
      const result = await this.neo4jService.run(query, { assetIds: Object.values(components) });

      const compatibility = this.analyzeCompatibility(result, assets);
      return {
        success: true,
        data: {
          is_compatible: compatibility.is_compatible,
          compatibility_score: compatibility.score,
          details: compatibility.details,
        },
      };
    } catch (error) {
      NNAError.handle(error);
    }
  }

  private analyzeCompatibility(result: any, assets: any[]): any {
    // Implementation to analyze compatibility based on graph relationships
    // and metadata (e.g., Movement_Speed, Font_Style)
    const is_compatible = true; // Placeholder logic
    const score = 0.95; // Placeholder score
    const details = {
      rules_checked: [
        "Text requires Song: Passed",
        "Moves tempo matches Song: Passed"
      ],
      warnings: []
    };
    return { is_compatible, score, details };
  }
}
```

# 7. Risk Management & Mitigation

## 7.1 Potential Risks & Mitigations

- **AI Tool Failure**:
    - _Risk_: Grok 3 or Claude generates incorrect code/docs, delaying progress.
    - _Mitigation_: Manual review by FSE/BE1/BE2, fallback to manual coding if AI output fails (escalate to PM if >10% delay).
- **GCS Outage**:
    - _Risk_: Asset storage unavailable, blocking resolution.
    - _Mitigation_: Use AWS S3 as secondary storage, switch via Terraform config ([https://celerity.slab.com/posts/md#section-id](https://celerity.slab.com/posts/md#section-id)), test failover in Week 10.
- **Performance Bottlenecks**:
    - _Risk_: <20ms latency not met due to Redis or DB overload.
    - _Mitigation_: Optimize caching ([https://celerity.slab.com/posts/md#section-id](https://celerity.slab.com/posts/md#section-id)), scale nodes ([https://celerity.slab.com/posts/md#section-id](https://celerity.slab.com/posts/md#section-id)), monitor in Week 14.
- **Team Overload**:
    - _Risk_: >40h/week load delays milestones.
    - _Mitigation_: Leverage AI for 20% effort reduction, escalate to PM (Ajay Madhok) for resource adjustment by Week 6.
- **Architecture Evolution Complexity**:
    - _Risk_: Future architecture enhancements (GraphQL, Event-Driven) increase implementation complexity.
    - _Mitigation_: Phased implementation approach, dedicated architecture sandbox environments, progressive feature flags.
- **Integration Challenges with AlgoRhythm**:
    - _Risk_: API changes or performance issues with recommendation engine.
    - _Mitigation_: Mock interface, fallback recommendation strategy, circuit breaker implementation.
- **Multi-Region Data Consistency**:
    - _Risk_: Cache inconsistency across regions affecting user experience.
    - _Mitigation_: Implement eventual consistency patterns, clear cache invalidation strategies, monitoring alerts for inconsistencies.

| **Risk** | **Probability** | **Impact** | **Mitigation Strategy** | **Phase/Timing** | **Risk Score** |
| --- | --- | --- | --- | --- | --- |
| Registry Service MVP AI errors | Medium | Medium | Manual code reviews, fallback to existing codebase | Phase 1 | Medium |
| Performance targets not met | Medium | High | Early benchmarking, optimization sprints | Phases 2, 4 | High |
| Integration challenges with AlgoRhythm | Medium | Medium | Mock integration, interface contract | Phases 2, 4 | Medium |
| Cache consistency issues | Medium | High | Unit tests, monitoring, recovery scripts | Phases 2, 1 | High |
| Scalability bottlenecks | Low | High | Load testing, auto-scaling config | Phases 1, 4 | Medium |
| Security vulnerabilities | Low | Critical | Penetration test, OWASP scans in CI | Phases 1, 5 | Medium |

# 8. Key Success Metrics

1. **Performance Metrics**:
    - Asset resolution time: <20ms (p95)
    - Cache hit rate: >95%
    - System availability: 99.999%
    - Request throughput: 10M+ concurrent users
    - Edge processing latency (AR, filters, text): <50ms (p95)
1. **Development Metrics**:
    - Code coverage: >90%
    - API response time: <50ms (p95)
    - Build/deployment time: <15 minutes
    - Documentation completeness: 100%
    - Biomechanical analysis accuracy (Moves layer): >95%
    - Tutorial video availability (Moves layer): 100% for assets with `Tutorial_Available: true`
1. **Business Metrics**:
    - Reduced asset management overhead: 70%
    - Faster content creation workflows: 85%
    - Decreased rights management complexity: 60%

# 9. Documentation Strategy

## 9.1 Documentation-as-Code Approach

The NNA framework implements a comprehensive documentation strategy:

- **OpenAPI Specifications**: Auto-generated from code annotations, covering 10 MVP layers (Songs [G], Stars [S], Looks [L], Moves [M], Worlds [W], Branded [B], Personalize [P], Training_Data [T], Rights [R], Composites [C]) and 5 future layers (Audio Effects [E], Transitions [N], Augmented Reality [A], Filters [F], Text [X]).
- **SDK Documentation**: Generated from TypeScript/JSDoc comments, including examples for new layers (e.g., applying AR filters, rendering text overlays).
- **Interactive API Explorer**: Developer playground for testing endpoints, with sample assets for Moves (including tutorial videos), AR, filters, and text.
- **Tutorials and Guides**: AI-generated examples with real-world use cases, such as creating a composite with Moves (using biomechanical metadata), AR effects, and text overlays.

## 9.2 Documentation Automation Pipeline

```mermaid
graph TD
    CodeBase[Code Base with Annotations] --> Extractor[Documentation Extractor]
    ApiSpec[OpenAPI Specification] --> Generator[Doc Site Generator]
    Extractor --> ApiDocs[API Documentation]
    ApiDocs --> Generator
    Examples[Example Code] --> Generator
    Tutorials[Tutorials] --> Generator
    Generator --> DocSite[Documentation Site]
    DocSite --> Versioning[Version Control]
    DocSite --> Api별[Interactive API Explorer]
```

## 9.3 Developer Experience Focus

- **Sandbox Environment**: Test environment with sample assets.
- **SDK Starter Kits**: Pre-configured projects for different frameworks.
- **Code Snippets**: Ready-to-use code examples for common operations.
- **Integration Guides**: Specific guidance for ReViz, AlgoRhythm, and Clearity integrations.

# 10. Accelerating with AI Tools

## 10.1 Leveraging AI Throughout Development

- **Architecture Design**:
    - Use Claude to refine architecture diagrams and component relationships.
    - Generate design considerations and best practices.
- **Code Generation**:
    - Use Cursor to scaffold services, repositories, and tests.
    - Generate boilerplate code for API endpoints and data models.
- **Documentation**:
    - Use Claude to generate comprehensive API documentation.
    - Create example usage patterns and integration guides.
- **Testing**:
    - Generate test cases covering edge cases and error conditions.
    - Create performance test scenarios based on requirements.

## 10.2 Specific AI-Accelerated Workflows

1. **Service Implementation with Cursor**:
    - Define service interface and requirements.
    - Use Cursor to generate implementation with error handling.
    - Review and refine generated code.
1. **API Documentation with Claude**:
    - Implement API endpoints.
    - Ask Claude to generate comprehensive documentation.
    - Validate against OpenAPI specification.
1. **Infrastructure as Code with AI**:
    - Define infrastructure requirements.
    - Use AI to generate Terraform/Kubernetes configurations.
    - Customize for specific environment needs.

## 10.3 Modern API Design Strategy

The NNA Framework implements a comprehensive API design strategy to ensure consistency, forward compatibility, and developer experience. This strategy incorporates REST, GraphQL, and event-driven patterns to meet diverse integration needs.

### 10.3.1 API Design Principles

1. **Resource-Oriented Design**: Clear resource definitions with standard HTTP methods.
1. **Consistent Error Handling**: Standardized error formats with specific error codes.
1. **Versioning Strategy**: Path-based versioning with clear deprecation policies.
1. **Performance Optimization**: Response shaping, efficient pagination, and caching directives.
1. **Documentation-First**: OpenAPI-driven development with living documentation.
1. **Developer Experience Focus**: Intuitive naming, consistent patterns, and comprehensive examples.

### 10.3.2 REST API Guidelines

```typescript
// Example RESTful endpoint implementation
@Controller('v1/asset')
export class AssetController {
  constructor(private readonly assetService: AssetService) {}

  @Get('resolve/:assetId')
  @ApiOperation({ summary: 'Resolve an asset by ID' })
  @ApiParam({ name: 'assetId', description: 'NNA Asset Identifier' })
  @ApiResponse({
    status: 200,
    description: 'Asset successfully resolved',
    type: AssetResponseDto
  })
  @ApiResponse({
    status: 404,
    description: 'Asset not found',
    type: ErrorResponseDto
  })
  async resolveAsset(@Param('assetId') assetId: string): Promise<AssetResponse> {
    // Implementation details...
  }
}
```

### Key REST guidelines:

- Use nouns, not verbs (/assets, not /getAssets).
- Use HTTP methods appropriately (GET, POST, PUT, DELETE).
- Implement HATEOAS for discoverability.
- Include cacheable responses with appropriate headers.
- Support both JSON and JSON+HAL formats.

### 10.3.3 GraphQL Integration Strategy

The NNA Framework implements GraphQL alongside REST APIs to provide flexible, efficient data access. The implementation follows these principles:

1. **Side-by-Side Deployment**: GraphQL endpoint (`/graphql`) available alongside REST endpoints.
1. **Schema-First Development**: Define GraphQL schema before implementation.
1. **Resolvers Connected to Existing Services**: Reuse business logic from REST implementation.
1. **Batching and Caching**: DataLoader pattern for efficient data loading.
1. **Subscription Support**: Real-time updates via WebSockets.
1. **Comprehensive Type System**: Full type coverage with custom scalars.

```typescript
// GraphQL schema example
const typeDefs = gql`
  type Asset {
    id: ID!
    type: String!
    metadata: AssetMetadata!
    urls: AssetURLs!
    rights: RightsInfo
  }

  type AssetURLs {
    preview: String
    full: String
    thumbnail: String
  }

  type Query {
    asset(id: ID!): Asset
    assets(filter: AssetFilter, limit: Int, offset: Int): [Asset!]!
    compositeAsset(components: [ID!]!): Asset
  }
`;

// Resolver implementation
const resolvers = {
  Query: {
    asset: async (_, { id }, { dataSources }) => {
      return dataSources.assetService.resolveAsset(id);
    },
    // Additional resolvers...
  }
};
```

### 10.3.4 Event-Driven API Integration

For real-time updates and asynchronous processing, the NNA Framework incorporates event-driven patterns:

1. **WebSocket API**: Real-time asset and composition updates.
1. **Webhook Support**: Push notifications for events like `branded.added`, `personalize.uploaded`, `text.added`.
1. **Event Schema Registry**: Consistent event definitions.
1. **Event-Sourcing Patterns**: For audit and history tracking.

```typescript
// WebSocket server implementation
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  async handleConnection(client: Socket, ...args: any[]) {
    // Handle client connection
  }

  async handleDisconnect(client: Socket) {
    // Handle client disconnect
  }

  @SubscribeMessage('subscribe')
  async handleSubscribe(client: Socket, payload: SubscriptionPayload) {
    // Handle subscription request
  }

  // Publish event to subscribers
  async publishEvent(eventType: string, data: any) {
    this.server.emit(eventType, data);
  }
}
```

### 10.3.5 API Evolution Strategy

To ensure smooth transitions between API versions and patterns:

1. **Deprecation Process**:
    - Mark endpoints as deprecated in documentation.
    - Add `Deprecation` and `Sunset` headers.
    - Maintain deprecated endpoints for minimum 6 months.
1. **Feature Flags**:
    - Use feature flags for progressive rollout of new endpoints.
    - Allow opt-in testing of new API patterns.
1. **Compatibility Layer**:
    - Implement adapter patterns for transitioning between REST and GraphQL.
    - Provide conversion utilities in SDKs.
1. **Documentation Strategy**:
    - Maintain comprehensive migration guides.
    - Provide side-by-side examples of old and new patterns.
    - Include upgrade scripts and tools.

# 11. Program Management Oversight

## 11.1 Key Performance Indicators (KPIs)

| **KPI** | **Target** | **Measurement Frequency** | **Owner** |
| --- | --- | --- | --- |
| Task Completion Rate | 95% per sprint | Weekly | FSE |
| Code Coverage | >90% | Bi-weekly | BE2 |
| API Response Time | <50ms (p95) | Weekly | BE1 |
| Bug Rate | <5 critical | Weekly | FSE |
| Deployment Success | 100% | Per deployment | BE1 |

## 11.2 Progress Checkpoints

- **Week 3**: Infra and endpoints demo (stakeholder review).
- **Week 6**: SDK v0.1 release review.
- **Week 10**: Composition/Rights demo.
- **Week 14**: AlgoRhythm integration sign-off.
- **Week 18**: Pre-deployment review.

## 11.3 Communication Plan

- **Weekly Status Reports**: Email to stakeholders (PM: Ajay Madhok, progress/risks/KPIs).
- **Sprint Reviews**: Bi-weekly Zoom with demos (FSE leads, attendees: PM, CTO: TBD).
- **Escalation Path**: PM (Ajay Madhok) -> Engineering Lead (Yaroslav) -> CTO (TBD) for blockers.
- **Scope Management**: Change requests logged in GitHub Issues, reviewed weekly by PM: Ajay Madhok.

# 12. Conclusion

The NNA Framework implementation plan delivers a scalable infrastructure over an 18-week timeline (March 3 - July 4, 2025). For **developers**, it provides clear setup guidance, robust SDKs, and error handling best practices, enabling rapid integration.

For **program managers**, it offers precise timelines, KPIs, and oversight tools to ensure on-time delivery. Starting with Nest.js endpoints and wrapping into SDKs unblocks front-end development early, while AI tools (Grok 3, Claude, Cursor) accelerate execution.

Integrated with GCS, AlgoRhythm, and moderation features, the system meets NNA requirements, laying a solid foundation for the ReViz platform by July 4, 2025.

# Appendix A - Glossary

- **NNA Registry Service**: A core microservice for registering, resolving, and managing assets using HFN/MFA, supporting the NNA Framework’s naming, numbering, and addressing principles.
- **HFN (Human-Friendly Name)**: User-facing identifier (e.g., G.POP.TSW.001.mp3.v1).
- **MFA (Machine-Friendly Address)**: System-level identifier (e.g., G.001.012.001.mp3.v1).
- **Songs (G) Layer**: Audio tracks with metadata like Tempo.
- **Stars (S) Layer**: Avatars with Tags, Popularity_Score.
- **Looks (L) Layer**: Styles with Style_Type.
- **Moves (M) Layer**: Dance sequences with Movement_Speed, Tutorial_Link.
- **Worlds (W) Layer**: Environments with Scene_Type.
- **Branded (B) Layer**: Branded content with Brand_Name.
- **Personalize (P) Layer**: User content with Privacy_Level.
- **Training_Data (T) Layer**: AI datasets with Training_Set_ID.
- **Composites (C) Layer**: Combined assets with Engagement_Metrics.
- **Rights (R) Layer**: Licensing data with Rights_Split.
- **Audio Effects (E) Layer**: Audio enhancements with Effect_Type.
- **Transitions (N) Layer**: Scene transitions with Transition_Duration.
- **Augmented Reality (A) Layer**: AR elements with Interaction_Type.
- **Filters (F) Layer**: Visual filters with Filter_Category.
- **Text (X) Layer**: Text overlays with Font_Style.
- **AlgoRhythm**: AI recommendation engine.
- **Clearity**: Rights management platform.



---
