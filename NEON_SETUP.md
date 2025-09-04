# 🚀 Setup Neon Database cho Purelight

## 📋 Tổng quan

Neon là PostgreSQL serverless platform với:
- ✅ **Serverless PostgreSQL** - Auto-scaling
- ✅ **Branching** - Database branches như Git
- ✅ **Free tier** - 3GB storage, 10GB transfer
- ✅ **Connection pooling** - Built-in
- ✅ **Instant provisioning** - Không cần setup phức tạp

---

## 🎯 Setup Neon Database

### Bước 1: Tạo tài khoản Neon
1. **Truy cập:** https://neon.tech
2. **Sign up** với GitHub/Google
3. **Tạo project mới:**
   - Project name: `purelight-db`
   - Region: `Singapore` (gần Việt Nam)
   - PostgreSQL version: `15`

### Bước 2: Lấy Connection String
1. **Vào Dashboard** → Project → Connection Details
2. **Copy Connection String:**
   ```
   postgresql://username:password@ep-xxx-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```

### Bước 3: Setup Database Schema
1. **Vào SQL Editor** trong Neon Dashboard
2. **Chạy SQL script:**

```sql
-- Tạo bảng contacts
CREATE TABLE IF NOT EXISTS contacts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tạo indexes
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at);

-- Tạo sample data (optional)
INSERT INTO contacts (name, email, message) VALUES 
('Test User', 'test@example.com', 'This is a test message from Neon setup');

-- Kiểm tra dữ liệu
SELECT * FROM contacts;
```

---

## 🔧 Cấu hình Backend cho Neon

### Cập nhật server.js
```javascript
const { Pool } = require('pg');

// Neon connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Test connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error connecting to Neon:', err);
  } else {
    console.log('Connected to Neon database');
    release();
  }
});
```

### Environment Variables
```bash
# .env file
DATABASE_URL=postgresql://username:password@ep-xxx-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
EMAIL_USER=booking.purelight@gmail.com
EMAIL_PASS=your_gmail_app_password
PORT=3000
```

---

## 🚀 Deploy với Neon

### Tùy chọn 1: Vercel + Neon + Netlify

#### Bước 1: Deploy Backend lên Vercel
```bash
# Cài Vercel CLI
npm i -g vercel

# Login và deploy
vercel login
vercel

# Set environment variables
vercel env add DATABASE_URL
# Paste Neon connection string

vercel env add EMAIL_USER
# booking.purelight@gmail.com

vercel env add EMAIL_PASS
# Your Gmail App Password
```

#### Bước 2: Update Frontend
```bash
# Cập nhật script.js với Vercel backend URL
node update_frontend_for_production.js production
# Nhập: https://your-backend.vercel.app
```

#### Bước 3: Deploy Frontend lên Netlify
```bash
# Kéo thả folder vào Netlify
# Hoặc connect GitHub repository
```

### Tùy chọn 2: Railway + Neon + Netlify

#### Bước 1: Deploy Backend lên Railway
```bash
# Cài Railway CLI
npm i -g @railway/cli

# Login và deploy
railway login
railway init
railway up
```

#### Bước 2: Set Environment Variables trong Railway
```bash
# Railway Dashboard → Variables
DATABASE_URL = postgresql://username:password@ep-xxx-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
EMAIL_USER = booking.purelight@gmail.com
EMAIL_PASS = your_gmail_app_password
```

#### Bước 3: Update và Deploy Frontend
```bash
# Cập nhật với Railway backend URL
node update_frontend_for_production.js production
# Nhập: https://your-backend.railway.app

# Deploy lên Netlify
```

---

## 🛠️ Quản lý Neon Database

### Neon Dashboard Features
- ✅ **SQL Editor** - Chạy queries trực tiếp
- ✅ **Table Editor** - Xem/sửa dữ liệu
- ✅ **Branches** - Tạo database branches
- ✅ **Connection Pooling** - Built-in pooling
- ✅ **Metrics** - Performance monitoring
- ✅ **Logs** - Query logs

