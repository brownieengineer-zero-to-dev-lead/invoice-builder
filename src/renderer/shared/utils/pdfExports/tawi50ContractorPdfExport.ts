import type { Business } from '../../types/business';
import type { Contractor } from '../../types/contractor';
import type { WhtTransaction } from '../../types/whtTransaction';
import { downloadPdf, fillPdfForm, mergePdfs } from '../pdfFormFiller';
import { bahtToWords } from '../thaiNumberToWords';
import { buildAddress, deliveryMethodCheckField, formatAmount, formatIdCard, formatThaiDate, thaiDateParts } from './pdfExportHelpers';

const FONT_SIZES: Record<string, number> = {
  // id1: 8,
  // id1_2: 8,
  // name2: 9,
  // date1: 11,
  // 'pay1.0': 11,
  // 'pay1.14': 11,
  // 'tax1.0': 11,
  // 'tax1.14': 11,
};

const getTemplateUrl = (copy: 1 | 2 | 3 | 4) =>
  new URL(
    `../../../assets/template-documents/tawi-50-contract-${copy}.pdf`,
    import.meta.url
  ).href;

const buildFields = (
  transaction: WhtTransaction,
  contractor: Contractor,
  business: Business
) => {
  const isPnd3 = transaction.pndType === 'ภ.ง.ด.3';
  const issuedParts = thaiDateParts(transaction.issuedDate ?? new Date());

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
    item: transaction.runNo ?? '',
    name1: business.name,
    id1: formatIdCard(business.code ?? ''),
    add1: (business as Record<string, unknown>).addressNo
      ? buildAddress(business as Parameters<typeof buildAddress>[0])
      : (business as Record<string, unknown>).address as string ?? '',
    name2: contractor.name,
    id1_2: formatIdCard(contractor.taxId),
    add2: buildAddress(contractor),
    ...incomeTypeRow,
    date1: formatThaiDate(transaction.payDate),
    'pay1.0': formatAmount(transaction.amountBeforeTax - transaction.taxWithheld),
    'pay1.14': formatAmount(transaction.amountBeforeTax - transaction.taxWithheld),
    'tax1.0': formatAmount(transaction.taxWithheld),
    'tax1.14': formatAmount(transaction.taxWithheld),
    ...deliveryMethodCheckField(transaction.deliveryMethod),
    date_pay: issuedParts.day,
    month_pay: `     ${issuedParts.month}`,
    year_pay: issuedParts.year,
    total: bahtToWords(transaction.taxWithheld)
  };
};

const buildBytes = async (
  transaction: WhtTransaction,
  contractor: Contractor,
  business: Business,
  copies: [1 | 2 | 3 | 4, 1 | 2 | 3 | 4]
): Promise<Uint8Array> => {
  const fields = buildFields(transaction, contractor, business);
  const [bytesA, bytesB] = await Promise.all(
    copies.map(n => fillPdfForm(getTemplateUrl(n), fields, FONT_SIZES))
  );
  return mergePdfs([bytesA, bytesB]);
};

export const buildWhtTransactionBytes12 = (
  transaction: WhtTransaction, contractor: Contractor, business: Business
) => buildBytes(transaction, contractor, business, [1, 2]);

export const buildWhtTransactionBytes34 = (
  transaction: WhtTransaction, contractor: Contractor, business: Business
) => buildBytes(transaction, contractor, business, [3, 4]);

export const exportTawi50ContractorCopies12 = async (
  transaction: WhtTransaction, contractor: Contractor, business: Business
): Promise<void> => {
  const merged = await buildWhtTransactionBytes12(transaction, contractor, business);
  downloadPdf(merged, `tawi50-contractor-${contractor.name}-12.pdf`);
};

export const exportTawi50ContractorCopies34 = async (
  transaction: WhtTransaction, contractor: Contractor, business: Business
): Promise<void> => {
  const merged = await buildWhtTransactionBytes34(transaction, contractor, business);
  downloadPdf(merged, `tawi50-contractor-${contractor.name}-34.pdf`);
};
