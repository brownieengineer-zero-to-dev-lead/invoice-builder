const ONES = ['', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
const PLACES = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน'];

/** แปลงจำนวนเต็มไม่เกิน 999,999 เป็นคำอ่านภาษาไทย */
const convertGroup = (n: number): string => {
  if (n === 0) return '';
  let result = '';
  let remaining = n;

  for (let place = 5; place >= 0; place--) {
    const divisor = Math.pow(10, place);
    const digit = Math.floor(remaining / divisor);
    remaining %= divisor;

    if (digit === 0) continue;

    if (place === 1 && digit === 2) {
      result += 'ยี่สิบ';
    } else if (place === 0 && digit === 1 && n > 10) {
      // หลักหน่วยเป็น 1 และมีหลักสิบ → เอ็ด
      result += 'เอ็ด';
    } else {
      result += ONES[digit] + PLACES[place];
    }
  }

  return result;
};

/** แปลงจำนวนเต็มบวก (ไม่จำกัด) เป็นคำอ่านภาษาไทย */
const convertInteger = (n: number): string => {
  if (n === 0) return 'ศูนย์';

  const million = Math.floor(n / 1_000_000);
  const remainder = n % 1_000_000;

  const millionPart = million > 0 ? convertInteger(million) + 'ล้าน' : '';
  const remainderPart = convertGroup(remainder);

  return millionPart + remainderPart;
};

/**
 * แปลงจำนวนเงิน (บาท) เป็นคำอ่านภาษาไทย
 * เช่น 151783.32 → "หนึ่งแสนห้าหมื่นหนึ่งพันเจ็ดร้อยแปดสิบสามบาทสามสิบสองสตางค์"
 */
export const bahtToWords = (amount: number): string => {
  if (!isFinite(amount) || amount < 0) return '';

  // ปัดให้มีทศนิยม 2 ตำแหน่งก่อนแยก เพื่อหลีกเลี่ยง floating-point drift
  const fixed = Math.round(amount * 100);
  const baht = Math.floor(fixed / 100);
  const satang = fixed % 100;

  const bahtWords = convertInteger(baht) + 'บาท';
  const satangWords = satang > 0 ? convertGroup(satang) + 'สตางค์' : 'ถ้วน';

  return bahtWords + satangWords;
};
