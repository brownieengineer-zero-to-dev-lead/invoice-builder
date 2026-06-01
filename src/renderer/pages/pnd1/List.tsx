import { Box, Card, CardActionArea, CardContent, Typography, darken, lighten, useTheme } from '@mui/material';
import { memo, type FC } from 'react';
import { Themes } from '../../shared/enums/themes';
import type { Pnd1Record } from '../../shared/types/pnd1Record';

const MONTH_NAMES = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

interface Props {
  item: Pnd1Record;
  isSelected?: boolean;
  onEdit: (item: Pnd1Record) => void;
}

const Pnd1ListItemComponent: FC<Props> = ({ item, isSelected, onEdit }) => {
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
                {MONTH_NAMES[item.month - 1]} {item.year}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography color={theme.palette.text.secondary} component="div" variant="body2">
                เงินได้: {item.income.toLocaleString()} บาท
              </Typography>
              <Typography color={theme.palette.text.secondary} component="div" variant="body2">
                ภาษีหัก: {item.taxWithheld.toLocaleString()} บาท
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export const List = memo(Pnd1ListItemComponent);
