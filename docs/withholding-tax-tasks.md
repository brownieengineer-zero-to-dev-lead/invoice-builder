# Tasks: ระบบภาษีหัก ณ ที่จ่าย (Withholding Tax System)

สถานะ: `[ ]` ยังไม่ทำ · `[x]` เสร็จแล้ว

---

## Phase 0 — Schema & Migration

### 0.1 แก้ไข `businesses` table
- [ ] เพิ่ม field `code` (เลขประจำตัวผู้เสียภาษี) → ใช้เป็น `tin1` / `Text1.0` ใน PDF
- [ ] เพิ่ม address breakdown fields:
  - `addressBuilding` (อาคาร)
  - `addressRoomFloor` (ห้องเลขที่ / ชั้นที่)
  - `addressVillage` (หมู่บ้าน)
  - `addressNo` (เลขที่)
  - `addressMoo` (หมู่ที่)
  - `addressSoi` (ตรอก/ซอย)
  - `addressRoad` (ถนน)
  - `addressSubDistrict` (ตำบล/แขวง)
  - `addressDistrict` (อำเภอ/เขต)
  - `addressProvince` (จังหวัด)
  - `addressPostalCode` (รหัสไปรษณีย์)
- [ ] **ไม่ลบ** field `address` เดิม — Invoice ยังใช้ free-text อยู่

### 0.2 สร้าง `employees` table
```
id, name, taxId,
addressBuilding, addressRoomFloor, addressVillage, addressNo, addressMoo,
addressSoi, addressRoad, addressSubDistrict, addressDistrict, addressProvince, addressPostalCode,
baseSalary, isArchived, createdAt, updatedAt
```

### 0.3 สร้าง `contractors` table
```
id, type (บุคคลธรรมดา/นิติบุคคล), name, taxId,
addressBuilding, addressRoomFloor, addressVillage, addressNo, addressMoo,
addressSoi, addressRoad, addressSubDistrict, addressDistrict, addressProvince, addressPostalCode,
isArchived, createdAt, updatedAt
```

### 0.4 สร้าง `pnd1_records` table
```
id, employeeId (FK → employees), month, year, income, taxWithheld,
createdAt, updatedAt
UNIQUE (employeeId, month, year)
```

### 0.5 สร้าง `tawi50_employee_records` table
```
id, employeeId (FK → employees), taxYear,
incomeItems (JSON array [{month, income, taxWithheld}]),
totalIncome, totalTax,
deliveryMethod (enum: หัก ณ ที่จ่าย / ออกให้ตลอดไป / ออกให้ครั้งเดียว),
issuedDate, bookNo, runNo,
createdAt, updatedAt
UNIQUE (employeeId, taxYear)
```

### 0.6 สร้าง `wht_transactions` table
```
id, businessId (FK → businesses), contractorId (FK → contractors),
invoiceId (FK → invoices, nullable),
payDate, pndType (enum: ภ.ง.ด.3 / ภ.ง.ด.53),
incomeType (enum: ค่าบริการ / ค่าเช่า / ค่าสิทธิ์ / อื่นๆ),
whtRate (enum: 1 / 3 / 5 / 15),
amountBeforeTax, taxWithheld,
deliveryMethod (enum: หัก ณ ที่จ่าย / ออกให้ตลอดไป / ออกให้ครั้งเดียว),
issuedDate, bookNo, runNo,
createdAt, updatedAt
```

---

## Phase 1 — พนักงาน (Employee Module)

### 1.1 หน้าพนักงาน (Master Data)

**Backend / IPC**
- [ ] `employee.getAll` — list พนักงาน (filter isArchived)
- [ ] `employee.getById`
- [ ] `employee.create`
- [ ] `employee.update`
- [ ] `employee.delete` (soft delete → isArchived)

