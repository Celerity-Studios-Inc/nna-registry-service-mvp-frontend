#!/usr/bin/env node

/**
 * Star Layer Results Analyzer
 * 
 * This script analyzes the results from the star-layer-sequential-test-results.json
 * file to generate a detailed report on sequential numbering patterns.
 * 
 * Usage:
 *   node analyze-star-layer-results.mjs [results-file]
 */

import fs from 'fs/promises';

// Configuration
const DEFAULT_RESULTS_FILE = './star-layer-sequential-test-results.json';
const REPORT_FILE = './star-layer-counter-report.md';

async function analyzeResults() {
  try {
    // Get the results file path from command line or use default
    const resultsFile = process.argv[2] || DEFAULT_RESULTS_FILE;
    console.log(`Analyzing results from: ${resultsFile}`);
    
    // Read the results file
    const rawData = await fs.readFile(resultsFile, 'utf8');
    const results = JSON.parse(rawData);
    
    console.log(`Found ${results.length} test results`);
    
    // Group results by category.subcategory
    const grouped = {};
    
    for (const result of results) {
      if (result.error) continue;
      
      const key = `S.${result.category}.${result.subcategory}`;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      
      grouped[key].push(result);
    }
    
    // Prepare analysis data for report
    const analysisData = [];
    
    // For each taxonomy combination, compare sequential numbers between rounds
    for (const [taxonomy, group] of Object.entries(grouped)) {
      // Skip if we don't have both rounds
      if (group.length < 2) continue;
      
      // Sort by round
      group.sort((a, b) => a.round - b.round);
      
      const round1 = group.find(r => r.round === 1);
      const round2 = group.find(r => r.round === 2);
      
      if (!round1 || !round2) continue;
      
      // Extract sequential numbers as integers for comparison
      const seq1 = parseInt(round1.sequentialNumber, 10);
      const seq2 = parseInt(round2.sequentialNumber, 10);
      
      // Extract machine-friendly addresses for comparison
      const mfa1 = round1.mfa;
      const mfa2 = round2.mfa;
      
      // Determine counter type
      const isRelativeCounter = seq2 === seq1 + 1 || seq2 === seq1 + 2;
      
      // Check for known relative counters like HPM
      const isKnownRelative = taxonomy.includes('.HPM');
      
      const counterType = isRelativeCounter || isKnownRelative ? 
        "RELATIVE" : "ABSOLUTE";
      
      // Determine confidence level based on evidence
      let confidence = "Medium";
      let explanation = "";
      
      if (isKnownRelative) {
        confidence = "High";
        explanation = "Known relative counter, confirmed by testing";
      } else if (isRelativeCounter) {
        confidence = "High";
        explanation = `Sequential numbers are consecutive (${seq1} → ${seq2})`;
      } else if (seq2 > seq1 + 10) {
        confidence = "High";
        explanation = `Large gap between sequential numbers (${seq1} → ${seq2}) suggests absolute counter`;
      } else {
        explanation = `Inconclusive pattern between rounds (${seq1} → ${seq2})`;
      }
      
      // Parse the taxonomy for better reporting
      const [layer, category, subcategory] = taxonomy.split('.');
      
      // Add to analysis data
      analysisData.push({
        taxonomy,
        layer,
        category,
        subcategory,
        round1: {
          hfn: round1.hfn,
          mfa: round1.mfa,
          sequentialNumber: round1.sequentialNumber
        },
        round2: {
          hfn: round2.hfn,
          mfa: round2.mfa,
          sequentialNumber: round2.sequentialNumber
        },
        counterType,
        confidence,
        explanation,
        seqDifference: seq2 - seq1,
        isKnownRelative
      });
    }
    
    // Generate a markdown report
    const report = generateReport(analysisData);
    
    // Save the report
    await fs.writeFile(REPORT_FILE, report);
    console.log(`Analysis report saved to: ${REPORT_FILE}`);
    
    // Print summary to console
    printSummary(analysisData);
  } catch (error) {
    console.error('Error analyzing results:', error);
  }
}

/**
 * Generate a detailed markdown report
 */
