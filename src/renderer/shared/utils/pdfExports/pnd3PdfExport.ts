import pnd3TemplateUrl from '../../../assets/template-documents/pnd3.pdf';
import pnd53TemplateUrl from '../../../assets/template-documents/pnd53.pdf';
import type { Business } from '../../types/business';
import { downloadPdf, fillPdfForm } from '../pdfFormFiller';
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
  'Text1.16': business.addressPostalCode ?? '',
  'Text2.1': summary.totalIncome.toFixed(2),
  'Text2.2': summary.totalTax.toFixed(2),
  'Text2.4': summary.totalTax.toFixed(2),
  // 'Text2.26': String(summary.month),
  'Radio Button10': summary.month - 1
});

export const buildPnd3Bytes = async (
  summary: TaxReportSummary,
  business: Business
): Promise<Uint8Array> => {
  const templateUrl = summary.pndType === 'ภ.ง.ด.3' ? pnd3TemplateUrl : pnd53TemplateUrl;
  return fillPdfForm(templateUrl, buildFields(summary, business));
};

export const exportPnd3 = async (
  summary: TaxReportSummary,
  business: Business
): Promise<void> => {
  const bytes = await buildPnd3Bytes(summary, business);
  const shortType = summary.pndType === 'ภ.ง.ด.3' ? 'pnd3' : 'pnd53';
  const monthLabel = MONTH_THAI[summary.month - 1];
  downloadPdf(bytes, `${shortType}-${monthLabel}-${summary.year}.pdf`);
};