**UI**
- [ ] หน้า List พนักงาน — ตาราง: ชื่อ-สกุล / เลขผู้เสียภาษี / เงินเดือนตั้งต้น / action (edit/delete)
- [ ] Form เพิ่ม/แก้ไขพนักงาน:
  - ชื่อ-สกุล `*`
  - เลขบัตรประชาชน / เลขผู้เสียภาษี `*`
  - address breakdown fields (อาคาร, ห้องเลขที่/ชั้น, หมู่บ้าน, เลขที่, หมู่, ซอย, ถนน, ตำบล, อำเภอ, จังหวัด, รหัสไปรษณีย์)
  - เงินเดือนตั้งต้น
- [ ] เพิ่ม "พนักงาน" ใต้หมวด "ข้อมูล" ใน Sidebar

### 1.2 หน้า ภ.ง.ด.1

**Backend / IPC**
- [ ] `pnd1.getAll` — list พร้อม filter (employeeId, month, year)
- [ ] `pnd1.getById`
- [ ] `pnd1.create` — validate unique (employeeId, month, year)
- [ ] `pnd1.update`
- [ ] `pnd1.delete`

**Business Logic**
- [ ] ถ้ามี record ของพนักงานคนนี้ในเดือนนี้แล้ว → warning "มีข้อมูลเดือนนี้แล้ว ต้องการแก้ไขหรือไม่?"
- [ ] default `income` = `employee.baseSalary`

**UI**
- [ ] เพิ่ม group "พนักงาน" ใน Sidebar (ระหว่าง "เอกสาร" กับ "เทมเพลต")
- [ ] เพิ่ม menu "ภ.ง.ด.1" ใต้ group "พนักงาน"
- [ ] หน้า List — filter bar: พนักงาน / เดือน / ปี
- [ ] หน้า List — ตาราง: พนักงาน / เดือน / ปี / เงินได้ / ภาษีที่หัก / action (edit/delete/export PDF)
- [ ] Form: เดือน/ปี `*` / พนักงาน dropdown `*` / เงินได้ `*` / ภาษีที่หัก `*` (คำนวณอัตโนมัติ แก้ได้)

---

## Phase 2 — 50 ทวิ พนักงาน

### 2.1 Backend / IPC
- [ ] `tawi50Employee.getAll` — list พร้อม filter (employeeId, taxYear)
- [ ] `tawi50Employee.getById`
- [ ] `tawi50Employee.create` — ดึง incomeItems จาก ภ.ง.ด.1 อัตโนมัติ, validate unique (employeeId, taxYear)
- [ ] `tawi50Employee.update`
- [ ] `tawi50Employee.delete`

**Business Logic**
- [ ] ถ้า ภ.ง.ด.1 ไม่ครบ 12 เดือน → warning "ข้อมูล ภ.ง.ด.1 มีเพียง X เดือน" แต่ยังสร้างได้
- [ ] คำนวณ `totalIncome` และ `totalTax` จาก incomeItems อัตโนมัติ
- [ ] รองรับเพิ่มรายการ manual (เงินได้พิเศษนอกระบบ)

### 2.2 PDF Export — `tawi-50-employee.pdf`
- [ ] implement utility `fillPdfForm` (`src/renderer/shared/utils/pdfFormFiller.ts`)
- [ ] map ข้อมูลลง fields:
  - `book_no`, `run_no` ← `bookNo`, `runNo`
  - `name1`, `tin1`, `add1` ← `businesses`
  - `name2`, `tin1_2`, `add2` ← `employees`
  - `chk1` = checked (ภ.ง.ด.1ก)
  - `date1`–`date12` ← เดือนในแต่ละแถว (ม.ค.–ธ.ค.)
  - `pay1.0`–`pay1.11` ← `income` รายเดือน
  - `tax1.0`–`tax1.11` ← `taxWithheld` รายเดือน
  - `total` ← `totalTax`
  - `chk8`–`chk11` ← `deliveryMethod`
  - `date_pay`, `month_pay`, `year_pay` ← `issuedDate`
- [ ] flatten และ export เป็น PDF

