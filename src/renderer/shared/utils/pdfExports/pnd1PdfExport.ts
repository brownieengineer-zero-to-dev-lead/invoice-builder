import pnd1TemplateUrl from '../../../assets/template-documents/pnd1.pdf';
import type { Business } from '../../types/business';
import type { Pnd1MonthlySummary } from '../../types/pnd1Record';
import { downloadPdf, fillPdfForm } from '../pdfFormFiller';
import { formatAmount, formatIdCard } from './pdfExportHelpers';

const MONTH_THAI = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

export const buildPnd1MonthlySummaryBytes = async (
  summary: Pnd1MonthlySummary,
  business: Business
): Promise<Uint8Array> => {
  const fields = {
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
    'Radio Button0': 0,
    'Radio Button1': summary.month - 1,
    'Text2.1': String(summary.rows.length),
    'Text2.2': formatAmount(summary.totalIncome),
    'Text2.3': formatAmount(summary.totalTax),
    'Text2.4': formatAmount(summary.totalTax),
  };
  return fillPdfForm(pnd1TemplateUrl, fields);
};

export const exportPnd1MonthlySummary = async (
  summary: Pnd1MonthlySummary,
  business: Business
): Promise<void> => {
  const bytes = await buildPnd1MonthlySummaryBytes(summary, business);
  downloadPdf(bytes, `pnd1-${MONTH_THAI[summary.month - 1]}-${summary.year}.pdf`);
};
