import pnd3TemplateUrl from '../../../assets/template-documents/pnd3.pdf';
import pnd53TemplateUrl from '../../../assets/template-documents/pnd53.pdf';
import type { PDFDocument } from 'pdf-lib';
import type { Business } from '../../types/business';
import { fillForm, getUrlFromPDF, loadPDF } from '../pdfFormFiller';
import { formatIdCard } from './pdfExportHelpers';

export interface TaxReportSummary {
  pndType: string;
  month: number;
  year: number;
  count: number;
  totalIncome: number;
  totalTax: number;
}

const MONTH_THAI = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

const buildFields = (summary: TaxReportSummary, business: Business) => ({
  'Text1.0': formatIdCard(business.code ?? ''),
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
  'Text1.15': business.addressPostalCode ?? '',
  'Text2.1': summary.totalIncome.toFixed(2),
  'Text2.2': summary.totalTax.toFixed(2),
  'Text2.4': summary.totalTax.toFixed(2),
  'Radio Button10': [0, 4, 8, 1, 5, 9, 2, 6, 11, 3, 7, 10][summary.month - 1]
});

export const buildPnd3 = async (
  summary: TaxReportSummary,
  business: Business,
): Promise<PDFDocument> => {
  const templateUrl = summary.pndType === 'ภ.ง.ด.3' ? pnd3TemplateUrl : pnd53TemplateUrl;
  const pdf = await loadPDF(templateUrl);
  await fillForm(pdf, buildFields(summary, business));
  return pdf;
};

export const exportPnd3 = async (
  summary: TaxReportSummary,
  business: Business,
): Promise<void> => {
  const pdf = await buildPnd3(summary, business);
  const url = await getUrlFromPDF(pdf, 'export');
  const shortType = summary.pndType === 'ภ.ง.ด.3' ? 'pnd3' : 'pnd53';
  const a = document.createElement('a');
  a.href = url;
  a.download = `${shortType}-${MONTH_THAI[summary.month - 1]}-${summary.year}.pdf`;
  a.click();
};
