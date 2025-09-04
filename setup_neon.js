#!/usr/bin/env node

/**
 * Neon Database Setup Script for Purelight
 * Automates the setup process for Neon PostgreSQL database
 */

const { Pool } = require('pg');
const readline = require('readline');

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

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Promise-based question function
function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

class NeonSetup {
  
  constructor() {
    this.connectionString = null;
    this.pool = null;
  }

  // Get connection string from user
  async getConnectionString() {
    log('🔗 Neon Database Setup', 'bright');
    log('================================', 'bright');
    log('');
    log('📋 Steps to get Neon connection string:', 'blue');
    log('1. Go to https://neon.tech', 'cyan');
    log('2. Sign up/Login with GitHub/Google', 'cyan');
    log('3. Create new project: purelight-db', 'cyan');
    log('4. Go to Dashboard → Connection Details', 'cyan');
    log('5. Copy the connection string', 'cyan');
    log('');
    
    this.connectionString = await question('Paste your Neon connection string: ');
    
    if (!this.connectionString || !this.connectionString.includes('neon.tech')) {
      log('❌ Invalid connection string. Please try again.', 'red');
      return false;
    }
    
    return true;
  }

  // Test database connection
  async testConnection() {
    try {
      log('🔄 Testing database connection...', 'yellow');
      
      this.pool = new Pool({
        connectionString: this.connectionString,
        ssl: {
          rejectUnauthorized: false
        }
      });

      const client = await this.pool.connect();
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

  // Create contacts table
  async createTable() {
    try {
      log('🔄 Creating contacts table...', 'yellow');
      
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS contacts (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL,
          message TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `;
      
      await this.pool.query(createTableQuery);
      log('✅ Contacts table created successfully!', 'green');
      
      // Create indexes
      await this.pool.query('CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);');
      await this.pool.query('CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at);');
      log('✅ Indexes created successfully!', 'green');
      
      return true;
      
    } catch (error) {
      log('❌ Error creating table:', 'red');
      log(`Error: ${error.message}`, 'red');
      return false;
    }
  }

  // Add sample data
  async addSampleData() {
    try {
      const addSample = await question('Add sample data? (y/n): ');
      
      if (addSample.toLowerCase() === 'y') {
        log('🔄 Adding sample data...', 'yellow');
        
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
          await this.pool.query(
            'INSERT INTO contacts (name, email, message) VALUES ($1, $2, $3)',
            [data.name, data.email, data.message]
          );
        }
        
        log('✅ Sample data added successfully!', 'green');
      }
      
      return true;
      
    } catch (error) {
      log('❌ Error adding sample data:', 'red');
      log(`Error: ${error.message}`, 'red');
      return false;
    }
  }

  // Verify setup
  async verifySetup() {
    try {
      log('🔄 Verifying setup...', 'yellow');
      
      const result = await this.pool.query('SELECT COUNT(*) FROM contacts');
      const count = result.rows[0].count;
      
      log(`✅ Setup verification successful!`, 'green');
      log(`📊 Total contacts in database: ${count}`, 'cyan');
      
      // Show recent contacts
      const recentContacts = await this.pool.query(
        'SELECT * FROM contacts ORDER BY created_at DESC LIMIT 3'
      );
      
      if (recentContacts.rows.length > 0) {
        log('📋 Recent contacts:', 'blue');
        recentContacts.rows.forEach((contact, index) => {
          log(`   ${index + 1}. ${contact.name} (${contact.email})`, 'cyan');
        });
      }
      
      return true;
      
    } catch (error) {
      log('❌ Error verifying setup:', 'red');
      log(`Error: ${error.message}`, 'red');
      return false;
    }
  }

  // Create .env file
  async createEnvFile() {
    try {
      log('🔄 Creating .env file...', 'yellow');
      
      const envContent = `# Neon Database Configuration
DATABASE_URL=${this.connectionString}

# Email Configuration
EMAIL_USER=booking.purelight@gmail.com
EMAIL_PASS=your_gmail_app_password_here

# Server Configuration
PORT=3000
NODE_ENV=production
`;

      require('fs').writeFileSync('.env', envContent);
      log('✅ .env file created successfully!', 'green');
      log('⚠️  Please update EMAIL_PASS with your Gmail App Password', 'yellow');
      
      return true;
      
    } catch (error) {
      log('❌ Error creating .env file:', 'red');
      log(`Error: ${error.message}`, 'red');
      return false;
    }
  }

  // Show next steps
  showNextSteps() {
    log('');
    log('🎉 Neon Database Setup Complete!', 'green');
    log('================================', 'green');
    log('');
    log('📋 Next steps:', 'blue');
    log('1. Update EMAIL_PASS in .env file with your Gmail App Password', 'cyan');
    log('2. Deploy backend to Vercel or Railway:', 'cyan');
    log('   npm run deploy:vercel', 'yellow');
    log('   # or', 'yellow');
    log('   npm run deploy:railway', 'yellow');
    log('3. Update frontend with backend URL:', 'cyan');
    log('   npm run build:prod', 'yellow');
    log('4. Deploy frontend to Netlify:', 'cyan');
    log('   npm run deploy:netlify', 'yellow');
    log('');
    log('🔗 Useful links:', 'blue');
    log('• Neon Dashboard: https://neon.tech/dashboard', 'cyan');
    log('• Vercel: https://vercel.com', 'cyan');
    log('• Netlify: https://netlify.com', 'cyan');
    log('• Railway: https://railway.app', 'cyan');
    log('');
  }

  // Main setup process
  async setup() {
    try {
      // Get connection string
      const connectionOk = await this.getConnectionString();
      if (!connectionOk) {
        rl.close();
        return;
      }

      // Test connection
      const connectionTest = await this.testConnection();
      if (!connectionTest) {
        rl.close();
        return;
      }

      // Create table
      const tableCreated = await this.createTable();
      if (!tableCreated) {
        rl.close();
        return;
      }

      // Add sample data
      await this.addSampleData();

      // Verify setup
      await this.verifySetup();

      // Create .env file
      await this.createEnvFile();

      // Show next steps
      this.showNextSteps();

    } catch (error) {
      log('❌ Setup failed:', 'red');
      log(`Error: ${error.message}`, 'red');
    } finally {
      if (this.pool) {
        await this.pool.end();
      }
      rl.close();
    }
  }
}

// Run setup
async function main() {
  const setup = new NeonSetup();
  await setup.setup();
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = NeonSetup;
