# Quick Start: Deploy to Cloudflare Pages

## 🚀 Fast Track (5 minutes)

### 1️⃣ Generate icons (required for PWA)
Visit https://convertio.co/svg-png/
- Upload `icon.svg`
- Convert and download
- Save as `icon-192.png` (192x192) and `icon-512.png` (512x512)

### 2️⃣ Initialize Git
```powershell
git init
git add .
git commit -m "Initial commit"
```

### 3️⃣ Push to GitHub
Create repo at https://github.com/new
```powershell
git remote add origin https://github.com/YOUR-USERNAME/fuel-prices-france.git
git branch -M main
git push -u origin main
```

### 4️⃣ Deploy on Cloudflare
1. Go to https://dash.cloudflare.com/
2. Click **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
3. Select your repo → **Save and Deploy**
4. Done! Your site is live at `YOUR-PROJECT.pages.dev`

## 📖 Need help?
See [CLOUDFLARE-DEPLOY.md](CLOUDFLARE-DEPLOY.md) for detailed instructions.
