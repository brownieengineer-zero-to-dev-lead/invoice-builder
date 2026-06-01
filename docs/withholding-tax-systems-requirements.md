# Systems Requirements: ระบบภาษีหัก ณ ที่จ่าย (Withholding Tax System)

---

## 1. Overview

เพิ่ม module ใหม่สำหรับจัดการเอกสารภาษีหัก ณ ที่จ่าย ครอบคลุม 2 กลุ่ม คือ พนักงาน และผู้รับจ้าง โดยต่อยอดจากข้อมูล Business ที่มีอยู่แล้วในระบบ

---

## 2. Master Data

### 2.0 การเปลี่ยนแปลง `businesses` table (ที่มีอยู่แล้ว)

เพิ่ม field ใหม่เพื่อรองรับ PDF generation โดย **ไม่ลบ** `address` (TEXT เดิม) — Invoice เดิมยังใช้ `address` แบบ free-text ได้, PDF form ใช้ breakdown fields

| ฟิลด์ใหม่ | Type | หมายเหตุ |
|---|---|---|
| `code` | string | เลขประจำตัวผู้เสียภาษีอากร → map เป็น `tin1` / `Text1.0` ใน PDF |
| `addressBuilding` | string | อาคาร → `Text1.3` |
| `addressRoomFloor` | string | ห้องเลขที่ / ชั้นที่ → `Text1.4` |
| `addressVillage` | string | หมู่บ้าน → `Text1.6` |
| `addressNo` | string | เลขที่ → `Text1.7` |
| `addressMoo` | string | หมู่ที่ → `Text1.8` |
| `addressSoi` | string | ตรอก/ซอย → `Text1.9` |
| `addressRoad` | string | ถนน → `Text1.11` |
| `addressSubDistrict` | string | ตำบล/แขวง → `Text1.12` |
| `addressDistrict` | string | อำเภอ/เขต → `Text1.13` |
| `addressProvince` | string | จังหวัด → `Text1.14` |
| `addressPostalCode` | string | รหัสไปรษณีย์ → `Text1.16` |

> **Invoice เดิม:** เมื่อ render ที่อยู่ใน Invoice ให้นำ breakdown fields มาต่อกันเป็น string เดียว (ถ้ามี) มิฉะนั้น fallback ไปที่ `address`

---

### 2.1 Employee (entity ใหม่)

| ฟิลด์ | Type | Required | หมายเหตุ |
|---|---|---|---|
| `name` | string | yes | ชื่อ-สกุล |
| `taxId` | string | yes | เลขบัตรประชาชน / เลขผู้เสียภาษี |
| `addressBuilding` | string | no | อาคาร |
| `addressRoomFloor` | string | no | ห้องเลขที่ / ชั้นที่ |
| `addressVillage` | string | no | หมู่บ้าน |
| `addressNo` | string | no | เลขที่ |
| `addressMoo` | string | no | หมู่ที่ |
| `addressSoi` | string | no | ตรอก/ซอย |
| `addressRoad` | string | no | ถนน |
| `addressSubDistrict` | string | no | ตำบล/แขวง |
| `addressDistrict` | string | no | อำเภอ/เขต |
| `addressProvince` | string | no | จังหวัด |
| `addressPostalCode` | string | no | รหัสไปรษณีย์ |
| `baseSalary` | number | no | เงินเดือนตั้งต้น — ใช้เป็น default ใน ภ.ง.ด.1 |

### 2.2 ผู้รับจ้าง (entity ใหม่ — แยกจาก Client)

