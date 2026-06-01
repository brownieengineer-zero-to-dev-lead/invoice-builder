import pnd1TemplateUrl from '../../../assets/template-documents/pnd1.pdf';
import type { Business } from '../../types/business';
import type { Employee } from '../../types/employee';
import type { Pnd1Record } from '../../types/pnd1Record';
import { downloadPdf, fillPdfForm } from '../pdfFormFiller';
import { formatAmount, formatIdCard } from './pdfExportHelpers';

const MONTH_THAI = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

export const buildPnd1Bytes = async (
  record: Pnd1Record,
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
    'Text2.2': formatAmount(record.income),
    'Text2.3': formatAmount(record.taxWithheld),
  };
  return fillPdfForm(pnd1TemplateUrl, fields);
};

export const exportPnd1 = async (
  record: Pnd1Record,
  employee: Employee,
  business: Business
): Promise<void> => {
  const bytes = await buildPnd1Bytes(record, business);
  downloadPdf(bytes, `pnd1-${employee.name}-${MONTH_THAI[record.month - 1]}-${record.year}.pdf`);
};
