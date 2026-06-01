import { ipcMain } from 'electron';
import * as pnd1Service from '../../shared/services/pnd1Records';
import type { DatabaseAdapter } from '../../shared/types/DatabaseAdapter';
import type { Pnd1Record } from '../../shared/types/pnd1Record';

export const initPnd1RecordsHandlers = (db: DatabaseAdapter) => {
  ipcMain.handle(
    'get-all-pnd1-records',
    async (_event, filter?: { employeeId?: number; month?: number; year?: number }) =>
      pnd1Service.getAllPnd1Records(db, filter)
  );
  ipcMain.handle('get-pnd1-record-by-id', async (_event, id: number) =>
    pnd1Service.getPnd1RecordById(db, id)
  );
  ipcMain.handle('add-pnd1-record', async (_event, data: Pnd1Record) =>
    pnd1Service.addPnd1Record(db, data)
  );
  ipcMain.handle('update-pnd1-record', async (_event, data: Pnd1Record) =>
    pnd1Service.updatePnd1Record(db, data)
  );
  ipcMain.handle('delete-pnd1-record', async (_event, id: number) =>
    pnd1Service.deletePnd1Record(db, id)
  );
};
