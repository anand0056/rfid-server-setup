'use client';

import { useState } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Typography,
  Collapse,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  TablePagination,
  Tooltip,
  Alert
} from '@mui/material';
import {
  ExpandMore,
  ExpandLess,
  Visibility,
  CheckCircle,
  RadioButtonUnchecked,
  Code,
  FormatAlignLeft
} from '@mui/icons-material';
import { ErrorLog, ErrorType } from '../../types/error-log';

interface ErrorTableProps {
  errorLogs: ErrorLog[];
  total: number;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onResolveError: (id: number, resolvedBy: string, notes?: string) => void;
  onUnresolveError: (id: number) => void;
}

const errorTypeLabels = {
  [ErrorType.MQTT_PARSE_ERROR]: 'MQTT Parse',
  [ErrorType.DATABASE_ERROR]: 'Database',
  [ErrorType.VALIDATION_ERROR]: 'Validation',
  [ErrorType.UNKNOWN_READER]: 'Unknown Reader',
  [ErrorType.UNKNOWN_CARD]: 'Unknown Card',
  [ErrorType.GENERAL_ERROR]: 'General',
};

const errorTypeColors = {
  [ErrorType.MQTT_PARSE_ERROR]: 'error',
  [ErrorType.DATABASE_ERROR]: 'error',
  [ErrorType.VALIDATION_ERROR]: 'warning',
  [ErrorType.UNKNOWN_READER]: 'info',
  [ErrorType.UNKNOWN_CARD]: 'info',
  [ErrorType.GENERAL_ERROR]: 'error',
} as const;

interface ExpandableRowProps {
  errorLog: ErrorLog;
  onResolveError: (id: number, resolvedBy: string, notes?: string) => void;
  onUnresolveError: (id: number) => void;
}

