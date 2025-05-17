# NNA Framework Implementation Project Plan

**Document Version**: 1.0.1

**Last Updated**: March 20, 2025

**Status**: Draft

### Executive Summary

This project plan outlines the architecture, implementation approach, deliverables, milestones, and timelines for building the NNA infrastructure and APIs. It leverages one senior full-stack engineer (FSE) and two back-end engineers (BE1, BE2) with 10 years of infrastructure experience, accelerated by AI tools (Grok 3, Claude, Cursor). Implementation occurs in phases with continuous integration, spanning 18 weeks (March 3 - July 4, 2025). It starts with plain RESTful endpoints using Nest.js, followed by wrapping into SDKs (JavaScript/TypeScript, Python) to enhance developer experience and unblock front-end development. The approach progresses through core infrastructure, advanced features, content moderation, and [AlgoRhythm](#section-6.13-algorhythm-integration) integration, leveraging Google Cloud Storage (GCS) to deliver a robust NNA ecosystem by July 4, 2025.

### Changelog

    - **v1.0.1 (2025-03-20)**Initial draft with architecture, phases, and timeline.
    - Added hyperlinks for SLAB navigation (e.g., [Section 6.6](#section-6.6-developer-setup-guide)).
    - Enhanced [Section 1.2](#section-1.2-key-technical-decisions) readability with subheadings.
    - Expanded [Section 7 - Risk Management & Mitigation](#section-7-risk-management--mitigation) with specific risks.

# 1. Architecture Overview

## 1.1 System Components

```mermaid
graph TD
    Client[Client Applications] --> APIGateway[API Gateway]
    
    subgraph "NNA Core"
        APIGateway --> AuthService[Authentication Service]
        APIGateway --> AssetService[Asset Resolution Service]
        APIGateway --> CompositionService[Composition Service]
        APIGateway --> RightsService[Rights Management Service]
        AssetService --> CacheService[Cache Service]
        CompositionService --> CacheService
        RightsService --> CacheService
        CacheService --> StorageService[Storage Service]
    end
    
    subgraph "AlgoRhythm Integration"
        AssetService <--> AlgoRhythm[AlgoRhythm]
        CompositionService <--> AlgoRhythm
    end
    
    subgraph "Monitoring & Operations"
        MonitoringService[Monitoring Service] --> APIGateway
        MonitoringService --> AuthService
        MonitoringService --> AssetService
        MonitoringService --> CompositionService
        MonitoringService --> RightsService
        MonitoringService --> CacheService
        MonitoringService --> StorageService
        MonitoringService --> AlgoRhythm
    end
```

## 1.2 Key Technical Decisions

### Infrastructure

- **Cloud Provider**: Google Cloud Platform (GCP), AWS (secondary)
- **Container Orchestration**: Kubernetes
- **CI/CD**: GitHub Actions
- **Infrastructure as Code**: Terraform

### Core Technologies

- **Framework**: Nest.js (Node.js) for backend services, supporting RESTful and WebSocket APIs for real-time updates (e.g., composition progress, rights verification).
- **Language**: Python (FastAPI) for ML integration (e.g., [AlgoRhythm](#section-6.14-algorhythm-integration)) and edge processing tasks (e.g., AR transformations, filter application).
- **Database**: PostgreSQL (asset metadata), Redis (caching)
- **Storage**: Google Cloud Storage (GCS) for assets, with edge-optimized storage for AR and filter assets.
- **Messaging**: RabbitMQ (event queues) for asynchronous processing (e.g., composite asset creation, real-time text rendering).
- **API Protocols**: RESTful APIs for core functionality, GraphQL for flexible data queries (e.g., asset recommendations), and WebSocket for real-time updates.

### Multi-tier Caching

- **Edge Cache**: In-memory Redis (300s TTL), optimized for platform-specific formats (e.g., `Social_Media_Format` for TikTok, Instagram).
- **Regional Cache**: Redis Cluster (3600s TTL), supporting regional compliance for rights and content moderation.
- **Global Cache**: Distributed Redis cluster with ARC eviction (86400s TTL, see [NNA Technical Implementation Guide, Section 3.2.3](#section-3.2.3-multi-tier-cache-manager)).

### Monitoring & Observability

- **Prometheus & Grafana**: Metrics and dashboards for API performance, cache hit rates, and edge processing latency.
- **ELK Stack**: Logging for debugging asset resolution, rights verification, and moderation workflows.
- **Jaeger**: Distributed tracing for end-to-end request tracking, including edge-to-origin fallbacks.

# 2. Implementation Approach

## 2.1 Methodology

- **Agile**: Two-week sprints with weekly demos, daily standups
- **DevOps**: CI/CD with automated testing, vulnerability scanning, and canary deployments
- **API & SDK Parallel Development**: OpenAPI specs defined upfront, with SDK development starting early
- **Iterative Development**: Begin with core functionality, continuously enhance with feedback
- **Microservices**: Independent, scalable services with well-defined boundaries
- **Documentation-as-Code**: Auto-generated API docs from code annotations

## 2.2 Team Roles

- **FSE**: Plain endpoint implementation (Nest.js), SDK development, front-end tools
- **BE1**: Infrastructure, caching, storage (GCS integration)
- **BE2**: Core services, security, AlgoRhythm integration
- **AI**: Grok 3 (reviews), Claude (code/docs), Cursor (coding)

## 2.3 AI Strategy

- **Endpoints**: Cursor scaffolds Nest.js endpoints; Claude generates OpenAPI specs from requirements
- **SDKs**: Parallel SDK development with TypeScript-first approach; Claude generates type definitions from API specs
- **Docs**: Automated documentation generation with examples injected by Claude
- **Testing**: Claude generates comprehensive test cases including edge cases, performance, and security tests
- **Code Reviews**: Grok 3 performs automated code reviews focusing on performance and security
- **Infrastructure**: Claude assists with Terraform configurations and Kubernetes manifests

## 2.4 Resource Allocation & Budget

- **Team Capacity**:
    - FSE: 40 hrs/week (720 hrs total over 18 weeks)
    - BE1: 40 hrs/week (720 hrs total)
    - BE2: 40 hrs/week (720 hrs total)
    - Total: 2,160 engineer-hours
- **Task Distribution**:
    - FSE: 40% endpoints/SDKs, 30% testing, 20% docs, 10% edge processing (e.g., AR, filters, text rendering)
    - BE1: 50% infra/caching, 30% optimization, 10% deployment, 10% edge infrastructure for new layers 
    - BE2: 40% services/integration, 30% moderation, 20% testing, 10% biomechanical analysis for Moves layer
- **Budget Estimate (GCP Costs)**:
    - Kubernetes Cluster: ~$500/month (GKE standard cluster)
    - GCS Storage: ~$0.023/GB/month (150GB = $3.45/month, including tutorial videos for Moves layer) + egress $0.12/GB (12TB/month = $1,440/month, increased for AR assets) + requests ~$1/1M (120M/day = $3,600/month)
    - Redis: ~$75/month (Memorystore medium instance, increased for caching new layer metadata)
    - Edge Compute: ~$200/month (for AR transformations, filter application, text rendering)
    - Total: ~$5,818.45/month x 4.5 months = $**26,183.03**
- **Contingency**: 10% buffer (~$2,618)

## 2.5 Kubernetes Resource Configuration

### 2.5.1 Production Resource Requirements

- **API Pods**: 4 replicas, 1 vCPU, 2GB RAM per pod (requests), 2 vCPU, 4GB (limits).
- **Worker Pods**: 2 replicas, 2 vCPU, 4GB RAM (requests), 4 vCPU, 8GB (limits).
- **Redis**: 3 nodes (1 master, 2 replicas), 1 vCPU, 2GB RAM each.

| **Service** | **CPU Request** | **CPU Limit** | **Memory Request** | **Memory Limit** | **Replicas** |
| --- | --- | --- | --- | --- | --- |
| API Gateway | 0.5 | 1.0 | 512Mi | 1Gi | 4-10 |
| Asset Service | 1.0 | 2.0 | 1Gi | 2Gi | 4-10 |
| Composition Service | 2.0 | 4.0 | 2Gi | 4Gi | 2-6 |
| Cache Service | 1.0 | 2.0 | 4Gi | 8Gi | 3 |
| Rights Service | 0.5 | 1.0 | 512Mi | 1Gi | 2-4 |
| WebSocket Service | 0.5 | 1.0 | 512Mi | 1Gi | 2-6 |

### 2.5.2 Autoscaling Parameters

- **HPA**: CPU utilization target 70%, min 4 pods, max 20 pods.
- **Cluster Autoscaler**: Scale nodes on 80% memory usage, 5-15 nodes.

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: asset-service-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: asset-service
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

## 2.5 Kubernetes Resource Configuration

### 2.5.1 Production Resource Requirements

- **API Pods**: 4 replicas, 1 vCPU, 2GB RAM per pod (requests), 2 vCPU, 4GB (limits).
- **Worker Pods**: 2 replicas, 2 vCPU, 4GB RAM (requests), 4 vCPU, 8GB (limits).
- **Redis**: 3 nodes (1 master, 2 replicas), 1 vCPU, 2GB RAM each.

### 2.5.2 Autoscaling Parameters

- **HPA**: CPU utilization target 70%, min 4 pods, max 20 pods.
- **Cluster Autoscaler**: Scale nodes on 80% memory usage, 5-15 nodes.

### 2.5.3 Production Resource Requirements

| **Service** | **CPU Request** | **CPU Limit** | **Memory Request** | **Memory Limit** | **Replicas** |
| --- | --- | --- | --- | --- | --- |
| API Gateway | 0.5 | 1.0 | 512Mi | 1Gi | 3-5 |
| Asset Service | 1.0 | 2.0 | 1Gi | 2Gi | 3-5 |
| Composition Service | 2.0 | 4.0 | 2Gi | 4Gi | 2-3 |
| Cache Service | 1.0 | 2.0 | 4Gi | 8Gi | 2 |
| Rights Service | 0.5 | 1.0 | 512Mi | 1Gi | 2 |
| WebSocket Service | 0.5 | 1.0 | 512Mi | 1Gi | 2-3 |

### 2.5.4 Autoscaling Parameters

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: asset-service-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: asset-service
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

# 3 Core Components

## 3.1 API Layer (RESTful & WebSocket)

- **Purpose**: Expose endpoints for asset resolution, composition, and real-time updates.
- **Tech**: Nest.js,  Node.js (Express) for RESTful APIs, WebSocket (ws library) for real-time communication.
- **Structure**: Modular microservices (e.g., Asset Service, Rights Service, Preview Service).

## 3.2 Authentication & Security Layer

- **Purpose**: Handle API Key, JWT, and OAuth 2.0 authentication.
- **Tech**: OAuth 2.0 server (e.g., Keycloak), JWT validation, request signing with HMAC-SHA256.
- **Structure**: Centralized auth service with token validation middleware.

## 3.3 Data Layer

- **Purpose**: Store and manage assets, metadata, and relationships.
- **Tech**: PostgreSQL (primary DB), Redis (cache), Google Cloud Storage (GCS) for asset files.
- **Structure**: Multi-tier caching (edge, regional, global) with Redis for performance, GCS for durable asset storage.

## 3.4 Processing Layer

- **Purpose**: Handle asset composition, preview generation, ML integration, edge processing for AR and filters, real-time text rendering, and biomechanical analysis for Moves layer assets.
- **Tech**: Python (FastAPI) for ML tasks and edge processing, worker queues (RabbitMQ/Celery) for asynchronous tasks.
- **Structure**: Asynchronous workers for heavy processing (e.g., composite asset creation, AR transformations, filter application, text rendering, biomechanical analysis, tutorial video processing for Moves layer).

## 3.5 Infrastructure Layer

- **Purpose**: Ensure scalability, resilience, and observability.
- **Tech**: Kubernetes (container orchestration), Prometheus (monitoring), Grafana (dashboards), ELK stack (logging).
- **Structure**: Cloud-agnostic deployment (e.g., AWS, GCP) with auto-scaling.

## 3.6 Implementation Approach

- **Modular Design**: Break down into microservices for independent scaling and development.
- **CI/CD Pipeline**: Use GitHub Actions for automated testing, building, and deployment.
- **AI Assistance**: Leverage Grok 3 for architecture reviews, Claude for code generation, and Cursor for real-time coding assistance.
- **Security First**: Implement authentication, rate limiting, and error handling from the start.
- **Observability**: Integrate monitoring and logging at every layer for debugging and performance tracking.

## 3.7 SDK Development Strategy

- **TypeScript Foundation**: Build SDKs with TypeScript for type safety and better developer experience.
- **Parallel Development**: Begin SDK development alongside API endpoints rather than waiting for completion.
- **Auto-Generated Types**: Generate TypeScript types from OpenAPI specifications.
- **Progressive Enhancement**: Start with core functionality (e.g., asset resolution), add advanced features (e.g., composition) incrementally.
- **Developer Experience Focus**: Prioritize intuitive interfaces, clear error handling, and comprehensive examples.
- **Multi-Platform Roadmap**: Focus on JavaScript/TypeScript (v1.0.0 by Week 6), Python (v1.0.0 by Week 16), with Java/Swift deferred post-launch.
- **Versioning Strategy**: Use semantic versioning (e.g., v1.0.0 for stable release with core endpoints, v1.1.0 for AlgoRhythm integration), with deprecation notices in docs.

# 4. Project Phases & Milestones

## 4.1 Phase 1: Foundation & Endpoints (Weeks 1-3)

- **Objective**: Set up infrastructure and deliver core endpoints.
- **Deliverables**:
    - Kubernetes cluster, CI/CD, basic monitoring.
    - RESTful endpoints (`/asset/resolve`, `/asset/batch/resolve`) in Nest.js.
    - Authentication service.
- **Milestones**:
    - Week 2: Infra and basic endpoints operational.
    - Week 3: Auth and endpoint tests ready.

## 4.2 Phase 2: Caching & SDK Wrapping (Weeks 4-6)

- **Objective**: Add caching and initial SDKs.
- **Deliverables**:
    - Multi-tier caching (Redis) with support for new layers (E, N, A, F, X).
    - Asset Service with GCS integration.
    - JavaScript/TypeScript SDK v0.1.
    - AlgoRhythm mock.
- **Milestones**:
    - Week 5: Caching functional.
    - Week 6: SDK v0.1 released.

## 4.3 Phase 3: Composition & Rights (Weeks 7-10)

- **Objective**: Implement composition, rights, WebSocket support, and initial support for new layers.
- **Deliverables**:
    - Composition Service endpoints with support for Audio Effects (E), Transitions (N), AR (A), Filters (F), and Text (X).
    - Rights Service endpoints with initial moderation.
    - WebSocket for real-time updates (e.g., composition progress, text rendering).
    - Initial Moves layer enhancements (e.g., biomechanical metadata validation).
- **Milestones**:
    - Week 8: Composition endpoints live, including new layers.
    - Week 10: Rights, WebSocket, and initial Moves enhancements operational.

## 4.4 Phase 4: AlgoRhythm & Optimization (Weeks 11-14)

- **Objective**: Integrate AlgoRhythm, optimize, enhance SDKs, and add Moves layer features.
- **Deliverables**:
    - Full AlgoRhythm integration with support for new layers and Moves metadata.
    - Clearity rights integration with moderation.
    - Performance optimizations for edge processing (AR, filters, text).
    - Enhanced JS/TS SDK, Python SDK v0.1.
    - Moves layer tutorial video integration and biomechanical analysis.
- **Milestones**:
    - Week 12: AlgoRhythm integrated, Moves tutorial videos supported.
    - Week 14: Performance targets met, biomechanical analysis functional.

## 4.5 Phase 5: Testing & Deployment (Weeks 15-18)

- **Objective**: Finalize, test, and deploy with complete SDKs.
- **Deliverables**:
    - Test suites (unit, integration, load) covering new layers and Moves features.
    - Production deployment.
    - Complete docs and SDKs (JS/TS, Python).
- **Milestone**:
    - Week 18: System live (July 4, 2025).

## 4.6 Progress Tracking & Reporting

- **Weekly Deliverables**: Each sprint ends with:
    - Demo of new features (FSE leads).
    - Code review report (Grok 3 via BE1/BE2).
    - Test coverage update (>90% target).
- **KPIs Tied to Milestones**:
    - Week 3: Basic endpoints live, API response <50ms.
    - Week 6: SDK v0.1 released, cache hit rate >80%.
    - Week 10: Composition endpoints operational (including new layers), rights checks passing.
    - Week 14: Performance <20ms (p95), AlgoRhythm integrated, Moves features (tutorial videos, biomechanical analysis) functional.
    - Week 18: System uptime 99.999%, full docs complete.
- **Reporting**:
    - Weekly status to PM: Progress vs. plan, risks, blockers.
    - Dashboard: GitHub Actions status, Prometheus metrics.

# 5. Detailed Timeline & Tasks

## 5.1 Weeks 1-2 (March 3-16): Foundation & Endpoints

| **Task** | **Owner** | **Duration** | **Dependencies** | **AI Acceleration** |
| --- | --- | --- | --- | --- |
| Deploy Kubernetes cluster (`gcloud container clusters create nna-cluster`) | BE1 | 3d | None | Claude: Terraform scripts |
| Scaffold basic endpoints (`GET /v1/asset/resolve/:id`) | FSE | 3d | Infra setup | Cursor: Nest.js endpoints |
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
| Composition Endpoints (including E, N, A, F, X support) | BE2 | 3d | Asset Service | Cursor: Nest.js service |
| WebSocket Setup | FSE | 2d | Composition Endpts | Claude: Event system |
| RabbitMQ Integration | BE1 | 3d | Composition Endpts | Claude: Queue setup |
| Moderation Pre-checks | BE2 | 2d | Composition Endpts | Claude: Moderation code |
| Composition tests | FSE | 2d | Composition Endpts | Claude: Test cases |

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

_Note_: If deployment fails, rollback to last stable version using `kubectl rollout undo` and re-run integration tests.

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

### 6.1.1 Asset Resolution Service

The Asset Resolution Service is responsible for resolving NNA addresses to their corresponding assets, ensuring sub-20ms latency for 10M+ concurrent users. The service has been updated to support the expanded taxonomy, including new layers and enhanced metadata.

**Key Features**:

- Resolves assets across all layers: Songs (G), Stars (S), Looks (L), Moves (M), Worlds (W), Vibes (V), Branded (B), Personalize (P), Training_Data (T), Composites (C), Rights (R), Audio Effects (E), Transitions (N), Augmented Reality (A), Filters (F), and Text (X).
- Supports the enhanced Moves (M) layer with biomechanical and cultural classifications (e.g., Movement_Speed, Cultural_Origin).
- Handles the updated naming convention: `[Layer].[CategoryCode].[SubCategoryCode].[Sequential].[Type].[Version]` (e.g., M.017.002.001.mp4.v1 for a Woah dance).
- Integrates with the multi-tier caching system (Edge, Regional, Global) to achieve 95%+ cache hit rates.
- Validates asset metadata, including new fields like `Popularity_Score`, `Social_Media_Format`, and layer-specific fields (e.g., `Font_Style` for Text layer).

**Implementation Details**:

- **Endpoint**: `POST /v1/asset/resolve`
- **Request Example**:

```json
{
  "address": "M.017.002.001.mp4.v1",
  "context": {
    "region": "US",
    "platform": "TikTok"
  }
}
```

- **Response Example**:

```json
{
  "status": "success",
  "asset": {
    "address": "M.017.002.001.mp4.v1",
    "type": "Moves",
    "category": "Social_Media_Trending",
    "subcategory": "Woah",
    "metadata": {
      "Movement_Speed": "Medium",
      "Energy_Level": "High",
      "Cultural_Origin": "Social Media",
      "Social_Media_Format": {
        "TikTok": { "aspect_ratio": "9:16", "max_duration": 60 }
      }
    },
    "url": "https://cdn.reviz.co/assets/M.017.002.001.mp4"
  }
}
```

- **Performance Targets**:
    - Latency: <20ms (P95)
    - Cache Hit Rate: 95%+
    - Concurrent Users: 10M+

**Dependencies**:

- Cache Manager (Section 6.1.2) for multi-tier caching.
- Rights Management (Section 6.4) for rights verification.
- AlgoRhythm Integration (Section 6.13) for compatibility scoring.

### 6.1.2 Asset Resolution Service

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

The Cache Manager implements a three-tier caching system (Edge, Regional, Global) to achieve sub-20ms asset resolution and 95%+ cache hit rates. The system has been updated to support the expanded taxonomy, including new layers and metadata fields.

**Key Features**:

- Supports caching for all layers: Songs (G), Stars (S), Looks (L), Moves (M), Worlds (W), Vibes (V), Branded (B), Personalize (P), Training_Data (T), Composites (C), Rights (R), Audio Effects (E), Transitions (N), Augmented Reality (A), Filters (F), and Text (X).
- Uses `Cache_Priority` metadata field to prioritize caching (e.g., "High" for trending assets like M.017.002.001).
- Optimizes for `Social_Media_Format` to pre-cache assets in platform-specific formats (e.g., TikTok 9:16 aspect ratio).
- Implements intelligent invalidation based on `Version` and `Deprecated` fields to ensure cache consistency.

**Cache Tiers**:

- **Edge Cache (L1)**: 5-minute TTL, LRU eviction, local to request.
- **Regional Cache (L2)**: 1-hour TTL, LFU eviction, geographic distribution.
- **Global Cache (L3)**: 24-hour TTL, ARC eviction, central coordination.

**Implementation Details**:

- **Cache Key Format**: `[Layer].[CategoryCode].[SubCategoryCode].[Sequential].[Type].[Version]` (e.g., M.017.002.001.mp4.v1).
- **Cache Update Logic**:
    - On asset update, propagate changes from Global to Regional to Edge.
    - Use `Cache_Priority` to determine retention (e.g., "High" assets retained longer).
- **Performance Metrics**:
    - Cache Hit Rate: 95%+ (target)
    - Cache Miss Latency: <50ms (P95)
    - Cache Update Latency: <10ms (P95)

**Dependencies**:

- Asset Resolution Service (Section 6.1.1) for cache lookups.
- Rights Management (Section 6.4) for cache invalidation based on rights changes.

For detailed caching strategies, refer to the [NNA Technical Implementation Guide, Section 3.2 - Cache Architecture](#section-3.2).

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

## 6.14 AlgoRhythm Integration

The AlgoRhythm Integration enables AI-powered recommendations for asset selection and compatibility analysis across all NNA layers. The integration has been updated to support the expanded taxonomy, including new layers and enhanced metadata.

**Key Features**:

- Provides recommendations for all layers: Songs (G), Stars (S), Looks (L), Moves (M), Worlds (W), Vibes (V), Branded (B), Personalize (P), Training_Data (T), Composites (C), Rights (R), Audio Effects (E), Transitions (N), Augmented Reality (A), Filters (F), and Text (X).
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
  "layers": ["S", "L", "M", "W", "V", "E", "N", "A", "F", "X"]
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
    "E": [
      {
        "address": "E.001.002.001.mp3.v1",
        "compatibility_score": 0.90,
        "metadata": {
          "Tags": ["Pitch Shift"],
          "Intensity": 5
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
- Cache Manager (Section 6.1.2) for caching recommendations.

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

  constructor(options: NNAClientOptions) {
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
          expiry: Date.now() + (this.options?.cache?.ttl || 300) * 1000,
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
import requests
import time
from typing import List, Dict, Optional, Any, Union

class NNAClient:
    """NNA Client SDK for Python applications"""
    
    def __init__(
        self, 
        base_url: str, 
        api_key: str, 
        timeout: int = 10,
        enable_cache: bool = True,
        cache_ttl: int = 300
    ):
        """
        Initialize the NNA client
        
        Args:
            base_url: Base URL for the NNA API
            api_key: API key for authentication
            timeout: Request timeout in seconds
            enable_cache: Whether to enable client-side caching
            cache_ttl: Cache TTL in seconds
        """
        self.base_url = base_url.rstrip('/')
        self.timeout = timeout
        self.headers = {
            'X-API-Key': api_key,
            'Content-Type': 'application/json'
        }
        
        # Setup cache if enabled
        self.cache = {} if enable_cache else None
        self.cache_ttl = cache_ttl
    
    def resolve_asset(self, asset_id: str) -> Dict[str, Any]:
        """
        Resolve an asset by its NNA address
        
        Args:
            asset_id: The NNA address to resolve
            
        Returns:
            Asset data dictionary
        """
        # Check cache first if enabled
        if self.cache is not None:
            cache_key = f"asset:{asset_id}"
            cached = self.cache.get(cache_key)
            if cached and cached['expiry'] > time.time():
                return cached['data']
        
        # Make API request
        url = f"{self.base_url}/v1/asset/resolve/{asset_id}"
        response = requests.get(url, headers=self.headers, timeout=self.timeout)
        response.raise_for_status()
        data = response.json()
        
        # Cache response if caching is enabled
        if self.cache is not None:
            self.cache[f"asset:{asset_id}"] = {
                'data': data,
                'expiry': time.time() + self.cache_ttl
            }
        
        return data
```

## 6.4 Rights Management & Clearity Integration

The Rights Management Service integrates with Clearity to automate rights clearance and tracking for all assets in the NNA Framework. The service has been updated to support the expanded taxonomy, including new layers and enhanced rights metadata.

**Key Features**:

- Supports rights management for all layers: Songs (G), Stars (S), Looks (L), Moves (M), Worlds (W), Vibes (V), Branded (B), Personalize (P), Training_Data (T), Composites (C), Rights (R), Audio Effects (E), Transitions (N), Augmented Reality (A), Filters (F), and Text (X).
- Uses the Rights (R) layer to track provenance and rights with fields like `Region`, `Usage_Restrictions`, `Expiration_Date`, `Clearance_Level`, `Platform_Restrictions`, `Territory_Exceptions`, `Commercial_Terms`, `Rights_Owner_Contact`, and `Secondary_Rights`.
- Automates rights clearance for composites (C layer) by aggregating rights from component assets.
- Ensures compliance with regional and usage-specific rights (e.g., "Non-commercial only" for certain assets).

**Implementation Details**:

- **Endpoint**: `POST /v1/rights/verify`
- **Request Example**:

```json
{
  "asset": "C.001.001.001:G.POP.TSW.001+S.POP.PNK.001+...mp4.v1",
  "context": {
    "region": "North_America",
    "usage": "Commercial",
    "platform": "TikTok"
  }
}
```

- **Response Example**:

```json
{
  "status": "success",
  "rights": {
    "address": "R.001.001.001.json.v1",
    "Rights_Split": "IP Holders: 25%, ReViz: 25%, Remixer: 50%",
    "Region": "North_America",
    "Usage_Restrictions": "Commercial",
    "Expiration_Date": "2025-12-31",
    "Clearance_Level": "Full",
    "Platform_Restrictions": [],
    "Territory_Exceptions": [],
    "Commercial_Terms": "Royalty-free",
    "Rights_Owner_Contact": "legal@brand.com",
    "Secondary_Rights": "Merchandising"
  }
}
```

- **Performance Targets**:
    - Rights Verification Latency: <20ms (P95)
    - Rights Update Latency: <10ms (P95)

**Dependencies**:

- Asset Resolution Service (Section 6.1.1) for asset metadata.
- Cache Manager (Section 6.1.2) for caching rights data.

```typescript
// Complex rights resolution with Clearity integration
import { clearityClient } from '../clearity';

export class RightsService {
  /**
   * Resolve complex rights for a composite asset
   */
  async resolveCompositeRights(compositeId: string): Promise<RightsResolution> {
    // Get composite asset components
    const composite = await this.getCompositeAsset(compositeId);
    
    // Extract all component assets
    const componentAssets = composite.components.map(c => c.assetId);
    
    // Process rights for all components
    const componentRights = await Promise.all(
      componentAssets.map(assetId => this.resolveRights(assetId))
    );
    
    // Submit to Clearity for validation and rights clearance
    const clearanceRequest = {
      compositeId,
      components: componentAssets.map((assetId, index) => ({
        assetId,
        rights: componentRights[index],
        usage: composite.components[index].usage
      }))
    };
    
    // Process through Clearity
    const clearanceResult = await clearityClient.processClearance(clearanceRequest);
    
    // Validate all rights were cleared
    if (!clearanceResult.allCleared) {
      throw new RightsException('Not all rights were cleared', clearanceResult.issues);
    }
    
    return {
      compositeId,
      clearanceId: clearanceResult.clearanceId,
      rightsHolders: clearanceResult.rightsHolders,
      licensingTerms: clearanceResult.terms,
      validUntil: clearanceResult.validUntil
    };
  }
  
  /**
   * Verify usage rights for a specific context
   */
  async verifyUsageRights(assetId: string, context: UsageContext): Promise<VerificationResult> {
    // Get basic rights information
    const rights = await this.resolveRights(assetId);
    
    // Check for common restrictions
    if (rights.restrictions) {
      // Verify usage against restrictions
      for (const restriction of rights.restrictions) {
        if (!this.isContextCompliant(context, restriction)) {
          return {
            permitted: false,
            reason: `Usage violates restriction: ${restriction.type}`,
            alternatives: this.suggestAlternatives(assetId, context)
          };
        }
      }
    }
    
    // Check licensing requirements
    if (rights.licensingRequired && !context.license) {
      return {
        permitted: false,
        reason: 'Usage requires explicit licensing',
        licenseOptions: await this.getLicensingOptions(assetId, context)
      };
    }
    
    return {
      permitted: true,
      terms: rights.terms,
      attributionRequired: rights.attributionRequired
    };
  }
}
```

```typescript
// Test scenarios for rights management
describe('Rights Management Service', () => {
  describe('Complex Composite Assets', () => {
    it('should correctly resolve rights for assets with multiple contributors', async () => {
      // Arrange
      const compositeId = 'C.02.01.003';
      const mockComponents = [
        { assetId: 'S.01.02.005', usage: 'primary' },
        { assetId: 'L.03.01.002', usage: 'applied' },
        { assetId: 'W.02.03.001', usage: 'background' }
      ];
      
      // Mock the component assets with different rights holders
      mockGetCompositeAsset.mockResolvedValue({
        id: compositeId,
        components: mockComponents
      });
      
      // Mock rights for components with different rights holders
      mockResolveRights.mockImplementation((assetId) => {
        if (assetId === 'S.01.02.005') {
          return Promise.resolve({
            rightsHolders: ['Creator A', 'Studio X'],
            attributionRequired: true
          });
        } else if (assetId === 'L.03.01.002') {
          return Promise.resolve({
            rightsHolders: ['Fashion Brand Y'],
            attributionRequired: true,
            licensingRequired: true
          });
        } else {
          return Promise.resolve({
            rightsHolders: ['Environment Artist Z'],
            attributionRequired: false
          });
        }
      });
      
      // Mock Clearity response
      mockClearityClient.processClearance.mockResolvedValue({
        allCleared: true,
        clearanceId: 'CLR12345',
        rightsHolders: ['Creator A', 'Studio X', 'Fashion Brand Y', 'Environment Artist Z'],
        terms: 'Standard commercial license',
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      });
      
      // Act
      const result = await rightsService.resolveCompositeRights(compositeId);
      
      // Assert
      expect(result.clearanceId).toBe('CLR12345');
      expect(result.rightsHolders).toHaveLength(4);
      expect(result.rightsHolders).toContain('Fashion Brand Y');
      expect(mockClearityClient.processClearance).toHaveBeenCalledWith(expect.objectContaining({
        compositeId,
        components: expect.arrayContaining([
          expect.objectContaining({
            assetId: 'L.03.01.002',
            rights: expect.objectContaining({
              licensingRequired: true
            })
          })
        ])
      }));
    });
  });
});
```

## 6.5 Content Moderation Integration

As a platform targeting Gen Z creators, content moderation is essential for maintaining community standards and legal compliance. The NNA framework will integrate with moderation systems through:

### 6.5.1 Pre-Publication Checks

- Asset metadata scanning for prohibited content flags across all layers (e.g., inappropriate AR filters, text overlays).
- Face recognition and identity verification for Star (S) and Personalize (P) layers.
- Rights clearance verification via Clearity integration.
- Age-appropriate content classification for all assets, including Moves (M) tutorial videos.
- Validation of biomechanical metadata for Moves (M) layer assets (e.g., ensuring `Movement_Speed`, `Energy_Level` are within acceptable ranges).

### 6.5.2 Technical Implementation

```typescript
// src/moderation/moderation.service.ts
import { Injectable } from '@nestjs/common';
import { AssetService } from '../asset/asset.service';
import { RightsService } from '../rights/rights.service';
import { NNAError } from '../common/errors/nna-error';

interface ModerationResult {
  approved: boolean;
  confidenceScore: number;
  flags?: {
    type: 'identity' | 'rights' | 'inappropriate' | 'age_restricted' | 'biomechanical_invalid';
    severity: 'low' | 'medium' | 'high';
    details: string;
  }[];
  recommendedAction?: 'approve' | 'review' | 'reject';
}

@Injectable()
export class ContentModerationService {
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

### 6.5.3 Moderation Workflow Integration

The NNA system will integrate moderation into the content lifecycle:

1. **Pre-Composition Check**: Validate individual assets before allowing composition, including AR, filters, and text assets.
1. **Pre-Publication Check**: Full moderation scan before allowing public sharing, including Moves tutorial videos.
1. **Post-Publication Monitoring**: Ongoing monitoring for reported content across all layers.
1. **Rights Verification**: Continuous verification of rights clearance for all assets.

### 6.5.4 Performance Considerations

Moderation checks will be optimized to minimize impact on user experience:

- Parallel processing of different moderation aspects (e.g., identity, rights, content, biomechanical).
- Caching of moderation results for reused assets.
- Tiered approach with quick checks followed by deeper analysis only when needed.
- Asynchronous processing for non-blocking user experience, especially for AR transformations and text rendering.

## 6.6 Developer Setup Guide

### Prerequisites

- **Node.js**: v18.x or later
- **TypeScript**: v5.x
- **Redis**: v7.x (local or cloud instance)
- **PostgreSQL**: v15.x
- **GCP SDK**: Installed and authenticated (`gcloud auth login`)
- **Dependencies**:

```bash
npm install @nestjs/core @nestjs/cache-manager cache-manager-redis-store @nestjs/typeorm pg axios
```

###  Local Environment Setup

1. **Clone Repository**:

```bash
git clone https://github.com/reviz/nna-framework.git
   cd nna-framework
   npm install
```

1. **Configure Environment**
- Create .env:

```
DATABASE_URL=postgres://user:pass@localhost:5432/nna
REDIS_URL=redis://localhost:6379
GCS_BUCKET=nna-assets
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
API_KEY=your-api-key
```

1. **Run Services**

```bash
docker-compose up -d # Starts Redis, PostgreSQL
npm run start:dev # Starts Nest.js app
```

1. **Verify Setup**
- Test endpoint:

```bash
curl -H "Authorization: Bearer $API_KEY" http://localhost:3000/v1/asset/resolve/S.01.01.001
```

- Expected response: JSON asset data or 404 if not found (see [Section 6.2.1](#section-6.2.1-asset-resolution-api)).
1. **Quick Start**

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

```python
# Python SDK Example
from nna_client import NNAClient

client = NNAClient(base_url='http://localhost:3000', api_key='your-api-key')
asset = client.resolve_asset('S.01.01.001')
print(asset['data'])
```

## 6.7 Error Handling Best Practices

### 6.7.1 Troubleshooting

- **Redis Connection Error**: Ensure REDIS_URL is correct; run redis-cli ping to test.
- **GCS Auth Failure**: Verify GOOGLE_APPLICATION_CREDENTIALS points to a valid JSON key file.
- **Endpoint 404**: Confirm Nest.js app is running (npm run start:dev).

### 6.7.2 Error Handling Best Precatices

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

## 6.8 Troubleshooting

This section provides guidance on diagnosing and resolving common issues in the NNA Framework, updated to include the new layers and enhanced metadata.

**Common Issues and Resolutions**:

- **Issue**: Asset resolution fails for new layers (E, N, A, F, X).
    - **Cause**: Cache miss or unsupported layer in the resolution service.
    - **Resolution**: Verify the layer is supported in the Asset Resolution Service (Section 6.1.1). Check cache status (Section 6.1.2) and force a cache update if needed.
- **Issue**: Moves layer asset missing biomechanical metadata (e.g., `Movement_Speed`).
    - **Cause**: Incomplete metadata during asset ingestion.
    - **Resolution**: Re-ingest the asset with complete metadata. Ensure the ingestion pipeline validates biomechanical fields (e.g., `Movement_Speed`, `Energy_Level`).
- **Issue**: Tutorial link for Moves asset is broken (e.g., `Tutorial_Link` returns 404).
    - **Cause**: Invalid or outdated link in metadata.
    - **Resolution**: Update the `Tutorial_Link` field in the asset metadata. Implement a link validation check in the ingestion pipeline.
- **Issue**: Rights verification fails for composite with new layers.
    - **Cause**: Rights (R) layer metadata missing for new layers (e.g., E, N, A, F, X).
    - **Resolution**: Ensure the Rights Management Service (Section 6.4) includes rights data for all layers. Update the composite’s rights record (e.g., R.001.001.001.json.v1).

**Diagnostic Tools**:

- **Asset Resolution Logs**: Check `/v1/asset/resolve` logs for errors.
- **Cache Status**: Use `/v1/cache/status` to verify cache hits/misses.
- **Rights Verification Logs**: Check `/v1/rights/verify` logs for compliance issues.

For detailed troubleshooting steps, refer to the [NNA Technical Implementation Guide, Section 10 - Troubleshooting Guide](#hi4jk-10-troubleshooting-guide).

## 6.10 Security Implementation

### 6.10.1 Authentication Middleware

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

## 6.11 Database Schema

### 6.11.1 Asset Schema

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

### 6.11.2 Composition Schema

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
    vibe?: string;
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

## 6.12 CI/CD Pipeline

### 6.12.1 GitHub Actions Workflow

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

## 6.13 AlgoRhythm Integration

### 6.13.1 API Integration

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

## 6.14 Edge Processing Implementation

The NNA Framework implements advanced edge processing capabilities to minimize latency and optimize delivery based on client context. This approach moves computation closer to users while maintaining system integrity.

### 6.14.1 Edge Processing Architecture

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

### 6.14.2 Edge Function Implementation

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
  const originUrl = `${context.config.originUrl}/v1/asset/resolve/${assetId}`;
  
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

### 6.14.3 Edge Deployment Configuration

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
      ORIGIN_URL: https://api.reviz.studio
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
      RIGHTS_SERVICE_URL: https://rights.reviz.studio
      ENABLE_EDGE_VERIFICATION: true
```

### 6.14.4 Edge Processing Benefits

1. **Reduced Latency**: Asset resolution happens closer to users, minimizing round-trip time
1. **Bandwidth Optimization**: Transform assets at the edge to match device capabilities
1. **Improved Cache Hit Rates**: Edge-level caching increases hit rates and reduces load on origin
1. **Reduced Origin Load**: Common operations handled at edge reduce central infrastructure costs
1. **Regional Compliance**: Apply region-specific rules and transformations at edge locations
1. **Personalization**: Apply user-specific transformations without round-trips to origin

### 6.14.5 Implementation Considerations

1. **State Management**: Edge functions must be stateless or use edge-specific storage
1. **Synchronization**: Ensure metadata is consistently replicated to edge locations
1. **Error Handling**: Implement graceful fallback to origin for edge processing failures
1. **Monitoring**: Track edge vs. origin resolution metrics to optimize performance
1. **Security**: Apply consistent authentication and authorization at edge nodes
1. **Resource Limitations**: Account for memory and CPU constraints in edge environments

# 7. Risk Management & Mitigation

## 7.1 Potential Risks & Mitigations

- **AI Tool Failure**:
    - _Risk_: Grok 3 or Claude generates incorrect code/docs, delaying progress.
    - _Mitigation_: Manual review by FSE/BE1/BE2, fallback to manual coding if AI output fails (escalate to PM if >10% delay).
- **GCS Outage**:
    - _Risk_: Asset storage unavailable, blocking resolution.
    - _Mitigation_: Use AWS S3 as secondary storage, switch via Terraform config ([Section 6.12](#section-6.12-cicd-pipeline)), test failover in Week 10.
- **Performance Bottlenecks**:
    - _Risk_: <20ms latency not met due to Redis or DB overload.
    - _Mitigation_: Optimize caching ([Section 6.1.2](#section-6.1.2-cache-manager-implementation)), scale nodes ([Section 3.5](#section-3.5-infrastructure-layer)), monitor in Week 14.
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
| Performance targets not met | Medium | High | Early benchmarking (Week 5), optimization sprints (Weeks 13-14) | Phases 2, 4 | High |
| Integration challenges with AlgoRhythm | Medium | Medium | Mock integration (Week 6), interface contract (Week 11) | Phases 2, 4 | Medium |
| Cache consistency issues | Medium | High | Unit tests (Week 6), monitoring setup (Week 4), recovery scripts | Phases 2, 1 | High |
| Scalability bottlenecks | Low | High | Load testing (Week 14), auto-scaling config (Week 1) | Phases 1, 4 | Medium |
| Security vulnerabilities | Low | Critical | Penetration test (Week 16), OWASP scans in CI (Week 1) | Phases 1, 5 | Medium |
| Event-Driven Architecture migration complexity | Medium | Medium | Phased implementation, dual-write pattern | Phase 4+ | Medium |
| GraphQL adoption resistance | Low | Medium | Side-by-side implementation, backward compatibility | Phase 4+ | Low |
| Multi-cloud deployment complexity | Medium | High | Infrastructure as Code, environment parity testing | Phases 1, 5 | Medium |
| SDK version compatibility | Medium | Medium | Semantic versioning, deprecation policies, migration guides | All Phases | Medium |
| AI tool dependency risks | Low | Medium | Manual verification, prompt engineering standards | All Phases | Low |

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

The NNA framework will implement a comprehensive documentation strategy:

- **OpenAPI Specifications**: Auto-generated from code annotations, covering all layers (G, S, L, M, W, V, B, P, T, C, R, E, N, A, F, X).
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
    DocSite --> ApiExplorer[Interactive API Explorer]
```

### 9.3 Developer Experience Focus

- **Sandbox Environment**: Test environment with sample assets
- **SDK Starter Kits**: Pre-configured projects for different frameworks
- **Code Snippets**: Ready-to-use code examples for common operations
- **Integration Guides**: Specific guidance for ReViz, AlgoRhythm, and Clearity integrations

# 10. Accelerating with AI Tools

## 10.1 Leveraging AI Throughout Development

- **Architecture Design:**
    - Use Claude to refine architecture diagrams and component relationships
    - Generate design considerations and best practices
- **Code Generation:**
    - Use Cursor to scaffold services, repositories, and tests
    - Generate boilerplate code for API endpoints and data models
- **Documentation:**
    - Use Claude to generate comprehensive API documentation
    - Create example usage patterns and integration guides
- **Testing:**
    - Generate test cases covering edge cases and error conditions
    - Create performance test scenarios based on requirements

## 10.2 Specific AI-Accelerated Workflows

1. **Service Implementation with Cursor:**
    - Define service interface and requirements
    - Use Cursor to generate implementation with error handling
    - Review and refine generated code
1. **API Documentation with Claude:**
    - Implement API endpoints
    - Ask Claude to generate comprehensive documentation
    - Validate against OpenAPI specification
1. **Infrastructure as Code with AI:**
    - Define infrastructure requirements
    - Use AI to generate Terraform/Kubernetes configurations
    - Customize for specific environment needs

## 10.3 Modern API Design Strategy

The NNA Framework implements a comprehensive API design strategy to ensure consistency, forward compatibility, and developer experience. This strategy incorporates REST, GraphQL, and event-driven patterns to meet diverse integration needs.

### 10.3.1 API Design Principles

1. **Resource-Oriented Design**: Clear resource definitions with standard HTTP methods
1. **Consistent Error Handling**: Standardized error formats with specific error codes
1. **Versioning Strategy**: Path-based versioning with clear deprecation policies
1. **Performance Optimization**: Response shaping, efficient pagination, and caching directives
1. **Documentation-First**: OpenAPI-driven development with living documentation
1. **Developer Experience Focus**: Intuitive naming, consistent patterns, and comprehensive examples

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

- Use nouns, not verbs (/assets, not /getAssets)
- Use HTTP methods appropriately (GET, POST, PUT, DELETE)
- Implement HATEOAS for discoverability
- Include cacheable responses with appropriate headers
- Support both JSON and JSON+HAL formats

### 10.3.3 GraphQL Integration Strategy

The NNA Framework will implement GraphQL alongside REST APIs to provide flexible, efficient data access. The implementation follows these principles:

1. **Side-by-Side Deployment**: GraphQL endpoint (`/graphql`) available alongside REST endpoints
1. **Schema-First Development**: Define GraphQL schema before implementation
1. **Resolvers Connected to Existing Services**: Reuse business logic from REST implementation
1. **Batching and Caching**: DataLoader pattern for efficient data loading
1. **Subscription Support**: Real-time updates via WebSockets
1. **Comprehensive Type System**: Full type coverage with custom scalars

```typescript
Copy// GraphQL schema example
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

For real-time updates and asynchronous processing, the NNA Framework will incorporate event-driven patterns:

1. **WebSocket API**: Real-time asset and composition updates
1. **Webhook Support**: Push notifications for events
1. **Event Schema Registry**: Consistent event definitions
1. **Event-Sourcing Patterns**: For audit and history tracking

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
    - Mark endpoints as deprecated in documentation
    - Add `Deprecation` and `Sunset` headers
    - Maintain deprecated endpoints for minimum 6 months
1. **Feature Flags**:
    - Use feature flags for progressive rollout of new endpoints
    - Allow opt-in testing of new API patterns
1. **Compatibility Layer**:
    - Implement adapter patterns for transitioning between REST and GraphQL
    - Provide conversion utilities in SDKs
1. **Documentation Strategy**:
    - Maintain comprehensive migration guides
    - Provide side-by-side examples of old and new patterns
    - Include upgrade scripts and tools

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

- **Week 3**: Infra and endpoints demo (stakeholder review)
- **Week 6**: SDK v0.1 release review
- **Week 10**: Composition/Rights demo
- **Week 14**: AlgoRhythm integration sign-off
- **Week 18**: Pre-deployment review

## 11.3 Communication Plan

- **Weekly Status Reports**: Email to stakeholders (PM: Ajay Madhok, progress/risks/KPIs)
- **Sprint Reviews**: Bi-weekly Zoom with demos (FSE leads, attendees: PM, CTO: TBD)
- **Escalation Path**: PM (Ajay Madhok) -> Engineering Lead (Yaroslav) -> CTO (TBD) for blockers
- **Scope Management**: Change requests logged in GitHub Issues, reviewed weekly by PM: Ajay Madhok

## 11.4 Resource Load

- **FSE**: ~30-35h/week (endpoint dev, SDKs, testing)
- **BE1**: ~35-40h/week (infra, caching, deployment)
- **BE2**: ~35-40h/week (services, integration)
- **Mitigation**: AI reduces manual effort; escalate if >40h/week consistently

# 12. Conclusion

The NNA Framework implementation plan delivers a scalable infrastructure over an 18-week timeline (March 3 - July 4, 2025). For **developers**, it provides clear setup guidance, robust SDKs, and error handling best practices, enabling rapid integration.

For **program managers**, it offers precise timelines, KPIs, and oversight tools to ensure on-time delivery. Starting with Nest.js endpoints and wrapping into SDKs unblocks front-end development early, while AI tools (Grok 3, Claude, Cursor) accelerate execution.

Integrated with GCS, AlgoRhythm, and moderation features, the system meets NNA requirements, laying a solid foundation for the ReViz platform by July 4, 2025.

# 13. Glossary

- **AlgoRhythm**: AI recommendation engine integrated with NNA for asset suggestions.
- **Clearity**: Rights management platform ensuring legal compliance for asset usage.
- **GCS**: Google Cloud Storage, used for persistent asset storage.
- **NNA Ecosystem**: The integrated set of API services, SDKs, and infrastructure for asset management.
- **Nest.js**: Node.js framework for building scalable server-side applications.
- **RabbitMQ**: Message broker for asynchronous task processing (e.g., composition).
- **Audio Effects (E) Layer**: A layer for audio enhancements, including voice modulation and sound effects.
- **Transitions (N) Layer**: A layer for visual, audio, and scene transitions, enabling seamless remixing.
- **Augmented Reality (A) Layer**: A layer for AR elements like face filters and stickers.
- **Filters (F) Layer**: A layer for visual filters such as color grading and cinematic effects.
- **Text (X) Layer**: A layer for text overlays, including lyrics, captions, and watermarks.
- **Biomechanical Tagging**: Metadata tagging for dance movements in the Moves (M) layer, capturing properties like `Movement_Speed` and `Energy_Level`.
- **Tutorial Videos**: Video content linked to Moves (M) layer assets via `Tutorial_Link`, providing instructional guidance for dance movements.

---
