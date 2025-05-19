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
} from '@mui/material';
import {
  ChevronLeft as PreviousIcon,
  ChevronRight as NextIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
// Import asset service for API calls
import assetService from '../api/assetService';

// IMPORTANT: Comment out the old taxonomy mapper and use simplified service exclusively
// import { formatNNAAddressForDisplay } from '../api/codeMapping.enhanced';
// import taxonomyMapper from '../api/taxonomyMapper';

// Import components
import LayerSelector from '../components/asset/LayerSelectorV2';
import SimpleTaxonomySelection from '../components/asset/SimpleTaxonomySelectionV2';
import FileUpload from '../components/asset/FileUpload';
import ReviewSubmit from '../components/asset/ReviewSubmit';
import TrainingDataCollection from '../components/asset/TrainingDataCollection';
import { ComponentsForm } from '../components/asset/ComponentsForm';

// Import the simplified taxonomy service and context
import { taxonomyService } from '../services/simpleTaxonomyService';
import { TaxonomyConverter } from '../services/taxonomyConverter';
import { useTaxonomyContext } from '../contexts/TaxonomyContext';

// Import styles
import '../styles/SimpleTaxonomySelection.css';
import '../styles/LayerSelector.css';

// Types
import { LayerOption, CategoryOption, SubcategoryOption } from '../types/taxonomy.types';
import { FileUploadResponse, Asset, SOURCE_OPTIONS } from '../types/asset.types';

// CRITICAL: Debugging to ensure the simplified taxonomy service is the source of truth
console.log('RegisterAssetPage using simplified taxonomy service');
console.log('Taxonomy service initialized:', !!taxonomyService);
console.log('Available taxonomy methods:', Object.keys(taxonomyService).join(', '));

// Define the steps in the registration process
const getSteps = (isTrainingLayer: boolean, isCompositeLayer: boolean) => {
  if (isTrainingLayer) {
    return ['Select Layer', 'Choose Taxonomy', 'Upload Files', 'Training Data', 'Review & Submit'];
  }
  if (isCompositeLayer) {
    return ['Select Layer', 'Choose Taxonomy', 'Select Components', 'Upload Files', 'Review & Submit'];
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

const RegisterAssetPage: React.FC = () => {
  // FIXED: Add a ref to prevent checking navigation state on every render
  const isDirectNavigationCheckedRef = React.useRef(false);
  
  // Use the shared taxonomy context from TaxonomyProvider
  const taxonomyContext = useTaxonomyContext({
    componentName: 'RegisterAssetPage',
    enableLogging: process.env.NODE_ENV === 'development'
  });
  
  // Check for any previously created asset in localStorage/sessionStorage
  // but in a way that doesn't cause re-renders
  const getStoredAssetData = () => {
    try {
      // The navigation check is now handled in a useEffect to prevent infinite loops
      // Just read the existing values from storage here
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
  
  // Handle navigation state only once on component mount
  React.useEffect(() => {
    if (!isDirectNavigationCheckedRef.current) {
      isDirectNavigationCheckedRef.current = true;
      
      // Check if this is a direct navigation
      const referrer = document.referrer;
      const isFromSuccessPage = referrer?.includes('register-asset') &&
                             window.sessionStorage.getItem('directNavigation') !== 'true';
      
      // If the user came directly to register-asset via a menu link or direct URL,
      // we should start with a fresh form
      if (!isFromSuccessPage) {
        // Clear any previously stored data to ensure a fresh form
        window.sessionStorage.removeItem('showSuccessPage');
        localStorage.removeItem('lastCreatedAsset');
        console.log('Direct navigation to Register Asset - clearing stored data (one-time check)');
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

  // Create a formData object for the useEffect dependencies
  const formData = {
    layer: watchLayer,
    categoryCode: watchCategoryCode,
    subcategoryCode: watchSubcategoryCode,
    sequential: watch('sequential') || '001',
    fileType: watchFiles && watchFiles.length > 0 ? watchFiles[0].name.split('.').pop() : ''
  };

  // Handle form submission - Optimized for performance
  const onSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      // Start performance tracking in development mode
      if (process.env.NODE_ENV === 'development') {
        performance.mark('form-submission-start');
      }
      
      setLoading(true);
      setError(null);
      
      // Create more visually appealing loading UI
      const formContainer = document.querySelector('form');
      if (formContainer) {
        // Remove any existing loading indicator
        const existingIndicator = formContainer.querySelector('.submission-indicator');
        if (existingIndicator) {
          formContainer.removeChild(existingIndicator);
        }
        
        // Add styled loading indicator
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
          const progressElement = formContainer.querySelector('.submission-progress');
          if (progressElement) {
            progressElement.innerHTML = `<p>${message}</p>`;
          }
        }
      };
      
      // Log validation state for debugging - but only in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Form data to submit:', {
          layer: data.layer,
          categoryCode: data.categoryCode,
          subcategoryCode: data.subcategoryCode,
          name: data.name,
          files: data.files?.length || 0,
          source: data.source,
          isValid: schema.isValidSync(data)
        });
      }
      
      // Use Promise.all for parallel file uploads to improve performance
      updateProgress("Preparing file uploads...");
      const uploadPromises: Promise<any>[] = [];
      
      // Process file uploads if not already uploaded
      if (data.files && data.files.length > 0) {
        // If files are not already processed, upload them
        if (uploadedFiles.length < data.files.length) {
          const filesToUpload = data.files.filter(file => 
            !uploadedFiles.some(uploaded => uploaded.originalName === file.name)
          );
          
          updateProgress(`Uploading ${filesToUpload.length} file(s)...`);
          
          // Create upload promises for all files
          for (const file of filesToUpload) {
            const uploadPromise = assetService.uploadFile(file)
              .then(uploadResult => {
                if (uploadResult && uploadResult.response) {
                  const fileData = {
                    filename: uploadResult.response?.filename || file.name,
                    url: uploadResult.response?.url || '',
                    size: uploadResult.response?.size || file.size,
                    mimeType: uploadResult.response?.mimeType || file.type,
                    originalName: file.name,
                  };
                  
                  // Update upload files state
                  setUploadedFiles(prev => [...prev, fileData]);
                  return fileData;
                }
                return null;
              });
            
            uploadPromises.push(uploadPromise);
          }
          
          // Wait for all uploads to complete in parallel
          if (uploadPromises.length > 0) {
            await Promise.all(uploadPromises);
          }
        }
      }

      // Update progress to indicate we're preparing the asset
      updateProgress("Preparing asset data...");
      
      // Consolidate logging into a single block for better performance
      if (process.env.NODE_ENV === 'development') {
        // Log form data for debugging
        console.log('Form data for asset creation:', {
          layer: data.layer,
          categoryCode: data.categoryCode,  // This could be numeric "001" or alphabetic "POP"
          subcategoryCode: data.subcategoryCode, // This could be numeric "005"/"007" or alphabetic "LGM"/"HPM"
          hfn: data.hfn,
          mfa: data.mfa,
          isNumericCategory: /^\d+$/.test(data.categoryCode), // Check if category is numeric
          isNumericSubcategory: /^\d+$/.test(data.subcategoryCode) // Check if subcategory is numeric
        });

        // Add special logging for the category/subcategory format to debug backend issues
        console.log('IMPORTANT: Category/Subcategory Format Check:');
        console.log(`Category: ${data.categoryCode} (${/^\d+$/.test(data.categoryCode) ? 'NUMERIC - needs conversion' : 'ALPHABETIC - OK'})`);
        console.log(`Subcategory: ${data.subcategoryCode} (${/^\d+$/.test(data.subcategoryCode) ? 'NUMERIC - needs conversion' : 'ALPHABETIC - OK'})`);

        // Handle special cases with focused logging
        // For S.POP.LGM, log the specific mapping that will be used
        if (data.layer === 'S' && (data.categoryCode === 'POP' || data.categoryCode === '001') &&
            (data.subcategoryCode === 'LGM' || data.subcategoryCode === '005')) {
          console.log('DETECTED S.POP.LGM COMBINATION - Will convert to proper codes for backend');
        }

        // Add extended debug logging specifically for S.POP.HPM case
        if (data.layer === 'S' && data.categoryCode === 'POP' && data.subcategoryCode === 'HPM') {
          console.log('IMPORTANT - Asset registration with S.POP.HPM:');
          console.log(`HFN: ${data.hfn}`);
          console.log(`MFA: ${data.mfa}`);
          console.log('Verifying MFA is correct: expected 2.001.007.001');

          // This should match the expected MFA for S.POP.HPM
          if (data.mfa !== '2.001.007.001') {
            console.error(`WARNING: MFA is incorrect! Expected 2.001.007.001 but got ${data.mfa}`);
          }
        }
      }

      // Create the asset
      // First handle the category/subcategory conversion
      // Enhanced conversion logic to ensure we're sending alphabetic codes to the backend
      // This is critical as the backend expects alphabetic codes like "POP", not numeric ones like "001"

      // Use the new TaxonomyConverter utility for reliable code conversion
      console.log(`Converting taxonomy codes for layer: ${data.layer}`);

      // For W layer, use the simplified taxonomy service
      let convertedCategory = data.categoryCode;
      let convertedSubcategory = data.subcategoryCode;

      if (data.layer === 'W') {
        // For W layer, we don't need to convert as we're already using alphabetic codes
        console.log(`W layer detected: Using simplified taxonomy service with codes ${data.categoryCode} and ${data.subcategoryCode}`);

        // No conversion needed, but add additional logging for verification
        if (data.categoryCode === 'BCH' && data.subcategoryCode === 'SUN') {
          console.log('IMPORTANT - W.BCH.SUN case detected - will use simplified taxonomy service');
          console.log(`MFA should be 5.004.003.001, actual: ${data.mfa}`);
        }
      } else if (data.layer === 'S' && (data.categoryCode === '001' || /^\d+$/.test(data.categoryCode))) {
        // Special case for S layer POP category
        convertedCategory = 'POP';
        console.log(`CRITICAL PATH: Force mapped category code ${data.categoryCode} → POP for Stars layer`);

        // Convert subcategory code to alphabetic form if needed
        if (data.categoryCode === 'POP' || data.categoryCode === '001') {
          if (data.subcategoryCode === '007' || (/^\d+$/.test(data.subcategoryCode) && data.subcategoryCode === '007')) {
            convertedSubcategory = 'HPM';
            console.log(`CRITICAL PATH: Force mapped subcategory code ${data.subcategoryCode} → HPM for S.POP layer`);
          } else {
            // Normal conversion path for other S.POP subcategories
            convertedSubcategory = TaxonomyConverter.getAlphabeticCode(
              data.layer,
              'subcategory',
              data.subcategoryCode,
              convertedCategory // Use the already converted category
            );
          }
        }
      } else {
        // Normal conversion path for other layers
        convertedCategory = TaxonomyConverter.getAlphabeticCode(
          data.layer,
          'category',
          data.categoryCode
        );

        convertedSubcategory = TaxonomyConverter.getAlphabeticCode(
          data.layer,
          'subcategory',
          data.subcategoryCode,
          convertedCategory // Use the already converted category
        );
      }

      // Log the conversion results for debugging
      console.log('Code conversion results:');
      console.log(`Category: ${data.categoryCode} → ${convertedCategory}`);
      console.log(`Subcategory: ${data.subcategoryCode} → ${convertedSubcategory}`);

      // Add extra validation for the critical S.POP.HPM case
      if (data.layer === 'S' && (data.categoryCode === 'POP' || data.categoryCode === '001') &&
          (data.subcategoryCode === 'HPM' || data.subcategoryCode === '007')) {
        console.log('IMPORTANT - Final validation for S.POP.HPM case:');
        console.log(`Original values: layer=${data.layer}, category=${data.categoryCode}, subcategory=${data.subcategoryCode}`);
        console.log(`Converted values: layer=${data.layer}, category=${convertedCategory}, subcategory=${convertedSubcategory}`);
        console.log(`These should be sending: layer=S, category=POP, subcategory=HPM to the backend`);

        // Check if the conversion is correct
        if (convertedCategory !== 'POP' || convertedSubcategory !== 'HPM') {
          console.error('WARNING: S.POP.HPM conversion failed! Backend will likely reject this request.');
        } else {
          console.log('✅ S.POP.HPM conversion successful - should work with backend API');
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
        // Use our simplified taxonomy service for ALL layers
        nnaAddress: taxonomyService.convertHFNtoMFA(`${data.layer}.${data.categoryCode}.${data.subcategoryCode}.001`),
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

            console.log(`Using simplified taxonomy service exclusively for address generation:`);
            console.log(`HFN=${hfn}, MFA=${mfa}`);

            // Handle special cases with fallbacks if conversion fails
            let finalMfa = mfa;
            if (!mfa) {
              console.warn(`Taxonomy service failed to convert ${hfn}, using fallback`);

              // Special case handling
              if (data.layer === 'S' && data.categoryCode === 'POP' && data.subcategoryCode === 'HPM') {
                finalMfa = '2.001.007.001';
              } else if (data.layer === 'W' && data.categoryCode === 'BCH' && data.subcategoryCode === 'SUN') {
                finalMfa = '5.004.003.001';
              } else {
                // Default fallback
                const layerCode = taxonomyService.getLayerNumericCode(data.layer);
                finalMfa = `${layerCode}.000.000.001`;
              }
              console.log(`Using fallback MFA: ${finalMfa}`);
            }

            return {
              // Include both consistently formatted addresses
              mfa: finalMfa,
              machineFriendlyAddress: finalMfa,
              hfn: hfn,
              humanFriendlyName: hfn
            };
          })(),
          // For composite assets, include the component references
          ...(data.layer === 'C' && data.layerSpecificData?.components && {
            components: data.layerSpecificData.components
          }),
        },
      };

      // Update progress to indicate submitting to backend
      updateProgress("Sending asset data to server...");
      
      // Remove artificial delay in production for better UX
      if (process.env.NODE_ENV === 'development') {
        // Small delay in development to make loading state visible
        await new Promise(resolve => setTimeout(resolve, 400));
      }

      // Send asset data to server
      const createdAsset = await assetService.createAsset(assetData);
      console.log("Asset created successfully:", createdAsset);
      
      // Update progress to show success
      updateProgress("Asset created successfully!");
      
      if (!createdAsset) {
        throw new Error("Asset creation failed - no asset returned from API");
      }
      
      // Store the created asset in localStorage as a fallback in case of page refresh
      try {
        localStorage.setItem('lastCreatedAsset', JSON.stringify(createdAsset));
        
        // Also store a timestamp to know when it was created
        localStorage.setItem('lastCreatedAssetTimestamp', Date.now().toString());
      } catch (e) {
        console.warn("Failed to store created asset in localStorage:", e);
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
        performance.measure('Form Submission Time', 'form-submission-start', 'form-submission-end');
        const measurements = performance.getEntriesByName('Form Submission Time');
        console.log(`Form submission took ${measurements[0]?.duration.toFixed(2)}ms`);
      }
      
      // Don't reset the form yet - wait for user to navigate away
    } catch (err) {
      console.error('Error creating asset:', err);
      
      // Update progress to show error
      const errorFormContainer = document.querySelector('form');
      if (errorFormContainer) {
        const progressElement = errorFormContainer.querySelector('.submission-progress');
        if (progressElement) {
          progressElement.innerHTML = `
            <p style="color: #d32f2f; font-weight: bold;">Error: ${err instanceof Error ? err.message : 'Failed to create asset'}</p>
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

  // Handle layer selection
  const handleLayerSelect = (layer: LayerOption, isDoubleClick?: boolean) => {
    console.log(`handleLayerSelect called with isDoubleClick=${isDoubleClick}`);
    setValue('layer', layer.code);
    setValue('layerName', layer.name);
    
    // Check if this is the training layer (T)
    const isTraining = layer.code === 'T';
    setIsTrainingLayer(isTraining);
    
    // Check if this is the composite layer (C)
    const isComposite = layer.code === 'C';
    setIsCompositeLayer(isComposite);
    
    // Clear category and subcategory when layer changes
    setValue('categoryCode', '');
    setValue('categoryName', '');
    setValue('subcategoryCode', '');
    setValue('subcategoryName', '');
    setValue('subcategoryNumericCode', '');
    setValue('hfn', '');
    setValue('mfa', '');
    setValue('sequential', '');
    
    // FIXED: Do not auto-advance on double-click anymore to prevent skipping Step 2
    // This was causing the subcategory display issue by bypassing Category/Subcategory selection
    if (isDoubleClick) {
      console.log('Double-click detected in handleLayerSelect, but NOT advancing to next step anymore');
      console.log('This fixes the issue where Step 2 was being skipped, causing validation errors');
    }
  };

  // Handle category selection - Enhanced to ensure proper form state updates
  const handleCategorySelect = (category: CategoryOption) => {
    // Log for debugging
    console.log(`Setting category in form: ${category.code}, ${category.name}, ${category.numericCode}`);
    
    // Force immediate form update with explicit state management
    setValue('categoryCode', category.code, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
    setValue('categoryName', category.name, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
    
    // Clear subcategory when category changes
    setValue('subcategoryCode', '', { shouldValidate: true });
    setValue('subcategoryName', '', { shouldValidate: true });
    setValue('subcategoryNumericCode', '', { shouldValidate: true });
    setValue('hfn', '');
    setValue('mfa', '');
    setValue('sequential', '');
    
    // Clear any stored subcategory for this category
    try {
      sessionStorage.removeItem(`originalSubcategory_${watchLayer}_${category.code}`);
    } catch (e) {
      console.warn('Failed to clear subcategory from session storage:', e);
    }
  };

  // Handle subcategory selection - Enhanced to ensure proper form state updates
  const handleSubcategorySelect = (subcategory: SubcategoryOption, isDoubleClick?: boolean) => {
    // Log for debugging
    console.log(`Setting subcategory in form: ${subcategory.code}, ${subcategory.name}, ${subcategory.numericCode}`);
    
    // Force immediate form update with explicit state management
    setValue('subcategoryCode', subcategory.code, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
    setValue('subcategoryName', subcategory.name, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
    setValue('subcategoryNumericCode', subcategory.numericCode?.toString() || '', { shouldValidate: true });
    
    // Store original subcategory in session storage as a backup
    try {
      sessionStorage.setItem(`originalSubcategory_${watchLayer}_${watchCategoryCode}`, subcategory.code);
      console.log(`Stored backup subcategory in session storage: ${subcategory.code}`);
    } catch (e) {
      console.warn('Failed to store subcategory in session storage:', e);
    }
    
    // If double click, add a small delay before advancing to ensure state is updated
    if (isDoubleClick) {
      setTimeout(() => handleNext(), 50);
    }
  };

  // Track original subcategory for display override
  const [originalSubcategoryCode, setOriginalSubcategoryCode] = useState<string>('');

  // Handle NNA address change - kept for future reference
  // Prefixed with underscore to indicate intentionally unused
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _handleNNAAddressChange = (
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
      console.log(`Stored original subcategory code: ${originalSubcategory} for display override`);
    }
  };

  // Generate HFN and MFA using taxonomy context instead of direct service calls
  useEffect(() => {
    if (formData.layer && formData.categoryCode && formData.subcategoryCode) {
      // Use formatted sequential number (pad with leading zeros if needed)
      const sequentialFormatted = formData.sequential.padStart(3, '0');

      // Create properly formatted HFN
      const newHfn = `${formData.layer}.${formData.categoryCode}.${formData.subcategoryCode}.${sequentialFormatted}${formData.fileType ? '.' + formData.fileType : ''}`;
      setValue('hfn', newHfn);

      console.log(`Generating MFA from HFN: ${newHfn}`);

      try {
        // Update shared context state first using context methods
        if (taxonomyContext.selectedLayer !== formData.layer) {
          taxonomyContext.selectLayer(formData.layer);
        }
        
        if (taxonomyContext.selectedCategory !== formData.categoryCode) {
          taxonomyContext.selectCategory(formData.categoryCode);
        }
        
        if (taxonomyContext.selectedSubcategory !== formData.subcategoryCode) {
          taxonomyContext.selectSubcategory(formData.subcategoryCode);
        }
        
        // Check if context already has the MFA we need
        if (taxonomyContext.hfn === newHfn && taxonomyContext.mfa) {
          setValue('mfa', taxonomyContext.mfa);
          console.log(`Using MFA from context: ${taxonomyContext.mfa}`);
        } else {
          // Otherwise use the service directly (the context will update on its own)
          const newMfa = taxonomyService.convertHFNtoMFA(newHfn);
          if (newMfa) {
            setValue('mfa', newMfa);
            console.log(`SimpleTaxonomyService HFN to MFA conversion: ${newHfn} -> ${newMfa}`);
          } else {
            // If conversion fails, use a fallback format
            console.error(`Conversion failed for ${newHfn}, using fallback format`);

            // Generate a simple fallback (using layer numeric code + category + subcategory)
            let fallbackMfa = '';

            // Layer codes mapping
            const layerCodes: {[key: string]: string} = {
              'G': '1', 'S': '2', 'L': '3', 'M': '4', 'W': '5',
              'B': '6', 'P': '7', 'T': '8', 'C': '9', 'R': '10'
            };

            // Get numeric codes or default to formatted strings
            const layerCode = layerCodes[formData.layer] || '0';
            // Handle special cases
            if (formData.layer === 'S' && formData.categoryCode === 'POP' && formData.subcategoryCode === 'HPM') {
              fallbackMfa = '2.001.007.001'; // Special case for S.POP.HPM
            } else if (formData.layer === 'W' && formData.categoryCode === 'BCH' && formData.subcategoryCode === 'SUN') {
              fallbackMfa = '5.004.003.001'; // Special case for W.BCH.SUN
            } else {
              // Generic fallback
              fallbackMfa = `${layerCode}.000.000.${sequentialFormatted}`;
            }

            setValue('mfa', fallbackMfa);
            console.log(`Using fallback MFA: ${fallbackMfa}`);
          }
        }
      } catch (error) {
        console.error('Error converting HFN to MFA:', error);
        setValue('mfa', '');
      }
    } else {
      setValue('hfn', '');
      setValue('mfa', '');
    }

    // Log the current state after setting values
    console.log('Current taxonomy state:', {
      layer: formData.layer,
      categoryCode: formData.categoryCode,
      subcategoryCode: formData.subcategoryCode,
      hfn: getValues('hfn'),
      mfa: getValues('mfa'),
      contextState: {
        layer: taxonomyContext.selectedLayer,
        category: taxonomyContext.selectedCategory,
        subcategory: taxonomyContext.selectedSubcategory,
        hfn: taxonomyContext.hfn,
        mfa: taxonomyContext.mfa
      }
    });
  }, [formData.layer, formData.categoryCode, formData.subcategoryCode, formData.sequential, formData.fileType, setValue, getValues, taxonomyContext]);

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
        console.log(`File name matches existing asset "${asset.name}" with NNA address ${mfa}.`);
      }
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
          console.log(`File "${file.name}" is a duplicate (same content). Skipping.`);
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
      setError(`Duplicate file(s) detected: ${duplicateFiles.join(', ')}. These files were skipped.`);
    }
  };
  
  // Map to store file hashes for duplicate detection
  const [fileHashes, setFileHashes] = useState<Map<string, string> | null>(null);

  // Handle file upload progress
  const handleUploadProgress = (fileId: string, progress: number) => {
    // Track progress for future UI improvements
    console.log(`File ${fileId} upload progress: ${progress}%`);
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
    // Adjust step based on layer type
    let adjustedStep = step;
    
    // For composite assets, steps are: Select Layer, Choose Taxonomy, Select Components, Upload Files, Review
    // So we need to adjust the case handling
    if (isCompositeLayer && step >= 2) {
      // For composite assets with step > 1, adjust the step index
      adjustedStep = step + 1;
    }
    
    switch (adjustedStep) {
      case 0:
        return (
          <LayerSelector
            selectedLayer={watchLayer}
            onLayerSelect={(layer, isDoubleClick) => {
              console.log(`RegisterAssetPage received layer select: ${layer}, isDoubleClick=${isDoubleClick}`);
              // Get the layer name based on the code
              const layerNames: Record<string, string> = {
                'G': 'Songs', 'S': 'Stars', 'L': 'Looks', 'M': 'Moves', 'W': 'Worlds',
                'B': 'Branded Assets', 'P': 'Patterns', 'T': 'Training Data', 'C': 'Composites', 'R': 'Rights'
              };
              const name = layerNames[layer] || '';
              
              // Call the handler with proper LayerOption object and isDoubleClick flag
              handleLayerSelect({ code: layer, name, id: layer }, isDoubleClick);
            }}
            onLayerDoubleClick={(layer) => {
              console.log(`RegisterAssetPage received layer double-click: ${layer}`);
              // DO NOT advance to the next step automatically anymore
              // This was causing Step 2 to be skipped
              // Instead, handle the selection and let the normal flow continue
              console.log(`Double-click handled without auto-advancing to preserve Step 2`);
            }}
          />
        );
      case 1:
        return (
          <SimpleTaxonomySelection
            layer={watchLayer}
            selectedCategory={watchCategoryCode}
            selectedSubcategory={watchSubcategoryCode}
            onCategorySelect={(categoryCode) => {
              const category = taxonomyService.getCategories(watchLayer).find(c => c.code === categoryCode);
              if (category) {
                handleCategorySelect({
                  id: categoryCode,
                  code: categoryCode,
                  name: category.name,
                  numericCode: parseInt(category.numericCode)
                });
              }
            }}
            onSubcategorySelect={(subcategoryCode, isDoubleClick) => {
              console.log(`Subcategory selected: ${subcategoryCode}, isDoubleClick=${isDoubleClick}`);
              const subcategories = taxonomyService.getSubcategories(watchLayer, watchCategoryCode);
              const subcategory = subcategories.find(s => s.code === subcategoryCode);

              if (subcategory) {
                // Add an id field to match the SubcategoryOption interface
                handleSubcategorySelect({
                  id: `${watchCategoryCode}_${subcategoryCode}`,
                  code: subcategory.code,
                  name: subcategory.name,
                  numericCode: parseInt(subcategory.numericCode)
                }, isDoubleClick);  // Pass the isDoubleClick parameter for auto-advancing
              } else {
                console.error(`Could not find subcategory ${subcategoryCode} in layer ${watchLayer}, category ${watchCategoryCode}`);
              }
            }}
          />
        );
      case 2:
        // For composite assets, display the component selection form
        if (isCompositeLayer) {
          return (
            <Paper sx={{ p: 3, mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                Select Component Assets
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                A composite asset references other existing assets. Select the components that make up this composite asset.
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <ComponentsForm 
                control={methods.control} 
                watchLayer={watchLayer}
              />
            </Paper>
          );
        }
        // For other assets, display the file upload and asset details
        return (
          <Box>
            <FileUpload
              onFilesChange={handleFilesChange}
              layerCode={watchLayer}
              maxFiles={1}
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

                <Grid item xs={12}>
                  <Box>
                    <Typography variant="subtitle1" gutterBottom>
                      Source
                    </Typography>
                    <select
                      {...register('source')}
                      defaultValue="ReViz"
                      style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '4px',
                        border: '1px solid #ccc',
                      }}
                    >
                      <option value="ReViz">ReViz</option>
                      <option value="Original">Original</option>
                      <option value="Licensed">Licensed</option>
                      <option value="External">External</option>
                    </select>
                    {errors.source && (
                      <Typography color="error" variant="caption">
                        {errors.source.message}
                      </Typography>
                    )}
                    <Typography variant="caption" color="text.secondary">
                      Source indicates the origin of the asset
                    </Typography>
                  </Box>
                </Grid>

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
        // For composite assets, this is file upload step
        if (isCompositeLayer) {
          return (
            <Box>
              <FileUpload
                onFilesChange={handleFilesChange}
                layerCode={watchLayer}
                maxFiles={1}
                onUploadProgress={handleUploadProgress}
                onUploadComplete={handleUploadComplete}
                onUploadError={handleUploadError}
                initialFiles={getValues('files')}
                // Source field now handled directly in the form below
              />
              
              <Box mt={3}>
                <Typography variant="h6" gutterBottom>
                  Asset Details
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Provide additional information about your composite asset.
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

                  {/* Source field - Now under the Tags field */}
                  <Grid item xs={12}>
                    <Box sx={{ mb: 3, mt: 2, bgcolor: '#f5f9ff', borderRadius: 1, border: '1px solid #e0e8f5', p: 2 }}>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ color: '#1976d2' }}>
                        Source *
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        Select the origin of this asset. This is a required field for asset registration.
                      </Typography>
                      <FormControl fullWidth sx={{ mb: 1 }} required>
                        <InputLabel id="source-label">Source</InputLabel>
                        <Select
                          labelId="source-label"
                          id="source"
                          value={watch('source')}
                          label="Source"
                          error={!!errors.source}
                          {...register('source')}
                          onChange={(e) => setValue('source', e.target.value)}
                          sx={{ 
                            bgcolor: '#ffffff',
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#1976d2',
                            },
                          }}
                        >
                          {SOURCE_OPTIONS.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                        {errors.source ? (
                          <FormHelperText error>
                            {errors.source.message as string}
                          </FormHelperText>
                        ) : (
                          <FormHelperText>
                            <Box component="span" fontWeight="medium">
                              ReViz: Assets created by or for ReViz
                              <br />
                              Original: Your own original content
                              <br />
                              Licensed: Content licensed from third parties
                              <br />
                              External: Content from external sources
                            </Box>
                          </FormHelperText>
                        )}
                      </FormControl>
                    </Box>
                  </Grid>
                  
                  {/* Source field for composite assets - Under the Tags field */}
                  <Grid item xs={12}>
                    <Box sx={{ mb: 3, mt: 2, bgcolor: '#f5f9ff', borderRadius: 1, border: '1px solid #e0e8f5', p: 2 }}>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ color: '#1976d2' }}>
                        Source *
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        Select the origin of this asset. This is a required field for asset registration.
                      </Typography>
                      <FormControl fullWidth sx={{ mb: 1 }} required>
                        <InputLabel id="source-label-composite">Source</InputLabel>
                        <Select
                          labelId="source-label-composite"
                          id="source-composite"
                          value={watch('source')}
                          label="Source"
                          error={!!errors.source}
                          {...register('source')}
                          onChange={(e) => setValue('source', e.target.value)}
                          sx={{ 
                            bgcolor: '#ffffff',
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#1976d2',
                            },
                          }}
                        >
                          {SOURCE_OPTIONS.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                        {errors.source ? (
                          <FormHelperText error>
                            {errors.source.message as string}
                          </FormHelperText>
                        ) : (
                          <FormHelperText>
                            <Box component="span" fontWeight="medium">
                              ReViz: Assets created by or for ReViz
                              <br />
                              Original: Your own original content
                              <br />
                              Licensed: Content licensed from third parties
                              <br />
                              External: Content from external sources
                            </Box>
                          </FormHelperText>
                        )}
                      </FormControl>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          );
        }
        
        // For Training Data assets
        if (isTrainingLayer) {
          return (
            <TrainingDataCollection
              onChange={handleTrainingDataChange}
              initialData={getValues('trainingData')}
              isTrainable={true}
            />
          );
        }
        // For regular assets, show review
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
      case 4:
        // Final review steps for Training and Composite layers
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

    console.log("Rendering success screen with asset:", createdAsset);

    // ENHANCED DISPLAY FIX: Use the unified formatter for consistent display

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

    // Get category and subcategory from the asset response
    const category = createdAsset.category || '001';

    // Try to retrieve the original subcategory from sessionStorage if it exists
    let subcategory = '';

    // First check if we have originalSubcategoryCode from a prop
    if (originalSubcategoryCode) {
      subcategory = originalSubcategoryCode;
      console.log(`Using originalSubcategoryCode prop: ${originalSubcategoryCode}`);
    }
    // Then try retrieving from sessionStorage
    else {
      try {
        const storedSubcategory = sessionStorage.getItem(`originalSubcategory_${layer}_${category}`);
        if (storedSubcategory) {
          subcategory = storedSubcategory;
          console.log(`Retrieved original subcategory from sessionStorage: ${subcategory}`);
        }
      } catch (e) {
        console.warn('Error accessing sessionStorage:', e);
      }
    }

    // If we don't have a subcategory from storage, use the one from the backend
    if (!subcategory) {
      subcategory = createdAsset.subcategory || 'BAS';
    }

    console.log(`Using layer=${layer}, category=${category}, subcategory=${subcategory}, sequential=${sequential}`);

    // Use our simplified taxonomy service to generate consistent display format
    const hfnBase = `${layer}.${category}.${subcategory}`;
    const fullHfn = `${hfnBase}.${sequential}`;
    let mfaFromService = '';

    try {
      // Try to convert using simplified taxonomy service
      mfaFromService = taxonomyService.convertHFNtoMFA(fullHfn);
      console.log(`Generated MFA using simplified taxonomy service: ${mfaFromService}`);
    } catch (error) {
      console.error('Error converting HFN to MFA for display:', error);
    }

    // Set display values with fallbacks if service fails
    let displayHfn = fullHfn;
    let displayMfa = mfaFromService;

    // If service failed, use fallbacks for known special cases
    if (!mfaFromService) {
      console.warn('Simplified taxonomy service failed for display, using fallbacks');

      // Special case handling
      if (layer === 'S' && category === 'POP' && subcategory === 'HPM') {
        displayMfa = `2.001.007.${sequential}`;
      } else if (layer === 'W' && category === 'BCH' && subcategory === 'SUN') {
        displayMfa = `5.004.003.${sequential}`;
      } else {
        // Default fallback based on layer
        const layerCode = layer === 'S' ? '2' :
                          layer === 'W' ? '5' : '0';
        displayMfa = `${layerCode}.000.000.${sequential}`;
      }
    }

    console.log(`Successfully formatted addresses for display:`);
    console.log(`HFN: ${displayHfn}, MFA: ${displayMfa}`);

    console.log('IMPORTANT: Created asset is using simplified taxonomy service:');
    console.log(`Original backend Name: ${createdAsset.name}`);
    console.log(`Display HFN: ${displayHfn}`);
    console.log(`Display MFA: ${displayMfa}`);
    console.log(`Original subcategory (for display): ${subcategory}`);

    // Add clear logging for debugging
    console.log('Asset structure:', {
      name: createdAsset.name,
      nnaAddress: createdAsset.nnaAddress,
      layer: createdAsset.layer,
      category: createdAsset.category,
      subcategory: createdAsset.subcategory,
      metadata: createdAsset.metadata
    });

    console.log(`Success screen showing MFA: ${displayMfa} and HFN: ${displayHfn} from asset:`, createdAsset);
                
    const layerName = createdAsset.metadata?.layerName || 
                      `Layer ${createdAsset.layer}`;
    
    // Find the main file data for preview
    // When uploaded from form to backend, we have the original Files in watchFiles
    const formFiles = getValues('files');
    const hasFormFiles = formFiles && formFiles.length > 0;

    // Enhanced logging to debug file display issues
    console.log('File debugging:');
    console.log('- Form files:', formFiles);
    console.log('- Uploaded files:', uploadedFiles);
    console.log('- Asset files from backend:', createdAsset.files);

    if (createdAsset.files && createdAsset.files.length > 0) {
      console.log('- First backend file:', createdAsset.files[0]);
    }

    if (uploadedFiles.length > 0) {
      console.log('- First uploaded file URL:', uploadedFiles[0].url);
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
      console.log('Using uploaded file for preview:', fallbackFile);
    }
    // If no uploaded files, try to use form files with createObjectURL
    else if (hasFormFiles) {
      fallbackFile = {
        url: URL.createObjectURL(formFiles[0]),
        contentType: formFiles[0].type,
        filename: formFiles[0].name,
        size: formFiles[0].size
      };
      console.log('Using form file for preview with object URL:', fallbackFile);
    }

    // Use backend file or fallback to form file
    const displayFile = mainFile || fallbackFile;
    console.log('Final display file:', displayFile);

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
        <Typography variant="h4" gutterBottom color="success.main">
          Asset Created Successfully!
        </Typography>
        
        <Box sx={{ my: 4, p: 3, border: '1px solid #e0e0e0', borderRadius: 2, maxWidth: '800px', mx: 'auto' }}>
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
                          // Set a fallback image or hide the broken image
                          (e.target as HTMLImageElement).style.display = 'none';
                          // Show error message in console for debugging
                          const errorContainer = document.createElement('div');
                          errorContainer.innerHTML = 'Image preview unavailable';
                          (e.target as HTMLImageElement).parentNode?.appendChild(errorContainer);
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
                          {displayHfn}
                        </Typography>
                        <Tooltip title="Using consistent NNA format from the unified formatter">
                          <InfoIcon color="info" fontSize="small" sx={{ ml: 1, width: 18, height: 18 }} />
                        </Tooltip>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary" align="center">
                        Machine-Friendly Address (MFA)
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography variant="body1" fontFamily="monospace" fontWeight="medium" align="center">
                          {displayMfa}
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

              {/* Only show navigation buttons if not on review step */}
              {(activeStep < getSteps(isTrainingLayer, isCompositeLayer).length - 1 || 
                (isTrainingLayer && activeStep < getSteps(isTrainingLayer, isCompositeLayer).length - 2) ||
                (isCompositeLayer && activeStep < getSteps(isTrainingLayer, isCompositeLayer).length - 2)) && (
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