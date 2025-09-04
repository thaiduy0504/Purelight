# 🚀 Deploy Purelight trên Netlify với Database Cloud

## 📋 Tổng quan

Netlify là platform cho static sites, không hỗ trợ PostgreSQL trực tiếp. Chúng ta sẽ sử dụng:
- **Frontend:** Deploy trên Netlify
- **Backend API:** Deploy trên Vercel/Railway/Heroku
- **Database:** PostgreSQL cloud (Supabase/Neon/Railway)

---

## 🗄️ Tùy chọn Database Cloud

### 1. **Supabase** (Khuyến nghị - Free tier tốt)
- ✅ PostgreSQL cloud miễn phí
- ✅ Dashboard quản lý trực quan
- ✅ API tự động
- ✅ Real-time subscriptions

### 2. **Neon** (Serverless PostgreSQL)
- ✅ Serverless PostgreSQL
- ✅ Auto-scaling
- ✅ Branching cho database

### 3. **Railway**
- ✅ PostgreSQL + Backend trên cùng platform
- ✅ Deploy đơn giản
- ✅ Free tier

### 4. **PlanetScale** (MySQL)
- ✅ MySQL cloud
- ✅ Branching
- ✅ Free tier

---

## 🎯 Hướng dẫn Deploy với Supabase

### Bước 1: Setup Supabase Database

1. **Tạo tài khoản Supabase:**
   - Truy cập: https://supabase.com
   - Sign up với GitHub/Google

2. **Tạo project mới:**
   ```bash
   # Tên project: purelight-db
   # Region: Singapore (gần Việt Nam)
   # Password: tạo password mạnh
   ```

3. **Lấy thông tin kết nối:**
   - Vào Settings → Database
   - Copy: Host, Database, User, Password, Port

### Bước 2: Setup Database Schema

1. **Vào SQL Editor trong Supabase:**
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

   -- Enable Row Level Security (RLS)
   ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

   -- Tạo policy cho API access
   CREATE POLICY "Enable insert for authenticated users only" ON contacts
   FOR INSERT WITH CHECK (true);

   CREATE POLICY "Enable read access for all users" ON contacts
   FOR SELECT USING (true);
   ```

2. **Tạo API Key:**
   - Vào Settings → API
   - Copy: `anon` key và `service_role` key

### Bước 3: Deploy Backend trên Vercel

1. **Tạo file `vercel.json`:**
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "server.js",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "server.js"
       }
     ],
     "env": {
       "DB_HOST": "@db_host",
       "DB_NAME": "@db_name", 
       "DB_USER": "@db_user",
       "DB_PASSWORD": "@db_password",
       "DB_PORT": "@db_port",
       "EMAIL_USER": "@email_user",
       "EMAIL_PASS": "@email_pass"
     }
   }
   ```

2. **Cập nhật `server.js` cho Supabase:**
   ```javascript
   const { Pool } = require('pg');
   
   // Supabase connection
   const pool = new Pool({
     connectionString: process.env.DATABASE_URL || 
       `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}?sslmode=require`
   });
   ```

3. **Deploy lên Vercel:**
   ```bash
   # Cài Vercel CLI
   npm i -g vercel
   
   # Login và deploy
   vercel login
   vercel
   
   # Set environment variables
   vercel env add DB_HOST
   vercel env add DB_NAME
   vercel env add DB_USER
   vercel env add DB_PASSWORD
   vercel env add DB_PORT
   vercel env add EMAIL_USER
   vercel env add EMAIL_PASS
   ```

### Bước 4: Deploy Frontend trên Netlify

1. **Cập nhật `script.js`:**
   ```javascript
   // Thay đổi API URL
   fetch('https://your-backend.vercel.app/api/contact', {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
     },
     body: JSON.stringify({
       name: name,
       email: email,
       message: message
     })
   })
   ```

2. **Deploy trên Netlify:**
   - Kéo thả folder vào Netlify
   - Hoặc connect GitHub repository
   - Build command: (để trống vì là static site)
   - Publish directory: `/`

---

## 🎯 Hướng dẫn Deploy với Railway (All-in-one)

### Bước 1: Setup Railway

1. **Tạo tài khoản Railway:**
   - Truy cập: https://railway.app
   - Sign up với GitHub

