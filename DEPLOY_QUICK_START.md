# ⚡ Deploy Purelight trên Netlify - Quick Start

## 🎯 Tùy chọn 1: Neon + Vercel + Netlify (Khuyến nghị)

### Bước 1: Setup Database (3 phút)
```bash
# 1. Tạo tài khoản Neon: https://neon.tech
# 2. Tạo project mới: purelight-db
# 3. Chạy setup script:
npm run setup:neon
```

# Script sẽ tự động tạo bảng và indexes
# Chỉ cần paste connection string từ Neon dashboard

### Bước 2: Deploy Backend (3 phút)
```bash
# 1. Cài Vercel CLI
npm i -g vercel

# 2. Login và deploy
vercel login
vercel

# 3. Set environment variables
vercel env add DATABASE_URL
# Paste connection string từ Neon: postgresql://username:password@ep-xxx-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require

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

## 🎯 Tùy chọn 2: Neon + Railway + Netlify

### Bước 1: Setup Neon Database (3 phút)
```bash
# 1. Tạo tài khoản Neon: https://neon.tech
# 2. Tạo project mới: purelight-db
# 3. Chạy setup script:
npm run setup:neon
```

### Bước 2: Deploy Backend lên Railway (2 phút)
```bash
# 1. Tạo tài khoản Railway: https://railway.app
# 2. New Project → Deploy from GitHub
# 3. Chọn repository Purelight
# 4. Railway tự động deploy backend
```

### Bước 3: Setup Environment Variables
```bash
# Trong Railway dashboard:
DATABASE_URL = (paste từ Neon setup)
EMAIL_USER = booking.purelight@gmail.com
EMAIL_PASS = your_gmail_app_password
```

### Bước 4: Update Frontend
```bash
# 1. Lấy backend URL từ Railway dashboard
# 2. Cập nhật frontend
node update_frontend_for_production.js production
# Nhập Railway backend URL
```

### Bước 5: Deploy Frontend
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
# Tùy chọn 1: Neon + Vercel
npm run setup:neon
npm run deploy:vercel

# Tùy chọn 2: Neon + Railway
npm run setup:neon
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

# Xem database (Neon)
# Truy cập: https://neon.tech/dashboard
```

---

## 📊 Monitoring

### Health Checks:
- **Backend:** `https://your-backend.vercel.app/api/health`
- **Frontend:** `https://your-site.netlify.app`

### Database Management:
- **Neon:** Dashboard → SQL Editor / Table Editor
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
- **Neon:** 3GB database, 10GB transfer/month
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
