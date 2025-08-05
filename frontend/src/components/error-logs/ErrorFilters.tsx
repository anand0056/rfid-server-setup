'use client';

import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Typography,
  Chip
} from '@mui/material';
import { FilterList, Clear } from '@mui/icons-material';
import { ErrorType, ErrorLogQueryParams } from '../../types/error-log';

interface ErrorFiltersProps {
  filters: ErrorLogQueryParams;
  onFiltersChange: (filters: ErrorLogQueryParams) => void;
}

const errorTypeLabels = {
  [ErrorType.MQTT_PARSE_ERROR]: 'MQTT Parse Error',
  [ErrorType.DATABASE_ERROR]: 'Database Error',
  [ErrorType.VALIDATION_ERROR]: 'Validation Error',
  [ErrorType.UNKNOWN_READER]: 'Unknown Reader',
  [ErrorType.UNKNOWN_CARD]: 'Unknown Card',
  [ErrorType.GENERAL_ERROR]: 'General Error',
};

export default function ErrorFilters({ filters, onFiltersChange }: ErrorFiltersProps) {
  const handleFilterChange = (key: keyof ErrorLogQueryParams, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      page: 1,
      limit: 50,
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.errorType) count++;
    if (filters.resolved !== undefined) count++;
    if (filters.startDate) count++;
    if (filters.endDate) count++;
    return count;
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <FilterList />
          <Typography variant="h6">
            Filters
          </Typography>
          {getActiveFiltersCount() > 0 && (
            <Chip 
              label={`${getActiveFiltersCount()} active`} 
              size="small" 
              color="primary" 
            />
          )}
        </Box>
        
        <Box display="flex" flexWrap="wrap" gap={2} mb={2}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Error Type</InputLabel>
            <Select
              value={filters.errorType || ''}
              label="Error Type"
              onChange={(e) => handleFilterChange('errorType', e.target.value || undefined)}
            >
              <MenuItem value="">All Types</MenuItem>
              {Object.entries(errorTypeLabels).map(([value, label]) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filters.resolved === undefined ? '' : filters.resolved.toString()}
              label="Status"
              onChange={(e) => {
                const value = e.target.value;
                handleFilterChange('resolved', value === '' ? undefined : value === 'true');
              }}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="false">Unresolved</MenuItem>
              <MenuItem value="true">Resolved</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Start Date"
            type="date"
            value={filters.startDate || ''}
            onChange={(e) => handleFilterChange('startDate', e.target.value || undefined)}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 150 }}
          />
          
          <TextField
            label="End Date"
            type="date"
            value={filters.endDate || ''}
            onChange={(e) => handleFilterChange('endDate', e.target.value || undefined)}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 150 }}
          />
        </Box>

        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            startIcon={<Clear />}
            onClick={clearFilters}
            disabled={getActiveFiltersCount() === 0}
          >
            Clear Filters
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
