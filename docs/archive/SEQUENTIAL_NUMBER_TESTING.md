# Sequential Number Testing Plan

## Overview
This document outlines a plan to validate which subcategories in the NNA Registry use relative sequential counters versus absolute counters. A relative counter means the sequential numbering is specific to each layer/category/subcategory combination, while an absolute counter means sequential numbers are shared across all assets regardless of taxonomy.

## Known Behaviors
- **HPM Subcategory**: We have identified that S.POP.HPM uses a relative counter, as evidenced by asset S.POP.HPM.013 receiving sequential number .013 even though many other assets exist in the system.
- **BAS Subcategory**: Many non-HPM subcategories are normalized to BAS by the backend, which may affect how sequential numbers are assigned.

## Testing Approach

### Method 1: Manual Asset Registration Testing

1. **Create a fresh user account** for testing to eliminate any history effects
2. **Register assets with different subcategories** in the following order:
   - S.POP.BAS (baseline)
   - S.POP.DIV (to test if normalized subcategories share counters)
   - S.POP.HPM (to test known relative counter)
   - S.POP.LGF (to test another potentially relative counter)
3. **Register a second set** of the same subcategories:
   - S.POP.BAS (second asset)
   - S.POP.DIV (second asset) 
   - S.POP.HPM (second asset)

4. **Record all assigned sequential numbers** in a table:

| Order | Taxonomy | HFN | MFA | Expected Counter Type |
|-------|----------|-----|-----|----------------------|
| 1 | S.POP.BAS | TBD | TBD | Absolute |
| 2 | S.POP.DIV | TBD | TBD | Absolute (normalized to BAS) |
| 3 | S.POP.HPM | TBD | TBD | Relative |
| 4 | S.POP.LGF | TBD | TBD | Unknown |
| 5 | S.POP.BAS (2nd) | TBD | TBD | Absolute |
| 6 | S.POP.DIV (2nd) | TBD | TBD | Absolute (normalized to BAS) |
| 7 | S.POP.HPM (2nd) | TBD | TBD | Relative |

5. **Analyze the patterns** in the assigned sequential numbers:
   - If a subcategory gets sequential numbers that continue from where the previous asset of the same subcategory left off, it's using a relative counter
   - If a subcategory gets sequential numbers that follow the overall pattern, it's using an absolute counter

### Method 2: API Analysis

Use the provided scripts to analyze existing assets:

1. **Set up authentication**:
   ```bash
   export AUTH_TOKEN="your_jwt_token"
   ```

2. **Run the analysis script**:
   ```bash
   node scripts/analyze-existing-assets.mjs
   ```

3. **Review the output** to identify patterns

### Method 3: Examine Backend Code

If you have access to the backend code, check the implementation of sequential number assignment:

1. Look for functions responsible for generating sequential numbers
2. Check if the logic considers subcategory when determining the next sequential number
3. Verify if there are any special cases for certain subcategories

## Documentation

After completing the testing, document the findings in a table format:

| Layer | Category | Subcategory | Counter Type | Notes |
|-------|----------|------------|--------------|-------|
| S | POP | BAS | Absolute/Relative | |
| S | POP | HPM | Relative | Confirmed in testing |
| S | POP | DIV | Absolute/Relative | |
| ... | ... | ... | ... | ... |

## Implementation Recommendation

If we find that multiple subcategories use relative counters, we should ensure our UI properly communicates this to users by:

1. Maintaining the ".000" display in the preview for all subcategories
2. Adding a more detailed explanation about subcategory-specific sequential numbering if necessary