| ฟิลด์ | Type | Required | หมายเหตุ |
|---|---|---|---|
| `type` | enum | yes | บุคคลธรรมดา / นิติบุคคล |
| `name` | string | yes | ชื่อ / ชื่อบริษัท |
| `taxId` | string | yes | เลขบัตรประชาชน / เลขทะเบียนนิติบุคคล (ขึ้นกับประเภท) |
| `addressBuilding` | string | no | อาคาร |
| `addressRoomFloor` | string | no | ห้องเลขที่ / ชั้นที่ |
| `addressVillage` | string | no | หมู่บ้าน |
| `addressNo` | string | no | เลขที่ |
| `addressMoo` | string | no | หมู่ที่ |
| `addressSoi` | string | no | ตรอก/ซอย |
| `addressRoad` | string | no | ถนน |
| `addressSubDistrict` | string | no | ตำบล/แขวง |
| `addressDistrict` | string | no | อำเภอ/เขต |
| `addressProvince` | string | no | จังหวัด |
| `addressPostalCode` | string | no | รหัสไปรษณีย์ |

---

## 3. Feature 1 — ภ.ง.ด.1

### 3.1 วัตถุประสงค์
บันทึกการจ่ายเงินเดือนและภาษีที่หักต่อพนักงานรายเดือน เพื่อใช้ยื่นกรมสรรพากรและออก 50 ทวิ

### 3.2 Data Model

| ฟิลด์ | Type | Required | หมายเหตุ |
|---|---|---|---|
| เดือน / ปี | date | yes | |
| employeeId | FK → Employee | yes | |
| เงินได้ | number | yes | default = เงินเดือนตั้งต้น |
| ภาษีที่หัก | number | yes | คำนวณอัตโนมัติ แก้ได้ |

### 3.3 Business Rules
- 1 พนักงาน ต่อ 1 เดือน มีได้ 1 record เท่านั้น
- ถ้าเดือนนั้นมี record อยู่แล้ว → แจ้งเตือนก่อน edit
- เงินได้ครอบคลุมทุกประเภท (เงินเดือน / โบนัส / OT) รวมเป็นตัวเลขเดียว

---

## 4. Feature 2 — 50 ทวิ (พนักงาน)

### 4.1 วัตถุประสงค์
ออกหนังสือรับรองการหักภาษี ณ ที่จ่ายให้พนักงานรายปี

### 4.2 Data Model

| ฟิลด์ | Type | Required | หมายเหตุ |
|---|---|---|---|
| ปีภาษี | year | yes | |
| employeeId | FK → Employee | yes | |
| รายการเงินได้ | array | yes | ดึงจาก ภ.ง.ด.1 แก้ / เพิ่ม manual ได้ |
| เงินได้รวม | number | yes | คำนวณอัตโนมัติ |
| ภาษีที่หักรวม | number | yes | คำนวณอัตโนมัติ |
| วิธีนำส่ง | enum | yes | หัก ณ ที่จ่าย / ออกให้ตลอดไป / ออกให้ครั้งเดียว |
| issuedDate | date | yes | วันที่ออกหนังสือรับรอง → `date_pay`, `month_pay`, `year_pay` |
| bookNo | string | no | เล่มที่ → `book_no` |
| runNo | string | no | เลขที่เอกสาร → `run_no` |

### 4.3 Business Rules
- 1 พนักงาน ต่อ 1 ปีภาษี มีได้ 1 record
- ถ้า ภ.ง.ด.1 ไม่ครบ 12 เดือน → แจ้งเตือน แต่ยังสร้างได้
- เพิ่มรายการ manual ได้กรณีมีเงินได้พิเศษนอกระบบ

---

## 5. Feature 3 — ธุรกรรม (ผู้รับจ้าง)

### 5.1 วัตถุประสงค์
บันทึกรายการจ่ายเงินให้ผู้รับจ้างรายครั้ง เป็นข้อมูลหลักสำหรับออก 50 ทวิ และรวมเป็นรายงานภาษีรายเดือน

### 5.2 Data Model

