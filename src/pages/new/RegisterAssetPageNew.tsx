import React, { useState, useEffect } from 'react';
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
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  ChevronLeft as PreviousIcon,
  ChevronRight as NextIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

// Import asset service for API calls
import assetService from '../../api/assetService';

// Import components
import LayerSelector from '../../components/asset/LayerSelectorV2';
import SimpleTaxonomySelection from '../../components/asset/SimpleTaxonomySelectionV2';
import FileUpload from '../../components/asset/FileUpload';
import ReviewSubmit from '../../components/asset/ReviewSubmit';
import TrainingDataCollection from '../../components/asset/TrainingDataCollection';
import { ComponentsForm } from '../../components/asset/ComponentsForm';

// Import new taxonomy components
import { TaxonomyDataProvider } from '../../providers/taxonomy/TaxonomyDataProvider';
import { TaxonomySelector } from '../../components/taxonomy';

// Import the simplified taxonomy service and context
import { taxonomyService } from '../../services/simpleTaxonomyService';
import { taxonomyFormatter } from '../../utils/taxonomyFormatter';
import { TaxonomyConverter } from '../../services/taxonomyConverter';
import { useTaxonomyContext } from '../../contexts/TaxonomyContext';

// Import styles
import '../../styles/SimpleTaxonomySelection.css';
import '../../styles/LayerSelector.css';

// Types
import {
  LayerOption,
  CategoryOption,
  SubcategoryOption,
} from '../../types/taxonomy.types';
import {
  FileUploadResponse,
  Asset,
  SOURCE_OPTIONS,
} from '../../types/asset.types';

// CRITICAL: Debugging to ensure the simplified taxonomy service is the source of truth
console.log('RegisterAssetPageNew using simplified taxonomy service');
console.log('Taxonomy service initialized:', !!taxonomyService);
console.log(
  'Available taxonomy methods:',
  Object.keys(taxonomyService).join(', ')
);

// Define LAYER_NUMERIC_CODES for local use
const LAYER_NUMERIC_CODES: Record<string, string> = {
  G: '1',
  S: '2',
  L: '3',
  M: '4',
  W: '5',
  B: '6',
  P: '7',
  T: '8',
  C: '9',
  R: '10',
};

// Layer names mapping
const LAYER_NAMES: Record<string, string> = {
  G: 'Song',
  S: 'Star',
  L: 'Look',
  M: 'Moves',
  W: 'World',
  B: 'Branded',
  P: 'Personalize',
  T: 'Training Data',
  C: 'Composites',
  R: 'Rights',
};

// Helper function to get layer name
const getLayerName = (layer: string): string => LAYER_NAMES[layer] || layer;

