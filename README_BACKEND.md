# Purelight Backend API

Backend API for Purelight contact form with PostgreSQL database integration.

## Features

- ✅ Contact form data storage in PostgreSQL
- ✅ Automatic email notifications
- ✅ RESTful API endpoints
- ✅ CORS enabled for frontend integration
- ✅ Error handling and validation

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- Gmail account for email notifications

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Setup PostgreSQL Database:**
   ```bash
   # Create database
   createdb purelight_db
   
   # Run SQL setup script
   psql -d purelight_db -f database_setup.sql
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory:
   ```env
   # Database Configuration
   DB_USER=postgres
   DB_HOST=localhost
   DB_NAME=purelight_db
   DB_PASSWORD=your_password_here
   DB_PORT=5432

   # Email Configuration
   EMAIL_USER=booking.purelight@gmail.com
   EMAIL_PASS=your_app_password_here

   # Server Configuration
   PORT=3000
   ```

4. **Setup Gmail App Password:**
   - Go to Google Account settings
   - Enable 2-factor authentication
   - Generate an App Password for "Mail"
   - Use this password in EMAIL_PASS

## Running the Server

### Development Mode:
```bash
npm run dev
```

### Production Mode:
```bash
npm start
```

The server will run on `http://localhost:3000`

## API Endpoints

### POST /api/contact
Submit contact form data.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "message": "Hello, I'm interested in your services."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Contact form submitted successfully",
  "contactId": 123
}
```

### GET /api/contacts
Get all contact submissions (for admin purposes).

**Response:**
```json
{
  "success": true,
  "contacts": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "message": "Hello, I'm interested in your services.",
      "created_at": "2025-01-27T10:30:00.000Z"
    }
  ]
}
```

### GET /api/health
Health check endpoint.

**Response:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2025-01-27T10:30:00.000Z"
}
```

## Database Schema

### contacts table:
- `id` (SERIAL PRIMARY KEY)
- `name` (VARCHAR(255) NOT NULL)
- `email` (VARCHAR(255) NOT NULL)
- `message` (TEXT NOT NULL)
- `created_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)

## Frontend Integration

The frontend form now sends data to the backend API instead of using external services. Make sure the backend server is running before testing the contact form.

## Troubleshooting

1. **Database Connection Issues:**
   - Check PostgreSQL is running
   - Verify database credentials in .env
   - Ensure database exists

2. **Email Issues:**
   - Verify Gmail credentials
   - Check App Password is correct
   - Ensure 2FA is enabled on Gmail account

3. **CORS Issues:**
   - Backend has CORS enabled for all origins
   - For production, configure specific origins

## Production Deployment

1. Set up environment variables on your hosting platform
2. Use a production PostgreSQL database
3. Configure proper CORS origins
4. Set up SSL/HTTPS
5. Use PM2 or similar for process management

## Security Notes

- Never commit .env file to version control
- Use strong database passwords
- Enable SSL in production
- Consider rate limiting for API endpoints
- Validate and sanitize all input data
