# NNA Registry Service Testing Guide

This document outlines the testing strategy, critical test cases, performance testing approaches, and troubleshooting guidance for the NNA Registry Service frontend application.

## Table of Contents

- [Testing Strategy](#testing-strategy)
- [Test Environment Setup](#test-environment-setup)
- [Critical Test Cases](#critical-test-cases)
- [Unit Testing](#unit-testing)
- [Integration Testing](#integration-testing)
- [End-to-End Testing](#end-to-end-testing)
- [Performance Testing](#performance-testing)
- [Accessibility Testing](#accessibility-testing)
- [Troubleshooting Guide](#troubleshooting-guide)
- [Regression Testing](#regression-testing)

## Testing Strategy

The NNA Registry Service follows a comprehensive testing strategy incorporating multiple testing types:

### Overall Approach

1. **Unit Testing**: Individual components and functions
2. **Integration Testing**: Component interactions and data flow
3. **End-to-End Testing**: Complete user workflows
4. **Performance Testing**: System performance under various conditions
5. **Accessibility Testing**: Compliance with accessibility standards

### Test Priority Principles

Tests are prioritized based on the following principles:

1. **High Business Impact**: Features that are critical to business operations
2. **High Usage**: Frequently used features
3. **Complex Logic**: Areas with complex business logic
4. **Known Issue Areas**: Areas where issues have been identified previously

### Continuous Testing

Tests are integrated into the development workflow through:

1. **Pre-commit Hooks**: Run essential tests before commits
2. **CI/CD Pipeline**: Automated test execution in GitHub Actions
3. **Scheduled Regression Tests**: Periodic comprehensive testing

## Test Environment Setup

### Local Development Environment

```bash
# Install dependencies
npm install

# Run unit tests
npm test

# Run integration tests
npm run test:integration

# Run specific test file
npm test -- --testPathPattern="path/to/test"

# Run tests in watch mode
npm test -- --watch
```

### Testing Configuration

The application uses the following tools for testing:

- **Jest**: Test runner and assertion library
- **React Testing Library**: Component testing
- **Mock Service Worker (MSW)**: API mocking
- **jest-axe**: Accessibility testing

Configuration files:

- `jest.config.js`: Jest configuration
- `src/setupTests.ts`: Test setup and global mocks
- `src/__mocks__/`: Mock implementations

## Critical Test Cases

The following test cases are critical to verify the core functionality of the application:

### 1. Taxonomy Selection Tests

| Test Case | Steps | Expected Outcome | Importance |
|-----------|-------|------------------|------------|
| Layer selection displays correct categories | 1. Load asset registration page<br>2. Select a layer (e.g., S) | Categories for selected layer (e.g., POP, HIP, etc.) are displayed | Critical |
| Category selection displays correct subcategories | 1. Select a layer (e.g., S)<br>2. Select a category (e.g., POP) | Subcategories for selected category (e.g., BAS, HPM, etc.) are displayed | Critical |
| S.POP.HPM selection works correctly | 1. Select S layer<br>2. Select POP category<br>3. Select HPM subcategory | HPM subcategory is selected without errors<br>Correct HFN/MFA generated | Critical |
| W.BCH.SUN selection works correctly | 1. Select W layer<br>2. Select BCH category<br>3. Select SUN subcategory | SUN subcategory is selected without errors<br>Correct HFN/MFA generated | Critical |
| Rapid layer switching | 1. Select layer S<br>2. Immediately select layer G<br>3. Immediately select layer L | Each layer change displays correct categories<br>No UI errors or flashing<br>No React Error #301 | High |
| Double-click navigation | 1. Double-click a layer<br>2. Double-click a category<br>3. Double-click a subcategory | Navigation advances correctly<br>Selections are preserved<br>No steps are skipped | High |

### 2. Asset Registration Tests

| Test Case | Steps | Expected Outcome | Importance |
|-----------|-------|------------------|------------|
| Complete asset registration flow | 1. Select taxonomy (layer, category, subcategory)<br>2. Upload file<br>3. Enter metadata<br>4. Submit | Asset is created successfully<br>Confirmation displayed<br>Correct HFN/MFA shown | Critical |
| File upload validation | 1. Select a layer (e.g., G - Songs)<br>2. Attempt to upload an image file | Error message indicates incorrect file type<br>Upload is rejected | High |
| Large file upload | 1. Select any layer<br>2. Attempt to upload a file larger than 100MB | Error message indicates file is too large<br>Upload is rejected | Medium |
| Form validation | 1. Leave required fields empty<br>2. Enter invalid data in fields<br>3. Attempt to submit | Validation errors displayed<br>Form submission prevented | High |
| Address generation | 1. Complete taxonomy selection<br>2. Verify HFN and MFA formats | HFN format: Layer.Category.Subcategory.SequentialNumber<br>MFA format: NumericCode.NumericCode.NumericCode.SequentialNumber | Critical |

### 3. Error Handling Tests

| Test Case | Steps | Expected Outcome | Importance |
|-----------|-------|------------------|------------|
| API error handling | 1. Trigger API error (e.g., disconnect network)<br>2. Attempt to load taxonomy data | Error message displayed<br>Retry option provided<br>Application doesn't crash | High |
| React component error boundary | 1. Inject error into component<br>2. Render component | Error boundary catches error<br>Fallback UI displayed<br>Application doesn't crash | Medium |
| Form submission error | 1. Set up API to return error<br>2. Submit asset registration form | Error message displayed<br>Form data preserved<br>User can retry | Medium |
| Invalid taxonomy combination | 1. Select non-existent taxonomy combination | Graceful error handling<br>User guidance provided | Medium |

### 4. Performance Tests

| Test Case | Steps | Expected Outcome | Importance |
|-----------|-------|------------------|------------|
| Initial load performance | 1. Load application with empty cache<br>2. Measure time to interactive | Time to interactive < 3 seconds | Medium |
| Taxonomy data loading | 1. Load application<br>2. Measure time to display taxonomy options | Taxonomy data loads < 2 seconds | Medium |
| Component rendering | 1. Use React Profiler<br>2. Monitor render counts during interactions | Components render efficiently<br>No unnecessary re-renders | Medium |
| Memory usage | 1. Monitor memory usage during extended use<br>2. Check for memory leaks | Memory usage remains stable<br>No significant growth over time | Medium |

## Unit Testing

Unit tests focus on testing individual components and functions in isolation:

### Component Testing Example

```tsx
// TaxonomyItem.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TaxonomyItem from '../TaxonomyItem';

describe('TaxonomyItem', () => {
  const mockItem = {
    code: 'TEST',
    name: 'Test Item',
    numericCode: '123'
  };
  
  const mockOnClick = jest.fn();
  const mockOnDoubleClick = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('renders correctly with provided props', () => {
    render(
      <TaxonomyItem
        item={mockItem}
        isActive={false}
        onClick={mockOnClick}
        onDoubleClick={mockOnDoubleClick}
        dataTestId="test-item"
      />
    );
    
    expect(screen.getByTestId('test-item')).toBeInTheDocument();
    expect(screen.getByText('TEST')).toBeInTheDocument();
    expect(screen.getByText('Test Item')).toBeInTheDocument();
    expect(screen.getByText('123')).toBeInTheDocument();
  });
  
  test('applies active class when isActive is true', () => {
    const { container } = render(
      <TaxonomyItem
        item={mockItem}
        isActive={true}
        onClick={mockOnClick}
        onDoubleClick={mockOnDoubleClick}
        dataTestId="test-item"
      />
    );
    
    expect(container.querySelector('.active')).toBeInTheDocument();
  });
  
  test('calls onClick when clicked', () => {
    render(
      <TaxonomyItem
        item={mockItem}
        isActive={false}
        onClick={mockOnClick}
        onDoubleClick={mockOnDoubleClick}
        dataTestId="test-item"
      />
    );
    
    fireEvent.click(screen.getByTestId('test-item'));
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });
  
  test('calls onDoubleClick when double-clicked', () => {
    render(
      <TaxonomyItem
        item={mockItem}
        isActive={false}
        onClick={mockOnClick}
        onDoubleClick={mockOnDoubleClick}
        dataTestId="test-item"
      />
    );
    
    fireEvent.doubleClick(screen.getByTestId('test-item'));
    expect(mockOnDoubleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Utility Function Testing Example

```tsx
// taxonomyFormatter.test.ts
import { formatHFN, formatMFA, convertHFNtoMFA } from '../taxonomyFormatter';
import { mockTaxonomyData } from '../../__mocks__/taxonomyData';

describe('taxonomyFormatter', () => {
  test('formatHFN formats correctly', () => {
    expect(formatHFN('S', 'POP', 'HPM', '1')).toBe('S.POP.HPM.001');
    expect(formatHFN('G', 'HIP', 'BAS', '42')).toBe('G.HIP.BAS.042');
    expect(formatHFN('W', 'BCH', 'SUN', '123')).toBe('W.BCH.SUN.123');
  });
  
  test('formatMFA formats correctly', () => {
    expect(formatMFA('2', '004', '003', '1')).toBe('2.004.003.001');
    expect(formatMFA('1', '002', '001', '42')).toBe('1.002.001.042');
    expect(formatMFA('5', '004', '003', '123')).toBe('5.004.003.123');
  });
  
  test('convertHFNtoMFA converts correctly', () => {
    expect(convertHFNtoMFA('S.POP.HPM.001', mockTaxonomyData)).toBe('2.004.003.001');
    expect(convertHFNtoMFA('G.HIP.BAS.042', mockTaxonomyData)).toBe('1.002.001.042');
    expect(convertHFNtoMFA('W.BCH.SUN.123', mockTaxonomyData)).toBe('5.004.003.123');
  });
  
  test('convertHFNtoMFA handles special cases', () => {
    // S.POP.HPM is a special case mapping
    expect(convertHFNtoMFA('S.POP.HPM.001', mockTaxonomyData)).toBe('2.004.003.001');
    // W.BCH.SUN is a special case mapping
    expect(convertHFNtoMFA('W.BCH.SUN.001', mockTaxonomyData)).toBe('5.004.003.001');
  });
  
  test('convertHFNtoMFA throws error for invalid HFN', () => {
    expect(() => convertHFNtoMFA('S.INVALID.HPM.001', mockTaxonomyData)).toThrow('Invalid HFN');
  });
});
```

### Mock Example

```tsx
// __mocks__/taxonomyData.ts
export const mockTaxonomyData = {
  layers: {
    'G': {
      code: 'G',
      name: 'Songs',
      numericCode: '1',
      categories: {
        'HIP': {
          code: 'HIP',
          name: 'Hip Hop',
          numericCode: '002',
          subcategories: {
            'BAS': {
              code: 'BAS',
              name: 'Base',
              numericCode: '001'
            }
          }
        }
      }
    },
    'S': {
      code: 'S',
      name: 'Stars',
      numericCode: '2',
      categories: {
        'POP': {
          code: 'POP',
          name: 'Pop',
          numericCode: '004',
          subcategories: {
            'HPM': {
              code: 'HPM',
              name: 'Hipster Male',
              numericCode: '003'
            }
          }
        }
      }
    },
    'W': {
      code: 'W',
      name: 'Worlds',
      numericCode: '5',
      categories: {
        'BCH': {
          code: 'BCH',
          name: 'Beach',
          numericCode: '004',
          subcategories: {
            'SUN': {
              code: 'SUN',
              name: 'Sunny',
              numericCode: '003'
            }
          }
        }
      }
    }
  },
  mappings: {
    hfnToMfa: {
      'S.POP.HPM.001': '2.004.003.001',
      'W.BCH.SUN.001': '5.004.003.001'
    },
    mfaToHfn: {
      '2.004.003.001': 'S.POP.HPM.001',
      '5.004.003.001': 'W.BCH.SUN.001'
    }
  }
};
```

## Integration Testing

Integration tests focus on testing how components interact with each other:

### Component Integration Example

```tsx
// TaxonomySelector.integration.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TaxonomyProvider } from '../../contexts/TaxonomyContext';
import TaxonomySelector from '../TaxonomySelector';
import { mockTaxonomyData } from '../../__mocks__/taxonomyData';

// Mock the useTaxonomyData hook
jest.mock('../../hooks/useTaxonomyData', () => ({
  useTaxonomyData: () => ({
    taxonomyData: mockTaxonomyData,
    loadingState: 'loaded',
    error: null,
    getCategories: (layer) => {
      return Object.entries(mockTaxonomyData.layers[layer]?.categories || {}).map(
        ([code, category]) => ({
          code,
          name: category.name,
          numericCode: category.numericCode
        })
      );
    },
    getSubcategories: (layer, category) => {
      return Object.entries(
        mockTaxonomyData.layers[layer]?.categories[category]?.subcategories || {}
      ).map(([code, subcategory]) => ({
        code,
        name: subcategory.name,
        numericCode: subcategory.numericCode
      }));
    },
    refreshTaxonomyData: jest.fn()
  })
}));

describe('TaxonomySelector Integration', () => {
  const mockOnLayerSelect = jest.fn();
  const mockOnCategorySelect = jest.fn();
  const mockOnSubcategorySelect = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('user can select layer, category, and subcategory', async () => {
    render(
      <TaxonomyProvider>
        <TaxonomySelector
          selectedLayer=""
          selectedCategory=""
          selectedSubcategory=""
          onLayerSelect={mockOnLayerSelect}
          onCategorySelect={mockOnCategorySelect}
          onSubcategorySelect={mockOnSubcategorySelect}
        />
      </TaxonomyProvider>
    );
    
    // Select layer
    const layerItem = screen.getByText('S');
    fireEvent.click(layerItem);
    expect(mockOnLayerSelect).toHaveBeenCalledWith('S');
    
    // Simulate layer selection update
    render(
      <TaxonomyProvider>
        <TaxonomySelector
          selectedLayer="S"
          selectedCategory=""
          selectedSubcategory=""
          onLayerSelect={mockOnLayerSelect}
          onCategorySelect={mockOnCategorySelect}
          onSubcategorySelect={mockOnSubcategorySelect}
        />
      </TaxonomyProvider>
    );
    
    // Select category
    const categoryItem = await screen.findByText('POP');
    fireEvent.click(categoryItem);
    expect(mockOnCategorySelect).toHaveBeenCalledWith('POP');
    
    // Simulate category selection update
    render(
      <TaxonomyProvider>
        <TaxonomySelector
          selectedLayer="S"
          selectedCategory="POP"
          selectedSubcategory=""
          onLayerSelect={mockOnLayerSelect}
          onCategorySelect={mockOnCategorySelect}
          onSubcategorySelect={mockOnSubcategorySelect}
        />
      </TaxonomyProvider>
    );
    
    // Select subcategory
    const subcategoryItem = await screen.findByText('HPM');
    fireEvent.click(subcategoryItem);
    expect(mockOnSubcategorySelect).toHaveBeenCalledWith('HPM', false);
  });
  
  test('handles S.POP.HPM selection correctly', async () => {
    // Similar to above test but focused on S.POP.HPM
    // Implementation details...
  });
  
  test('taxonomy selection sequence updates UI correctly', async () => {
    // Testing the entire flow with UI updates
    // Implementation details...
  });
});
```

### API Integration Example

```tsx
// assetService.integration.test.ts
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { assetService } from '../assetService';

// Mock server
const server = setupServer(
  rest.get('/api/assets', (req, res, ctx) => {
    return res(ctx.json([
      {
        id: '123',
        name: 'Test Asset',
        hfn: 'S.POP.HPM.001',
        mfa: '2.004.003.001',
        // Other asset properties
      }
    ]));
  }),
  
  rest.get('/api/assets/:id', (req, res, ctx) => {
    const { id } = req.params;
    return res(ctx.json({
      id,
      name: 'Test Asset',
      hfn: 'S.POP.HPM.001',
      mfa: '2.004.003.001',
      // Other asset properties
    }));
  }),
  
  rest.post('/api/assets', (req, res, ctx) => {
    return res(ctx.status(201), ctx.json({
      id: '456',
      name: 'New Asset',
      hfn: 'G.HIP.BAS.001',
      mfa: '1.002.001.001',
      // Other asset properties
    }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('assetService Integration', () => {
  test('getAssets fetches assets correctly', async () => {
    const assets = await assetService.getAssets();
    expect(assets).toHaveLength(1);
    expect(assets[0].id).toBe('123');
    expect(assets[0].hfn).toBe('S.POP.HPM.001');
    expect(assets[0].mfa).toBe('2.004.003.001');
  });
  
  test('getAssetById fetches asset by ID correctly', async () => {
    const asset = await assetService.getAssetById('123');
    expect(asset.id).toBe('123');
    expect(asset.hfn).toBe('S.POP.HPM.001');
    expect(asset.mfa).toBe('2.004.003.001');
  });
  
  test('createAsset creates new asset correctly', async () => {
    // Create FormData mock for file upload
    const formData = {
      layer: 'G',
      category: 'HIP',
      subcategory: 'BAS',
      metadata: {
        name: 'New Asset',
        description: 'Test Description'
      },
      files: [new File(['test'], 'test.mp3', { type: 'audio/mpeg' })]
    };
    
    const asset = await assetService.createAsset(formData);
    expect(asset.id).toBe('456');
    expect(asset.hfn).toBe('G.HIP.BAS.001');
    expect(asset.mfa).toBe('1.002.001.001');
  });
  
  test('handles API errors correctly', async () => {
    // Override handler to return error
    server.use(
      rest.get('/api/assets', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ message: 'Server error' }));
      })
    );
    
    await expect(assetService.getAssets()).rejects.toThrow('Server error');
  });
});
```

## End-to-End Testing

End-to-end tests simulate user workflows through the entire application:

### Asset Registration E2E Test Script

```tsx
// registerAsset.e2e.test.js
describe('Asset Registration E2E', () => {
  beforeEach(async () => {
    // Navigate to the registration page
    await page.goto('http://localhost:3000/register');
    
    // Wait for the page to load
    await page.waitForSelector('[data-testid="layer-grid"]');
  });
  
  test('complete asset registration flow', async () => {
    // Step 1: Select taxonomy
    await page.click('[data-testid="layer-S"]');
    await page.waitForSelector('[data-testid="category-grid"]');
    
    await page.click('[data-testid="category-POP"]');
    await page.waitForSelector('[data-testid="subcategory-grid"]');
    
    await page.click('[data-testid="subcategory-HPM"]');
    await page.click('[data-testid="next-button"]');
    
    // Step 2: Upload file
    await page.waitForSelector('[data-testid="file-upload"]');
    const fileInput = await page.$('input[type="file"]');
    await fileInput.uploadFile('./test-assets/test-image.jpg');
    
    // Wait for file to upload
    await page.waitForSelector('[data-testid="file-preview"]');
    await page.click('[data-testid="next-button"]');
    
    // Step 3: Enter metadata
    await page.waitForSelector('[data-testid="metadata-form"]');
    await page.type('[data-testid="input-title"]', 'Test Asset Title');
    await page.type('[data-testid="input-description"]', 'Test Asset Description');
    await page.select('[data-testid="input-source"]', 'ReViz');
    await page.click('[data-testid="next-button"]');
    
    // Step 4: Review and submit
    await page.waitForSelector('[data-testid="review-submit"]');
    
    // Verify HFN and MFA
    const hfnElement = await page.$('[data-testid="hfn-display"]');
    const hfnText = await page.evaluate(el => el.textContent, hfnElement);
    expect(hfnText).toContain('S.POP.HPM');
    
    const mfaElement = await page.$('[data-testid="mfa-display"]');
    const mfaText = await page.evaluate(el => el.textContent, mfaElement);
    expect(mfaText).toContain('2.004.003');
    
    // Submit the form
    await page.click('[data-testid="submit-button"]');
    
    // Verify success message
    await page.waitForSelector('[data-testid="success-message"]');
    const successMessage = await page.$('[data-testid="success-message"]');
    const successText = await page.evaluate(el => el.textContent, successMessage);
    expect(successText).toContain('Asset successfully registered');
  });
  
  test('validates required fields', async () => {
    // Navigate through steps without entering required data
    // Implementation details...
  });
  
  test('handles file type validation', async () => {
    // Test file type validation
    // Implementation details...
  });
});
```

## Performance Testing

Performance testing focuses on measuring and optimizing application performance:

### React Profiler Testing

```tsx
// Component render performance test
import React, { Profiler } from 'react';
import { render } from '@testing-library/react';
import TaxonomySelector from '../TaxonomySelector';

// Profiler callback
const onRenderCallback = (
  id, // the "id" prop of the Profiler tree that has just committed
  phase, // either "mount" (if the tree just mounted) or "update" (if it re-rendered)
  actualDuration, // time spent rendering the committed update
  baseDuration, // estimated time to render the entire subtree without memoization
  startTime, // when React began rendering this update
  commitTime, // when React committed this update
  interactions // the Set of interactions belonging to this update
) => {
  console.log(`Profiler: ${id} - ${phase}`);
  console.log(`Actual Duration: ${actualDuration}ms`);
  console.log(`Base Duration: ${baseDuration}ms`);
  
  // Store measurements for analysis
  performance.mark(`${id}-${phase}-end`);
  performance.measure(
    `${id}-${phase}`,
    `${id}-${phase}-start`,
    `${id}-${phase}-end`
  );
};

describe('Performance Tests', () => {
  beforeEach(() => {
    // Clear performance entries
    performance.clearMarks();
    performance.clearMeasures();
  });
  
  test('TaxonomySelector renders efficiently', () => {
    performance.mark('TaxonomySelector-mount-start');
    
    render(
      <Profiler id="TaxonomySelector" onRender={onRenderCallback}>
        <TaxonomySelector
          selectedLayer=""
          selectedCategory=""
          selectedSubcategory=""
          onLayerSelect={() => {}}
          onCategorySelect={() => {}}
          onSubcategorySelect={() => {}}
        />
      </Profiler>
    );
    
    // Get performance measurement
    const measurements = performance.getEntriesByType('measure');
    const mountTime = measurements.find(m => m.name === 'TaxonomySelector-mount');
    
    // Assert render performance is within acceptable range
    expect(mountTime.duration).toBeLessThan(100);
  });
  
  test('TaxonomySelector re-renders efficiently when props change', () => {
    // Implementation details...
  });
});
```

### Lighthouse Performance Testing

```js
// Lighthouse performance test script
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');

async function runLighthouseTest() {
  // Launch Chrome
  const chrome = await chromeLauncher.launch({
    chromeFlags: ['--headless']
  });
  
  // Run Lighthouse
  const options = {
    port: chrome.port,
    onlyCategories: ['performance'],
    formFactor: 'desktop',
    throttling: {
      cpuSlowdownMultiplier: 1
    }
  };
  
  const results = await lighthouse('http://localhost:3000', options);
  
  // Log results
  console.log('Performance score:', results.lhr.categories.performance.score * 100);
  
  // Log specific metrics
  console.log('First Contentful Paint:', results.lhr.audits['first-contentful-paint'].displayValue);
  console.log('Time to Interactive:', results.lhr.audits['interactive'].displayValue);
  console.log('Total Blocking Time:', results.lhr.audits['total-blocking-time'].displayValue);
  
  // Close Chrome
  await chrome.kill();
  
  return results;
}

runLighthouseTest();
```

## Accessibility Testing

### Automated Accessibility Testing

```tsx
// Accessibility test example
import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import TaxonomySelector from '../TaxonomySelector';

// Add custom matcher
expect.extend(toHaveNoViolations);

describe('Accessibility Tests', () => {
  test('TaxonomySelector has no accessibility violations', async () => {
    const { container } = render(
      <TaxonomySelector
        selectedLayer=""
        selectedCategory=""
        selectedSubcategory=""
        onLayerSelect={() => {}}
        onCategorySelect={() => {}}
        onSubcategorySelect={() => {}}
      />
    );
    
    // Run axe
    const results = await axe(container);
    
    // Assert no violations
    expect(results).toHaveNoViolations();
  });
  
  test('FileUpload has no accessibility violations', async () => {
    // Implementation details...
  });
});
```

## Troubleshooting Guide

### Common Issues and Solutions

| Issue | Symptoms | Possible Causes | Solutions |
|-------|----------|-----------------|-----------|
| Taxonomy selection not displaying categories | Categories don't appear after selecting a layer | 1. API error fetching taxonomy data<br>2. Race condition in state updates<br>3. Component unmounted during async operation | 1. Check API response in Network tab<br>2. Add console logs to track state changes<br>3. Use isMountedRef to prevent updates after unmount |
| S.POP.HPM selection causing React Error #301 | Console error: "Cannot update a component while rendering a different component" | 1. State updates during render<br>2. Multiple overlapping state updates<br>3. Missing useCallback dependencies | 1. Move state updates to useEffect<br>2. Add debounce to state updates<br>3. Fix useCallback dependency arrays |
| Invalid HFN/MFA generation | Wrong format or missing parts in HFN/MFA | 1. Missing taxonomy data<br>2. Error in formatHFN/formatMFA functions<br>3. Invalid taxonomy selection | 1. Verify taxonomy data is loaded correctly<br>2. Check formatter functions<br>3. Verify layer/category/subcategory selections |
| File upload failing | Upload starts but fails to complete | 1. File too large<br>2. Invalid file type<br>3. Network error<br>4. Server error | 1. Check file size restrictions<br>2. Verify file type is accepted<br>3. Check network connectivity<br>4. Check server logs |
| Form validation errors | Form cannot be submitted despite valid data | 1. Hidden validation errors<br>2. Form state not updating<br>3. React Hook Form errors | 1. Check all validation messages<br>2. Verify form state with React DevTools<br>3. Check React Hook Form configuration |

### Debugging Tools

1. **React DevTools**:
   - Component inspection
   - Props and state monitoring
   - Performance profiling

2. **Browser DevTools**:
   - Network requests monitoring
   - Console error logging
   - Memory profiling

3. **Custom Logging**:
   - Use debugLog utility for development-only logging
   - Use logger.taxonomy/logger.ui for structured logging
   - Enable verbose logging with localStorage.debug = 'true'

### Debugging Workflows

#### Taxonomy Selection Issues

```
1. Enable detailed logging:
   - localStorage.setItem('debug', 'true')
   - Reload the page

2. Monitor component renders:
   - Add console.log in render functions
   - Check for excessive re-renders

3. Track state changes:
   - Add console.log in state update functions
   - Verify state updates are occurring as expected

4. Verify API responses:
   - Check Network tab for taxonomy data requests
   - Verify response contains expected data

5. Test alternative taxonomy selections:
   - Try different layer/category/subcategory combinations
   - Compare behavior with known working combinations
```

#### Component Error Debugging

```
1. Identify error source:
   - Check console for error message and stack trace
   - Look for component name in error message

2. Check component props:
   - Use React DevTools to inspect component props
   - Verify props are correctly passed down

3. Review component lifecycle:
   - Add console.log in useEffect hooks
   - Verify component mounts/unmounts as expected

4. Test with simplified props:
   - Render component with minimal props
   - Add props incrementally to identify problematic prop

5. Review error boundary:
   - Check if error boundary is catching the error
   - Verify fallback UI is displayed correctly
```

## Regression Testing

### Automated Regression Suite

The critical test cases are automated and run as part of the CI/CD pipeline:

```yml
# .github/workflows/regression-tests.yml
name: Regression Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 0 * * 0'  # Run weekly

jobs:
  regression:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm run test:regression
        
      - name: Run critical test cases
        run: npm run test:critical
```

### Manual Regression Testing Checklist

For major releases, perform the following manual regression tests:

1. **Taxonomy Selection**:
   - [ ] Verify all layers display correctly
   - [ ] Verify categories display for each layer
   - [ ] Verify subcategories display for each category
   - [ ] Test S.POP.HPM selection specifically
   - [ ] Test W.BCH.SUN selection specifically
   - [ ] Test rapid layer switching

2. **File Upload**:
   - [ ] Verify file size validation
   - [ ] Verify file type validation
   - [ ] Test upload progress indicator
   - [ ] Test file preview functionality
   - [ ] Verify multi-file upload for supported layers

3. **Asset Registration**:
   - [ ] Complete full registration flow
   - [ ] Verify form validation
   - [ ] Check HFN/MFA generation
   - [ ] Verify submission and confirmation
   - [ ] Test error handling during submission

4. **Performance**:
   - [ ] Check initial load time
   - [ ] Verify UI responsiveness during interactions
   - [ ] Test with large taxonomy data sets
   - [ ] Verify memory usage remains stable

### Visual Regression Testing

For UI changes, use visual regression testing to ensure visual consistency:

```js
// Example using jest-image-snapshot
const puppeteer = require('puppeteer');
const { toMatchImageSnapshot } = require('jest-image-snapshot');

expect.extend({ toMatchImageSnapshot });

describe('Visual Regression Tests', () => {
  let browser;
  let page;
  
  beforeAll(async () => {
    browser = await puppeteer.launch();
    page = await browser.newPage();
  });
  
  afterAll(async () => {
    await browser.close();
  });
  
  test('TaxonomySelector visual regression', async () => {
    await page.goto('http://localhost:3000/register');
    await page.waitForSelector('[data-testid="layer-grid"]');
    
    const screenshot = await page.screenshot();
    expect(screenshot).toMatchImageSnapshot();
  });
  
  test('FileUpload visual regression', async () => {
    // Implementation details...
  });
});
```

This comprehensive testing guide provides a detailed approach to testing the NNA Registry Service frontend application, ensuring its functionality, performance, and reliability.