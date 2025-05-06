# NNA Registry Service Frontend: Testing Plan

## Manual Test Cases

### Dashboard
- [ ] Dashboard loads for authenticated users
- [ ] Asset counts by layer are displayed
- [ ] Recent assets are listed
- [ ] Quick actions navigate to registration, search, taxonomy
- [ ] Unauthenticated users are redirected to login

### RegisterAssetPage
- [ ] Multi-step form navigation works (next, back)
- [ ] Layer/category/subcategory selection updates preview
- [ ] File upload works for supported types
- [ ] Form validation errors are shown for missing/invalid fields
- [ ] Successful registration redirects to dashboard or confirmation

### Special Layers
- [ ] P layer: User can select base layer/type, preview HFN/MFA
- [ ] Rights asset: Option to generate, preview is shown
- [ ] Composite asset: Multi-select grid/list, parent-child relationships clear

### Error Handling
- [ ] API/network errors show user-friendly messages
- [ ] Loading states are shown during API calls
- [ ] Error boundaries catch component-level errors

## Automated Tests (to be expanded)
- [ ] Unit tests for addressing logic (HFN/MFA, P layer)
- [ ] Integration tests for registration workflow
- [ ] Component tests for dashboard and asset registration

---

*Update this file as new features and test cases are added.* 