'use client';

import { useState, useEffect } from 'react';
import { Container, Typography, Box, Alert, CircularProgress } from '@mui/material';
import { ErrorOutline } from '@mui/icons-material';
import ErrorStats from '../../components/error-logs/ErrorStats';
import ErrorFilters from '../../components/error-logs/ErrorFilters';
import ErrorTable from '../../components/error-logs/ErrorTable';
import { 
  ErrorLog, 
  ErrorLogStats, 
  ErrorLogQueryParams, 
  ErrorLogResponse 
} from '../../types/error-log';
import { BACKEND_API_URL } from '../../flavours/apiConfig';

export default function ErrorLogsPage() {
  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]);
  const [stats, setStats] = useState<ErrorLogStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ErrorLogQueryParams>({
    page: 1,
    limit: 50,
  });
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 0,
  });

  // Fetch error logs
  const fetchErrorLogs = async (params: ErrorLogQueryParams) => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });

      const response = await fetch(`/api/error-logs?${queryParams}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ErrorLogResponse = await response.json();
      setErrorLogs(data.data);
      setPagination({
        total: data.total,
        page: data.page,
        totalPages: data.totalPages,
      });
    } catch (err) {
      console.error('Error fetching error logs:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch error logs');
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const response = await fetch('/api/error-logs/stats');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ErrorLogStats = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  // Handle filter changes
  const handleFiltersChange = (newFilters: ErrorLogQueryParams) => {
    setFilters(newFilters);
  };

  // Handle page changes
  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  // Handle resolve error
  const handleResolveError = async (id: number, resolvedBy: string, notes?: string) => {
    try {
      const response = await fetch(`${BACKEND_API_URL}/api/error-logs/${id}/resolve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ resolvedBy, resolutionNotes: notes }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Refresh data
      fetchErrorLogs(filters);
      fetchStats();
    } catch (err) {
      console.error('Error resolving error log:', err);
      setError('Failed to resolve error log');
    }
  };

  // Handle unresolve error
  const handleUnresolveError = async (id: number) => {
    try {
      const response = await fetch(`${BACKEND_API_URL}/api/error-logs/${id}/unresolve`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Refresh data
      fetchErrorLogs(filters);
      fetchStats();
    } catch (err) {
      console.error('Error unresolving error log:', err);
      setError('Failed to unresolve error log');
    }
  };

  // Initial load and when filters change
  useEffect(() => {
    fetchErrorLogs(filters);
  }, [filters]);

  // Load stats on mount
  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>
        <Box display="flex" alignItems="center" gap={1} mb={3}>
          <ErrorOutline color="error" />
          <Typography variant="h4" component="h1">
            Error Logs
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {stats && <ErrorStats stats={stats} />}

        <ErrorFilters filters={filters} onFiltersChange={handleFiltersChange} />

        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : (
          <ErrorTable
            errorLogs={errorLogs}
            total={pagination.total}
            page={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
            onResolveError={handleResolveError}
            onUnresolveError={handleUnresolveError}
          />
        )}
      </Box>
    </Container>
  );
}
