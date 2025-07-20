# 🚀 OTA (Over-the-Air) Updates Guide for Broku Expense Tracker

This guide explains how to set up and deploy OTA updates for your Expo app in production APK format.

## 📋 Prerequisites

1. **EAS CLI installed**: `npm install -g eas-cli`
2. **Expo account**: Sign up at [expo.dev](https://expo.dev)
3. **EAS subscription**: Required for OTA updates (free tier available)

## ⚙️ Initial Setup

### 1. Configure EAS (One-time setup)

```bash
# Login to your Expo account
npm run ota:setup
```

This will:
- Log you into EAS
- Configure EAS Build
- Configure EAS Update
- Set up channels for updates

### 2. Build Production APK with OTA Support

```bash
# Build production APK with OTA capabilities
npm run ota:build
```

This creates an APK that can receive OTA updates from the `production` channel.

## 📱 Publishing OTA Updates

### Basic Update (Auto-increment version)

```bash
# Publish to production channel
npm run ota:publish

# Publish to specific channel with message
npm run ota:publish production "Bug fixes and performance improvements"

# Publish to preview channel
npm run ota:publish preview "Testing new features"
```

### Manual Update Commands

```bash
# Check update status
npm run ota:status

# Rollback to previous version
npm run ota:rollback production
```

## 🏗️ Build Profiles Explained

### `production-apk` Profile
- **Format**: APK (Android Package)
- **Distribution**: Internal (for manual distribution)
- **Channel**: `production`
- **Use Case**: Direct APK distribution with OTA support

### `production` Profile  
- **Format**: AAB (Android App Bundle)
- **Distribution**: Store (Google Play)
- **Channel**: `production`
- **Use Case**: Play Store distribution

## 📊 Update Channels

| Channel | Purpose | Usage |
|---------|---------|-------|
| `development` | Active development | Testing latest features |
| `preview` | Pre-release testing | Stakeholder review |
| `production` | Live app users | Stable releases |

## 🔄 OTA Update Workflow

### For Feature Updates

1. **Develop**: Make your changes
2. **Test**: Test locally with `expo start`
3. **Preview**: 
   ```bash
   npm run ota:publish preview "Feature XYZ preview"
   ```
4. **Production**:
   ```bash
   npm run ota:publish production "Added Feature XYZ"
   ```

### For Bug Fixes

1. **Fix**: Implement the fix
2. **Test**: Verify the fix works
3. **Hotfix**:
   ```bash
   npm run ota:publish production "Hotfix: Fixed critical bug"
   ```

### For Emergency Rollback

```bash
npm run ota:rollback production
```

## 📲 User Experience

### Automatic Updates
- App checks for updates on startup (after 3-second delay)
- Users see a dialog when updates are available
- Updates download in background
- App restarts to apply updates

### Manual Check
Users can manually check for updates through the app (if you implement the UI).

## 🚨 Important Limitations

### What CAN be updated via OTA:
- ✅ JavaScript code changes
- ✅ React components updates
- ✅ Business logic modifications
- ✅ Styling changes
- ✅ API endpoint changes
- ✅ Configuration updates

### What CANNOT be updated via OTA:
- ❌ Native code changes
- ❌ New native dependencies
- ❌ App permissions changes
- ❌ App icon or splash screen
- ❌ SDK version updates
- ❌ Build configuration changes

For changes that can't be OTA updated, you need to build and distribute a new APK.

## 📝 Version Management

The OTA script automatically increments the patch version (x.x.X) for each update:
- `2.0.0` → `2.0.1` → `2.0.2`

For major/minor version changes, manually update `app.json`:
```json
{
  "expo": {
    "version": "2.1.0"
  }
}
```

## 🔧 Troubleshooting

### Update Not Appearing
1. Check channel configuration in `eas.json`
2. Verify app was built with correct profile
3. Ensure runtime versions match
4. Check EAS dashboard for update status

### Build Failures
1. Ensure all dependencies are compatible
2. Check for TypeScript errors
3. Verify native dependencies haven't changed
4. Clear build cache: `eas build --clear-cache`

### Runtime Errors After Update
1. Rollback immediately: `npm run ota:rollback production`
2. Test updates in preview channel first
3. Check for breaking changes in dependencies

## 📈 Best Practices

1. **Test in Preview First**: Always test updates in preview channel
2. **Gradual Rollouts**: Consider implementing staged rollouts
3. **Monitor Metrics**: Watch crash reports after updates
4. **Rollback Plan**: Always be ready to rollback
5. **Communication**: Inform users about significant updates
6. **Backup**: Keep track of working versions

## 🔐 Security Considerations

1. **Code Signing**: EAS automatically signs your updates
2. **Channel Security**: Use different channels for different environments
3. **Access Control**: Limit who can publish updates
4. **Audit Trail**: EAS provides update history

## 📊 Monitoring Updates

### EAS Dashboard
Visit [expo.dev](https://expo.dev) to:
- View update history
- Monitor download statistics
- Track deployment status
- Manage channels

### App Analytics
Consider implementing analytics to track:
- Update success rates
- User adoption of updates
- Performance after updates
- Crash rates post-update

## 🆘 Emergency Procedures

### Critical Bug Found
1. **Immediate Rollback**:
   ```bash
   npm run ota:rollback production
   ```

2. **Fix and Redeploy**:
   ```bash
   # Fix the issue
   npm run ota:publish production "Critical fix for [issue]"
   ```

### Update Stuck/Corrupted
1. Users can force-refresh by closing and reopening the app
2. Consider publishing a new update to fix corruption
3. In extreme cases, may need new APK build

---

## 🎯 Quick Reference Commands

```bash
# Setup (one-time)
npm run ota:setup

# Build APK with OTA support
npm run ota:build

# Publish updates
npm run ota:publish [channel] [message]

# Check status
npm run ota:status

# Rollback
npm run ota:rollback [channel]
```

Happy updating! 🚀
