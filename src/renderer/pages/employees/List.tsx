import { Box, Card, CardActionArea, CardContent, Typography, darken, lighten, useTheme } from '@mui/material';
import { memo, type FC } from 'react';
import { Themes } from '../../shared/enums/themes';
import type { Employee } from '../../shared/types/employee';

interface Props {
  item: Employee;
  selectedItem?: Employee;
  onEdit?: (item: Employee) => void;
}

const EmployeeListItemComponent: FC<Props> = ({ item, selectedItem, onEdit }) => {
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body1" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {item.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0, ml: 1 }}>
              {item.baseSalary.toLocaleString()} บาท
            </Typography>
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

export const List = memo(EmployeeListItemComponent);
