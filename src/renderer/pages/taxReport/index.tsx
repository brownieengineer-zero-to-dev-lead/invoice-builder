import DownloadIcon from '@mui/icons-material/Download';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
  darken,
  lighten,
  useTheme
} from '@mui/material';
import { useCallback, useEffect, useRef, useState, type FC } from 'react';
import { useBusinessesRetrieve } from '../../shared/hooks/businesses/useBusinessesRetrieve';
import { Content } from '../../shared/components/layout/content/Content';
import { NoItem } from '../../shared/components/lists/noItem/NoItem';
import { Themes } from '../../shared/enums/themes';
import { useWhtTaxReportSummary } from '../../shared/hooks/whtTransactions/useWhtTaxReportSummary';
import type { TaxReportSummary } from '../../shared/utils/pdfExports/pnd3PdfExport';
import { buildPnd3Bytes, exportPnd3 } from '../../shared/utils/pdfExports/pnd3PdfExport';

const MONTH_THAI = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - i);

// ─── Left: List card ───────────────────────────────────────────────────────────

interface ListItemProps {
  item: TaxReportSummary;
  isSelected: boolean;
  onSelect: (item: TaxReportSummary) => void;
}

const TaxReportListItem: FC<ListItemProps> = ({ item, isSelected, onSelect }) => {
  const theme = useTheme();
  return (
    <Card
      onClick={() => onSelect(item)}
      variant="outlined"
      sx={{
        borderLeft: '3px solid',
        boxShadow: 1,
        borderLeftColor: theme.palette.primary.main,
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
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
              <Typography variant="body1" fontWeight="medium">
                {MONTH_THAI[item.month - 1]} {item.year + 543}
              </Typography>
              <Chip label={item.pndType} size="small" color="primary" variant="outlined" />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">
                {item.count} รายการ
              </Typography>
              <Typography variant="body2" color="text.secondary">
                หัก {item.totalTax.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

// ─── Right: PDF Preview panel ──────────────────────────────────────────────────

interface PreviewProps {
  item: TaxReportSummary | undefined;
}

const TaxReportPreview: FC<PreviewProps> = ({ item }) => {
  const { businesses } = useBusinessesRetrieve({});
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const prevUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (!item || businesses.length === 0) {
      setBlobUrl(null);
      return;
    }

    const business = businesses[0];
    setError(null);
    setBlobUrl(null);

    buildPnd3Bytes(item, business)
      .then(bytes => {
        const blob = new Blob([bytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setBlobUrl(url);
        if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current);
        prevUrlRef.current = url;
      })
      .catch(() => setError('ไม่สามารถสร้าง PDF ได้'));

    return () => {
      if (prevUrlRef.current) {
        URL.revokeObjectURL(prevUrlRef.current);
        prevUrlRef.current = null;
      }
    };
  }, [item, businesses]);

  const handleDownload = async () => {
    if (!item || businesses.length === 0) return;
    await exportPnd3(item, businesses[0]);
  };

  if (!item) return <NoItem text="เลือกรายการเพื่อดูตัวอย่าง" />;

  if (error) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!blobUrl) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <CircularProgress size={32} />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
        <Button size="small" variant="outlined" startIcon={<DownloadIcon />} onClick={handleDownload}>
          ดาวน์โหลด {item.pndType} PDF
        </Button>
      </Box>
      <Box sx={{ flex: 1, minHeight: 0 }}>
        <iframe
          src={blobUrl}
          style={{ width: '100%', height: '100%', border: 'none', minHeight: 560 }}
          title={`${item.pndType} ${MONTH_THAI[item.month - 1]} ${item.year + 543}`}
        />
      </Box>
    </Box>
  );
};

// ─── Page ──────────────────────────────────────────────────────────────────────

export const TaxReportPage: FC = () => {
  const theme = useTheme();

  const [filterMonth, setFilterMonth] = useState<number | ''>('');
  const [filterYear, setFilterYear] = useState<number | ''>(currentYear);
  const [filterPndType, setFilterPndType] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<TaxReportSummary | undefined>(undefined);

  const filter = {
    ...(filterMonth !== '' ? { month: filterMonth } : {}),
    ...(filterYear !== '' ? { year: filterYear } : {}),
    ...(filterPndType ? { pndType: filterPndType } : {})
  };

  const { summaries } = useWhtTaxReportSummary({ filter, immediate: true });

  const handleSelect = useCallback((item: TaxReportSummary) => {
    setSelectedItem(prev =>
      prev?.pndType === item.pndType && prev?.month === item.month && prev?.year === item.year
        ? prev
        : item
    );
  }, []);

  // ── Left column ──────────────────────────────────────────────────────────────
  const leftColumn = (
    <Grid size={{ xs: 12, md: 4 }} component="div" sx={{ position: 'relative', height: '100%' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, height: '100%', overflow: 'auto' }}>

        <Typography variant="h5" noWrap sx={{ color: theme.palette.secondary.main }}>
          รายงานภาษี
        </Typography>

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <FormControl size="small" sx={{ flex: 1, minWidth: 90 }}>
            <InputLabel>เดือน</InputLabel>
            <Select
              label="เดือน"
              value={filterMonth}
              onChange={e => { setFilterMonth(e.target.value as number | ''); setSelectedItem(undefined); }}
            >
              <MenuItem value="">ทุกเดือน</MenuItem>
              {MONTH_THAI.map((m, i) => (
                <MenuItem key={i + 1} value={i + 1}>{m}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ flex: 1, minWidth: 90 }}>
            <InputLabel>ปี</InputLabel>
            <Select
              label="ปี"
              value={filterYear}
              onChange={e => { setFilterYear(e.target.value as number | ''); setSelectedItem(undefined); }}
            >
              <MenuItem value="">ทุกปี</MenuItem>
              {YEARS.map(y => (
                <MenuItem key={y} value={y}>{y + 543}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ flex: 1, minWidth: 110 }}>
            <InputLabel>ประเภท</InputLabel>
            <Select
              label="ประเภท"
              value={filterPndType}
              onChange={e => { setFilterPndType(e.target.value); setSelectedItem(undefined); }}
            >
              <MenuItem value="">ทุกประเภท</MenuItem>
              <MenuItem value="ภ.ง.ด.3">ภ.ง.ด.3</MenuItem>
              <MenuItem value="ภ.ง.ด.53">ภ.ง.ด.53</MenuItem>
            </Select>
          </FormControl>
        </Stack>

        {summaries.length === 0 ? (
          <NoItem
            text="ไม่พบข้อมูลรายงานภาษี"
            icon={<SearchOffIcon color="action" fontSize="large" />}
          />
        ) : (
          <Stack spacing={1}>
            {summaries.map((s, i) => (
              <TaxReportListItem
                key={i}
                item={s}
                isSelected={
                  selectedItem?.pndType === s.pndType &&
                  selectedItem?.month === s.month &&
                  selectedItem?.year === s.year
                }
                onSelect={handleSelect}
              />
            ))}
          </Stack>
        )}

        <Box sx={{ pb: 2 }} />
      </Box>
    </Grid>
  );

  return (
    <Grid container component="div" spacing={2} justifyContent="center" alignItems="stretch" sx={{ height: '100%' }}>
      {leftColumn}
      <Content node={<TaxReportPreview item={selectedItem} />} />
    </Grid>
  );
};
