import { FormControl, FormControlLabel, Grid, InputLabel, MenuItem, Select, Switch, TextField, Typography } from '@mui/material';
import { useEffect, useRef, type FC } from 'react';
import { useForm } from '../../shared/hooks/form/useForm';
import { useFormDirtyCheck } from '../../shared/hooks/form/useFormDirtyCheck';
import type { Contractor, ContractorType } from '../../shared/types/contractor';

interface FormData {
  id?: number;
  type: ContractorType;
  name: string;
  taxId: string;
  addressBuilding: string;
  addressRoomFloor: string;
  addressVillage: string;
  addressNo: string;
  addressMoo: string;
  addressSoi: string;
  addressRoad: string;
  addressSubDistrict: string;
  addressDistrict: string;
  addressProvince: string;
  addressPostalCode: string;
  isArchived: boolean;
}

interface Props {
  contractor?: Contractor;
  handleChange?: (data: { contractor: FormData; isFormValid: boolean }) => void;
}

export const Form: FC<Props> = ({ handleChange = () => {}, contractor }) => {
  const initialFormRef = useRef<FormData | undefined>(undefined);
  const { form, setForm, update } = useForm<FormData>({
    id: contractor?.id,
    type: contractor?.type ?? 'บุคคลธรรมดา',
    name: contractor?.name ?? '',
    taxId: contractor?.taxId ?? '',
    addressBuilding: contractor?.addressBuilding ?? '',
    addressRoomFloor: contractor?.addressRoomFloor ?? '',
    addressVillage: contractor?.addressVillage ?? '',
    addressNo: contractor?.addressNo ?? '',
    addressMoo: contractor?.addressMoo ?? '',
    addressSoi: contractor?.addressSoi ?? '',
    addressRoad: contractor?.addressRoad ?? '',
    addressSubDistrict: contractor?.addressSubDistrict ?? '',
    addressDistrict: contractor?.addressDistrict ?? '',
    addressProvince: contractor?.addressProvince ?? '',
    addressPostalCode: contractor?.addressPostalCode ?? '',
    isArchived: contractor?.isArchived ?? false
  });

  useFormDirtyCheck(form, initialFormRef);

  useEffect(() => {
    const initial: FormData = {
      id: contractor?.id,
      type: contractor?.type ?? 'บุคคลธรรมดา',
      name: contractor?.name ?? '',
      taxId: contractor?.taxId ?? '',
      addressBuilding: contractor?.addressBuilding ?? '',
      addressRoomFloor: contractor?.addressRoomFloor ?? '',
      addressVillage: contractor?.addressVillage ?? '',
      addressNo: contractor?.addressNo ?? '',
      addressMoo: contractor?.addressMoo ?? '',
      addressSoi: contractor?.addressSoi ?? '',
      addressRoad: contractor?.addressRoad ?? '',
      addressSubDistrict: contractor?.addressSubDistrict ?? '',
      addressDistrict: contractor?.addressDistrict ?? '',
      addressProvince: contractor?.addressProvince ?? '',
      addressPostalCode: contractor?.addressPostalCode ?? '',
      isArchived: contractor?.isArchived ?? false
    };
    initialFormRef.current = initial;
    setForm(initial);
  }, [contractor, setForm]);

  useEffect(() => {
    const isFormValid = form.name.trim() !== '' && form.taxId.trim() !== '';
    handleChange({ contractor: form, isFormValid });
  }, [form, handleChange]);

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 6 }}>
        <FormControl fullWidth required>
          <InputLabel>ประเภท</InputLabel>
          <Select value={form.type} label="ประเภท" onChange={e => update('type', e.target.value as ContractorType)}>
            <MenuItem value="บุคคลธรรมดา">บุคคลธรรมดา</MenuItem>
            <MenuItem value="นิติบุคคล">นิติบุคคล</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <TextField label="ชื่อ / ชื่อบริษัท *" fullWidth required value={form.name} onChange={e => update('name', e.target.value)} />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          label="เลขบัตรประชาชน / เลขทะเบียนนิติบุคคล *"
          fullWidth required value={form.taxId}
          onChange={e => update('taxId', e.target.value)}
          slotProps={{ htmlInput: { maxLength: 13 } }}
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <Typography variant="subtitle2" color="text.secondary">ที่อยู่</Typography>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <TextField label="อาคาร" fullWidth value={form.addressBuilding} onChange={e => update('addressBuilding', e.target.value)} />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <TextField label="ห้องเลขที่ / ชั้นที่" fullWidth value={form.addressRoomFloor} onChange={e => update('addressRoomFloor', e.target.value)} />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <TextField label="หมู่บ้าน" fullWidth value={form.addressVillage} onChange={e => update('addressVillage', e.target.value)} />
      </Grid>
      <Grid size={{ xs: 12, md: 3 }}>
        <TextField label="เลขที่" fullWidth value={form.addressNo} onChange={e => update('addressNo', e.target.value)} />
      </Grid>
      <Grid size={{ xs: 12, md: 3 }}>
        <TextField label="หมู่ที่" fullWidth value={form.addressMoo} onChange={e => update('addressMoo', e.target.value)} />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <TextField label="ตรอก/ซอย" fullWidth value={form.addressSoi} onChange={e => update('addressSoi', e.target.value)} />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <TextField label="ถนน" fullWidth value={form.addressRoad} onChange={e => update('addressRoad', e.target.value)} />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <TextField label="ตำบล/แขวง" fullWidth value={form.addressSubDistrict} onChange={e => update('addressSubDistrict', e.target.value)} />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <TextField label="อำเภอ/เขต" fullWidth value={form.addressDistrict} onChange={e => update('addressDistrict', e.target.value)} />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <TextField label="จังหวัด" fullWidth value={form.addressProvince} onChange={e => update('addressProvince', e.target.value)} />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <TextField label="รหัสไปรษณีย์" fullWidth value={form.addressPostalCode} onChange={e => update('addressPostalCode', e.target.value)} slotProps={{ htmlInput: { maxLength: 5 } }} />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <FormControlLabel
          control={<Switch checked={form.isArchived} onChange={e => update('isArchived', e.target.checked)} />}
          label="เก็บถาวร"
        />
      </Grid>
    </Grid>
  );
};
