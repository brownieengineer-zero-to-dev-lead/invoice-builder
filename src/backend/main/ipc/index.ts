import { BrowserWindow, ipcMain, shell } from 'electron';
import type { DatabaseAdapter } from '../../shared/types/DatabaseAdapter';
import { initAutoUpdaterHandlers } from './autoUpdater';
import { initLicenseHandlers } from './license';
// ⚠️  เมื่อเพิ่ม IPC handler ใหม่ อย่าลืม import และเรียกใน initIpcHandler ด้านล่างด้วย
import { initBanksHandlers } from './banks';
import { initBusinessesHandlers } from './businesses';
import { initCategoriesHandlers } from './categories';
import { initClientsHandlers } from './clients';
import { initContractorsHandlers } from './contractors';
import { initCurrenciesHandlers } from './currencies';
import { initEmployeesHandlers } from './employees';
import { initImportExportHandlers } from './importExport';
import { initInvoicesHandlers } from './invoices';
import { initItemsHandlers } from './items';
import { initPnd1RecordsHandlers } from './pnd1Records';
import { initPresetHandlers } from './presets';
import { initSettingsHandlers } from './settings';
import { initStyleProfilesHandlers } from './styleProfiles';
import { initTawi50EmployeeRecordsHandlers } from './tawi50EmployeeRecords';
import { initUnitsHandlers } from './units';
import { initWhtTransactionsHandlers } from './whtTransactions';

export const initIpcHandler = (db: DatabaseAdapter, mainWindow: BrowserWindow) => {
  if (!db) throw new Error('error.databaseNotInitialized');

  ipcMain.handle('open-url', async (_event, url: string) => {
    await shell.openExternal(url);
  });

  initLicenseHandlers();
  initAutoUpdaterHandlers(mainWindow);
  initBusinessesHandlers(db);
  initStyleProfilesHandlers(db);
  initCategoriesHandlers(db);
  initClientsHandlers(db);
  initCurrenciesHandlers(db);
  initImportExportHandlers(db);
  initInvoicesHandlers(db);
  initItemsHandlers(db);
  initSettingsHandlers(db);
  initUnitsHandlers(db);
  initBanksHandlers(db);
  initPresetHandlers(db);
  initEmployeesHandlers(db);
  initContractorsHandlers(db);
  initPnd1RecordsHandlers(db);
  initTawi50EmployeeRecordsHandlers(db);
  initWhtTransactionsHandlers(db);
};