2. **Tạo project mới:**
   - New Project → Deploy from GitHub repo
   - Chọn repository Purelight

### Bước 2: Setup Database

1. **Thêm PostgreSQL service:**
   - Add Service → Database → PostgreSQL
   - Railway tự động tạo database

2. **Lấy connection string:**
   - Click vào PostgreSQL service
   - Copy connection string từ Variables tab

### Bước 3: Setup Backend

1. **Tạo `railway.json`:**
   ```json
   {
     "build": {
       "builder": "NIXPACKS"
     },
     "deploy": {
       "startCommand": "npm start",
       "healthcheckPath": "/api/health"
     }
   }
   ```

2. **Cập nhật `server.js`:**
   ```javascript
   const { Pool } = require('pg');
   
   // Railway connection
   const pool = new Pool({
     connectionString: process.env.DATABASE_URL
   });
   ```

3. **Deploy:**
   - Railway tự động detect và deploy
   - Set environment variables trong dashboard

### Bước 4: Setup Frontend

1. **Tạo `netlify.toml`:**
   ```toml
   [build]
     publish = "."
     command = "echo 'Static site - no build needed'"

   [[redirects]]
     from = "/api/*"
     to = "https://your-backend.railway.app/api/:splat"
     status = 200
   ```

2. **Deploy trên Netlify:**
   - Connect GitHub repository
   - Build settings sẽ tự động detect

---

## 🛠️ Quản lý Database trên Cloud

### Supabase Dashboard:
```bash
# Truy cập: https://supabase.com/dashboard
# Features:
- SQL Editor: Chạy queries trực tiếp
- Table Editor: Xem/sửa dữ liệu
- API Docs: Xem API endpoints
- Logs: Monitor requests
- Settings: Quản lý keys và config
```

### Railway Dashboard:
```bash
# Truy cập: https://railway.app/dashboard
# Features:
- Database: Quản lý PostgreSQL
- Logs: Xem application logs
- Metrics: Monitor performance
- Variables: Quản lý environment
```

### Quản lý qua CLI:
```bash
# Supabase CLI
npm install -g supabase
supabase login
supabase db reset
supabase db push

# Railway CLI
npm install -g @railway/cli
railway login
railway status
railway logs
```

---

## 📊 Monitoring và Analytics

### 1. **Supabase Analytics:**
- Database performance
- API usage
- Real-time connections
- Storage usage

### 2. **Railway Metrics:**
- CPU/Memory usage
- Database connections
- Response times
- Error rates

### 3. **Netlify Analytics:**
- Page views
- Form submissions
- Performance metrics
- Error tracking

---

## 🔧 Troubleshooting

### Lỗi kết nối database:
```bash
# Kiểm tra connection string
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1;"
```

### Lỗi CORS:
```javascript
// Thêm vào server.js
app.use(cors({
  origin: ['https://your-site.netlify.app', 'http://localhost:3000'],
  credentials: true
}));
```

### Lỗi environment variables:
```bash
# Vercel
vercel env ls

# Railway
railway variables

# Netlify
netlify env:list
```

---

## 💰 Chi phí

### Free Tiers:
- **Supabase:** 500MB database, 50MB file storage
- **Railway:** $5 credit/month
- **Vercel:** 100GB bandwidth/month
- **Netlify:** 100GB bandwidth/month

### Production Pricing:
- **Supabase:** $25/month (8GB database)
- **Railway:** $5/month per service
- **Vercel:** $20/month (1TB bandwidth)
- **Netlify:** $19/month (1TB bandwidth)

---

## 🚀 Best Practices

### 1. **Security:**
- Sử dụng environment variables
- Enable RLS trên Supabase
- Validate input data
- Rate limiting

### 2. **Performance:**
- Database indexes
- Connection pooling
- CDN cho static assets
- Caching

### 3. **Monitoring:**
- Health checks
- Error tracking
- Performance monitoring
- Backup strategies

---

## 📞 Support

- **Supabase:** https://supabase.com/docs
- **Railway:** https://docs.railway.app
- **Vercel:** https://vercel.com/docs
- **Netlify:** https://docs.netlify.com

**Lưu ý:** Luôn test trên staging environment trước khi deploy production!
