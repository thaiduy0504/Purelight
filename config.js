// Configuration file for Purelight Backend
module.exports = {
  // Database Configuration
  database: {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'purelight_db',
    password: process.env.DB_PASSWORD || 'password',
    port: process.env.DB_PORT || 5432,
  },
  
  // Email Configuration
  email: {
    user: process.env.EMAIL_USER || 'booking.purelight@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password'
  },
  
  // Server Configuration
  server: {
    port: process.env.PORT || 3000
  }
};
