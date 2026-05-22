# PreExam System Administrator Manual (V2.2)

คู่มือการดูแลรักษาระบบสำหรับผู้ดูแลระบบ (System Administrator) และ DevOps

## 1. ข้อมูลระบบเบื้องต้น (System Overview)
ระบบ PreExam V2.2 ออกแบบมาให้รองรับผู้ใช้งาน 10,000+ คน โดยใช้สถาปัตยกรรม Microservices บน Docker Container ประกอบด้วย:
- **Web Server**: Nginx (ทำหน้าที่ Load Balancer)
- **API Server**: Node.js (รันหลาย Instance เพื่อรองรับ Load)
- **Real-time Server**: สำหรับ Chat และ Notification
- **Worker Server**: ประมวลผลเบื้องหลัง (ตรวจข้อสอบ)
- **Database**: PostgreSQL (Master-Slave)
- **Cache**: Redis

---

## 2. การเปิด-ปิดระบบ (Start/Stop Server)

**ตำแหน่งไฟล์**: `D:\Project\PreExam\server`

### 2.1 เริ่มต้นระบบ (Start System)
เปิด Terminal (PowerShell หรือ CMD) แล้วรันคำสั่ง:

```bash
cd D:\Project\PreExam\server
docker-compose -f docker-compose.prod.yml up -d
```

> **-d** หมายถึง run ใน background mode (ไม่ต้องเปิดหน้าต่างค้างไว้)

**ตรวจสอบสถานะ:**
```bash
docker-compose -f docker-compose.prod.yml ps
```
ทุก Service ต้องขึ้นสถานะ `Up`

### 2.2 ปิดระบบ (Stop System)
```bash
docker-compose -f docker-compose.prod.yml down
```

### 2.3 รีสตาร์ทระบบ (Restart)
กรณีแก้ไข Config หรือต้องการเริ่มใหม่ทั้งหมด:
```bash
docker-compose -f docker-compose.prod.yml restart
```

---

## 3. การดู Log (Monitoring)

### 3.1 ดู Log แบบ Real-time ผ่าน Terminal
```bash
# ดู Log รวมทุก Service
docker-compose -f docker-compose.prod.yml logs -f

# ดูเฉพาะ API
docker-compose -f docker-compose.prod.yml logs -f api

# ดูเฉพาะ Database
docker-compose -f docker-compose.prod.yml logs -f postgres-master
```

### 3.2 ดูผ่าน Dashboards (Grafana)
เข้าไปที่ Browser พิมพ์ URL: `http://localhost:3002` (หรือ IP Server)
- **User**: admin
- **Password**: admin
- **Dashboard**: เลือก Node Exporter หรือ Docker Monitoring เพื่อดู CPU/RAM Usage

---

## 4. การสำรองข้อมูล (Backup Database)

### 4.1 Backup PostgreSQL (Dump Data)
```bash
# Backup ลงไฟล์ .sql (ตั้งชื่อตามวันที่)
docker exec -t server-postgres-master-1 pg_dumpall -c -U admin > dump_`date +%d-%m-%Y`.sql
```

### 4.2 Restore Database
```bash
docker exec -i server-postgres-master-1 psql -U admin -d preexam_prod < dump_backup.sql
```

---

## 5. การแก้ปัญหาเบื้องต้น (Troubleshooting)

**Q: เว็บเข้าไม่ได้ (502 Bad Gateway)**
A: เช็คว่า Container `api` หรือ `nginx` รันอยู่หรือไม่ ให้ลอง `docker-compose restart nginx`

**Q: Database Locked / ช้ามาก**
A: เช็คว่า Disk เต็มหรือไม่ หรือมีการรัน Query หนักๆ ค้างไว้ ให้ดู Log ที่ Grafana

**Q: Redis เต็ม**
A: รันคำสั่ง `docker exec -it server-redis-1 redis-cli FLUSHALL` เพื่อล้าง Cache (ระวัง Session ผู้ใช้หลุด)
