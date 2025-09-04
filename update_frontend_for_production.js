#!/usr/bin/env node

/**
 * Script to update frontend for production deployment
 * Updates API URLs and configuration for cloud deployment
 */

const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  // Backend URLs (update these with your actual URLs)
  production: {
    backendUrl: 'https://your-backend.vercel.app',
    // Alternative: 'https://your-backend.railway.app'
  },
  staging: {
    backendUrl: 'https://your-backend-staging.vercel.app',
  },
  development: {
    backendUrl: 'http://localhost:3000',
  }
};

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

class FrontendUpdater {
  
  constructor(environment = 'production') {
    this.environment = environment;
    this.backendUrl = config[environment].backendUrl;
  }

  // Update script.js with production API URL
  updateScriptJs() {
    try {
      const scriptPath = path.join(__dirname, 'script.js');
      let content = fs.readFileSync(scriptPath, 'utf8');

      // Replace localhost URL with production URL
      const localhostRegex = /http:\/\/localhost:3000/g;
      content = content.replace(localhostRegex, this.backendUrl);

      // Update fetch URL
      const fetchRegex = /fetch\('([^']+)'/g;
      content = content.replace(fetchRegex, (match, url) => {
        if (url.includes('localhost:3000')) {
          return `fetch('${this.backendUrl}${url.replace('http://localhost:3000', '')}'`;
        }
        return match;
      });

      fs.writeFileSync(scriptPath, content);
      log(`✅ Updated script.js for ${this.environment}`, 'green');
      log(`   Backend URL: ${this.backendUrl}`, 'cyan');

    } catch (error) {
      log(`❌ Error updating script.js: ${error.message}`, 'red');
    }
  }

  // Update netlify.toml with correct backend URL
  updateNetlifyToml() {
    try {
      const netlifyPath = path.join(__dirname, 'netlify.toml');
      let content = fs.readFileSync(netlifyPath, 'utf8');

      // Replace placeholder backend URL
      const placeholderRegex = /https:\/\/your-backend-url\.vercel\.app/g;
      content = content.replace(placeholderRegex, this.backendUrl);

      fs.writeFileSync(netlifyPath, content);
      log(`✅ Updated netlify.toml for ${this.environment}`, 'green');

    } catch (error) {
      log(`❌ Error updating netlify.toml: ${error.message}`, 'red');
    }
  }

  // Create environment-specific config file
  createEnvConfig() {
    try {
      const envConfig = {
        environment: this.environment,
        backendUrl: this.backendUrl,
        timestamp: new Date().toISOString()
      };

      const configPath = path.join(__dirname, 'env-config.json');
      fs.writeFileSync(configPath, JSON.stringify(envConfig, null, 2));
      log(`✅ Created env-config.json for ${this.environment}`, 'green');

    } catch (error) {
      log(`❌ Error creating env-config.json: ${error.message}`, 'red');
    }
  }

  // Update package.json scripts for deployment
  updatePackageJson() {
    try {
      const packagePath = path.join(__dirname, 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

      // Add deployment scripts
      packageJson.scripts = {
        ...packageJson.scripts,
        'build:prod': 'node update_frontend_for_production.js production',
        'build:staging': 'node update_frontend_for_production.js staging',
        'build:dev': 'node update_frontend_for_production.js development',
        'deploy:netlify': 'netlify deploy --prod',
        'deploy:netlify:preview': 'netlify deploy'
      };

      fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
      log(`✅ Updated package.json with deployment scripts`, 'green');

    } catch (error) {
      log(`❌ Error updating package.json: ${error.message}`, 'red');
    }
  }

  // Create deployment checklist
  createDeploymentChecklist() {
    const checklist = `
# 🚀 Deployment Checklist for ${this.environment.toUpperCase()}

## Pre-deployment:
- [ ] Backend deployed and accessible at: ${this.backendUrl}
- [ ] Database configured and accessible
- [ ] Environment variables set correctly
- [ ] API endpoints tested
- [ ] CORS configured properly

## Frontend:
- [ ] API URLs updated to: ${this.backendUrl}
- [ ] Contact form tested
- [ ] All features working
- [ ] No console errors

## Deployment:
- [ ] Netlify deployment successful
- [ ] Custom domain configured (if needed)
- [ ] SSL certificate active
- [ ] CDN working properly

## Post-deployment:
- [ ] Contact form submission working
- [ ] Email notifications working
- [ ] Database storing data correctly
- [ ] Performance acceptable
- [ ] Mobile responsive

## Monitoring:
- [ ] Analytics configured
- [ ] Error tracking setup
- [ ] Uptime monitoring
- [ ] Backup strategy in place

Generated: ${new Date().toISOString()}
Environment: ${this.environment}
Backend URL: ${this.backendUrl}
`;

    const checklistPath = path.join(__dirname, `DEPLOYMENT_CHECKLIST_${this.environment.toUpperCase()}.md`);
    fs.writeFileSync(checklistPath, checklist);
    log(`✅ Created deployment checklist: ${checklistPath}`, 'green');
  }

  // Run all updates
  updateAll() {
    log(`🔄 Updating frontend for ${this.environment} deployment...`, 'blue');
    log(`   Backend URL: ${this.backendUrl}`, 'cyan');

    this.updateScriptJs();
    this.updateNetlifyToml();
    this.createEnvConfig();
    this.updatePackageJson();
    this.createDeploymentChecklist();

    log(`✅ Frontend updated successfully for ${this.environment}!`, 'green');
    log(`📋 Next steps:`, 'yellow');
    log(`   1. Review the deployment checklist`, 'cyan');
    log(`   2. Test the contact form locally`, 'cyan');
    log(`   3. Deploy to Netlify`, 'cyan');
    log(`   4. Verify everything works in production`, 'cyan');
  }
}

// CLI interface
function main() {
  const environment = process.argv[2] || 'production';
  
  if (!config[environment]) {
    log(`❌ Invalid environment: ${environment}`, 'red');
    log(`Available environments: ${Object.keys(config).join(', ')}`, 'yellow');
    process.exit(1);
  }

  const updater = new FrontendUpdater(environment);
  updater.updateAll();
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = FrontendUpdater;
