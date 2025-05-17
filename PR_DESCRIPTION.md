## Fix W.BCH.SUN Taxonomy Mapping Issue

This PR implements a targeted fix for the W.BCH.SUN taxonomy mapping issue, ensuring it correctly maps to numeric code 003 instead of 77.

### Changes

1. **Special Case Handling**:
   - Added explicit special case in `taxonomyMapper.getSubcategoryNumericCode` for W.BCH.SUN → 003
   - No changes to the core taxonomy data structure, ensuring stability

2. **UI Enhancement**:
   - Added informational alert in TaxonomySelection component to indicate special case handling
   - Alert only appears when the user selects W.BCH.SUN combination

3. **Testing & Documentation**:
   - Created `test-wbchsun-fix.html` for easy in-browser verification
   - Added documentation in `WBCHSUN_FIX.md` explaining the approach and implementation
   - Updated README with fix information

### Why This Approach

This PR uses a minimal, targeted approach that:
- Addresses the specific issue without introducing broader changes
- Maintains compatibility with existing code
- Is simple to verify, test, and roll back if needed

### Testing

The fix has been tested with various combinations to verify:
- W.BCH.SUN.001 now correctly maps to 5.004.003.001
- Other mappings like S.POP.HPM.001 → 2.001.007.001 are unaffected
- The UI correctly shows an informational alert for W.BCH.SUN