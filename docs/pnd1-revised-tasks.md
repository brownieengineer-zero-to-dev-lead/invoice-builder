# Tasks: ปรับ ภ.ง.ด.1 และ 50 ทวิ ตาม Requirement ใหม่

สถานะ: `[ ]` ยังไม่ทำ · `[x]` เสร็จแล้ว · `[-]` ไม่ทำ (deprecated)

---

## ภาพรวม

| สิ่งที่ built แล้ว | ความหมายใหม่ |
|---|---|
| menu "ภ.ง.ด.1" | เปลี่ยนเป็น "รายการเงินเดือน" (Payroll Records) |
| — | สร้าง menu ใหม่ "ภ.ง.ด.1" = สรุปทุกคนรายเดือน |
| 50 ทวิ | ดึงข้อมูลจาก Payroll Records (ไม่เปลี่ยน logic, แค่ชัดขึ้น) |

---

## Task 1 — ปรับชื่อ menu "ภ.ง.ด.1" → "รายการเงินเดือน"

เปลี่ยนเฉพาะ label — ไม่แตะ logic, database, หรือ route

- [ ] **1.1** เปลี่ยน sidebar label จาก "ภ.ง.ด.1" → "รายการเงินเดือน"
- [ ] **1.2** เปลี่ยน page title ในหน้า List / Form
- [ ] **1.3** เปลี่ยน i18n key `th.json` (และ `en.json` ถ้ามี)

---

## Task 2 — สร้าง menu ใหม่ "ภ.ง.ด.1" (Monthly Summary)

ภ.ง.ด.1 ไม่มี record แยก — เป็น view ที่ aggregate จาก Payroll Records

### 2.1 Backend / IPC

- [ ] **2.1.1** สร้าง IPC handler `pnd1Summary.getByMonthYear`
  - รับ: `businessId`, `month`, `year`
  - query: ดึง Payroll Records ทุก record ของ month/year นั้น + join ข้อมูล employee (ชื่อ, taxId)
  - คืนค่า: `{ employees: [{ name, taxId, income, taxWithheld }], totalIncome, totalTax, count }`
- [ ] **2.1.2** สร้าง IPC handler `pnd1Summary.getAvailableMonths`
  - คืน list เดือน/ปีที่มี Payroll Records อยู่ (เพื่อใช้ใน filter dropdown)

### 2.2 UI

- [ ] **2.2.1** เพิ่ม route `/pnd1-summary` และ sidebar menu "ภ.ง.ด.1" ใต้ group "พนักงาน" (ต่อจาก "รายการเงินเดือน")
- [ ] **2.2.2** สร้าง page หลัก
  - filter bar: ธุรกิจ / เดือน / ปี
  - ถ้ายังไม่เลือกเดือน → แสดง placeholder "เลือกเดือนเพื่อดูข้อมูล"
- [ ] **2.2.3** แสดงตารางพนักงานเมื่อเลือกเดือนแล้ว
  - คอลัมน์: ลำดับ / ชื่อ-สกุล / เลขผู้เสียภาษี / เงินได้ / ภาษีที่หัก
  - แถวท้าย: **ยอดรวม** (จำนวนพนักงาน / รวมเงินได้ / รวมภาษีที่หัก)
- [ ] **2.2.4** warning กรณีพนักงานบางคนไม่มีข้อมูลเดือนนั้น
  - แสดง chip / banner: "พนักงาน X คนยังไม่มีข้อมูลเดือนนี้"
  - ปุ่ม shortcut ไปยัง "รายการเงินเดือน" พร้อม pre-filter เดือนนั้น
- [ ] **2.2.5** ปุ่ม Export PDF (disabled ถ้าไม่มีข้อมูลเลย)

### 2.3 PDF Export — `pnd1.pdf`

- [ ] **2.3.1** map ข้อมูลลง fields ของ `pnd1.pdf`
  - header: ชื่อบริษัท, เลขภาษี, ที่อยู่ ← `businesses`
  - เดือน/ปี ← ที่ผู้ใช้เลือก
  - ตาราง: ชื่อพนักงาน, เลขภาษี, เงินได้, ภาษีที่หัก ← Payroll Records
  - ยอดรวม: จำนวนราย, รวมเงินได้, รวมภาษี
- [ ] **2.3.2** flatten และ export เป็น PDF

---

## Task 3 — ยืนยัน source ข้อมูลของ 50 ทวิ

50 ทวิ อ่านจาก Payroll Records อยู่แล้ว — task นี้แค่ตรวจสอบให้ชัด

- [ ] **3.1** ตรวจสอบ `tawi50Employee.create` ว่า query จาก `pnd1_records` table ถูกต้อง
- [ ] **3.2** ตรวจสอบว่า warning "ข้อมูลไม่ครบ 12 เดือน" ทำงานถูกต้อง
- [ ] **3.3** (ถ้ายังไม่มี) เพิ่มปุ่ม shortcut ใน 50 ทวิ → ลิงก์ไปยัง "รายการเงินเดือน" พร้อม pre-filter ปีนั้น

---

## ลำดับการทำ

```
Task 1 (เปลี่ยนชื่อ)  →  Task 2.1 + 2.2 (page ใหม่)  →  Task 2.3 (PDF)  →  Task 3 (ตรวจ 50 ทวิ)
```

Task 1 ทำได้เลย ไม่มี dependency และ risk ต่ำที่สุด
