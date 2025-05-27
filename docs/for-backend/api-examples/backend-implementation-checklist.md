# Backend Implementation Checklist for Composite Assets

## Priority 1: Critical Issues (Blocking Frontend)

### ✅ Issue 1: Component Data Storage and Retrieval
- [ ] **Database Schema**: Add `components` field to Asset model
  ```typescript
  components?: string[];  // Array of component HFNs
  ```
- [ ] **API Endpoint**: Enhance `POST /api/assets` to accept components array
- [ ] **Validation**: Validate that component HFNs exist and are accessible
- [ ] **Storage**: Store component references in database
- [ ] **Retrieval**: Return component data in asset response

### ✅ Issue 2: Composite Name Generation
- [ ] **Format Logic**: Implement `base:component1+component2` format
  ```
  Input: components = ["S.FAN.BAS.001", "L.VIN.BAS.001"]
  Output: "C.RMX.POP.001:S.FAN.BAS.001+L.VIN.BAS.001"
  ```
- [ ] **No Brackets**: Ensure NO square brackets `[]` in addresses
- [ ] **Separator Rules**: Use `:` for base/components, `+` for multiple components
- [ ] **Empty Handling**: Handle cases where components array is empty

### ✅ Issue 3: Subcategory Mapping Expansion  
- [ ] **Mapping Tables**: Expand beyond "Base" default for all layers
- [ ] **C Layer Mappings**: Implement complete C layer subcategory mappings
- [ ] **Validation Logic**: Accept user-selected subcategories instead of overriding
- [ ] **Error Handling**: Return validation errors for invalid combinations

## Priority 2: API Contract Compliance

### ✅ Request Payload Handling
- [ ] **Accept Structure**: Handle the expected payload format:
  ```json
  {
    "layer": "C",
    "category": "Music_Video_ReMixes",
    "subcategory": "Pop_ReMixes", 
    "components": ["S.FAN.BAS.001", "L.VIN.BAS.001"],
    "metadata": {
      "components": ["S.FAN.BAS.001", "L.VIN.BAS.001"],
      "componentCount": 2
    }
  }
  ```
- [ ] **Backward Compatibility**: Continue supporting non-composite assets
- [ ] **Validation**: Validate component HFNs exist in database
- [ ] **Error Responses**: Return clear errors for invalid component references

### ✅ Response Format Compliance
- [ ] **Return Components**: Include components array in response
- [ ] **Composite Name**: Return properly formatted composite name
- [ ] **Metadata**: Include component metadata in response
- [ ] **Consistent Structure**: Match existing asset response format

## Priority 3: Testing and Validation

### ✅ Test Cases to Implement
1. **Empty Components**: `components: []` → Should work like regular asset
2. **Single Component**: `components: ["S.FAN.BAS.001"]` → `C.XXX.XXX.001:S.FAN.BAS.001`
3. **Multiple Components**: `components: ["S.FAN.BAS.001", "L.VIN.BAS.001"]` → `C.XXX.XXX.001:S.FAN.BAS.001+L.VIN.BAS.001`
4. **Invalid Component**: `components: ["INVALID.HFN.001"]` → Should return validation error
5. **Missing Components**: Request without components field → Should work normally

### ✅ Integration Testing
- [ ] **Frontend Integration**: Test with actual frontend component selection
- [ ] **API Contract**: Verify request/response format matches examples
- [ ] **Database Storage**: Confirm components are stored and retrieved correctly
- [ ] **Error Handling**: Test error scenarios and response formats

## Priority 4: Performance and Optimization

### ✅ Component Validation
- [ ] **Batch Validation**: Validate multiple component HFNs efficiently
- [ ] **Caching**: Cache component validation results if needed
- [ ] **Async Processing**: Handle component validation asynchronously if needed

### ✅ Database Optimization
- [ ] **Indexing**: Add indexes for component lookups if needed
- [ ] **Query Optimization**: Optimize queries for composite asset retrieval
- [ ] **Storage Efficiency**: Consider component storage format (array vs. delimited string)

## Implementation Examples

### Database Schema Update
```typescript
// MongoDB/Mongoose Example
const AssetSchema = new Schema({
  // ... existing fields
  layer: { type: String, required: true },
  category: { type: String, required: true },
  subcategory: { type: String, required: true },
  name: { type: String, required: true },
  nna_address: { type: String, required: true },
  
  // NEW: Component support
  components: [{ type: String }],  // Array of component HFNs
  
  metadata: {
    // ... existing metadata
    components: [{ type: String }],     // Backup component storage
    componentCount: { type: Number },   // Number of components
    createdFrom: { type: String },      // Source identifier
  }
});
```

### API Controller Enhancement
```typescript
// Example controller logic
async createAsset(req, res) {
  const { layer, category, subcategory, components, ...otherFields } = req.body;
  
  let assetName = `${layer}.${category}.${subcategory}.${sequential}`;
  
  // Handle composite assets
  if (layer === 'C' && components && components.length > 0) {
    // Validate components exist
    const validComponents = await validateComponents(components);
    if (!validComponents.isValid) {
      return res.status(400).json({
        error: 'Invalid components',
        details: validComponents.errors
      });
    }
    
    // Generate composite name
    assetName = `${assetName}:${components.join('+')}`;
  }
  
  const asset = new Asset({
    ...otherFields,
    layer,
    category, 
    subcategory,
    name: assetName,
    components: layer === 'C' ? components : undefined,
    metadata: {
      ...otherFields.metadata,
      components: layer === 'C' ? components : undefined,
      componentCount: layer === 'C' ? components?.length : undefined
    }
  });
  
  await asset.save();
  res.json({ success: true, data: asset });
}
```

### Component Validation Logic
```typescript
async function validateComponents(componentHFNs: string[]) {
  const errors = [];
  const validComponents = [];
  
  for (const hfn of componentHFNs) {
    const component = await Asset.findOne({ name: hfn });
    if (!component) {
      errors.push(`Component not found: ${hfn}`);
    } else if (component.layer === 'C') {
      errors.push(`Composite assets cannot contain other composites: ${hfn}`);
    } else {
      validComponents.push(component);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    components: validComponents
  };
}
```

## Success Criteria

### ✅ Definition of Done
- [ ] **Component Storage**: Composite assets store component references in database
- [ ] **API Response**: Backend returns components array in asset response
- [ ] **Name Format**: Asset names follow `C.XXX.XXX.001:comp1+comp2` format exactly
- [ ] **Frontend Integration**: Frontend displays complete composite addresses on success page
- [ ] **Backward Compatibility**: Non-composite assets continue working unchanged
- [ ] **Error Handling**: Clear error messages for invalid component scenarios

### ✅ Verification Steps
1. **Create Composite**: Frontend can create composite with multiple components
2. **Success Display**: Success page shows `C.RMX.POP.001:S.FAN.BAS.001+L.VIN.BAS.001`
3. **Component Retrieval**: API returns component data for existing composites
4. **Validation**: Invalid components return appropriate error messages

This checklist provides a clear roadmap for implementing composite asset support in the backend to resolve the current frontend blocking issues.