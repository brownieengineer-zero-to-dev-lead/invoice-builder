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
import type { Employee } from '../../shared/types/employee';
import type { Pnd1Record, Pnd1RecordAdd } from '../../shared/types/pnd1Record';
import type { Response } from '../../shared/types/response';
import { exportPnd1 } from '../../shared/utils/whtPdfExport';

const MONTH_NAMES = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
const CURRENT_YEAR = new Date().getFullYear() + 543;

const defaultForm = (): Pnd1RecordAdd => ({
  employeeId: 0,
  month: new Date().getMonth() + 1,
  year: CURRENT_YEAR,
  income: 0,
  taxWithheld: 0
});

export const Pnd1Page: FC = () => {
  const [records, setRecords] = useState<Pnd1Record[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [filter, setFilter] = useState<{ employeeId?: number; month?: number; year?: number }>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Pnd1Record | undefined>(undefined);
  const [form, setForm] = useState<Pnd1RecordAdd>(defaultForm());
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const load = useCallback(async () => {
    const f: Record<string, number> = {};
    if (filter.employeeId) f.employeeId = filter.employeeId;
    if (filter.month) f.month = filter.month;
    if (filter.year) f.year = filter.year;
    const res: Response<Pnd1Record[]> = await getApi().getAllPnd1Records(Object.keys(f).length ? f : undefined);
    if (res.success && res.data) setRecords(res.data);
  }, [filter]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    getApi().getAllEmployees(false).then((res: Response<Employee[]>) => {
      if (res.success && res.data) setEmployees(res.data);
    });
    getApi().getAllBusinesses().then((res: Response<Business[]>) => {
      if (res.success && res.data) setBusinesses(res.data);
    });
  }, []);

  const openAdd = () => {
    setEditing(undefined);
    setForm(defaultForm());
    setDialogOpen(true);
  };
  const openEdit = (r: Pnd1Record) => {
    setEditing(r);
    setForm({ employeeId: r.employeeId, month: r.month, year: r.year, income: r.income, taxWithheld: r.taxWithheld });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.employeeId) return;
    if (editing) {
      await getApi().updatePnd1Record({ ...form, id: editing.id });
    } else {
      const res = await getApi().addPnd1Record(form);
      if (!res.success) { alert('มีข้อมูลเดือนนี้แล้ว หรือเกิดข้อผิดพลาด'); return; }
    }
    setDialogOpen(false);
    load();
  };

  const handleExportPdf = async (r: Pnd1Record) => {
    const employee = employees.find(e => e.id === r.employeeId);
    if (!employee) return;
    const business = businesses.find(b => b.id === employee.businessId);
    if (!business) { alert('พนักงานคนนี้ยังไม่ได้ระบุสังกัดธุรกิจ'); return; }
    await exportPnd1(r, employee, business);
  };

  const handleDelete = async (id: number) => {
    await getApi().deletePnd1Record(id);
    setDeleteId(null);
    load();
  };

  const isFormValid = form.employeeId > 0 && form.month > 0 && form.year > 0;

  return (
    <Box sx={{ p: 3, maxWidth: 1000, mx: 'auto' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">ภ.ง.ด.1 — ข้อมูลรายเดือน</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}>เพิ่มข้อมูล</Button>
      </Stack>

      <Stack direction="row" gap={2} mb={2} flexWrap="wrap">
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>พนักงาน</InputLabel>
          <Select
            value={filter.employeeId ?? ''}
            label="พนักงาน"
            onChange={e => setFilter(f => ({ ...f, employeeId: e.target.value ? Number(e.target.value) : undefined }))}
          >
            <MenuItem value="">ทั้งหมด</MenuItem>
            {employees.map(e => <MenuItem key={e.id} value={e.id}>{e.name}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>เดือน</InputLabel>
          <Select
            value={filter.month ?? ''}
            label="เดือน"
            onChange={e => setFilter(f => ({ ...f, month: e.target.value ? Number(e.target.value) : undefined }))}
          >
            <MenuItem value="">ทั้งหมด</MenuItem>
            {MONTH_NAMES.map((m, i) => <MenuItem key={i+1} value={i+1}>{m}</MenuItem>)}
          </Select>
        </FormControl>
        <TextField
          size="small" label="ปี (พ.ศ.)" type="number"
          value={filter.year ?? ''}
          onChange={e => setFilter(f => ({ ...f, year: e.target.value ? Number(e.target.value) : undefined }))}
          sx={{ width: 120 }}
        />
      </Stack>

      <List>
        {records.map(r => (
          <Box key={r.id}>
            <ListItem
              secondaryAction={
                <Stack direction="row" gap={1}>
                  <IconButton onClick={() => handleExportPdf(r)}><PictureAsPdfIcon /></IconButton>
                  <IconButton onClick={() => openEdit(r)}><EditIcon /></IconButton>
                  <IconButton color="error" onClick={() => setDeleteId(r.id)}><DeleteIcon /></IconButton>
                </Stack>
              }
            >
              <ListItemText
                primary={`${r.employeeName ?? `พนักงาน #${r.employeeId}`} — ${MONTH_NAMES[r.month - 1]} ${r.year}`}
                secondary={`เงินได้: ${r.income.toLocaleString()} บาท | ภาษีหัก: ${r.taxWithheld.toLocaleString()} บาท`}
              />
            </ListItem>
            <Divider />
          </Box>
        ))}
        {records.length === 0 && (
          <Typography color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>ไม่พบข้อมูล</Typography>
        )}
      </List>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'แก้ไขข้อมูล ภ.ง.ด.1' : 'เพิ่มข้อมูล ภ.ง.ด.1'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth required>
                <InputLabel>พนักงาน</InputLabel>
                <Select
                  value={form.employeeId || ''}
                  label="พนักงาน"
                  onChange={e => {
                    const emp = employees.find(em => em.id === Number(e.target.value));
                    setForm(f => ({ ...f, employeeId: Number(e.target.value), income: emp?.baseSalary ?? f.income }));
                  }}
                >
                  {employees.map(e => <MenuItem key={e.id} value={e.id}>{e.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <FormControl fullWidth required>
                <InputLabel>เดือน</InputLabel>
                <Select value={form.month} label="เดือน" onChange={e => setForm(f => ({ ...f, month: Number(e.target.value) }))}>
                  {MONTH_NAMES.map((m, i) => <MenuItem key={i+1} value={i+1}>{m}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField label="ปี (พ.ศ.) *" fullWidth type="number" value={form.year} onChange={e => setForm(f => ({ ...f, year: Number(e.target.value) }))} />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField label="เงินได้ (บาท) *" fullWidth type="number" value={form.income} onChange={e => setForm(f => ({ ...f, income: Number(e.target.value) }))} />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField label="ภาษีที่หัก (บาท) *" fullWidth type="number" value={form.taxWithheld} onChange={e => setForm(f => ({ ...f, taxWithheld: Number(e.target.value) }))} />
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
        <DialogContent><Typography>ต้องการลบข้อมูลนี้ใช่ไหม?</Typography></DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>ยกเลิก</Button>
          <Button color="error" onClick={() => deleteId !== null && handleDelete(deleteId)}>ยืนยัน</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
