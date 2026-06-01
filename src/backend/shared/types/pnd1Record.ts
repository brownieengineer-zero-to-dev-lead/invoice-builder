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
