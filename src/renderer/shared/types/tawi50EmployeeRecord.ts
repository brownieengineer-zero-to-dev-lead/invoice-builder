export type WhtDeliveryMethod = 'หัก ณ ที่จ่าย' | 'ออกให้ตลอดไป' | 'ออกให้ครั้งเดียว';

export interface Tawi50IncomeItem {
  month: number;
  income: number;
  taxWithheld: number;
}

export interface Tawi50EmployeeRecord {
  id: number;
  employeeId: number;
  taxYear: number;
  incomeItems: Tawi50IncomeItem[];
  totalIncome: number;
  totalTax: number;
  deliveryMethod: WhtDeliveryMethod;
  issuedDate?: string;
  bookNo?: string;
  runNo?: string;
  createdAt: string;
  updatedAt: string;
  employeeName?: string;
}

export interface Tawi50EmployeeRecordAdd {
  employeeId: number;
  taxYear: number;
  incomeItems: Tawi50IncomeItem[];
  totalIncome: number;
  totalTax: number;
  deliveryMethod: WhtDeliveryMethod;
  issuedDate?: string;
  bookNo?: string;
  runNo?: string;
}

export interface Tawi50EmployeeRecordUpdate extends Tawi50EmployeeRecordAdd {
  id: number;
}
