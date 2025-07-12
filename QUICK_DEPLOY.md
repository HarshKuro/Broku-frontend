# 🚀 Production Deployment Quick Start

## 🎯 Quick Steps to Deploy Broku

### 1. Backend (5 minutes)
1. Sign up for [Render](https://render.com) (free tier available)
2. Connect your GitHub repository
3. Create new Web Service
4. Set these environment variables:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `GOOGLE_AI_API_KEY`: Your Google AI API key
   - `NODE_ENV`: production
   - `PORT`: 5000
5. Deploy! 🚀

### 2. Update Client (1 minute)
Update `client/config/env.ts`:
```typescript
const productionConfig: AppConfig = {
  API_BASE_URL: 'https://your-render-app.onrender.com/api',
  ENVIRONMENT: 'production',
};
```

### 3. Build Mobile App (10 minutes)
```bash
cd client
npm install -g @expo/eas-cli
eas login
eas build --platform android --profile production
```

### 4. Test & Submit
1. Download APK from EAS dashboard
2. Install and test on device
3. Submit to Google Play Store

## 🔗 Useful Links
- [MongoDB Atlas](https://cloud.mongodb.com) - Free database
- [Google AI Studio](https://aistudio.google.com) - Get API key
- [Render](https://render.com) - Free backend hosting
- [EAS Build](https://expo.dev/eas) - Mobile app builds

## 🆘 Need Help?
Check `DEPLOYMENT_GUIDE.md` for detailed instructions!
