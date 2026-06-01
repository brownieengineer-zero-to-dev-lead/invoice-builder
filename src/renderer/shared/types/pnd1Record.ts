export interface Pnd1Record {
  id: number;
  employeeId: number;
  month: number;
  year: number;
  income: number;
  taxWithheld: number;
  createdAt: string;
  updatedAt: string;
  employeeName?: string;
}

export interface Pnd1RecordAdd {
  employeeId: number;
  month: number;
  year: number;
  income: number;
  taxWithheld: number;
}

export interface Pnd1RecordUpdate extends Pnd1RecordAdd {
  id: number;
}

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
