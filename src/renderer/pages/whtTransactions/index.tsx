import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  Divider, FormControl, Grid, IconButton, InputLabel, List, ListItem,
  ListItemText, MenuItem, Select, Stack, TextField, Typography
} from '@mui/material';
import { useCallback, useEffect, useState, type FC } from 'react';
import { getApi } from '../../shared/api/restApi';
import type { Business } from '../../shared/types/business';
import type { Contractor } from '../../shared/types/contractor';
import type { Response } from '../../shared/types/response';
import type { PndType, WhtDeliveryMethod, WhtIncomeType, WhtRate, WhtTransaction, WhtTransactionAdd } from '../../shared/types/whtTransaction';
import { exportTawi50ContractorCopies12, exportTawi50ContractorCopies34 } from '../../shared/utils/whtPdfExport';

const INCOME_TYPES: WhtIncomeType[] = ['ค่าบริการ','ค่าเช่า','ค่าสิทธิ์','อื่นๆ'];
const WHT_RATES: WhtRate[] = [1, 3, 5, 15];
const DELIVERY_METHODS: WhtDeliveryMethod[] = ['หัก ณ ที่จ่าย','ออกให้ตลอดไป','ออกให้ครั้งเดียว'];

const defaultForm = (): WhtTransactionAdd => ({
  businessId: 0,
  contractorId: 0,
  payDate: new Date().toISOString().slice(0, 10),
  pndType: 'ภ.ง.ด.3',
  incomeType: 'ค่าบริการ',
  incomeTypeOther: '',
  whtRate: 3,
  amountBeforeTax: 0,
  taxWithheld: 0,
  deliveryMethod: 'หัก ณ ที่จ่าย',
  issuedDate: '',
  bookNo: '',
  runNo: ''
});