| ฟิลด์ | Type | Required | หมายเหตุ |
|---|---|---|---|
| businessId | FK → Business | yes | |
| วันที่จ่าย | date | yes | |
| contractorId | FK → ผู้รับจ้าง | yes | |
| ประเภท ภ.ง.ด. | enum | yes | auto จาก ประเภทผู้รับจ้าง — บุคคลธรรมดา → ภ.ง.ด.3, นิติบุคคล → ภ.ง.ด.53 |
| ประเภทเงินได้ | enum | yes | ค่าบริการ / ค่าเช่า / ค่าสิทธิ์ / อื่นๆ |
| อัตรา WHT | enum | yes | 1% / 3% / 5% / 15% |
| จำนวนเงินก่อนหัก | number | yes | กรอกเอง หรือดึงจาก Invoice |
| ภาษีที่หัก | number | yes | คำนวณอัตโนมัติ |
| invoiceId | FK → Invoice | no | optional |
| วิธีนำส่ง | enum | yes | หัก ณ ที่จ่าย / ออกให้ตลอดไป / ออกให้ครั้งเดียว |
| issuedDate | date | yes | วันที่ออกหนังสือรับรอง → `date_pay`, `month_pay`, `year_pay` |
| bookNo | string | no | เล่มที่ → `book_no` |
| runNo | string | no | เลขที่เอกสาร → `run_no` |

### 5.3 Business Rules
- ไม่จำกัดจำนวน record ต่อผู้รับจ้างต่อเดือน
- ถ้าเลือก Invoice → autofill จำนวนเงินก่อนหัก แก้ได้

### 5.4 Export — 50 ทวิ (4 ฉบับ)
แต่ละธุรกรรมสามารถ export เอกสาร 50 ทวิ ได้ 4 ฉบับ โดยใช้ template แยกต่างหากต่อฉบับ (field names เหมือนกันทุกไฟล์)

| ฉบับ | Template | สำหรับ |
|---|---|---|
| ฉบับที่ 1 | `tawi-50-contract-1.pdf` | ผู้รับจ้าง (ต้นฉบับ — แนบแบบแสดงรายการภาษี) |
| ฉบับที่ 2 | `tawi-50-contract-2.pdf` | ผู้รับจ้าง (สำเนา — เก็บเป็นหลักฐาน) |
| ฉบับที่ 3 | `tawi-50-contract-3.pdf` | ภายใน (ต้นฉบับ) |
| ฉบับที่ 4 | `tawi-50-contract-4.pdf` | ภายใน (สำเนา) |

- Export ฉบับที่ 1-2 รวมกัน (สำหรับผู้รับจ้าง) → merge 2 PDF เป็น 1 ไฟล์
- Export ฉบับที่ 3-4 รวมกัน (สำหรับภายใน) → merge 2 PDF เป็น 1 ไฟล์

---

## 6. Feature 4 — รายงานภาษี (ผู้รับจ้าง)

### 6.1 วัตถุประสงค์
รวมยอดธุรกรรมทั้งเดือน เพื่อ export เป็นเอกสาร ภ.ง.ด.3 / ภ.ง.ด.53 (เฉพาะหน้า Summary) สำหรับยื่นกรมสรรพากร — รายละเอียด transaction แต่ละรายการบัญชีดูได้จากระบบของกรมสรรพากรโดยตรง

### 6.2 Data Model

ไม่มี record แยก — คำนวณ aggregate จากธุรกรรมตาม filter เดือน / ปี / ประเภท ภ.ง.ด.

| ฟิลด์ | Type | Required | หมายเหตุ |
|---|---|---|---|
| businessId | FK → Business | yes | |
| เดือน / ปี | date | yes | |
| ประเภท ภ.ง.ด. | enum | yes | ภ.ง.ด.3 / ภ.ง.ด.53 |
| ยอดรวมเงินได้ | number | — | คำนวณจากธุรกรรมในเดือนนั้น |
| ยอดรวมภาษีที่หัก | number | — | คำนวณจากธุรกรรมในเดือนนั้น |

### 6.3 Business Rules
- รวมเฉพาะธุรกรรมในเดือน / ปี ที่เลือก
- แยก export ภ.ง.ด.3 และ ภ.ง.ด.53 ออกจากกัน
- Export เฉพาะหน้า Summary — ไม่มีใบแนบรายละเอียด

