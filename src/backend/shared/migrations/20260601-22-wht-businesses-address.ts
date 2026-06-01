import type { DatabaseAdapter } from '../types/DatabaseAdapter';
import { getTableColumns } from '../utils/dbHelper';
import { mapDatabaseError } from '../utils/errorFunctions';

export const up = async (db: DatabaseAdapter) => {
  try {
    const cols = await getTableColumns(db, 'businesses');
    if (cols.find(c => c.name === 'addressNo')) return;

    const fields = [
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
      'addressPostalCode'
    ];

    for (const field of fields) {
      await db.run(`ALTER TABLE businesses ADD COLUMN "${field}" TEXT`);
    }
  } catch (error) {
    return { success: false, ...mapDatabaseError(error, db.type) };
  }
};
