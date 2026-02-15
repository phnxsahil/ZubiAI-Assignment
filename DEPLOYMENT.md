# Deployment Guide

## Overview

This guide covers deploying the Storytime with Sunny application to production. The app consists of two parts:
- **Backend:** Node.js/Express API server
- **Frontend:** Static React application

## Backend Deployment

### Option 1: Railway (Recommended for Beginners)

1. **Create account:** [railway.app](https://railway.app)

2. **Deploy from GitHub:**
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Set root directory: `backend`

3. **Set Environment Variables:**
   ```
   GEMINI_API_KEY=your_key
   ELEVENLABS_API_KEY=your_key  
   ELEVENLABS_VOICE_ID=your_voice_id
   FRONTEND_URL=https://your-frontend-url.com
   PORT=3001
   ```

4. **Deploy:** Railway auto-deploys on git push

### Option 2: Render

1. **Create account:** [render.com](https://render.com)

2. **New Web Service:**
   - Connect GitHub repository
   - Root Directory: `backend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

3. **Environment Variables:** Add same as above

### Option 3: Heroku

```bash
# Install Heroku CLI
cd backend

# Login and create app
heroku login
heroku create your-app-name

# Set environment variables
heroku config:set GEMINI_API_KEY=your_key
heroku config:set ELEVENLABS_API_KEY=your_key
heroku config:set ELEVENLABS_VOICE_ID=your_voice_id
heroku config:set FRONTEND_URL=https://your-frontend.com

# Add Procfile
echo "web: node dist/server.js" > Procfile

# Deploy
git subtree push --prefix backend heroku main
```

### Option 4: VPS (DigitalOcean, Linode, AWS EC2)

```bash
# On your server
sudo apt update
sudo apt install nodejs npm

# Clone repository
git clone your-repo-url
cd your-repo/backend

# Install dependencies
npm install
npm run build

# Set up PM2 for process management
npm install -g pm2
pm2 start dist/server.js --name storytime-backend
pm2 save
pm2 startup

# Set up Nginx reverse proxy
sudo apt install nginx
sudo nano /etc/nginx/sites-available/storytime
```

Nginx config:
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Frontend Deployment

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Deploy:**
```bash
cd frontend
vercel
```

3. **Configure:**
   - Set environment variable: `VITE_API_URL=https://your-backend-url.com`
   - Vercel auto-detects Vite

4. **Production:**
```bash
vercel --prod
```

### Option 2: Netlify

1. **Create account:** [netlify.com](https://netlify.com)

2. **Deploy:**
   - Drag `frontend/dist` folder to Netlify
   - Or connect GitHub repo

3. **Build Settings:**
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/dist`

4. **Environment Variables:**
   - `VITE_API_URL=https://your-backend-url.com`

### Option 3: GitHub Pages (with Backend Proxy)

```bash
cd frontend

# Install gh-pages
npm install --save-dev gh-pages

# Add to package.json scripts
"predeploy": "npm run build",
"deploy": "gh-pages -d dist"

# Deploy
npm run deploy
```

**Note:** Update `VITE_API_URL` to your backend URL before building.

### Option 4: AWS S3 + CloudFront

```bash
# Build
cd frontend
npm run build

# Install AWS CLI
aws configure

# Create S3 bucket
aws s3 mb s3://your-bucket-name

# Upload files
aws s3 sync dist/ s3://your-bucket-name --acl public-read

# Set up CloudFront distribution
aws cloudfront create-distribution \
  --origin-domain-name your-bucket-name.s3.amazonaws.com
```

## Environment Configuration

### Backend Environment Variables

Required:
```env
PORT=3001
GEMINI_API_KEY=your_gemini_api_key
ELEVENLABS_API_KEY=your_elevenlabs_api_key
```

Optional:
```env
ELEVENLABS_VOICE_ID=JBFqnCBsd6RMkjVDRZzb
FRONTEND_URL=https://your-frontend.com
NODE_ENV=production
```

### Frontend Environment Variables

```env
VITE_API_URL=https://your-backend-api.com
```

## Security Checklist

### Backend
- [ ] Environment variables set (never commit `.env`)
- [ ] CORS configured with specific origin (not `*`)
- [ ] Rate limiting implemented
- [ ] HTTPS enabled
- [ ] API keys secured
- [ ] Error messages don't expose sensitive info
- [ ] Dependencies updated (`npm audit`)

### Frontend
- [ ] API URL points to production backend
- [ ] No API keys in frontend code
- [ ] Content Security Policy configured
- [ ] HTTPS enabled
- [ ] Build optimized (`npm run build`)

## Post-Deployment

### 1. Verify Endpoints

```bash
# Health check
curl https://your-backend.com/health

# Test chat endpoint
curl -X POST https://your-backend.com/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello","conversationHistory":[]}'
```

### 2. Monitor Logs

**Railway/Render:** Check dashboard logs

**Heroku:**
```bash
heroku logs --tail
```

**VPS:**
```bash
pm2 logs storytime-backend
```

### 3. Set Up Monitoring (Optional)

- **Uptime:** [UptimeRobot](https://uptimerobot.com)
- **Errors:** [Sentry](https://sentry.io)
- **Analytics:** [Google Analytics](https://analytics.google.com)
- **Logs:** [LogRocket](https://logrocket.com)

## Performance Optimization

### Backend
1. **Caching:** Implement Redis for frequent requests
2. **Compression:** Enable gzip
   ```javascript
   import compression from 'compression';
   app.use(compression());
   ```
3. **Rate Limiting:**
   ```javascript
   import rateLimit from 'express-rate-limit';
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000,
     max: 100
   });
   app.use(limiter);
   ```

### Frontend
1. **Code Splitting:** Already handled by Vite
2. **CDN:** Use CloudFlare or AWS CloudFront
3. **Image Optimization:** Compress images before deployment
4. **Bundle Analysis:**
   ```bash
   npm run build -- --mode analyze
   ```

## Scaling

### Backend Scaling
- **Horizontal:** Deploy multiple instances behind load balancer
- **Vertical:** Increase CPU/RAM on hosting platform
- **Database:** Add PostgreSQL/MongoDB for persistence
- **Queue:** Use Redis/RabbitMQ for async processing

### Frontend Scaling
- **CDN:** Distribute via CloudFlare
- **Caching:** Set proper cache headers
- **Lazy Loading:** Already implemented

## Costs Estimate

### Free Tier Options
- **Backend:** Railway (500 hrs/month), Render (750 hrs/month)
- **Frontend:** Vercel (100GB bandwidth), Netlify (100GB bandwidth)
- **Total:** $0/month for moderate usage

### Paid Options
- **Backend:** $7-20/month (Railway, Render, Heroku)
- **Frontend:** $0 (static hosting is usually free)
- **APIs:** 
  - Gemini: Free tier (20 req/min)
  - ElevenLabs: $5-$99/month

## Troubleshooting

### CORS Errors
- Update `FRONTEND_URL` in backend `.env`
- Check CORS configuration in `server.ts`

### Build Failures
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

### API Key Not Working
- Verify keys in hosting platform environment variables
- Check for extra spaces or quotes
- Regenerate keys if necessary

## Rollback Strategy

### Quick Rollback (Railway/Render)
- Use platform's rollback feature in dashboard

### Manual Rollback (Vercel)
```bash
vercel rollback
```

### Git Rollback
```bash
git revert HEAD
git push
```

## Backup Strategy

1. **Code:** GitHub (already backed up)
2. **Environment Variables:** Store securely in password
 manager
3. **User Data:** If you add database, set up automated backups

## Support

- **Backend Issues:** Check logs first
- **Frontend Issues:** Browser console (F12)
- **API Issues:** Test with curl/Postman
- **Deployment Issues:** Contact hosting support

## Next Steps After Deployment

1. **Custom Domain:** Configure DNS
2. **SSL Certificate:** Enable HTTPS (usually automatic)
3. **Monitoring:** Set up health checks
4. **Analytics:** Track usage
5. **Feedback:** Add user feedback mechanism

---

**Congratulations!** Your application is now live! 🎉

Remember to:
- Monitor your API usage costs
- Keep dependencies updated
- Backup environment variables
- Test thoroughly before each deployment
