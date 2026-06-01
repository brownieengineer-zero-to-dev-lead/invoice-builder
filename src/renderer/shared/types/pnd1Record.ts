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
