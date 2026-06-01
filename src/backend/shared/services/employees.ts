import type { DatabaseAdapter } from '../types/DatabaseAdapter';
import type { Employee } from '../types/employee';
import type { Response } from '../types/response';
import { getDefaultValue } from '../utils/dbHelper';
import { mapDatabaseError } from '../utils/errorFunctions';

const FIELDS: (keyof Employee)[] = [
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
  'baseSalary',
  'isArchived',
  'businessId'
];

export const getAllEmployees = async (
  db: DatabaseAdapter,
  showArchived = false
): Promise<Response<Employee[]>> => {
  try {
    const sql = showArchived
      ? `SELECT * FROM employees ORDER BY "createdAt" DESC`
      : `SELECT * FROM employees WHERE "isArchived" = 0 ORDER BY "createdAt" DESC`;
    const data = await db.all<Employee>(sql);
    return { success: true, data };
  } catch (error) {
    return { success: false, ...mapDatabaseError(error, db.type) };
  }
};

export const getEmployeeById = async (
  db: DatabaseAdapter,
  id: number
): Promise<Response<Employee>> => {
  try {
    const data = await db.get<Employee>(`SELECT * FROM employees WHERE "id" = ?`, [id]);
    if (!data) return { success: false, message: 'error.notFound' };
    return { success: true, data };
  } catch (error) {
    return { success: false, ...mapDatabaseError(error, db.type) };
  }
};

export const addEmployee = async (
  db: DatabaseAdapter,
  data: Employee
): Promise<Response<Employee>> => {
  try {
    const params = FIELDS.map(k => (data[k] ?? null) as unknown);
    const id = await db.run(
      `INSERT INTO employees (${FIELDS.map(f => `"${String(f)}"`).join(',')})
       VALUES (${FIELDS.map(() => '?').join(',')})`,
      params,
      true
    );
    const created = await db.get<Employee>(`SELECT * FROM employees WHERE "id" = ?`, [id]);
    return { success: true, data: created! };
  } catch (error) {
    return { success: false, ...mapDatabaseError(error, db.type) };
  }
};

export const updateEmployee = async (
  db: DatabaseAdapter,
  data: Employee
): Promise<Response<Employee>> => {
  try {
    const params = FIELDS.map(k => (data[k] ?? null) as unknown);
    const setClause =
      FIELDS.map(f => `"${String(f)}" = ?`).join(', ') +
      `, "updatedAt" = ${getDefaultValue("(datetime('now'))", db.type)}`;
    await db.run(`UPDATE employees SET ${setClause} WHERE "id" = ?`, [...params, data.id!]);
    const updated = await db.get<Employee>(`SELECT * FROM employees WHERE "id" = ?`, [data.id!]);
    return { success: true, data: updated! };
  } catch (error) {
    return { success: false, ...mapDatabaseError(error, db.type) };
  }
};

export const deleteEmployee = async (
  db: DatabaseAdapter,
  id: number
): Promise<Response<unknown>> => {
  try {
    await db.run(`UPDATE employees SET "isArchived" = 1 WHERE "id" = ?`, [id]);
    return { success: true };
  } catch (error) {
    return { success: false, ...mapDatabaseError(error, db.type) };
  }
};
