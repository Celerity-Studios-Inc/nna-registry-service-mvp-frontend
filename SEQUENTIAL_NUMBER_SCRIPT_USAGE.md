# Sequential Number Testing Scripts

These scripts allow you to test and analyze sequential numbering patterns in the NNA Registry Service to determine which subcategories use relative vs. absolute counters.

## Script Overview

1. **test-star-layer-sequential-numbering.mjs**: Tests all category × subcategory combinations in the Star layer
2. **analyze-star-layer-results.mjs**: Analyzes results and generates a detailed report
3. **analyze-existing-assets.mjs**: Analyzes existing assets from the API to identify patterns

## Prerequisites

1. Node.js 18+ installed
2. A valid JWT authentication token for the NNA Registry API
3. Sample assets in the `/Sample Assets/Stars` directory

## Installation

Install required dependencies:

```bash
npm install node-fetch form-data
```

## Usage Instructions

### 1. Testing Star Layer Sequential Numbering

This script registers two assets for each category × subcategory combination to see how sequential numbers are assigned.

```bash
# Set your JWT token
export AUTH_TOKEN="your_jwt_token_here"

# Run the test script
node scripts/test-star-layer-sequential-numbering.mjs
```

The script will:
1. Register one asset for each category × subcategory combination in the Star layer
2. Register a second asset for the same combinations
3. Compare the sequential numbers between the two registrations
4. Generate a report analyzing which subcategories use relative vs. absolute counters

### 2. Analyzing Results

To analyze the results in more detail:

```bash
node scripts/analyze-star-layer-results.mjs
```

This will generate a comprehensive markdown report (`star-layer-counter-report.md`) with:
- Summary table of all tested taxonomy combinations
- Counter type assessment (RELATIVE vs. ABSOLUTE)
- Confidence level for each assessment
- Detailed analysis of the sequential number patterns
- Recommendations for UI implementation

### 3. Analyzing Existing Assets

To analyze existing assets in the system:

```bash
# Set your JWT token
export AUTH_TOKEN="your_jwt_token_here"

# Run the analysis script
node scripts/analyze-existing-assets.mjs
```

This script examines all assets in the system to identify sequential numbering patterns based on existing data.

## Interpreting Results

- **Relative Counter**: Sequential numbers are specific to each layer/category/subcategory combination
  - Example: S.POP.HPM.001, S.POP.HPM.002, S.POP.HPM.003...
  - Evidence: Second asset receives sequential number directly after the first

- **Absolute Counter**: Sequential numbers are shared across different taxonomy combinations
  - Example: S.POP.BAS.001, S.POP.DIV.002, S.POP.LGF.003...
  - Evidence: Second asset receives sequential number far from the first

## Manual Testing vs. Automated Testing

While these scripts provide automated testing, manual testing is still valuable:
1. Manual testing gives you real-time visibility into the UI behavior
2. Automated testing helps validate patterns across many subcategories efficiently
3. Combining both approaches gives the most comprehensive understanding

## Next Steps

After identifying which subcategories use relative vs. absolute counters:
1. Update the UI explanations if needed to clarify how sequential numbers are assigned
2. Consider adding subcategory-specific tooltips for special cases
3. Document the findings for future reference and onboarding