import { Box, Card, CardActionArea, CardContent, Chip, Typography, darken, lighten, useTheme } from '@mui/material';
import { memo, type FC } from 'react';
import { Themes } from '../../shared/enums/themes';
import type { Contractor } from '../../shared/types/contractor';

interface Props {
  item: Contractor;
  selectedItem?: Contractor;
  onEdit?: (item: Contractor) => void;
}

const ContractorListItemComponent: FC<Props> = ({ item, selectedItem, onEdit }) => {
  const theme = useTheme();
  const isSelected = item.id === selectedItem?.id;

  return (
    <Card
      onClick={() => onEdit?.(item)}
      variant="outlined"
      sx={{
        boxShadow: 1,
        bgcolor: isSelected
          ? theme.palette.mode === Themes.dark
            ? darken(theme.palette.primary.main, 0.9)
            : lighten(theme.palette.primary.main, 0.9)
          : theme.palette.background.paper,
        transition: '0.25s'
      }}
    >
      <CardActionArea>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
            <Typography variant="body1" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {item.name}
            </Typography>
            <Chip
              label={item.type}
              size="small"
              color={item.type === 'นิติบุคคล' ? 'primary' : 'default'}
              sx={{ flexShrink: 0 }}
            />
          </Box>
          {item.taxId && (
            <Typography variant="body2" color="text.secondary">
              เลขผู้เสียภาษี: {item.taxId}
            </Typography>
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export const List = memo(ContractorListItemComponent);
