import {
  Box, FormControl, Grid, InputLabel, MenuItem, Select, Table, TableBody,
  TableCell, TableHead, TableRow, TextField, Typography
} from '@mui/material';
import { useEffect, useState, type FC } from 'react';
import { getApi } from '../../shared/api/restApi';
import { InvoiceFormMode } from '../../shared/enums/invoiceFormMode';
import type { Pnd1Record } from '../../shared/types/pnd1Record';
import type { Response } from '../../shared/types/response';
import type {
  Tawi50EmployeeRecord, Tawi50EmployeeRecordAdd, Tawi50EmployeeRecordUpdate,
  Tawi50IncomeItem, WhtDeliveryMethod
} from '../../shared/types/tawi50EmployeeRecord';
import { Tawi50Preview } from './Preview';
import { EmployeeSelector } from './EmployeeSelector';
import { EmployeesDropdown } from './EmployeesDropdown';

const MONTH_NAMES = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
const CURRENT_YEAR = new Date().getFullYear() + 543;
const DELIVERY_METHODS: WhtDeliveryMethod[] = ['หัก ณ ที่จ่าย', 'ออกให้ตลอดไป', 'ออกให้ครั้งเดียว'];

const emptyItems = (): Tawi50IncomeItem[] =>
  Array.from({ length: 12 }, (_, i) => ({ month: i + 1, income: 0, taxWithheld: 0 }));

const defaultValues = (): Tawi50EmployeeRecordAdd & { employeeName?: string } => ({
  employeeId: 0,
  taxYear: CURRENT_YEAR,
  incomeItems: emptyItems(),
  totalIncome: 0,
  totalTax: 0,
  deliveryMethod: 'หัก ณ ที่จ่าย',
  issuedDate: '',
  bookNo: '',
  runNo: '',
  employeeName: undefined
});

const recordToForm = (r: Tawi50EmployeeRecord): Tawi50EmployeeRecordAdd & { employeeName?: string } => ({
  employeeId: r.employeeId,
  taxYear: r.taxYear,
  incomeItems: r.incomeItems.length ? r.incomeItems : emptyItems(),
  totalIncome: r.totalIncome,
  totalTax: r.totalTax,
  deliveryMethod: r.deliveryMethod,
  issuedDate: r.issuedDate ?? '',
  bookNo: r.bookNo ?? '',
  runNo: r.runNo ?? '',
  employeeName: r.employeeName
});

interface Props {
  record?: Tawi50EmployeeRecord;
  mode?: InvoiceFormMode;
  onChange: (data: { changedData: Tawi50EmployeeRecordAdd | Tawi50EmployeeRecordUpdate; isFormValid: boolean }) => void;
}

export const Form: FC<Props> = ({ record, mode = InvoiceFormMode.edit, onChange }) => {
  const [form, setForm] = useState(record ? recordToForm(record) : defaultValues());
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    if (record) {
      setForm(recordToForm(record));
    } else {
      setForm(defaultValues());
    }
  }, [record?.id]);

  useEffect(() => {
    const isFormValid = form.employeeId > 0 && form.taxYear > 0;
    const { employeeName: _, ...data } = form;
    const changedData: Tawi50EmployeeRecordAdd | Tawi50EmployeeRecordUpdate = record
      ? { ...data, id: record.id }
      : data;
    onChange({ changedData, isFormValid });
  }, [form]);

  const update = (patch: Partial<typeof form>) => setForm(f => ({ ...f, ...patch }));

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

  const fetchPnd1 = async (employeeId: number, taxYear: number) => {
    const res: Response<Pnd1Record[]> = await getApi().getAllPnd1Records({ employeeId, year: taxYear });
    if (res.success && res.data) {
      const items = emptyItems().map(item => {
        const pnd1 = res.data!.find(r => r.month === item.month);
        return pnd1 ? { month: item.month, income: pnd1.income, taxWithheld: pnd1.taxWithheld } : item;
      });
      update({
        incomeItems: items,
        totalIncome: items.reduce((s, i) => s + i.income, 0),
        totalTax: items.reduce((s, i) => s + i.taxWithheld, 0)
      });
    }
  };

  if (mode === InvoiceFormMode.preview) {
    return <Tawi50Preview record={record} />;
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
        <Grid size={{ xs: 6, md: 4 }}>
          <TextField
            label="ปีภาษี (พ.ศ.) *"
            fullWidth
            type="number"
            value={form.taxYear}
            onChange={e => {
              const y = Number(e.target.value);
              update({ taxYear: y });
              if (form.employeeId && y) fetchPnd1(form.employeeId, y);
            }}
          />
        </Grid>
        <Grid size={{ xs: 6, md: 4 }}>
          <FormControl fullWidth>
            <InputLabel>วิธีนำส่ง</InputLabel>
            <Select
              value={form.deliveryMethod}
              label="วิธีนำส่ง"
              onChange={e => update({ deliveryMethod: e.target.value as WhtDeliveryMethod })}
            >
              {DELIVERY_METHODS.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            label="วันที่ออกหนังสือรับรอง"
            fullWidth
            type="date"
            value={form.issuedDate}
            onChange={e => update({ issuedDate: e.target.value })}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Grid>
        <Grid size={{ xs: 6 }}>
          <TextField
            label="เล่มที่"
            fullWidth
            value={form.bookNo}
            onChange={e => update({ bookNo: e.target.value })}
          />
        </Grid>
        <Grid size={{ xs: 6 }}>
          <TextField
            label="เลขที่"
            fullWidth
            value={form.runNo}
            onChange={e => update({ runNo: e.target.value })}
          />
        </Grid>
      </Grid>

      <Box sx={{ mt: 3 }}>
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
                  <TextField
                    size="small"
                    type="number"
                    value={item.income}
                    onChange={e => updateItem(item.month, 'income', Number(e.target.value))}
                    sx={{ width: 120 }}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    type="number"
                    value={item.taxWithheld}
                    onChange={e => updateItem(item.month, 'taxWithheld', Number(e.target.value))}
                    sx={{ width: 120 }}
                  />
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
      </Box>

      <EmployeesDropdown
        isOpen={isDropdownOpen}
        onClose={() => setIsDropdownOpen(false)}
        onOpen={() => setIsDropdownOpen(true)}
        onClick={emp => {
          update({ employeeId: emp.id, employeeName: emp.name });
          setIsDropdownOpen(false);
          if (emp.id && form.taxYear) fetchPnd1(emp.id, form.taxYear);
        }}
      />
    </Box>
  );
};
