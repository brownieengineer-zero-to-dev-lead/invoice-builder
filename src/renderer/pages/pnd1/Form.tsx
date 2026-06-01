import { Box, FormControl, Grid, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import { useEffect, useState, type FC } from 'react';
import { InvoiceFormMode } from '../../shared/enums/invoiceFormMode';
import type { Pnd1Record, Pnd1RecordAdd, Pnd1RecordUpdate } from '../../shared/types/pnd1Record';
import { Pnd1Preview } from './Preview';
import { EmployeeSelector } from './EmployeeSelector';
import { EmployeesDropdown } from './EmployeesDropdown';

const MONTH_NAMES = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
const CURRENT_YEAR = new Date().getFullYear() + 543;

const defaultValues = (): Pnd1RecordAdd => ({
  employeeId: 0,
  month: new Date().getMonth() + 1,
  year: CURRENT_YEAR,
  income: 0,
  taxWithheld: 0
});

interface Props {
  record?: Pnd1Record;
  mode?: InvoiceFormMode;
  onChange: (data: { changedData: Pnd1RecordAdd | Pnd1RecordUpdate; isFormValid: boolean }) => void;
}

export const Form: FC<Props> = ({ record, mode = InvoiceFormMode.edit, onChange }) => {
  const [form, setForm] = useState<Pnd1RecordAdd & { employeeName?: string }>(
    record
      ? { employeeId: record.employeeId, month: record.month, year: record.year, income: record.income, taxWithheld: record.taxWithheld, employeeName: record.employeeName }
      : defaultValues()
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    if (record) {
      setForm({ employeeId: record.employeeId, month: record.month, year: record.year, income: record.income, taxWithheld: record.taxWithheld, employeeName: record.employeeName });
    } else {
      setForm(defaultValues());
    }
  }, [record?.id]);

  useEffect(() => {
    const isFormValid = form.employeeId > 0 && form.month > 0 && form.year > 0;
    const { employeeName: _, ...data } = form;
    const changedData: Pnd1RecordAdd | Pnd1RecordUpdate = record ? { ...data, id: record.id } : data;
    onChange({ changedData, isFormValid });
  }, [form]);

  const update = (patch: Partial<typeof form>) => setForm(f => ({ ...f, ...patch }));

  if (mode === InvoiceFormMode.preview) {
    return <Pnd1Preview record={record} />;
  }

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ mb: 2 }}>
        <EmployeeSelector
          employeeName={form.employeeName}
          onEdit={() => setIsDropdownOpen(true)}
        />
      </Box>

      <Grid container spacing={2}>
        <Grid size={{ xs: 6 }}>
          <FormControl fullWidth required>
            <InputLabel>เดือน</InputLabel>
            <Select
              value={form.month}
              label="เดือน"
              onChange={e => update({ month: Number(e.target.value) })}
            >
              {MONTH_NAMES.map((m, i) => (
                <MenuItem key={i + 1} value={i + 1}>{m}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 6 }}>
          <TextField
            label="ปี (พ.ศ.) *"
            fullWidth
            type="number"
            value={form.year}
            onChange={e => update({ year: Number(e.target.value) })}
          />
        </Grid>
        <Grid size={{ xs: 6 }}>
          <TextField
            label="เงินได้ (บาท) *"
            fullWidth
            type="number"
            value={form.income}
            onChange={e => update({ income: Number(e.target.value) })}
          />
        </Grid>
        <Grid size={{ xs: 6 }}>
          <TextField
            label="ภาษีที่หัก (บาท) *"
            fullWidth
            type="number"
            value={form.taxWithheld}
            onChange={e => update({ taxWithheld: Number(e.target.value) })}
          />
        </Grid>
      </Grid>

      <EmployeesDropdown
        isOpen={isDropdownOpen}
        onClose={() => setIsDropdownOpen(false)}
        onOpen={() => setIsDropdownOpen(true)}
        onClick={emp => {
          update({ employeeId: emp.id, employeeName: emp.name, income: emp.baseSalary });
          setIsDropdownOpen(false);
        }}
      />
    </Box>
  );
};