function ExpandableRow({ errorLog, onResolveError, onUnresolveError }: ExpandableRowProps) {
  const [expanded, setExpanded] = useState(false);
  const [showJson, setShowJson] = useState(false);
  const [beautifyJson, setBeautifyJson] = useState(true);
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [resolvedBy, setResolvedBy] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const renderJsonData = () => {
    if (!errorLog.rawData) return 'No data';
    
    try {
      if (beautifyJson) {
        return JSON.stringify(errorLog.rawData, null, 2);
      } else {
        return JSON.stringify(errorLog.rawData);
      }
    } catch (e) {
      return String(errorLog.rawData);
    }
  };

  const handleResolve = () => {
    if (resolvedBy.trim()) {
      onResolveError(errorLog.id, resolvedBy.trim(), resolutionNotes.trim() || undefined);
      setResolveDialogOpen(false);
      setResolvedBy('');
      setResolutionNotes('');
    }
  };

  const handleUnresolve = () => {
    onUnresolveError(errorLog.id);
  };

  return (
    <>
      <TableRow>
        <TableCell>
          <IconButton
            size="small"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </TableCell>
        <TableCell>
          <Chip
            label={errorTypeLabels[errorLog.errorType]}
            color={errorTypeColors[errorLog.errorType]}
            size="small"
          />
        </TableCell>
        <TableCell>
          <Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>
            {errorLog.errorMessage}
          </Typography>
        </TableCell>
        <TableCell>
          <Chip
            label={errorLog.resolved ? 'Resolved' : 'Unresolved'}
            color={errorLog.resolved ? 'success' : 'warning'}
            size="small"
            icon={errorLog.resolved ? <CheckCircle /> : <RadioButtonUnchecked />}
          />
        </TableCell>
        <TableCell>
          <Typography variant="body2" color="text.secondary">
            {formatDate(errorLog.createdAt)}
          </Typography>
        </TableCell>
        <TableCell>
          {errorLog.sourceTopic && (
            <Typography variant="body2" color="text.secondary">
              {errorLog.sourceTopic}
            </Typography>
          )}
        </TableCell>
        <TableCell>
          <Box display="flex" gap={1}>
            {!errorLog.resolved ? (
              <Button
                size="small"
                variant="outlined"
                color="success"
                onClick={() => setResolveDialogOpen(true)}
              >
                Resolve
              </Button>
            ) : (
              <Button
                size="small"
                variant="outlined"
                color="warning"
                onClick={handleUnresolve}
              >
                Unresolve
              </Button>
            )}
          </Box>
        </TableCell>
      </TableRow>
      
      <TableRow>
        <TableCell colSpan={7} style={{ paddingBottom: 0, paddingTop: 0 }}>
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 2 }}>
              <Typography variant="h6" gutterBottom>
                Error Details
              </Typography>
              
              {errorLog.resolved && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>Resolved by:</strong> {errorLog.resolvedBy} on {formatDate(errorLog.resolvedAt!)}
                  </Typography>
                  {errorLog.resolutionNotes && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      <strong>Notes:</strong> {errorLog.resolutionNotes}
                    </Typography>
                  )}
                </Alert>
              )}
              
              <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2} mb={2}>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Error Type
                  </Typography>
                  <Typography variant="body2">{errorTypeLabels[errorLog.errorType]}</Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Created At
                  </Typography>
                  <Typography variant="body2">{formatDate(errorLog.createdAt)}</Typography>
                </Box>
                
                {errorLog.sourceTopic && (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Source Topic
                    </Typography>
                    <Typography variant="body2">{errorLog.sourceTopic}</Typography>
                  </Box>
                )}
                
                {errorLog.sourceIp && (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Source IP
                    </Typography>
                    <Typography variant="body2">{errorLog.sourceIp}</Typography>
                  </Box>
                )}
              </Box>
              
              <Box mb={2}>
                <Typography variant="subtitle2" gutterBottom>
                  Error Message
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
                    {errorLog.errorMessage}
                  </Typography>
                </Paper>
              </Box>
              
              {errorLog.rawData && (
                <Box mb={2}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Typography variant="subtitle2">
                      Raw Data
                    </Typography>
                    <Tooltip title={showJson ? "Hide JSON" : "Show JSON"}>
                      <IconButton size="small" onClick={() => setShowJson(!showJson)}>
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                    {showJson && (
                      <Tooltip title={beautifyJson ? "Compact JSON" : "Beautify JSON"}>
                        <IconButton size="small" onClick={() => setBeautifyJson(!beautifyJson)}>
                          {beautifyJson ? <Code /> : <FormatAlignLeft />}
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                  
                  {showJson && (
                    <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                      <Typography 
                        variant="body2" 
                        component="pre" 
                        sx={{ 
                          whiteSpace: 'pre-wrap',
                          fontFamily: 'monospace',
                          fontSize: '0.8rem',
                          maxHeight: 300,
                          overflow: 'auto'
                        }}
                      >
                        {renderJsonData()}
                      </Typography>
                    </Paper>
                  )}
                </Box>
              )}
              
              {errorLog.stackTrace && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Stack Trace
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Typography 
                      variant="body2" 
                      component="pre" 
                      sx={{ 
                        whiteSpace: 'pre-wrap',
                        fontFamily: 'monospace',
                        fontSize: '0.8rem',
                        maxHeight: 200,
                        overflow: 'auto'
                      }}
                    >
                      {errorLog.stackTrace}
                    </Typography>
                  </Paper>
                </Box>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>

      {/* Resolve Dialog */}
      <Dialog open={resolveDialogOpen} onClose={() => setResolveDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Resolve Error</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Resolved By"
            fullWidth
            value={resolvedBy}
            onChange={(e) => setResolvedBy(e.target.value)}
            required
          />
          <TextField
            margin="dense"
            label="Resolution Notes"
            fullWidth
            multiline
            rows={3}
            value={resolutionNotes}
            onChange={(e) => setResolutionNotes(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResolveDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleResolve} variant="contained" disabled={!resolvedBy.trim()}>
            Mark as Resolved
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default function ErrorTable({ 
  errorLogs, 
  total, 
  page, 
  totalPages, 
  onPageChange,
  onResolveError,
  onUnresolveError
}: ErrorTableProps) {
  const rowsPerPage = 50;

  const handleChangePage = (event: unknown, newPage: number) => {
    onPageChange(newPage + 1);
  };

  return (
    <Paper>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell width="50px"></TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Message</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Source</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {errorLogs.map((errorLog) => (
              <ExpandableRow
                key={errorLog.id}
                errorLog={errorLog}
                onResolveError={onResolveError}
                onUnresolveError={onUnresolveError}
              />
            ))}
            {errorLogs.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    No error logs found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      <TablePagination
        component="div"
        count={total}
        page={page - 1}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[]}
      />
    </Paper>
  );
}
