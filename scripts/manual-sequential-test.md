# Manual Sequential Number Testing Guide

Since the automated script is encountering API format issues, here's a simple manual testing approach to verify which subcategories use relative vs. absolute counters.

## Test Plan

1. In the "Register Asset" page, create a series of test assets using these taxonomy combinations:

| Test | Layer | Category | Subcategory |
|------|-------|----------|-------------|
| 1A   | S     | POP      | BAS         |
| 1B   | S     | POP      | BAS         |
| 2A   | S     | POP      | HPM         |
| 2B   | S     | POP      | HPM         |
| 3A   | S     | POP      | DIV         |
| 3B   | S     | POP      | DIV         |
| 4A   | S     | POP      | LGF         |
| 4B   | S     | POP      | LGF         |
| 5A   | L     | CAS      | BAS         |
| 5B   | L     | CAS      | BAS         |

2. For each test, use the same sample image (any image will work) and "Test" as the asset name.

3. Record the sequential numbers assigned in this table:

| Test | Taxonomy   | Sequential # | Notes                     |
|------|------------|--------------|---------------------------|
| 1A   | S.POP.BAS  |              |                           |
| 1B   | S.POP.BAS  |              | Compare with 1A           |
| 2A   | S.POP.HPM  |              |                           |
| 2B   | S.POP.HPM  |              | Compare with 2A           |
| 3A   | S.POP.DIV  |              |                           |
| 3B   | S.POP.DIV  |              | Compare with 3A           |
| 4A   | S.POP.LGF  |              |                           |
| 4B   | S.POP.LGF  |              | Compare with 4A           |
| 5A   | L.CAS.BAS  |              |                           |
| 5B   | L.CAS.BAS  |              | Compare with 5A           |

## Analysis

After completing the tests, analyze the results:

1. **Relative Counter**: If the second asset's sequential number immediately follows the first (e.g., 013 → 014), it's using a relative counter specific to that subcategory.

2. **Absolute Counter**: If there's a large gap between sequential numbers of the same subcategory, it's using an absolute counter shared across subcategories.

## Expected Results

Based on previous tests:
- S.POP.HPM likely uses a relative counter
- Other subcategories might use absolute counters or be normalized to BAS

Record your findings and compare with the behavior in the UI to ensure the ".000" display in the preview is appropriate for all subcategories.