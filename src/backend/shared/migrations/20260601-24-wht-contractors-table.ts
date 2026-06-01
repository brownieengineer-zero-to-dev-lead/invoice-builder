import type { DatabaseAdapter } from '../types/DatabaseAdapter';
import { getColumnType, getDefaultValue } from '../utils/dbHelper';
import { mapDatabaseError } from '../utils/errorFunctions';

export const up = async (db: DatabaseAdapter) => {
  try {
    await db.run(
      `CREATE TABLE IF NOT EXISTS contractors (
        "id" ${getColumnType('INTEGER PRIMARY KEY AUTOINCREMENT', db.type)},
        "type" TEXT NOT NULL CHECK ("type" IN ('บุคคลธรรมดา','นิติบุคคล')),
        "name" TEXT NOT NULL,
        "taxId" TEXT NOT NULL,
        "addressBuilding" TEXT,
        "addressRoomFloor" TEXT,
        "addressVillage" TEXT,
        "addressNo" TEXT,
        "addressMoo" TEXT,
        "addressSoi" TEXT,
        "addressRoad" TEXT,
        "addressSubDistrict" TEXT,
        "addressDistrict" TEXT,
        "addressProvince" TEXT,
        "addressPostalCode" TEXT,
        "isArchived" INTEGER NOT NULL DEFAULT 0 CHECK ("isArchived" IN (0,1)),
        "createdAt" ${getColumnType('DATETIME', db.type)} NOT NULL DEFAULT ${getDefaultValue("(datetime('now'))", db.type)},
        "updatedAt" ${getColumnType('DATETIME', db.type)} NOT NULL DEFAULT ${getDefaultValue("(datetime('now'))", db.type)}
      )`
    );
    await db.run(`CREATE INDEX IF NOT EXISTS idx_contractors_active ON contractors("isArchived")`);
  } catch (error) {
    return { success: false, ...mapDatabaseError(error, db.type) };
  }
};
