# 🚀 Production Deployment Guide

## Prerequisites
- EAS CLI installed: `npm install -g @expo/eas-cli`
- EAS Account logged in: `eas login`
- MongoDB Atlas account for production database
- Google AI API key for AI features
- Render/Railway/Heroku account for backend hosting

## 📋 Deployment Checklist

### 1. Backend Deployment (Server)

#### Option A: Deploy to Render
1. Push your code to GitHub
2. Connect Render to your GitHub repository
3. Create a new Web Service on Render
4. Set environment variables:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/expense-tracker
   GOOGLE_AI_API_KEY=your_google_ai_api_key
   NODE_ENV=production
   PORT=5000
   JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters
   ```
5. Deploy and note your backend URL (e.g., https://broku-backend.onrender.com)

#### Option B: Deploy to Railway
1. Install Railway CLI: `npm install -g @railway/cli`
2. Login: `railway login`
3. Initialize: `railway init`
4. Deploy: `railway up`
5. Set environment variables in Railway dashboard

#### Option C: Deploy to Heroku
1. Install Heroku CLI
2. Login: `heroku login`
3. Create app: `heroku create broku-backend`
4. Set config vars: `heroku config:set MONGODB_URI=...`
5. Deploy: `git push heroku main`

### 2. Update Client Configuration

1. Update `client/config/env.ts` with your production backend URL:
   ```typescript
   const productionConfig: AppConfig = {
     API_BASE_URL: 'https://your-backend-url.com/api',
     ENVIRONMENT: 'production',
   };
   ```

### 3. Build and Submit Mobile App

#### Android Production Build
```bash
cd client
eas build --platform android --profile production
```

#### iOS Production Build
```bash
cd client
eas build --platform ios --profile production
```

#### Submit to App Stores
```bash
# Android (Google Play Store)
eas submit --platform android

# iOS (Apple App Store)
eas submit --platform ios
```

### 4. Testing Production Build

1. Test backend health: `curl https://your-backend-url.com/api/health`
2. Test API endpoints with production data
3. Install production APK/IPA and test all features
4. Verify AI features work with production backend

## 🔧 Environment Variables Setup

### Backend (.env file)
```env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/expense-tracker?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
GOOGLE_AI_API_KEY=your-google-ai-api-key-here
FRONTEND_URL=https://your-app-domain.com
```

### Client (automatically handled by env.ts)
- Development builds use local IP
- Production builds use production backend URL

## 📱 Store Submission

### Google Play Store
1. Create developer account ($25 fee)
2. Prepare store listing (screenshots, descriptions)
3. Upload AAB file from EAS build
4. Set up app signing
5. Submit for review

### Apple App Store
1. Create Apple Developer account ($99/year)
2. Create app in App Store Connect
3. Upload IPA file from EAS build
4. Set up App Store metadata
5. Submit for review

## 🔍 Monitoring & Maintenance

### Backend Monitoring
- Monitor server logs on your hosting platform
- Set up error tracking (Sentry, LogRocket)
- Monitor database performance on MongoDB Atlas
- Set up uptime monitoring

### App Analytics
- Integrate analytics (Firebase, Amplitude)
- Monitor crash reports
- Track user engagement
- Monitor AI API usage

## 🆘 Troubleshooting

### Common Issues
1. **CORS errors**: Update CORS settings in server
2. **API connection**: Check production URL in config
3. **AI not working**: Verify Google AI API key
4. **Database connection**: Check MongoDB URI
5. **Build failures**: Check EAS build logs

### Debug Commands
```bash
# Check backend health
curl https://your-backend-url.com/api/health

# Test AI endpoint
curl -X POST https://your-backend-url.com/api/ai/overview

# View EAS build logs
eas build:list

# Check app logs
npx expo logs
```

## 🎉 Post-Deployment

1. Update app store listings with screenshots
2. Set up user feedback collection
3. Plan feature updates and releases
4. Monitor user reviews and ratings
5. Set up backup strategies for database

Your Broku expense tracker with AI features is now ready for production! 🚀
