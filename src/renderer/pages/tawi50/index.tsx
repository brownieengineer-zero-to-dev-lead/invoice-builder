import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  Divider, FormControl, Grid, IconButton, InputLabel, List, ListItem,
  ListItemText, MenuItem, Select, Stack, Table, TableBody, TableCell,
  TableHead, TableRow, TextField, Typography
} from '@mui/material';
import { useCallback, useEffect, useState, type FC } from 'react';
import { getApi } from '../../shared/api/restApi';
import type { Employee } from '../../shared/types/employee';
import type { Pnd1Record } from '../../shared/types/pnd1Record';
import type { Response } from '../../shared/types/response';
import type { Tawi50EmployeeRecord, Tawi50EmployeeRecordAdd, Tawi50IncomeItem, WhtDeliveryMethod } from '../../shared/types/tawi50EmployeeRecord';
import { exportTawi50Employee } from '../../shared/utils/whtPdfExport';

const MONTH_NAMES = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
const CURRENT_YEAR = new Date().getFullYear() + 543;
const DELIVERY_METHODS: WhtDeliveryMethod[] = ['หัก ณ ที่จ่าย','ออกให้ตลอดไป','ออกให้ครั้งเดียว'];

const emptyItems = (): Tawi50IncomeItem[] =>
  Array.from({ length: 12 }, (_, i) => ({ month: i + 1, income: 0, taxWithheld: 0 }));

const defaultForm = (): Tawi50EmployeeRecordAdd => ({
  employeeId: 0,
  taxYear: CURRENT_YEAR,
  incomeItems: emptyItems(),
  totalIncome: 0,
  totalTax: 0,
  deliveryMethod: 'หัก ณ ที่จ่าย',
  issuedDate: '',
  bookNo: '',
  runNo: ''
});

