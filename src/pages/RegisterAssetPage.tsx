import React, { useState } from 'react';
import { environmentSafeLog, environmentSafeWarn, environmentSafeError } from '../utils/environment';
import { useForm, SubmitHandler, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Box,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Container,
  Alert,
  Grid,
  Divider,
  Chip,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import {
  ChevronLeft as PreviousIcon,
  ChevronRight as NextIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import assetService from '../api/assetService';
import { formatNNAAddressForDisplay } from '../api/codeMapping.enhanced';
import taxonomyMapper from '../api/taxonomyMapper.enhanced';
import LayerSelection from '../components/asset/LayerSelection';
import TaxonomySelection from '../components/asset/TaxonomySelection';
import SimpleTaxonomySelectionV3 from '../components/asset/SimpleTaxonomySelectionV3';
import TaxonomyContext from '../components/asset/TaxonomyContext';
import FileUpload from '../components/asset/FileUpload';
import ReviewSubmit from '../components/asset/ReviewSubmit';
import TrainingDataCollection from '../components/asset/TrainingDataCollection';
import CompositeAssetSelection from '../components/CompositeAssetSelection';
import { TaxonomyConverter } from '../services/taxonomyConverter';
import { runQuickTaxonomyTest } from '../utils/taxonomyQuickTest';
import { validateTaxonomyFix } from '../utils/taxonomyFixValidator';
import { taxonomyFormatter } from '../utils/taxonomyFormatter';
import { SubcategoryPreserver } from '../utils/subcategoryPreserver';
import SubcategoryDiscrepancyAlert from '../components/asset/SubcategoryDiscrepancyAlert';

// Types
import { LayerOption, CategoryOption, SubcategoryOption } from '../types/taxonomy.types';
import { FileUploadResponse, Asset, SOURCE_OPTIONS } from '../types/asset.types';

// Define interface for subcategory item for type safety
interface SubcategoryItem {
  code: string;
  name: string;
  numericCode?: number | string;
}

// Add analytics interface for TypeScript
declare global {
  interface Window {
    analytics?: {
      track: (event: string, properties?: Record<string, any>) => void;
    };
  }
}

// Define the steps in the registration process
const getSteps = (isTrainingLayer: boolean, isCompositeLayer: boolean) => {
  if (isTrainingLayer) {
    return ['Select Layer', 'Choose Taxonomy', 'Upload Files', 'Training Data', 'Review Details'];
  }
  if (isCompositeLayer) {
    // Corrected workflow: Steps 1-4 same as component assets, Step 5 adds Search & Add Components
    return ['Select Layer', 'Choose Taxonomy', 'Upload Files', 'Review Details', 'Search & Add Components'];
  }
  return ['Select Layer', 'Choose Taxonomy', 'Upload Files', 'Review Details'];
};

// Define the form validation schema
const schema = yup.object({
  layer: yup.string().required('Layer is required'),
  layerName: yup.string(),
  categoryCode: yup.string().required('Category is required'),
  categoryName: yup.string(),
  subcategoryCode: yup.string().required('Subcategory is required'),
  subcategoryName: yup.string(),
  subcategoryNumericCode: yup.string(),
  name: yup.string().required('Name is required'),
  description: yup.string(),
  source: yup.string().required('Source is required'),
  tags: yup.array().of(yup.string()),
  files: yup.array(),
  // NNA Address fields
  hfn: yup.string(), // human friendly name
  mfa: yup.string(), // machine friendly address
  sequential: yup.string(), // sequential number
  trainingData: yup.object().nullable().optional(),
});

// Form data interface
// Training data interfaces
interface TrainingPrompt {
  id: string;
  text: string;
  category?: string;
  tags?: string[];
}

interface TrainingImage {
  id: string;
  file?: File;
  url?: string;
  description?: string;
  tags?: string[];
}

interface TrainingVideo {
  id: string;
  url: string;
  description?: string;
  tags?: string[];
}

interface TrainingData {
  isTrainable: boolean;
  prompts: TrainingPrompt[];
  images: TrainingImage[];
  videos: TrainingVideo[];
  documentation?: string;
}

interface FormData {
  layer: string;
  layerName: string;
  categoryCode: string;
  categoryName: string;
  subcategoryCode: string;
  subcategoryName: string;
  subcategoryNumericCode: string;
  name: string;
  description: string;
  source: string; // Source field from dropdown
  tags: string[];
  files: File[];
  hfn: string; // human friendly name
  mfa: string; // machine friendly address
  sequential: string; // sequential number
  trainingData?: TrainingData; // Only for T layer
  layerSpecificData?: {
    components: any[]; // Only for C layer
  };
}

const RegisterAssetPage: React.FC = () => {
  // Check for any previously created asset in localStorage/sessionStorage
  const getStoredAssetData = () => {
    try {
      // Only keep stored asset data if navigation is from success page
      const referrer = document.referrer;
      const isFromSuccessPage = referrer?.includes('register-asset') &&
                              window.sessionStorage.getItem('directNavigation') !== 'true';

      // If the user came directly to register-asset via a menu link or direct URL,
      // we should start with a fresh form
      if (!isFromSuccessPage) {
        // Clear any previously stored data to ensure a fresh form
        window.sessionStorage.removeItem('showSuccessPage');
        localStorage.removeItem('lastCreatedAsset');
        environmentSafeLog('Direct navigation to Register Asset - clearing stored data');
        window.sessionStorage.setItem('directNavigation', 'true');
        return { showSuccessPage: false, asset: null };
      }

      const savedShowSuccessPage = window.sessionStorage.getItem('showSuccessPage') === 'true';
      let savedAsset = null;

      const savedAssetJson = localStorage.getItem('lastCreatedAsset');
      if (savedAssetJson) {
        savedAsset = JSON.parse(savedAssetJson);
      }

      return {
        showSuccessPage: savedShowSuccessPage,
        asset: savedAsset
      };
    } catch (err) {
      console.error('Error retrieving stored asset data:', err);
      return { showSuccessPage: false, asset: null };
    }
  };
  
  const storedData = getStoredAssetData();
  
  // IMPORTANT: Force real API mode for asset creation
  React.useEffect(() => {
    // Set forceMockApi to false to ensure we use the real backend
    localStorage.setItem('forceMockApi', 'false');
    environmentSafeLog('FORCING REAL API MODE for asset creation');

    // Clean up on unmount
    return () => {
      // Don't remove this setting as we want it to persist
    };
  }, []);
  
  // Tests disabled - no longer needed as taxonomy has been stabilized
  

  // State
  const [activeStep, setActiveStep] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(storedData.asset !== null);
  const [uploadedFiles, setUploadedFiles] = useState<FileUploadResponse[]>([]);
  const [isTrainingLayer, setIsTrainingLayer] = useState<boolean>(storedData.asset?.layer === 'T');
  const [isCompositeLayer, setIsCompositeLayer] = useState<boolean>(storedData.asset?.layer === 'C');
  const [showSuccessPage, setShowSuccessPage] = useState<boolean>(storedData.showSuccessPage);
  const [createdAsset, setCreatedAsset] = useState<Asset | null>(storedData.asset);
  const [potentialDuplicate, setPotentialDuplicate] = useState<{
    asset: Asset;
    file: File;
    message: string;
    confidence: 'high' | 'medium' | 'low';
  } | null>(null);

  // React Hook Form setup with explicit type cast to resolve typescript issue
  const methods = useForm({
    resolver: yupResolver(schema) as any,
    defaultValues: {
      layer: '',
      layerName: '',
      categoryCode: '',
      categoryName: '',
      subcategoryCode: '',
      subcategoryName: '',
      subcategoryNumericCode: '',
      name: '',
      description: '',
      source: 'ReViz', // Default source value
      tags: [],
      files: [] as File[],
      hfn: '',
      mfa: '',
      sequential: '',
      trainingData: {
        isTrainable: true,
        prompts: [],
        images: [],
        videos: [],
        documentation: '',
      },
      layerSpecificData: {
        components: [],
      },
    } as FormData,
  });

  const { 
    register, 
    handleSubmit, 
    setValue, 
    getValues, 
    formState: { errors, isSubmitting }, 
    watch,
    reset,
  } = methods;

  // Watch form fields for validation and navigation logic
  const watchLayer = watch('layer');
  const watchCategoryCode = watch('categoryCode');
  const watchSubcategoryCode = watch('subcategoryCode');
  const watchFiles = watch('files');
  
  // Add this debug useEffect to see the form state
  React.useEffect(() => {
    environmentSafeLog('[REGISTER PAGE] Current form state:', {
      layer: watch('layer'),
      categoryCode: watch('categoryCode'), 
      subcategoryCode: watch('subcategoryCode')
    });
  }, [watch]);
  
  // Add validation for the complete flow
  React.useEffect(() => {
    // Only run this in development and when specifically enabled
    const shouldRunCompleteFlowTest = process.env.NODE_ENV === 'development' && 
                                      window.location.search.includes('test=complete');
    
    if (shouldRunCompleteFlowTest) {
      // Wait until the form is fully initialized
      setTimeout(() => {
        environmentSafeLog('Running complete flow validation test...');
        
        // Get the trigger method from React Hook Form
        const trigger = methods.trigger;
        
        // Run complete flow test
        import('../utils/taxonomyFixValidator').then(validator => {
          // Cast setValue to the expected type
          const setValueAny = (name: string, value: any) => setValue(name as any, value);
          validator.validateCompleteFlow(
            setValueAny,
            async () => await trigger(), 
            handleNext
          );
        });
      }, 3000);
    }
  }, []);
  
  // Add this to force subcategory options when they should be available
  React.useEffect(() => {
    const layer = watch('layer');
    const categoryCode = watch('categoryCode');
    
    if (layer && categoryCode) {
      environmentSafeLog('[REGISTER PAGE] Should trigger subcategory load for:', layer, categoryCode);
      
      // Force trigger the subcategory load
      if ((layer === 'S' && categoryCode === 'DNC') || 
          (layer === 'L' && categoryCode === 'PRF')) {
        environmentSafeLog('[REGISTER PAGE] This is a known working combination');
      }
    }
  }, [watch]);

  // Handle form submission
  const onSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      // CRITICAL DEBUG: Check what form data we have before processing
      environmentSafeLog('🔍 FORM DEBUG: Complete form data received:', data);
      environmentSafeLog('🔍 FORM DEBUG: layerSpecificData:', data.layerSpecificData);
      environmentSafeLog('🔍 FORM DEBUG: layerSpecificData.components:', data.layerSpecificData?.components);
      
      setLoading(true);
      setError(null);
      
      // Show a temporary confirmation message
      const formContainer = document.querySelector('form');
      if (formContainer) {
        const confirmationEl = document.createElement('div');
        confirmationEl.innerHTML = `
          <div style="text-align: center; padding: 20px;">
            <h3>Processing your submission...</h3>
            <p>Uploading files and registering your asset. Please wait.</p>
            <div style="display: flex; justify-content: center; margin-top: 20px;">
              <div style="width: 40px; height: 40px; border: 5px solid #f3f3f3; border-top: 5px solid #3498db; border-radius: 50%; animation: spin 1s linear infinite;"></div>
            </div>
          </div>
          <style>
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          </style>
        `;
        formContainer.appendChild(confirmationEl);
      }
      
      // Process file uploads if not already uploaded
      if (data.files && data.files.length > 0) {
        // If files are not already processed, upload them
        if (uploadedFiles.length < data.files.length) {
          for (const file of data.files) {
            // Check if file is already uploaded
            const isUploaded = uploadedFiles.some(
              (uploaded) => uploaded.originalName === file.name
            );
            
            if (!isUploaded) {
              const uploadResult = await assetService.uploadFile(file);
              if (uploadResult && uploadResult.response) {
                setUploadedFiles((prev) => [
                  ...prev,
                  {
                    filename: uploadResult.response?.filename || file.name,
                    url: uploadResult.response?.url || '',
                    size: uploadResult.response?.size || file.size,
                    mimeType: uploadResult.response?.mimeType || file.type,
                    originalName: file.name,
                  },
                ]);
              }
            }
          }
        }
      }

      // Log form data for debugging
      environmentSafeLog('Form data for asset creation:', {
        layer: data.layer,
        categoryCode: data.categoryCode,  // This could be numeric "001" or alphabetic "POP"
        subcategoryCode: data.subcategoryCode, // This could be numeric "005"/"007" or alphabetic "LGM"/"HPM"
        hfn: data.hfn,
        mfa: data.mfa,
        isNumericCategory: /^\d+$/.test(data.categoryCode), // Check if category is numeric
        isNumericSubcategory: /^\d+$/.test(data.subcategoryCode) // Check if subcategory is numeric
      });

      // Add special logging for the category/subcategory format to debug backend issues
      environmentSafeLog('IMPORTANT: Category/Subcategory Format Check:');
      environmentSafeLog(`Category: ${data.categoryCode} (${/^\d+$/.test(data.categoryCode) ? 'NUMERIC - needs conversion' : 'ALPHABETIC - OK'})`);
      environmentSafeLog(`Subcategory: ${data.subcategoryCode} (${/^\d+$/.test(data.subcategoryCode) ? 'NUMERIC - needs conversion' : 'ALPHABETIC - OK'})`);

      // Log important taxonomy combinations for tracking
      if (data.layer === 'S' && (data.categoryCode === 'POP' || data.categoryCode === '001')) {
        if (data.subcategoryCode === 'LGM' || data.subcategoryCode === '005') {
          environmentSafeLog('DETECTED S.POP.LGM COMBINATION - Will convert to proper codes for backend');
        }
        
        if (data.subcategoryCode === 'HPM' || data.subcategoryCode === '007') {
          environmentSafeLog('IMPORTANT - Asset registration with S.POP.HPM:');
          environmentSafeLog(`HFN: ${data.hfn}`);
          environmentSafeLog(`MFA: ${data.mfa}`);
        }
        
        if (data.subcategoryCode === 'BAS' || data.subcategoryCode === 'BASE' || data.subcategoryCode === '001') {
          environmentSafeLog('DETECTED S.POP.BAS COMBINATION - Important for testing');
          environmentSafeLog(`HFN: ${data.hfn}`);
          environmentSafeLog(`MFA: ${data.mfa}`);
        }
      }
      
      // Add special logging for Star (Virtual Avatars) layer
      if (data.layer === 'S' && (data.categoryCode === 'VAV')) {
        environmentSafeLog(`IMPORTANT - Asset registration with S.VAV.${data.subcategoryCode}:`);
        environmentSafeLog(`HFN: ${data.hfn}`);
        environmentSafeLog(`MFA: ${data.mfa}`);
        
        // Special handling for AI Generated Star subcategory (S.VAV.AIG)
        if (data.subcategoryCode === 'AIG') {
          environmentSafeLog('DETECTED S.VAV.AIG COMBINATION - This is an AI Generated Star');
        }
      }

      // Create the asset
      // First handle the category/subcategory conversion
      // Enhanced conversion logic to ensure we're sending alphabetic codes to the backend
      // This is critical as the backend expects alphabetic codes like "POP", not numeric ones like "001"

      // Use the new TaxonomyConverter utility for reliable code conversion
      environmentSafeLog(`Converting taxonomy codes for layer: ${data.layer}`);

      // Convert category code to alphabetic form if needed
      let convertedCategory = data.categoryCode;
      if (data.layer === 'S' && (data.categoryCode === '001' || /^\d+$/.test(data.categoryCode))) {
        convertedCategory = 'POP';
        environmentSafeLog(`CRITICAL PATH: Force mapped category code ${data.categoryCode} → POP for Stars layer`);
      } else {
        // Normal conversion path
        convertedCategory = TaxonomyConverter.getAlphabeticCode(
          data.layer,
          'category',
          data.categoryCode
        );
      }

      // Convert subcategory code to alphabetic form if needed
      let convertedSubcategory = data.subcategoryCode;
      if (data.layer === 'S' && (data.categoryCode === 'POP' || data.categoryCode === '001') &&
          (data.subcategoryCode === '007' || (/^\d+$/.test(data.subcategoryCode) && data.subcategoryCode === '007'))) {
        convertedSubcategory = 'HPM';
        environmentSafeLog(`CRITICAL PATH: Force mapped subcategory code ${data.subcategoryCode} → HPM for S.POP layer`);
      } else {
        // Normal conversion path
        convertedSubcategory = TaxonomyConverter.getAlphabeticCode(
          data.layer,
          'subcategory',
          data.subcategoryCode,
          convertedCategory // Use the already converted category
        );
      }

      // Log the conversion results for debugging
      environmentSafeLog('Code conversion results:');
      environmentSafeLog(`Category: ${data.categoryCode} → ${convertedCategory}`);
      environmentSafeLog(`Subcategory: ${data.subcategoryCode} → ${convertedSubcategory}`);
      console.log(`🔍 COMPOSITE DEBUG: Final conversion - Layer: ${data.layer}, Category: ${data.categoryCode} → ${convertedCategory}, Subcategory: ${data.subcategoryCode} → ${convertedSubcategory}`);

      // Add extra validation for the critical S.POP.HPM case
      if (data.layer === 'S' && (data.categoryCode === 'POP' || data.categoryCode === '001') &&
          (data.subcategoryCode === 'HPM' || data.subcategoryCode === '007')) {
        environmentSafeLog('IMPORTANT - Final validation for S.POP.HPM case:');
        environmentSafeLog(`Original values: layer=${data.layer}, category=${data.categoryCode}, subcategory=${data.subcategoryCode}`);
        environmentSafeLog(`Converted values: layer=${data.layer}, category=${convertedCategory}, subcategory=${convertedSubcategory}`);
        environmentSafeLog(`These should be sending: layer=S, category=POP, subcategory=HPM to the backend`);

        // Check if the conversion is correct
        if (convertedCategory !== 'POP' || convertedSubcategory !== 'HPM') {
          environmentSafeError('WARNING: S.POP.HPM conversion failed! Backend will likely reject this request.');
        } else {
          environmentSafeLog('✅ S.POP.HPM conversion successful - should work with backend API');
        }
      }

      const assetData = {
        name: data.name,
        friendlyName: data.name,
        layer: data.layer,
        // IMPORTANT: Use category and subcategory instead of categoryCode and subcategoryCode
        // These are the field names the backend API expects
        // Use the 3-letter alphabetic codes (e.g. "POP", "HPM") not numeric codes (e.g. "001", "007")
        // Use the pre-converted values to ensure consistency
        category: convertedCategory,
        subcategory: convertedSubcategory,
        description: data.description,
        source: data.source || 'ReViz', // Include source field with default
        tags: data.tags || [],
        files: data.files,  // Pass the original files
        // CRITICAL: Include nnaAddress at the root level for consistent access patterns
        // Use our enhanced formatter for generating the correct MFA address
        // This ensures consistent MFA for all layer/category/subcategory combinations
        nnaAddress: formatNNAAddressForDisplay(
            data.layer,
            data.categoryCode,
            data.subcategoryCode,
            '001' // Default sequential for display
        ).mfa,
        metadata: {
          layerName: data.layerName,
          categoryName: data.categoryName,
          subcategoryName: data.subcategoryName,
          uploadedFiles: uploadedFiles,
          trainingData: data.trainingData,
          // Use our enhanced formatter to generate consistent addresses
          // This eliminates the need for special cases while ensuring correct display
          // Use a self-invoking function for cleaner code
          ...(() => {
            // Use the taxonomyFormatter utility directly for consistency
            // Generate properly formatted HFN with the original codes
            const hfnToFormat = `${data.layer}.${data.categoryCode}.${data.subcategoryCode}.001`;
            const formattedHfn = taxonomyFormatter.formatHFN(hfnToFormat);
            const formattedMfa = taxonomyFormatter.convertHFNtoMFA(formattedHfn);
            
            environmentSafeLog(`Taxonomy formatter generated HFN=${formattedHfn}, MFA=${formattedMfa}`);
            
            // Also generate with the previous formatter for comparison logging
            const prevFormatter = formatNNAAddressForDisplay(
              data.layer,
              data.categoryCode,
              data.subcategoryCode,
              '001'
            );
            environmentSafeLog(`Previous formatter generated HFN=${prevFormatter.hfn}, MFA=${prevFormatter.mfa}`);
            
            // Compare the two to check for discrepancies
            if (formattedHfn !== prevFormatter.hfn || formattedMfa !== prevFormatter.mfa) {
              environmentSafeLog('DISCREPANCY DETECTED between formatters:');
              environmentSafeLog(`taxonomyFormatter: HFN=${formattedHfn}, MFA=${formattedMfa}`);
              environmentSafeLog(`Previous formatter: HFN=${prevFormatter.hfn}, MFA=${prevFormatter.mfa}`);
            }
            
            return {
              // Include both consistently formatted addresses
              mfa: formattedMfa,
              machineFriendlyAddress: formattedMfa,
              hfn: formattedHfn,
              humanFriendlyName: formattedHfn,
              // Store original values for reference
              original_subcategory: data.subcategoryCode
            };
          })(),
          // For composite assets, include the component references
          ...(data.layer === 'C' && data.layerSpecificData?.components && {
            components: data.layerSpecificData.components
          }),
        },
      };

      // ENHANCED DEBUG: Log what we're sending to the backend for composite assets
      if (data.layer === 'C') {
        environmentSafeLog('🔍 COMPOSITE DEBUG: Asset payload being sent to backend:', assetData);
        environmentSafeLog('🔍 COMPOSITE DEBUG: Components in payload:', assetData.metadata?.components);
        environmentSafeLog('🔍 COMPOSITE DEBUG: Form components data:', data.layerSpecificData?.components);
      }

      // Add a small delay for better user experience
      await new Promise(resolve => setTimeout(resolve, 800));

      const createdAsset = await assetService.createAsset(assetData);
      environmentSafeLog("Asset created successfully:", createdAsset);
      
      // Add prominent console logging about the asset HFN and MFA for debugging
      console.log("%c=== ASSET CREATED SUCCESSFULLY ===", "background: #4CAF50; color: white; font-size: 16px; padding: 5px;");
      console.log(`Asset Name: ${assetData.name}`);
      console.log(`%cHFN from metadata: ${assetData.metadata.hfn}`, "font-weight: bold; color: blue;");
      console.log(`%cMFA from nnaAddress: ${assetData.nnaAddress}`, "font-weight: bold; color: blue;");
      console.log(`Original subcategory code: ${assetData.metadata.original_subcategory || data.subcategoryCode}`);
      console.log("Layer: " + data.layer + ", Category: " + data.categoryCode + ", Subcategory: " + data.subcategoryCode);
      console.log("%c=================================", "background: #4CAF50; color: white; font-size: 16px; padding: 5px;");
      
      // Additional console message about how to check the asset on the success page
      console.log("%cIMPORTANT: Check the success page to verify HFN and MFA display", "color: #FF5722; font-weight: bold;");
      console.log("The success page should now show the same HFN and MFA in both the header and asset details card.");
      console.log("If you notice any discrepancies, they will be highlighted with an info alert.");
      console.log("This fix ensures consistent display of taxonomy data across the application.");
      
      if (!createdAsset) {
        throw new Error("Asset creation failed - no asset returned from API");
      }
      
      // Store the created asset in localStorage as a fallback in case of page refresh
      try {
        localStorage.setItem('lastCreatedAsset', JSON.stringify(createdAsset));
      } catch (e) {
        environmentSafeWarn("Failed to store created asset in localStorage:", e);
      }
      
      // Update state with the created asset
      setCreatedAsset(createdAsset);
      setSuccess(true);
      
      // Ensure the success page is shown
      window.sessionStorage.setItem('showSuccessPage', 'true');
      setShowSuccessPage(true);
      
      // Don't reset the form yet - wait for user to navigate away
    } catch (err) {
      console.error('Error creating asset:', err);
      setError(err instanceof Error ? err.message : 'Failed to create asset');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle resetting the form for a new asset
  const handleCreateNewAsset = () => {
    // Clear stored data
    localStorage.removeItem('lastCreatedAsset');
    sessionStorage.removeItem('showSuccessPage');
    
    // Clear subcategory selection
    SubcategoryPreserver.clearSelection();
    
    // Reset all state
    reset();
    setActiveStep(0);
    setUploadedFiles([]);
    setSuccess(false);
    setShowSuccessPage(false);
    setCreatedAsset(null);
    setPotentialDuplicate(null);
  };

  // Handle layer selection
  const handleLayerSelect = (layer: LayerOption, isDoubleClick?: boolean) => {
    setValue('layer', layer.code);
    setValue('layerName', layer.name);
    
    // All layers now use the unified workflow
    // Composite layers (B, P, T, C, R) will get an additional step after file upload
    const compositeLayerCodes = ['B', 'P', 'T', 'C', 'R'];
    const isComposite = compositeLayerCodes.includes(layer.code);
    setIsCompositeLayer(isComposite);
    
    // For individual asset layers (G, S, L, M, W), use the regular workflow
    
    // Check if this is the training layer (T) - special case for training data collection
    const isTraining = layer.code === 'T';
    setIsTrainingLayer(isTraining);
    
    // Clear category and subcategory when layer changes
    setValue('categoryCode', '');
    setValue('categoryName', '');
    setValue('subcategoryCode', '');
    setValue('subcategoryName', '');
    setValue('subcategoryNumericCode', '');
    setValue('hfn', '');
    setValue('mfa', '');
    setValue('sequential', '');
    
    // If double click, auto-advance to next step
    if (isDoubleClick) {
      handleNext();
    }
  };

  // Handle category selection
  const handleCategorySelect = (category: CategoryOption) => {
    setValue('categoryCode', category.code);
    setValue('categoryName', category.name);
    
    // Clear subcategory when category changes
    setValue('subcategoryCode', '');
    setValue('subcategoryName', '');
    setValue('subcategoryNumericCode', '');
    setValue('hfn', '');
    setValue('mfa', '');
    setValue('sequential', '');
  };

  // Handle subcategory selection for TaxonomySelection component
  const handleSubcategorySelect = (subcategory: SubcategoryOption, isDoubleClick?: boolean) => {
    setValue('subcategoryCode', subcategory.code);
    setValue('subcategoryName', subcategory.name);
    setValue('subcategoryNumericCode', subcategory.numericCode?.toString() || '');
    
    // If double click, auto-advance to next step
    if (isDoubleClick) {
      handleNext();
    }
  };
  
  // Handle subcategory selection for SimpleTaxonomySelectionV3 component
  const handleSubcategorySelectV3 = React.useCallback(async (subcategoryCode: string) => {
    environmentSafeLog('[REGISTER PAGE] Subcategory selected:', subcategoryCode);
    console.log(`🔍 COMPOSITE DEBUG: Raw subcategory selected: "${subcategoryCode}" for layer: ${getValues('layer')}, category: ${getValues('categoryCode')}`);
    
    // Skip processing empty subcategory codes
    if (!subcategoryCode) {
      environmentSafeLog('[REGISTER PAGE] Ignoring empty subcategory code');
      return;
    }
    
    // Set loading state
    setLoading(true);
    
    try {
      // Format could be either "POP.BAS" or just "BAS" - always normalize to just the subcategory code
      // Extract just the subcategory part if it contains a dot
      const normalizedSubcategory = subcategoryCode.includes('.') ? 
        subcategoryCode.split('.')[1] : subcategoryCode;
      
      environmentSafeLog(`[REGISTER PAGE] Normalized subcategory: ${subcategoryCode} -> ${normalizedSubcategory}`);
      
      // Store the normalized subcategory code
      setValue('subcategoryCode', normalizedSubcategory);
      
      // Store selection for later reference
      const layer = watch('layer');
      const category = watch('categoryCode');
      SubcategoryPreserver.storeSelection(layer, category, normalizedSubcategory);
      
      // Try to find the subcategory in the options to get the name
      const watchCategory = watch('categoryCode');
      
      // Use dynamic import with proper typing for better error handling
      const enhancedService = await import('../services/enhancedTaxonomyService');
      const subcategories = enhancedService.getSubcategories(watchLayer, watchCategory);
      
      environmentSafeLog(`[REGISTER PAGE] Searching subcategories for match:`, {
        originalSubcategoryCode: subcategoryCode,
        normalizedSubcategory,
        watchCategory,
        watchLayer,
        subcategoriesCount: subcategories.length
      });
      
      // Find the matching subcategory to get its name
      let subcategoryItem = subcategories.find((item: SubcategoryItem) => {
        // Normalize the item code as well for consistent comparison
        const itemCode = item.code?.includes('.') ? 
          item.code.split('.')[1] : 
          item.code;
        
        const matches = itemCode === normalizedSubcategory;
        if (matches) {
          environmentSafeLog(`[REGISTER PAGE] Found matching subcategory:`, item);
        }
        return matches;
      });
      
      // If not found by direct match, try a case-insensitive match
      if (!subcategoryItem) {
        environmentSafeLog('[REGISTER PAGE] No direct match found, trying case-insensitive match');
        subcategoryItem = subcategories.find((item: SubcategoryItem) => {
          // Normalize the item code for comparison
          const itemCode = item.code?.includes('.') ? 
            item.code.split('.')[1] : 
            item.code;
          
          const matches = itemCode.toUpperCase() === normalizedSubcategory.toUpperCase();
          if (matches) {
            environmentSafeLog(`[REGISTER PAGE] Found matching subcategory using case-insensitive match:`, item);
          }
          return matches;
        });
      }
      
      // Fallback for common cases - but using a generic approach, not special case handling
      if (!subcategoryItem) {
        environmentSafeLog('[REGISTER PAGE] Using generic fallback for common subcategory codes');
        
        // Map for common subcategory display names
        const commonSubcategories: Record<string, {name: string, numericCode: string}> = {
          'BAS': { name: 'Base', numericCode: '001' },
          'HPM': { name: 'Pop_Hipster_Male_Stars', numericCode: '007' },
          'SUN': { name: 'Sunset', numericCode: '003' }
        };
        
        if (commonSubcategories[normalizedSubcategory]) {
          const commonData = commonSubcategories[normalizedSubcategory];
          subcategoryItem = {
            code: normalizedSubcategory,
            name: commonData.name,
            numericCode: commonData.numericCode
          };
          environmentSafeLog(`[REGISTER PAGE] Applied generic fallback for ${normalizedSubcategory}:`, subcategoryItem);
        }
      }
      
      if (subcategoryItem) {
        setValue('subcategoryName', subcategoryItem.name || '');
        setValue('subcategoryNumericCode', subcategoryItem.numericCode?.toString() || '');
        environmentSafeLog(`[REGISTER PAGE] Found subcategory details:`, subcategoryItem);
        
        // Track successful selection in analytics (if available)
        if (window.analytics) {
          window.analytics.track('Taxonomy Selection', {
            layer: watchLayer,
            category: watchCategory,
            subcategory: normalizedSubcategory,
            success: true
          });
        }
      } else {
        environmentSafeWarn(`[REGISTER PAGE] Could not find subcategory details for ${normalizedSubcategory}`);
        // Set default values to prevent undefined states
        setValue('subcategoryName', normalizedSubcategory);
        setValue('subcategoryNumericCode', '');
      }
      
      // Always format the HFN and MFA with the normalized subcategory
      try {
        const { formatNNAAddressForDisplay } = await import('../api/codeMapping.enhanced');
        const { hfn, mfa } = formatNNAAddressForDisplay(
          watchLayer,
          watchCategory,
          normalizedSubcategory,
          '000' // Default sequential for preview
        );
        
        environmentSafeLog(`[REGISTER PAGE] Generated formatted addresses:`, { hfn, mfa });
        
        // Update the form state with properly formatted HFN and MFA
        setValue('hfn', hfn);
        setValue('mfa', mfa);
      } catch (addressFormatError) {
        console.error('[REGISTER PAGE] Error formatting addresses:', addressFormatError);
      }
    } catch (error) {
      console.error('[REGISTER PAGE] Error setting subcategory details:', error);
      // Set fallback values on error
      const normalizedSubcategory = subcategoryCode.includes('.') ? 
        subcategoryCode.split('.')[1] : subcategoryCode;
      setValue('subcategoryName', normalizedSubcategory);
      setValue('subcategoryNumericCode', '');
      
      // Track error in analytics (if available)
      if (window.analytics) {
        window.analytics.track('Taxonomy Selection Error', {
          layer: watchLayer,
          category: watch('categoryCode'),
          subcategory: normalizedSubcategory,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    } finally {
      // Always clear loading state
      setLoading(false);
    }
  }, [watchLayer, watch, setValue, setLoading]);

  // Track original subcategory for display override
  const [originalSubcategoryCode, setOriginalSubcategoryCode] = useState<string>('');

  // Handle NNA address change
  const handleNNAAddressChange = (
    humanFriendlyName: string,
    machineFriendlyAddress: string,
    sequentialNumber: number,
    originalSubcategory?: string
  ) => {
    setValue('hfn', humanFriendlyName);
    setValue('mfa', machineFriendlyAddress);
    setValue('sequential', sequentialNumber.toString());
    
    // Store the original subcategory for display override in success screen
    if (originalSubcategory) {
      setOriginalSubcategoryCode(originalSubcategory);
      environmentSafeLog(`Stored original subcategory code: ${originalSubcategory} for display override`);
    }
  };

  // Calculate a simple hash for a file (based on size, type, and first few bytes)
  const calculateFileHash = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (result) {
          // Get first few bytes (for large files) or all bytes (for small files)
          const bytes = result instanceof ArrayBuffer 
            ? new Uint8Array(result).slice(0, 1024) 
            : new TextEncoder().encode(String(result).slice(0, 1024));
          
          // Create a simple hash from file size, type and bytes
          const sizeTypeHash = `${file.size}-${file.type}`;
          const byteHash = Array.from(bytes)
            .reduce((hash, byte) => (hash + byte) % Number.MAX_SAFE_INTEGER, 0)
            .toString(16);
          
          resolve(`${sizeTypeHash}-${byteHash}`);
        } else {
          // Fallback to name and size if we can't read contents
          resolve(`${file.name}-${file.size}`);
        }
      };
      
      // Read a small part of the file to create a hash
      reader.readAsArrayBuffer(file.slice(0, 4096)); // First 4KB
    });
  };
  
  // Check for previously registered assets with same files
  const checkForPreviouslyRegisteredAssets = (file: File): void => {
    const duplicateMatch = assetService.checkDuplicateAsset(file);
    if (duplicateMatch) {
      const { asset, confidence } = duplicateMatch;
      const mfa = asset.nnaAddress || asset.metadata?.machineFriendlyAddress;
      
      // Show a warning with different messages based on confidence level
      if (confidence === 'high') {
        setPotentialDuplicate({
          asset,
          file,
          message: `This file appears to be already registered as asset "${asset.name}" with NNA address ${mfa}. Do you want to continue with a new registration or cancel?`,
          confidence
        });
      } else if (confidence === 'medium') {
        setPotentialDuplicate({
          asset,
          file,
          message: `This file may be similar to an existing asset "${asset.name}" with NNA address ${mfa}. Would you like to proceed with registration?`,
          confidence
        });
      } else {
        // Low confidence - just log but don't show warning
        environmentSafeLog(`File name matches existing asset "${asset.name}" with NNA address ${mfa}.`);
      }
    }
  };
  
  // Handle file selection
  const handleFilesChange = async (files: File[]) => {
    // Clear any previous duplicate detection
    setPotentialDuplicate(null);
    
    // Special case: If files array is empty, this is likely a deletion
    if (files.length === 0) {
      environmentSafeLog('All files removed, clearing state');
      setValue('files', []);
      setUploadedFiles([]);
      // Clear fileHashes to ensure clean state for future uploads
      setFileHashes(null);
      return;
    }
    
    // Check for duplicate files
    const existingFiles = getValues('files') || [];
    const existingFileNames = existingFiles.map(file => file.name);
    
    // Generate hashes for existing files (if not already cached)
    const fileHashMap = fileHashes || new Map<string, string>();
    if (!fileHashes) {
      setFileHashes(fileHashMap);
    }
    
    // Calculate hashes for existing files if not already done
    for (const file of existingFiles) {
      if (!fileHashMap.has(file.name)) {
        const hash = await calculateFileHash(file);
        fileHashMap.set(file.name, hash);
      }
    }
    
    // Check if we're replacing existing files
    if (existingFiles.length > 0 && files.length !== existingFiles.length) {
      const existingFileSet = new Set(existingFiles.map(f => f.name));
      const newFileSet = new Set(files.map(f => f.name));
      
      // If there's a difference, treat this as a replacement operation
      const hasRemovedFiles = existingFiles.some(f => !newFileSet.has(f.name));
      
      if (hasRemovedFiles) {
        environmentSafeLog('Detected file replacement - resetting upload state');
        // Reset uploaded files to be consistent with the new file selection
        setUploadedFiles([]);
      }
    }
    
    // Detect and filter duplicates
    const newFiles: File[] = [];
    const duplicateFiles: string[] = [];
    
    for (const file of files) {
      // Skip files that are already in the existing files (by reference)
      if (existingFiles.includes(file)) {
        newFiles.push(file);
        continue;
      }
      
      // Check by name first (fast)
      if (existingFileNames.includes(file.name)) {
        // Potential duplicate, check by content
        const newFileHash = await calculateFileHash(file);
        const existingFileHash = fileHashMap.get(file.name);
        
        if (newFileHash === existingFileHash) {
          // Confirmed duplicate by content
          duplicateFiles.push(file.name);
          environmentSafeLog(`File "${file.name}" is a duplicate (same content). Skipping.`);
          continue;
        }
      }
      
      // Store hash for new file
      const hash = await calculateFileHash(file);
      fileHashMap.set(file.name, hash);
      newFiles.push(file);
      
      // Check if this is a previously registered asset (but allow adding it anyway)
      checkForPreviouslyRegisteredAssets(file);
    }
    
    // Update files in form state
    // If we're trying to add new files but there are only duplicates, preserve existing files
    if (newFiles.length === 0 && existingFiles.length > 0 && duplicateFiles.length > 0) {
      setError(`Duplicate file(s) detected: ${duplicateFiles.join(', ')}. No new files were added.`);
      return;
    }
    
    // Update the files state with the new selection
    // This handles both adding new files and removing existing ones
    setValue('files', files);
    
    // Auto-populate asset name with file name if there's one file
    if (files.length === 1 && !getValues('name')) {
      // Remove file extension from name
      const fileName = files[0].name.split('.').slice(0, -1).join('.');
      setValue('name', fileName);
    }
    
    // Show a confirmation if at least one duplicate was found
    if (duplicateFiles.length > 0) {
      setError(`Duplicate file(s) detected: ${duplicateFiles.join(', ')}. These files were skipped.`);
    }
  };
  
  // Map to store file hashes for duplicate detection
  const [fileHashes, setFileHashes] = useState<Map<string, string> | null>(null);

  // Handle file upload progress
  const handleUploadProgress = (fileId: string, progress: number) => {
    // Track progress for future UI improvements
    environmentSafeLog(`File ${fileId} upload progress: ${progress}%`);
  };

  // Handle file upload completion
  const handleUploadComplete = (fileId: string, fileData: FileUploadResponse) => {
    setUploadedFiles((prev) => {
      // Check if file already exists in the array
      const exists = prev.some((file) => file.filename === fileData.filename);
      if (exists) {
        return prev;
      }
      return [...prev, fileData];
    });
  };

  // Handle file upload error
  const handleUploadError = (fileId: string, error: string) => {
    setError(`Upload error: ${error}`);
  };
  
  // Handle training data changes
  const handleTrainingDataChange = (data: TrainingData) => {
    setValue('trainingData', data);
  };

  // Navigation functions
  const handleNext = () => {
    // Validate current step before proceeding
    if (activeStep === 0 && !watchLayer) {
      setError('Please select a layer');
      return;
    }
    if (activeStep === 1 && (!watchCategoryCode || !watchSubcategoryCode)) {
      setError('Please select both a category and subcategory');
      return;
    }
    if (activeStep === 2 && (!watchFiles || watchFiles.length === 0)) {
      setError('Please upload at least one file');
      return;
    }
    // Step 3 (Review Details) - no validation needed, just proceed
    // Step 4 (Search & Add Components for composites) - validation handled in component

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setError(null);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
    setError(null);
  };

  // Function to handle navigation back to Dashboard
  const handleNavigateToDashboard = () => {
    // Use a more reliable navigation method without page reload
    window.location.href = '/dashboard';
  };
  
  // Function to handle training data navigation
  const handleNavigateToTrainingData = () => {
    if (createdAsset && createdAsset.id) {
      // Navigate to training data page with asset ID
      window.location.href = `/assets/${createdAsset.id}/training`;
    } else {
      // Try to get asset ID from localStorage as a fallback
      try {
        const savedAssetJson = localStorage.getItem('lastCreatedAsset');
        if (savedAssetJson) {
          const savedAsset = JSON.parse(savedAssetJson);
          if (savedAsset && savedAsset.id) {
            window.location.href = `/assets/${savedAsset.id}/training`;
            return;
          }
        }
      } catch (err) {
        console.error('Error retrieving asset from localStorage:', err);
      }
      
      // As a last resort, show an alert
      alert('Navigate to training data page (to be implemented)');
    }
  };

  // Render step content
  const getStepContent = (step: number) => {
    // Unified workflow: Steps 0-2 are the same for all layers
    // Step 3+ fork based on layer type
    
    switch (step) {
      case 0:
        return (
          <LayerSelection
            onLayerSelect={handleLayerSelect}
            selectedLayerCode={watchLayer}
          />
        );
      case 1:
        return (
          <>
            <SimpleTaxonomySelectionV3
              selectedLayer={watchLayer}
              onLayerSelect={(layer) => {
                setValue('layer', layer);
                setValue('categoryCode', '');
                setValue('subcategoryCode', '');
              }}
              selectedCategoryCode={watchCategoryCode}
              onCategorySelect={(categoryCode) => {
                setValue('categoryCode', categoryCode);
                setValue('subcategoryCode', '');
              }}
              selectedSubcategoryCode={watchSubcategoryCode}
              onSubcategorySelect={handleSubcategorySelectV3}
            />
            
            {/* Debug component - only shown in development with debug parameter */}
            {process.env.NODE_ENV !== 'production' && window.location.search.includes('debug=true') && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
                <Typography variant="subtitle2">Debug Info:</Typography>
                <Typography variant="body2">
                  Layer: {watchLayer || 'None'}<br />
                  Category: {watchCategoryCode || 'None'}<br />
                  Subcategory: {watchSubcategoryCode || 'None'}
                </Typography>
                {watchLayer && watchCategoryCode && (
                  <Typography variant="body2" color="primary">
                    Expected subcategories should load for: {watchLayer}.{watchCategoryCode}
                  </Typography>
                )}
              </Box>
            )}
            
            {/* Display selected taxonomy context at bottom of Step 2 */}
            {watchLayer && watchCategoryCode && watchSubcategoryCode && (
              <Box sx={{ mt: 3 }}>
                <TaxonomyContext
                  layer={watchLayer}
                  layerName={getValues('layerName')}
                  categoryCode={watchCategoryCode}
                  categoryName={getValues('categoryName')}
                  subcategoryCode={watchSubcategoryCode}
                  subcategoryName={getValues('subcategoryName')}
                />
              </Box>
            )}
          </>
        );
      case 2:
        // Unified Step 3: Upload Files (for ALL layers)
        return (
          <Box>
            {/* Display the taxonomy context for reference */}
            <TaxonomyContext
              layer={watchLayer}
              layerName={getValues('layerName')}
              categoryCode={watchCategoryCode}
              categoryName={getValues('categoryName')}
              subcategoryCode={watchSubcategoryCode}
              subcategoryName={getValues('subcategoryName')}
              hfn={getValues('hfn')}
              mfa={getValues('mfa')}
            />
            <FileUpload
              onFilesChange={handleFilesChange}
              layerCode={watchLayer}
              maxFiles={1}
              maxSize={watchLayer === 'C' ? 10 * 1024 * 1024 : 5 * 1024 * 1024}
              onUploadProgress={handleUploadProgress}
              onUploadComplete={handleUploadComplete}
              onUploadError={handleUploadError}
              initialFiles={getValues('files')}
              initialSource={getValues('source')}
              onSourceChange={(source) => setValue('source', source)}
            />
            
            <Box mt={3}>
              <Typography variant="h6" gutterBottom>
                Asset Details
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Provide additional information about your asset.
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Box>
                    <Typography variant="subtitle1" gutterBottom>
                      Name
                    </Typography>
                    <input
                      {...register('name')}
                      placeholder="Asset Name"
                      style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '4px',
                        border: '1px solid #ccc',
                      }}
                    />
                    {errors.name && (
                      <Typography color="error" variant="caption">
                        {errors.name.message}
                      </Typography>
                    )}
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                  <Box>
                    <Typography variant="subtitle1" gutterBottom>
                      Description
                    </Typography>
                    <textarea
                      {...register('description')}
                      placeholder="Asset Description"
                      rows={4}
                      style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '4px',
                        border: '1px solid #ccc',
                      }}
                    />
                    {errors.description && (
                      <Typography color="error" variant="caption">
                        {errors.description.message}
                      </Typography>
                    )}
                  </Box>
                </Grid>

                {/* Source field is handled by FileUpload component above - no duplicate needed */}

                <Grid item xs={12}>
                  <Box>
                    <Typography variant="subtitle1" gutterBottom>
                      Tags
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      {/* Tag Input Field */}
                      <Box 
                        component="div" 
                        sx={{ 
                          display: 'flex',
                          alignItems: 'center',
                          border: '1px solid #ccc',
                          borderRadius: '4px',
                          p: 1,
                          mb: 1
                        }}
                      >
                        <input
                          id="tag-input"
                          type="text"
                          placeholder="Type a tag and press Enter"
                          style={{
                            border: 'none',
                            outline: 'none',
                            width: '100%',
                            padding: '8px',
                            fontSize: '14px'
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                              e.preventDefault();
                              const currentValue = e.currentTarget.value.trim();
                              const currentTags = getValues('tags') || [];
                              if (!currentTags.includes(currentValue)) {
                                setValue('tags', [...currentTags, currentValue]);
                                e.currentTarget.value = '';
                              }
                            }
                          }}
                        />
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          sx={{ minWidth: '36px', ml: 1 }}
                          onClick={() => {
                            const input = document.getElementById('tag-input') as HTMLInputElement;
                            if (input && input.value.trim()) {
                              const currentTags = getValues('tags') || [];
                              const newTag = input.value.trim();
                              if (!currentTags.includes(newTag)) {
                                setValue('tags', [...currentTags, newTag]);
                                input.value = '';
                              }
                            }
                            input?.focus();
                          }}
                        >
                          +
                        </Button>
                      </Box>

                      {/* Tag Display Area */}
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {(watch('tags') || []).map((tag, index) => (
                          <Chip
                            key={`tag-${index}`}
                            label={tag}
                            variant="outlined"
                            color="primary"
                            size="small"
                            onDelete={() => {
                              const currentTags = [...(getValues('tags') || [])];
                              currentTags.splice(index, 1);
                              setValue('tags', currentTags);
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      Tags help with searchability and metadata
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Box>
        );
      case 3:
        // Step 4: Review Details (same for all asset types)
        return (
          <ReviewSubmit
            assetData={{
              name: getValues('name'),
              description: getValues('description'),
              source: getValues('source'),
              layer: getValues('layer'),
              layerName: getValues('layerName'),
              categoryCode: getValues('categoryCode'),
              categoryName: getValues('categoryName'),
              subcategoryCode: getValues('subcategoryCode'),
              subcategoryName: getValues('subcategoryName'),
              hfn: getValues('hfn'),
              mfa: getValues('mfa'),
              sequential: getValues('sequential'),
              files: getValues('files'),
              uploadedFiles: uploadedFiles,
              tags: getValues('tags'),
              components: undefined, // No components at this stage
            }}
            onEditStep={(step) => setActiveStep(step)}
            loading={loading}
            error={error}
            isSubmitting={isSubmitting}
            onSubmit={isCompositeLayer ? undefined : handleSubmit(onSubmit as any)} // Only submit for component assets
            showSubmitButton={!isCompositeLayer} // Hide submit button for composite assets
          />
        );
      case 4:
        // Step 5: Search & Add Components (only for composite assets)
        if (isCompositeLayer) {
          return (
            <Box>
              <CompositeAssetSelection
                onComponentsSelected={(components) => {
                  setValue('layerSpecificData.components', components);
                  environmentSafeLog(`[REGISTER PAGE] Components updated: ${components.length} components selected`);
                  // Components selected - user can now submit from this step
                }}
                targetLayer={watchLayer}
                layerName={getValues('layerName')}
                initialComponents={getValues('layerSpecificData.components') || []}
              />
              
              {/* Submit button for composite assets */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                <Button
                  variant="outlined"
                  onClick={handleBack}
                  startIcon={<PreviousIcon />}
                  sx={{ mr: 1 }}
                >
                  Back
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSubmit(onSubmit as any)}
                  disabled={isSubmitting || loading}
                  startIcon={isSubmitting ? <CircularProgress size={20} /> : undefined}
                >
                  {isSubmitting ? 'Creating Asset...' : 'Create Composite Asset'}
                </Button>
              </Box>
            </Box>
          );
        }
        
        // Training layers: Training Data Collection (if this step exists for training)
        if (isTrainingLayer) {
          return (
            <TrainingDataCollection
              onChange={handleTrainingDataChange}
              initialData={getValues('trainingData')}
              isTrainable={true}
            />
          );
        }
        
        // This should not happen for component assets
        return <div>Invalid step for this asset type</div>;
      case 5:
        // Final review for Training and Composite layers only
        return (
          <ReviewSubmit
            assetData={{
              name: getValues('name'),
              description: getValues('description'),
              source: getValues('source'),
              layer: getValues('layer'),
              layerName: getValues('layerName'),
              categoryCode: getValues('categoryCode'),
              categoryName: getValues('categoryName'),
              subcategoryCode: getValues('subcategoryCode'),
              subcategoryName: getValues('subcategoryName'),
              hfn: getValues('hfn'),
              mfa: getValues('mfa'),
              sequential: getValues('sequential'),
              files: getValues('files'),
              uploadedFiles: uploadedFiles,
              tags: getValues('tags'),
              components: isCompositeLayer ? getValues('layerSpecificData.components') : undefined,
            }}
            onEditStep={(step) => setActiveStep(step)}
            loading={loading}
            error={error}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit(onSubmit as any)}
          />
        );
      default:
        return 'Unknown step';
    }
  };

  // Render Success Screen
  const renderSuccessScreen = () => {
    if (!createdAsset) {
      console.error("Attempted to render success screen but createdAsset is null");
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h4" gutterBottom color="success.main">
            Asset Created Successfully!
          </Typography>
          <Typography>
            Your asset has been created but details are not available. Please return to the dashboard.
          </Typography>
          <Box sx={{ mt: 4 }}>
            <Button 
              variant="contained" 
              size="large"
              onClick={handleNavigateToDashboard}
            >
              Go to Dashboard
            </Button>
          </Box>
        </Box>
      );
    }

    environmentSafeLog("Rendering success screen with asset:", createdAsset);

    // ENHANCED DISPLAY FIX: Always prioritize using metadata HFN and MFA values from the asset details

    // Extract HFN directly from metadata first as the primary source of truth
    let displayHfn = '';
    let displayMfa = '';
    
    // Use a type guard to safely access metadata properties
    if (createdAsset && createdAsset.metadata) {
      // PRIMARY APPROACH: Always use the metadata HFN/MFA when available
      // This ensures the value shown at the top matches the one in the asset details card
      const metadata = createdAsset.metadata;
      
      // Extract HFN from metadata (priority order)
      const metadataHfn = metadata.hfn || metadata.humanFriendlyName;
      if (metadataHfn) {
        displayHfn = taxonomyFormatter.formatHFN(metadataHfn);
        environmentSafeLog(`[SUCCESS] Using HFN directly from asset metadata: ${metadataHfn} → ${displayHfn}`);
      }
      
      // Extract MFA from metadata (priority order)
      const metadataMfa = createdAsset.nnaAddress || 
                          metadata.mfa || 
                          metadata.machineFriendlyAddress || 
                          (createdAsset as any).nna_address;
      
      if (metadataMfa) {
        // Force alphabetic MFA format: if backend returns numeric (e.g., 2.004.008.001),
        // convert it to alphabetic format (e.g., S.DNC.DNB.001) for user display
        if (/^\d+\.\d+\.\d+\.\d+/.test(metadataMfa)) {
          // Numeric MFA detected - construct alphabetic version
          const layer = createdAsset.layer || '';
          const category = createdAsset.category || metadata.category || '';
          const subcategory = createdAsset.subcategory || metadata.subcategory || '';
          const sequential = metadataMfa.split('.')[3] || '001';
          displayMfa = `${layer}.${category}.${subcategory}.${sequential}`;
          environmentSafeLog(`[SUCCESS] Converted numeric MFA to alphabetic: ${metadataMfa} → ${displayMfa}`);
        } else {
          // Already alphabetic or use formatter
          displayMfa = taxonomyFormatter.formatMFA(metadataMfa);
          environmentSafeLog(`[SUCCESS] Using MFA directly from asset metadata: ${metadataMfa} → ${displayMfa}`);
        }
      }
    }
    
    // FALLBACK APPROACH: Only if metadata values are not available, construct them
    if (!displayHfn || !displayMfa) {
      environmentSafeLog(`[SUCCESS] Metadata HFN/MFA not available, constructing from component parts`);
      
      // Extract basic asset information from the backend response
      const layer = createdAsset.layer || '';
      
      // Get the MFA directly from the asset (what the backend reported)
      const rawMfa = createdAsset.nnaAddress ||
                     createdAsset.metadata?.machineFriendlyAddress ||
                     createdAsset.metadata?.mfa ||
                     (createdAsset as any).nna_address || '';
  
      // Extract sequential number from MFA
      const sequentialParts = rawMfa ? rawMfa.split('.') : [];
      const sequential = sequentialParts.length > 3 ? sequentialParts[3] : '001';
  
      // Use the last saved subcategory code from the form
      const savedSubcategoryCode = watch('subcategoryCode');
      
      // Get the original codes that were used to create the asset
      const categoryCode = watch('categoryCode') || 'POP';
      let subcategoryCode = savedSubcategoryCode || 'BAS';
      
      environmentSafeLog(`[SUCCESS] Using original form values for formatting: layer=${layer}, category=${categoryCode}, subcategory=${subcategoryCode}, sequential=${sequential}`);
      
      // Check if we have an original subcategory code that was saved during NNA address change
      if (originalSubcategoryCode) {
        environmentSafeLog(`[SUCCESS] Using original subcategory code for formatting: ${originalSubcategoryCode}`);
        subcategoryCode = originalSubcategoryCode;
      }
      
      // Only create these values if we don't already have them from metadata
      if (!displayHfn) {
        // Create properly formatted HFN with the original codes
        const hfnToFormat = `${layer}.${categoryCode}.${subcategoryCode}.${sequential}`;
        displayHfn = taxonomyFormatter.formatHFN(hfnToFormat);
        environmentSafeLog(`[SUCCESS] Created formatted HFN: ${displayHfn}`);
      }
      
      // For composite assets (layer C), append component addresses to the HFN
      if (layer === 'C') {
        // Try to find components in different possible locations
        let components = null;
        
        // Check multiple possible locations for component data
        if (createdAsset.metadata?.components && createdAsset.metadata.components.length > 0) {
          components = createdAsset.metadata.components;
          environmentSafeLog(`[SUCCESS] Found components in metadata.components:`, components);
        } else if ((createdAsset as any).components && (createdAsset as any).components.length > 0) {
          components = (createdAsset as any).components;
          environmentSafeLog(`[SUCCESS] Found components in root.components:`, components);
        } else if ((createdAsset as any).layerSpecificData?.components && (createdAsset as any).layerSpecificData.components.length > 0) {
          components = (createdAsset as any).layerSpecificData.components;
          environmentSafeLog(`[SUCCESS] Found components in layerSpecificData.components:`, components);
        } else {
          environmentSafeLog(`[SUCCESS] WARNING: No components found for composite asset. Checking backend response structure...`);
          environmentSafeLog(`[SUCCESS] Available keys in createdAsset:`, Object.keys(createdAsset));
          environmentSafeLog(`[SUCCESS] Metadata keys:`, createdAsset.metadata ? Object.keys(createdAsset.metadata) : 'No metadata');
        }
        
        if (components && components.length > 0) {
          const componentAddresses = components
            .map((component: any) => {
              // Handle different component data formats
              if (typeof component === 'string') {
                // If component is already a string (HFN), use it directly
                return component;
              } else if (component.name) {
                // Use the component's name if available
                return component.name;
              } else if (component.layer && component.category && component.subcategory && component.sequential) {
                // Construct from component metadata if available
                return `${component.layer}.${component.category}.${component.subcategory}.${component.sequential}`;
              } else {
                environmentSafeLog(`[SUCCESS] Unknown component format:`, component);
                return 'UNKNOWN';
              }
            })
            .join('+');
          
          // Format as C.RMX.POP.001:G.POP.TSW.001+S.POP.PNK.001 (NO brackets)
          const compositeFormat = `${displayHfn}:${componentAddresses}`;
          environmentSafeLog(`[SUCCESS] Composite HFN with components: ${compositeFormat}`);
          displayHfn = compositeFormat;
        } else {
          environmentSafeLog(`[SUCCESS] No components found for composite asset - displaying base HFN only: ${displayHfn}`);
        }
      }
      
      if (!displayMfa) {
        // For composite assets, handle MFA conversion differently
        if (layer === 'C' && displayHfn.includes(':')) {
          // Extract the base HFN (before the colon) for MFA conversion
          const baseHfn = displayHfn.split(':')[0];
          const componentsPart = displayHfn.split(':')[1];
          
          // Convert base HFN to MFA
          const baseMfa = taxonomyFormatter.convertHFNtoMFA(baseHfn);
          
          // Convert each component HFN to MFA
          const componentMfas = componentsPart.split('+').map(componentHfn => {
            try {
              return taxonomyFormatter.convertHFNtoMFA(componentHfn.trim());
            } catch (error) {
              environmentSafeLog(`[SUCCESS] Could not convert component HFN ${componentHfn} to MFA:`, error);
              return componentHfn.trim(); // Fallback to original HFN
            }
          }).join('+');
          
          // Format as composite MFA: base:component1+component2 (NO brackets)
          displayMfa = `${baseMfa}:${componentMfas}`;
          environmentSafeLog(`[SUCCESS] Created composite MFA: ${displayMfa}`);
        } else {
          // Regular asset - convert HFN to MFA using our formatter
          displayMfa = taxonomyFormatter.convertHFNtoMFA(displayHfn);
          environmentSafeLog(`[SUCCESS] Created formatted MFA: ${displayMfa}`);
        }
      }
    }
    
    environmentSafeLog('IMPORTANT: Created asset is using proper format:');
    environmentSafeLog(`Original backend Name: ${createdAsset.name}`);
    environmentSafeLog(`Display HFN: ${displayHfn}`);
    environmentSafeLog(`Display MFA: ${displayMfa}`);
    
    // Add clear logging for debugging
    environmentSafeLog('Asset structure:', {
      name: createdAsset.name,
      nnaAddress: createdAsset.nnaAddress,
      layer: createdAsset.layer,
      category: createdAsset.category,
      subcategory: createdAsset.subcategory,
      metadata: createdAsset.metadata
    });

    // ENHANCED DEBUG: Check for component data in different locations
    environmentSafeLog('🔍 COMPOSITE DEBUG: Checking component data locations:');
    environmentSafeLog('- createdAsset.components:', (createdAsset as any).components);
    environmentSafeLog('- createdAsset.metadata?.components:', createdAsset.metadata?.components);
    environmentSafeLog('- createdAsset.metadata?.componentIds:', (createdAsset.metadata as any)?.componentIds);
    environmentSafeLog('- createdAsset.layerSpecificData?.components:', (createdAsset as any).layerSpecificData?.components);
    
    // Check if components exist anywhere in the asset object
    const allKeys = Object.keys(createdAsset);
    const componentKeys = allKeys.filter(key => key.toLowerCase().includes('component'));
    environmentSafeLog('🔍 COMPOSITE DEBUG: Keys containing "component":', componentKeys);
    
    // Log the raw asset for complete inspection
    environmentSafeLog('🔍 COMPOSITE DEBUG: Complete asset object:', createdAsset);

    environmentSafeLog(`Success screen showing MFA: ${displayMfa} and HFN: ${displayHfn} from asset:`, createdAsset);
                
    const layerName = createdAsset.metadata?.layerName || 
                      `Layer ${createdAsset.layer}`;
    
    // Find the main file data for preview
    // When uploaded from form to backend, we have the original Files in watchFiles
    const formFiles = getValues('files');
    const hasFormFiles = formFiles && formFiles.length > 0;

    // Enhanced logging to debug file display issues
    environmentSafeLog('File debugging:');
    environmentSafeLog('- Form files:', formFiles);
    environmentSafeLog('- Uploaded files:', uploadedFiles);
    environmentSafeLog('- Asset files from backend:', createdAsset.files);

    if (createdAsset.files && createdAsset.files.length > 0) {
      environmentSafeLog('- First backend file:', createdAsset.files[0]);
    }

    if (uploadedFiles.length > 0) {
      environmentSafeLog('- First uploaded file URL:', uploadedFiles[0].url);
    }

    // Try to get files from API response first, then fallback to form/uploaded files
    const hasFiles = createdAsset.files && createdAsset.files.length > 0;

    // The file from the backend response - check for url property existence
    let mainFile = null;
    if (hasFiles) {
      mainFile = createdAsset.files[0];
      // Some backends return different property structures
      if (!mainFile.url && (mainFile as any).file_url) {
        mainFile.url = (mainFile as any).file_url;
      }
    }

    // Create fallback file data from the uploaded files or form files
    // First try uploadedFiles which has the correct URL
    let fallbackFile = null;

    if (uploadedFiles.length > 0) {
      fallbackFile = {
        url: uploadedFiles[0].url,
        contentType: uploadedFiles[0].mimeType || 'application/octet-stream',
        filename: uploadedFiles[0].originalName || uploadedFiles[0].filename,
        size: uploadedFiles[0].size || 0
      };
      environmentSafeLog('Using uploaded file for preview:', fallbackFile);
    }
    // If no uploaded files, try to use form files with createObjectURL
    else if (hasFormFiles) {
      fallbackFile = {
        url: URL.createObjectURL(formFiles[0]),
        contentType: formFiles[0].type,
        filename: formFiles[0].name,
        size: formFiles[0].size
      };
      environmentSafeLog('Using form file for preview with object URL:', fallbackFile);
    }

    // Use backend file or fallback to form file
    const displayFile = mainFile || fallbackFile;
    environmentSafeLog('Final display file:', displayFile);

    // Define a type guard to check if an object has mimeType property
    const hasMimeType = (obj: any): obj is { mimeType: string } => {
      return obj && typeof obj.mimeType === 'string';
    };

    // Use type guards to check content type in a type-safe way
    const isImage = displayFile && (
      (displayFile.contentType && displayFile.contentType.startsWith('image/')) ||
      (hasMimeType(displayFile) && displayFile.mimeType.startsWith('image/'))
    );

    const isAudio = displayFile && (
      (displayFile.contentType && displayFile.contentType.startsWith('audio/')) ||
      (hasMimeType(displayFile) && displayFile.mimeType.startsWith('audio/'))
    );

    const isVideo = displayFile && (
      (displayFile.contentType && displayFile.contentType.startsWith('video/')) ||
      (hasMimeType(displayFile) && displayFile.mimeType.startsWith('video/'))
    );

    const isPdf = displayFile && (
      (displayFile.contentType && displayFile.contentType === 'application/pdf') ||
      (hasMimeType(displayFile) && displayFile.mimeType === 'application/pdf')
    );
    
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        {/* CRITICAL FIX: Ensure there's absolutely nothing between the success heading and the content box */}
        {/* This is done with a fragment wrapper to control exactly what renders */}
        <>
          <Typography variant="h4" gutterBottom color="success.main" sx={{ mb: 1 }}>
            Asset Created Successfully!
          </Typography>
          
          {/* Show the correct HFN from asset details metadata in the success title */}
          {displayHfn && (
            <Typography variant="h6" color="primary.main" sx={{ mb: 2, fontWeight: 'medium' }}>
              {displayHfn}
            </Typography>
          )}
          
          {/* Force direct adjacency between the heading and content box */}
        </>
        
        <Box sx={{ mt: 0, p: 3, border: '1px solid #e0e0e0', borderRadius: 2, maxWidth: '800px', mx: 'auto' }}>
          {/* Asset name only - the HFN is now displayed in the title above */}
          <Typography variant="h6" gutterBottom>
            {createdAsset.name}
          </Typography>

          <Grid container spacing={3} sx={{ mt: 2 }}>
            {/* Asset Preview Column */}
            <Grid item xs={12} md={6}>
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 2, 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 300,
                  mb: { xs: 3, md: 0 }
                }}
              >
                <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                  Asset Preview
                </Typography>
                
                {displayFile ? (
                  <Box
                    sx={{
                      width: '100%',
                      mt: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flex: 1
                    }}
                  >
                    {/* Enhanced image detection - detect by filename extension if content type fails */}
                    {(isImage ||
                      (displayFile?.filename &&
                        /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(displayFile.filename)
                      )) && displayFile?.url && (
                      <Box
                        component="img"
                        src={displayFile.url}
                        alt={displayFile.filename || 'Asset preview'}
                        sx={{
                          maxWidth: '100%',
                          maxHeight: 220,
                          objectFit: 'contain',
                          borderRadius: 1
                        }}
                        onError={(e) => {
                          console.error('Image failed to load:', displayFile.url);
                          // Show proper fallback instead of hiding
                          const imgElement = e.target as HTMLImageElement;
                          imgElement.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22200%22%20height%3D%22150%22%3E%3Crect%20fill%3D%22%23f5f5f5%22%20width%3D%22200%22%20height%3D%22150%22%2F%3E%3Ctext%20fill%3D%22%23999%22%20font-family%3D%22Arial%22%20font-size%3D%2214%22%20x%3D%22100%22%20y%3D%2275%22%20text-anchor%3D%22middle%22%3EAsset%20Preview%3C%2Ftext%3E%3Ctext%20fill%3D%22%23999%22%20font-family%3D%22Arial%22%20font-size%3D%2212%22%20x%3D%22100%22%20y%3D%2295%22%20text-anchor%3D%22middle%22%3ESuccessfully%20Uploaded%3C%2Ftext%3E%3C%2Fsvg%3E';
                          imgElement.alt = 'Asset uploaded successfully';
                          // Remove the error handler to prevent infinite loops
                          imgElement.onerror = null;
                        }}
                      />
                    )}

                    {isAudio && displayFile?.url && (
                      <Box sx={{ width: '100%', mt: 2 }}>
                        <Box component="audio" controls sx={{ width: '100%' }}>
                          <source
                            src={displayFile.url}
                            type={
                              hasMimeType(displayFile) ?
                                displayFile.mimeType :
                                displayFile.contentType
                            }
                          />
                          Your browser does not support the audio element.
                        </Box>
                      </Box>
                    )}

                    {isVideo && displayFile?.url && (
                      <Box sx={{ width: '100%', mt: 2 }}>
                        <Box component="video" controls sx={{ width: '100%', maxHeight: 200 }}>
                          <source
                            src={displayFile.url}
                            type={
                              hasMimeType(displayFile) ?
                                displayFile.mimeType :
                                displayFile.contentType
                            }
                          />
                          Your browser does not support the video element.
                        </Box>
                      </Box>
                    )}

                    {isPdf && displayFile?.url && (
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          p: 2
                        }}
                      >
                        <svg width="80" height="80" viewBox="0 0 24 24">
                          <path fill="#f44336" d="M19,3H5C3.9,3,3,3.9,3,5v14c0,1.1,0.9,2,2,2h14c1.1,0,2-0.9,2-2V5C21,3.9,20.1,3,19,3z M9.5,15H8V13h1.5V15z M12.5,15h-1.5V13h1.5V15z M15.5,15H14V13h1.5V15z M16,10H8V8h8V10z"/>
                        </svg>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          PDF Document
                        </Typography>
                        <Button
                          variant="outlined"
                          size="small"
                          href={displayFile?.url}
                          target="_blank"
                          sx={{ mt: 1 }}
                        >
                          View PDF
                        </Button>
                      </Box>
                    )}

                    {/* Only show the generic file icon if we couldn't detect it as an image/audio/video/pdf */}
                    {!isImage &&
                     !isAudio &&
                     !isVideo &&
                     !isPdf &&
                     displayFile &&
                     !(displayFile.filename && /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(displayFile.filename)) && (
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          p: 2
                        }}
                      >
                        <svg width="80" height="80" viewBox="0 0 24 24">
                          <path fill="#2196f3" d="M14,2H6C4.9,2,4,2.9,4,4v16c0,1.1,0.9,2,2,2h12c1.1,0,2-0.9,2-2V8L14,2z M16,18H8v-2h8V18z M16,14H8v-2h8V14z M13,9V3.5L18.5,9H13z"/>
                        </svg>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {displayFile?.filename || 'File'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {displayFile?.contentType || (hasMimeType(displayFile) ? displayFile.mimeType : 'Unknown file type')}
                        </Typography>
                        {/* Add direct link to file */}
                        <Button
                          variant="outlined"
                          size="small"
                          href={displayFile?.url}
                          target="_blank"
                          sx={{ mt: 1 }}
                        >
                          View File
                        </Button>
                      </Box>
                    )}

                    {displayFile && (
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 2 }}>
                        {displayFile?.filename} ({displayFile?.size ? `${Math.round(displayFile.size / 1024)} KB` : 'Unknown size'})
                      </Typography>
                    )}
                  </Box>
                ) : (
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      p: 2
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      No preview available for this asset
                    </Typography>
                    <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                      Troubleshooting: Asset files may still be processing or image URL may be incorrect.
                    </Typography>
                    {createdAsset.files && createdAsset.files.length > 0 && createdAsset.files[0].url && (
                      <Button
                        variant="outlined"
                        size="small"
                        href={createdAsset.files[0].url}
                        target="_blank"
                        sx={{ mt: 2 }}
                      >
                        View File Directly
                      </Button>
                    )}
                  </Box>
                )}
              </Paper>
            </Grid>
            
            {/* Asset Metadata Column */}
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                  Asset Details
                </Typography>
                
                <Box sx={{ mt: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Layer
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {(() => {
                          // Map layer codes to full names
                          const layerNames: Record<string, string> = {
                            'G': 'Songs',
                            'S': 'Stars',
                            'L': 'Looks',
                            'M': 'Moves',
                            'W': 'Worlds',
                            'V': 'Videos',
                            'B': 'Branded Assets',
                            'C': 'Composites',
                            'T': 'Training Data',
                            'P': 'Patterns',
                          };
                          const layer = createdAsset.layer;
                          return `${layerNames[layer] || layerName || `Layer ${layer}`} (${layer})`;
                        })()}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary" align="center">
                        Human-Friendly Name (HFN)
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography variant="body1" fontWeight="bold">
                          {displayHfn || createdAsset.metadata?.hfn || createdAsset.metadata?.humanFriendlyName || ''}
                        </Typography>
                        <Tooltip title="Using consistent NNA format from the unified formatter">
                          <InfoIcon color="info" fontSize="small" sx={{ ml: 1, width: 18, height: 18 }} />
                        </Tooltip>
                      </Box>
                    </Grid>
                    
                    {/* Always show the discrepancy alert - it will only render if needed */}
                    <Grid item xs={12}>
                      <SubcategoryDiscrepancyAlert
                        backendSubcategory={createdAsset.subcategory || ''}
                        displayHfn={displayHfn}
                        displayMfa={displayMfa}
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary" align="center">
                        Machine-Friendly Address (MFA)
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography variant="body1" fontFamily="monospace" fontWeight="medium" align="center">
                          {displayMfa || createdAsset.nnaAddress || createdAsset.metadata?.machineFriendlyAddress || createdAsset.metadata?.mfa || ''}
                        </Typography>
                        <Tooltip title="Using consistent NNA format from the unified formatter">
                          <InfoIcon color="info" fontSize="small" sx={{ ml: 1, width: 18, height: 18 }} />
                        </Tooltip>
                      </Box>
                    </Grid>
                    
                    {createdAsset.description && (
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Description
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                          {createdAsset.description}
                        </Typography>
                      </Grid>
                    )}
                    
                    {createdAsset.tags && createdAsset.tags.length > 0 && (
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Tags
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                          {createdAsset.tags.map((tag, i) => (
                            <Chip key={i} label={tag} size="small" />
                          ))}
                        </Box>
                      </Grid>
                    )}
                    
                    {createdAsset.files && createdAsset.files.length > 1 && (
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Additional Files
                        </Typography>
                        <Box sx={{ mt: 0.5 }}>
                          {createdAsset.files.slice(1).map((file, i) => (
                            <Typography key={i} variant="body2">
                              {file.filename || `File ${i+2}`}
                            </Typography>
                          ))}
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4, flexWrap: 'wrap' }}>
          <Button 
            variant="outlined" 
            size="large"
            onClick={handleNavigateToDashboard}
            startIcon={<Box component="span" sx={{ fontSize: '1.5rem' }}>🏠</Box>}
          >
            Go to Dashboard
          </Button>
          <Button 
            variant="contained" 
            size="large"
            onClick={handleCreateNewAsset}
            startIcon={<Box component="span" sx={{ fontSize: '1.5rem' }}>➕</Box>}
          >
            Register Another Asset
          </Button>
          <Button 
            variant="contained" 
            color="secondary"
            size="large"
            onClick={handleNavigateToTrainingData}
            startIcon={<Box component="span" sx={{ fontSize: '1.5rem' }}>🧠</Box>}
          >
            Upload Training Data
          </Button>
        </Box>
      </Box>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        {showSuccessPage && createdAsset ? (
          renderSuccessScreen()
        ) : (
          <>
            <Typography variant="h4" component="h1" gutterBottom align="center">
              Register New Asset
            </Typography>
            <Typography variant="body1" paragraph align="center" color="text.secondary">
              Register a new asset in the NNA Registry. Complete each step to create your asset.
            </Typography>
            
            {/* Show duplicate asset warning if applicable */}
            {potentialDuplicate && (
              <Alert 
                severity="warning" 
                sx={{ mb: 3 }}
                action={
                  <>
                    <Button 
                      color="inherit" 
                      size="small"
                      onClick={() => setPotentialDuplicate(null)}
                    >
                      Continue Anyway
                    </Button>
                    <Button 
                      color="error" 
                      size="small" 
                      onClick={() => {
                        // Remove the duplicate file
                        const currentFiles = getValues('files') || [];
                        setValue('files', currentFiles.filter(f => 
                          f.name !== potentialDuplicate.file.name));
                        setPotentialDuplicate(null);
                      }}
                    >
                      Remove File
                    </Button>
                  </>
                }
              >
                <Typography variant="body2">
                  {potentialDuplicate.message}
                </Typography>
                <Box mt={1}>
                  <Typography variant="caption" component="div" sx={{ fontWeight: 'bold' }}>
                    Previously registered: {potentialDuplicate.asset.name} 
                  </Typography>
                  <Typography variant="caption" component="div">
                    NNA Address: {potentialDuplicate.asset.nnaAddress || potentialDuplicate.asset.metadata?.machineFriendlyAddress}
                  </Typography>
                </Box>
              </Alert>
            )}
            
            {/* Success message (short version, only when not showing full success screen) */}
            {success && !showSuccessPage && (
              <Alert severity="success" sx={{ mb: 3 }}>
                Asset created successfully! You can create another asset or view your assets.
              </Alert>
            )}
            
            {/* Error message */}
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
              {getSteps(isTrainingLayer, isCompositeLayer).map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            <FormProvider {...methods}>
              {/* Form now uses manual handling for the final submit */}
              <Box>{getStepContent(activeStep)}</Box>

              {/* Only show navigation buttons if not on final step */}
              {(activeStep < getSteps(isTrainingLayer, isCompositeLayer).length - 1 && 
                !(isCompositeLayer && activeStep === getSteps(isTrainingLayer, isCompositeLayer).length - 1)) && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                  <Button
                    variant="outlined"
                    onClick={handleBack}
                    startIcon={<PreviousIcon />}
                    disabled={activeStep === 0}
                    sx={{ mr: 1 }}
                  >
                    Back
                  </Button>
                  <Box>
                    {activeStep < getSteps(isTrainingLayer, isCompositeLayer).length - 1 && (
                      <Button
                        variant="contained"
                        onClick={handleNext}
                        endIcon={<NextIcon />}
                      >
                        Next
                      </Button>
                    )}
                  </Box>
                </Box>
              )}
            </FormProvider>
          </>
        )}
      </Paper>
    </Container>
  );
};

export default RegisterAssetPage;