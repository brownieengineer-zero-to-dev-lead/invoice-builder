import type { DatabaseAdapter } from '../types/DatabaseAdapter';
import { getColumnType, getDefaultValue } from '../utils/dbHelper';
import { mapDatabaseError } from '../utils/errorFunctions';

export const up = async (db: DatabaseAdapter) => {
  try {
    await db.run(
      `CREATE TABLE IF NOT EXISTS wht_transactions (
        "id" ${getColumnType('INTEGER PRIMARY KEY AUTOINCREMENT', db.type)},
        "businessId" INTEGER NOT NULL,
        "contractorId" INTEGER NOT NULL,
        "invoiceId" INTEGER,
        "payDate" ${getColumnType('DATETIME', db.type)} NOT NULL,
        "pndType" TEXT NOT NULL CHECK ("pndType" IN ('ภ.ง.ด.3','ภ.ง.ด.53')),
        "incomeType" TEXT NOT NULL CHECK ("incomeType" IN ('ค่าบริการ','ค่าเช่า','ค่าสิทธิ์','อื่นๆ')),
        "incomeTypeOther" TEXT,
        "whtRate" INTEGER NOT NULL CHECK ("whtRate" IN (1,3,5,15)),
        "amountBeforeTax" INTEGER NOT NULL DEFAULT 0,
        "taxWithheld" INTEGER NOT NULL DEFAULT 0,
        "deliveryMethod" TEXT NOT NULL DEFAULT 'หัก ณ ที่จ่าย' CHECK ("deliveryMethod" IN ('หัก ณ ที่จ่าย','ออกให้ตลอดไป','ออกให้ครั้งเดียว')),
        "issuedDate" ${getColumnType('DATETIME', db.type)},
        "bookNo" TEXT,
        "runNo" TEXT,
        "createdAt" ${getColumnType('DATETIME', db.type)} NOT NULL DEFAULT ${getDefaultValue("(datetime('now'))", db.type)},
        "updatedAt" ${getColumnType('DATETIME', db.type)} NOT NULL DEFAULT ${getDefaultValue("(datetime('now'))", db.type)},
        FOREIGN KEY ("businessId") REFERENCES businesses("id"),
        FOREIGN KEY ("contractorId") REFERENCES contractors("id"),
        FOREIGN KEY ("invoiceId") REFERENCES invoices("id") ON DELETE SET NULL
      )`
    );
    await db.run(
      `CREATE INDEX IF NOT EXISTS idx_wht_transactions_businessId ON wht_transactions("businessId")`
    );
    await db.run(
      `CREATE INDEX IF NOT EXISTS idx_wht_transactions_contractorId ON wht_transactions("contractorId")`
    );
    await db.run(
      `CREATE INDEX IF NOT EXISTS idx_wht_transactions_pndType ON wht_transactions("pndType")`
    );
    await db.run(
      `CREATE INDEX IF NOT EXISTS idx_wht_transactions_payDate ON wht_transactions("payDate")`
    );
  } catch (error) {
    return { success: false, ...mapDatabaseError(error, db.type) };
  }
};
