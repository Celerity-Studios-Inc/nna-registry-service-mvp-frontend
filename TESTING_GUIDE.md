# Testing Guide for Composite Assets

This guide provides comprehensive instructions for testing the composite assets feature implementation.

## Quick Test Commands

```bash
# Install dependencies (if not already done)
npm install

# Run all composite asset tests
npm test -- --testPathPattern="CompositeAssetSelection" --watchAll=false

# Run tests in watch mode for development
npm test CompositeAssetSelection

# Build the project to check for TypeScript errors
npm run build

# Start development server
npm start
```

## Test Categories

### 1. Unit Tests (Automated)

#### Test File: `src/components/__tests__/CompositeAssetSelection.test.tsx`

**Run command:**
```bash
npm test -- --testPathPattern="CompositeAssetSelection" --watchAll=false
```

**Expected Results:**
```
✅ generates correct composite HFN
✅ handles HTTP 409 for duplicate HFN  
✅ validates component compatibility correctly
✅ requires minimum 2 components for validation
✅ includes components metadata in registration payload
✅ generates preview in <2s
✅ logs warning for slow preview
✅ includes performance optimization headers in preview request

Test Suites: 1 passed, 1 total
Tests: 8 passed, 8 total
```

#### Individual Test Descriptions:

1. **Composite HFN Generation**
   - Tests correct format: `C.001.001.001:G.POP.TSW.001+S.POP.PNK.001`
   - Validates registration payload structure
   - Confirms component ID concatenation with `+` separator

2. **HTTP 409 Duplicate Handling**
   - Simulates backend HFN conflict response
   - Verifies error message display: "HFN conflict: A composite with this combination already exists"
   - Tests user notification via Material-UI Alert

3. **Component Compatibility Validation**
   - Tests rejection of incompatible layers (non-G,S,L,M,W,B,P)
   - Validates error message format
   - Confirms validation prevents registration

4. **Minimum Components Requirement**
   - Tests requirement for at least 2 components
   - Validates error message display
   - Confirms validation logic

5. **Metadata Inclusion**
   - Verifies registration payload includes components metadata
   - Tests component count and array format
   - Validates metadata structure

6. **Fast Preview Generation**
   - Tests preview generation under 2s target
   - Verifies no performance warnings logged
   - Confirms preview player appearance

7. **Slow Preview Warning**
   - Simulates 2.5s preview generation time
   - Tests performance warning logging
   - Validates console warning format

8. **Optimization Headers**
   - Tests inclusion of performance headers in API requests
   - Verifies optimization payload structure
   - Confirms target duration and fast mode settings

### 2. Integration Tests (Manual)

#### Prerequisites
1. Backend service running (mock or real)
2. Frontend development server running: `npm start`
3. Browser with developer tools open

#### Test Scenarios

#### Scenario A: Basic Composite Creation
1. **Navigate to composite creation page**
2. **Search for components**:
   - Enter search query in AssetSearch component
   - Filter by layer (G, S, L, M, W, B, P)
   - Verify 300ms debounce behavior
3. **Add components**:
   - Click on assets to add them
   - Verify they appear in "Selected Components" section
   - Check that component count updates
4. **Validate compatibility**:
   - Click "Validate" button
   - Verify validation passes for compatible components
   - Check that "Register" button appears

#### Scenario B: Validation Error Handling
1. **Test minimum components**:
   - Add only 1 component
   - Click "Validate"
   - Verify error: "Composite assets require at least 2 components"
2. **Test incompatible layers**:
   - Mock component with layer 'X' (if possible)
   - Add incompatible component
   - Verify layer compatibility error

#### Scenario C: Preview Generation
1. **Generate preview**:
   - Add 2+ compatible components
   - Click "Preview" button
   - Monitor browser console for performance logs
2. **Check performance logging**:
   ```
   Expected console output:
   "Starting preview generation for X components at [timestamp]"
   "Preview generation completed in XXXms for X components"
   "✅ Preview generation met performance target: XXXms < 2000ms"
   ```
3. **Verify preview display**:
   - Preview dialog should open
   - Video player should be visible with controls
   - Preview URL should load successfully

#### Scenario D: Registration Flow
1. **Complete registration**:
   - Add 2+ compatible components
   - Click "Validate" → "Register"
   - Monitor network requests in browser dev tools
2. **Verify registration payload**:
   ```json
   {
     "layer": "C",
     "category": "001", 
     "subcategory": "001",
     "components": "G.POP.TSW.001,S.POP.PNK.001",
     "metadata": {
       "components": ["G.POP.TSW.001", "S.POP.PNK.001"],
       "componentCount": 2
     }
   }
   ```

