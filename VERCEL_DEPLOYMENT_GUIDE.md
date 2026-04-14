# 🚀 Vercel Frontend Deployment Guide

GigShield frontend is now ready for deployment on Vercel! Follow this step-by-step guide.

## Prerequisites

- GitHub repository with latest code pushed
- Vercel account (free at https://vercel.com)
- Backend API endpoint (for VITE_API_URL)

---

## Step 1: Push Latest Changes to GitHub

```bash
cd frontend
git add .
git commit -m "Configure for Vercel deployment"
git push origin master
```

---

## Step 2: Create Vercel Account & Project

### Option A: Deploy via GitHub (Recommended - Auto-updates)

1. Go to https://vercel.com
2. Sign up/Log in with GitHub account
3. Click "Import Project"
4. Select your GitHub repository (`somendhra/Dev_Trail`)
5. Select the `frontend` folder as the **Root Directory**
6. Click "Deploy"

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from frontend directory
cd frontend
vercel
```

---

## Step 3: Set Environment Variables

After project creation, set the backend API URL in Vercel dashboard:

1. Go to **Project Settings** → **Environment Variables**
2. Add new variable:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://your-backend-api.com` (or your backend URL)
   - **Environments**: Production, Preview, Development

**Examples of Backend URLs:**
- Local testing: `http://localhost:4000`
- Docker Compose: `http://localhost:4000`
- Render.com: `https://gigshield-api-xxxxx.onrender.com`
- Railway.app: `https://gigshield-api-xxxxx.railway.app`
- AWS EC2: `https://api.example.com`

---

## Step 4: Configure Build Settings (if needed)

In Vercel Dashboard → **Settings** → **Build & Development Settings**:

- **Build Command**: `npm run build` (Pre-configured)
- **Output Directory**: `dist` (Pre-configured)
- **Install Command**: `npm install` (Pre-configured)

---

## Step 5: Deploy!

Once environment variables are set:

1. Go to **Deployments** tab
2. Click the latest deployment (or re-deploy)
3. Wait for build to complete (~3-5 minutes)
4. Click the generated URL when ready

---

## ✅ Success Indicators

After deployment:

```
✅ Frontend builds successfully
✅ Deployment URL generated (e.g., https://gigshield-frontend.vercel.app)
✅ Environment variables loaded
✅ API calls work (check Network tab in DevTools)
✅ Dashboard loads without errors
```

---

## 🧪 Testing Deployment

### 1. Check if frontend loads
```
https://your-project.vercel.app/
```

### 2. Check console for errors
- Open DevTools (F12)
- Check **Console** and **Network** tabs
- Verify API calls to backend are working

### 3. Test login
- Use test credentials:
  - Email: `somendhrakarthik2006@gmail.com`
  - Password: `Sommu@123`

### 4. Monitor build logs
- Vercel Dashboard → **Deployments** → Click deployment
- View **Build Logs** if there are issues

---

## 🐛 Troubleshooting

### Issue: API calls failing (CORS error)

**Solution**: Update `VITE_API_URL` environment variable
```
Check your backend is accessible
Are you deploying backend too?
Update the URL in Vercel environment variables
```

### Issue: Frontend builds but shows blank page

**Solution**: Check environment variables
```
1. Go to Vercel Dashboard
2. Settings → Environment Variables
3. Verify VITE_API_URL is set correctly
4. Re-deploy (Redeploy button)
```

### Issue: API timeout or 502 error

**Solution**: Backend might be down
```
1. Check if backend is deployed and running
2. Test backend directly: curl https://your-backend-api.com/api/health
3. Update VITE_API_URL if backend changed
```

### Issue: Images not loading

**Solution**: Check public assets path
```
Images must be in frontend/public/assets/
Reference as: /assets/image.png
Built into: dist/assets/image.png
```

---

## 🔄 Automatic Deployments

Once linked to GitHub:

- **Every push to master** → Auto-deploys
- **Pull requests** → Preview deployments
- **Rollback** → Click previous deployment

Disable auto-deploy in **Settings** → **Git** if needed.

---

## 📦 Build Output

Vercel will generate static files in `dist/`:

```
dist/
├── index.html          # Main entry point
├── assets/
│   ├── index-xxxxx.js  # Bundled JS
│   ├── index-xxxxx.css # Bundled CSS
│   └── adminbanner.png # Public assets
└── favicon.ico
```

These are served globally via Vercel's CDN (fast worldwide delivery).

---

## 🚀 Next Steps

### Deploy Backend Too
- **Option 1**: Render.com (free tier)
- **Option 2**: Railway.app
- **Option 3**: AWS EC2
- **Option 4**: DigitalOcean

Once backend is deployed, update `VITE_API_URL` in Vercel.

### Custom Domain
1. Vercel Dashboard → **Settings** → **Domains**
2. Add your domain (e.g., `app.gigshield.com`)
3. Follow DNS instructions

### Enable Auto-scaling
- Vercel automatically scales based on traffic
- No configuration needed
- Pay only for what you use

---

## 💡 Pro Tips

1. **Use Preview Deployments**: Every PR gets a unique URL
2. **Check Analytics**: Vercel Dashboard → **Analytics** (Pro plan)
3. **Enable Edge Caching**: Settings → Caching (auto-enabled)
4. **Use Vercel KV for 🏠 State**: If needed for caching (Pro plan)

---

## 📞 Support

- **Vercel Docs**: https://vercel.com/docs
- **GitHub Issues**: Report bugs in repository
- **Vercel Community**: https://vercel.com/support

---

## ✅ Deployment Checklist

- [ ] GitHub repository with latest code
- [ ] Backend API deployed and accessible
- [ ] Vercel account created
- [ ] Project imported to Vercel
- [ ] Environment variables set (`VITE_API_URL`)
- [ ] Build completes successfully
- [ ] Frontend loads without errors
- [ ] API calls work (test login)
- [ ] Images load correctly
- [ ] Mobile responsive (test on mobile)

---

**Status**: Ready for Vercel deployment 🚀

Your GigShield frontend is configured and ready to go live!
