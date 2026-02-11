# Deployment Guide

Complete guide for deploying Smart Waste Segregator to production.

## 🎯 Deployment Options

### Option 1: Platform as a Service (Recommended)
- **Frontend**: Vercel
- **Backend**: Railway or Render
- **Model Service**: Railway or Render
- **Database**: MongoDB Atlas

### Option 2: Docker Containers
- **Platform**: AWS ECS, Google Cloud Run, or DigitalOcean
- **All services**: Containerized

### Option 3: Traditional VPS
- **Platform**: DigitalOcean, Linode, or AWS EC2
- **Setup**: Manual configuration

---

## 📦 Option 1: Platform Deployment (Easiest)

### Step 1: MongoDB Atlas Setup

1. **Create Account**
   - Go to https://www.mongodb.com/cloud/atlas
   - Sign up for free account

2. **Create Cluster**
   - Choose M0 (Free tier)
   - Select region closest to your users
   - Name your cluster

3. **Configure Access**
   - Database Access → Add User
   - Network Access → Add IP (0.0.0.0/0 for development)
   - Get connection string

4. **Connection String Format**
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/waste-segregator?retryWrites=true&w=majority
   ```

### Step 2: Deploy Backend (Railway)

1. **Create Railway Account**
   - Go to https://railway.app
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Select `backend` folder

3. **Configure Environment Variables**
   ```env
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=<your_mongodb_atlas_uri>
   JWT_SECRET=<generate_strong_secret>
   JWT_EXPIRE=7d
   MODEL_SERVICE_URL=<your_model_service_url>
   FRONTEND_URL=<your_frontend_url>
   ```

4. **Deploy**
   - Railway auto-deploys on push
   - Get your backend URL: `https://your-app.railway.app`

### Step 3: Deploy Model Service (Railway)

1. **Create New Service**
   - In same Railway project
   - Add new service from GitHub
   - Select `model-service` folder

2. **Upload Model File**
   - Use Railway CLI or volume
   ```bash
   railway login
   railway link
   railway volume create
   railway volume mount <volume-id> /app/models
   # Upload your .keras file to volume
   ```

3. **Configure Environment Variables**
   ```env
   MODEL_PATH=/app/models/waste_classifier.keras
   ALLOWED_ORIGINS=<your_frontend_url>,<your_backend_url>
   ```

4. **Deploy**
   - Get your model service URL: `https://your-model.railway.app`

### Step 4: Deploy Frontend (Vercel)

1. **Create Vercel Account**
   - Go to https://vercel.com
   - Sign up with GitHub

2. **Import Project**
   - Click "New Project"
   - Import your GitHub repository
   - Select `frontend` folder

3. **Configure Build Settings**
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. **Environment Variables**
   ```env
   VITE_API_URL=<your_backend_url>
   ```

5. **Deploy**
   - Click "Deploy"
   - Get your frontend URL: `https://your-app.vercel.app`

### Step 5: Update CORS and URLs

1. **Update Backend .env**
   ```env
   FRONTEND_URL=https://your-app.vercel.app
   MODEL_SERVICE_URL=https://your-model.railway.app
   ```

2. **Update Model Service .env**
   ```env
   ALLOWED_ORIGINS=https://your-app.vercel.app,https://your-backend.railway.app
   ```

3. **Redeploy All Services**

---

## 🐳 Option 2: Docker Deployment

### Prerequisites
- Docker installed
- Docker Compose installed
- Domain name (optional)

### Step 1: Prepare Environment

1. **Create Production .env**
   ```env
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://...
   JWT_SECRET=<strong_secret>
   MODEL_SERVICE_URL=http://model-service:8000
   FRONTEND_URL=https://yourdomain.com
   ```

2. **Update docker-compose.yml for Production**
   ```yaml
   version: '3.8'
   
   services:
     frontend:
       build: ./frontend
       ports:
         - "80:80"
       environment:
         - VITE_API_URL=https://api.yourdomain.com
       restart: always
   
     backend:
       build: ./backend
       ports:
         - "5000:5000"
       env_file:
         - .env
       restart: always
       depends_on:
         - model-service
   
     model-service:
       build: ./model-service
       ports:
         - "8000:8000"
       volumes:
         - ./model-service/models:/app/models
       restart: always
   ```

### Step 2: Build and Deploy

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# Check logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Step 3: Setup Nginx (Optional)

```nginx
# /etc/nginx/sites-available/waste-segregator

server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Step 4: SSL Certificate (Let's Encrypt)

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run
```

---

## 🖥️ Option 3: VPS Deployment

### Prerequisites
- Ubuntu 20.04+ VPS
- Root or sudo access
- Domain name

