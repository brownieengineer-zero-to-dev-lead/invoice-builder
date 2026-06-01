import { FormControl, FormControlLabel, Grid, InputLabel, MenuItem, Select, Switch, TextField, Typography } from '@mui/material';
import { useEffect, useRef, useState, type FC } from 'react';
import { getApi } from '../../shared/api/restApi';
import { useForm } from '../../shared/hooks/form/useForm';
import { useFormDirtyCheck } from '../../shared/hooks/form/useFormDirtyCheck';
import type { Business } from '../../shared/types/business';
import type { Employee } from '../../shared/types/employee';
import type { Response } from '../../shared/types/response';

interface FormData {
  id?: number;
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
  baseSalary: number;
  isArchived: boolean;
  businessId?: number;
}

interface Props {
  employee?: Employee;
  handleChange?: (data: { employee: FormData; isFormValid: boolean }) => void;
}

export const Form: FC<Props> = ({ handleChange = () => {}, employee }) => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const initialFormRef = useRef<FormData | undefined>(undefined);
  const { form, setForm, update } = useForm<FormData>({
    id: employee?.id,
    name: employee?.name ?? '',
    taxId: employee?.taxId ?? '',
    addressBuilding: employee?.addressBuilding ?? '',
    addressRoomFloor: employee?.addressRoomFloor ?? '',
    addressVillage: employee?.addressVillage ?? '',
    addressNo: employee?.addressNo ?? '',
    addressMoo: employee?.addressMoo ?? '',
    addressSoi: employee?.addressSoi ?? '',
    addressRoad: employee?.addressRoad ?? '',
    addressSubDistrict: employee?.addressSubDistrict ?? '',
    addressDistrict: employee?.addressDistrict ?? '',
    addressProvince: employee?.addressProvince ?? '',
    addressPostalCode: employee?.addressPostalCode ?? '',
    baseSalary: employee?.baseSalary ?? 0,
    isArchived: employee?.isArchived ?? false,
    businessId: employee?.businessId ?? undefined
  });

  useFormDirtyCheck(form, initialFormRef);

  useEffect(() => {
    getApi().getAllBusinesses().then((res: Response<Business[]>) => {
      if (res.success && res.data) setBusinesses(res.data);
    });
  }, []);

  useEffect(() => {
    const initial: FormData = {
      id: employee?.id,
      name: employee?.name ?? '',
      taxId: employee?.taxId ?? '',
      addressBuilding: employee?.addressBuilding ?? '',
      addressRoomFloor: employee?.addressRoomFloor ?? '',
      addressVillage: employee?.addressVillage ?? '',
      addressNo: employee?.addressNo ?? '',
      addressMoo: employee?.addressMoo ?? '',
      addressSoi: employee?.addressSoi ?? '',
      addressRoad: employee?.addressRoad ?? '',
      addressSubDistrict: employee?.addressSubDistrict ?? '',
      addressDistrict: employee?.addressDistrict ?? '',
      addressProvince: employee?.addressProvince ?? '',
      addressPostalCode: employee?.addressPostalCode ?? '',
      baseSalary: employee?.baseSalary ?? 0,
      isArchived: employee?.isArchived ?? false,
      businessId: employee?.businessId ?? undefined
    };
    initialFormRef.current = initial;
    setForm(initial);
  }, [employee, setForm]);

  useEffect(() => {
    const isFormValid = form.name.trim() !== '' && form.taxId.trim() !== '';
    handleChange({ employee: form, isFormValid });
  }, [form, handleChange]);

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          label="ชื่อ-สกุล *"
          fullWidth
          required
          value={form.name}
          onChange={e => update('name', e.target.value)}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          label="เลขบัตรประชาชน / เลขผู้เสียภาษี *"
          fullWidth
          required
          value={form.taxId}
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
      <Grid size={{ xs: 12, md: 4 }}>
        <FormControl fullWidth>
          <InputLabel>สังกัดธุรกิจ</InputLabel>
          <Select
            value={form.businessId ?? ''}
            label="สังกัดธุรกิจ"
            onChange={e => update('businessId', e.target.value ? Number(e.target.value) : undefined)}
          >
            <MenuItem value="">— ไม่ระบุ —</MenuItem>
            {businesses.map(b => <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>)}
          </Select>
        </FormControl>
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <TextField
          label="เงินเดือนตั้งต้น (บาท)"
          fullWidth
          type="number"
          value={form.baseSalary}
          onChange={e => update('baseSalary', Number(e.target.value))}
        />
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
