import DownloadIcon from '@mui/icons-material/Download';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme
} from '@mui/material';
import { useEffect, useRef, useState, type FC } from 'react';
import { Content } from '../../shared/components/layout/content/Content';
import { NoItem } from '../../shared/components/lists/noItem/NoItem';
import { useBusinessesRetrieve } from '../../shared/hooks/businesses/useBusinessesRetrieve';
import { usePnd1MonthlySummary } from '../../shared/hooks/pnd1Records/usePnd1MonthlySummary';
import type { Business } from '../../shared/types/business';
import type { Pnd1MonthlySummary } from '../../shared/types/pnd1Record';
import {
  buildPnd1MonthlySummaryBytes,
  exportPnd1MonthlySummary
} from '../../shared/utils/pdfExports/pnd1PdfExport';

const MONTH_THAI = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
];

const currentBEYear = new Date().getFullYear() + 543;
const YEARS = Array.from({ length: 5 }, (_, i) => currentBEYear - i);

const fmt = (n: number) => n.toLocaleString('th-TH', { minimumFractionDigits: 2 });

// ─── Right panel ──────────────────────────────────────────────────────────────

interface PreviewPanelProps {
  summary: Pnd1MonthlySummary | null;
  business: Business | null;
  hasFilter: boolean;
}

const PreviewPanel: FC<PreviewPanelProps> = ({ summary, business, hasFilter }) => {
  const theme = useTheme();
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const prevUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (!summary || !business || summary.rows.length === 0) {
      setBlobUrl(null);
      return;
    }
    setPdfError(null);
    setBlobUrl(null);

    buildPnd1MonthlySummaryBytes(summary, business)
      .then(bytes => {
        const blob = new Blob([bytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setBlobUrl(url);
        if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current);
        prevUrlRef.current = url;
      })
      .catch(() => setPdfError('ไม่สามารถสร้าง PDF ได้'));

    return () => {
      if (prevUrlRef.current) {
        URL.revokeObjectURL(prevUrlRef.current);
        prevUrlRef.current = null;
      }
    };
  }, [summary, business]);

  const handleDownload = async () => {
    if (!summary || !business) return;
    await exportPnd1MonthlySummary(summary, business);
  };

  if (!hasFilter) return <NoItem text="เลือกธุรกิจ เดือน และปี เพื่อดูข้อมูล" />;
  if (!summary || summary.rows.length === 0) {
    return (
      <NoItem
        text="ไม่มีรายการเงินเดือนในเดือนนี้"
        icon={<SearchOffIcon color="action" fontSize="large" />}
      />
    );
  }
  if (pdfError) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <Typography color="error">{pdfError}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 2 }}>
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: theme.palette.action.hover }}>
              <TableCell>#</TableCell>
              <TableCell>ชื่อ-สกุล</TableCell>
              <TableCell>เลขผู้เสียภาษี</TableCell>
              <TableCell align="right">เงินได้ (บาท)</TableCell>
              <TableCell align="right">ภาษีที่หัก (บาท)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {summary.rows.map((row, i) => (
              <TableRow key={row.id} hover>
                <TableCell>{i + 1}</TableCell>
                <TableCell>{row.employeeName}</TableCell>
                <TableCell sx={{ fontFamily: 'monospace' }}>{row.taxId}</TableCell>
                <TableCell align="right">{fmt(row.income)}</TableCell>
                <TableCell align="right">{fmt(row.taxWithheld)}</TableCell>
              </TableRow>
            ))}
            <TableRow sx={{ bgcolor: theme.palette.action.selected }}>
              <TableCell colSpan={3}>
                <Typography variant="body2" fontWeight="bold">
                  รวม {summary.rows.length} คน
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="body2" fontWeight="bold">{fmt(summary.totalIncome)}</Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="body2" fontWeight="bold">{fmt(summary.totalTax)}</Typography>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          size="small"
          startIcon={<DownloadIcon />}
          onClick={handleDownload}
          disabled={!blobUrl}
        >
          ดาวน์โหลด ภ.ง.ด.1 PDF
        </Button>
      </Box>

      {!blobUrl ? (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
          <CircularProgress size={32} />
        </Box>
      ) : (
        <Box sx={{ flex: 1, minHeight: 0 }}>
          <iframe
            src={blobUrl}
            style={{ width: '100%', height: '100%', border: 'none', minHeight: 560 }}
            title="ภ.ง.ด.1 Preview"
          />
        </Box>
      )}
    </Box>
  );
};

