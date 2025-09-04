# 🚀 Quick Start Guide - Purelight Database

## ⚡ Setup nhanh (5 phút)

### 1. Cài đặt PostgreSQL
```bash
# Windows: Tải từ https://www.postgresql.org/download/windows/
# macOS: brew install postgresql
# Ubuntu: sudo apt install postgresql postgresql-contrib
```

### 2. Chạy setup tự động
```bash
# Linux/macOS:
chmod +x setup_database.sh
./setup_database.sh full

# Windows:
setup_database.bat
```

### 3. Cấu hình email
```bash
# Mở file .env và cập nhật:
EMAIL_PASS=your_gmail_app_password_here
```

### 4. Chạy server
```bash
npm install
npm run dev
```

### 5. Test
- Mở: http://localhost:3000/api/health
- Test form trên website

---

## 🛠️ Quản lý Database

### Commands cơ bản:
```bash
# Test kết nối
npm run db:test

# Xem tất cả contacts
npm run db:list

# Tìm kiếm
npm run db:search "john"

# Thống kê
npm run db:stats

# Backup
npm run db:backup

# Thêm dữ liệu mẫu
npm run db:sample
```

### Quản lý trực tiếp với psql:
```bash
# Kết nối database
psql -d purelight_db -U postgres

# Xem tất cả contacts
SELECT * FROM contacts ORDER BY created_at DESC;

# Đếm contacts
SELECT COUNT(*) FROM contacts;

# Tìm kiếm
SELECT * FROM contacts WHERE name ILIKE '%john%';
```

---

## 📊 API Endpoints

### Gửi contact form:
```bash
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com", 
    "message": "Hello, I need photo editing services."
  }'
```

### Xem tất cả contacts:
```bash
curl http://localhost:3000/api/contacts
```

### Health check:
```bash
curl http://localhost:3000/api/health
```

---

## 🔧 Troubleshooting

### Lỗi kết nối database:
```bash
# Kiểm tra PostgreSQL có chạy không
sudo systemctl status postgresql

# Khởi động PostgreSQL
sudo systemctl start postgresql
```

### Lỗi quyền truy cập:
```sql
-- Cấp quyền cho user
GRANT ALL PRIVILEGES ON DATABASE purelight_db TO your_user;
```

### Lỗi email:
- Kiểm tra Gmail App Password
- Đảm bảo 2FA đã bật
- Kiểm tra EMAIL_PASS trong .env

---

## 📁 Cấu trúc files

```
Purelight/
├── server.js              # Backend API server
├── db_manager.js          # Database management tool
├── database_setup.sql     # SQL setup script
├── setup_database.sh      # Linux/macOS setup script
├── setup_database.bat     # Windows setup script
├── package.json           # Dependencies
├── .env                   # Configuration (tạo tự động)
├── DATABASE_GUIDE.md      # Hướng dẫn chi tiết
└── README_BACKEND.md      # Documentation đầy đủ
```

---

## 🎯 Workflow thường dùng

### Hàng ngày:
1. `npm run db:stats` - Xem thống kê
2. `npm run db:list 20` - Xem 20 contacts mới nhất

### Hàng tuần:
1. `npm run db:backup` - Backup database
2. `npm run db:clean 30` - Xóa dữ liệu cũ hơn 30 ngày

### Khi có vấn đề:
1. `npm run db:test` - Test kết nối
2. Kiểm tra log trong console
3. Xem file .env có đúng không

---

## 📞 Support

- **Documentation đầy đủ:** `DATABASE_GUIDE.md`
- **Backend docs:** `README_BACKEND.md`
- **Logs:** Xem console khi chạy `npm run dev`
- **Database:** Sử dụng `db_manager.js` để debug

**Lưu ý:** Luôn backup trước khi thay đổi quan trọng!
