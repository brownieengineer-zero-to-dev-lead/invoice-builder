import type { DatabaseAdapter } from '../types/DatabaseAdapter';
import { getColumnType, getDefaultValue } from '../utils/dbHelper';
import { mapDatabaseError } from '../utils/errorFunctions';

export const up = async (db: DatabaseAdapter) => {
  try {
    await db.run(
      `CREATE TABLE IF NOT EXISTS pnd1_records (
        "id" ${getColumnType('INTEGER PRIMARY KEY AUTOINCREMENT', db.type)},
        "employeeId" INTEGER NOT NULL,
        "month" INTEGER NOT NULL CHECK ("month" BETWEEN 1 AND 12),
        "year" INTEGER NOT NULL,
        "income" INTEGER NOT NULL DEFAULT 0,
        "taxWithheld" INTEGER NOT NULL DEFAULT 0,
        "createdAt" ${getColumnType('DATETIME', db.type)} NOT NULL DEFAULT ${getDefaultValue("(datetime('now'))", db.type)},
        "updatedAt" ${getColumnType('DATETIME', db.type)} NOT NULL DEFAULT ${getDefaultValue("(datetime('now'))", db.type)},
        FOREIGN KEY ("employeeId") REFERENCES employees("id") ON DELETE CASCADE,
        UNIQUE ("employeeId", "month", "year")
      )`
    );
    await db.run(`CREATE INDEX IF NOT EXISTS idx_pnd1_records_employeeId ON pnd1_records("employeeId")`);
    await db.run(`CREATE INDEX IF NOT EXISTS idx_pnd1_records_year_month ON pnd1_records("year", "month")`);
  } catch (error) {
    return { success: false, ...mapDatabaseError(error, db.type) };
  }
};
