import React, { useEffect, useState } from 'react';
import { taxonomyService } from '../services/simpleTaxonomyService';
import {
  LAYER_LOOKUPS,
  LAYER_SUBCATEGORIES,
} from '../taxonomyLookup/constants';
import { TaxonomyItem } from '../types/taxonomy.types';
import {
  Typography,
  Paper,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Divider,
  Chip,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const TaxonomyDebug: React.FC = () => {
  const layers = ['G', 'S', 'L', 'M', 'W', 'B', 'P', 'T', 'C', 'R'];
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [specialMappings, setSpecialMappings] = useState<
    { hfn: string; mfa: string; success: boolean }[]
  >([]);

  useEffect(() => {
    // Collect data for each layer
    const info: any = {};

    layers.forEach(layer => {
      try {
        const categories = taxonomyService.getCategories(layer);
        console.log(`Layer ${layer} has ${categories.length} categories`);

        info[layer] = {
          categories: categories.map(c => c.code),
          categoryCount: categories.length,
          lookupKeys: Object.keys(LAYER_LOOKUPS[layer] || {}).length,
          subcategoryKeys: Object.keys(LAYER_SUBCATEGORIES[layer] || {}).length,
          subcategories: {},
        };

        // Get subcategories for each category
        categories.forEach(category => {
          const subs = taxonomyService.getSubcategories(layer, category.code);
          info[layer].subcategories[category.code] = {
            list: subs.map(s => s.code),
            count: subs.length,
          };
        });
      } catch (error) {
        info[layer] = {
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    });

    setDebugInfo(info);

    // Test the special mappings
    const testSpecialMappings = [
      { hfn: 'W.BCH.SUN.001', expectedMfa: '5.004.003.001' },
      { hfn: 'S.POP.HPM.001', expectedMfa: '2.001.007.001' },
    ];

    const results = testSpecialMappings.map(mapping => {
      try {
        const mfa = taxonomyService.convertHFNtoMFA(mapping.hfn);
        return {
          hfn: mapping.hfn,
          mfa,
          success: mfa === mapping.expectedMfa,
        };
      } catch (error) {
        return {
          hfn: mapping.hfn,
          mfa:
            'Error: ' +
            (error instanceof Error ? error.message : 'Unknown error'),
          success: false,
        };
      }
    });

    setSpecialMappings(results);
  }, []);

  return (
    <Paper elevation={3} sx={{ p: 3, m: 2 }}>
      <Typography variant="h5" gutterBottom>
        Taxonomy Debug Information
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Special Mappings Test
        </Typography>
        <Grid container spacing={2}>
          {specialMappings.map((mapping, index) => (
            <Grid item xs={12} key={index}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle1">
                  {mapping.hfn} → {mapping.mfa}
                </Typography>
                <Chip
                  label={mapping.success ? 'Success' : 'Failed'}
                  color={mapping.success ? 'success' : 'error'}
                  sx={{ mt: 1 }}
                />
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6" gutterBottom>
        Layer Information
      </Typography>

      {layers.map(layer => (
        <Accordion key={layer}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>
              Layer {layer} -
              {debugInfo[layer]?.error ? (
                <span style={{ color: 'red' }}>
                  {' '}
                  Error: {debugInfo[layer].error}
                </span>
              ) : (
                ` ${debugInfo[layer]?.categoryCount || 0} categories, ${
                  debugInfo[layer]?.lookupKeys || 0
                } lookup keys`
              )}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Categories:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {debugInfo[layer]?.categories?.map((cat: string) => (
                  <Chip key={cat} label={cat} />
                ))}
              </Box>

              <Typography variant="subtitle2" gutterBottom>
                Subcategories by Category:
              </Typography>
              {debugInfo[layer]?.subcategories &&
                Object.keys(debugInfo[layer].subcategories).map(cat => (
                  <Box key={cat} sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {cat} ({debugInfo[layer].subcategories[cat].count}):
                    </Typography>
                    <Box
                      sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, ml: 2 }}
                    >
                      {debugInfo[layer].subcategories[cat].list.map(
                        (sub: string) => (
                          <Chip
                            key={sub}
                            label={sub}
                            size="small"
                            variant="outlined"
                          />
                        )
                      )}
                    </Box>
                  </Box>
                ))}
            </Box>
          </AccordionDetails>
        </Accordion>
      ))}

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6" gutterBottom>
        Raw Layer Lookups Data
      </Typography>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>View Raw Layer Lookups</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.8rem' }}>
            {JSON.stringify(LAYER_LOOKUPS, null, 2)}
          </pre>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>View Raw Layer Subcategories</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.8rem' }}>
            {JSON.stringify(LAYER_SUBCATEGORIES, null, 2)}
          </pre>
        </AccordionDetails>
      </Accordion>
    </Paper>
  );
};

export default TaxonomyDebug;