---

## 7. Data Relationships

```
Employee     →  ภ.ง.ด.1 (1:N)       →  50 ทวิ พนักงาน (1:1 ต่อปี)

ผู้รับจ้าง  →  ธุรกรรม (1:N)       →  export 50 ทวิ 4 ฉบับ (ต่อธุรกรรม)
                    ↓
             รายงานภาษี (รวมรายเดือน) →  export ภ.ง.ด.3 / 53

Invoice      →  ธุรกรรม (optional)
```

---

## 8. Build Order

| Phase | Feature | Dependency |
|---|---|---|
| 1 | Employee module + ภ.ง.ด.1 | — |
| 2 | 50 ทวิ พนักงาน | Phase 1 |
| 3 | ผู้รับจ้าง (master) + ธุรกรรม | — |
| 4 | รายงานภาษี | Phase 3 |

---

## 9. PDF Generation

### 9.1 แนวทาง

ใช้ `pdf-lib` (ติดตั้งอยู่แล้วในโปรเจกต์) โหลด PDF template จาก assets แล้ว **fill ข้อมูลลง AcroForm fields** ที่มีอยู่ในแต่ละ template โดยตรง — ไม่ต้อง draw text หรือ calibrate x, y และ **ไม่กระทบ Invoice PDF เดิม** ที่ใช้ `@react-pdf/renderer`

### 9.2 Template Files

วางไว้ที่ `src/renderer/assets/template-documents/` ✅ พร้อมแล้ว

```
template-documents/
├── tawi-50-employee.pdf      ← 50 ทวิ พนักงาน (81 fields, 1 page)
├── tawi-50-contract-1.pdf    ← 50 ทวิ ผู้รับจ้าง ฉบับที่ 1 (81 fields, 1 page)
├── tawi-50-contract-2.pdf    ← 50 ทวิ ผู้รับจ้าง ฉบับที่ 2 (81 fields, 1 page)
├── tawi-50-contract-3.pdf    ← 50 ทวิ ผู้รับจ้าง ฉบับที่ 3 (81 fields, 1 page)
├── tawi-50-contract-4.pdf    ← 50 ทวิ ผู้รับจ้าง ฉบับที่ 4 (81 fields, 1 page)
├── pnd1.pdf                  ← ภ.ง.ด.1 summary (55 fields, 2 pages)
├── pnd3.pdf                  ← ภ.ง.ด.3 summary (39 fields, 2 pages)
└── pnd53.pdf                 ← ภ.ง.ด.53 summary (39 fields, 2 pages)
```

> ทั้ง 5 ไฟล์ tawi-50 มี field names ชุดเดียวกันทั้งหมด — ใช้ `fillPdfForm` utility เดิมได้โดยไม่ต้องแยก logic

### 9.3 Flow การ Generate PDF

```
1. โหลด PDF template จาก assets
        ↓
2. pdf-lib getForm() → getTextField() / getCheckBox() / getRadioGroup()
        ↓
3. fill ข้อมูลลงแต่ละ field ตาม Field Mapping
        ↓
4. flatten form (ล็อก field ไม่ให้แก้ได้)
        ↓
5. Export เป็น Uint8Array → แสดง Preview / Download
```

### 9.4 Field Mapping — tawi-50 templates (ใช้กับทุกไฟล์ tawi-50-*.pdf)

