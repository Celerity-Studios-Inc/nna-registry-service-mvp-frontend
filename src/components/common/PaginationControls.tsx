import React from 'react';
import {
  Box,
  Pagination,
  PaginationItem,
  FormControl,
  Select,
  MenuItem,
  Typography,
  SelectChangeEvent,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';

interface PaginationControlsProps {
  page: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
  itemsPerPageOptions?: number[];
  siblingCount?: number;
  showFirstButton?: boolean;
  showLastButton?: boolean;
  disabled?: boolean;
}

/**
 * Reusable pagination controls component
 * Provides page navigation and items per page selection
 */
const PaginationControls: React.FC<PaginationControlsProps> = ({
  page,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  itemsPerPageOptions = [10, 25, 50, 100],
  siblingCount = 1,
  showFirstButton = true,
  showLastButton = true,
  disabled = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Start and end range calculation
  const startItem = totalItems === 0 ? 0 : (page - 1) * itemsPerPage + 1;
  const endItem = Math.min(page * itemsPerPage, totalItems);

  // Handle page change
  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    onPageChange(value);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (event: SelectChangeEvent<number>) => {
    onItemsPerPageChange(Number(event.target.value));
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'flex-start' : 'center',
        justifyContent: 'space-between',
        width: '100%',
        mt: 3,
        mb: 2,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          mb: isMobile ? 2 : 0,
        }}
      >
        <Typography variant="body2" color="text.secondary" mr={2}>
          Showing {startItem}-{endItem} of {totalItems} items
        </Typography>
        <FormControl variant="outlined" size="small" disabled={disabled}>
          <Select
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
            sx={{ height: 32, minWidth: 80 }}
          >
            {itemsPerPageOptions.map(option => (
              <MenuItem key={option} value={option}>
                {option} per page
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {totalPages > 1 && (
        <Pagination
          page={page}
          count={totalPages}
          disabled={disabled}
          siblingCount={siblingCount}
          showFirstButton={showFirstButton}
          showLastButton={showLastButton}
          onChange={handlePageChange}
          renderItem={item => (
            <PaginationItem
              slots={{
                previous: KeyboardArrowLeftIcon,
                next: KeyboardArrowRightIcon,
              }}
              {...item}
            />
          )}
        />
      )}
    </Box>
  );
};

export default PaginationControls;
