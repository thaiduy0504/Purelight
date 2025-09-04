# ⚡ Deploy Purelight trên Netlify - Quick Start

## 🎯 Tùy chọn 1: Supabase + Vercel + Netlify (Khuyến nghị)

### Bước 1: Setup Database (5 phút)
```bash
# 1. Tạo tài khoản Supabase: https://supabase.com
# 2. Tạo project mới: purelight-db
# 3. Vào SQL Editor, chạy:
```

```sql
-- Tạo bảng contacts
CREATE TABLE contacts (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tạo indexes
CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_contacts_created_at ON contacts(created_at);

-- Enable RLS
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Tạo policies
CREATE POLICY "Enable insert for all users" ON contacts FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable read access for all users" ON contacts FOR SELECT USING (true);
```

### Bước 2: Deploy Backend (3 phút)
```bash
# 1. Cài Vercel CLI
npm i -g vercel

# 2. Login và deploy
vercel login
vercel

# 3. Set environment variables
vercel env add DATABASE_URL
# Paste connection string từ Supabase: postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres

vercel env add EMAIL_USER
# booking.purelight@gmail.com

vercel env add EMAIL_PASS
# Your Gmail App Password
```

### Bước 3: Update Frontend (2 phút)
```bash
# 1. Cập nhật script.js với backend URL
node update_frontend_for_production.js production

# 2. Nhập backend URL khi được hỏi
# Ví dụ: https://purelight-backend.vercel.app
```

### Bước 4: Deploy Frontend (1 phút)
```bash
# 1. Kéo thả folder vào Netlify
# 2. Hoặc connect GitHub repository
# 3. Deploy!
```

---

## 🎯 Tùy chọn 2: Railway (All-in-one)

### Bước 1: Deploy Backend + Database (5 phút)
```bash
# 1. Tạo tài khoản Railway: https://railway.app
# 2. New Project → Deploy from GitHub
# 3. Chọn repository Purelight
# 4. Add Service → Database → PostgreSQL
# 5. Railway tự động deploy backend
```

### Bước 2: Setup Environment Variables
```bash
# Trong Railway dashboard:
DATABASE_URL = (tự động tạo)
EMAIL_USER = booking.purelight@gmail.com
EMAIL_PASS = your_gmail_app_password
```

### Bước 3: Update Frontend
```bash
# 1. Lấy backend URL từ Railway dashboard
# 2. Cập nhật frontend
node update_frontend_for_production.js production
# Nhập Railway backend URL
```

### Bước 4: Deploy Frontend
```bash
# Deploy lên Netlify như bước 4 ở trên
```

---

## 🔧 Cấu hình Gmail App Password

### Bước 1: Enable 2FA
1. Vào Google Account → Security
2. Enable 2-Step Verification

### Bước 2: Tạo App Password
1. Google Account → Security → App passwords
2. Select app: Mail
3. Select device: Other (Custom name)
4. Copy password (16 ký tự)

### Bước 3: Sử dụng trong Environment Variables
```bash
EMAIL_PASS = your_16_character_app_password
```

---

## 🚀 Commands nhanh

### Setup và Deploy:
```bash
# Tùy chọn 1: Supabase + Vercel
npm run deploy:supabase

# Tùy chọn 2: Railway
npm run deploy:railway

# Update frontend cho production
npm run build:prod

# Deploy frontend
npm run deploy:netlify
```

### Quản lý:
```bash
# Xem logs backend
vercel logs
# hoặc
railway logs

# Test API
curl https://your-backend.vercel.app/api/health

# Xem database (Supabase)
# Truy cập: https://supabase.com/dashboard
```

---

## 📊 Monitoring

### Health Checks:
- **Backend:** `https://your-backend.vercel.app/api/health`
- **Frontend:** `https://your-site.netlify.app`

### Database Management:
- **Supabase:** Dashboard → Table Editor
- **Railway:** Dashboard → Database

### Analytics:
- **Netlify:** Dashboard → Analytics
- **Vercel:** Dashboard → Analytics
- **Railway:** Dashboard → Metrics

---

## 🆘 Troubleshooting

### Lỗi CORS:
```javascript
// Thêm vào server.js
app.use(cors({
  origin: ['https://your-site.netlify.app'],
  credentials: true
}));
```

### Lỗi Database Connection:
```bash
# Kiểm tra connection string
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1;"
```

### Lỗi Email:
- Kiểm tra Gmail App Password
- Đảm bảo 2FA đã bật
- Kiểm tra EMAIL_PASS trong environment variables

---

## 💰 Chi phí

### Free Tiers:
- **Supabase:** 500MB database, 50MB storage
- **Vercel:** 100GB bandwidth/month
- **Railway:** $5 credit/month
- **Netlify:** 100GB bandwidth/month

### Tổng chi phí: **$0/month** (với free tiers)

---

## 🎉 Kết quả

Sau khi deploy thành công:
- ✅ Website: `https://your-site.netlify.app`
- ✅ Backend API: `https://your-backend.vercel.app`
- ✅ Database: PostgreSQL cloud
- ✅ Contact form hoạt động
- ✅ Email notifications
- ✅ Data lưu vào database

**Tổng thời gian setup: ~10 phút** 🚀
