import { Box, ListItemButton, ListItemText, Typography } from '@mui/material';
import { memo, type FC } from 'react';

interface Props {
  contractorName?: string;
  onEdit: () => void;
}

const ContractorSelectorComponent: FC<Props> = ({ contractorName, onEdit }) => {
  return (
    <Box sx={{ width: 'fit-content' }}>
      <ListItemButton
        onClick={onEdit}
        sx={{ pt: 2, pb: 2, pl: 2, pr: 2, borderRadius: 1, flexDirection: 'column', alignItems: 'start' }}
      >
        <ListItemText
          primary={
            <Typography
              component="div"
              variant="body1"
              sx={{ fontWeight: 600, color: 'primary.main', overflow: 'hidden', textOverflow: 'ellipsis' }}
            >
              ผู้รับจ้าง *
            </Typography>
          }
          secondary={
            <Typography
              component="div"
              variant="body2"
              sx={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis' }}
            >
              {contractorName}
            </Typography>
          }
          disableTypography
          sx={{ m: 0 }}
        />
      </ListItemButton>
    </Box>
  );
};

export const ContractorSelector = memo(ContractorSelectorComponent);
