import type { Contractor } from '../types/contractor';
import type { DatabaseAdapter } from '../types/DatabaseAdapter';
import type { Response } from '../types/response';
import { getDefaultValue } from '../utils/dbHelper';
import { mapDatabaseError } from '../utils/errorFunctions';

const FIELDS: (keyof Contractor)[] = [
  'type',
  'name',
  'taxId',
  'addressBuilding',
  'addressRoomFloor',
  'addressVillage',
  'addressNo',
  'addressMoo',
  'addressSoi',
  'addressRoad',
  'addressSubDistrict',
  'addressDistrict',
  'addressProvince',
  'addressPostalCode',
  'isArchived'
];

export const getAllContractors = async (
  db: DatabaseAdapter,
  showArchived = false
): Promise<Response<Contractor[]>> => {
  try {
    const sql = showArchived
      ? `SELECT * FROM contractors ORDER BY "createdAt" DESC`
      : `SELECT * FROM contractors WHERE "isArchived" = 0 ORDER BY "createdAt" DESC`;
    const data = await db.all<Contractor>(sql);
    return { success: true, data };
  } catch (error) {
    return { success: false, ...mapDatabaseError(error, db.type) };
  }
};

export const getContractorById = async (
  db: DatabaseAdapter,
  id: number
): Promise<Response<Contractor>> => {
  try {
    const data = await db.get<Contractor>(`SELECT * FROM contractors WHERE "id" = ?`, [id]);
    if (!data) return { success: false, message: 'error.notFound' };
    return { success: true, data };
  } catch (error) {
    return { success: false, ...mapDatabaseError(error, db.type) };
  }
};

export const addContractor = async (
  db: DatabaseAdapter,
  data: Contractor
): Promise<Response<Contractor>> => {
  try {
    const params = FIELDS.map(k => (data[k] ?? null) as unknown);
    const id = await db.run(
      `INSERT INTO contractors (${FIELDS.map(f => `"${String(f)}"`).join(',')})
       VALUES (${FIELDS.map(() => '?').join(',')})`,
      params,
      true
    );
    const created = await db.get<Contractor>(`SELECT * FROM contractors WHERE "id" = ?`, [id]);
    return { success: true, data: created! };
  } catch (error) {
    return { success: false, ...mapDatabaseError(error, db.type) };
  }
};

export const updateContractor = async (
  db: DatabaseAdapter,
  data: Contractor
): Promise<Response<Contractor>> => {
  try {
    const params = FIELDS.map(k => (data[k] ?? null) as unknown);
    const setClause =
      FIELDS.map(f => `"${String(f)}" = ?`).join(', ') +
      `, "updatedAt" = ${getDefaultValue("(datetime('now'))", db.type)}`;
    await db.run(`UPDATE contractors SET ${setClause} WHERE "id" = ?`, [...params, data.id!]);
    const updated = await db.get<Contractor>(`SELECT * FROM contractors WHERE "id" = ?`, [data.id!]);
    return { success: true, data: updated! };
  } catch (error) {
    return { success: false, ...mapDatabaseError(error, db.type) };
  }
};

export const deleteContractor = async (
  db: DatabaseAdapter,
  id: number
): Promise<Response<unknown>> => {
  try {
    await db.run(`UPDATE contractors SET "isArchived" = 1 WHERE "id" = ?`, [id]);
    return { success: true };
  } catch (error) {
    return { success: false, ...mapDatabaseError(error, db.type) };
  }
};
