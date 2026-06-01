import type { DatabaseAdapter } from '../types/DatabaseAdapter';
import type { Pnd1MonthlySummaryRow, Pnd1Record } from '../types/pnd1Record';
import type { Response } from '../types/response';
import { getDefaultValue } from '../utils/dbHelper';
import { mapDatabaseError } from '../utils/errorFunctions';

export const getAllPnd1Records = async (
  db: DatabaseAdapter,
  filter?: { employeeId?: number; month?: number; year?: number }
): Promise<Response<Pnd1Record[]>> => {
  try {
    const conditions: string[] = [];
    const params: unknown[] = [];
    if (filter?.employeeId) {
      conditions.push(`p."employeeId" = ?`);
      params.push(filter.employeeId);
    }
    if (filter?.month) {
      conditions.push(`p."month" = ?`);
      params.push(filter.month);
    }
    if (filter?.year) {
      conditions.push(`p."year" = ?`);
      params.push(filter.year);
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const sql = `
      SELECT p.*, e."name" AS "employeeName"
      FROM pnd1_records p
      LEFT JOIN employees e ON e."id" = p."employeeId"
      ${where}
      ORDER BY p."year" DESC, p."month" DESC
    `;
    const data = await db.all<Pnd1Record>(sql, params);
    return { success: true, data };
  } catch (error) {
    return { success: false, ...mapDatabaseError(error, db.type) };
  }
};

export const getPnd1RecordById = async (
  db: DatabaseAdapter,
  id: number
): Promise<Response<Pnd1Record>> => {
  try {
    const data = await db.get<Pnd1Record>(
      `SELECT p.*, e."name" AS "employeeName"
       FROM pnd1_records p
       LEFT JOIN employees e ON e."id" = p."employeeId"
       WHERE p."id" = ?`,
      [id]
    );
    if (!data) return { success: false, message: 'error.notFound' };
    return { success: true, data };
  } catch (error) {
    return { success: false, ...mapDatabaseError(error, db.type) };
  }
};

export const addPnd1Record = async (
  db: DatabaseAdapter,
  data: Pnd1Record
): Promise<Response<Pnd1Record>> => {
  try {
    const existing = await db.get(
      `SELECT id FROM pnd1_records WHERE "employeeId" = ? AND "month" = ? AND "year" = ?`,
      [data.employeeId, data.month, data.year]
    );
    if (existing) {
      return { success: false, message: 'error.duplicateRecord' };
    }
    const id = await db.run(
      `INSERT INTO pnd1_records ("employeeId","month","year","income","taxWithheld")
       VALUES (?,?,?,?,?)`,
      [data.employeeId, data.month, data.year, data.income, data.taxWithheld],
      true
    );
    return getPnd1RecordById(db, id);
  } catch (error) {
    return { success: false, ...mapDatabaseError(error, db.type) };
  }
};

export const updatePnd1Record = async (
  db: DatabaseAdapter,
  data: Pnd1Record
): Promise<Response<Pnd1Record>> => {
  try {
    await db.run(
      `UPDATE pnd1_records SET "employeeId"=?,"month"=?,"year"=?,"income"=?,"taxWithheld"=?,
       "updatedAt"=${getDefaultValue("(datetime('now'))", db.type)} WHERE "id"=?`,
      [data.employeeId, data.month, data.year, data.income, data.taxWithheld, data.id!]
    );
    return getPnd1RecordById(db, data.id!);
  } catch (error) {
    return { success: false, ...mapDatabaseError(error, db.type) };
  }
};

export const deletePnd1Record = async (
  db: DatabaseAdapter,
  id: number
): Promise<Response<unknown>> => {
  try {
    await db.run(`DELETE FROM pnd1_records WHERE "id" = ?`, [id]);
    return { success: true };
  } catch (error) {
    return { success: false, ...mapDatabaseError(error, db.type) };
  }
};

export interface Pnd1MonthlySummary {
  month: number;
  year: number;
  businessId: number;
  rows: Pnd1MonthlySummaryRow[];
  totalIncome: number;
  totalTax: number;
}

export const getPnd1MonthlySummary = async (
  db: DatabaseAdapter,
  filter: { month: number; year: number; businessId: number }
): Promise<Response<Pnd1MonthlySummary>> => {
  try {
    const rows = await db.all<Pnd1MonthlySummaryRow>(
      `SELECT p.id, p."employeeId", e."name" AS "employeeName", e."taxId",
              p."income", p."taxWithheld"
       FROM pnd1_records p
       JOIN employees e ON e."id" = p."employeeId"
       WHERE p."month" = ? AND p."year" = ? AND e."businessId" = ?
       ORDER BY e."name" ASC`,
      [filter.month, filter.year, filter.businessId]
    );
    const totalIncome = rows.reduce((s, r) => s + r.income, 0);
    const totalTax = rows.reduce((s, r) => s + r.taxWithheld, 0);
    return {
      success: true,
      data: { month: filter.month, year: filter.year, businessId: filter.businessId, rows, totalIncome, totalTax }
    };
  } catch (error) {
    return { success: false, ...mapDatabaseError(error, db.type) };
  }
};
