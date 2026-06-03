import React, { useState } from 'react';
import {
  Alert, Box, Button, CircularProgress, Dialog, DialogActions,
  DialogContent, DialogTitle, IconButton, TextField, Tooltip, Typography,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useTranslation } from 'react-i18next';

interface Props {
  requestKey: string;
  cancelKey?: string;
  onActivated: () => void;
}

export const ActivationModal: React.FC<Props> = ({ requestKey, cancelKey, onActivated }) => {
  const { t } = useTranslation();
  const [serial, setSerial] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [cancelCopied, setCancelCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(requestKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCancelCopy = () => {
    if (cancelKey) navigator.clipboard.writeText(cancelKey);
    setCancelCopied(true);
    setTimeout(() => setCancelCopied(false), 2000);
  };

  const handleActivate = async () => {
    setError(null);
    setLoading(true);
    try {
      const result = await window.electronAPI.activateLicense(code.trim(), serial.trim());
      if (result.success) {
        onActivated();
      } else {
        setError(result.error ?? 'unknown');
      }
    } finally {
      setLoading(false);
    }
  };

  const errorMessages: Record<string, string> = {
    invalid_signature: t('license.error.invalidSignature'),
    already_active: t('license.error.alreadyActive'),
    tampered: t('license.error.tampered'),
    unknown: t('license.error.unknown'),
  };

  return (
    <Dialog open fullWidth maxWidth="sm" disableEscapeKeyDown>
      <DialogTitle>{t('license.activationTitle')}</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            {t('license.requestKeyLabel')}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'action.hover', px: 2, py: 1, borderRadius: 1 }}>
            <Typography fontFamily="monospace" sx={{ flexGrow: 1, wordBreak: 'break-all' }}>
              {requestKey}
            </Typography>
            <Tooltip title={copied ? t('common.copied') : t('common.copy')}>
              <IconButton size="small" onClick={handleCopy}>
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
          <Typography variant="caption" color="text.secondary">
            {t('license.requestKeyHint')}
          </Typography>
        </Box>

        {cancelKey && (
          <Box sx={{ mb: 3 }}>
            <Alert severity="warning" sx={{ mb: 1 }}>{t('license.cancelKeyPendingWarning')}</Alert>
            <Typography variant="subtitle2" gutterBottom>{t('license.cancelKeyLabel')}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'action.hover', px: 2, py: 1, borderRadius: 1 }}>
              <Typography fontFamily="monospace" sx={{ flexGrow: 1, wordBreak: 'break-all' }}>
                {cancelKey}
              </Typography>
              <Tooltip title={cancelCopied ? t('common.copied') : t('common.copy')}>
                <IconButton size="small" onClick={handleCancelCopy}>
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            <Typography variant="caption" color="text.secondary">{t('license.cancelKeyHint')}</Typography>
          </Box>
        )}

        <TextField
          fullWidth
          label={t('license.serialNumber')}
          value={serial}
          onChange={(e) => setSerial(e.target.value)}
          sx={{ mb: 2 }}
        />

        <TextField
          fullWidth
          label={t('license.activationCode')}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="ABCDEFGH-IJKLMNOP-..."
          multiline
          rows={3}
          inputProps={{ style: { fontFamily: 'monospace' } }}
          sx={{ mb: 2 }}
        />

        {error && (
          <Alert severity="error">{errorMessages[error] ?? errorMessages.unknown}</Alert>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button
          variant="contained"
          fullWidth
          size="large"
          onClick={handleActivate}
          disabled={loading || !serial.trim() || !code.trim()}
          startIcon={loading ? <CircularProgress size={18} color="inherit" /> : undefined}
        >
          {t('license.activateButton')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