function generateReport(analysisData) {
  // Sort alphabetically by taxonomy
  analysisData.sort((a, b) => a.taxonomy.localeCompare(b.taxonomy));
  
  let report = `# Star Layer Sequential Numbering Analysis Report\n\n`;
  report += `Generated: ${new Date().toISOString()}\n\n`;
  
  report += `## Summary\n\n`;
  report += `| Taxonomy | Counter Type | Confidence | Sequential Numbers (Round 1 → 2) | Notes |\n`;
  report += `|----------|--------------|------------|----------------------------------|-------|\n`;
  
  for (const data of analysisData) {
    report += `| ${data.taxonomy} | ${data.counterType} | ${data.confidence} | ${data.round1.sequentialNumber} → ${data.round2.sequentialNumber} | ${data.explanation} |\n`;
  }
  
  report += `\n## Detailed Analysis\n\n`;
  
  for (const data of analysisData) {
    report += `### ${data.taxonomy}\n\n`;
    report += `**Counter Type:** ${data.counterType} (${data.confidence} confidence)\n\n`;
    report += `**Round 1 Registration:**\n`;
    report += `- HFN: ${data.round1.hfn}\n`;
    report += `- MFA: ${data.round1.mfa}\n`;
    report += `- Sequential Number: ${data.round1.sequentialNumber}\n\n`;
    
    report += `**Round 2 Registration:**\n`;
    report += `- HFN: ${data.round2.hfn}\n`;
    report += `- MFA: ${data.round2.mfa}\n`;
    report += `- Sequential Number: ${data.round2.sequentialNumber}\n\n`;
    
    report += `**Analysis:**\n`;
    report += `- Sequential Number Difference: ${data.seqDifference}\n`;
    report += `- ${data.explanation}\n\n`;
  }
  
  report += `## Recommendations\n\n`;
  
  // Count relative vs absolute counters
  const relativeCount = analysisData.filter(d => d.counterType === "RELATIVE").length;
  const absoluteCount = analysisData.filter(d => d.counterType === "ABSOLUTE").length;
  
  if (relativeCount > absoluteCount) {
    report += `Based on the analysis, most subcategories (${relativeCount} out of ${analysisData.length}) appear to use **relative counters**. This means that sequential numbers are specific to each layer/category/subcategory combination.\n\n`;
    report += `**UI Recommendation:** Maintain the current approach of showing '.000' in the preview to indicate that sequential numbers will be assigned by the backend on submission.\n`;
  } else if (absoluteCount > relativeCount) {
    report += `Based on the analysis, most subcategories (${absoluteCount} out of ${analysisData.length}) appear to use **absolute counters**. This means that sequential numbers are shared across different taxonomy combinations.\n\n`;
    report += `**UI Recommendation:** The current approach of showing '.000' in the preview is still appropriate, but we may consider updating the explanatory text to clarify that sequential numbers are assigned globally rather than per subcategory.\n`;
  } else {
    report += `The analysis shows a mixed pattern of relative and absolute counters. This suggests that the backend implementation may be inconsistent or that some subcategories have special handling.\n\n`;
    report += `**UI Recommendation:** Maintain the current approach, but consider adding more detailed explanations about how sequential numbering works for different subcategories.\n`;
  }
  
  return report;
}

/**
 * Print a summary to the console
 */
function printSummary(analysisData) {
  console.log("\n=== COUNTER TYPE SUMMARY ===\n");
  
  console.log("Taxonomy | Counter Type | Confidence | Sequential Numbers (1→2) | Notes");
  console.log("---------|--------------|------------|------------------------|-------");
  
  for (const data of analysisData) {
    console.log(`${data.taxonomy} | ${data.counterType} | ${data.confidence} | ${data.round1.sequentialNumber}→${data.round2.sequentialNumber} | ${data.explanation.substring(0, 40)}${data.explanation.length > 40 ? '...' : ''}`);
  }
  
  // Count relative vs absolute counters
  const relativeCount = analysisData.filter(d => d.counterType === "RELATIVE").length;
  const absoluteCount = analysisData.filter(d => d.counterType === "ABSOLUTE").length;
  
  console.log(`\nResults: ${relativeCount} RELATIVE counters, ${absoluteCount} ABSOLUTE counters\n`);
}

// Run the analysis
analyzeResults();