export const WhtTransactionsPage: FC = () => {
  const [transactions, setTransactions] = useState<WhtTransaction[]>([]);
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [filter, setFilter] = useState<{ contractorId?: number; pndType?: string; month?: number; year?: number }>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<WhtTransaction | undefined>(undefined);
  const [form, setForm] = useState<WhtTransactionAdd>(defaultForm());
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const load = useCallback(async () => {
    const f: Record<string, unknown> = {};
    if (filter.contractorId) f.contractorId = filter.contractorId;
    if (filter.pndType) f.pndType = filter.pndType;
    if (filter.month) f.month = filter.month;
    if (filter.year) f.year = filter.year;
    const res: Response<WhtTransaction[]> = await getApi().getAllWhtTransactions(
      Object.keys(f).length ? f as never : undefined
    );
    if (res.success && res.data) setTransactions(res.data);
  }, [filter]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    getApi().getAllContractors(false).then((res: Response<Contractor[]>) => {
      if (res.success && res.data) setContractors(res.data);
    });
    getApi().getAllBusinesses().then((res: Response<Business[]>) => {
      if (res.success && res.data) setBusinesses(res.data);
    });
  }, []);

  const openAdd = () => { setEditing(undefined); setForm(defaultForm()); setDialogOpen(true); };
  const openEdit = (t: WhtTransaction) => {
    setEditing(t);
    setForm({
      businessId: t.businessId, contractorId: t.contractorId, invoiceId: t.invoiceId,
      payDate: t.payDate?.slice(0, 10) ?? '',
      pndType: t.pndType, incomeType: t.incomeType, incomeTypeOther: t.incomeTypeOther ?? '',
      whtRate: t.whtRate, amountBeforeTax: t.amountBeforeTax, taxWithheld: t.taxWithheld,
      deliveryMethod: t.deliveryMethod,
      issuedDate: t.issuedDate ?? '', bookNo: t.bookNo ?? '', runNo: t.runNo ?? ''
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.businessId || !form.contractorId) return;
    if (editing) {
      await getApi().updateWhtTransaction({ ...form, id: editing.id });
    } else {
      await getApi().addWhtTransaction(form);
    }
    setDialogOpen(false);
    load();
  };

  const handleDelete = async (id: number) => {
    await getApi().deleteWhtTransaction(id);
    setDeleteId(null);
    load();
  };

  const handleExportPdf12 = async (t: WhtTransaction) => {
    const contractor = contractors.find(c => c.id === t.contractorId);
    const business = businesses.find(b => b.id === t.businessId);
    if (!contractor || !business) return;
    await exportTawi50ContractorCopies12(t, contractor, business);
  };

  const handleExportPdf34 = async (t: WhtTransaction) => {
    const contractor = contractors.find(c => c.id === t.contractorId);
    const business = businesses.find(b => b.id === t.businessId);
    if (!contractor || !business) return;
    await exportTawi50ContractorCopies34(t, contractor, business);
  };

  const calcTax = (amount: number, rate: number) => Math.round(amount * rate / 100);

  const isFormValid = form.businessId > 0 && form.contractorId > 0 && form.payDate !== '';

  const MONTH_NAMES = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];

  return (
    <Box sx={{ p: 3, maxWidth: 1100, mx: 'auto' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">ธุรกรรม — ภาษีหัก ณ ที่จ่าย</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}>เพิ่มธุรกรรม</Button>
      </Stack>

      <Stack direction="row" gap={2} mb={2} flexWrap="wrap">
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>ผู้รับจ้าง</InputLabel>
          <Select value={filter.contractorId ?? ''} label="ผู้รับจ้าง"
            onChange={e => setFilter(f => ({ ...f, contractorId: e.target.value ? Number(e.target.value) : undefined }))}>
            <MenuItem value="">ทั้งหมด</MenuItem>
            {contractors.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>ประเภท</InputLabel>
          <Select value={filter.pndType ?? ''} label="ประเภท"
            onChange={e => setFilter(f => ({ ...f, pndType: e.target.value || undefined }))}>
            <MenuItem value="">ทั้งหมด</MenuItem>
            <MenuItem value="ภ.ง.ด.3">ภ.ง.ด.3</MenuItem>
            <MenuItem value="ภ.ง.ด.53">ภ.ง.ด.53</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>เดือน</InputLabel>
          <Select value={filter.month ?? ''} label="เดือน"
            onChange={e => setFilter(f => ({ ...f, month: e.target.value ? Number(e.target.value) : undefined }))}>
            <MenuItem value="">ทั้งหมด</MenuItem>
            {MONTH_NAMES.map((m, i) => <MenuItem key={i+1} value={i+1}>{m}</MenuItem>)}
          </Select>
        </FormControl>
        <TextField size="small" label="ปี" type="number"
          value={filter.year ?? ''}
          onChange={e => setFilter(f => ({ ...f, year: e.target.value ? Number(e.target.value) : undefined }))}
          sx={{ width: 100 }} />
      </Stack>

      <List>
        {transactions.map(t => (
          <Box key={t.id}>
            <ListItem
              secondaryAction={
                <Stack direction="row" gap={1}>
                  <Button size="small" startIcon={<PictureAsPdfIcon />} onClick={() => handleExportPdf12(t)} variant="outlined">ฉบับ 1-2</Button>
                  <Button size="small" startIcon={<PictureAsPdfIcon />} onClick={() => handleExportPdf34(t)} variant="outlined">ฉบับ 3-4</Button>
                  <IconButton onClick={() => openEdit(t)}><EditIcon /></IconButton>
                  <IconButton color="error" onClick={() => setDeleteId(t.id)}><DeleteIcon /></IconButton>
                </Stack>
              }
            >
              <ListItemText
                primary={`${t.contractorName ?? `ผู้รับจ้าง #${t.contractorId}`} (${t.pndType}) — ${t.payDate?.slice(0, 10)}`}
                secondary={`${t.incomeType} | จ่าย: ${t.amountBeforeTax.toLocaleString()} บาท | หัก: ${t.taxWithheld.toLocaleString()} บาท (${t.whtRate}%)`}
              />
            </ListItem>
            <Divider />
          </Box>
        ))}
        {transactions.length === 0 && (
          <Typography color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>ไม่พบข้อมูล</Typography>
        )}
      </List>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editing ? 'แก้ไขธุรกรรม' : 'เพิ่มธุรกรรม'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth required>
                <InputLabel>ธุรกิจ</InputLabel>
                <Select value={form.businessId || ''} label="ธุรกิจ"
                  onChange={e => setForm(f => ({ ...f, businessId: Number(e.target.value) }))}>
                  {businesses.map(b => <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth required>
                <InputLabel>ผู้รับจ้าง</InputLabel>
                <Select value={form.contractorId || ''} label="ผู้รับจ้าง"
                  onChange={e => {
                    const c = contractors.find(c => c.id === Number(e.target.value));
                    setForm(f => ({
                      ...f,
                      contractorId: Number(e.target.value),
                      pndType: c?.type === 'นิติบุคคล' ? 'ภ.ง.ด.53' : 'ภ.ง.ด.3'
                    }));
                  }}>
                  {contractors.map(c => <MenuItem key={c.id} value={c.id}>{c.name} ({c.type})</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField label="วันที่จ่าย *" fullWidth type="date" value={form.payDate}
                onChange={e => setForm(f => ({ ...f, payDate: e.target.value }))}
                slotProps={{ inputLabel: { shrink: true } }} />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth>
                <InputLabel>ประเภท ภ.ง.ด.</InputLabel>
                <Select value={form.pndType} label="ประเภท ภ.ง.ด."
                  onChange={e => setForm(f => ({ ...f, pndType: e.target.value as PndType }))}>
                  <MenuItem value="ภ.ง.ด.3">ภ.ง.ด.3 (บุคคลธรรมดา)</MenuItem>
                  <MenuItem value="ภ.ง.ด.53">ภ.ง.ด.53 (นิติบุคคล)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth required>
                <InputLabel>ประเภทเงินได้</InputLabel>
                <Select value={form.incomeType} label="ประเภทเงินได้"
                  onChange={e => setForm(f => ({ ...f, incomeType: e.target.value as WhtIncomeType }))}>
                  {INCOME_TYPES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            {form.incomeType === 'อื่นๆ' && (
              <Grid size={{ xs: 12 }}>
                <TextField label="ระบุประเภทเงินได้อื่นๆ" fullWidth value={form.incomeTypeOther}
                  onChange={e => setForm(f => ({ ...f, incomeTypeOther: e.target.value }))} />
              </Grid>
            )}
            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth required>
                <InputLabel>อัตรา WHT (%)</InputLabel>
                <Select value={form.whtRate} label="อัตรา WHT (%)"
                  onChange={e => {
                    const rate = Number(e.target.value) as WhtRate;
                    setForm(f => ({ ...f, whtRate: rate, taxWithheld: calcTax(f.amountBeforeTax, rate) }));
                  }}>
                  {WHT_RATES.map(r => <MenuItem key={r} value={r}>{r}%</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField label="จำนวนเงินก่อนหัก (บาท) *" fullWidth type="number" value={form.amountBeforeTax}
                onChange={e => {
                  const amount = Number(e.target.value);
                  setForm(f => ({ ...f, amountBeforeTax: amount, taxWithheld: calcTax(amount, f.whtRate) }));
                }} />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField label="ภาษีที่หัก (บาท)" fullWidth type="number" value={form.taxWithheld}
                onChange={e => setForm(f => ({ ...f, taxWithheld: Number(e.target.value) }))} />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth>
                <InputLabel>วิธีนำส่ง</InputLabel>
                <Select value={form.deliveryMethod} label="วิธีนำส่ง"
                  onChange={e => setForm(f => ({ ...f, deliveryMethod: e.target.value as WhtDeliveryMethod }))}>
                  {DELIVERY_METHODS.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField label="วันที่ออกหนังสือรับรอง" fullWidth type="date" value={form.issuedDate}
                onChange={e => setForm(f => ({ ...f, issuedDate: e.target.value }))}
                slotProps={{ inputLabel: { shrink: true } }} />
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <TextField label="เล่มที่" fullWidth value={form.bookNo} onChange={e => setForm(f => ({ ...f, bookNo: e.target.value }))} />
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <TextField label="เลขที่" fullWidth value={form.runNo} onChange={e => setForm(f => ({ ...f, runNo: e.target.value }))} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>ยกเลิก</Button>
          <Button variant="contained" disabled={!isFormValid} onClick={handleSave}>บันทึก</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteId !== null} onClose={() => setDeleteId(null)}>
        <DialogTitle>ยืนยันการลบ</DialogTitle>
        <DialogContent><Typography>ต้องการลบธุรกรรมนี้ใช่ไหม?</Typography></DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>ยกเลิก</Button>
          <Button color="error" onClick={() => deleteId !== null && handleDelete(deleteId)}>ยืนยัน</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
