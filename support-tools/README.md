# Support Tools — Invoice Builder Licensing

เครื่องมือสำหรับทีม Support ในการออก License และยืนยันการถอนสิทธิ์

---

## โครงสร้างไฟล์

```
support-tools/
├── README.md                 ← คู่มือนี้
├── config.js                 ← ค่า config (CANCEL_SECRET, paths)
├── generate-keys.js          ← สร้าง keypair (รันครั้งเดียวตอนติดตั้ง)
├── generate-activation.js    ← ออก Activation Code ให้ลูกค้า
├── verify-cancel.js          ← ยืนยัน Cancel Key และล้างสิทธิ์
├── licenses.txt              ← ฐานข้อมูล License (POC)
└── keys/
    ├── private_key.pem       ← ⚠️ ห้ามแชร์ / ห้าม commit
    └── public_key.pem        ← embed อยู่ในโปรแกรมแล้ว
```

---

## การติดตั้งครั้งแรก

**ต้องการ:** Node.js 18+

```bash
# 1. ติดตั้ง dependencies จาก root project
npm install

# 2. สร้าง keypair (รันครั้งเดียวเท่านั้น)
node support-tools/generate-keys.js
```

> ⚠️ `keys/private_key.pem` ต้องเก็บเป็นความลับ อย่า commit หรือส่งผ่านช่องทางที่ไม่ปลอดภัย  
> Public key ถูก embed อยู่ใน `src/backend/main/license/constants.ts` แล้ว

---

## รูปแบบรหัส

| รหัส | ตัวอย่าง | ความยาว | ใช้งาน |
|------|----------|----------|--------|
| **Request Key** | `ABCDEF-GHIJKL-MNOPQR-STUV23` | 24 ตัว | ลูกค้าส่งมาให้ Support |
| **Serial Number** | `SN-001` | กำหนดเอง | หมายเลข License ที่ออกให้ |
| **Activation Code** | `ABCDEFGH-IJKLMNOP-...` (13 กลุ่ม) | 104 ตัว | Support ส่งกลับให้ลูกค้า |
| **Cancel Key** | `A3F7-B2C1-D4E5-F609` | 19 ตัว | ลูกค้าส่งมาเพื่อโอน License |

---

## Flow การออก License

### 1. ลูกค้าติดต่อขอ Activate

ลูกค้าส่งมาทาง Email:
- **Request Key** (ได้จากหน้า Activation ในโปรแกรม)
- **Serial Number** ที่ต้องการใช้ (ตามที่ซื้อมา)

### 2. ออก Activation Code

```bash
node support-tools/generate-activation.js <requestKey> <serialNumber>
```

**ตัวอย่าง:**
```bash
node support-tools/generate-activation.js ABCDEF-GHIJKL-MNOPQR-STUV23 SN-001
```

**Output:**
```
Activation Code:
AE3E6DHF-ZMYDMIXU-YVY7SV7X-QLPYWCAN-QWDWZGHY-AMYRL2UD-2TBZXSNA-A7EE2CG5-3JSCC22X-KUIOFVOO-X3KBPE5P-5XGXYR5G-N3ZMLHIG

Logged to licenses.txt: SN-001 activated on 2026-06-03
```

### 3. ส่ง Activation Code กลับให้ลูกค้า

copy Activation Code แล้วส่งกลับทาง Email  
ลูกค้านำไปวางในหน้า Activation แล้วกด "เปิดใช้งาน"

---

## Flow การถอนสิทธิ์ (ย้ายเครื่อง)

### 1. ลูกค้ากดถอนสิทธิ์ในโปรแกรม

โปรแกรมจะแสดง **Cancel Key** ให้ลูกค้า Copy

### 2. ลูกค้าส่ง Cancel Key มาให้ Support

ลูกค้าส่งมาทาง Email:
- **Cancel Key**
- **Request Key** (แสดงในหน้า Activation หลังถอนสิทธิ์)

> ℹ️ หลังถอนสิทธิ์ Request Key ของเครื่องนั้นจะเปลี่ยนเป็นรหัสใหม่  
> ให้ใช้ **Request Key เดิม** (ก่อนถอน) ที่ Support มีบันทึกไว้ใน licenses.txt

### 3. ยืนยัน Cancel Key และล้างสิทธิ์

```bash
node support-tools/verify-cancel.js <requestKey> <cancelKey>
```

**ตัวอย่าง:**
```bash
node support-tools/verify-cancel.js ABCDEF-GHIJKL-MNOPQR-STUV23 6831-D9CE-5052-CB6B
```

**Output เมื่อสำเร็จ:**
```
Success: License for ABCDEF-GHIJKL-MNOPQR-STUV23 has been canceled on 2026-06-03
```

**Output เมื่อ Cancel Key ไม่ตรง:**
```
Cancel Key ไม่ตรง — ไม่สามารถถอนสิทธิ์ได้
```

### 4. ออก License ใหม่ให้เครื่องอื่น

หลังจาก verify สำเร็จ Serial Number นั้นพร้อมใช้กับเครื่องใหม่  
ลูกค้าส่ง Request Key ของเครื่องใหม่มา แล้วทำ Step 2–3 ของ Flow การออก License ซ้ำ

---

## licenses.txt

บันทึก License ทุกใบ format:

```
# format: serialNumber | requestKey | status | activatedAt | canceledAt
SN-001 | ABCDEF-GHIJKL-MNOPQR-STUV23 | active   | 2026-06-03 |
SN-001 | ZZZZZZ-ZZZZZZ-ZZZZZZ-ZZZ234 | canceled | 2026-06-01 | 2026-06-02
```

- `status: active` — ใช้งานอยู่
- `status: canceled` — ถอนสิทธิ์แล้ว พร้อมออกให้เครื่องอื่น

---

## ข้อควรระวัง

| ข้อ | รายละเอียด |
|-----|-----------|
| Private key | เก็บใน `keys/private_key.pem` — ห้าม commit, ห้ามส่งทาง Email/Slack |
| Activation Code | ผูกกับ Request Key ของเครื่องนั้นโดยเฉพาะ — ใช้กับเครื่องอื่นไม่ได้ |
| Cancel Key | ใช้ได้ครั้งเดียว — หลัง verify แล้วไม่ต้องเก็บ |
| licenses.txt | เป็น POC — production ควรเปลี่ยนเป็น database |
