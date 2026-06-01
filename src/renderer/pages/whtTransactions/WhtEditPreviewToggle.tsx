import Box from '@mui/material/Box';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { type FC } from 'react';
import { InvoiceFormMode } from '../../shared/enums/invoiceFormMode';

interface Props {
  mode: InvoiceFormMode;
  setMode: (m: InvoiceFormMode) => void;
}

export const WhtEditPreviewToggle: FC<Props> = ({ mode, setMode }) => {
  const handleMode = (_event: React.MouseEvent<HTMLElement>, newMode: InvoiceFormMode | null) => {
    if (newMode !== null) setMode(newMode);
  };

  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      <ToggleButtonGroup
        value={mode}
        exclusive
        onChange={handleMode}
        size="small"
        color="primary"
      >
        <ToggleButton value={InvoiceFormMode.edit} sx={{ minWidth: 70 }}>
          แก้ไข
        </ToggleButton>
        <ToggleButton value={InvoiceFormMode.preview} sx={{ minWidth: 100 }}>
          ดูตัวอย่าง ฉบับ 1-2
        </ToggleButton>
        <ToggleButton value={InvoiceFormMode.previewCopy34} sx={{ minWidth: 100 }}>
          ดูตัวอย่าง ฉบับ 3-4
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
};
