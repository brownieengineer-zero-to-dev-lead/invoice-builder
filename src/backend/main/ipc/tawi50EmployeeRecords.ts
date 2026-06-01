import { ipcMain } from 'electron';
import * as tawi50Service from '../../shared/services/tawi50EmployeeRecords';
import type { DatabaseAdapter } from '../../shared/types/DatabaseAdapter';
import type { Tawi50EmployeeRecord } from '../../shared/types/tawi50EmployeeRecord';

export const initTawi50EmployeeRecordsHandlers = (db: DatabaseAdapter) => {
  ipcMain.handle(
    'get-all-tawi50-employee-records',
    async (_event, filter?: { employeeId?: number; taxYear?: number }) =>
      tawi50Service.getAllTawi50EmployeeRecords(db, filter)
  );
  ipcMain.handle('get-tawi50-employee-record-by-id', async (_event, id: number) =>
    tawi50Service.getTawi50EmployeeRecordById(db, id)
  );
  ipcMain.handle('add-tawi50-employee-record', async (_event, data: Tawi50EmployeeRecord) =>
    tawi50Service.addTawi50EmployeeRecord(db, data)
  );
  ipcMain.handle('update-tawi50-employee-record', async (_event, data: Tawi50EmployeeRecord) =>
    tawi50Service.updateTawi50EmployeeRecord(db, data)
  );
  ipcMain.handle('delete-tawi50-employee-record', async (_event, id: number) =>
    tawi50Service.deleteTawi50EmployeeRecord(db, id)
  );
};
