import { downloadPdf, fillPdfForm, mergePdfs, type PdfFieldValues } from './pdfFormFiller';
import pnd1TemplateUrl from '../../assets/template-documents/pnd1.pdf';
import type { Business } from '../types/business';
import type { Employee } from '../types/employee';
import type { Contractor } from '../types/contractor';
import type { Tawi50EmployeeRecord } from '../types/tawi50EmployeeRecord';
import type { WhtTransaction } from '../types/whtTransaction';
import type { Pnd1Record } from '../types/pnd1Record';

const MONTH_THAI = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];

const buildAddress = (entity: {
  addressBuilding?: string; addressRoomFloor?: string; addressVillage?: string;
  addressNo?: string; addressMoo?: string; addressSoi?: string; addressRoad?: string;
  addressSubDistrict?: string; addressDistrict?: string; addressProvince?: string; addressPostalCode?: string;
}) => {
  const parts = [
    entity.addressBuilding, entity.addressRoomFloor, entity.addressVillage,
    entity.addressNo ? `เลขที่ ${entity.addressNo}` : '',
    entity.addressMoo ? `หมู่ ${entity.addressMoo}` : '',
    entity.addressSoi ? `ซอย ${entity.addressSoi}` : '',
    entity.addressRoad ? `ถนน ${entity.addressRoad}` : '',
    entity.addressSubDistrict, entity.addressDistrict, entity.addressProvince,
    entity.addressPostalCode
  ].filter(Boolean);
  return parts.join(' ');
};

const formatAmount = (v: number) => new Intl.NumberFormat('en-US', {
  style: 'decimal',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
}).format(v);


const deliveryMethodCheckField = (method: string): Record<string, boolean> => ({
  chk8: method === 'หัก ณ ที่จ่าย',
  chk9: method === 'ออกให้ตลอดไป',
  chk10: method === 'ออกให้ครั้งเดียว',
  chk11: false
});

export const buildTawi50Bytes = async (
  record: Tawi50EmployeeRecord,
  employee: Employee,
  business: Business
): Promise<Uint8Array> => {
  const issuedDate = record.issuedDate ? new Date(record.issuedDate) : new Date();
  const day = issuedDate.getDate().toString();
  const month = (issuedDate.getMonth() + 1).toString();
  const year = (issuedDate.getFullYear() + 543).toString();

  const fields: PdfFieldValues = {
    book_no: record.bookNo ?? '',
    run_no: record.runNo ?? '',
    name1: business.name,
    id1: formatIdCard(business.code ?? ''),
    add1: (business as Record<string, unknown>).addressNo
      ? buildAddress(business as Parameters<typeof buildAddress>[0])
      : business.address ?? '',
    name2: employee.name,
    id1_2: formatIdCard(employee.taxId),
    add2: buildAddress(employee),
    chk1: true,
    ...deliveryMethodCheckField(record.deliveryMethod),
    date_pay: day,
    month_pay: month,
    year_pay: year,
    total: formatAmount(record.totalTax)
  };

  for (let i = 0; i < 12; i++) {
    const item = record.incomeItems.find(it => it.month === i + 1);
    fields[`date1`] = `ม.ค.–ธ.ค. ${record.taxYear}`;
    if (item && item.income) {
      fields[`pay1.${i}`] = formatAmount(item.income);
      fields[`tax1.${i}`] = formatAmount(item.taxWithheld);
    }
  }

  const templateUrl = new URL(
    '../../assets/template-documents/tawi-50-employee.pdf',
    import.meta.url
  ).href;
  return fillPdfForm(templateUrl, fields);
};

export const exportTawi50Employee = async (
  record: Tawi50EmployeeRecord,
  employee: Employee,
  business: Business
) => {
  const bytes = await buildTawi50Bytes(record, employee, business);
  downloadPdf(bytes, `tawi50-employee-${employee.name}-${record.taxYear}.pdf`);
};

const formatIdCard = (id: string): string => {
    const cleaned = id.replace(/\D/g, '');
    if (cleaned.length !== 13) {
        return id;
    }
    return cleaned.replace(/^(\d{1})(\d{4})(\d{5})(\d{2})(\d{1})$/, '$1 $2 $3 $4 $5');
}

