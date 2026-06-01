import type { DatabaseAdapter } from '../types/DatabaseAdapter';
import { getColumnType, getDefaultValue } from '../utils/dbHelper';
import { mapDatabaseError } from '../utils/errorFunctions';

export const up = async (db: DatabaseAdapter) => {
  try {
    await db.run(
      `CREATE TABLE IF NOT EXISTS tawi50_employee_records (
        "id" ${getColumnType('INTEGER PRIMARY KEY AUTOINCREMENT', db.type)},
        "employeeId" INTEGER NOT NULL,
        "taxYear" INTEGER NOT NULL,
        "incomeItems" TEXT NOT NULL DEFAULT '[]',
        "totalIncome" INTEGER NOT NULL DEFAULT 0,
        "totalTax" INTEGER NOT NULL DEFAULT 0,
        "deliveryMethod" TEXT NOT NULL DEFAULT 'หัก ณ ที่จ่าย' CHECK ("deliveryMethod" IN ('หัก ณ ที่จ่าย','ออกให้ตลอดไป','ออกให้ครั้งเดียว')),
        "issuedDate" ${getColumnType('DATETIME', db.type)},
        "bookNo" TEXT,
        "runNo" TEXT,
        "createdAt" ${getColumnType('DATETIME', db.type)} NOT NULL DEFAULT ${getDefaultValue("(datetime('now'))", db.type)},
        "updatedAt" ${getColumnType('DATETIME', db.type)} NOT NULL DEFAULT ${getDefaultValue("(datetime('now'))", db.type)},
        FOREIGN KEY ("employeeId") REFERENCES employees("id") ON DELETE CASCADE,
        UNIQUE ("employeeId", "taxYear")
      )`
    );
    await db.run(
      `CREATE INDEX IF NOT EXISTS idx_tawi50_employee_records_employeeId ON tawi50_employee_records("employeeId")`
    );
  } catch (error) {
    return { success: false, ...mapDatabaseError(error, db.type) };
  }
};
