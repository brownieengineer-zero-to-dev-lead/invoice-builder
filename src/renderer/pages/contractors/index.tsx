import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Divider, IconButton, List, ListItem, ListItemText, Stack, TextField, Typography } from '@mui/material';
import { useCallback, useEffect, useState, type FC } from 'react';
import { getApi } from '../../shared/api/restApi';
import type { Contractor, ContractorAdd, ContractorUpdate } from '../../shared/types/contractor';
import type { Response } from '../../shared/types/response';
import { Form } from './Form';

export const ContractorsPage: FC = () => {
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Contractor | undefined>(undefined);
  const [formData, setFormData] = useState<{ contractor: ContractorAdd; isFormValid: boolean } | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const load = useCallback(async () => {
    const res: Response<Contractor[]> = await getApi().getAllContractors(true);
    if (res.success && res.data) setContractors(res.data);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = contractors.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.taxId.includes(search)
  );

  const openAdd = () => { setEditing(undefined); setFormData(null); setDialogOpen(true); };
  const openEdit = (c: Contractor) => { setEditing(c); setFormData(null); setDialogOpen(true); };

  const handleSave = async () => {
    if (!formData?.isFormValid) return;
    if (editing) {
      await getApi().updateContractor({ ...formData.contractor, id: editing.id } as ContractorUpdate);
    } else {
      await getApi().addContractor(formData.contractor);
    }
    setDialogOpen(false);
    load();
  };

  const handleDelete = async (id: number) => {
    await getApi().deleteContractor(id);
    setDeleteId(null);
    load();
  };

  return (
    <Box sx={{ p: 3, maxWidth: 900, mx: 'auto' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">ผู้รับจ้าง</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}>เพิ่มผู้รับจ้าง</Button>
      </Stack>
      <TextField
        placeholder="ค้นหาชื่อ หรือเลขผู้เสียภาษี"
        fullWidth size="small" value={search}
        onChange={e => setSearch(e.target.value)} sx={{ mb: 2 }}
      />
      <List>
        {filtered.map(c => (
          <Box key={c.id}>
            <ListItem
              secondaryAction={
                <Stack direction="row" gap={1}>
                  <IconButton onClick={() => openEdit(c)}><EditIcon /></IconButton>
                  <IconButton color="error" onClick={() => setDeleteId(c.id)}><DeleteIcon /></IconButton>
                </Stack>
              }
            >
              <ListItemText
                primary={
                  <Stack direction="row" gap={1} alignItems="center">
                    <span>{c.name}</span>
                    <Chip label={c.type} size="small" color={c.type === 'นิติบุคคล' ? 'primary' : 'default'} />
                    {c.isArchived && <Chip label="เก็บถาวร" size="small" />}
                  </Stack>
                }
                secondary={`เลขผู้เสียภาษี: ${c.taxId}`}
              />
            </ListItem>
            <Divider />
          </Box>
        ))}
        {filtered.length === 0 && (
          <Typography color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>ไม่พบผู้รับจ้าง</Typography>
        )}
      </List>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editing ? 'แก้ไขผู้รับจ้าง' : 'เพิ่มผู้รับจ้าง'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Form
              contractor={editing}
              handleChange={d => setFormData({ contractor: d.contractor as ContractorAdd, isFormValid: d.isFormValid })}
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
        <DialogContent><Typography>ต้องการเก็บถาวรผู้รับจ้างคนนี้ใช่ไหม?</Typography></DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>ยกเลิก</Button>
          <Button color="error" onClick={() => deleteId !== null && handleDelete(deleteId)}>ยืนยัน</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
