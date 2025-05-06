# NNA Registry Service Frontend: Implementation Plan

## Current State
- **Core infrastructure:** Dual addressing (HFN/MFA), taxonomy, training data, and layer selection are implemented.
- **Authentication:** JWT-based login and registration are in place.
- **Asset registration:** Basic UI and logic exist, but multi-step workflow and integration are incomplete.
- **Taxonomy and metadata:** Taxonomy service and data models are solid.

## Gaps
- No dashboard or dashboard route/component.
- Incomplete RegisterAssetPage integration (multi-step, validation, error handling).
- No composite asset handling (C layer).
- No special layer (P, R, C) support.
- Limited form validation and error handling.

## Next Steps
1. **Dashboard Implementation**
   - Scaffold a simplified dashboard (asset counts by layer, recent assets, quick actions).
   - Add navigation to registration, search, taxonomy.
   - Use reference repo as baseline, simplify for MVP.
2. **RegisterAssetPage Multi-Step Workflow**
   - Integrate all registration steps/components using React Hook Form.
   - Implement validation, error/loading states, and navigation.
3. **Special Layer Implementations (P, R, C)**
   - P layer: User selects base layer/type, special addressing.
   - Rights asset: Option in registration flow, with preview.
   - Composite asset: Multi-select grid/list for MVP, clear parent-child visualization.
4. **Testing & Documentation**
   - Create `TESTING.md` for manual/automated test cases.
   - Add code comments, especially for addressing and special layers.
5. **GitHub Workflow**
   - Work in `feature/dashboard-and-integration` branch.
   - Separate PRs for dashboard, registration, special layers.

## Implementation Order
1. Dashboard
2. RegisterAssetPage multi-step workflow
3. Special layers (P, R, C)
4. Polish, error handling, and documentation

---

*This plan will be updated as features are implemented and requirements evolve.* 