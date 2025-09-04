# Hướng dẫn chi tiết Database PostgreSQL - Purelight

## 📋 Mục lục
1. [Cài đặt PostgreSQL](#cài-đặt-postgresql)
2. [Tạo Database và User](#tạo-database-và-user)
3. [Setup Database cho Purelight](#setup-database-cho-purelight)
4. [Quản lý dữ liệu](#quản-lý-dữ-liệu)
5. [Backup và Restore](#backup-và-restore)
6. [Monitoring và Performance](#monitoring-và-performance)
7. [Troubleshooting](#troubleshooting)

---

## 🚀 Cài đặt PostgreSQL

### Windows:
```bash
# Tải PostgreSQL từ: https://www.postgresql.org/download/windows/
# Hoặc sử dụng Chocolatey:
choco install postgresql

# Hoặc sử dụng Scoop:
scoop install postgresql
```

### macOS:
```bash
# Sử dụng Homebrew:
brew install postgresql
brew services start postgresql
```

### Ubuntu/Debian:
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

---

## 👤 Tạo Database và User

### 1. Kết nối PostgreSQL:
```bash
# Kết nối với user postgres (superuser)
sudo -u postgres psql

# Hoặc trên Windows:
psql -U postgres
```

### 2. Tạo Database:
```sql
-- Tạo database cho Purelight
CREATE DATABASE purelight_db;

-- Tạo user riêng cho ứng dụng (tùy chọn)
CREATE USER purelight_user WITH PASSWORD 'your_secure_password';

-- Cấp quyền cho user
GRANT ALL PRIVILEGES ON DATABASE purelight_db TO purelight_user;
```

### 3. Kết nối vào database:
```bash
# Kết nối vào database purelight_db
psql -d purelight_db -U postgres

# Hoặc với user riêng:
psql -d purelight_db -U purelight_user
```

---

## 🗄️ Setup Database cho Purelight

### 1. Chạy script tạo bảng:
```bash
# Từ thư mục project
psql -d purelight_db -f database_setup.sql
```

### 2. Kiểm tra bảng đã tạo:
```sql
-- Xem cấu trúc bảng
\d contacts

-- Xem tất cả bảng trong database
\dt

-- Xem thông tin chi tiết
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'contacts';
```

### 3. Cấu hình file .env:
```env
# Database Configuration
DB_USER=postgres
DB_HOST=localhost
DB_NAME=purelight_db
DB_PASSWORD=your_password_here
DB_PORT=5432
```

---

## 📊 Quản lý dữ liệu

### 1. Xem tất cả contacts:
```sql
-- Xem tất cả dữ liệu
SELECT * FROM contacts ORDER BY created_at DESC;

-- Xem với giới hạn
SELECT * FROM contacts ORDER BY created_at DESC LIMIT 10;

-- Đếm tổng số contacts
SELECT COUNT(*) FROM contacts;
```

### 2. Tìm kiếm contacts:
```sql
-- Tìm theo tên
SELECT * FROM contacts WHERE name ILIKE '%john%';

-- Tìm theo email
SELECT * FROM contacts WHERE email = 'john@example.com';

-- Tìm theo ngày
SELECT * FROM contacts WHERE created_at >= '2025-01-01';
```

### 3. Thêm dữ liệu thủ công:
```sql
-- Thêm contact mới
INSERT INTO contacts (name, email, message) 
VALUES ('Test User', 'test@example.com', 'This is a test message');

-- Thêm nhiều contacts cùng lúc
INSERT INTO contacts (name, email, message) VALUES 
('User 1', 'user1@example.com', 'Message 1'),
('User 2', 'user2@example.com', 'Message 2');
```

### 4. Cập nhật dữ liệu:
```sql
-- Cập nhật thông tin contact
UPDATE contacts 
SET message = 'Updated message' 
WHERE id = 1;

-- Cập nhật email
UPDATE contacts 
SET email = 'newemail@example.com' 
WHERE name = 'John Doe';
```

### 5. Xóa dữ liệu:
```sql
-- Xóa contact theo ID
DELETE FROM contacts WHERE id = 1;

-- Xóa contacts cũ hơn 30 ngày
DELETE FROM contacts WHERE created_at < NOW() - INTERVAL '30 days';

-- Xóa tất cả dữ liệu (cẩn thận!)
TRUNCATE TABLE contacts;
```

---

## 💾 Backup và Restore

### 1. Backup Database:
```bash
# Backup toàn bộ database
pg_dump -U postgres -h localhost purelight_db > purelight_backup.sql

# Backup chỉ dữ liệu (không có cấu trúc)
pg_dump -U postgres -h localhost --data-only purelight_db > purelight_data.sql

# Backup với nén
pg_dump -U postgres -h localhost -Fc purelight_db > purelight_backup.dump
```

### 2. Restore Database:
```bash
# Restore từ file SQL
psql -U postgres -d purelight_db < purelight_backup.sql

# Restore từ file dump
pg_restore -U postgres -d purelight_db purelight_backup.dump

# Restore vào database mới
createdb purelight_db_new
psql -U postgres -d purelight_db_new < purelight_backup.sql
```

### 3. Backup tự động (Cron Job):
```bash
# Tạo script backup
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -U postgres purelight_db > /backup/purelight_$DATE.sql
find /backup -name "purelight_*.sql" -mtime +7 -delete

# Thêm vào crontab (backup hàng ngày lúc 2:00 AM)
0 2 * * * /path/to/backup_script.sh
```

---

## 📈 Monitoring và Performance

### 1. Kiểm tra kích thước database:
```sql
-- Kích thước database
SELECT pg_size_pretty(pg_database_size('purelight_db'));

-- Kích thước bảng
SELECT pg_size_pretty(pg_total_relation_size('contacts'));

-- Thống kê bảng
SELECT schemaname, tablename, attname, n_distinct, correlation 
FROM pg_stats WHERE tablename = 'contacts';
```

### 2. Kiểm tra performance:
```sql
-- Xem các query đang chạy
SELECT pid, now() - pg_stat_activity.query_start AS duration, query 
FROM pg_stat_activity 
WHERE (now() - pg_stat_activity.query_start) > interval '5 minutes';

-- Thống kê kết nối
SELECT count(*) as total_connections,
       count(*) FILTER (WHERE state = 'active') as active_connections
FROM pg_stat_activity;
```

### 3. Tối ưu hóa:
```sql
-- Tạo index cho tìm kiếm nhanh
CREATE INDEX idx_contacts_name ON contacts(name);
CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_contacts_created_at ON contacts(created_at);

-- Phân tích bảng để cập nhật thống kê
ANALYZE contacts;

-- Vacuum để dọn dẹp
VACUUM ANALYZE contacts;
```

---

## 🔧 Troubleshooting

### 1. Lỗi kết nối:
```bash
# Kiểm tra PostgreSQL có chạy không
sudo systemctl status postgresql

# Khởi động PostgreSQL
sudo systemctl start postgresql

# Kiểm tra port
netstat -tulpn | grep 5432
```

### 2. Lỗi quyền truy cập:
```sql
-- Cấp quyền cho user
GRANT ALL PRIVILEGES ON DATABASE purelight_db TO your_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_user;
```

### 3. Lỗi bảng không tồn tại:
```sql
-- Kiểm tra bảng có tồn tại không
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'contacts';

-- Tạo lại bảng nếu cần
\i database_setup.sql
```

### 4. Lỗi dữ liệu:
```sql
-- Kiểm tra dữ liệu bị lỗi
SELECT * FROM contacts WHERE name IS NULL OR email IS NULL;

-- Sửa dữ liệu
UPDATE contacts SET name = 'Unknown' WHERE name IS NULL;
```

---

## 🛠️ Công cụ quản lý

### 1. pgAdmin (GUI):
- Tải từ: https://www.pgadmin.org/
- Giao diện web để quản lý database
- Hỗ trợ backup/restore, query editor

### 2. DBeaver (Universal):
- Tải từ: https://dbeaver.io/
- Hỗ trợ nhiều loại database
- Giao diện thân thiện

### 3. Command Line Tools:
```bash
# psql - PostgreSQL command line
psql -d purelight_db -U postgres

# pg_dump - Backup tool
pg_dump -U postgres purelight_db

# pg_restore - Restore tool
pg_restore -U postgres -d purelight_db backup.dump
```

---

## 📝 Best Practices

### 1. Bảo mật:
- Sử dụng password mạnh
- Tạo user riêng cho ứng dụng
- Giới hạn quyền truy cập
- Backup thường xuyên

### 2. Performance:
- Tạo index cho các cột thường tìm kiếm
- Sử dụng LIMIT cho query lớn
- Vacuum và Analyze định kỳ
- Monitor slow queries

### 3. Maintenance:
- Backup hàng ngày
- Kiểm tra log files
- Update PostgreSQL định kỳ
- Monitor disk space

---

## 🚨 Emergency Procedures

### 1. Database bị corrupt:
```bash
# Kiểm tra integrity
psql -d purelight_db -c "VACUUM FULL;"

# Restore từ backup gần nhất
pg_restore -U postgres -d purelight_db latest_backup.dump
```

### 2. Mất dữ liệu:
```bash
# Khôi phục từ backup
psql -U postgres -d purelight_db < backup_file.sql

# Kiểm tra dữ liệu
psql -d purelight_db -c "SELECT COUNT(*) FROM contacts;"
```

### 3. Performance issues:
```sql
-- Kill slow queries
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE query LIKE '%slow_query%';

-- Rebuild indexes
REINDEX TABLE contacts;
```

---

## 📞 Support

Nếu gặp vấn đề, hãy:
1. Kiểm tra log files: `/var/log/postgresql/`
2. Xem documentation: https://www.postgresql.org/docs/
3. Check error messages trong console
4. Backup dữ liệu trước khi thử nghiệm

**Lưu ý:** Luôn backup dữ liệu trước khi thực hiện các thao tác quan trọng!
