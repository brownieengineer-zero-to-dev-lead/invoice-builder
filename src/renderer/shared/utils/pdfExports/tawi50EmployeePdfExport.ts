import type { Business } from '../../types/business';
import type { Employee } from '../../types/employee';
import type { Tawi50EmployeeRecord } from '../../types/tawi50EmployeeRecord';
import { downloadPdf, fillPdfForm } from '../pdfFormFiller';
import { bahtToWords } from '../thaiNumberToWords';
import { buildAddress, deliveryMethodCheckField, formatAmount, formatIdCard, formatThaiDate, thaiDateParts } from './pdfExportHelpers';

const FONT_SIZES: Record<string, number> = {
  // id1: 8, id1_2: 8, name2: 9, date1: 11, 'pay1.0': 11, 'tax1.0': 11
};

const TEMPLATE_URL = new URL(
  '../../../assets/template-documents/tawi-50-employee.pdf',
  import.meta.url
).href;

export const buildTawi50Bytes = async (
  record: Tawi50EmployeeRecord,
  employee: Employee,
  business: Business
): Promise<Uint8Array> => {
  const issuedParts = thaiDateParts(record.issuedDate ?? new Date());

  const allIncome = record.incomeItems.reduce((s, i) => s + i.income, 0);
  const allTaxWithheld = record.incomeItems.reduce((s, i) => s + i.taxWithheld, 0);

  const fields = {
    book_no: record.bookNo ?? '',
    run_no: record.runNo ?? '',
    item: record.runNo ?? '',
    name1: business.name,
    id1: formatIdCard(business.code ?? ''),
    add1: (business as Record<string, unknown>).addressNo
      ? buildAddress(business as Parameters<typeof buildAddress>[0])
      : (business as Record<string, unknown>).address as string ?? '',
    name2: employee.name,
    id1_2: formatIdCard(employee.taxId),
    add2: buildAddress(employee),
    chk1: true,
    ...deliveryMethodCheckField(record.deliveryMethod),
    date_pay: issuedParts.day,
    month_pay: issuedParts.month,
    year_pay: issuedParts.year,
    total: bahtToWords(record.totalTax),
    date1: formatThaiDate(record.issuedDate),
    'pay1.0': formatAmount(allIncome - allTaxWithheld),
    'tax1.0': formatAmount(allTaxWithheld)
  };

  return fillPdfForm(TEMPLATE_URL, fields, FONT_SIZES);
};

export const exportTawi50Employee = async (
  record: Tawi50EmployeeRecord,
  employee: Employee,
  business: Business
): Promise<void> => {
  const bytes = await buildTawi50Bytes(record, employee, business);
  downloadPdf(bytes, `tawi50-employee-${employee.name}-${record.taxYear}.pdf`);
};
