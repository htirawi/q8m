# Deployment Configurations

This folder contains optional deployment configuration files for various hosting platforms.

## 📁 Contents

### `/configs/`

**nginx.conf** - NGINX configuration for serving the frontend

- Use if deploying with NGINX reverse proxy
- Includes security headers, gzip compression, SPA routing
- **Not needed** if using Netlify/Vercel or Node.js serving

**netlify.toml** - Netlify deployment configuration

- Use if deploying frontend to Netlify
- **Not needed** for backend deployment (use Railway/Render/Fly.io instead)
- Contains build settings and security headers

## 🚀 Deployment Options

### Backend (Node.js/Fastify Server)

Recommended platforms:

- **Railway** - Easiest, auto-deploys from git
- **Render** - Free tier, good for small projects
- **Fly.io** - Global edge deployment
- **DigitalOcean App Platform** - Managed platform
- **AWS ECS/Elastic Beanstalk** - Enterprise scale

### Frontend (Vue Client)

Recommended platforms:

- **Vercel** - Best for Vue/React apps, auto-deploys
- **Netlify** - Similar to Vercel, use `netlify.toml`
- **Cloudflare Pages** - Fast CDN, free tier
- **NGINX** - Self-hosted, use `nginx.conf`

## 📝 Usage

### Using Netlify

1. Copy `configs/netlify.toml` to root
2. Connect Netlify to your git repository
3. Deploy automatically on push

### Using NGINX

1. Copy `configs/nginx.conf` to your server
2. Update paths and domain names
3. Reload NGINX: `sudo nginx -s reload`

### Docker Deployment

See `Dockerfile` and `docker-compose.yml` in root

## 🔧 Configuration Notes

These files are **optional** and only needed for specific deployment scenarios. Most modern platforms (Vercel, Netlify, Railway) auto-detect project type and configure automatically.

## 🔒 Security

Both configs include security headers:

- X-Frame-Options
- X-Content-Type-Options
- Referrer-Policy
- Content-Security-Policy (CSP)

Update these based on your security requirements.

---

_Note: These configs are kept here for reference. Use them only if your deployment platform requires them._