// ─── Page ──────────────────────────────────────────────────────────────────────

export const Pnd1MonthlyPage: FC = () => {
  const theme = useTheme();

  const [filterMonth, setFilterMonth] = useState<number | ''>(new Date().getMonth() + 1);
  const [filterYear, setFilterYear] = useState<number | ''>(currentBEYear);
  const [filterBusinessId, setFilterBusinessId] = useState<number | ''>('');

  const { businesses } = useBusinessesRetrieve({ immediate: true });

  const hasFilter = filterMonth !== '' && filterYear !== '' && filterBusinessId !== '';

  const filter = hasFilter
    ? { month: filterMonth as number, year: filterYear as number, businessId: filterBusinessId as number }
    : undefined;

  const { summary, execute } = usePnd1MonthlySummary({ filter, immediate: false });

  const selectedBusiness = businesses.find(b => b.id === filterBusinessId) ?? null;

  useEffect(() => {
    if (hasFilter) execute();
  }, [filterMonth, filterYear, filterBusinessId]);

  const leftColumn = (
    <Grid size={{ xs: 12, md: 4 }} component="div" sx={{ height: '100%' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, height: '100%' }}>
        <Typography variant="h5" noWrap sx={{ color: theme.palette.secondary.main }}>
          ภ.ง.ด.1
        </Typography>

        <Stack spacing={2}>
          <FormControl size="small" fullWidth>
            <InputLabel>ธุรกิจ</InputLabel>
            <Select
              label="ธุรกิจ"
              value={filterBusinessId}
              onChange={e => setFilterBusinessId(e.target.value as number | '')}
            >
              <MenuItem value="">เลือกธุรกิจ</MenuItem>
              {businesses.map(b => (
                <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Stack direction="row" spacing={1}>
            <FormControl size="small" sx={{ flex: 1 }}>
              <InputLabel>เดือน</InputLabel>
              <Select
                label="เดือน"
                value={filterMonth}
                onChange={e => setFilterMonth(e.target.value as number | '')}
              >
                {MONTH_THAI.map((m, i) => (
                  <MenuItem key={i + 1} value={i + 1}>{m}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ flex: 1 }}>
              <InputLabel>ปี (พ.ศ.)</InputLabel>
              <Select
                label="ปี (พ.ศ.)"
                value={filterYear}
                onChange={e => setFilterYear(e.target.value as number | '')}
              >
                {YEARS.map(y => (
                  <MenuItem key={y} value={y}>{y}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </Stack>

        {hasFilter && summary && summary.rows.length > 0 && (
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack spacing={0.5}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">จำนวนพนักงาน</Typography>
                <Typography variant="body2" fontWeight="bold">{summary.rows.length} คน</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">รวมเงินได้</Typography>
                <Typography variant="body2" fontWeight="bold">{fmt(summary.totalIncome)} บาท</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">รวมภาษีที่หัก</Typography>
                <Typography variant="body2" fontWeight="bold" color="primary">
                  {fmt(summary.totalTax)} บาท
                </Typography>
              </Box>
            </Stack>
          </Paper>
        )}
      </Box>
    </Grid>
  );

  return (
    <Grid container component="div" spacing={2} justifyContent="center" alignItems="stretch" sx={{ height: '100%' }}>
      {leftColumn}
      <Content
        node={
          <PreviewPanel
            summary={summary}
            business={selectedBusiness}
            hasFilter={hasFilter}
          />
        }
      />
    </Grid>
  );
};
