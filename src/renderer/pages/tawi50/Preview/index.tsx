import DownloadIcon from '@mui/icons-material/Download';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import { useEffect, useRef, useState, type FC } from 'react';
import { useBusinessesRetrieve } from '../../../shared/hooks/businesses/useBusinessesRetrieve';
import { useEmployeesRetrieve } from '../../../shared/hooks/employees/useEmployeesRetrieve';
import type { Tawi50EmployeeRecord } from '../../../shared/types/tawi50EmployeeRecord';
import { buildTawi50Bytes } from '../../../shared/utils/whtPdfExport';

interface Props {
  record?: Tawi50EmployeeRecord;
}

export const Tawi50Preview: FC<Props> = ({ record }) => {
  const { employees } = useEmployeesRetrieve({ showArchived: false });
  const { businesses } = useBusinessesRetrieve({});
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [employeeName, setEmployeeName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const prevUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (!record || employees.length === 0 || businesses.length === 0) return;

    const employee = employees.find(e => e.id === record.employeeId);
    if (!employee) return;
    const business = businesses.find(b => b.id === employee.businessId);
    if (!business) {
      setError('พนักงานคนนี้ยังไม่ได้ระบุสังกัดธุรกิจ');
      return;
    }

    setError(null);
    setEmployeeName(employee.name);
    buildTawi50Bytes(record, employee, business)
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
  }, [record?.id, record?.totalIncome, record?.totalTax, record?.taxYear, record?.deliveryMethod, employees, businesses]);

  const handleDownload = () => {
    if (!blobUrl || !record) return;
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = `tawi50-${employeeName}-${record.taxYear}.pdf`;
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
          ดาวน์โหลด PDF
        </Button>
      </Box>
      <Box sx={{ flex: 1, minHeight: 0 }}>
        <iframe
          src={blobUrl}
          style={{ width: '100%', height: '100%', border: 'none', minHeight: 560 }}
          title="50 ทวิ ตัวอย่าง"
        />
      </Box>
    </Box>
  );
};
