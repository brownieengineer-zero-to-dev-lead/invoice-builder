import { Box, Card, CardActionArea, CardContent, Chip, Typography, darken, lighten, useTheme } from '@mui/material';
import { memo, type FC } from 'react';
import { Themes } from '../../shared/enums/themes';
import type { WhtTransaction } from '../../shared/types/whtTransaction';

const MONTH_NAMES = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear() + 543}`;
};

interface Props {
  item: WhtTransaction;
  isSelected?: boolean;
  onEdit: (item: WhtTransaction) => void;
}

const WhtTransactionListItemComponent: FC<Props> = ({ item, isSelected, onEdit }) => {
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
              <Typography
                component="div"
                variant="body1"
                sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
              >
                {item.contractorName ?? `ผู้รับจ้าง #${item.contractorId}`}
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                <Chip label={item.pndType} size="small" color="primary" variant="outlined" />
              </Box>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography color={theme.palette.text.secondary} component="div" variant="body2">
                จ่าย: {item.amountBeforeTax.toLocaleString()} บาท
              </Typography>
              <Typography color={theme.palette.text.secondary} component="div" variant="body2">
                หัก: {item.taxWithheld.toLocaleString()} บาท ({item.whtRate}%)
              </Typography>
            </Box>
            <Typography color={theme.palette.text.secondary} component="div" variant="body2">
              {item.incomeType} — {formatDate(item.payDate)}
            </Typography>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export const List = memo(WhtTransactionListItemComponent);