export const Tawi50Page: FC = () => {
  const [records, setRecords] = useState<Tawi50EmployeeRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filter, setFilter] = useState<{ employeeId?: number; taxYear?: number }>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Tawi50EmployeeRecord | undefined>(undefined);
  const [form, setForm] = useState<Tawi50EmployeeRecordAdd>(defaultForm());
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const load = useCallback(async () => {
    const f: Record<string, number> = {};
    if (filter.employeeId) f.employeeId = filter.employeeId;
    if (filter.taxYear) f.taxYear = filter.taxYear;
    const res: Response<Tawi50EmployeeRecord[]> = await getApi().getAllTawi50EmployeeRecords(
      Object.keys(f).length ? f : undefined
    );
    if (res.success && res.data) setRecords(res.data);
  }, [filter]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    getApi().getAllEmployees(false).then((res: Response<Employee[]>) => {
      if (res.success && res.data) setEmployees(res.data);
    });
  }, []);

  const fetchPnd1 = async (employeeId: number, taxYear: number) => {
    const res: Response<Pnd1Record[]> = await getApi().getAllPnd1Records({ employeeId, year: taxYear });
    if (res.success && res.data) {
      const items = emptyItems().map(item => {
        const pnd1 = res.data!.find(r => r.month === item.month);
        return pnd1 ? { month: item.month, income: pnd1.income, taxWithheld: pnd1.taxWithheld } : item;
      });
      if (res.data.length < 12) {
        alert(`ข้อมูล ภ.ง.ด.1 มีเพียง ${res.data.length} เดือน สามารถแก้ไขได้`);
      }
      const totalIncome = items.reduce((s, i) => s + i.income, 0);
      const totalTax = items.reduce((s, i) => s + i.taxWithheld, 0);
      setForm(f => ({ ...f, incomeItems: items, totalIncome, totalTax }));
    }
  };

  const openAdd = () => { setEditing(undefined); setForm(defaultForm()); setDialogOpen(true); };
  const openEdit = (r: Tawi50EmployeeRecord) => {
    setEditing(r);
    setForm({
      employeeId: r.employeeId, taxYear: r.taxYear,
      incomeItems: r.incomeItems.length ? r.incomeItems : emptyItems(),
      totalIncome: r.totalIncome, totalTax: r.totalTax,
      deliveryMethod: r.deliveryMethod,
      issuedDate: r.issuedDate ?? '', bookNo: r.bookNo ?? '', runNo: r.runNo ?? ''
    });
    setDialogOpen(true);
  };

  const updateItem = (month: number, field: 'income' | 'taxWithheld', value: number) => {
    setForm(f => {
      const items = f.incomeItems.map(i => i.month === month ? { ...i, [field]: value } : i);
      return {
        ...f,
        incomeItems: items,
        totalIncome: items.reduce((s, i) => s + i.income, 0),
        totalTax: items.reduce((s, i) => s + i.taxWithheld, 0)
      };
    });
  };

  const handleSave = async () => {
    if (!form.employeeId) return;
    if (editing) {
      await getApi().updateTawi50EmployeeRecord({ ...form, id: editing.id });
    } else {
      const res = await getApi().addTawi50EmployeeRecord(form);
      if (!res.success) { alert('เกิดข้อผิดพลาด หรือมีข้อมูลปีนี้แล้ว'); return; }
    }
    setDialogOpen(false);
    load();
  };

  const handleDelete = async (id: number) => {
    await getApi().deleteTawi50EmployeeRecord(id);
    setDeleteId(null);
    load();
  };

  const handleExportPdf = async (r: Tawi50EmployeeRecord) => {
    const emp = employees.find(e => e.id === r.employeeId);
    if (!emp) return;
    const bizRes = await getApi().getAllBusinesses();
    if (!bizRes.success || !bizRes.data?.length) return;
    await exportTawi50Employee(r, emp, bizRes.data[0]);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1100, mx: 'auto' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">50 ทวิ — พนักงาน</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}>สร้าง 50 ทวิ</Button>
      </Stack>

      <Stack direction="row" gap={2} mb={2}>
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>พนักงาน</InputLabel>
          <Select value={filter.employeeId ?? ''} label="พนักงาน"
            onChange={e => setFilter(f => ({ ...f, employeeId: e.target.value ? Number(e.target.value) : undefined }))}>
            <MenuItem value="">ทั้งหมด</MenuItem>
            {employees.map(e => <MenuItem key={e.id} value={e.id}>{e.name}</MenuItem>)}
          </Select>
        </FormControl>
        <TextField size="small" label="ปีภาษี (พ.ศ.)" type="number"
          value={filter.taxYear ?? ''}
          onChange={e => setFilter(f => ({ ...f, taxYear: e.target.value ? Number(e.target.value) : undefined }))}
          sx={{ width: 140 }} />
      </Stack>

      <List>
        {records.map(r => (
          <Box key={r.id}>
            <ListItem
              secondaryAction={
                <Stack direction="row" gap={1}>
                  <IconButton color="primary" onClick={() => handleExportPdf(r)} title="Export PDF"><PictureAsPdfIcon /></IconButton>
                  <IconButton onClick={() => openEdit(r)}><EditIcon /></IconButton>
                  <IconButton color="error" onClick={() => setDeleteId(r.id)}><DeleteIcon /></IconButton>
                </Stack>
              }
            >
              <ListItemText
                primary={`${r.employeeName ?? `พนักงาน #${r.employeeId}`} — ปีภาษี ${r.taxYear}`}
                secondary={`เงินได้รวม: ${r.totalIncome.toLocaleString()} บาท | ภาษีรวม: ${r.totalTax.toLocaleString()} บาท | วิธีนำส่ง: ${r.deliveryMethod}`}
              />
            </ListItem>
            <Divider />
          </Box>
        ))}
        {records.length === 0 && (
          <Typography color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>ไม่พบข้อมูล</Typography>
        )}
      </List>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editing ? 'แก้ไข 50 ทวิ' : 'สร้าง 50 ทวิ'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth required>
                <InputLabel>พนักงาน</InputLabel>
                <Select value={form.employeeId || ''} label="พนักงาน"
                  onChange={e => {
                    const id = Number(e.target.value);
                    setForm(f => ({ ...f, employeeId: id }));
                    if (id && form.taxYear) fetchPnd1(id, form.taxYear);
                  }}>
                  {employees.map(e => <MenuItem key={e.id} value={e.id}>{e.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField label="ปีภาษี (พ.ศ.) *" fullWidth type="number" value={form.taxYear}
                onChange={e => {
                  const y = Number(e.target.value);
                  setForm(f => ({ ...f, taxYear: y }));
                  if (form.employeeId && y) fetchPnd1(form.employeeId, y);
                }} />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
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
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField label="เล่มที่" fullWidth value={form.bookNo} onChange={e => setForm(f => ({ ...f, bookNo: e.target.value }))} />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField label="เลขที่" fullWidth value={form.runNo} onChange={e => setForm(f => ({ ...f, runNo: e.target.value }))} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" mb={1}>รายการเงินได้รายเดือน</Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>เดือน</TableCell>
                    <TableCell>เงินได้ (บาท)</TableCell>
                    <TableCell>ภาษีหัก (บาท)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {form.incomeItems.map(item => (
                    <TableRow key={item.month}>
                      <TableCell>{MONTH_NAMES[item.month - 1]}</TableCell>
                      <TableCell>
                        <TextField size="small" type="number" value={item.income}
                          onChange={e => updateItem(item.month, 'income', Number(e.target.value))}
                          sx={{ width: 120 }} />
                      </TableCell>
                      <TableCell>
                        <TextField size="small" type="number" value={item.taxWithheld}
                          onChange={e => updateItem(item.month, 'taxWithheld', Number(e.target.value))}
                          sx={{ width: 120 }} />
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell><strong>รวม</strong></TableCell>
                    <TableCell><strong>{form.totalIncome.toLocaleString()}</strong></TableCell>
                    <TableCell><strong>{form.totalTax.toLocaleString()}</strong></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>ยกเลิก</Button>
          <Button variant="contained" disabled={!form.employeeId} onClick={handleSave}>บันทึก</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteId !== null} onClose={() => setDeleteId(null)}>
        <DialogTitle>ยืนยันการลบ</DialogTitle>
        <DialogContent><Typography>ต้องการลบข้อมูลนี้ใช่ไหม?</Typography></DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>ยกเลิก</Button>
          <Button color="error" onClick={() => deleteId !== null && handleDelete(deleteId)}>ยืนยัน</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
