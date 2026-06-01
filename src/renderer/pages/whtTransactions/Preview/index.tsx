import DownloadIcon from '@mui/icons-material/Download';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import { useEffect, useRef, useState, type FC } from 'react';
import { useBusinessesRetrieve } from '../../../shared/hooks/businesses/useBusinessesRetrieve';
import { useContractorsRetrieve } from '../../../shared/hooks/contractors/useContractorsRetrieve';
import type { WhtTransaction } from '../../../shared/types/whtTransaction';
import { buildWhtTransactionBytes12, buildWhtTransactionBytes34 } from '../../../shared/utils/whtPdfExport';

interface Props {
  record?: WhtTransaction;
  copy: '12' | '34';
}

export const WhtTransactionPreview: FC<Props> = ({ record, copy }) => {
  const { contractors } = useContractorsRetrieve({ showArchived: false });
  const { businesses } = useBusinessesRetrieve({});
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [contractorName, setContractorName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const prevUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (!record || contractors.length === 0 || businesses.length === 0) return;

    const contractor = contractors.find(c => c.id === record.contractorId);
    if (!contractor) return;
    const business = businesses.find(b => b.id === record.businessId);
    if (!business) {
      setError('ไม่พบข้อมูลธุรกิจ');
      return;
    }

    setError(null);
    setContractorName(contractor.name);

    const buildFn = copy === '34' ? buildWhtTransactionBytes34 : buildWhtTransactionBytes12;
    buildFn(record, contractor, business)
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
  }, [
    record?.id, record?.amountBeforeTax, record?.taxWithheld, record?.payDate,
    record?.deliveryMethod, record?.incomeType, record?.whtRate,
    contractors, businesses, copy
  ]);

  const handleDownload = () => {
    if (!blobUrl || !record) return;
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = `tawi50-contractor-${contractorName}-${copy}.pdf`;
    a.click();
  };

  if (!record) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <Typography color="text.secondary">เลือก record เพื่อดูตัวอย่าง</Typography>
      </Box>
    );
  }

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
          ดาวน์โหลด PDF (ฉบับ {copy === '12' ? '1-2' : '3-4'})
        </Button>
      </Box>
      <Box sx={{ flex: 1, minHeight: 0 }}>
        <iframe
          src={blobUrl}
          style={{ width: '100%', height: '100%', border: 'none', minHeight: 560 }}
          title={`50 ทวิ ผู้รับจ้าง ฉบับ ${copy === '12' ? '1-2' : '3-4'}`}
        />
      </Box>
    </Box>
  );
};
