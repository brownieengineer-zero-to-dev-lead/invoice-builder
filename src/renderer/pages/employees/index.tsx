import { Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Divider, IconButton, List, ListItem, ListItemText, Stack, TextField, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useCallback, useEffect, useState, type FC } from 'react';
import { getApi } from '../../shared/api/restApi';
import type { Employee, EmployeeAdd, EmployeeUpdate } from '../../shared/types/employee';
import type { Response } from '../../shared/types/response';
import { Form } from './Form';

export const EmployeesPage: FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | undefined>(undefined);
  const [formData, setFormData] = useState<{ employee: EmployeeAdd; isFormValid: boolean } | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const load = useCallback(async () => {
    const res: Response<Employee[]> = await getApi().getAllEmployees(true);
    if (res.success && res.data) setEmployees(res.data);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = employees.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.taxId.includes(search)
  );

  const openAdd = () => { setEditing(undefined); setFormData(null); setDialogOpen(true); };
  const openEdit = (emp: Employee) => { setEditing(emp); setFormData(null); setDialogOpen(true); };

  const handleSave = async () => {
    if (!formData?.isFormValid) return;
    if (editing) {
      await getApi().updateEmployee({ ...formData.employee, id: editing.id } as EmployeeUpdate);
    } else {
      await getApi().addEmployee(formData.employee);
    }
    setDialogOpen(false);
    load();
  };

  const handleDelete = async (id: number) => {
    await getApi().deleteEmployee(id);
    setDeleteId(null);
    load();
  };

  return (
    <Box sx={{ p: 3, maxWidth: 900, mx: 'auto' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">พนักงาน</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}>เพิ่มพนักงาน</Button>
      </Stack>
      <TextField
        placeholder="ค้นหาชื่อ หรือเลขผู้เสียภาษี"
        fullWidth
        size="small"
        value={search}
        onChange={e => setSearch(e.target.value)}
        sx={{ mb: 2 }}
      />
      <List>
        {filtered.map(emp => (
          <Box key={emp.id}>
            <ListItem
              secondaryAction={
                <Stack direction="row" gap={1}>
                  <IconButton onClick={() => openEdit(emp)}><EditIcon /></IconButton>
                  <IconButton color="error" onClick={() => setDeleteId(emp.id)}><DeleteIcon /></IconButton>
                </Stack>
              }
            >
              <ListItemText
                primary={
                  <Stack direction="row" gap={1} alignItems="center">
                    <span>{emp.name}</span>
                    {emp.isArchived && <Chip label="เก็บถาวร" size="small" color="default" />}
                  </Stack>
                }
                secondary={`เลขผู้เสียภาษี: ${emp.taxId} | เงินเดือน: ${emp.baseSalary.toLocaleString()} บาท`}
              />
            </ListItem>
            <Divider />
          </Box>
        ))}
        {filtered.length === 0 && (
          <Typography color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>ไม่พบพนักงาน</Typography>
        )}
      </List>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editing ? 'แก้ไขพนักงาน' : 'เพิ่มพนักงาน'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Form
              employee={editing}
              handleChange={d => setFormData({ employee: d.employee as EmployeeAdd, isFormValid: d.isFormValid })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>ยกเลิก</Button>
          <Button variant="contained" disabled={!formData?.isFormValid} onClick={handleSave}>บันทึก</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteId !== null} onClose={() => setDeleteId(null)}>
        <DialogTitle>ยืนยันการลบ</DialogTitle>
        <DialogContent><Typography>ต้องการเก็บถาวรพนักงานคนนี้ใช่ไหม?</Typography></DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>ยกเลิก</Button>
          <Button color="error" onClick={() => deleteId !== null && handleDelete(deleteId)}>ยืนยัน</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
