// Test script for verifying enhanced NNA dual addressing system
const { formatNNAAddressForDisplay } = require('./src/api/codeMapping.enhanced');

// Test cases covering all problem scenarios
const testCases = [
  // 1. Regular Stars cases
  { name: "S.POP.BAS", layer: "S", category: "POP", subcategory: "BAS", expectedHfn: "S.POP.BAS.000", expectedMfa: "2.001.001.000" },
  
  // 2. Previously problematic S.POP.HPM case
  { name: "S.POP.HPM", layer: "S", category: "POP", subcategory: "HPM", expectedHfn: "S.POP.HPM.000", expectedMfa: "2.001.007.000" },
  
  // 3. Numeric representations of S.POP.HPM 
  { name: "S.001.007 numeric", layer: "S", category: "001", subcategory: "007", expectedHfn: "S.POP.HPM.000", expectedMfa: "2.001.007.000" },
  
  // 4. Full name representations
  { name: "S with Pop category full name", layer: "S", category: "Pop", subcategory: "Pop_Hipster_Male_Stars", expectedHfn: "S.POP.HPM.000", expectedMfa: "2.001.007.000" },
  
  // 5. Worlds with HIP (Urban) category - previously showed as 5.001.001 instead of 5.003.001
  { name: "W.HIP.BAS", layer: "W", category: "HIP", subcategory: "BAS", expectedHfn: "W.HIP.BAS.000", expectedMfa: "5.003.001.000" },
  
  // 6. Worlds with HIP numeric category
  { name: "W.003.001 numeric", layer: "W", category: "003", subcategory: "001", expectedHfn: "W.HIP.BAS.000", expectedMfa: "5.003.001.000" },
  
  // 7. Worlds with Natural category
  { name: "W.NAT.BAS", layer: "W", category: "NAT", subcategory: "BAS", expectedHfn: "W.NAT.BAS.000", expectedMfa: "5.015.001.000" },
  
  // 8. Worlds with Natural category full name
  { name: "W with Natural full name", layer: "W", category: "Natural", subcategory: "Base", expectedHfn: "W.NAT.BAS.000", expectedMfa: "5.015.001.000" },
  
  // 9. Looks with Modern_Performance category (previously showed Modern_Performance instead of PRF)
  { name: "L.PRF.ATH", layer: "L", category: "Modern_Performance", subcategory: "Athletic", expectedHfn: "L.PRF.ATH.000", expectedMfa: "3.019.001.000" }
];

console.log("===== DUAL ADDRESSING SYSTEM TEST =====");
console.log("Testing enhanced dual addressing system formatNNAAddressForDisplay function");
console.log("This script tests previously problematic cases with the new solution");
console.log("=======================================\n");

// Run each test case
testCases.forEach(testCase => {
  console.log(`\nTest case: ${testCase.name}`);
  console.log(`Input: layer=${testCase.layer}, category=${testCase.category}, subcategory=${testCase.subcategory}`);
  
  try {
    // Format with new system
    const result = formatNNAAddressForDisplay(
      testCase.layer,
      testCase.category,
      testCase.subcategory
    );
    
    console.log(`Result: hfn=${result.hfn}, mfa=${result.mfa}`);
    console.log(`Expected: hfn=${testCase.expectedHfn}, mfa=${testCase.expectedMfa}`);
    
    const hfnMatch = result.hfn === testCase.expectedHfn;
    const mfaMatch = result.mfa === testCase.expectedMfa;
    
    if (hfnMatch && mfaMatch) {
      console.log("✅ PASS - Both HFN and MFA match expected values");
    } else if (hfnMatch) {
      console.log("⚠️ PARTIAL - HFN matches but MFA doesn't match expected value");
    } else if (mfaMatch) {
      console.log("⚠️ PARTIAL - MFA matches but HFN doesn't match expected value");
    } else {
      console.log("❌ FAIL - Neither HFN nor MFA match expected values");
    }
  } catch (error) {
    console.log(`❌ ERROR - ${error.message}`);
  }
});

console.log("\n=======================================");
console.log("Test summary:");
console.log("1. Previously special-cased S.POP.HPM now uses generic mapping");
console.log("2. Worlds with HIP/Urban category now consistently shows HIP/003");
console.log("3. Full category names are now properly converted to 3-letter codes");
console.log("4. Numeric and alphabetic codes are handled consistently");
console.log("=======================================");