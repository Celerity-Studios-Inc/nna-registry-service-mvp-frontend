# Simple Sequential Numbering Test Instructions

I've created a simplified test script that doesn't require sample asset files. This script will register test assets with text descriptions to determine which subcategories use relative vs. absolute counters.

## How to Run the Test

1. Open Terminal
2. Run this command:
```
cd /Users/ajaymadhok/nna-registry-workspace/nna-registry-service-mvp-frontend
```

3. Run the script:
```
node scripts/test-simple-sequential-numbering.mjs
```

## What the Script Does

1. The script will register two assets for each of these key taxonomy combinations:
   - S.POP.BAS (Base Pop Star)
   - S.POP.HPM (Pop Hipster Male Star)
   - S.POP.DIV (Pop Diva Female Star)
   - S.POP.LGF (Pop Legend Female Star)
   - S.ROK.BAS (Base Rock Star)
   - L.CAS.BAS (Base Casual Look)
   - L.FOR.BAS (Base Formal Look)

2. After registering each pair, it will compare the sequential numbers to determine if they use relative or absolute counters.

3. Results will be saved to:
   - `sequential-counter-test-results.json` (raw data)
   - `sequential-counter-test-results.json.summary` (summary data)
   - `sequential-counter-report.md` (human-readable report)

## Interpreting the Results

- **RELATIVE counter**: Sequential numbers are specific to each taxonomy combination
   - Example: If S.POP.HPM.015 is followed by S.POP.HPM.016
   
- **ABSOLUTE counter**: Sequential numbers are shared across different taxonomies
   - Example: If sequential numbers have large gaps between the first and second registration

The script will automatically analyze the results and provide its assessment in the terminal output and in the report files.

## Note

The script already includes your authentication token, so you don't need to set it manually.