### 3. Performance Tests

#### Preview Generation Performance
1. **Setup monitoring**:
   - Open browser dev tools
   - Go to Console tab
   - Clear console logs
2. **Test fast preview**:
   - Generate preview with 2 components
   - Look for: `✅ Preview generation met performance target: XXXms < 2000ms`
3. **Test slow preview** (if backend supports delayed responses):
   - Generate preview with many components
   - Look for: `⚠️ Preview generation exceeded 2s target: XXXms`

#### Load Testing
1. **Multiple component selection**:
   - Add 10 components (maximum allowed)
   - Verify UI remains responsive
   - Check validation still works
2. **Search performance**:
   - Type rapidly in search box
   - Verify debouncing prevents excessive API calls
   - Check for search result accuracy

### 4. Error Scenario Tests

#### Network Error Handling
1. **Simulate network failure**:
   - Disconnect internet or block API endpoints
   - Try component search → should show appropriate error
   - Try registration → should show network error
2. **Simulate backend errors**:
   - Mock 500 server error
   - Verify error handling and user feedback

#### Duplicate HFN Testing
1. **Test HFN conflict**:
   - If using real backend, create composite
   - Try creating identical composite again
   - Verify HTTP 409 error handling
   - Check error message: "HFN conflict: A composite with this combination already exists"

## Browser Testing

### Supported Browsers
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Mobile Testing
1. **Responsive design**:
   - Test on mobile viewport (375px width)
   - Verify component grid layouts
   - Check touch interactions

2. **Performance on mobile**:
   - Monitor preview generation times
   - Check for memory issues with large component lists

## Debugging Tips

### Common Issues and Solutions

1. **Tests failing with "Component not found"**:
   ```bash
   # Clear test cache
   npm test -- --clearCache
   # Reinstall dependencies
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Performance warnings not appearing**:
   - Check console logging is enabled
   - Verify performance.now() is available
   - Check test timeout settings

3. **Mock API not working**:
   - Verify axios mocking in test setup
   - Check mock implementation matches actual API calls
   - Ensure beforeEach cleanup is working

### Debug Commands

```bash
# Run tests with verbose output
npm test -- --testPathPattern="CompositeAssetSelection" --verbose

# Run tests with coverage
npm test -- --testPathPattern="CompositeAssetSelection" --coverage --watchAll=false

# Debug specific test
npm test -- --testPathPattern="CompositeAssetSelection" -t "generates correct composite HFN"
```

### Console Debugging

Add these lines to component for debugging:
```typescript
console.log('Selected components:', selectedComponents);
console.log('Validation errors:', validationErrors);
console.log('Registration state:', { registering, registrationError });
```

## Continuous Integration

### GitHub Actions Testing
The project includes automated testing in CI/CD pipeline:

```yaml
# Runs automatically on push/PR
- name: Run Tests
  run: npm test -- --testPathPattern="CompositeAssetSelection" --watchAll=false --coverage
```

### Pre-commit Testing
Before committing changes, run:
```bash
# Run all tests
npm test -- --watchAll=false

# Check build
npm run build

# Check linting
npm run lint
```

## Test Data

### Mock Assets for Testing
```typescript
const mockAssets = [
  {
    id: 'asset-1',
    name: 'G.POP.TSW.001',
    layer: 'G', // Song
    friendlyName: 'G.POP.TSW.001'
  },
  {
    id: 'asset-2',
    name: 'S.POP.PNK.001', 
    layer: 'S', // Star
    friendlyName: 'S.POP.PNK.001'
  }
];
```

### Expected Test Outputs
- **HFN Format**: `C.001.001.001:G.POP.TSW.001+S.POP.PNK.001`
- **Component Count**: 2
- **Validation**: Should pass for G,S,L,M,W,B,P layers
- **Performance**: Preview generation <2s target

## Reporting Issues

When reporting test failures or bugs:

1. **Include test output**:
   ```bash
   npm test -- --testPathPattern="CompositeAssetSelection" --verbose > test-output.log 2>&1
   ```

2. **Browser console logs**:
   - Copy any error messages from browser console
   - Include performance timing logs

3. **Environment details**:
   - Node.js version: `node --version`
   - npm version: `npm --version`
   - Operating system
   - Browser version

4. **Steps to reproduce**:
   - Exact steps that cause the issue
   - Expected vs actual behavior
   - Any error messages or screenshots

## Next Steps

After testing passes:
1. **Deploy to staging environment**
2. **Run end-to-end tests with real backend**
3. **Performance testing with production data**
4. **User acceptance testing**