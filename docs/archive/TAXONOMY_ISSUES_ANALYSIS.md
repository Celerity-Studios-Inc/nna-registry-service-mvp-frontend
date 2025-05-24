# Taxonomy Selection Issues Analysis

## Current Issues

1. **Display Issues - FIXED**
   - Layer names now display correctly in Layer Cards
   - Category names now display correctly in Category Cards
   - Visual styling of cards has been improved

2. **Selection Issues - ONGOING**
   - Users can't select a category after selecting a layer
   - Clicking "Next" after selecting a layer crashes the application
   - Console shows warnings about null selectedLayer during verification

## Console Logs Analysis

1. **Layer Selection Works:**
   ```
   RegisterAssetPageNew.tsx:793 [LAYER SELECT] Called with layer=G, isDoubleClick=undefined
   useTaxonomy.ts:705 [CONTEXT] Resetting all taxonomy state
   useTaxonomy.ts:730 [CONTEXT] Taxonomy state reset complete
   ```

2. **Category Selection Attempt:**
   ```
   TaxonomySelector.tsx:47 [TaxonomySelector] Category SELECTED: G.POP
   RegisterAssetPageNew.tsx:881 Setting category in form: POP, Pop, 1
   TaxonomySelector.tsx:53 [TaxonomySelector] Category selection propagated to parent: POP
   ```

3. **Timing/State Issue:**
   ```
   useTaxonomy.ts:615 [CONTEXT ctx_mawkq89v_0royc] Verification after 100ms - selectedLayer: null
   useTaxonomy.ts:823 [CONTEXT reload_mawkq8cx] Cannot reload categories: No layer selected
   ```

## Hypothesis

The core issue appears to be a timing problem with React's state updates:

1. **State Reset Issue**: When a layer is selected, the useTaxonomy hook is resetting state, but the new state isn't being properly applied.

2. **useState Timing Problem**: State updates (via `setSelectedLayer`) aren't reflecting immediately during verification checks.

3. **Form vs UI State Mismatch**: The form state is updating correctly with category selection, but the UI state (which drives the component rendering) isn't reflecting these changes.

## Current Implementation Analysis

### 1. Context and Provider Structure

The application uses a nested provider structure:
- `TaxonomyDataProvider` - Provides raw taxonomy data
- `TaxonomyProvider` - Manages selection state using the `useTaxonomy` hook

### 2. State Management in useTaxonomy.ts

The hook manages several pieces of state:
```typescript
// Layer state
const [layers] = useState<string[]>(DEFAULT_LAYERS);
const [selectedLayer, setSelectedLayer] = useState<string | null>(null);

// Category state
const [categories, setCategories] = useState<TaxonomyCategory[]>([]);
const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
```

### 3. Selection Handlers

The issue appears in the layer selection handler:
```typescript
const selectLayer = useCallback((layer: string) => {
  // First explicitly clear categories and subcategories
  setCategories([]);
  setSubcategories([]);

  // Reset all related state
  setSelectedCategory(null);
  setSelectedSubcategory(null);
  setCategoryError(null);
  setSubcategoryError(null);
  setHfn('');
  setMfa('');

  // Now set the new layer
  setSelectedLayer(layer);
  
  // Later verification shows selectedLayer is still null
  setTimeout(() => {
    console.log(`Verification after 100ms - selectedLayer: ${selectedLayer}`);
  }, 100);
}, [selectedLayer, categories, showFeedback, showSuccessFeedback]);
```

## Questions for Claude

1. How can we fix the state timing issue in the useTaxonomy hook?

2. Is there a better approach to managing selection state that would avoid these timing issues?

3. Should we be using useReducer instead of multiple useState hooks for related state?

4. How can we ensure that layer and category selections are properly synchronized?

5. What's the proper way to handle dependent state updates in React (like category selection depending on layer selection)?