| Field name | ข้อมูล | แหล่งข้อมูล |
|---|---|---|
| `book_no` | เล่มที่ | `tawi50_employee_records.bookNo` / `wht_transactions.bookNo` |
| `run_no` | เลขที่เอกสาร | `tawi50_employee_records.runNo` / `wht_transactions.runNo` |
| `name1` | ชื่อธุรกิจ | `businesses.name` |
| `id1` | ประเภทธุรกิจ (บุคคล/นิติบุคคล) | hardcode ตามบริบท |
| `tin1` | เลขภาษีธุรกิจ | `businesses.code` |
| `add1` | ที่อยู่ธุรกิจ | นำ `businesses.addressNo` + ซอย + ถนน + ตำบล + อำเภอ + จังหวัด มาต่อกัน |
| `name2` | ชื่อผู้รับเงิน | `employees.name` / `contractors.name` |
| `id1_2` | ประเภทผู้รับเงิน | `contractors.type` / "บุคคล" สำหรับพนักงาน |
| `tin1_2` | เลขภาษีผู้รับเงิน | `employees.taxId` / `contractors.taxId` |
| `add2` | ที่อยู่ผู้รับเงิน | นำ address breakdown fields มาต่อกัน |
| `item` | ลำดับที่ในแบบ | จาก record |
| `chk1`–`chk7` | ประเภทในแบบ | `chk1`=ภ.ง.ด.1ก (พนักงาน), `chk4`=ภ.ง.ด.3, `chk7`=ภ.ง.ด.53 |
| `date1`–`date14.1` | วัน เดือน ปีที่จ่าย (แต่ละแถว) | `pnd1_records.month+year` / `wht_transactions.payDate` |
| `pay1.0`–`pay1.14` | จำนวนเงินที่จ่าย (15 แถว) | รายการเงินได้แต่ละแถว |
| `tax1.0`–`tax1.14` | ภาษีที่หัก (15 แถว) | รายการภาษีแต่ละแถว |
| `rate1` | อัตราอื่นๆ (ระบุ) | `wht_transactions.whtRate` (กรณี "อื่นๆ") |
| `spec1`, `spec3` | ประเภทเงินได้อื่นๆ (ระบุ) | `wht_transactions.incomeType` (กรณี "อื่นๆ") |
| `total` | รวมภาษีที่หักนำส่ง | คำนวณ sum |
| `chk8`–`chk11` | วิธีนำส่ง | `deliveryMethod` (หัก ณ ที่จ่าย / ออกให้ตลอดไป / ออกให้ครั้งเดียว / อื่นๆ) |
| `spec4` | วิธีนำส่งอื่นๆ (ระบุ) | `deliveryMethod` (กรณี "อื่นๆ") |
| `date_pay` | วันที่ออกหนังสือรับรอง | `issuedDate` (day) |
| `month_pay` | เดือนที่ออกหนังสือรับรอง | `issuedDate` (month, ภาษาไทย) |
| `year_pay` | ปีที่ออกหนังสือรับรอง | `issuedDate` (year พ.ศ.) |

### 9.5 Field Mapping — pnd1.pdf / pnd3.pdf / pnd53.pdf

| Field name | ข้อมูล | แหล่งข้อมูล |
|---|---|---|
| `Text1.0` | เลขภาษีธุรกิจ | `businesses.code` |
| `Text1.2` | ชื่อธุรกิจ | `businesses.name` |
| `Text1.3` | อาคาร | `businesses.addressBuilding` |
| `Text1.4` | ห้องเลขที่ / ชั้นที่ | `businesses.addressRoomFloor` |
| `Text1.6` | หมู่บ้าน | `businesses.addressVillage` |
| `Text1.7` | เลขที่ | `businesses.addressNo` |
| `Text1.8` | หมู่ที่ | `businesses.addressMoo` |
| `Text1.9` | ตรอก/ซอย | `businesses.addressSoi` |
| `Text1.11` | ถนน | `businesses.addressRoad` |
| `Text1.12` | ตำบล/แขวง | `businesses.addressSubDistrict` |
| `Text1.13` | อำเภอ/เขต | `businesses.addressDistrict` |
| `Text1.14` | จังหวัด | `businesses.addressProvince` |
| `Text1.16` | รหัสไปรษณีย์ | `businesses.addressPostalCode` |
| `Radio Button` | เดือนที่จ่าย (1–12) | `pnd1_records.month` / `wht_transactions.payDate` (month) |
| `Text2.1` | รวมยอดเงินได้ทั้งสิ้น | sum จากรายการในเดือนนั้น |
| `Text2.2` | รวมยอดภาษีที่นำส่งทั้งสิ้น | sum จากรายการในเดือนนั้น |
| `Text2.3` | เงินเพิ่ม | _ข้ามไว้_ |
| `Text2.4` | รวมยอดภาษี + เงินเพิ่ม | เท่ากับ `Text2.2` (เงินเพิ่ม = 0) |
| `Text2.23` | ลงชื่อผู้จ่ายเงิน | _ข้ามไว้_ |
| `Text2.24` | ตำแหน่ง | _ข้ามไว้_ |
| `Text2.26` | เดือนที่ยื่น | ดึงจากเดือนในข้อมูล (เดือนที่จ่ายเงิน) |

