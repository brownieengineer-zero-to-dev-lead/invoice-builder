import type { EInvoice } from '../renderer/shared/enums/einvoice';
import type { Settings, SettingsUpdate } from '../types/settings';
import type { DatabaseType } from './../enums/databaseType';
import type { DBInitType } from './../enums/dbInitType';
import type { InvoiceType } from './../enums/invoiceType';
import type { Bank, BankAdd, BankUpdate } from './bank';
import type { Business, BusinessAdd, BusinessUpdate } from './business';
import type { Category, CategoryAdd, CategoryUpdate } from './category';
import type { Client, ClientAdd, ClientUpdate } from './client';
import type { Currency, CurrencyAdd, CurrencyUpdate } from './currency';
import type { DBSelector } from './dbSelector';
import type { ExportMeta } from './exportMeta';
import type { FilterData } from './filter';
import type { CustomFieldMeta, Invoice, InvoiceAdd, InvoiceUpdate } from './invoice';
import type { Item, ItemAdd, ItemUpdate } from './item';
import type { PostgresConfig } from './postgresConfig';
import type { Preset, PresetAdd, PresetUpdate } from './preset';
import type { Response } from './response';
import type { StyleProfile, StyleProfileAdd, StyleProfileUpdate } from './styleProfiles';
import type { Unit, UnitAdd, UnitUpdate } from './unit';
import type { ProgressInfo } from './updater';
import type { Employee, EmployeeAdd, EmployeeUpdate } from './employee';
import type { Contractor, ContractorAdd, ContractorUpdate } from './contractor';
import type { Pnd1Record, Pnd1RecordAdd, Pnd1RecordUpdate } from './pnd1Record';
import type { Tawi50EmployeeRecord, Tawi50EmployeeRecordAdd, Tawi50EmployeeRecordUpdate } from './tawi50EmployeeRecord';
import type { WhtTransaction, WhtTransactionAdd, WhtTransactionUpdate } from './whtTransaction';

