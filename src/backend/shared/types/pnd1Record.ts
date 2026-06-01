export interface Pnd1Record {
  id?: number;
  employeeId: number;
  month: number;
  year: number;
  income: number;
  taxWithheld: number;
  createdAt: string;
  updatedAt: string;
  employeeName?: string;
}

export type Pnd1RecordAdd = Omit<Pnd1Record, 'id' | 'createdAt' | 'updatedAt' | 'employeeName'>;
export type Pnd1RecordUpdate = Pnd1Record & { id: number };

export interface Pnd1MonthlySummaryRow {
  id: number;
  employeeId: number;
  employeeName: string;
  taxId: string;
  income: number;
  taxWithheld: number;
}

export interface Pnd1MonthlySummary {
  month: number;
  year: number;
  businessId: number;
  rows: Pnd1MonthlySummaryRow[];
  totalIncome: number;
  totalTax: number;
}
