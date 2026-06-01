import type { DatabaseAdapter } from '../types/DatabaseAdapter';
import type { Response } from '../types/response';
import type { WhtTransaction } from '../types/whtTransaction';
import { getDefaultValue } from '../utils/dbHelper';
import { mapDatabaseError } from '../utils/errorFunctions';

const FIELDS: (keyof WhtTransaction)[] = [
  'businessId',
  'contractorId',
  'invoiceId',
  'payDate',
  'pndType',
  'incomeType',
  'incomeTypeOther',
  'whtRate',
  'amountBeforeTax',
  'taxWithheld',
  'deliveryMethod',
  'issuedDate',
  'bookNo',
  'runNo'
];

const BASE_SQL = `
  SELECT w.*, c."name" AS "contractorName", b."name" AS "businessName"
  FROM wht_transactions w
  LEFT JOIN contractors c ON c."id" = w."contractorId"
  LEFT JOIN businesses b ON b."id" = w."businessId"
`;

export const getAllWhtTransactions = async (
  db: DatabaseAdapter,
  filter?: { contractorId?: number; pndType?: string; month?: number; year?: number }
): Promise<Response<WhtTransaction[]>> => {
  try {
    const conditions: string[] = [];
    const params: unknown[] = [];
    if (filter?.contractorId) {
      conditions.push(`w."contractorId" = ?`);
      params.push(filter.contractorId);
    }
    if (filter?.pndType) {
      conditions.push(`w."pndType" = ?`);
      params.push(filter.pndType);
    }
    if (filter?.month) {
      conditions.push(`CAST(strftime('%m', w."payDate") AS INTEGER) = ?`);
      params.push(filter.month);
    }
    if (filter?.year) {
      conditions.push(`CAST(strftime('%Y', w."payDate") AS INTEGER) = ?`);
      params.push(filter.year);
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const sql = `${BASE_SQL} ${where} ORDER BY w."payDate" DESC, w."createdAt" DESC`;
    const data = await db.all<WhtTransaction>(sql, params);
    return { success: true, data };
  } catch (error) {
    return { success: false, ...mapDatabaseError(error, db.type) };
  }
};

export const getWhtTransactionById = async (
  db: DatabaseAdapter,
  id: number
): Promise<Response<WhtTransaction>> => {
  try {
    const data = await db.get<WhtTransaction>(`${BASE_SQL} WHERE w."id" = ?`, [id]);
    if (!data) return { success: false, message: 'error.notFound' };
    return { success: true, data };
  } catch (error) {
    return { success: false, ...mapDatabaseError(error, db.type) };
  }
};

export const addWhtTransaction = async (
  db: DatabaseAdapter,
  data: WhtTransaction
): Promise<Response<WhtTransaction>> => {
  try {
    const params = FIELDS.map(k => (data[k] ?? null) as unknown);
    const id = await db.run(
      `INSERT INTO wht_transactions (${FIELDS.map(f => `"${String(f)}"`).join(',')})
       VALUES (${FIELDS.map(() => '?').join(',')})`,
      params,
      true
    );
    return getWhtTransactionById(db, id);
  } catch (error) {
    return { success: false, ...mapDatabaseError(error, db.type) };
  }
};

export const updateWhtTransaction = async (
  db: DatabaseAdapter,
  data: WhtTransaction
): Promise<Response<WhtTransaction>> => {
  try {
    const params = FIELDS.map(k => (data[k] ?? null) as unknown);
    const setClause =
      FIELDS.map(f => `"${String(f)}" = ?`).join(', ') +
      `, "updatedAt" = ${getDefaultValue("(datetime('now'))", db.type)}`;
    await db.run(`UPDATE wht_transactions SET ${setClause} WHERE "id" = ?`, [...params, data.id!]);
    return getWhtTransactionById(db, data.id!);
  } catch (error) {
    return { success: false, ...mapDatabaseError(error, db.type) };
  }
};

export const deleteWhtTransaction = async (
  db: DatabaseAdapter,
  id: number
): Promise<Response<unknown>> => {
  try {
    await db.run(`DELETE FROM wht_transactions WHERE "id" = ?`, [id]);
    return { success: true };
  } catch (error) {
    return { success: false, ...mapDatabaseError(error, db.type) };
  }
};

export const getWhtTaxReportSummary = async (
  db: DatabaseAdapter,
  filter: { businessId?: number; month?: number; year?: number; pndType?: string }
): Promise<Response<{ pndType: string; month: number; year: number; count: number; totalIncome: number; totalTax: number }[]>> => {
  try {
    const conditions: string[] = [];
    const params: unknown[] = [];
    if (filter.businessId) {
      conditions.push(`"businessId" = ?`);
      params.push(filter.businessId);
    }
    if (filter.pndType) {
      conditions.push(`"pndType" = ?`);
      params.push(filter.pndType);
    }
    if (filter.month) {
      conditions.push(`CAST(strftime('%m', "payDate") AS INTEGER) = ?`);
      params.push(filter.month);
    }
    if (filter.year) {
      conditions.push(`CAST(strftime('%Y', "payDate") AS INTEGER) = ?`);
      params.push(filter.year);
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const sql = `
      SELECT
        "pndType",
        CAST(strftime('%m', "payDate") AS INTEGER) AS "month",
        CAST(strftime('%Y', "payDate") AS INTEGER) AS "year",
        COUNT(*) AS "count",
        SUM("amountBeforeTax") AS "totalIncome",
        SUM("taxWithheld") AS "totalTax"
      FROM wht_transactions
      ${where}
      GROUP BY "pndType", "year", "month"
      ORDER BY "year" DESC, "month" DESC
    `;
    const data = await db.all(sql, params);
    return { success: true, data: data as never };
  } catch (error) {
    return { success: false, ...mapDatabaseError(error, db.type) };
  }
};
