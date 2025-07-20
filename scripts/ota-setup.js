#!/usr/bin/env node

/**
 * OTA Update Setup and Deployment Script for Broku Expense Tracker
 * 
 * This script automates the process of:
 * 1. Building production APK with OTA support
 * 2. Publishing OTA updates
 * 3. Managing update channels
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
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

function execCommand(command, description) {
  log(`\n📋 ${description}`, 'blue');
  log(`🔧 Running: ${command}`, 'cyan');
  try {
    execSync(command, { stdio: 'inherit' });
    log(`✅ ${description} completed successfully`, 'green');
  } catch (error) {
    log(`❌ ${description} failed`, 'red');
    process.exit(1);
  }
}

function updateVersion() {
  const appJsonPath = path.join(__dirname, '..', 'app.json');
  const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
  
  const currentVersion = appJson.expo.version;
  const versionParts = currentVersion.split('.').map(Number);
  versionParts[2]++; // Increment patch version
  
  const newVersion = versionParts.join('.');
  appJson.expo.version = newVersion;
  
  fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2));
  log(`📈 Version updated from ${currentVersion} to ${newVersion}`, 'green');
  
  return newVersion;
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  log('🚀 Broku Expense Tracker - OTA Update Manager', 'magenta');
  log('================================================', 'magenta');

  switch (command) {
    case 'build-production-apk':
      log('\n🏗️  Building Production APK with OTA Support', 'yellow');
      execCommand('eas build --platform android --profile production-apk', 'Building production APK');
      break;

    case 'publish-ota':
      const channel = args[1] || 'production';
      const message = args[2] || `OTA update for ${new Date().toISOString()}`;
      
      log(`\n📱 Publishing OTA Update to ${channel} channel`, 'yellow');
      updateVersion();
      execCommand(`eas update --channel ${channel} --message "${message}"`, 'Publishing OTA update');
      break;

    case 'setup':
      log('\n⚙️  Setting up OTA Updates for the first time', 'yellow');
      execCommand('eas login', 'Logging into EAS');
      execCommand('eas build:configure', 'Configuring EAS Build');
      execCommand('eas update:configure', 'Configuring EAS Update');
      log('\n✅ OTA setup completed! You can now build and publish updates.', 'green');
      break;

    case 'status':
      log('\n📊 Checking OTA Update Status', 'yellow');
      execCommand('eas update:list --limit 10', 'Fetching recent updates');
      break;

    case 'rollback':
      const rollbackChannel = args[1] || 'production';
      log(`\n⏪ Rolling back ${rollbackChannel} channel`, 'yellow');
      execCommand(`eas update:rollback --channel ${rollbackChannel}`, 'Rolling back update');
      break;

    default:
      log('\n📚 Available Commands:', 'blue');
      log('npm run ota:setup                    - Initial OTA setup', 'cyan');
      log('npm run ota:build                    - Build production APK with OTA', 'cyan');
      log('npm run ota:publish [channel] [msg]  - Publish OTA update', 'cyan');
      log('npm run ota:status                   - Check update status', 'cyan');
      log('npm run ota:rollback [channel]       - Rollback to previous version', 'cyan');
      log('\nExamples:', 'yellow');
      log('npm run ota:publish production "Bug fixes and improvements"', 'green');
      log('npm run ota:rollback production', 'green');
      break;
  }
}

main().catch(console.error);
