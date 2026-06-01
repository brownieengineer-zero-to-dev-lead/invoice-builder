import { contextBridge, ipcRenderer } from 'electron';
import type { DBInitType } from '../renderer/shared/enums/dbInitType';
import type { EInvoice } from '../renderer/shared/enums/einvoice';
import type { InvoiceType } from '../renderer/shared/enums/invoiceType';
import type { Bank, BankAdd, BankUpdate } from '../renderer/shared/types/bank';
import type { BusinessAdd, BusinessUpdate } from '../renderer/shared/types/business';
import type { CategoryAdd, CategoryUpdate } from '../renderer/shared/types/category';
import type { ClientAdd, ClientUpdate } from '../renderer/shared/types/client';
import type { CurrencyAdd, CurrencyUpdate } from '../renderer/shared/types/currency';
import type { FilterData } from '../renderer/shared/types/filter';
import type { InvoiceAdd, InvoiceUpdate } from '../renderer/shared/types/invoice';
import type { ItemAdd, ItemUpdate } from '../renderer/shared/types/item';
import type { PostgresConfig } from '../renderer/shared/types/postgresConfig';
import type { Preset, PresetAdd, PresetUpdate } from '../renderer/shared/types/preset';
import type { SettingsUpdate } from '../renderer/shared/types/settings';
import type { StyleProfile, StyleProfileAdd, StyleProfileUpdate } from '../renderer/shared/types/styleProfiles';
import type { UnitAdd, UnitUpdate } from '../renderer/shared/types/unit';
import type { ProgressInfo } from '../renderer/shared/types/updater';
import type { Employee } from '../renderer/shared/types/employee';
import type { Contractor } from '../renderer/shared/types/contractor';
import type { Pnd1Record } from '../renderer/shared/types/pnd1Record';
import type { Tawi50EmployeeRecord } from '../renderer/shared/types/tawi50EmployeeRecord';
import type { WhtTransaction } from '../renderer/shared/types/whtTransaction';