### Step 1: Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Python
sudo apt install -y python3 python3-pip

# Install Nginx
sudo apt install -y nginx

# Install PM2
sudo npm install -g pm2
```

### Step 2: Deploy Backend

```bash
# Clone repository
git clone <your-repo>
cd smart-waste-segregator/backend

# Install dependencies
npm install

# Create .env file
nano .env
# Add your environment variables

# Start with PM2
pm2 start server.js --name waste-backend
pm2 save
pm2 startup
```

### Step 3: Deploy Model Service

```bash
cd ../model-service

# Install dependencies
pip3 install -r requirements.txt

# Start with PM2
pm2 start "uvicorn main:app --host 0.0.0.0 --port 8000" --name waste-model
pm2 save
```

### Step 4: Deploy Frontend

```bash
cd ../frontend

# Install dependencies
npm install

# Build
npm run build

# Copy to Nginx
sudo cp -r dist/* /var/www/html/
```

### Step 5: Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/default
```

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

```bash
# Test and restart Nginx
sudo nginx -t
sudo systemctl restart nginx
```

---

## 🔒 Security Checklist

### Before Deployment
- [ ] Change all default passwords
- [ ] Generate strong JWT secret
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Enable security headers
- [ ] Validate all inputs
- [ ] Sanitize user data
- [ ] Set up MongoDB access control
- [ ] Configure firewall rules

### Environment Variables
- [ ] Never commit .env files
- [ ] Use platform secret management
- [ ] Rotate secrets regularly
- [ ] Use different secrets per environment
- [ ] Limit environment variable access

### Database Security
- [ ] Enable authentication
- [ ] Use strong passwords
- [ ] Whitelist IP addresses
- [ ] Enable encryption at rest
- [ ] Regular backups
- [ ] Monitor access logs

---

## 📊 Monitoring Setup

### Application Monitoring

1. **Sentry (Error Tracking)**
   ```bash
   npm install @sentry/node @sentry/react
   ```

2. **Configure Backend**
   ```javascript
   import * as Sentry from "@sentry/node";
   
   Sentry.init({
     dsn: process.env.SENTRY_DSN,
     environment: process.env.NODE_ENV
   });
   ```

3. **Configure Frontend**
   ```javascript
   import * as Sentry from "@sentry/react";
   
   Sentry.init({
     dsn: process.env.VITE_SENTRY_DSN
   });
   ```

### Uptime Monitoring

1. **UptimeRobot** (Free)
   - Monitor HTTP endpoints
   - Email alerts
   - Status page

2. **Pingdom** (Paid)
   - Advanced monitoring
   - Performance insights
   - Real user monitoring

### Log Management

1. **Papertrail** (Free tier)
   ```bash
   # Install remote_syslog2
   # Configure to send logs
   ```

2. **Logtail** (Free tier)
   - Centralized logging
   - Search and filter
   - Alerts

---

## 🚀 Performance Optimization

### Frontend
- Enable Gzip compression
- Minify assets
- Use CDN for static files
- Implement lazy loading
- Optimize images
- Enable caching

### Backend
- Use Redis for caching
- Enable compression middleware
- Optimize database queries
- Use connection pooling
- Implement pagination

### Database
- Create proper indexes
- Use aggregation pipelines
- Enable query profiling
- Regular maintenance

---

## 🔄 CI/CD Pipeline (GitHub Actions)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Railway
        run: |
          # Railway deployment commands

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        run: |
          # Vercel deployment commands
```

---

## 📝 Post-Deployment Checklist

- [ ] Test all API endpoints
- [ ] Verify authentication flow
- [ ] Test image upload and classification
- [ ] Check dashboard data
- [ ] Test on mobile devices
- [ ] Verify SSL certificate
- [ ] Check error logging
- [ ] Monitor performance
- [ ] Set up backups
- [ ] Configure alerts
- [ ] Update documentation
- [ ] Announce launch

---

## 🆘 Troubleshooting

### Common Issues

**502 Bad Gateway**
- Check if backend is running
- Verify environment variables
- Check logs for errors

**CORS Errors**
- Update FRONTEND_URL in backend
- Check CORS configuration
- Verify allowed origins

**Database Connection Failed**
- Check MongoDB URI
- Verify IP whitelist
- Check network connectivity

**Model Service Unavailable**
- Verify model file exists
- Check MODEL_PATH variable
- Review service logs

---

## 📞 Support

For deployment issues:
1. Check logs first
2. Review documentation
3. Search GitHub issues
4. Create new issue with details

---

## 🎉 Success!

Your Smart Waste Segregator is now live! 🌱

Monitor your application and gather user feedback for continuous improvement.
