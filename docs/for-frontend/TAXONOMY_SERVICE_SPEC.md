# Draft Specification: Standalone Taxonomy Service

## Purpose
To provide a single source of truth for taxonomy data, accessible by both frontend and backend, supporting:
- Browsing, editing, and updating the taxonomy structure
- Real-time updates to lookup tables and flattened structures for fast access
- Consistent, versioned taxonomy for asset registration, validation, and sequential numbering

---

## Core Features & Requirements

### 1. Taxonomy Browsing, Editing, and JSON Management
- **Browse:**  
  - API endpoints to fetch the full taxonomy tree (nested) and/or flattened views (per layer, category, subcategory).
  - Support for filtering, searching, and traversing the taxonomy.
- **Edit:**  
  - Authenticated endpoints to add, update, or remove layers, categories, subcategories, and aliases.
  - All edits are validated for structure and uniqueness.
- **Update JSON:**  
  - On edit, the canonical taxonomy JSON file (e.g., `enriched_nna_layer_taxonomy_v1.3.json`) is updated and versioned.
  - Changes are auditable and reversible (history/versioning API).

### 2. Lookup Table Generation & Sync
- **Flattened Lookups:**  
  - After any edit, the service automatically generates and exposes flattened lookup tables for each layer (as used by the current frontend simple taxonomy service).
  - These lookups are available via fast API endpoints (e.g., `/api/taxonomy/lookup/:layer`).
- **Internal Organization:**  
  - The service maintains both the nested and flattened representations, ensuring both are always in sync.
  - Optionally, supports caching for high performance.

### 3. API for Frontend and Backend Consumption
- **Frontend:**  
  - Consumes the flattened lookup endpoints for fast dropdowns, search, and validation.
  - Can also browse and edit the taxonomy via the admin UI (using the service's API).
- **Backend:**  
  - Switches from reading the static `.json` file to consuming the same flattened lookup endpoints as the frontend.
  - Uses the canonical taxonomy for asset validation, registration, and sequential numbering.

### 4. Sequential Numbering Support
- **Asset Numbering:**  
  - The service provides an endpoint to get the next sequential number for a given (layer, category, subcategory) path.
  - Ensures uniqueness and atomicity, supporting both frontend and backend asset creation flows.

---

## Proposed API Endpoints

### Public Endpoints
- `GET /api/taxonomy/tree`  
  Returns the full nested taxonomy tree.
- `GET /api/taxonomy/lookup/:layer`  
  Returns the flattened lookup table for a given layer.
- `GET /api/taxonomy/version`  
  Returns the current taxonomy version and last update timestamp.

### Admin/Editor Endpoints
- `POST /api/taxonomy/edit`  
  Add, update, or remove taxonomy nodes (requires authentication).
- `GET /api/taxonomy/history`  
  List previous versions and changes.
- `POST /api/taxonomy/rollback`  
  Roll back to a previous version.

### Sequential Numbering
- `POST /api/taxonomy/next-sequence`  
  Request the next available asset number for a given taxonomy path.

---

## Data Model

- **Canonical JSON:**  
  - Nested, versioned, and always up-to-date.
- **Flattened Lookups:**  
  - Generated on every edit, available for each layer.
- **Versioning:**  
  - Every change creates a new version, with history and rollback support.

---

## Integration Plan

- **Frontend:**  
  - Switches to using the new service's lookup endpoints for all taxonomy-driven UI.
  - Uses admin endpoints for taxonomy management (if authorized).
- **Backend:**  
  - Switches from static `.json` file to the same lookup endpoints for validation and asset registration.
  - Uses the sequential numbering endpoint for asset creation.

---

## Security & Access Control
- **Public:**  
  - Browsing and lookup endpoints are public.
- **Admin:**  
  - Editing, versioning, and rollback endpoints require authentication and authorization.

---

## Benefits
- **Single Source of Truth:**  
  No more drift between frontend and backend taxonomy.
- **Real-Time Updates:**  
  All consumers see the latest taxonomy instantly.
- **Consistent Numbering:**  
  Sequential asset numbers are always unique and correct.
- **Easy Management:**  
  Admin UI and API for taxonomy curation.

---

## References from Project Workspace
- `docs/for-backend/taxonomy/enriched_nna_layer_taxonomy_v1.3.json` (canonical data)
- `docs/for-backend/code-artifacts/taxonomyService.ts` (backend logic)
- `docs/for-backend/api-examples/taxonomy-validation-examples.json` (validation)
- `docs/for-backend/SEQUENTIAL_NUMBERING_FIX.md` (numbering logic)

---

**This draft can be shared with the frontend team for implementation.** 