contextBridge.exposeInMainWorld('electronAPI', {
  ping: () => console.log('pong'),

  getAppVersion: () => ipcRenderer.invoke('get-app-version'),

  checkForUpdates: () => ipcRenderer.send('check-for-updates'),
  restartApp: () => ipcRenderer.send('restart-app'),
  onUpdateProgress: (callback: (data: ProgressInfo) => void) => {
    const listener = (_: Electron.IpcRendererEvent, data: ProgressInfo) => callback(data);
    ipcRenderer.on('update-progress', listener);
    return () => ipcRenderer.removeListener('update-progress', listener);
  },
  onUpdateAvailable: (callback: () => void) => {
    const listener = () => callback();
    ipcRenderer.on('update-available', listener);
    return () => ipcRenderer.removeListener('update-available', listener);
  },
  onUpdateNotAvailable: (callback: () => void) => {
    const listener = () => callback();
    ipcRenderer.on('update-not-available', listener);
    return () => ipcRenderer.removeListener('update-not-available', listener);
  },
  onUpdateDownloaded: (callback: (version: string) => void) => {
    const listener = (_: Electron.IpcRendererEvent, version: string) => callback(version);
    ipcRenderer.on('update-downloaded', listener);
    return () => ipcRenderer.removeListener('update-downloaded', listener);
  },

  testConnection: (data: PostgresConfig) => ipcRenderer.invoke('test-connection', data),
  selectDatabase: () => ipcRenderer.invoke('show-save-db-dialog'),
  openDatabase: () => ipcRenderer.invoke('show-open-db-dialog'),
  initializeDatabase: (data: { fullPath: string; mode?: DBInitType }) => ipcRenderer.invoke('initialize-db', data),
  getDatabaseList: () => console.warn('Not supported for Electron API'),

  openUrl: (url: string) => ipcRenderer.invoke('open-url', url),

  getAllSettings: () => ipcRenderer.invoke('get-all-settings'),
  updateSettings: (data: SettingsUpdate) => ipcRenderer.invoke('update-settings', data),

  getAllBusinesses: (filter?: FilterData[]) => ipcRenderer.invoke('get-all-businesses', filter),
  updateBusiness: (data: BusinessUpdate) => ipcRenderer.invoke('update-business', data),
  deleteBusiness: (id: number) => ipcRenderer.invoke('delete-business', id),
  addBusiness: (data: BusinessAdd) => ipcRenderer.invoke('add-business', data),
  addBatchBusiness: (data: BusinessAdd[]) => ipcRenderer.invoke('batch-add-business', data),

  getAllStyleProfiles: (filter?: FilterData[]) => ipcRenderer.invoke('get-all-styleProfiles', filter),
  updateStyleProfile: (data: StyleProfileUpdate) => ipcRenderer.invoke('update-styleProfile', data),
  deleteStyleProfile: (id: number) => ipcRenderer.invoke('delete-styleProfile', id),
  addStyleProfile: (data: StyleProfileAdd) => ipcRenderer.invoke('add-styleProfile', data),
  addBatchStyleProfile: (data: StyleProfile[]) => ipcRenderer.invoke('batch-add-styleProfile', data),

  getAllClients: (filter?: FilterData[]) => ipcRenderer.invoke('get-all-clients', filter),
  updateClient: (data: ClientUpdate) => ipcRenderer.invoke('update-client', data),
  deleteClient: (id: number) => ipcRenderer.invoke('delete-client', id),
  addClient: (data: ClientAdd) => ipcRenderer.invoke('add-client', data),
  addBatchClient: (data: ClientAdd[]) => ipcRenderer.invoke('batch-add-client', data),

  getAllItems: (filter?: FilterData[]) => ipcRenderer.invoke('get-all-items', filter),
  updateItem: (data: ItemUpdate) => ipcRenderer.invoke('update-item', data),
  deleteItem: (id: number) => ipcRenderer.invoke('delete-item', id),
  addItem: (data: ItemAdd) => ipcRenderer.invoke('add-item', data),
  addBatchItem: (data: ItemAdd[]) => ipcRenderer.invoke('batch-add-item', data),

  getAllUnits: (filter?: FilterData[]) => ipcRenderer.invoke('get-all-units', filter),
  updateUnit: (data: UnitUpdate) => ipcRenderer.invoke('update-unit', data),
  deleteUnit: (id: number) => ipcRenderer.invoke('delete-unit', id),
  addUnit: (data: UnitAdd) => ipcRenderer.invoke('add-unit', data),
  addBatchUnit: (data: UnitAdd[]) => ipcRenderer.invoke('batch-add-unit', data),

  getAllCategories: (filter?: FilterData[]) => ipcRenderer.invoke('get-all-categories', filter),
  updateCategory: (data: CategoryUpdate) => ipcRenderer.invoke('update-category', data),
  deleteCategory: (id: number) => ipcRenderer.invoke('delete-category', id),
  addCategory: (data: CategoryAdd) => ipcRenderer.invoke('add-category', data),
  addBatchCategory: (data: CategoryAdd[]) => ipcRenderer.invoke('batch-add-category', data),

  getAllCurrencies: (filter?: FilterData[]) => ipcRenderer.invoke('get-all-currencies', filter),
  updateCurrency: (data: CurrencyUpdate) => ipcRenderer.invoke('update-currency', data),
  deleteCurrency: (id: number) => ipcRenderer.invoke('delete-currency', id),
  addCurrency: (data: CurrencyAdd) => ipcRenderer.invoke('add-currency', data),
  addBatchCurrency: (data: CurrencyAdd[]) => ipcRenderer.invoke('batch-add-currency', data),

  getNextSequence: (data: { businessId: number; clientId: number }) => ipcRenderer.invoke('get-next-sequence', data),
  getEInvoiceXML: (data: { invoiceId: number; einvoice: EInvoice }) => ipcRenderer.invoke('get-einvoice-xml', data),
  getCustomHeaders: (type: InvoiceType) => ipcRenderer.invoke('get-custom-headers', type),
  getAllInvoices: (type?: InvoiceType, filter?: FilterData[]) => ipcRenderer.invoke('get-all-invoices', type, filter),
  deleteInvoice: (id: number) => ipcRenderer.invoke('delete-invoice', id),
  updateInvoice: (data: InvoiceUpdate) => ipcRenderer.invoke('update-invoice', data),
  addInvoice: (data: InvoiceAdd) => ipcRenderer.invoke('add-invoice', data),
  duplicateInvoice: (id: number, invoiceType: InvoiceType) => ipcRenderer.invoke('duplicate-invoice', id, invoiceType),

  getAllBanks: (filter?: FilterData[]) => ipcRenderer.invoke('get-all-banks', filter),
  updateBank: (data: BankUpdate) => ipcRenderer.invoke('update-bank', data),
  deleteBank: (id: number) => ipcRenderer.invoke('delete-bank', id),
  addBank: (data: BankAdd) => ipcRenderer.invoke('add-bank', data),
  addBatchBank: (data: Bank[]) => ipcRenderer.invoke('batch-add-bank', data),

  getAllPresets: (filter?: FilterData[]) => ipcRenderer.invoke('get-all-presets', filter),
  updatePreset: (data: PresetUpdate) => ipcRenderer.invoke('update-preset', data),
  deletePreset: (id: number) => ipcRenderer.invoke('delete-preset', id),
  addPreset: (data: PresetAdd) => ipcRenderer.invoke('add-preset', data),
  addBatchPreset: (data: Preset[]) => ipcRenderer.invoke('batch-add-preset', data),

  exportAllData: () => ipcRenderer.invoke('export-all-data'),
  importAllData: () => ipcRenderer.invoke('import-all-data'),

  getAllEmployees: (showArchived?: boolean) => ipcRenderer.invoke('get-all-employees', showArchived),
  getEmployeeById: (id: number) => ipcRenderer.invoke('get-employee-by-id', id),
  addEmployee: (data: Employee) => ipcRenderer.invoke('add-employee', data),
  updateEmployee: (data: Employee) => ipcRenderer.invoke('update-employee', data),
  deleteEmployee: (id: number) => ipcRenderer.invoke('delete-employee', id),

  getAllContractors: (showArchived?: boolean) => ipcRenderer.invoke('get-all-contractors', showArchived),
  getContractorById: (id: number) => ipcRenderer.invoke('get-contractor-by-id', id),
  addContractor: (data: Contractor) => ipcRenderer.invoke('add-contractor', data),
  updateContractor: (data: Contractor) => ipcRenderer.invoke('update-contractor', data),
  deleteContractor: (id: number) => ipcRenderer.invoke('delete-contractor', id),

  getAllPnd1Records: (filter?: { employeeId?: number; month?: number; year?: number }) =>
    ipcRenderer.invoke('get-all-pnd1-records', filter),
  getPnd1RecordById: (id: number) => ipcRenderer.invoke('get-pnd1-record-by-id', id),
  addPnd1Record: (data: Pnd1Record) => ipcRenderer.invoke('add-pnd1-record', data),
  updatePnd1Record: (data: Pnd1Record) => ipcRenderer.invoke('update-pnd1-record', data),
  deletePnd1Record: (id: number) => ipcRenderer.invoke('delete-pnd1-record', id),

  getAllTawi50EmployeeRecords: (filter?: { employeeId?: number; taxYear?: number }) =>
    ipcRenderer.invoke('get-all-tawi50-employee-records', filter),
  getTawi50EmployeeRecordById: (id: number) => ipcRenderer.invoke('get-tawi50-employee-record-by-id', id),
  addTawi50EmployeeRecord: (data: Tawi50EmployeeRecord) => ipcRenderer.invoke('add-tawi50-employee-record', data),
  updateTawi50EmployeeRecord: (data: Tawi50EmployeeRecord) => ipcRenderer.invoke('update-tawi50-employee-record', data),
  deleteTawi50EmployeeRecord: (id: number) => ipcRenderer.invoke('delete-tawi50-employee-record', id),

  getAllWhtTransactions: (filter?: { contractorId?: number; pndType?: string; month?: number; year?: number }) =>
    ipcRenderer.invoke('get-all-wht-transactions', filter),
  getWhtTransactionById: (id: number) => ipcRenderer.invoke('get-wht-transaction-by-id', id),
  addWhtTransaction: (data: WhtTransaction) => ipcRenderer.invoke('add-wht-transaction', data),
  updateWhtTransaction: (data: WhtTransaction) => ipcRenderer.invoke('update-wht-transaction', data),
  deleteWhtTransaction: (id: number) => ipcRenderer.invoke('delete-wht-transaction', id),
  getWhtTaxReportSummary: (filter: { businessId?: number; month?: number; year?: number; pndType?: string }) =>
    ipcRenderer.invoke('get-wht-tax-report-summary', filter)
});
