import { Box, Card, CardActionArea, CardContent, Typography, darken, lighten, useTheme } from '@mui/material';
import { memo, type FC } from 'react';
import { Themes } from '../../shared/enums/themes';
import type { Tawi50EmployeeRecord } from '../../shared/types/tawi50EmployeeRecord';

interface Props {
  item: Tawi50EmployeeRecord;
  isSelected?: boolean;
  onEdit: (item: Tawi50EmployeeRecord) => void;
}

const Tawi50ListItemComponent: FC<Props> = ({ item, isSelected, onEdit }) => {
  const theme = useTheme();

  return (
    <Card
      onClick={() => onEdit(item)}
      variant="outlined"
      sx={{
        position: 'relative',
        borderLeft: '3px solid',
        boxShadow: 1,
        borderLeftColor: theme.palette.primary.main,
        bgcolor: isSelected
          ? theme.palette.mode === Themes.dark
            ? darken(theme.palette.primary.main, 0.9)
            : lighten(theme.palette.primary.main, 0.9)
          : theme.palette.background.paper,
        transition: '0.25s',
        overflow: 'unset'
      }}
    >
      <CardActionArea>
        <CardContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography
                component="div"
                variant="body1"
                sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
              >
                {item.employeeName ?? `พนักงาน #${item.employeeId}`}
              </Typography>
              <Typography
                color={theme.palette.text.secondary}
                component="div"
                variant="body1"
                sx={{ whiteSpace: 'nowrap', flexShrink: 0, ml: 1 }}
              >
                ปีภาษี {item.taxYear}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
              <Typography color={theme.palette.text.secondary} component="div" variant="body2">
                เงินได้รวม: {item.totalIncome.toLocaleString()} บาท
              </Typography>
              <Typography color={theme.palette.text.secondary} component="div" variant="body2">
                ภาษีรวม: {item.totalTax.toLocaleString()} บาท
              </Typography>
            </Box>
            <Typography color={theme.palette.text.secondary} component="div" variant="body2">
              วิธีนำส่ง: {item.deliveryMethod}
            </Typography>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export const List = memo(Tawi50ListItemComponent);
