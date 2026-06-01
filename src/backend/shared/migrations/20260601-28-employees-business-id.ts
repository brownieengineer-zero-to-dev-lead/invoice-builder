import type { DatabaseAdapter } from '../types/DatabaseAdapter';
import { mapDatabaseError } from '../utils/errorFunctions';

export const up = async (db: DatabaseAdapter) => {
  try {
    await db.run(`ALTER TABLE employees ADD COLUMN "businessId" INTEGER REFERENCES businesses("id") ON DELETE SET NULL`);
  } catch (error) {
    return { success: false, ...mapDatabaseError(error, db.type) };
  }
};
