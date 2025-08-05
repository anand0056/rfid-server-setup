'use client';

import { Box, Card, CardContent, Typography, Chip } from '@mui/material';
import { ErrorOutline, CheckCircle, Warning, Schedule } from '@mui/icons-material';
import { ErrorLogStats, ErrorType } from '../../types/error-log';

interface ErrorStatsProps {
  stats: ErrorLogStats;
}

const errorTypeLabels = {
  [ErrorType.MQTT_PARSE_ERROR]: 'MQTT Parse Errors',
  [ErrorType.DATABASE_ERROR]: 'Database Errors',
  [ErrorType.VALIDATION_ERROR]: 'Validation Errors',
  [ErrorType.UNKNOWN_READER]: 'Unknown Readers',
  [ErrorType.UNKNOWN_CARD]: 'Unknown Cards',
  [ErrorType.GENERAL_ERROR]: 'General Errors',
};

const errorTypeColors = {
  [ErrorType.MQTT_PARSE_ERROR]: 'error',
  [ErrorType.DATABASE_ERROR]: 'error',
  [ErrorType.VALIDATION_ERROR]: 'warning',
  [ErrorType.UNKNOWN_READER]: 'info',
  [ErrorType.UNKNOWN_CARD]: 'info',
  [ErrorType.GENERAL_ERROR]: 'error',
} as const;

export default function ErrorStats({ stats }: ErrorStatsProps) {
  return (
    <Box sx={{ mb: 3 }}>
      <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={3} mb={2}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" gap={1}>
              <ErrorOutline color="error" />
              <Typography variant="h6" component="div">
                {stats.total}
              </Typography>
            </Box>
            <Typography color="text.secondary" gutterBottom>
              Total Errors
            </Typography>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" gap={1}>
              <CheckCircle color="success" />
              <Typography variant="h6" component="div">
                {stats.resolved}
              </Typography>
            </Box>
            <Typography color="text.secondary" gutterBottom>
              Resolved
            </Typography>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" gap={1}>
              <Warning color="warning" />
              <Typography variant="h6" component="div">
                {stats.unresolved}
              </Typography>
            </Box>
            <Typography color="text.secondary" gutterBottom>
              Unresolved
            </Typography>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" gap={1}>
              <Schedule color="info" />
              <Typography variant="h6" component="div">
                {stats.recentCount}
              </Typography>
            </Box>
            <Typography color="text.secondary" gutterBottom>
              Last 24 Hours
            </Typography>
          </CardContent>
        </Card>
      </Box>
      
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Errors by Type
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={1}>
            {Object.entries(stats.byType).map(([type, count]) => (
              <Chip
                key={type}
                label={`${errorTypeLabels[type as ErrorType]}: ${count}`}
                color={errorTypeColors[type as ErrorType]}
                variant="outlined"
                size="small"
              />
            ))}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