### 2.3 UI
- [ ] เพิ่ม menu "50 ทวิ" ใต้ group "พนักงาน" ใน Sidebar
- [ ] หน้า List — filter bar: พนักงาน / ปีภาษี
- [ ] หน้า List — ตาราง: พนักงาน / ปีภาษี / เงินได้รวม / ภาษีหักรวม / action (edit/delete/export PDF)
- [ ] Form: ปีภาษี / พนักงาน dropdown / วิธีนำส่ง / ตารางรายการเงินได้ (แก้ได้ + เพิ่ม manual) / เงินได้รวม / ภาษีรวม (คำนวณอัตโนมัติ) / **วันที่ออกหนังสือรับรอง** / **เล่มที่** / **เลขที่**

---

## Phase 3 — ผู้รับจ้าง (Contractor Module)

### 3.1 หน้าผู้รับจ้าง (Master Data)

**Backend / IPC**
- [ ] `contractor.getAll`
- [ ] `contractor.getById`
- [ ] `contractor.create`
- [ ] `contractor.update`
- [ ] `contractor.delete` (soft delete)

**UI**
- [ ] หน้า List ผู้รับจ้าง — ตาราง: ชื่อ / ประเภท / เลขผู้เสียภาษี / action (edit/delete)
- [ ] Form เพิ่ม/แก้ไขผู้รับจ้าง:
  - ประเภท `*` (บุคคลธรรมดา / นิติบุคคล)
  - ชื่อ / ชื่อบริษัท `*`
  - เลขบัตรประชาชน / เลขทะเบียนนิติบุคคล `*`
  - address breakdown fields
- [ ] เพิ่ม "ผู้รับจ้าง" ใต้หมวด "ข้อมูล" ใน Sidebar

### 3.2 หน้าธุรกรรม (WHT Transactions)

**Backend / IPC**
- [ ] `whtTransaction.getAll` — filter (contractorId, pndType, month, year)
- [ ] `whtTransaction.getById`
- [ ] `whtTransaction.create`
- [ ] `whtTransaction.update`
- [ ] `whtTransaction.delete`

**Business Logic**
- [ ] auto-set `pndType`: บุคคลธรรมดา → ภ.ง.ด.3, นิติบุคคล → ภ.ง.ด.53
- [ ] คำนวณ `taxWithheld = amountBeforeTax × whtRate / 100` อัตโนมัติ
- [ ] ถ้าเลือก Invoice → autofill `amountBeforeTax` จาก Invoice (แก้ได้)

**UI**
- [ ] เพิ่ม group "ผู้รับจ้าง" ใน Sidebar (ระหว่าง "พนักงาน" กับ "เทมเพลต")
- [ ] เพิ่ม menu "ธุรกรรม" ใต้ group "ผู้รับจ้าง"
- [ ] หน้า List — filter bar: ผู้รับจ้าง / ประเภท (ภ.ง.ด.3/53) / เดือน / ปี
- [ ] หน้า List — ตาราง: ผู้รับจ้าง / ประเภท / วันที่จ่าย / จำนวนเงินก่อนหัก / ภาษีที่หัก / action (edit/delete/export 50 ทวิ)
- [ ] Form: ธุรกิจ `*` / ผู้รับจ้าง `*` / วันที่จ่าย `*` / ประเภทเงินได้ `*` / อัตรา WHT `*` / อ้างอิง Invoice (optional) / จำนวนเงินก่อนหัก `*` / ภาษีที่หัก (auto, แก้ได้) / วิธีนำส่ง `*`

### 3.3 PDF Export — 50 ทวิ ผู้รับจ้าง (4 ฉบับ)
- [ ] map ข้อมูลลง fields (เหมือน tawi-50-employee แต่ใช้ `contractors` แทน `employees`):
  - `chk4` = checked สำหรับ ภ.ง.ด.3 หรือ `chk7` สำหรับ ภ.ง.ด.53
  - `date1` ← `payDate`
  - `pay1.0` ← `amountBeforeTax`
  - `tax1.0` ← `taxWithheld`
  - `spec1` / `spec3` ← `incomeType` (กรณี "อื่นๆ")
  - `rate1` ← `whtRate` (กรณี "อื่นๆ")
  - `date_pay`, `month_pay`, `year_pay` ← `issuedDate`
