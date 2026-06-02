import type { PDFDocument } from 'pdf-lib';
import type { Business } from '../../types/business';
import type { Contractor } from '../../types/contractor';
import type { WhtTransaction } from '../../types/whtTransaction';
import { fillForm, getUrlFromPDF, loadPDF, mergePdfDocs } from '../pdfFormFiller';
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

const buildWhtTransaction = async (
  transaction: WhtTransaction,
  contractor: Contractor,
  business: Business,
  copies: [1 | 2 | 3 | 4, 1 | 2 | 3 | 4],
  mode: 'preview' | 'export' = 'export',
): Promise<PDFDocument> => {
  const fields = buildFields(transaction, contractor, business);
  const [pdfA, pdfB] = await Promise.all(copies.map(n => loadPDF(getTemplateUrl(n))));
  await Promise.all([fillForm(pdfA, fields, FONT_SIZES), fillForm(pdfB, fields, FONT_SIZES)]);
  // flatten ก่อน merge เพราะ mergePdfDocs copy แค่ page content ไม่ได้ copy AcroForm
  if (mode === 'preview') {
    pdfA.getForm().flatten();
    pdfB.getForm().flatten();
  }
  return mergePdfDocs([pdfA, pdfB]);
};

export const buildWhtTransaction12 = (
  transaction: WhtTransaction, contractor: Contractor, business: Business,
  mode: 'preview' | 'export' = 'export',
) => buildWhtTransaction(transaction, contractor, business, [1, 2], mode);

export const buildWhtTransaction34 = (
  transaction: WhtTransaction, contractor: Contractor, business: Business,
  mode: 'preview' | 'export' = 'export',
) => buildWhtTransaction(transaction, contractor, business, [3, 4], mode);

export const exportTawi50ContractorCopies12 = async (
  transaction: WhtTransaction, contractor: Contractor, business: Business,
): Promise<void> => {
  const pdf = await buildWhtTransaction12(transaction, contractor, business);
  const url = await getUrlFromPDF(pdf, 'export');
  const a = document.createElement('a');
  a.href = url;
  a.download = `tawi50-contractor-${contractor.name}-12.pdf`;
  a.click();
};

export const exportTawi50ContractorCopies34 = async (
  transaction: WhtTransaction, contractor: Contractor, business: Business,
): Promise<void> => {
  const pdf = await buildWhtTransaction34(transaction, contractor, business);
  const url = await getUrlFromPDF(pdf, 'export');
  const a = document.createElement('a');
  a.href = url;
  a.download = `tawi50-contractor-${contractor.name}-34.pdf`;
  a.click();
};
