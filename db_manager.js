#!/usr/bin/env node

/**
 * Database Manager for Purelight
 * Utility script to manage PostgreSQL database operations
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database configuration
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'purelight_db',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Database operations
class DatabaseManager {
  
  // Test database connection
  async testConnection() {
    try {
      const client = await pool.connect();
      const result = await client.query('SELECT NOW()');
      client.release();
      log('✅ Database connection successful!', 'green');
      log(`📅 Current time: ${result.rows[0].now}`, 'cyan');
      return true;
    } catch (error) {
      log('❌ Database connection failed!', 'red');
      log(`Error: ${error.message}`, 'red');
      return false;
    }
  }

  // Create table if not exists
  async createTable() {
    try {
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS contacts (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL,
          message TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `;
      
      await pool.query(createTableQuery);
      log('✅ Contacts table created/verified successfully!', 'green');
      
      // Create indexes
      await pool.query('CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);');
      await pool.query('CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at);');
      log('✅ Indexes created successfully!', 'green');
      
    } catch (error) {
      log('❌ Error creating table:', 'red');
      log(`Error: ${error.message}`, 'red');
    }
  }

  // Get all contacts
  async getAllContacts(limit = 10) {
    try {
      const result = await pool.query(
        'SELECT * FROM contacts ORDER BY created_at DESC LIMIT $1',
        [limit]
      );
      
      log(`📊 Found ${result.rows.length} contacts:`, 'blue');
      console.table(result.rows);
      return result.rows;
    } catch (error) {
      log('❌ Error fetching contacts:', 'red');
      log(`Error: ${error.message}`, 'red');
    }
  }

  // Search contacts
  async searchContacts(searchTerm) {
    try {
      const result = await pool.query(
        'SELECT * FROM contacts WHERE name ILIKE $1 OR email ILIKE $1 OR message ILIKE $1 ORDER BY created_at DESC',
        [`%${searchTerm}%`]
      );
      
      log(`🔍 Found ${result.rows.length} contacts matching "${searchTerm}":`, 'blue');
      console.table(result.rows);
      return result.rows;
    } catch (error) {
      log('❌ Error searching contacts:', 'red');
      log(`Error: ${error.message}`, 'red');
    }
  }

  // Get database statistics
  async getStats() {
    try {
      const totalContacts = await pool.query('SELECT COUNT(*) FROM contacts');
      const todayContacts = await pool.query(
        'SELECT COUNT(*) FROM contacts WHERE created_at >= CURRENT_DATE'
      );
      const thisWeekContacts = await pool.query(
        'SELECT COUNT(*) FROM contacts WHERE created_at >= CURRENT_DATE - INTERVAL \'7 days\''
      );
      
      const dbSize = await pool.query(
        'SELECT pg_size_pretty(pg_database_size(current_database())) as size'
      );

      log('📈 Database Statistics:', 'magenta');
      log(`   Total Contacts: ${totalContacts.rows[0].count}`, 'cyan');
      log(`   Today: ${todayContacts.rows[0].count}`, 'cyan');
      log(`   This Week: ${thisWeekContacts.rows[0].count}`, 'cyan');
      log(`   Database Size: ${dbSize.rows[0].size}`, 'cyan');
      
    } catch (error) {
      log('❌ Error getting statistics:', 'red');
      log(`Error: ${error.message}`, 'red');
    }
  }

  // Backup database
  async backupDatabase() {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFile = `backup_${timestamp}.sql`;
      
      log('🔄 Creating backup...', 'yellow');
      
      // Get all data
      const result = await pool.query('SELECT * FROM contacts ORDER BY created_at');
      
      // Create backup content
      let backupContent = `-- Purelight Database Backup\n`;
      backupContent += `-- Created: ${new Date().toISOString()}\n`;
      backupContent += `-- Total Records: ${result.rows.length}\n\n`;
      
      backupContent += `-- Drop and recreate table\n`;
      backupContent += `DROP TABLE IF EXISTS contacts;\n`;
      backupContent += `CREATE TABLE contacts (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);\n\n`;
      
      // Insert data
      for (const row of result.rows) {
        backupContent += `INSERT INTO contacts (id, name, email, message, created_at) VALUES `;
        backupContent += `(${row.id}, '${row.name.replace(/'/g, "''")}', '${row.email}', '${row.message.replace(/'/g, "''")}', '${row.created_at}');\n`;
      }
      
      // Write to file
      fs.writeFileSync(backupFile, backupContent);
      log(`✅ Backup created: ${backupFile}`, 'green');
      
    } catch (error) {
      log('❌ Error creating backup:', 'red');
      log(`Error: ${error.message}`, 'red');
    }
  }

  // Clean old data
  async cleanOldData(days = 30) {
    try {
      const result = await pool.query(
        'DELETE FROM contacts WHERE created_at < NOW() - INTERVAL \'$1 days\'',
        [days]
      );
      
      log(`🗑️  Deleted ${result.rowCount} contacts older than ${days} days`, 'yellow');
      
    } catch (error) {
      log('❌ Error cleaning old data:', 'red');
      log(`Error: ${error.message}`, 'red');
    }
  }

  // Add sample data
  async addSampleData() {
    try {
      const sampleData = [
        {
          name: 'John Doe',
          email: 'john@example.com',
          message: 'I am interested in your photo editing services.'
        },
        {
          name: 'Jane Smith',
          email: 'jane@example.com',
          message: 'Please send me more information about your pricing.'
        },
        {
          name: 'Mike Johnson',
          email: 'mike@example.com',
          message: 'I need help with real estate photo editing.'
        }
      ];

      for (const data of sampleData) {
        await pool.query(
          'INSERT INTO contacts (name, email, message) VALUES ($1, $2, $3)',
          [data.name, data.email, data.message]
        );
      }
      
      log('✅ Sample data added successfully!', 'green');
      
    } catch (error) {
      log('❌ Error adding sample data:', 'red');
      log(`Error: ${error.message}`, 'red');
    }
  }
}

// CLI interface
async function main() {
  const dbManager = new DatabaseManager();
  const command = process.argv[2];
  const arg = process.argv[3];

  log('🗄️  Purelight Database Manager', 'bright');
  log('================================', 'bright');

  switch (command) {
    case 'test':
      await dbManager.testConnection();
      break;
      
    case 'init':
      await dbManager.testConnection();
      await dbManager.createTable();
      break;
      
    case 'list':
      const limit = arg ? parseInt(arg) : 10;
      await dbManager.getAllContacts(limit);
      break;
      
    case 'search':
      if (!arg) {
        log('❌ Please provide search term: node db_manager.js search "john"', 'red');
        break;
      }
      await dbManager.searchContacts(arg);
      break;
      
    case 'stats':
      await dbManager.getStats();
      break;
      
    case 'backup':
      await dbManager.backupDatabase();
      break;
      
    case 'clean':
      const days = arg ? parseInt(arg) : 30;
      await dbManager.cleanOldData(days);
      break;
      
    case 'sample':
      await dbManager.addSampleData();
      break;
      
    default:
      log('📖 Available commands:', 'blue');
      log('  test     - Test database connection', 'cyan');
      log('  init     - Initialize database and create table', 'cyan');
      log('  list     - List contacts (optional: limit)', 'cyan');
      log('  search   - Search contacts by term', 'cyan');
      log('  stats    - Show database statistics', 'cyan');
      log('  backup   - Create database backup', 'cyan');
      log('  clean    - Clean old data (optional: days)', 'cyan');
      log('  sample   - Add sample data', 'cyan');
      log('', 'reset');
      log('Examples:', 'yellow');
      log('  node db_manager.js test', 'cyan');
      log('  node db_manager.js list 20', 'cyan');
      log('  node db_manager.js search "john"', 'cyan');
      log('  node db_manager.js clean 60', 'cyan');
  }

  await pool.end();
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = DatabaseManager;
