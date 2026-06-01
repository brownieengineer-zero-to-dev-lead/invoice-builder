import type { WhtDeliveryMethod } from './tawi50EmployeeRecord';

export type PndType = 'ภ.ง.ด.3' | 'ภ.ง.ด.53';
export type WhtIncomeType = 'ค่าบริการ' | 'ค่าเช่า' | 'ค่าสิทธิ์' | 'อื่นๆ';
export type WhtRate = 1 | 3 | 5 | 15;

export interface WhtTransaction {
  id?: number;
  businessId: number;
  contractorId: number;
  invoiceId?: number;
  payDate: string;
  pndType: PndType;
  incomeType: WhtIncomeType;
  incomeTypeOther?: string;
  whtRate: WhtRate;
  amountBeforeTax: number;
  taxWithheld: number;
  deliveryMethod: WhtDeliveryMethod;
  issuedDate?: string;
  bookNo?: string;
  runNo?: string;
  createdAt: string;
  updatedAt: string;
  contractorName?: string;
  businessName?: string;
}

export type WhtTransactionAdd = Omit<WhtTransaction, 'id' | 'createdAt' | 'updatedAt' | 'contractorName' | 'businessName'>;
export type WhtTransactionUpdate = WhtTransaction & { id: number };
