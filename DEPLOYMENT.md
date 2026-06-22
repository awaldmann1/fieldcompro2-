# Deployment Guide

## Quick Start Deployment Options

### Option 1: Netlify (Recommended - Easiest)

#### Method A: Drag & Drop
1. Build the project: `npm run build`
2. Go to [Netlify Drop](https://app.netlify.com/drop)
3. Drag the `dist` folder to the upload area
4. Your site is live! (gets a random URL like `random-name-123.netlify.app`)

#### Method B: Git Integration
1. Push this repository to GitHub
2. Go to [Netlify](https://app.netlify.com)
3. Click "Add new site" → "Import an existing project"
4. Connect your GitHub repository
5. Build settings (auto-detected from `netlify.toml`):
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Click "Deploy site"
7. Your site auto-deploys on every push!

### Option 2: Vercel

1. Push this repository to GitHub
2. Go to [Vercel](https://vercel.com)
3. Click "New Project"
4. Import your repository
5. Settings (auto-detected from `vercel.json`):
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. Click "Deploy"
7. Auto-deploys on every push!

### Option 3: GitHub Pages

1. Build the project: `npm run build`
2. Install gh-pages: `npm install -g gh-pages`
3. Deploy: `gh-pages -d dist`
4. Enable GitHub Pages in repository settings
5. Select the `gh-pages` branch
6. Your site will be at: `https://[username].github.io/[repo-name]/`

**Note:** For GitHub Pages, you may need to update `vite.config.js`:
```javascript
base: '/your-repo-name/'
```

### Option 4: AWS S3 + CloudFront

1. Build the project: `npm run build`
2. Create an S3 bucket (e.g., `my-fieldcomm-app`)
3. Enable static website hosting
4. Upload the contents of the `dist` folder
5. Set bucket policy for public read access
6. (Optional) Create CloudFront distribution for HTTPS and CDN
7. Your site is live!

### Option 5: Any Static Host

The built application in the `dist` folder is just static HTML, CSS, and JavaScript. You can deploy it to:
- Firebase Hosting
- Cloudflare Pages
- Render
- Surge
- Any web server (Apache, Nginx, etc.)

Just upload the contents of the `dist` folder to your hosting provider.

## Build Commands

```bash
# Install dependencies
npm install

# Development server (with hot reload)
npm run dev

# Production build
npm run build

# Preview production build locally
npm run preview
```

## Environment Requirements

- Node.js 16+ 
- npm 7+

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari 14+, Chrome Mobile 90+)

## Features Requiring HTTPS

Some features require HTTPS in production:
- Voice recognition (Web Speech API)
- Camera/photo uploads
- Geolocation (if added)

All major deployment platforms (Netlify, Vercel, etc.) provide HTTPS by default.

## Troubleshooting

### Build Fails
- Check Node.js version: `node --version` (should be 16+)
- Clear node_modules and reinstall: `rm -rf node_modules package-lock.json && npm install`
- Check for errors in console

### Voice Recognition Not Working
- Ensure site is served over HTTPS
- Check browser permissions for microphone access
- Voice recognition requires Web Speech API support

### Routing Issues (404 on Refresh)
- Ensure your hosting platform is configured for SPA routing
- Netlify: Check `netlify.toml` redirects
- Vercel: Check `vercel.json` rewrites
- Other hosts: Configure server to serve `index.html` for all routes

## Performance Optimization

The build is already optimized with:
- Code splitting
- Tree shaking
- Minification
- Gzip compression

Typical bundle sizes:
- JavaScript: ~256 KB (~80 KB gzipped)
- CSS: ~54 KB (~9 KB gzipped)
- Total: ~310 KB (~90 KB gzipped)

## Custom Domain

After deploying to Netlify or Vercel:
1. Go to domain settings in your platform
2. Add your custom domain
3. Update your DNS records (platform will provide instructions)
4. SSL certificate is automatically provisioned

## Continuous Deployment

Both Netlify and Vercel automatically deploy when you:
1. Push to your main/master branch
2. Create a pull request (preview deployment)
3. Merge pull requests

No additional configuration needed!
