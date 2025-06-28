/**
 * Taxonomy Service Test Component
 * 
 * This component provides a comprehensive test interface for the new
 * taxonomy service integration. It allows testing both the API service
 * and the adapter service to verify functionality before full migration.
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Alert,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  ExpandMore,
  PlayArrow,
  Refresh,
  Check,
  Error,
  Warning,
  Info,
} from '@mui/icons-material';

import apiTaxonomyService from '../../services/apiTaxonomyService';
import taxonomyServiceAdapter from '../../services/taxonomyServiceAdapter';
import { TaxonomyItem } from '../../types/taxonomy.types';

interface TestResult {
  testName: string;
  status: 'pending' | 'running' | 'success' | 'error' | 'warning';
  duration?: number;
  result?: any;
  error?: string;
  timestamp?: Date;
}

interface PerformanceMetric {
  operationName: string;
  startTime: number;
  endTime: number;
  duration: number;
  source: 'api' | 'fallback' | 'cache';
  success: boolean;
  error?: string;
}

const TaxonomyServiceTest: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedLayer, setSelectedLayer] = useState('S');
  const [selectedCategory, setSelectedCategory] = useState('POP');
  const [selectedSubcategory, setSelectedSubcategory] = useState('DIV');
  const [testHfn, setTestHfn] = useState('S.POP.DIV.001');
  const [testMfa, setTestMfa] = useState('2.001.001.001');
  const [useApiService, setUseApiService] = useState(false);
  const [serviceStatus, setServiceStatus] = useState<any>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);

  // Available layers for testing
  const testLayers = ['G', 'S', 'L', 'M', 'W', 'B', 'P', 'T', 'C', 'R'];

  useEffect(() => {
    loadServiceStatus();
  }, []);

  const loadServiceStatus = async () => {
    try {
      const status = await taxonomyServiceAdapter.getServiceStatus();
      setServiceStatus(status);
    } catch (error) {
      console.error('Failed to load service status:', error);
    }
  };

  const addTestResult = (result: TestResult) => {
    setTestResults(prev => [result, ...prev.slice(0, 49)]); // Keep last 50 results
  };

  const updateTestResult = (testName: string, updates: Partial<TestResult>) => {
    setTestResults(prev => 
      prev.map(result => 
        result.testName === testName 
          ? { ...result, ...updates, timestamp: new Date() }
          : result
      )
    );
  };

  const runTest = async (testName: string, testFunction: () => Promise<any>) => {
    const startTime = Date.now();
    
    addTestResult({
      testName,
      status: 'running',
      timestamp: new Date(),
    });

    try {
      const result = await testFunction();
      const duration = Date.now() - startTime;
      
      updateTestResult(testName, {
        status: 'success',
        duration,
        result,
      });
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      updateTestResult(testName, {
        status: 'error',
        duration,
        error: String(error),
      });
      
      throw error;
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    try {
      // Test 1: Service Status
      await runTest('Service Status', async () => {
        return await taxonomyServiceAdapter.getServiceStatus();
      });

      // Test 2: API Availability
      await runTest('API Availability', async () => {
        return await apiTaxonomyService.isApiAvailable();
      });

      // Test 3: Get Layers
      await runTest('Get Layers', async () => {
        if (useApiService) {
          return await apiTaxonomyService.getLayers();
        } else {
          return await taxonomyServiceAdapter.getLayersAsync();
        }
      });

      // Test 4: Get Categories
      await runTest(`Get Categories (${selectedLayer})`, async () => {
        if (useApiService) {
          return await apiTaxonomyService.getCategories(selectedLayer);
        } else {
          return await taxonomyServiceAdapter.getCategoriesAsync(selectedLayer);
        }
      });

      // Test 5: Get Subcategories
      await runTest(`Get Subcategories (${selectedLayer}.${selectedCategory})`, async () => {
        if (useApiService) {
          return await apiTaxonomyService.getSubcategories(selectedLayer, selectedCategory);
        } else {
          return await taxonomyServiceAdapter.getSubcategoriesAsync(selectedLayer, selectedCategory);
        }
      });

      // Test 6: HFN to MFA Conversion
      await runTest('HFN to MFA Conversion', async () => {
        if (useApiService) {
          return await apiTaxonomyService.convertHFNtoMFA(testHfn);
        } else {
          return await taxonomyServiceAdapter.convertHFNtoMFAAsync(testHfn);
        }
      });

      // Test 7: MFA to HFN Conversion
      await runTest('MFA to HFN Conversion', async () => {
        if (useApiService) {
          return await apiTaxonomyService.convertMFAtoHFN(testMfa);
        } else {
          return await taxonomyServiceAdapter.convertMFAtoHFNAsync(testMfa);
        }
      });

      // Test 8: Next Sequence
      await runTest('Get Next Sequence', async () => {
        return await taxonomyServiceAdapter.getNextSequence(
          selectedLayer,
          selectedCategory,
          selectedSubcategory
        );
      });

      // Test 9: Performance Metrics
      await runTest('Performance Metrics', async () => {
        const metrics = taxonomyServiceAdapter.getPerformanceMetrics();
        setPerformanceMetrics(metrics);
        return `Retrieved ${metrics.length} performance metrics`;
      });

      // Test 10: Cache Operations
      await runTest('Cache Clear', async () => {
        apiTaxonomyService.clearCache();
        return 'Cache cleared successfully';
      });

    } catch (error) {
      console.error('Test suite failed:', error);
    } finally {
      setIsRunning(false);
      await loadServiceStatus();
    }
  };

  const runSingleTest = async (testName: string) => {
    setIsRunning(true);

    try {
      switch (testName) {
        case 'layers':
          await runTest('Get Layers', async () => {
            return useApiService 
              ? await apiTaxonomyService.getLayers()
              : await taxonomyServiceAdapter.getLayersAsync();
          });
          break;

        case 'categories':
          await runTest(`Get Categories (${selectedLayer})`, async () => {
            return useApiService
              ? await apiTaxonomyService.getCategories(selectedLayer)
              : await taxonomyServiceAdapter.getCategoriesAsync(selectedLayer);
          });
          break;

        case 'subcategories':
          await runTest(`Get Subcategories (${selectedLayer}.${selectedCategory})`, async () => {
            return useApiService
              ? await apiTaxonomyService.getSubcategories(selectedLayer, selectedCategory)
              : await taxonomyServiceAdapter.getSubcategoriesAsync(selectedLayer, selectedCategory);
          });
          break;

        case 'hfn-to-mfa':
          await runTest('HFN to MFA', async () => {
            return useApiService
              ? await apiTaxonomyService.convertHFNtoMFA(testHfn)
              : await taxonomyServiceAdapter.convertHFNtoMFAAsync(testHfn);
          });
          break;

        case 'mfa-to-hfn':
          await runTest('MFA to HFN', async () => {
            return useApiService
              ? await apiTaxonomyService.convertMFAtoHFN(testMfa)
              : await taxonomyServiceAdapter.convertMFAtoHFNAsync(testMfa);
          });
          break;
      }
    } catch (error) {
      console.error(`Single test ${testName} failed:`, error);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <Check color="success" />;
      case 'error':
        return <Error color="error" />;
      case 'warning':
        return <Warning color="warning" />;
      case 'running':
        return <CircularProgress size={20} />;
      default:
        return <Info color="info" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return 'success';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'running':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Taxonomy Service Integration Test
      </Typography>

      <Grid container spacing={3}>
        {/* Control Panel */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Test Configuration
              </Typography>

              <FormControlLabel
                control={
                  <Switch
                    checked={useApiService}
                    onChange={(e) => setUseApiService(e.target.checked)}
                  />
                }
                label="Use Direct API Service"
                sx={{ mb: 2 }}
              />

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Test Layer</InputLabel>
                <Select
                  value={selectedLayer}
                  onChange={(e) => setSelectedLayer(e.target.value)}
                  label="Test Layer"
                >
                  {testLayers.map(layer => (
                    <MenuItem key={layer} value={layer}>{layer}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Category Code"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Subcategory Code"
                value={selectedSubcategory}
                onChange={(e) => setSelectedSubcategory(e.target.value)}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Test HFN"
                value={testHfn}
                onChange={(e) => setTestHfn(e.target.value)}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Test MFA"
                value={testMfa}
                onChange={(e) => setTestMfa(e.target.value)}
                sx={{ mb: 3 }}
              />

              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  onClick={runAllTests}
                  disabled={isRunning}
                  startIcon={<PlayArrow />}
                  size="small"
                >
                  Run All Tests
                </Button>
                
                <Button
                  variant="outlined"
                  onClick={loadServiceStatus}
                  startIcon={<Refresh />}
                  size="small"
                >
                  Refresh Status
                </Button>
              </Box>

              <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button size="small" onClick={() => runSingleTest('layers')}>
                  Test Layers
                </Button>
                <Button size="small" onClick={() => runSingleTest('categories')}>
                  Test Categories
                </Button>
                <Button size="small" onClick={() => runSingleTest('subcategories')}>
                  Test Subcategories
                </Button>
                <Button size="small" onClick={() => runSingleTest('hfn-to-mfa')}>
                  Test HFN→MFA
                </Button>
                <Button size="small" onClick={() => runSingleTest('mfa-to-hfn')}>
                  Test MFA→HFN
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Service Status */}
          {serviceStatus && (
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Service Status
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Chip
                    label={`API: ${serviceStatus.apiServiceStatus?.apiAvailable ? 'Available' : 'Unavailable'}`}
                    color={serviceStatus.apiServiceStatus?.apiAvailable ? 'success' : 'error'}
                    size="small"
                    sx={{ mr: 1, mb: 1 }}
                  />
                  <Chip
                    label={`Fallback: ${serviceStatus.fallbackAvailable ? 'Available' : 'Unavailable'}`}
                    color={serviceStatus.fallbackAvailable ? 'success' : 'warning'}
                    size="small"
                    sx={{ mr: 1, mb: 1 }}
                  />
                  <Chip
                    label={`Cache: ${serviceStatus.apiServiceStatus?.cacheStats?.layersCached ? 'Active' : 'Empty'}`}
                    color={serviceStatus.apiServiceStatus?.cacheStats?.layersCached ? 'info' : 'default'}
                    size="small"
                    sx={{ mr: 1, mb: 1 }}
                  />
                </Box>

                <Typography variant="body2" color="text.secondary">
                  Adapter Version: {serviceStatus.adapterVersion}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Performance Metrics: {serviceStatus.performanceMetricsCount}
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Test Results */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Test Results
              </Typography>

              {testResults.length === 0 ? (
                <Alert severity="info">
                  No tests have been run yet. Click "Run All Tests" to start testing.
                </Alert>
              ) : (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Status</TableCell>
                        <TableCell>Test Name</TableCell>
                        <TableCell>Duration</TableCell>
                        <TableCell>Timestamp</TableCell>
                        <TableCell>Result/Error</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {testResults.map((result, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Chip
                              icon={getStatusIcon(result.status)}
                              label={result.status}
                              color={getStatusColor(result.status) as any}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{result.testName}</TableCell>
                          <TableCell>
                            {result.duration ? `${result.duration}ms` : '-'}
                          </TableCell>
                          <TableCell>
                            {result.timestamp?.toLocaleTimeString()}
                          </TableCell>
                          <TableCell>
                            {result.error ? (
                              <Typography variant="body2" color="error">
                                {result.error}
                              </Typography>
                            ) : result.result ? (
                              <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {typeof result.result === 'object' 
                                  ? JSON.stringify(result.result).substring(0, 100) + '...'
                                  : String(result.result)
                                }
                              </Typography>
                            ) : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          {performanceMetrics.length > 0 && (
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Performance Metrics
                </Typography>

                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Operation</TableCell>
                        <TableCell>Duration</TableCell>
                        <TableCell>Source</TableCell>
                        <TableCell>Success</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {performanceMetrics.slice(0, 20).map((metric, index) => (
                        <TableRow key={index}>
                          <TableCell>{metric.operationName}</TableCell>
                          <TableCell>{metric.duration}ms</TableCell>
                          <TableCell>
                            <Chip
                              label={metric.source}
                              color={metric.source === 'api' ? 'primary' : metric.source === 'cache' ? 'success' : 'default'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={metric.success ? 'Yes' : 'No'}
                              color={metric.success ? 'success' : 'error'}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default TaxonomyServiceTest;