const buildContractorFields = (
  transaction: WhtTransaction,
  contractor: Contractor,
  business: Business
): PdfFieldValues => {
  const issuedDate = transaction.issuedDate ? new Date(transaction.issuedDate) : new Date();
  const payDate = new Date(transaction.payDate);

  const isPnd3 = transaction.pndType === 'ภ.ง.ด.3';

  const incomeTypeRow: Record<string, boolean | string> = {
    chk4: isPnd3,
    chk7: !isPnd3
  };

  if (transaction.incomeType === 'อื่นๆ') {
    incomeTypeRow['spec1'] = transaction.incomeTypeOther ?? '';
    incomeTypeRow['rate1'] = `${transaction.whtRate}%`;
  }

  return {
    book_no: transaction.bookNo ?? '',
    run_no: transaction.runNo ?? '',
    name1: business.name,
    id1: formatIdCard(business.code ?? ''),
    add1: (business as Record<string, unknown>).addressNo
      ? buildAddress(business as Parameters<typeof buildAddress>[0])
      : business.address ?? '',
    name2: contractor.name,
    id1_2: formatIdCard(contractor.taxId),
    add2: buildAddress(contractor),
    ...incomeTypeRow,
    date1: `${payDate.getDate()}/${payDate.getMonth() + 1}/${payDate.getFullYear() + 543}`,
    'pay1.0': formatAmount(transaction.amountBeforeTax),
    'tax1.0': formatAmount(transaction.taxWithheld),
    ...deliveryMethodCheckField(transaction.deliveryMethod),
    date_pay: issuedDate.getDate().toString(),
    month_pay: (issuedDate.getMonth() + 1).toString(),
    year_pay: (issuedDate.getFullYear() + 543).toString(),
    total: formatAmount(transaction.taxWithheld)
  };
};

const getContractorTemplateUrl = (copy: 1 | 2 | 3 | 4) =>
  new URL(
    `../../assets/template-documents/tawi-50-contract-${copy}.pdf`,
    import.meta.url
  ).href;

export const buildWhtTransactionBytes12 = async (
  transaction: WhtTransaction,
  contractor: Contractor,
  business: Business
): Promise<Uint8Array> => {
  const fields = buildContractorFields(transaction, contractor, business);
  const fontSizes = {
    'id1': 8,
    'name2': 9,
    'id1_2': 8,
    'date1': 11,
    'pay1.0': 11,
    'tax1.0': 11
  };
  const [bytes1, bytes2] = await Promise.all([
    fillPdfForm(getContractorTemplateUrl(1), fields, fontSizes),
    fillPdfForm(getContractorTemplateUrl(2), fields, fontSizes)
  ]);
  return mergePdfs([bytes1, bytes2]);
};

export const exportTawi50ContractorCopies12 = async (
  transaction: WhtTransaction,
  contractor: Contractor,
  business: Business
) => {
  const merged = await buildWhtTransactionBytes12(transaction, contractor, business);
  downloadPdf(merged, `tawi50-contractor-${contractor.name}-12.pdf`);
};

export const buildWhtTransactionBytes34 = async (
  transaction: WhtTransaction,
  contractor: Contractor,
  business: Business
): Promise<Uint8Array> => {
  const fields = buildContractorFields(transaction, contractor, business);
  const [bytes3, bytes4] = await Promise.all([
    fillPdfForm(getContractorTemplateUrl(3), fields),
    fillPdfForm(getContractorTemplateUrl(4), fields)
  ]);
  return mergePdfs([bytes3, bytes4]);
};

export const exportTawi50ContractorCopies34 = async (
  transaction: WhtTransaction,
  contractor: Contractor,
  business: Business
) => {
  const merged = await buildWhtTransactionBytes34(transaction, contractor, business);
  downloadPdf(merged, `tawi50-contractor-${contractor.name}-34.pdf`);
};

export const buildPnd1Bytes = async (
  record: Pnd1Record,
  business: Business
): Promise<Uint8Array> => {
  const fields: PdfFieldValues = {
    'Text1.0': business.code ?? '',
    'Text1.2': business.name,
    'Text1.3': business.addressBuilding ?? '',
    'Text1.4': business.addressRoomFloor ?? '',
    'Text1.6': business.addressVillage ?? '',
    'Text1.7': business.addressNo ?? '',
    'Text1.8': business.addressMoo ?? '',
    'Text1.9': business.addressSoi ?? '',
    'Text1.11': business.addressRoad ?? '',
    'Text1.12': business.addressSubDistrict ?? '',
    'Text1.13': business.addressDistrict ?? '',
    'Text1.14': business.addressProvince ?? '',
    'Text1.16': business.addressPostalCode ?? '',
    'Text2.1': (record.income).toFixed(2),
    'Text2.2': (record.taxWithheld).toFixed(2),
    'Text2.4': (record.taxWithheld).toFixed(2),
    'Text2.26': String(record.month)
  };
  return fillPdfForm(pnd1TemplateUrl, fields);
};

export const exportPnd1 = async (
  record: Pnd1Record,
  employee: Employee,
  business: Business
) => {
  const monthIndex = record.month - 1;
  const bytes = await buildPnd1Bytes(record, business);
  downloadPdf(bytes, `pnd1-${employee.name}-${MONTH_THAI[monthIndex]}-${record.year}.pdf`);
};
