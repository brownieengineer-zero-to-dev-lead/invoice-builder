import { ipcMain } from 'electron';
import * as whtService from '../../shared/services/whtTransactions';
import type { DatabaseAdapter } from '../../shared/types/DatabaseAdapter';
import type { WhtTransaction } from '../../shared/types/whtTransaction';

export const initWhtTransactionsHandlers = (db: DatabaseAdapter) => {
  ipcMain.handle(
    'get-all-wht-transactions',
    async (
      _event,
      filter?: { contractorId?: number; pndType?: string; month?: number; year?: number }
    ) => whtService.getAllWhtTransactions(db, filter)
  );
  ipcMain.handle('get-wht-transaction-by-id', async (_event, id: number) =>
    whtService.getWhtTransactionById(db, id)
  );
  ipcMain.handle('add-wht-transaction', async (_event, data: WhtTransaction) =>
    whtService.addWhtTransaction(db, data)
  );
  ipcMain.handle('update-wht-transaction', async (_event, data: WhtTransaction) =>
    whtService.updateWhtTransaction(db, data)
  );
  ipcMain.handle('delete-wht-transaction', async (_event, id: number) =>
    whtService.deleteWhtTransaction(db, id)
  );
  ipcMain.handle(
    'get-wht-tax-report-summary',
    async (
      _event,
      filter: { businessId?: number; month?: number; year?: number; pndType?: string }
    ) => whtService.getWhtTaxReportSummary(db, filter)
  );
};
