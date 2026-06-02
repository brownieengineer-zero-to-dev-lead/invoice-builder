import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Chip, Button, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress, Alert,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useTranslation } from 'react-i18next';
import { LicenseState, RevokeResult } from '../../shared/types/license';

interface Props {
  onRevoked: () => void;
}

const CopyBox: React.FC<{ value: string }> = ({ value }) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'grey.100', px: 2, py: 1, borderRadius: 1 }}>
      <Typography fontFamily="monospace" sx={{ flexGrow: 1, wordBreak: 'break-all' }}>{value}</Typography>
      <Tooltip title={copied ? t('common.copied') : t('common.copy')}>
        <IconButton size="small" onClick={handleCopy}><ContentCopyIcon fontSize="small" /></IconButton>
      </Tooltip>
    </Box>
  );
};

export const LicenseSettings: React.FC<Props> = ({ onRevoked }) => {
  const { t } = useTranslation();
  const [state, setState] = useState<LicenseState | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [revoking, setRevoking] = useState(false);
  const [revokeResult, setRevokeResult] = useState<RevokeResult | null>(null);

  useEffect(() => {
    window.electronAPI.getLicenseState().then(setState);
  }, []);

  const handleRevoke = async () => {
    setRevoking(true);
    try {
      const result = await window.electronAPI.revokeLicense();
      setRevokeResult(result);
      setConfirmOpen(false);
      onRevoked();
    } finally {
      setRevoking(false);
    }
  };

  if (!state) return <CircularProgress />;

  const isActive = state.status === 'active';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 600 }}>
      <Box>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>{t('license.statusSection')}</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Chip
            label={isActive ? t('license.statusActive') : t('license.statusInactive')}
            color={isActive ? 'success' : 'error'}
            sx={{ alignSelf: 'flex-start' }}
          />
          {isActive && state.serialNumber && (
            <Typography variant="body2">{t('license.serialNumber')}: <strong>{state.serialNumber}</strong></Typography>
          )}
          {isActive && state.activatedAt && (
            <Typography variant="body2">{t('license.activatedAt')}: <strong>{new Date(state.activatedAt).toLocaleString()}</strong></Typography>
          )}
        </Box>
      </Box>

      <Box>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>{t('license.requestKeyLabel')}</Typography>
        <CopyBox value={state.requestKey} />
      </Box>

      {isActive && (
        <Box>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>{t('license.revokeSection')}</Typography>
          <Alert severity="warning" sx={{ mb: 2 }}>{t('license.revokeWarning')}</Alert>
          <Button variant="outlined" color="error" onClick={() => setConfirmOpen(true)}>{t('license.revokeButton')}</Button>
        </Box>
      )}

      {revokeResult && (
        <Box>
          <Typography variant="subtitle2" gutterBottom>{t('license.cancelKeyLabel')}</Typography>
          <CopyBox value={revokeResult.cancelKey} />
          <Typography variant="caption" color="text.secondary">{t('license.cancelKeyHint')}</Typography>
        </Box>
      )}

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>{t('license.revokeConfirmTitle')}</DialogTitle>
        <DialogContent>
          <Typography>{t('license.revokeConfirmBody')}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>{t('common.cancel')}</Button>
          <Button color="error" variant="contained" onClick={handleRevoke} disabled={revoking}
            startIcon={revoking ? <CircularProgress size={16} color="inherit" /> : undefined}>
            {t('license.revokeButton')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
