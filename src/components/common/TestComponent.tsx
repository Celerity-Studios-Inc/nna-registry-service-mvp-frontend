import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import axios from 'axios';

/**
 * Test component for diagnosing API connectivity issues
 * This component allows testing various HTTP methods against different endpoints
 */
const TestComponent: React.FC = () => {
  const [endpoint, setEndpoint] = useState<string>('/api/health');
  const [method, setMethod] = useState<string>('GET');
  const [requestBody, setRequestBody] = useState<string>('{"test": true}');
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleTest = async () => {
    setLoading(true);
    setError('');
    setResponse(null);

    try {
      console.log(`Testing API: ${method} ${endpoint}`);

      let result;
      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
      };

      switch (method) {
        case 'GET':
          result = await axios.get(endpoint, config);
          break;
        case 'POST':
          result = await axios.post(endpoint, JSON.parse(requestBody), config);
          break;
        case 'PUT':
          result = await axios.put(endpoint, JSON.parse(requestBody), config);
          break;
        case 'DELETE':
          result = await axios.delete(endpoint, config);
          break;
        default:
          result = await axios.get(endpoint, config);
      }

      setResponse(result.data);
      console.log('API test successful:', result);
    } catch (err: any) {
      console.error('API test failed:', err);
      setError(err.message || 'An error occurred');

      // Try to get more detailed error info
      if (err.response) {
        setResponse({
          error: true,
          status: err.response.status,
          statusText: err.response.statusText,
          data: err.response.data,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, m: 2 }}>
      <Typography variant="h5" gutterBottom>
        API Test Utility
      </Typography>

      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          label="API Endpoint"
          value={endpoint}
          onChange={e => setEndpoint(e.target.value)}
          margin="normal"
          variant="outlined"
          placeholder="/api/health"
        />
      </Box>

      <Box sx={{ mb: 2 }}>
        <FormControl fullWidth margin="normal">
          <InputLabel>HTTP Method</InputLabel>
          <Select
            value={method}
            onChange={e => setMethod(e.target.value as string)}
            label="HTTP Method"
          >
            <MenuItem value="GET">GET</MenuItem>
            <MenuItem value="POST">POST</MenuItem>
            <MenuItem value="PUT">PUT</MenuItem>
            <MenuItem value="DELETE">DELETE</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {(method === 'POST' || method === 'PUT') && (
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            label="Request Body (JSON)"
            value={requestBody}
            onChange={e => setRequestBody(e.target.value)}
            margin="normal"
            variant="outlined"
            multiline
            rows={4}
          />
        </Box>
      )}

      <Button
        variant="contained"
        color="primary"
        onClick={handleTest}
        disabled={loading}
        sx={{ mb: 3 }}
      >
        {loading ? 'Testing...' : 'Test API Connection'}
      </Button>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          Error: {error}
        </Typography>
      )}

      {response && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Response:
          </Typography>
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              maxHeight: '300px',
              overflow: 'auto',
              backgroundColor: '#f5f5f5',
              fontFamily: 'monospace',
            }}
          >
            <pre>{JSON.stringify(response, null, 2)}</pre>
          </Paper>
        </Box>
      )}
    </Paper>
  );
};

export default TestComponent;