// Define the steps in the registration process
const getSteps = (isTrainingLayer: boolean, isCompositeLayer: boolean) => {
  if (isTrainingLayer) {
    return [
      'Select Layer',
      'Choose Taxonomy',
      'Upload Files',
      'Training Data',
      'Review & Submit',
    ];
  }
  if (isCompositeLayer) {
    return [
      'Select Layer',
      'Choose Taxonomy',
      'Select Components',
      'Upload Files',
      'Review & Submit',
    ];
  }
  return ['Select Layer', 'Choose Taxonomy', 'Upload Files', 'Review & Submit'];
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

/**
 * RegisterAssetPageNew 
 * A new version of the RegisterAssetPage that uses the TaxonomySelector component
 * for a more reliable taxonomy selection experience.
 */
const RegisterAssetPageNew: React.FC = () => {
  // Toggle between old and new UI
  const [useNewInterface, setUseNewInterface] = useState<boolean>(true);

  // FIXED: Add a ref to prevent checking navigation state on every render
  const isDirectNavigationCheckedRef = React.useRef(false);
  
  // CRITICAL FIX: Add throttling mechanism to prevent multiple rapid layer selections
  const layerSelectionThrottleRef = React.useRef<{
    lastLayer: string | null;
    lastTimestamp: number;
    throttleTimeout: NodeJS.Timeout | null;
  }>({ lastLayer: null, lastTimestamp: 0, throttleTimeout: null });

  // Use the shared taxonomy context from TaxonomyProvider
  const taxonomyContext = useTaxonomyContext({
    componentName: 'RegisterAssetPageNew',
    enableLogging: process.env.NODE_ENV === 'development',
  });

  // Check for any previously created asset in localStorage/sessionStorage
  // but in a way that doesn't cause re-renders
  const getStoredAssetData = () => {
    try {
      // The navigation check is now handled in a useEffect to prevent infinite loops
      // Just read the existing values from storage here
      const savedShowSuccessPage =
        window.sessionStorage.getItem('showSuccessPage') === 'true';
      let savedAsset = null;

      const savedAssetJson = localStorage.getItem('lastCreatedAsset');
      if (savedAssetJson) {
        savedAsset = JSON.parse(savedAssetJson);
      }

      return {
        showSuccessPage: savedShowSuccessPage,
        asset: savedAsset,
      };
    } catch (err) {
      console.error('Error retrieving stored asset data:', err);
      return { showSuccessPage: false, asset: null };
    }
  };

  const storedData = getStoredAssetData();

  // Handle navigation state only once on component mount
  React.useEffect(() => {
    if (!isDirectNavigationCheckedRef.current) {
      isDirectNavigationCheckedRef.current = true;

      // Check if this is a direct navigation
      const referrer = document.referrer;
      const isFromSuccessPage =
        referrer?.includes('register-asset') &&
        window.sessionStorage.getItem('directNavigation') !== 'true';

      // If the user came directly to register-asset via a menu link or direct URL,
      // we should start with a fresh form
      if (!isFromSuccessPage) {
        // Clear any previously stored data to ensure a fresh form
        window.sessionStorage.removeItem('showSuccessPage');
        localStorage.removeItem('lastCreatedAsset');
        console.log(
          'Direct navigation to Register Asset - clearing stored data (one-time check)'
        );
        window.sessionStorage.setItem('directNavigation', 'true');
      }
    }
  }, []);

  // IMPORTANT: Force real API mode for asset creation
  React.useEffect(() => {
    // Set forceMockApi to false to ensure we use the real backend
    localStorage.setItem('forceMockApi', 'false');
    console.log('FORCING REAL API MODE for asset creation');

    // Clean up on unmount
    return () => {
      // Don't remove this setting as we want it to persist
    };
  }, []);

  // State
  const [activeStep, setActiveStep] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(storedData.asset !== null);
  const [uploadedFiles, setUploadedFiles] = useState<FileUploadResponse[]>([]);
  const [isTrainingLayer, setIsTrainingLayer] = useState<boolean>(
    storedData.asset?.layer === 'T'
  );
  const [isCompositeLayer, setIsCompositeLayer] = useState<boolean>(
    storedData.asset?.layer === 'C'
  );
  const [showSuccessPage, setShowSuccessPage] = useState<boolean>(
    storedData.showSuccessPage
  );
  const [createdAsset, setCreatedAsset] = useState<Asset | null>(
    storedData.asset
  );
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

  // Create a formData object for the useEffect dependencies
  const formData = {
    layer: watchLayer,
    categoryCode: watchCategoryCode,
    subcategoryCode: watchSubcategoryCode,
    sequential: watch('sequential') || '001',
    fileType:
      watchFiles && watchFiles.length > 0
        ? watchFiles[0].name.split('.').pop()
        : '',
  };

  // Handle form submission - Optimized for performance
  const onSubmit: SubmitHandler<FormData> = async data => {
    try {
      if (process.env.NODE_ENV === 'development') {
        performance.mark('form-submission-start');
      }

      setLoading(true);
      setError(null);

      // Create more visually appealing loading UI
      const formContainer = document.querySelector('form');
      if (formContainer) {
        const existingIndicator = formContainer.querySelector(
          '.submission-indicator'
        );
        if (existingIndicator) {
          formContainer.removeChild(existingIndicator);
        }

        const confirmationEl = document.createElement('div');
        confirmationEl.className = 'submission-indicator';
        confirmationEl.innerHTML = `
          <div style="text-align: center; padding: 20px; position: relative; background-color: #f8f9fa; border-radius: 8px; border: 1px solid #e9ecef; margin: 20px 0; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
            <h3 style="margin-bottom: 10px; color: #1976d2;">Processing your submission...</h3>
            <p style="margin-bottom: 20px; color: #555;">Uploading files and registering your asset. Please wait.</p>
            <div style="display: flex; justify-content: center; margin-top: 20px;">
              <div style="width: 40px; height: 40px; border: 5px solid rgba(25, 118, 210, 0.2); border-top: 5px solid #1976d2; border-radius: 50%; animation: spin 1s linear infinite;"></div>
            </div>
            <div class="submission-progress" style="margin-top: 20px; text-align: left; padding: 10px; background-color: #fff; border-radius: 4px; border: 1px solid #eee; font-size: 14px; color: #666;">
              <p>Preparing submission data...</p>
            </div>
          </div>
          <style>
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          </style>
        `;
        formContainer.appendChild(confirmationEl);
      }

      // Helper function to update progress message
      const updateProgress = (message: string) => {
        if (formContainer) {
          const progressElement = formContainer.querySelector(
            '.submission-progress'
          );
          if (progressElement) {
            progressElement.innerHTML = `<p>${message}</p>`;
          }
        }
      };

      if (process.env.NODE_ENV === 'development') {
        console.log('Form data to submit:', {
          layer: data.layer,
          categoryCode: data.categoryCode,
          subcategoryCode: data.subcategoryCode,
          name: data.name,
          files: data.files?.length || 0,
          source: data.source,
          isValid: schema.isValidSync(data),
        });
      }

      updateProgress('Preparing file uploads...');
      const uploadPromises: Promise<any>[] = [];

      if (data.files && data.files.length > 0) {
        if (uploadedFiles.length < data.files.length) {
          const filesToUpload = data.files.filter(
            file =>
              !uploadedFiles.some(
                uploaded => uploaded.originalName === file.name
              )
          );

          updateProgress(`Uploading ${filesToUpload.length} file(s)...`);

          for (const file of filesToUpload) {
            const uploadPromise = assetService
              .uploadFile(file)
              .then(uploadResult => {
                if (uploadResult && uploadResult.response) {
                  const fileData = {
                    filename: uploadResult.response?.filename || file.name,
                    url: uploadResult.response?.url || '',
                    size: uploadResult.response?.size || file.size,
                    mimeType: uploadResult.response?.mimeType || file.type,
                    originalName: file.name,
                  };

                  setUploadedFiles(prev => [...prev, fileData]);
                  return fileData;
                }
                return null;
              });

            uploadPromises.push(uploadPromise);
          }

          if (uploadPromises.length > 0) {
            await Promise.all(uploadPromises);
          }
        }
      }

      updateProgress('Preparing asset data...');

      if (process.env.NODE_ENV === 'development') {
        console.log('Form data for asset creation:', {
          layer: data.layer,
          categoryCode: data.categoryCode,
          subcategoryCode: data.subcategoryCode,
          hfn: data.hfn,
          mfa: data.mfa,
          isNumericCategory: /^\d+$/.test(data.categoryCode),
          isNumericSubcategory: /^\d+$/.test(data.subcategoryCode),
        });

        console.log('IMPORTANT: Category/Subcategory Format Check:');
        console.log(
          `Category: ${data.categoryCode} (${
            /^\d+$/.test(data.categoryCode)
              ? 'NUMERIC - needs conversion'
              : 'ALPHABETIC - OK'
          })`
        );
        console.log(
          `Subcategory: ${data.subcategoryCode} (${
            /^\d+$/.test(data.subcategoryCode)
              ? 'NUMERIC - needs conversion'
              : 'ALPHABETIC - OK'
          })`
        );
      }

      // Convert numeric codes to alphabetic if needed for the backend API
      // This ensures consistent data for the backend API regardless of selection method
      let convertedCategory = data.categoryCode;
      let convertedSubcategory = data.subcategoryCode;

      // If category is numeric, convert it to alphabetic
      if (/^\d+$/.test(data.categoryCode)) {
        try {
          // Get all categories and find the one with matching numeric code
          const categories = taxonomyService.getCategories(data.layer);
          const categoryObj = categories.find(cat => cat.numericCode === data.categoryCode);
          
          if (categoryObj && categoryObj.code) {
            convertedCategory = categoryObj.code;
            console.log(
              `Converted numeric category ${data.categoryCode} to ${convertedCategory}`
            );
          }
        } catch (e) {
          console.warn('Failed to convert numeric category code:', e);
        }
      }

      // If subcategory is numeric, convert it to alphabetic
      if (/^\d+$/.test(data.subcategoryCode)) {
        try {
          // Get all subcategories and find the one with matching numeric code
          const subcategories = taxonomyService.getSubcategories(data.layer, convertedCategory);
          const subcategoryObj = subcategories.find(subcat => subcat.numericCode === data.subcategoryCode);
          
          if (subcategoryObj && subcategoryObj.code) {
            convertedSubcategory = subcategoryObj.code;
            console.log(
              `Converted numeric subcategory ${data.subcategoryCode} to ${convertedSubcategory}`
            );
          }
        } catch (e) {
          console.warn('Failed to convert numeric subcategory code:', e);
        }
      }

      // General logging for taxonomy conversion (no special cases)
      if (process.env.NODE_ENV === 'development') {
        console.log('TAXONOMY CONVERSION INFO:');
        console.log(
          `Original values: layer=${data.layer}, category=${data.categoryCode}, subcategory=${data.subcategoryCode}`
        );
        console.log(
          `Converted values: layer=${data.layer}, category=${convertedCategory}, subcategory=${convertedSubcategory}`
        );
        
        // General validation check (works for all combinations)
        if (data.categoryCode && data.subcategoryCode) {
          const isValidCategory = convertedCategory && convertedCategory.length > 0;
          const isValidSubcategory = convertedSubcategory && convertedSubcategory.length > 0;
          
          if (!isValidCategory || !isValidSubcategory) {
            console.warn('Taxonomy conversion may have issues - check the input values');
          } else {
            console.log('✅ Taxonomy conversion successful');
          }
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
        files: data.files, // Pass the original files
        // CRITICAL: Include nnaAddress at the root level for consistent access patterns
        // Use our simplified taxonomy service for ALL layers
        nnaAddress: taxonomyService.convertHFNtoMFA(
          `${data.layer}.${data.categoryCode}.${data.subcategoryCode}.001`
        ),
        metadata: {
          layerName: data.layerName,
          categoryName: data.categoryName,
          subcategoryName: data.subcategoryName,
          uploadedFiles: uploadedFiles,
          trainingData: data.trainingData,
          // Use simplified taxonomy service for ALL layers to generate consistent addresses
          ...(() => {
            // Always use simplified taxonomy service for consistency
            const hfn = `${data.layer}.${data.categoryCode}.${data.subcategoryCode}.001`;
            const mfa = taxonomyService.convertHFNtoMFA(hfn);

            console.log(
              `Using simplified taxonomy service exclusively for address generation:`
            );
            console.log(`HFN=${hfn}, MFA=${mfa}`);

            // Generic fallback mechanism for all combinations if conversion fails
            let finalMfa = mfa;
            if (!mfa) {
              console.warn(
                `Taxonomy service failed to convert ${hfn}, using fallback mechanism`
              );

              // Attempt to construct MFA using taxonomy service helper methods
              try {
                const layerCode = taxonomyService.getLayerNumericCode(data.layer) || '';
                
                // Try to get numeric codes from taxonomy service
                let categoryCode = '000';
                let subcategoryCode = '000';
                
                try {
                  const categories = taxonomyService.getCategories(data.layer);
                  const categoryObj = categories.find(cat => cat.code === data.categoryCode);
                  if (categoryObj && categoryObj.numericCode) {
                    categoryCode = categoryObj.numericCode;
                  }
                } catch (e) {
                  console.warn(`Failed to get numeric code for category ${data.categoryCode}`, e);
                }
                
                try {
                  const subcategories = taxonomyService.getSubcategories(data.layer, data.categoryCode);
                  const subcategoryObj = subcategories.find(sub => sub.code === data.subcategoryCode);
                  if (subcategoryObj && subcategoryObj.numericCode) {
                    subcategoryCode = subcategoryObj.numericCode;
                  }
                } catch (e) {
                  console.warn(`Failed to get numeric code for subcategory ${data.subcategoryCode}`, e);
                }
                
                // Construct fallback MFA
                finalMfa = `${layerCode}.${categoryCode}.${subcategoryCode}.001`;
                console.log(`Constructed fallback MFA: ${finalMfa}`);
              } catch (fallbackError) {
                console.error('Failed to construct fallback MFA:', fallbackError);
                // Last resort fallback: use whatever we can extract from the layer
                const layerCode = taxonomyService.getLayerNumericCode(data.layer) || '0';
                finalMfa = `${layerCode}.000.000.001`;
                console.log(`Using last resort fallback MFA: ${finalMfa}`);
              }
            }

            return {
              // Include both consistently formatted addresses
              mfa: finalMfa,
              machineFriendlyAddress: finalMfa,
              hfn: hfn,
              humanFriendlyName: hfn,
            };
          })(),
          // For composite assets, include the component references
          ...(data.layer === 'C' &&
            data.layerSpecificData?.components && {
              components: data.layerSpecificData.components,
            }),
        },
      };

      // Update progress to indicate submitting to backend
      updateProgress('Sending asset data to server...');

      // Remove artificial delay in production for better UX
      if (process.env.NODE_ENV === 'development') {
        // Small delay in development to make loading state visible
        await new Promise(resolve => setTimeout(resolve, 400));
      }

      // Send asset data to server
      const createdAsset = await assetService.createAsset(assetData);
      console.log('Asset created successfully:', createdAsset);

      // Update progress to show success
      updateProgress('Asset created successfully!');

      if (!createdAsset) {
        throw new Error('Asset creation failed - no asset returned from API');
      }

      // Store the created asset in localStorage as a fallback in case of page refresh
      try {
        localStorage.setItem('lastCreatedAsset', JSON.stringify(createdAsset));

        // Also store a timestamp to know when it was created
        localStorage.setItem(
          'lastCreatedAssetTimestamp',
          Date.now().toString()
        );
      } catch (e) {
        console.warn('Failed to store created asset in localStorage:', e);
      }

      // Update state with the created asset
      setCreatedAsset(createdAsset);
      setSuccess(true);

      // Ensure the success page is shown
      window.sessionStorage.setItem('showSuccessPage', 'true');
      setShowSuccessPage(true);

      // Report performance metrics only in development mode
      if (process.env.NODE_ENV === 'development') {
        performance.mark('form-submission-end');
        performance.measure(
          'Form Submission Time',
          'form-submission-start',
          'form-submission-end'
        );
        const measurements = performance.getEntriesByName(
          'Form Submission Time'
        );
        console.log(
          `Form submission took ${measurements[0]?.duration.toFixed(2)}ms`
        );
      }
    } catch (err) {
      console.error('Error creating asset:', err);

      // Update progress to show error
      const errorFormContainer = document.querySelector('form');
      if (errorFormContainer) {
        const progressElement = errorFormContainer.querySelector(
          '.submission-progress'
        );
        if (progressElement) {
          progressElement.innerHTML = `
            <p style="color: #d32f2f; font-weight: bold;">Error: ${
              err instanceof Error ? err.message : 'Failed to create asset'
            }</p>
            <p>Please try again or contact support if the problem persists.</p>
          `;
        }
      }

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

    // Reset all state
    reset();
    setActiveStep(0);
    setUploadedFiles([]);
    setSuccess(false);
    setShowSuccessPage(false);
    setCreatedAsset(null);
    setPotentialDuplicate(null);
  };

  // Handle navigation between steps
  const handleNext = () => {
    setActiveStep(prevActiveStep => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep(prevActiveStep => prevActiveStep - 1);
  };

  // Adapted handler methods for TaxonomySelector component
  
  // Handle layer selection for the new TaxonomySelector component
  const handleTaxonomySelectorLayerSelect = (layer: string) => {
    console.log(`TaxonomySelector: Selected layer ${layer}`);
    
    // CRITICAL FIX: Throttle to prevent rapid multiple layer selections
    const now = Date.now();
    const throttleTime = 500;
    
    if (now - layerSelectionThrottleRef.current.lastTimestamp < throttleTime) {
      console.log(`[TaxonomySelector] Throttled layer selection`);
      return;
    }
    
    // Update throttle state
    layerSelectionThrottleRef.current = {
      lastLayer: layer,
      lastTimestamp: now,
      throttleTimeout: setTimeout(() => {
        layerSelectionThrottleRef.current.throttleTimeout = null;
      }, throttleTime)
    };
    
    // Create a LayerOption for the original handler
    const layerOption: LayerOption = {
      id: layer,
      code: layer,
      name: layer,
      numericCode: LAYER_NUMERIC_CODES[layer] ? parseInt(LAYER_NUMERIC_CODES[layer]) : undefined
    };
    
    // Call the original handler with our formatted option
    handleLayerSelect(layerOption);
  };
  
  // Handle category selection for the new TaxonomySelector component
  const handleTaxonomySelectorCategorySelect = (category: string) => {
    console.log(`TaxonomySelector: Selected category ${category}`);
    
    // Create a CategoryOption for the original handler
    // Find the category in the categories returned by taxonomyService
    const availableCategories = taxonomyService.getCategories(watchLayer);
    const categoryObj = availableCategories.find(cat => cat.code === category);
    
    if (!categoryObj) {
      console.error(`Failed to find category ${category} for layer ${watchLayer}`);
      return;
    }
    
    if (categoryObj) {
      // Convert TaxonomyItem to CategoryOption
      const categoryOption: CategoryOption = {
        id: categoryObj.code,
        code: categoryObj.code,
        name: categoryObj.name,
        numericCode: categoryObj.numericCode ? parseInt(categoryObj.numericCode) : undefined
      };
      // Call the original handler with our formatted option
      handleCategorySelect(categoryOption);
    }
  };
  
  // Handle subcategory selection for the new TaxonomySelector component
  const handleTaxonomySelectorSubcategorySelect = (subcategory: string, isDoubleClick?: boolean) => {
    console.log(`TaxonomySelector: Selected subcategory ${subcategory}, doubleClick: ${isDoubleClick}`);
    
    // Create a SubcategoryOption for the original handler
    // Find the subcategory in the subcategories returned by taxonomyService
    const availableSubcategories = taxonomyService.getSubcategories(watchLayer, watchCategoryCode);
    const subcategoryObj = availableSubcategories.find(subcat => subcat.code === subcategory);
    
    if (!subcategoryObj) {
      console.error(`Failed to find subcategory ${subcategory} for ${watchLayer}.${watchCategoryCode}`);
      return;
    }
    
    if (subcategoryObj) {
      // Convert TaxonomyItem to SubcategoryOption
      const subcategoryOption: SubcategoryOption = {
        id: subcategoryObj.code,
        code: subcategoryObj.code,
        name: subcategoryObj.name,
        numericCode: subcategoryObj.numericCode ? parseInt(subcategoryObj.numericCode) : undefined
      };
      // Call the original handler with our formatted option
      handleSubcategorySelect(subcategoryOption, isDoubleClick);
    }
  };

  // Original handler methods (slightly modified to work with both interfaces)
  
  // Handle layer selection - ENHANCED FIX for layer switching issue
  const handleLayerSelect = (layer: LayerOption, isDoubleClick?: boolean) => {
    console.log(
      `[LAYER SELECT] Called with layer=${layer.code}, isDoubleClick=${isDoubleClick}`
    );
    
    // Reset taxonomy context BEFORE updating any other state
    taxonomyContext.reset();

    // Update the form values with the new layer
    setValue('layer', layer.code, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
    setValue('layerName', layer.name, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });

    // Update special layer type flags
    const isTraining = layer.code === 'T';
    setIsTrainingLayer(isTraining);

    const isComposite = layer.code === 'C';
    setIsCompositeLayer(isComposite);

    // Thoroughly reset all taxonomy-related form values
    setValue('categoryCode', '', {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
    setValue('categoryName', '', {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
    setValue('subcategoryCode', '', {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
    setValue('subcategoryName', '', {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
    setValue('subcategoryNumericCode', '', {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
    setValue('hfn', '', {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
    setValue('mfa', '', {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
    setValue('sequential', '', {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });

    // Update taxonomy context with new layer
    setTimeout(() => {
      taxonomyContext.selectLayer(layer.code);
      
      // Force reload of categories for the new layer
      setTimeout(() => {
        taxonomyContext.reloadCategories();
      }, 100);
    }, 100);

    // Handle double-click behavior
    if (isDoubleClick) {
      // Auto-advance to the next step on double-click
      setTimeout(() => handleNext(), 100);
    }
  };

  // Handle category selection - Enhanced to ensure proper form state updates
  const handleCategorySelect = (category: CategoryOption) => {
    // Log for debugging
    console.log(
      `Setting category in form: ${category.code}, ${category.name}, ${category.numericCode}`
    );

    // Force immediate form update with explicit state management
    setValue('categoryCode', category.code, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
    setValue('categoryName', category.name, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });

    // Clear subcategory when category changes
    setValue('subcategoryCode', '', { shouldValidate: true });
    setValue('subcategoryName', '', { shouldValidate: true });
    setValue('subcategoryNumericCode', '', { shouldValidate: true });
    setValue('hfn', '');
    setValue('mfa', '');
    setValue('sequential', '');

    // Update taxonomy context
    taxonomyContext.selectCategory(category.code);
  };

  // Handle subcategory selection - Enhanced to ensure proper form state updates
  const handleSubcategorySelect = (
    subcategory: SubcategoryOption,
    isDoubleClick?: boolean
  ) => {
    // Log for debugging
    console.log(
      `Setting subcategory in form: ${subcategory.code}, ${subcategory.name}, ${subcategory.numericCode}`
    );

    // Force immediate form update with explicit state management
    setValue('subcategoryCode', subcategory.code, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
    setValue('subcategoryName', subcategory.name, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
    setValue(
      'subcategoryNumericCode',
      subcategory.numericCode?.toString() || '',
      { shouldValidate: true }
    );

    // Update taxonomy context
    taxonomyContext.selectSubcategory(subcategory.code);

    // If double click, add a small delay before advancing to ensure state is updated
    if (isDoubleClick) {
      setTimeout(() => handleNext(), 50);
    }
  };

  // Handle file selection
  const handleFilesChange = async (files: File[]) => {
    // Clear any previous duplicate detection
    setPotentialDuplicate(null);

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

    // Detect and filter duplicates
    const newFiles: File[] = [];
    const duplicateFiles: string[] = [];

    for (const file of files) {
      // Check by name first (fast)
      if (existingFileNames.includes(file.name)) {
        // Potential duplicate, check by content
        const newFileHash = await calculateFileHash(file);
        const existingFileHash = fileHashMap.get(file.name);

        if (newFileHash === existingFileHash) {
          // Confirmed duplicate by content
          duplicateFiles.push(file.name);
          console.log(
            `File "${file.name}" is a duplicate (same content). Skipping.`
          );
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

    if (newFiles.length === 0) {
      setError('Duplicate file(s) detected. No new files were added.');
      return;
    }

    // Combine with existing files, avoiding duplicates
    const combinedFiles = [...existingFiles, ...newFiles];
    setValue('files', combinedFiles);

    // Auto-populate asset name with file name if there's one file
    if (combinedFiles.length === 1 && !getValues('name')) {
      // Remove file extension from name
      const fileName = combinedFiles[0].name.split('.').slice(0, -1).join('.');
      setValue('name', fileName);
    }

    // Show a confirmation if at least one duplicate was found
    if (duplicateFiles.length > 0) {
      setError(
        `Duplicate file(s) detected: ${duplicateFiles.join(
          ', '
        )}. These files were skipped.`
      );
    }
  };

  // Map to store file hashes for duplicate detection
  const [fileHashes, setFileHashes] = useState<Map<string, string> | null>(
    null
  );

  // Calculate a simple hash for a file (based on size, type, and first few bytes)
  const calculateFileHash = async (file: File): Promise<string> => {
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = e => {
        const result = e.target?.result;
        if (result) {
          // Get first few bytes (for large files) or all bytes (for small files)
          const bytes =
            result instanceof ArrayBuffer
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
          confidence,
        });
      } else if (confidence === 'medium') {
        setPotentialDuplicate({
          asset,
          file,
          message: `This file may be similar to an existing asset "${asset.name}" with NNA address ${mfa}. Would you like to proceed with registration?`,
          confidence,
        });
      } else {
        // Low confidence - just log but don't show warning
        console.log(
          `File name matches existing asset "${asset.name}" with NNA address ${mfa}.`
        );
      }
    }
  };

  // Handle file upload progress
  const handleUploadProgress = (fileId: string, progress: number) => {
    // Track progress for future UI improvements
    console.log(`File ${fileId} upload progress: ${progress}%`);
  };

  // Handle training data collection
  const handleTrainingDataChange = (trainingData: TrainingData) => {
    setValue('trainingData', trainingData);
  };

  // Handle composite asset components
  const handleComponentsChange = (components: any[]) => {
    setValue('layerSpecificData', { components });
  };

  // Handle potential duplicate confirmation
  const handleConfirmDuplicate = () => {
    setPotentialDuplicate(null);
  };

  // Get the steps for the current asset type
  const steps = getSteps(isTrainingLayer, isCompositeLayer);

  // Success screen UI (displayed after asset is created)
  if (showSuccessPage && createdAsset) {
    return (
      <Container maxWidth="lg">
        <Paper sx={{ p: 4, mt: 4, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom color="primary">
            Asset Registered Successfully!
          </Typography>
          <Typography variant="h6" gutterBottom>
            {createdAsset.name}
          </Typography>
          
          <Box sx={{ my: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="subtitle1" gutterBottom>
              NNA Address
            </Typography>
            <Typography 
              variant="body1" 
              fontFamily="monospace" 
              fontWeight="bold"
              sx={{ fontSize: '1.2rem' }}
            >
              {createdAsset.metadata?.machineFriendlyAddress || createdAsset.nnaAddress}
            </Typography>
          </Box>
          
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleCreateNewAsset}
            sx={{ mt: 2 }}
          >
            Register Another Asset
          </Button>
        </Paper>
      </Container>
    );
  }

  // Placeholder for the render method - more to be added
  return (
    <TaxonomyDataProvider>
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Register New Asset
          </Typography>
          
          <FormControlLabel
            control={
              <Switch
                checked={useNewInterface}
                onChange={(e) => setUseNewInterface(e.target.checked)}
                color="primary"
              />
            }
            label="Use New Taxonomy Interface"
            sx={{ mb: 2 }}
          />
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Paper sx={{ p: 3, mb: 4 }}>
            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
              {steps.map((label, index) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
            
            <FormProvider {...methods}>
              <form onSubmit={handleSubmit(onSubmit)}>
                {/* Step 0: Layer Selection */}
                {activeStep === 0 && (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Select Layer
                    </Typography>
                    
                    {useNewInterface ? (
                      <TaxonomySelector
                        selectedLayer={watchLayer}
                        selectedCategory=""
                        selectedSubcategory=""
                        onLayerSelect={handleTaxonomySelectorLayerSelect}
                        onCategorySelect={handleTaxonomySelectorCategorySelect}
                        onSubcategorySelect={handleTaxonomySelectorSubcategorySelect}
                      />
                    ) : (
                      <LayerSelector
                        selectedLayer={watchLayer}
                        onLayerSelect={(layer) => {
                          // Create a properly formatted LayerOption from string
                          const layerOption: LayerOption = {
                            id: layer,
                            code: layer,
                            name: getLayerName(layer),
                            numericCode: LAYER_NUMERIC_CODES[layer] ? parseInt(LAYER_NUMERIC_CODES[layer]) : undefined
                          };
                          handleLayerSelect(layerOption);
                        }}
                        onLayerDoubleClick={(layer) => {
                          // Create a properly formatted LayerOption from string
                          const layerOption: LayerOption = {
                            id: layer,
                            code: layer,
                            name: getLayerName(layer),
                            numericCode: LAYER_NUMERIC_CODES[layer] ? parseInt(LAYER_NUMERIC_CODES[layer]) : undefined
                          };
                          handleLayerSelect(layerOption, true);
                        }}
                      />
                    )}
                    
                    {errors.layer && (
                      <Typography color="error" variant="caption">
                        {errors.layer.message}
                      </Typography>
                    )}
                    
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleNext}
                        endIcon={<NextIcon />}
                        disabled={!watchLayer}
                      >
                        Next
                      </Button>
                    </Box>
                  </Box>
                )}
                
                {/* Step 1: Taxonomy Selection */}
                {activeStep === 1 && (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Choose Taxonomy
                    </Typography>
                    
                    {useNewInterface ? (
                      <TaxonomySelector
                        selectedLayer={watchLayer}
                        selectedCategory={watchCategoryCode}
                        selectedSubcategory={watchSubcategoryCode}
                        onLayerSelect={handleTaxonomySelectorLayerSelect}
                        onCategorySelect={handleTaxonomySelectorCategorySelect}
                        onSubcategorySelect={handleTaxonomySelectorSubcategorySelect}
                      />
                    ) : (
                      <SimpleTaxonomySelection
                        layer={watchLayer}
                        selectedCategory={watchCategoryCode}
                        selectedSubcategory={watchSubcategoryCode}
                        onCategorySelect={(category, isDoubleClick) => {
                          // Find the category in available categories
                          const availableCategories = taxonomyService.getCategories(watchLayer);
                          const categoryObj = availableCategories.find(cat => cat.code === category);
                          
                          if (categoryObj) {
                            // Create a properly formatted CategoryOption
                            const categoryOption: CategoryOption = {
                              id: categoryObj.code,
                              code: categoryObj.code,
                              name: categoryObj.name,
                              numericCode: categoryObj.numericCode ? parseInt(categoryObj.numericCode) : undefined
                            };
                            handleCategorySelect(categoryOption);
                          }
                        }}
                        onSubcategorySelect={(subcategory, isDoubleClick) => {
                          // Find the subcategory in available subcategories
                          const availableSubcategories = taxonomyService.getSubcategories(watchLayer, watchCategoryCode);
                          const subcategoryObj = availableSubcategories.find(subcat => subcat.code === subcategory);
                          
                          if (subcategoryObj) {
                            // Create a properly formatted SubcategoryOption
                            const subcategoryOption: SubcategoryOption = {
                              id: subcategoryObj.code,
                              code: subcategoryObj.code,
                              name: subcategoryObj.name,
                              numericCode: subcategoryObj.numericCode ? parseInt(subcategoryObj.numericCode) : undefined
                            };
                            handleSubcategorySelect(subcategoryOption, isDoubleClick);
                          }
                        }}
                      />
                    )}
                    
                    {(errors.categoryCode || errors.subcategoryCode) && (
                      <Typography color="error" variant="caption">
                        {errors.categoryCode?.message || errors.subcategoryCode?.message}
                      </Typography>
                    )}
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                      <Button
                        variant="outlined"
                        onClick={handleBack}
                        startIcon={<PreviousIcon />}
                      >
                        Back
                      </Button>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleNext}
                        endIcon={<NextIcon />}
                        disabled={!watchCategoryCode || !watchSubcategoryCode}
                      >
                        Next
                      </Button>
                    </Box>
                  </Box>
                )}
                
                {/* Step 2: Components Selection (only for C layer) */}
                {activeStep === 2 && isCompositeLayer && (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Select Components
                    </Typography>
                    
                    <ComponentsForm 
                      control={methods.control}
                      watchLayer={watchLayer}
                    />
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                      <Button
                        variant="outlined"
                        onClick={handleBack}
                        startIcon={<PreviousIcon />}
                      >
                        Back
                      </Button>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleNext}
                        endIcon={<NextIcon />}
                      >
                        Next
                      </Button>
                    </Box>
                  </Box>
                )}
                
                {/* Step 2/3: File Upload */}
                {((activeStep === 2 && !isCompositeLayer) || 
                   (activeStep === 3 && isCompositeLayer)) && (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Upload Files
                    </Typography>
                    
                    <FileUpload
                      onFilesChange={handleFilesChange}
                      onUploadProgress={handleUploadProgress}
                      layerCode={watchLayer}
                    />
                    
                    {errors.files && (
                      <Typography color="error" variant="caption">
                        {errors.files.message}
                      </Typography>
                    )}
                    
                    {potentialDuplicate && (
                      <Alert 
                        severity={potentialDuplicate.confidence === 'high' ? 'warning' : 'info'}
                        sx={{ mt: 2 }}
                        action={
                          <Button color="inherit" size="small" onClick={handleConfirmDuplicate}>
                            Continue Anyway
                          </Button>
                        }
                      >
                        {potentialDuplicate.message}
                      </Alert>
                    )}
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                      <Button
                        variant="outlined"
                        onClick={handleBack}
                        startIcon={<PreviousIcon />}
                      >
                        Back
                      </Button>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleNext}
                        endIcon={<NextIcon />}
                        disabled={!getValues('files') || getValues('files').length === 0}
                      >
                        Next
                      </Button>
                    </Box>
                  </Box>
                )}
                
                {/* Step 3/4: Training Data (only for T layer) */}
                {((activeStep === 3 && isTrainingLayer && !isCompositeLayer) ||
                  (activeStep === 4 && isTrainingLayer && isCompositeLayer)) && (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Training Data
                    </Typography>
                    
                    <TrainingDataCollection
                      initialData={getValues('trainingData')}
                      onChange={handleTrainingDataChange}
                      isTrainable={true}
                    />
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                      <Button
                        variant="outlined"
                        onClick={handleBack}
                        startIcon={<PreviousIcon />}
                      >
                        Back
                      </Button>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleNext}
                        endIcon={<NextIcon />}
                      >
                        Next
                      </Button>
                    </Box>
                  </Box>
                )}
                
                {/* Last Step: Review & Submit */}
                {activeStep === steps.length - 1 && (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Review & Submit
                    </Typography>
                    
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
                        files: getValues('files') || [],
                        uploadedFiles: uploadedFiles,
                        tags: getValues('tags'),
                        components: getValues('layerSpecificData')?.components || []
                      }}
                      onEditStep={(step) => setActiveStep(step)}
                      loading={loading}
                      error={error}
                      onSubmit={handleSubmit(onSubmit)}
                      isSubmitting={isSubmitting}
                    />
                    
                    {/* Asset name and description */}
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Asset Details
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <FormControl fullWidth error={!!errors.name}>
                            <InputLabel>Asset Name *</InputLabel>
                            <input
                              type="text"
                              {...register('name')}
                              style={{
                                padding: '16.5px 14px',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                fontSize: '1rem',
                                width: '100%',
                              }}
                            />
                            {errors.name && (
                              <FormHelperText>{errors.name.message}</FormHelperText>
                            )}
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <FormControl fullWidth>
                            <InputLabel>Source</InputLabel>
                            <Select
                              {...register('source')}
                              defaultValue="ReViz"
                              label="Source"
                            >
                              {SOURCE_OPTIONS.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                  {option.label}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                          <FormControl fullWidth>
                            <InputLabel>Description</InputLabel>
                            <textarea
                              {...register('description')}
                              style={{
                                padding: '16.5px 14px',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                fontSize: '1rem',
                                width: '100%',
                                minHeight: '100px',
                                fontFamily: 'inherit',
                              }}
                            />
                          </FormControl>
                        </Grid>
                      </Grid>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                      <Button
                        variant="outlined"
                        onClick={handleBack}
                        startIcon={<PreviousIcon />}
                      >
                        Back
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={loading || isSubmitting}
                        endIcon={<NextIcon />}
                      >
                        Register Asset
                      </Button>
                    </Box>
                  </Box>
                )}
                
                {/* Placeholder for debugging */}
                <Box sx={{ mt: 4, p: 2, bgcolor: '#f5f5f5', borderRadius: 1, display: activeStep > 1 ? 'none' : 'block' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Current Selection:
                  </Typography>
                  <Typography variant="body2">
                    Layer: <strong>{watchLayer || 'None'}</strong>,
                    Category: <strong>{watchCategoryCode || 'None'}</strong>,
                    Subcategory: <strong>{watchSubcategoryCode || 'None'}</strong>
                  </Typography>
                  {watchLayer && watchCategoryCode && watchSubcategoryCode && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      HFN: <strong>{`${watchLayer}.${watchCategoryCode}.${watchSubcategoryCode}.001`}</strong>
                    </Typography>
                  )}
                </Box>
              </form>
            </FormProvider>
          </Paper>
        </Box>
      </Container>
    </TaxonomyDataProvider>
  );
};

export default RegisterAssetPageNew;