import { Box, FormControl, Grid, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import { useEffect, useState, type FC } from 'react';
import { getApi } from '../../shared/api/restApi';
import { InvoiceFormMode } from '../../shared/enums/invoiceFormMode';
import type { Business } from '../../shared/types/business';
import type { Response } from '../../shared/types/response';
import type {
  PndType, WhtDeliveryMethod, WhtIncomeType, WhtRate,
  WhtTransaction, WhtTransactionAdd, WhtTransactionUpdate
} from '../../shared/types/whtTransaction';
import { WhtTransactionPreview } from './Preview';
import { ContractorSelector } from './ContractorSelector';
import { ContractorsDropdown } from './ContractorsDropdown';

const INCOME_TYPES: WhtIncomeType[] = ['ค่าบริการ', 'ค่าเช่า', 'ค่าสิทธิ์', 'อื่นๆ'];
const WHT_RATES: WhtRate[] = [1, 3, 5, 15];
const DELIVERY_METHODS: WhtDeliveryMethod[] = ['หัก ณ ที่จ่าย', 'ออกให้ตลอดไป', 'ออกให้ครั้งเดียว'];

const calcTax = (amount: number, rate: number) => Math.round(amount * rate / 100);

const defaultValues = (): WhtTransactionAdd & { contractorName?: string } => ({
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
  runNo: '',
  contractorName: undefined
});

const recordToForm = (r: WhtTransaction): WhtTransactionAdd & { contractorName?: string } => ({
  businessId: r.businessId,
  contractorId: r.contractorId,
  invoiceId: r.invoiceId,
  payDate: r.payDate?.slice(0, 10) ?? '',
  pndType: r.pndType,
  incomeType: r.incomeType,
  incomeTypeOther: r.incomeTypeOther ?? '',
  whtRate: r.whtRate,
  amountBeforeTax: r.amountBeforeTax,
  taxWithheld: r.taxWithheld,
  deliveryMethod: r.deliveryMethod,
  issuedDate: r.issuedDate ?? '',
  bookNo: r.bookNo ?? '',
  runNo: r.runNo ?? '',
  contractorName: r.contractorName
});

interface Props {
  record?: WhtTransaction;
  mode?: InvoiceFormMode;
  onChange: (data: { changedData: WhtTransactionAdd | WhtTransactionUpdate; isFormValid: boolean }) => void;
}

export const Form: FC<Props> = ({ record, mode = InvoiceFormMode.edit, onChange }) => {
  const [form, setForm] = useState(record ? recordToForm(record) : defaultValues());
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    getApi().getAllBusinesses().then((res: Response<Business[]>) => {
      if (res.success && res.data) setBusinesses(res.data);
    });
  }, []);

  useEffect(() => {
    if (record) {
      setForm(recordToForm(record));
    } else {
      setForm(defaultValues());
    }
  }, [record?.id]);

  useEffect(() => {
    const isFormValid = form.businessId > 0 && form.contractorId > 0 && form.payDate !== '';
    const { contractorName: _, ...data } = form;
    const changedData: WhtTransactionAdd | WhtTransactionUpdate = record
      ? { ...data, id: record.id }
      : data;
    onChange({ changedData, isFormValid });
  }, [form]); // eslint-disable-line react-hooks/exhaustive-deps

  const update = (patch: Partial<typeof form>) => setForm(f => ({ ...f, ...patch }));

  if (mode === InvoiceFormMode.preview) {
    return <WhtTransactionPreview record={record} copy="12" />;
  }

  if (mode === InvoiceFormMode.previewCopy34) {
    return <WhtTransactionPreview record={record} copy="34" />;
  }

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ mb: 2 }}>
        <ContractorSelector
          contractorName={form.contractorName}
          onEdit={() => setIsDropdownOpen(true)}
        />
      </Box>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormControl fullWidth required>
            <InputLabel>ธุรกิจ</InputLabel>
            <Select
              value={form.businessId || ''}
              label="ธุรกิจ"
              onChange={e => update({ businessId: Number(e.target.value) })}
            >
              {businesses.map(b => <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            label="วันที่จ่าย *"
            fullWidth
            type="date"
            value={form.payDate}
            onChange={e => update({ payDate: e.target.value })}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormControl fullWidth>
            <InputLabel>ประเภท ภ.ง.ด.</InputLabel>
            <Select
              value={form.pndType}
              label="ประเภท ภ.ง.ด."
              onChange={e => update({ pndType: e.target.value as PndType })}
            >
              <MenuItem value="ภ.ง.ด.3">ภ.ง.ด.3 (บุคคลธรรมดา)</MenuItem>
              <MenuItem value="ภ.ง.ด.53">ภ.ง.ด.53 (นิติบุคคล)</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormControl fullWidth required>
            <InputLabel>ประเภทเงินได้</InputLabel>
            <Select
              value={form.incomeType}
              label="ประเภทเงินได้"
              onChange={e => update({ incomeType: e.target.value as WhtIncomeType })}
            >
              {INCOME_TYPES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>
        {form.incomeType === 'อื่นๆ' && (
          <Grid size={{ xs: 12 }}>
            <TextField
              label="ระบุประเภทเงินได้อื่นๆ"
              fullWidth
              value={form.incomeTypeOther}
              onChange={e => update({ incomeTypeOther: e.target.value })}
            />
          </Grid>
        )}
        <Grid size={{ xs: 12, md: 4 }}>
          <FormControl fullWidth required>
            <InputLabel>อัตรา WHT (%)</InputLabel>
            <Select
              value={form.whtRate}
              label="อัตรา WHT (%)"
              onChange={e => {
                const rate = Number(e.target.value) as WhtRate;
                update({ whtRate: rate, taxWithheld: calcTax(form.amountBeforeTax, rate) });
              }}
            >
              {WHT_RATES.map(r => <MenuItem key={r} value={r}>{r}%</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            label="จำนวนเงินก่อนหัก (บาท) *"
            fullWidth
            type="number"
            value={form.amountBeforeTax}
            onChange={e => {
              const amount = Number(e.target.value);
              update({ amountBeforeTax: amount, taxWithheld: calcTax(amount, form.whtRate) });
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            label="ภาษีที่หัก (บาท)"
            fullWidth
            type="number"
            value={form.taxWithheld}
            onChange={e => update({ taxWithheld: Number(e.target.value) })}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
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
        <Grid size={{ xs: 6, md: 2 }}>
          <TextField
            label="เล่มที่"
            fullWidth
            value={form.bookNo}
            onChange={e => update({ bookNo: e.target.value })}
          />
        </Grid>
        <Grid size={{ xs: 6, md: 2 }}>
          <TextField
            label="เลขที่"
            fullWidth
            value={form.runNo}
            onChange={e => update({ runNo: e.target.value })}
          />
        </Grid>
      </Grid>

      <ContractorsDropdown
        isOpen={isDropdownOpen}
        onClose={() => setIsDropdownOpen(false)}
        onOpen={() => setIsDropdownOpen(true)}
        onClick={contractor => {
          update({
            contractorId: contractor.id,
            contractorName: contractor.name,
            pndType: contractor.type === 'นิติบุคคล' ? 'ภ.ง.ด.53' : 'ภ.ง.ด.3'
          });
          setIsDropdownOpen(false);
        }}
      />
    </Box>
  );
};