### Quản lý qua CLI
```bash
# Cài Neon CLI
npm install -g @neondatabase/cli

# Login
neon auth

# Tạo branch
neon branches create

# List branches
neon branches list

# Connect to database
neon connect
```

### Quản lý qua psql
```bash
# Connect trực tiếp
psql "postgresql://username:password@ep-xxx-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require"

# Chạy queries
SELECT * FROM contacts;
INSERT INTO contacts (name, email, message) VALUES ('John', 'john@example.com', 'Hello');
```

---

## 📊 Database Operations

### Quản lý dữ liệu
```sql
-- Xem tất cả contacts
SELECT * FROM contacts ORDER BY created_at DESC;

-- Tìm kiếm
SELECT * FROM contacts WHERE name ILIKE '%john%';

-- Thống kê
SELECT COUNT(*) as total_contacts FROM contacts;
SELECT DATE(created_at) as date, COUNT(*) as count 
FROM contacts 
GROUP BY DATE(created_at) 
ORDER BY date DESC;

-- Xóa dữ liệu cũ
DELETE FROM contacts WHERE created_at < NOW() - INTERVAL '30 days';
```

### Backup và Restore
```bash
# Backup
pg_dump "postgresql://username:password@ep-xxx-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require" > backup.sql

# Restore
psql "postgresql://username:password@ep-xxx-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require" < backup.sql
```

---

## 🔧 Troubleshooting

### Lỗi kết nối
```bash
# Kiểm tra connection string
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1;"

# Kiểm tra SSL
psql $DATABASE_URL -c "SHOW ssl;"
```

### Lỗi SSL
```javascript
// Thêm vào server.js
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});
```

### Lỗi connection pooling
```javascript
// Neon có built-in pooling, không cần cấu hình thêm
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Max connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

---

## 📈 Performance Tips

### Connection Pooling
- ✅ Neon có built-in connection pooling
- ✅ Sử dụng connection string trực tiếp
- ✅ Không cần setup pool riêng

### Query Optimization
```sql
-- Sử dụng indexes
CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_contacts_created_at ON contacts(created_at);

-- Limit results
SELECT * FROM contacts ORDER BY created_at DESC LIMIT 10;

-- Use prepared statements
PREPARE get_contact AS SELECT * FROM contacts WHERE id = $1;
EXECUTE get_contact(1);
```

### Monitoring
- ✅ **Neon Dashboard** - Real-time metrics
- ✅ **Query Performance** - Slow query detection
- ✅ **Connection Usage** - Pool monitoring
- ✅ **Storage Usage** - Database size tracking

---

## 💰 Pricing

### Free Tier
- ✅ **3GB Storage**
- ✅ **10GB Transfer/month**
- ✅ **Unlimited connections**
- ✅ **No time limits**

### Pro Tier ($19/month)
- ✅ **10GB Storage**
- ✅ **100GB Transfer/month**
- ✅ **Priority support**
- ✅ **Advanced features**

---

## 🎯 Best Practices

### Security
- ✅ Sử dụng environment variables
- ✅ Enable SSL (mặc định)
- ✅ Regular backups
- ✅ Monitor access logs

### Performance
- ✅ Sử dụng indexes
- ✅ Connection pooling
- ✅ Query optimization
- ✅ Regular maintenance

### Monitoring
- ✅ Set up alerts
- ✅ Monitor performance
- ✅ Track usage
- ✅ Regular backups

---

## 🚀 Quick Start Commands

```bash
# Setup Neon database
# 1. Tạo project tại https://neon.tech
# 2. Copy connection string
# 3. Chạy SQL setup script

# Deploy backend
npm run deploy:vercel
# Set DATABASE_URL environment variable

# Update frontend
npm run build:prod
# Nhập backend URL

# Deploy frontend
npm run deploy:netlify
```

---

## 📞 Support

- **Neon Docs:** https://neon.tech/docs
- **Community:** https://neon.tech/community
- **Status:** https://status.neon.tech
- **GitHub:** https://github.com/neondatabase

**Lưu ý:** Neon là serverless, không cần quản lý server hay scaling!
