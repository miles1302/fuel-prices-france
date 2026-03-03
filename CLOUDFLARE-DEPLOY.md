# Cloudflare Pages Deployment Guide 🚀

## Step 1: Generate Icons (Important!)

Before deploying, you need to create the PNG icons from the SVG:

### Option A: Online Converter (Easiest)
1. Go to https://convertio.co/svg-png/
2. Upload `icon.svg`
3. Download as PNG
4. Resize to 192x192 → Save as `icon-192.png`
5. Resize to 512x512 → Save as `icon-512.png`

### Option B: With ImageMagick
```powershell
.\generate-icons.bat
```

---

## Step 2: Initialize Git Repository

```powershell
cd c:\dev\perso\fuel-prices-france

# Initialize repository
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit: Fuel prices France PWA"
```

---

## Step 3: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `fuel-prices-france` (or any name you prefer)
3. Keep it **Public** (required for free Cloudflare Pages)
4. Don't initialize with README (we already have files)
5. Click **Create repository**

---

## Step 4: Push to GitHub

Copy the commands from GitHub (they'll look like this):

```powershell
git remote add origin https://github.com/YOUR-USERNAME/fuel-prices-france.git
git branch -M main
git push -u origin main
```

---

## Step 5: Deploy to Cloudflare Pages

### A. Sign up / Login
1. Go to https://dash.cloudflare.com/
2. Click **Sign up** (free) or **Log in**
3. You may need to verify your email

### B. Create Pages Project
1. In the dashboard, click **Workers & Pages** (left sidebar)
2. Click **Create application**
3. Click **Pages** tab
4. Click **Connect to Git**

### C. Connect GitHub
1. Click **Connect GitHub**
2. Authorize Cloudflare Pages
3. Select your `fuel-prices-france` repository
4. Click **Begin setup**

### D. Configure Build Settings
- **Project name**: `fuel-prices-france` (or customize)
- **Production branch**: `main`
- **Build command**: (leave empty - it's a static site)
- **Build output directory**: `/`

### E. Deploy!
1. Click **Save and Deploy**
2. Wait 1-2 minutes for deployment
3. Your site will be live at: `https://fuel-prices-france.pages.dev`

---

## Step 6: Custom Domain (Optional)

### If you have a domain:
1. In Cloudflare Pages, go to your project
2. Click **Custom domains**
3. Click **Set up a custom domain**
4. Enter your domain (e.g., `fuel-prices.yourdomain.com`)
5. Follow DNS instructions
6. HTTPS is automatic!

### Free Cloudflare domain:
- Your site is already live at: `YOUR-PROJECT.pages.dev`
- This works perfectly for PWAs
- HTTPS is enabled automatically

---

## Step 7: Test Your PWA

1. Open your Cloudflare Pages URL on mobile
2. You should see an "Install" prompt
3. Install the app to your home screen
4. Test offline functionality

---

## Updating Your Site

Whenever you make changes:

```powershell
cd c:\dev\perso\fuel-prices-france

git add .
git commit -m "Description of changes"
git push
```

Cloudflare Pages will **automatically redeploy** in ~1 minute!

---

## Troubleshooting

### Icons not showing
- Make sure `icon-192.png` and `icon-512.png` exist
- Check browser console for errors

### PWA not installable
- Must be served over HTTPS (Cloudflare does this automatically)
- Icons must be present
- Manifest must be valid

### API CORS errors
- This is expected with the French government API
- Users can click "Use demo data" button
- Or you can set up a CORS proxy (advanced)

---

## Performance Tips

Your site on Cloudflare Pages will have:
- ✅ Global CDN (super fast worldwide)
- ✅ Automatic HTTPS
- ✅ Unlimited bandwidth (free tier)
- ✅ DDoS protection
- ✅ Automatic deployments from Git

---

## Cost

**100% FREE** for:
- 1 build at a time
- 500 builds per month
- Unlimited requests
- Unlimited bandwidth

This is more than enough for your project!

---

## Next Steps

After deployment, share your site:
- Direct link: `https://YOUR-PROJECT.pages.dev`
- Works on any device
- Installable as PWA on mobile
- Fast global access via Cloudflare CDN

Enjoy your deployed app! 🎉
