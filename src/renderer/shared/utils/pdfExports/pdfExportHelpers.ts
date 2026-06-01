import dayjs from 'dayjs';

const MONTH_FULL_THAI = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

/** วันที่ในรูปแบบ พ.ศ. เช่น "5/7/2568" */
export const formatThaiDate = (date: string | Date | null | undefined): string => {
  const d = dayjs(date ?? undefined);
  if (!d.isValid()) return '';
  return `${d.date()}/${d.month() + 1}/${d.year() + 543}`;
};

/** แยก day / month (ชื่อเดือนเต็ม) / year (พ.ศ.) สำหรับ fill แต่ละ field ใน PDF */
export const thaiDateParts = (
  date: string | Date | null | undefined
): { day: string; month: string; year: string } => {
  const d = dayjs(date ?? undefined);
  if (!d.isValid()) return { day: '', month: '', year: '' };
  return {
    day: String(d.date()),
    month: MONTH_FULL_THAI[d.month()],
    year: String(d.year() + 543)
  };
};

export type AddressEntity = {
  addressBuilding?: string;
  addressRoomFloor?: string;
  addressVillage?: string;
  addressNo?: string;
  addressMoo?: string;
  addressSoi?: string;
  addressRoad?: string;
  addressSubDistrict?: string;
  addressDistrict?: string;
  addressProvince?: string;
  addressPostalCode?: string;
};

export const buildAddress = (entity: AddressEntity): string => {
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

export const formatAmount = (v: number): string =>
  new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(v);

export const formatIdCard = (id: string): string => {
  const cleaned = id.replace(/\D/g, '');
  if (cleaned.length !== 13) return id;
  return cleaned.replace(/^(\d{1})(\d{4})(\d{5})(\d{2})(\d{1})$/, '$1 $2 $3 $4 $5');
};

export const deliveryMethodCheckField = (method: string): Record<string, boolean> => ({
  chk8: method === 'หัก ณ ที่จ่าย',
  chk9: method === 'ออกให้ตลอดไป',
  chk10: method === 'ออกให้ครั้งเดียว',
  chk11: false
});
