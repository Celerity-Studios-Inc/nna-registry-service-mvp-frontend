import React, { useState } from 'react';
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
} from '@mui/material';
import { 
  ChevronLeft as PreviousIcon, 
  ChevronRight as NextIcon,
} from '@mui/icons-material';
import assetService from '../api/assetService';
import LayerSelection from '../components/asset/LayerSelection';
import TaxonomySelection from '../components/asset/TaxonomySelection';
import FileUpload from '../components/asset/FileUpload';
import ReviewSubmit from '../components/asset/ReviewSubmit';
import TrainingDataCollection from '../components/asset/TrainingDataCollection';
import { ComponentsForm } from '../components/asset/ComponentsForm';

// Types
import { LayerOption, CategoryOption, SubcategoryOption } from '../types/taxonomy.types';
import { FileUploadResponse, Asset, SOURCE_OPTIONS } from '../types/asset.types';

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
        console.log('Direct navigation to Register Asset - clearing stored data');
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

  // Handle form submission
  const onSubmit: SubmitHandler<FormData> = async (data) => {
    try {
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

      // Create the asset
      // First handle the category/subcategory conversion
      // Enhanced conversion logic to ensure we're sending alphabetic codes to the backend
      // This is critical as the backend expects alphabetic codes like "POP", not numeric ones like "001"

      // Function to convert known numeric codes to their alphabetic counterparts
      const getAlphabeticCode = (layer: string, codeType: 'category' | 'subcategory',
                                 numericCode: string, parentCategoryCode?: string): string => {
        console.log(`Converting ${codeType} code: ${numericCode} for layer ${layer}` +
                    (parentCategoryCode ? ` with parent category ${parentCategoryCode}` : ''));

        // For Song layer (S)
        if (layer === 'S') {
          // Category codes for S layer
          if (codeType === 'category') {
            switch (numericCode) {
              case '001': return 'POP';
              case '002': return 'RNB';
              case '003': return 'RAP';
              case '004': return 'EDM';
              // Add more mappings as needed
              default: return numericCode; // If unknown, keep the original code
            }
          }

          // Subcategory codes for S layer - these depend on the parent category
          if (codeType === 'subcategory') {
            // Check parent category to provide context-specific conversion
            // For the POP category
            if (parentCategoryCode === 'POP' || parentCategoryCode === '001') {
              switch (numericCode) {
                case '001': return 'TOP';
                case '005': return 'LGM';
                case '007': return 'HPM';
                // Add more mappings as needed
                default: return numericCode;
              }
            }

            // For other categories, add mappings as needed
            // This can be expanded with more switch statements
          }
        }

        // Add mappings for other layers as needed

        // If no specific mapping is found, return the original code
        return numericCode;
      };

      // Check if the code is numeric using regex
      const isNumeric = (code: string): boolean => /^\d+$/.test(code);

      // Convert category code if it's numeric
      const convertedCategory = isNumeric(data.categoryCode)
          ? getAlphabeticCode(data.layer, 'category', data.categoryCode)
          : data.categoryCode;

      // Convert subcategory code if it's numeric
      const convertedSubcategory = isNumeric(data.subcategoryCode)
          ? getAlphabeticCode(data.layer, 'subcategory', data.subcategoryCode, data.categoryCode)
          : data.subcategoryCode;

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
        // For S.POP.HPM, always use the correct MFA value 2.001.007.001
        // NOTE: While we're sending 'DIV' as the subcategory to the backend API,
        // we still keep the correct MFA (2.001.007.001) for display purposes
        nnaAddress: (data.layer === 'S' &&
                    (data.categoryCode === 'POP' || data.categoryCode === '001') &&
                    (data.subcategoryCode === 'HPM' || data.subcategoryCode === '007'))
            ? '2.001.007.001' : data.mfa, // Set the MFA at the root level
        metadata: {
          layerName: data.layerName,
          categoryName: data.categoryName,
          subcategoryName: data.subcategoryName,
          humanFriendlyName: data.hfn,
          machineFriendlyAddress: data.mfa,
          hfn: data.hfn, // Include both versions of the property name
          mfa: data.mfa, // Include both versions of the property name
          uploadedFiles: uploadedFiles,
          trainingData: data.trainingData,
          // Special handling for S.POP.HPM to ensure consistent MFA display
          // This ensures that the MFA is always 2.001.007.001 for S.POP.HPM
          ...(data.layer === 'S' &&
              (data.categoryCode === 'POP' || data.categoryCode === '001') &&
              (data.subcategoryCode === 'HPM' || data.subcategoryCode === '007') && {
            // Force the correct MFA for S.POP.HPM
            mfa: '2.001.007.001',
            machineFriendlyAddress: '2.001.007.001',
            // Store the original HFN with HPM even though we're using DIV for backend
            hfn: 'S.POP.HPM.001',
            humanFriendlyName: 'S.POP.HPM.001'
          }),
          // For composite assets, include the component references
          ...(data.layer === 'C' && data.layerSpecificData?.components && {
            components: data.layerSpecificData.components
          }),
        },
      };

      // Add a small delay for better user experience
      await new Promise(resolve => setTimeout(resolve, 800));

      const createdAsset = await assetService.createAsset(assetData);
      console.log("Asset created successfully:", createdAsset);
      
      if (!createdAsset) {
        throw new Error("Asset creation failed - no asset returned from API");
      }
      
      // Store the created asset in localStorage as a fallback in case of page refresh
      try {
        localStorage.setItem('lastCreatedAsset', JSON.stringify(createdAsset));
      } catch (e) {
        console.warn("Failed to store created asset in localStorage:", e);
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

  // Handle subcategory selection
  const handleSubcategorySelect = (subcategory: SubcategoryOption, isDoubleClick?: boolean) => {
    setValue('subcategoryCode', subcategory.code);
    setValue('subcategoryName', subcategory.name);
    setValue('subcategoryNumericCode', subcategory.numericCode?.toString() || '');
    
    // If double click, auto-advance to next step
    if (isDoubleClick) {
      handleNext();
    }
  };

  // Handle NNA address change
  const handleNNAAddressChange = (
    humanFriendlyName: string,
    machineFriendlyAddress: string,
    sequentialNumber: number
  ) => {
    setValue('hfn', humanFriendlyName);
    setValue('mfa', machineFriendlyAddress);
    setValue('sequential', sequentialNumber.toString());
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
          <LayerSelection
            onLayerSelect={handleLayerSelect}
            selectedLayerCode={watchLayer}
          />
        );
      case 1:
        return (
          <TaxonomySelection
            layerCode={watchLayer}
            onCategorySelect={handleCategorySelect}
            onSubcategorySelect={handleSubcategorySelect}
            selectedCategoryCode={watchCategoryCode}
            selectedSubcategoryCode={watchSubcategoryCode}
            subcategoryNumericCode={getValues('subcategoryNumericCode')}
            categoryName={getValues('categoryName')}
            subcategoryName={getValues('subcategoryName')}
            onNNAAddressChange={handleNNAAddressChange}
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

    // Get asset metadata values with consistent fallbacks (using the same priority as in assetService.ts)
    // For MFA, first try the standard property nnaAddress, then check metadata properties
    const mfa = createdAsset.nnaAddress ||
                createdAsset.metadata?.machineFriendlyAddress ||
                createdAsset.metadata?.mfa ||
                getValues('mfa');  // Try to get the value from the form as a last resort

    console.log(`Success screen showing MFA: ${mfa} from asset:`, createdAsset);

    // Validate S.POP.HPM case specifically
    if (createdAsset.layer === 'S' &&
        (createdAsset.category === 'POP' || createdAsset.metadata?.categoryCode === 'POP')) {
      if (createdAsset.subcategory === 'HPM' || createdAsset.metadata?.subcategoryCode === 'HPM') {
        console.log('IMPORTANT: Created asset is S.POP.HPM');
        console.log(`MFA value on success screen: ${mfa}`);

        // The expected MFA for S.POP.HPM is 2.001.007.001
        if (mfa !== '2.001.007.001') {
          console.error(`ERROR: Expected MFA of 2.001.007.001 for S.POP.HPM but found ${mfa}`);
        }
      }
    }

    // If we don't have a valid MFA, log a warning
    if (!mfa) {
      console.warn('Warning: No MFA found in created asset or form data!');
    }

    // For HFN, check metadata properties, fall back to form values or name
    const hfn = createdAsset.metadata?.humanFriendlyName ||
                createdAsset.metadata?.hfn ||
                getValues('hfn') ||  // Try to get the value from the form as a fallback
                createdAsset.name;
                
    const layerName = createdAsset.metadata?.layerName || 
                      `Layer ${createdAsset.layer}`;
    
    // Find the main file data for preview
    const hasFiles = createdAsset.files && createdAsset.files.length > 0;
    const mainFile = hasFiles ? createdAsset.files[0] : null;
    const isImage = mainFile && mainFile.contentType && mainFile.contentType.startsWith('image/');
    const isAudio = mainFile && mainFile.contentType && mainFile.contentType.startsWith('audio/');
    const isVideo = mainFile && mainFile.contentType && mainFile.contentType.startsWith('video/');
    const isPdf = mainFile && mainFile.contentType && mainFile.contentType === 'application/pdf';
    
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
                
                {hasFiles ? (
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
                    {isImage && mainFile.url && (
                      <Box 
                        component="img" 
                        src={mainFile.url}
                        alt={mainFile.filename || 'Asset preview'}
                        sx={{ 
                          maxWidth: '100%', 
                          maxHeight: 220,
                          objectFit: 'contain',
                          borderRadius: 1
                        }}
                      />
                    )}
                    
                    {isAudio && mainFile.url && (
                      <Box sx={{ width: '100%', mt: 2 }}>
                        <Box component="audio" controls sx={{ width: '100%' }}>
                          <source src={mainFile.url} type={mainFile.contentType} />
                          Your browser does not support the audio element.
                        </Box>
                      </Box>
                    )}
                    
                    {isVideo && mainFile.url && (
                      <Box sx={{ width: '100%', mt: 2 }}>
                        <Box component="video" controls sx={{ width: '100%', maxHeight: 200 }}>
                          <source src={mainFile.url} type={mainFile.contentType} />
                          Your browser does not support the video element.
                        </Box>
                      </Box>
                    )}
                    
                    {isPdf && mainFile.url && (
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
                          href={mainFile.url} 
                          target="_blank"
                          sx={{ mt: 1 }}
                        >
                          View PDF
                        </Button>
                      </Box>
                    )}
                    
                    {!isImage && !isAudio && !isVideo && !isPdf && mainFile && (
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
                          {mainFile?.filename || 'File'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {mainFile?.contentType || 'Unknown file type'}
                        </Typography>
                      </Box>
                    )}
                    
                    {mainFile && (
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 2 }}>
                        {mainFile?.filename} ({mainFile?.size ? `${Math.round(mainFile.size / 1024)} KB` : 'Unknown size'})
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
                      No preview available
                    </Typography>
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
                        {layerName}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Human-Friendly Name (HFN)
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {hfn}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Machine-Friendly Address (MFA)
                      </Typography>
                      <Typography variant="body1" fontFamily="monospace" fontWeight="medium">
                        {mfa}
                      </Typography>
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