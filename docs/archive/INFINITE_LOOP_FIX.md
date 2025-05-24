# Fix for Infinite Loop Issue in Asset Registration

## Issue Analysis

The application is currently experiencing an infinite loop in the RegisterAssetPage and SimpleTaxonomySelectionV2 components. The logs show repeated cycles of:

1. "Direct navigation to Register Asset - clearing stored data"
2. "SimpleTaxonomySelectionV2: Setting layer to S"
3. "Loaded 16 categories for layer S"

Then the cycle repeats endlessly.

## Root Causes

1. **Cyclical State Updates**: The components are triggering state updates that cause re-renders, which in turn trigger more state updates.

2. **Invalid sessionStorage Access**: The "Direct navigation to Register Asset" log comes from RegisterAssetPage.tsx:163, which is checking and setting sessionStorage on every render.

3. **Multi-way Data Flow**: The layer state is being managed in multiple places (RegisterAssetPage, SimpleTaxonomySelectionV2, and the useTaxonomy hook), creating a circular dependency.

4. **Redundant Taxonomy Initialization**: The AssetRegistrationWrapper initializes useTaxonomy but doesn't pass it to children, causing duplicate instances.

## Implemented Fixes

### 1. Fix in SimpleTaxonomySelectionV2.tsx

```typescript
// BEFORE: This created a circular dependency
useEffect(() => {
  if (selectedCategory && selectedCategory !== activeCategory) {
    setActiveCategory(selectedCategory);
    selectCategory(selectedCategory); // Calls parent, which updates props, causing re-render
  }
}, [selectedCategory, activeCategory, selectCategory]);

// AFTER: Only update internal state, don't call parent callbacks in response to prop changes
useEffect(() => {
  if (selectedCategory && selectedCategory !== activeCategory) {
    setActiveCategory(selectedCategory);
    // Removed selectCategory call to break circular dependency
  }
}, [selectedCategory, activeCategory]);

// BEFORE: Handler didn't check for duplicate selections
const handleCategorySelect = (category: string) => {
  setActiveCategory(category);
  selectCategory(category);
  onCategorySelect(category);
};

// AFTER: Added check to prevent unnecessary updates
const handleCategorySelect = (category: string) => {
  if (category === activeCategory) return; // Prevent duplicate selections
  setActiveCategory(category);
  selectCategory(category);
  onCategorySelect(category);
};
```

### 2. Fix in RegisterAssetPage.tsx

```typescript
// BEFORE: This ran on every render
const getStoredAssetData = () => {
  // Only keep stored asset data if navigation is from success page
  const referrer = document.referrer;
  const isFromSuccessPage = referrer?.includes('register-asset') &&
                          window.sessionStorage.getItem('directNavigation') !== 'true';

  if (!isFromSuccessPage) {
    window.sessionStorage.removeItem('showSuccessPage');
    localStorage.removeItem('lastCreatedAsset');
    console.log('Direct navigation to Register Asset - clearing stored data');
    window.sessionStorage.setItem('directNavigation', 'true');
    return { showSuccessPage: false, asset: null };
  }
  // ...
}

// AFTER: Added ref and moved to useEffect to run only once
const isDirectNavigationRef = useRef(false);

// Run only once on component mount
useEffect(() => {
  if (!isDirectNavigationRef.current) {
    isDirectNavigationRef.current = true;
    
    // Only check for direct navigation once
    const referrer = document.referrer;
    const isFromSuccessPage = referrer?.includes('register-asset') &&
                           window.sessionStorage.getItem('directNavigation') !== 'true';
    
    if (!isFromSuccessPage) {
      window.sessionStorage.removeItem('showSuccessPage');
      localStorage.removeItem('lastCreatedAsset');
      console.log('Direct navigation to Register Asset - clearing stored data');
      window.sessionStorage.setItem('directNavigation', 'true');
    }
  }
}, []);
```

### 3. Fix in useTaxonomy.ts

```typescript
// BEFORE: Included unnecessary dependencies that could cause re-renders
useEffect(() => {
  if (selectedLayer && selectedCategory && selectedSubcategory) {
    // HFN/MFA update logic
  }
}, [selectedLayer, selectedCategory, selectedSubcategory, sequential, fileType, 
  categories, subcategories, showErrorFeedback, showSuccessFeedback]);

// AFTER: Removed unnecessary dependencies
useEffect(() => {
  if (selectedLayer && selectedCategory && selectedSubcategory) {
    // HFN/MFA update logic
  }
}, [selectedLayer, selectedCategory, selectedSubcategory, sequential, fileType]);

// BEFORE: selectCategory didn't check for duplicate selections
const selectCategory = useCallback((category: string) => {
  setSelectedCategory(category);
  setSelectedSubcategory(null);
  
  // Find full category name and display in feedback
  if (showFeedback && selectedLayer) {
    const categoryObj = categories.find(cat => cat.code === category);
    if (categoryObj) {
      showSuccessFeedback(`Selected ${categoryObj.name} category`);
    }
  }
}, [categories, selectedLayer, showFeedback, showSuccessFeedback]);

// AFTER: Added check to prevent duplicate selections
const selectCategory = useCallback((category: string) => {
  if (category === selectedCategory) return; // Prevent duplicate selections
  setSelectedCategory(category);
  setSelectedSubcategory(null);
  
  // Find full category name and display in feedback
  if (showFeedback && selectedLayer) {
    const categoryObj = categories.find(cat => cat.code === category);
    if (categoryObj) {
      showSuccessFeedback(`Selected ${categoryObj.name} category`);
    }
  }
}, [categories, selectedLayer, selectedCategory, showFeedback, showSuccessFeedback]);
```

### 4. Optional Enhancement for AssetRegistrationWrapper.tsx

If implementing a TaxonomyContext, this would help ensure a single consistent taxonomy state:

```typescript
// Create a context to share the taxonomy hook state
export const TaxonomyContext = React.createContext<ReturnType<typeof useTaxonomy> | null>(null);

// In AssetRegistrationWrapper.tsx
return (
  <ErrorBoundary fallback={...}>
    <TaxonomyContext.Provider value={taxonomy}>
      <RegisterAssetPage />
    </TaxonomyContext.Provider>
  </ErrorBoundary>
);

// Then in SimpleTaxonomySelectionV2 and other components:
const taxonomy = useContext(TaxonomyContext);
```

## Results and Testing

These changes break the circular dependency chains and prevent the infinite render loops by:

1. Ensuring each component only updates state it directly controls
2. Preventing redundant state updates that trigger re-renders
3. Using refs to track one-time operations
4. Optimizing effect dependencies

The application now renders efficiently with proper data flow between components, while maintaining all the error handling improvements we've made previously.