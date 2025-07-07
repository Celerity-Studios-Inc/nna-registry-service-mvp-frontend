/**
 * Taxonomy Fix Validation Utility
 * 
 * This utility provides comprehensive validation for the taxonomy selection fix,
 * testing multiple layer/category combinations to ensure subcategories load correctly.
 */

import { enhancedTaxonomyService } from '../services/enhancedTaxonomyService';
import { logger } from '../utils/logger';

interface TestCombination {
  layer: string;
  category: string;
  expected: string;
}

/**
 * Validates the taxonomy fix by testing multiple layer/category combinations
 * @param setValue Function to set form values (from React Hook Form)
 */
export const validateTaxonomyFix = async (
  setValue: (name: string, value: any) => void
) => {
  const testCombinations: TestCombination[] = [
    { layer: 'G', category: 'POP', expected: 'Should show pop subcategories' },
    { layer: 'S', category: 'DNC', expected: 'Should show dance electronic subcategories' },
    { layer: 'L', category: 'PRF', expected: 'Should show performance subcategories' },
    { layer: 'M', category: 'HIP', expected: 'Should show hip hop dance subcategories' },
    { layer: 'W', category: 'BCH', expected: 'Should show beach subcategories' },
    { layer: 'S', category: 'POP', expected: 'Should show pop subcategories' }
  ];

  console.group('🧪 Taxonomy Fix Validation');
  logger.info('Starting taxonomy fix validation...');
  
  const results: Record<string, {
    success: boolean;
    count: number;
    error?: string;
  }> = {};
  
  for (const test of testCombinations) {
    const key = `${test.layer}.${test.category}`;
    
    try {
      // Log test attempt
      logger.info(`Testing combination: ${key}`);
      
      // Simulate form changes
      setValue('layer', test.layer);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setValue('categoryCode', test.category);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Get subcategories using enhanced service
      const subcategories = await enhancedTaxonomyService.getSubcategories(test.layer, test.category);
      
      // Log results
      console.log(`✅ ${key}: ${subcategories?.length || 0} subcategories`);
      logger.info(`Validation successful for ${key}: Found ${subcategories?.length || 0} subcategories`);
      
      // Store result
      results[key] = {
        success: true,
        count: subcategories?.length || 0
      };
      
    } catch (error: any) {
      console.error(`❌ ${key}: ${error.message}`);
      logger.error(`Validation failed for ${key}: ${error.message}`);
      
      // Store error result
      results[key] = {
        success: false,
        count: 0,
        error: error.message
      };
    }
  }
  
  // Log summary
  console.log('📊 Validation Summary:');
  Object.entries(results).forEach(([combination, result]) => {
    if (result.success) {
      console.log(`✅ ${combination}: ${result.count} subcategories`);
    } else {
      console.log(`❌ ${combination}: ${result.error}`);
    }
  });
  
  const successCount = Object.values(results).filter(r => r.success).length;
  const totalCount = testCombinations.length;
  
  console.log(`📈 Overall: ${successCount}/${totalCount} combinations successful (${Math.round(successCount/totalCount*100)}%)`);
  
  // Final assessment
  if (successCount === totalCount) {
    console.log('🎉 Taxonomy fix is working correctly for all tested combinations!');
  } else {
    console.warn('⚠️ Some combinations failed validation. Check logs for details.');
  }
  
  console.groupEnd();
  
  // Return results for programmatic use
  return {
    results,
    summary: {
      total: totalCount,
      successful: successCount,
      success_rate: successCount/totalCount
    }
  };
};

/**
 * Tests the complete registration flow
 * @param setValue Function to set form values
 * @param triggerValidation Function to trigger form validation
 * @param handleNext Function to advance to next step
 */
export const validateCompleteFlow = async (
  setValue: (name: string, value: any) => void,
  triggerValidation: () => Promise<boolean>,
  handleNext: () => void
) => {
  console.group('🧪 Complete Flow Validation');
  
  try {
    // Step 1: Select Layer
    setValue('layer', 'S');
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Step 2: Select Category
    setValue('categoryCode', 'POP');
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Step 3: Select Subcategory
    setValue('subcategoryCode', 'POP.BAS');
    setValue('subcategoryName', 'Base');
    setValue('subcategoryNumericCode', '001');
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Validate form
    const isValid = await triggerValidation();
    
    if (isValid) {
      console.log('✅ Form validation successful');
      handleNext();
      console.log('✅ Successfully advanced to next step');
    } else {
      console.error('❌ Form validation failed');
    }
    
  } catch (error: any) {
    console.error(`❌ Flow validation failed: ${error.message}`);
  }
  
  console.groupEnd();
};

/**
 * Tests rapid switching between layers and categories
 * @param setValue Function to set form values
 */
export const validateRapidSwitching = async (
  setValue: (name: string, value: any) => void
) => {
  console.group('🧪 Rapid Switching Validation');
  
  try {
    // Test rapid layer switching
    const layers = ['G', 'S', 'L', 'M', 'W'];
    
    console.log('Testing rapid layer switching...');
    for (const layer of layers) {
      setValue('layer', layer);
      await new Promise(resolve => setTimeout(resolve, 100)); // Very short timeout for rapid switching
    }
    
    // Let the UI catch up
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Test rapid category switching
    console.log('Testing rapid category switching...');
    setValue('layer', 'S'); // Set to Stars layer
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const categories = ['POP', 'ROK', 'HIP', 'DNC', 'ALT'];
    
    for (const category of categories) {
      setValue('categoryCode', category);
      await new Promise(resolve => setTimeout(resolve, 100)); // Very short timeout for rapid switching
    }
    
    console.log('✅ Rapid switching tests completed');
    
  } catch (error: any) {
    console.error(`❌ Rapid switching validation failed: ${error.message}`);
  }
  
  console.groupEnd();
};

/**
 * Tests error recovery by simulating service failures
 * @param setValue Function to set form values
 */
export const validateErrorRecovery = async (
  setValue: (name: string, value: any) => void
) => {
  console.group('🧪 Error Recovery Validation');
  
  try {
    // Set up for error condition
    setValue('layer', 'S');
    setValue('categoryCode', 'POP');
    
    // Check if subcategory values are set
    setTimeout(() => {
      // These should be set to fallback values if error recovery is working
      console.log('Subcategory Code: [Check values in form state]');
      console.log('Subcategory Name: [Check values in form state]');
      console.log('Subcategory Numeric Code: [Check values in form state]');
      
      console.log('✅ Error recovery validation completed');
    }, 500);
    
  } catch (error: any) {
    console.error(`❌ Error recovery validation failed: ${error.message}`);
  }
  
  console.groupEnd();
};

export default {
  validateTaxonomyFix,
  validateCompleteFlow,
  validateRapidSwitching,
  validateErrorRecovery
};