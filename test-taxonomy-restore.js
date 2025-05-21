// Simple test script to verify taxonomy conversion without special case handling
const taxonomyMapper = require('./src/api/taxonomyMapper.enhanced').default;

// Test S.POP.HPM conversion (should use general mechanism)
const hfn = 'S.POP.HPM.001';
const mfa = taxonomyMapper.convertHFNToMFA(hfn);
console.log();

// Test W.BCH.SUN conversion (should use general mechanism)
const hfn2 = 'W.BCH.SUN.001';
const mfa2 = taxonomyMapper.convertHFNToMFA(hfn2);
console.log();

// Test general case
const hfn3 = 'G.POP.BAS.001';
const mfa3 = taxonomyMapper.convertHFNToMFA(hfn3);
console.log();