### 9.6 ตัวอย่าง Utility Function

```ts
// src/renderer/shared/utils/pdfFormFiller.ts

import { PDFDocument } from 'pdf-lib'

export async function fillPdfForm(
  templateBytes: ArrayBuffer,
  data: Record<string, string | boolean>,
  checkboxes?: string[]
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(templateBytes)
  const form = pdfDoc.getForm()

  for (const [fieldName, value] of Object.entries(data)) {
    try {
      if (typeof value === 'boolean' || checkboxes?.includes(fieldName)) {
        const cb = form.getCheckBox(fieldName)
        value ? cb.check() : cb.uncheck()
      } else {
        form.getTextField(fieldName).setText(String(value))
      }
    } catch (e) {
      console.warn(`field not found: ${fieldName}`)
    }
  }

  form.flatten() // ล็อก field ไม่ให้แก้ได้หลัง export
  return pdfDoc.save()
}
```

---

## 10. TODO

### Schema
- [x] วาง PDF template ที่ `src/renderer/assets/template-documents/`
- [ ] migrate `businesses` table — เพิ่ม `code` และ address breakdown fields (ไม่ลบ `address` เดิม)
- [ ] สร้าง `employees` table
- [ ] สร้าง `contractors` table
- [ ] สร้าง `pnd1_records` table
- [ ] สร้าง `tawi50_employee_records` table (มี `issuedDate`, `bookNo`, `runNo`)
- [ ] สร้าง `wht_transactions` table (มี `issuedDate`, `bookNo`, `runNo`)

### PDF Generation
- [ ] implement `fillPdfForm` utility
- [ ] implement PDF export สำหรับ 50 ทวิ พนักงาน โดยใช้ `tawi-50-employee.pdf`
- [ ] implement PDF export สำหรับ 50 ทวิ ผู้รับจ้าง ฉบับที่ 1-2 (merge) โดยใช้ `tawi-50-contract-1.pdf` + `tawi-50-contract-2.pdf`
- [ ] implement PDF export สำหรับ 50 ทวิ ผู้รับจ้าง ฉบับที่ 3-4 (merge) โดยใช้ `tawi-50-contract-3.pdf` + `tawi-50-contract-4.pdf`
- [ ] implement PDF export สำหรับ ภ.ง.ด.1 summary โดยใช้ `pnd1.pdf`
- [ ] implement PDF export สำหรับ ภ.ง.ด.3 summary โดยใช้ `pnd3.pdf`
- [ ] implement PDF export สำหรับ ภ.ง.ด.53 summary โดยใช้ `pnd53.pdf`

### UI
- [ ] เพิ่ม form `issuedDate`, `bookNo`, `runNo` ในหน้า 50 ทวิ พนักงาน
- [ ] เพิ่ม form `issuedDate`, `bookNo`, `runNo` ในหน้าธุรกรรม ผู้รับจ้าง (ก่อน export)
- [ ] เพิ่ม address breakdown fields ในหน้าแก้ไขธุรกิจ, พนักงาน, ผู้รับจ้าง