- [ ] Export ฉบับที่ 1-2 — fill `tawi-50-contract-1.pdf` + `tawi-50-contract-2.pdf` แล้ว merge เป็น 1 ไฟล์
- [ ] Export ฉบับที่ 3-4 — fill `tawi-50-contract-3.pdf` + `tawi-50-contract-4.pdf` แล้ว merge เป็น 1 ไฟล์
- [ ] UI — ปุ่ม "export ฉบับที่ 1-2" และ "export ฉบับที่ 3-4" ในหน้า List และหลัง save
- [ ] เพิ่ม field **วันที่ออกหนังสือรับรอง** / **เล่มที่** / **เลขที่** ใน Form ก่อน export

---

## Phase 4 — รายงานภาษี (Tax Report)

### 4.1 Backend / IPC
- [ ] `taxReport.getSummary` — aggregate `wht_transactions` ตาม businessId / month / year / pndType
  - คืนค่า: ยอดรวมเงินได้, ยอดรวมภาษีที่หัก, จำนวนรายการ

### 4.2 PDF Export — ภ.ง.ด.3 / ภ.ง.ด.53 Summary
- [ ] map ข้อมูลลง `pnd3.pdf` / `pnd53.pdf`:
  - `Text1.0` ← `businesses.code`
  - `Text1.2` ← `businesses.name`
  - `Text1.3`–`Text1.16` ← address breakdown fields
  - `Radio Button` ← เดือน (1–12)
  - `Text2.1` ← รวมยอดเงินได้
  - `Text2.2`, `Text2.4` ← รวมยอดภาษี
  - `Text2.26` ← เดือน (จากข้อมูล)
- [ ] Export ภ.ง.ด.3 และ ภ.ง.ด.53 แยกกัน (เฉพาะหน้า Summary)

### 4.3 UI
- [ ] เพิ่ม menu "รายงานภาษี" ใต้ group "ผู้รับจ้าง" ใน Sidebar
- [ ] หน้า List — filter bar: เดือน / ปี / ประเภท (ภ.ง.ด.3/53)
- [ ] หน้า List — ตาราง: เดือน/ปี / ประเภท / จำนวนรายการ / ยอดรวมเงินได้ / ยอดรวมภาษี / action (ดูรายละเอียด/export PDF)
- [ ] หน้า Detail: ธุรกิจ / เดือน-ปี / ประเภท / ยอดรวม (คำนวณอัตโนมัติ) / ปุ่ม export ภ.ง.ด. PDF

---

## Phase 5 — แก้ไข UI ที่มีอยู่ (Businesses)

- [ ] เพิ่ม field `code` (เลขภาษี) ใน Form แก้ไขธุรกิจ
- [ ] เพิ่ม address breakdown fields ใน Form แก้ไขธุรกิจ
- [ ] เมื่อ render ที่อยู่ใน Invoice: ถ้ามี breakdown fields → ต่อ string, ถ้าไม่มี → ใช้ `address` เดิม

---

## Template Files (พร้อมแล้ว ✅)

| ไฟล์ | ใช้ใน | Fields |
|---|---|---|
| `tawi-50-employee.pdf` | 50 ทวิ พนักงาน | 81 fields |
| `tawi-50-contract-1.pdf` | 50 ทวิ ผู้รับจ้าง ฉบับที่ 1 | 81 fields |
| `tawi-50-contract-2.pdf` | 50 ทวิ ผู้รับจ้าง ฉบับที่ 2 | 81 fields |
| `tawi-50-contract-3.pdf` | 50 ทวิ ผู้รับจ้าง ฉบับที่ 3 | 81 fields |
| `tawi-50-contract-4.pdf` | 50 ทวิ ผู้รับจ้าง ฉบับที่ 4 | 81 fields |
| `pnd1.pdf` | ภ.ง.ด.1 summary | 55 fields, 2 pages |
| `pnd3.pdf` | ภ.ง.ด.3 summary | 39 fields, 2 pages |
| `pnd53.pdf` | ภ.ง.ด.53 summary | 39 fields, 2 pages |
