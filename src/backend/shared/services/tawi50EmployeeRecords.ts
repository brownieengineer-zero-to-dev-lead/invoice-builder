import type { DatabaseAdapter } from '../types/DatabaseAdapter';
import type { Tawi50EmployeeRecord, Tawi50IncomeItem } from '../types/tawi50EmployeeRecord';
import type { Response } from '../types/response';
import { getDefaultValue } from '../utils/dbHelper';
import { mapDatabaseError } from '../utils/errorFunctions';

interface RawRecord extends Omit<Tawi50EmployeeRecord, 'incomeItems'> {
  incomeItems: string;
}

const parseRecord = (row: RawRecord): Tawi50EmployeeRecord => ({
  ...row,
  incomeItems: typeof row.incomeItems === 'string' ? JSON.parse(row.incomeItems) : row.incomeItems
});

export const getAllTawi50EmployeeRecords = async (
  db: DatabaseAdapter,
  filter?: { employeeId?: number; taxYear?: number }
): Promise<Response<Tawi50EmployeeRecord[]>> => {
  try {
    const conditions: string[] = [];
    const params: unknown[] = [];
    if (filter?.employeeId) {
      conditions.push(`t."employeeId" = ?`);
      params.push(filter.employeeId);
    }
    if (filter?.taxYear) {
      conditions.push(`t."taxYear" = ?`);
      params.push(filter.taxYear);
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const sql = `
      SELECT t.*, e."name" AS "employeeName"
      FROM tawi50_employee_records t
      LEFT JOIN employees e ON e."id" = t."employeeId"
      ${where}
      ORDER BY t."taxYear" DESC, t."createdAt" DESC
    `;
    const rows = await db.all<RawRecord>(sql, params);
    return { success: true, data: rows.map(parseRecord) };
  } catch (error) {
    return { success: false, ...mapDatabaseError(error, db.type) };
  }
};

export const getTawi50EmployeeRecordById = async (
  db: DatabaseAdapter,
  id: number
): Promise<Response<Tawi50EmployeeRecord>> => {
  try {
    const row = await db.get<RawRecord>(
      `SELECT t.*, e."name" AS "employeeName"
       FROM tawi50_employee_records t
       LEFT JOIN employees e ON e."id" = t."employeeId"
       WHERE t."id" = ?`,
      [id]
    );
    if (!row) return { success: false, message: 'error.notFound' };
    return { success: true, data: parseRecord(row) };
  } catch (error) {
    return { success: false, ...mapDatabaseError(error, db.type) };
  }
};

const calcTotals = (items: Tawi50IncomeItem[]) => ({
  totalIncome: items.reduce((s, i) => s + i.income, 0),
  totalTax: items.reduce((s, i) => s + i.taxWithheld, 0)
});

export const addTawi50EmployeeRecord = async (
  db: DatabaseAdapter,
  data: Tawi50EmployeeRecord
): Promise<Response<Tawi50EmployeeRecord>> => {
  try {
    const { totalIncome, totalTax } = calcTotals(data.incomeItems);
    const id = await db.run(
      `INSERT INTO tawi50_employee_records
       ("employeeId","taxYear","incomeItems","totalIncome","totalTax","deliveryMethod","issuedDate","bookNo","runNo")
       VALUES (?,?,?,?,?,?,?,?,?)`,
      [
        data.employeeId, data.taxYear,
        JSON.stringify(data.incomeItems),
        totalIncome, totalTax,
        data.deliveryMethod,
        data.issuedDate ?? null,
        data.bookNo ?? null,
        data.runNo ?? null
      ],
      true
    );
    return getTawi50EmployeeRecordById(db, id);
  } catch (error) {
    return { success: false, ...mapDatabaseError(error, db.type) };
  }
};

export const updateTawi50EmployeeRecord = async (
  db: DatabaseAdapter,
  data: Tawi50EmployeeRecord
): Promise<Response<Tawi50EmployeeRecord>> => {
  try {
    const { totalIncome, totalTax } = calcTotals(data.incomeItems);
    await db.run(
      `UPDATE tawi50_employee_records SET
       "employeeId"=?,"taxYear"=?,"incomeItems"=?,"totalIncome"=?,"totalTax"=?,
       "deliveryMethod"=?,"issuedDate"=?,"bookNo"=?,"runNo"=?,
       "updatedAt"=${getDefaultValue("(datetime('now'))", db.type)}
       WHERE "id"=?`,
      [
        data.employeeId, data.taxYear,
        JSON.stringify(data.incomeItems),
        totalIncome, totalTax,
        data.deliveryMethod,
        data.issuedDate ?? null,
        data.bookNo ?? null,
        data.runNo ?? null,
        data.id!
      ]
    );
    return getTawi50EmployeeRecordById(db, data.id!);
  } catch (error) {
    return { success: false, ...mapDatabaseError(error, db.type) };
  }
};

export const deleteTawi50EmployeeRecord = async (
  db: DatabaseAdapter,
  id: number
): Promise<Response<unknown>> => {
  try {
    await db.run(`DELETE FROM tawi50_employee_records WHERE "id" = ?`, [id]);
    return { success: true };
  } catch (error) {
    return { success: false, ...mapDatabaseError(error, db.type) };
  }
};