declare global {
  interface Window {
    electronAPI: {
      ping: () => void;

      getAppVersion: () => Promise<string>;

      checkForUpdates: () => Promise<void>;
      restartApp: () => void;
      onUpdateProgress: (callback: (data: ProgressInfo) => void) => () => void;
      onUpdateAvailable: (callback: () => void) => () => void;
      onUpdateNotAvailable: (callback: () => void) => () => void;
      onUpdateDownloaded: (callback: (version: string) => void) => () => void;

      openUrl: (url: string) => Promise<void>;
      selectDatabase: () => Promise<Response<DBSelector>>;
      openDatabase: () => Promise<Response<DBSelector>>;
      initializeDatabase: (data: {
        postgresConfig?: PostgresConfig;
        dbType: DatabaseType;
        fullPath?: string;
        mode?: DBInitType;
      }) => Promise<Response<unknown>>;
      getDatabaseList: () => Promise<Response<string[]>>;
      testConnection: (data: PostgresConfig) => Promise<Response<unknown>>;

      getAllSettings: () => Promise<Response<Settings>>;
      updateSettings: (data: SettingsUpdate) => Promise<Response<SettingsUpdate>>;

      getAllBusinesses: (filter?: FilterData[]) => Promise<Response<Business[]>>;
      updateBusiness: (data: BusinessUpdate) => Promise<Response<Business>>;
      deleteBusiness: (id: number) => Promise<Response<unknown>>;
      addBusiness: (data: BusinessAdd) => Promise<Response<Business>>;
      addBatchBusiness: (data: BusinessAdd[]) => Promise<Response<Business[]>>;

      getAllStyleProfiles: (filter?: FilterData[]) => Promise<Response<StyleProfile[]>>;
      updateStyleProfile: (data: StyleProfileUpdate) => Promise<Response<StyleProfile>>;
      deleteStyleProfile: (id: number) => Promise<Response<unknown>>;
      addStyleProfile: (data: StyleProfileAdd) => Promise<Response<StyleProfile>>;
      addBatchStyleProfile: (data: StyleProfileAdd[]) => Promise<Response<StyleProfile[]>>;

      getAllClients: (filter?: FilterData[]) => Promise<Response<Client[]>>;
      updateClient: (data: ClientUpdate) => Promise<Response<Client>>;
      deleteClient: (id: number) => Promise<Response<unknown>>;
      addClient: (data: ClientAdd) => Promise<Response<Client>>;
      addBatchClient: (data: ClientAdd[]) => Promise<Response<Client[]>>;

      getAllItems: (filter?: FilterData[]) => Promise<Response<Item[]>>;
      updateItem: (data: ItemUpdate) => Promise<Response<Item>>;
      deleteItem: (id: number) => Promise<Response<unknown>>;
      addItem: (data: ItemAdd) => Promise<Response<Item>>;
      addBatchItem: (data: ItemAdd[]) => Promise<Response<Item[]>>;

      getAllUnits: (filter?: FilterData[]) => Promise<Response<Unit[]>>;
      updateUnit: (data: UnitUpdate) => Promise<Response<Unit>>;
      deleteUnit: (id: number) => Promise<Response<unknown>>;
      addUnit: (data: UnitAdd) => Promise<Response<Unit>>;
      addBatchUnit: (data: UnitAdd[]) => Promise<Response<Unit[]>>;

      getAllCategories: (filter?: FilterData[]) => Promise<Response<Category[]>>;
      updateCategory: (data: CategoryUpdate) => Promise<Response<Category>>;
      deleteCategory: (id: number) => Promise<Response<unknown>>;
      addCategory: (data: CategoryAdd) => Promise<Response<Category>>;
      addBatchCategory: (data: CategoryAdd[]) => Promise<Response<Category[]>>;

      getAllCurrencies: (filter?: FilterData[]) => Promise<Response<Currency[]>>;
      updateCurrency: (data: CurrencyUpdate) => Promise<Response<Currency>>;
      deleteCurrency: (id: number) => Promise<Response<unknown>>;
      addCurrency: (data: CurrencyAdd) => Promise<Response<Currency>>;
      addBatchCurrency: (data: CurrencyAdd[]) => Promise<Response<Currency[]>>;

      getNextSequence: (data: { businessId: number; clientId: number }) => Promise<Response<number | undefined>>;
      getEInvoiceXML: (data: { invoiceId: number; einvoice: EInvoice }) => Promise<Response<Uint8Array | undefined>>;
      getCustomHeaders: (type: InvoiceType) => Promise<Response<CustomFieldMeta[]>>;
      getAllInvoices: (type?: InvoiceType, filter?: FilterData[]) => Promise<Response<Invoice[]>>;
      deleteInvoice: (id: number) => Promise<Response<unknown>>;
      addInvoice: (data: InvoiceAdd) => Promise<Response<Invoice>>;
      updateInvoice: (data: InvoiceUpdate) => Promise<Response<Invoice>>;
      duplicateInvoice: (id: number, invoiceType: InvoiceType) => Promise<Response<Invoice>>;

      getAllBanks: (filter?: FilterData[]) => Promise<Response<Bank[]>>;
      updateBank: (data: BankUpdate) => Promise<Response<Bank>>;
      deleteBank: (id: number) => Promise<Response<unknown>>;
      addBank: (data: BankAdd) => Promise<Response<Bank>>;
      addBatchBank: (data: BankAdd[]) => Promise<Response<Bank[]>>;

      getAllPresets: (filter?: FilterData[]) => Promise<Response<Preset[]>>;
      updatePreset: (data: PresetUpdate) => Promise<Response<Preset>>;
      deletePreset: (id: number) => Promise<Response<unknown>>;
      addPreset: (data: PresetAdd) => Promise<Response<Preset>>;
      addBatchPreset: (data: PresetAdd[]) => Promise<Response<Preset[]>>;

      exportAllData: () => Promise<Response<ExportMeta>>;
      importAllData: () => Promise<Response<unknown>>;

      getAllEmployees: (showArchived?: boolean) => Promise<Response<Employee[]>>;
      getEmployeeById: (id: number) => Promise<Response<Employee>>;
      addEmployee: (data: EmployeeAdd) => Promise<Response<Employee>>;
      updateEmployee: (data: EmployeeUpdate) => Promise<Response<Employee>>;
      deleteEmployee: (id: number) => Promise<Response<unknown>>;

      getAllContractors: (showArchived?: boolean) => Promise<Response<Contractor[]>>;
      getContractorById: (id: number) => Promise<Response<Contractor>>;
      addContractor: (data: ContractorAdd) => Promise<Response<Contractor>>;
      updateContractor: (data: ContractorUpdate) => Promise<Response<Contractor>>;
      deleteContractor: (id: number) => Promise<Response<unknown>>;

      getAllPnd1Records: (filter?: { employeeId?: number; month?: number; year?: number }) => Promise<Response<Pnd1Record[]>>;
      getPnd1RecordById: (id: number) => Promise<Response<Pnd1Record>>;
      addPnd1Record: (data: Pnd1RecordAdd) => Promise<Response<Pnd1Record>>;
      updatePnd1Record: (data: Pnd1RecordUpdate) => Promise<Response<Pnd1Record>>;
      deletePnd1Record: (id: number) => Promise<Response<unknown>>;

      getAllTawi50EmployeeRecords: (filter?: { employeeId?: number; taxYear?: number }) => Promise<Response<Tawi50EmployeeRecord[]>>;
      getTawi50EmployeeRecordById: (id: number) => Promise<Response<Tawi50EmployeeRecord>>;
      addTawi50EmployeeRecord: (data: Tawi50EmployeeRecordAdd) => Promise<Response<Tawi50EmployeeRecord>>;
      updateTawi50EmployeeRecord: (data: Tawi50EmployeeRecordUpdate) => Promise<Response<Tawi50EmployeeRecord>>;
      deleteTawi50EmployeeRecord: (id: number) => Promise<Response<unknown>>;

      getAllWhtTransactions: (filter?: { contractorId?: number; pndType?: string; month?: number; year?: number }) => Promise<Response<WhtTransaction[]>>;
      getWhtTransactionById: (id: number) => Promise<Response<WhtTransaction>>;
      addWhtTransaction: (data: WhtTransactionAdd) => Promise<Response<WhtTransaction>>;
      updateWhtTransaction: (data: WhtTransactionUpdate) => Promise<Response<WhtTransaction>>;
      deleteWhtTransaction: (id: number) => Promise<Response<unknown>>;
      getWhtTaxReportSummary: (filter: { businessId?: number; month?: number; year?: number; pndType?: string }) => Promise<Response<unknown[]>>;
    };
  }
}

export {};
