import { ipcMain } from 'electron';
import * as contractorsService from '../../shared/services/contractors';
import type { Contractor } from '../../shared/types/contractor';
import type { DatabaseAdapter } from '../../shared/types/DatabaseAdapter';

export const initContractorsHandlers = (db: DatabaseAdapter) => {
  ipcMain.handle('get-all-contractors', async (_event, showArchived?: boolean) =>
    contractorsService.getAllContractors(db, showArchived)
  );
  ipcMain.handle('get-contractor-by-id', async (_event, id: number) =>
    contractorsService.getContractorById(db, id)
  );
  ipcMain.handle('add-contractor', async (_event, data: Contractor) =>
    contractorsService.addContractor(db, data)
  );
  ipcMain.handle('update-contractor', async (_event, data: Contractor) =>
    contractorsService.updateContractor(db, data)
  );
  ipcMain.handle('delete-contractor', async (_event, id: number) =>
    contractorsService.deleteContractor(db, id)
  );
};
