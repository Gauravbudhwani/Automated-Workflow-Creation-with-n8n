# 🚀 Deployment Guide - AI-Powered n8n Workflow Generator

This guide provides comprehensive instructions for deploying the AI-powered n8n workflow generator in various environments.

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager
- Google Gemini API key
- Git (for cloning the repository)

## 🏠 Local Development Setup

### Quick Start

```bash
# Clone the repository
git clone https://github.com/Gauravbudhwani/Automated-Workflow-Creation-with-n8n.git
cd Automated-Workflow-Creation-with-n8n

# Install dependencies
npm install

# Build the project
npm run build

# Set up n8n custom directory
mkdir -p ~/.n8n/custom
cp -r dist/* ~/.n8n/custom/

# Start n8n
npx n8n start
```

### Windows Setup

```powershell
# Clone and navigate
git clone https://github.com/Gauravbudhwani/Automated-Workflow-Creation-with-n8n.git
cd Automated-Workflow-Creation-with-n8n

# Install and build
npm install
npm run build

# Create custom directory and copy files
New-Item -ItemType Directory -Path "$env:USERPROFILE\.n8n\custom" -Force
Copy-Item -Path "dist\*" -Destination "$env:USERPROFILE\.n8n\custom\" -Recurse -Force

# Start n8n
npx n8n start
```

## ☁️ Cloud Deployment Options

### Option 1: Railway Deployment (Recommended)

Railway offers free hosting with simple deployment:

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize project
railway init

# Deploy
railway up
```

**Railway Setup Steps:**
1. Create account at [railway.app](https://railway.app)
2. Connect your GitHub repository
3. Configure environment variables:
   - `NODE_ENV=production`
   - `N8N_PORT=8080`
   - `N8N_HOST=0.0.0.0`
4. Deploy automatically on Git push

### Option 2: Render.com Deployment

Free tier available with automatic deployments:

1. **Connect Repository**
   - Go to [render.com](https://render.com)
   - Connect your GitHub account
   - Select the repository

2. **Configure Service**
   - Service Type: Web Service
   - Build Command: `npm install && npm run build`
   - Start Command: `npx n8n start`

3. **Environment Variables**
   ```
   NODE_ENV=production
   N8N_HOST=0.0.0.0
   N8N_PORT=10000
   N8N_PROTOCOL=https
   ```

### Option 3: Heroku Deployment

```bash
# Install Heroku CLI
# Create Heroku app
heroku create your-n8n-workflow-generator

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set N8N_HOST=0.0.0.0
heroku config:set N8N_PROTOCOL=https

# Deploy
git push heroku main
```

### Option 4: Docker Deployment

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Copy custom node to n8n directory
RUN mkdir -p /root/.n8n/custom
RUN cp -r dist/* /root/.n8n/custom/

EXPOSE 5678

CMD ["npx", "n8n", "start"]
```

Deploy with Docker:

```bash
# Build image
docker build -t n8n-ai-generator .

# Run container
docker run -p 5678:5678 n8n-ai-generator
```

## 🔧 Configuration

### Environment Variables

For production deployment, set these environment variables:

```bash
# Core n8n Configuration
N8N_HOST=0.0.0.0
N8N_PORT=5678
N8N_PROTOCOL=https
NODE_ENV=production

# Security (recommended for production)
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=your_secure_password

# Database (for production use)
DB_TYPE=postgresdb
DB_POSTGRESDB_HOST=your_db_host
DB_POSTGRESDB_PORT=5432
DB_POSTGRESDB_DATABASE=n8n
DB_POSTGRESDB_USER=n8n_user
DB_POSTGRESDB_PASSWORD=your_db_password

# Custom Extensions
N8N_CUSTOM_EXTENSIONS=/app/.n8n/custom
```

### API Key Configuration

The Google Gemini API key is currently hardcoded in the node file. For production:

1. **Environment Variable Approach**
   ```javascript
   const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'fallback-key';
   ```

2. **n8n Credentials Approach** (Advanced)
   - Create custom credentials for Gemini API
   - Use n8n's credential system

## 🔍 Verification Steps

### 1. Check Deployment Status

```bash
# For local deployment
curl http://localhost:5678/healthz

# For cloud deployment
curl https://your-deployment-url.com/healthz
```

### 2. Verify Custom Node Installation

1. Access n8n interface
2. Create new workflow
3. Search for "Workflow Generator (AI)"
4. Node should appear in the list

### 3. Test Functionality

1. Add the Workflow Generator node
2. Enter test prompt: "Create a workflow that sends hello world to Slack"
3. Execute the node
4. Verify workflow JSON is generated
5. Check that files are created in the output directory

## 🛠️ Troubleshooting

### Common Issues

**1. Custom Node Not Appearing**
```bash
# Check if files were copied correctly
ls -la ~/.n8n/custom/
# or on Windows:
dir %USERPROFILE%\.n8n\custom

# Restart n8n
pkill n8n
npx n8n start
```

**2. API Key Errors**
- Verify Google Gemini API key is valid
- Check API quotas and billing status
- Ensure correct model name is used

**3. Build Failures**
```bash
# Clean rebuild
rm -rf node_modules dist
npm install
npm run build
```

**4. Permission Issues (Linux/Mac)**
```bash
# Fix permissions
sudo chown -R $USER:$USER ~/.n8n/
chmod -R 755 ~/.n8n/custom/
```

**5. Port Conflicts**
```bash
# Use different port
N8N_PORT=8080 npx n8n start
```

## 📊 Performance Optimization

### Production Recommendations

1. **Use PostgreSQL Database**
   - Better performance than SQLite
   - Required for multiple instances

2. **Enable Process Manager**
   ```bash
   npm install -g pm2
   pm2 start "npx n8n start" --name n8n
   pm2 startup
   pm2 save
   ```

3. **Configure Reverse Proxy**
   - Use Nginx for SSL termination
   - Enable gzip compression
   - Set proper headers

4. **Monitor Resources**
   - CPU usage during AI requests
   - Memory consumption
   - API rate limits

## 🔒 Security Considerations

### Production Security Checklist

- [ ] Enable basic authentication
- [ ] Use HTTPS/SSL certificates
- [ ] Store API keys in environment variables
- [ ] Set up proper firewall rules
- [ ] Regular security updates
- [ ] Monitor access logs
- [ ] Backup workflow data
- [ ] Use strong passwords

### SSL Configuration

```bash
# Using Let's Encrypt with Certbot
sudo certbot --nginx -d your-domain.com

# Configure n8n with SSL
export N8N_PROTOCOL=https
export N8N_SSL_KEY=/path/to/private.key
export N8N_SSL_CERT=/path/to/certificate.crt
```

## 🚀 Live Demo

### Current Deployments

- **Local Development**: http://localhost:5678
- **Production URL**: [Add your deployed URL here]
- **Demo Video**: [Link to demo video if available]

### Demo Instructions

1. Visit the deployed n8n instance
2. Create new workflow
3. Add "Workflow Generator (AI)" node
4. Test with prompts like:
   - "Send email when new file is uploaded to Dropbox"
   - "Post to Twitter when RSS feed updates"
   - "Add Gmail attachments to Google Drive"

## 📈 Monitoring and Maintenance

### Health Checks

```bash
# API endpoint health
curl https://your-domain.com/rest/active

# Custom node status
curl https://your-domain.com/types/nodes.json | grep workflowGeneratorAi
```

### Log Monitoring

```bash
# n8n logs
tail -f ~/.n8n/logs/n8n.log

# Custom node specific logs
grep "WorkflowGenerator" ~/.n8n/logs/n8n.log
```

### Backup Strategy

```bash
# Backup n8n data
tar -czf n8n-backup-$(date +%Y%m%d).tar.gz ~/.n8n/

# Backup generated workflows
tar -czf workflows-backup-$(date +%Y%m%d).tar.gz generated-workflows/
```

## 🆘 Support

### Getting Help

- **GitHub Issues**: [Repository Issues Page](https://github.com/Gauravbudhwani/Automated-Workflow-Creation-with-n8n/issues)
- **Documentation**: [Main README](https://github.com/Gauravbudhwani/Automated-Workflow-Creation-with-n8n#readme)
- **n8n Community**: [n8n Community Forum](https://community.n8n.io/)

### Contributing

1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Submit pull request

---

**Built for GDGC Machine Learning Domain Task Round**

*This deployment guide ensures the AI-powered workflow generator can be easily deployed across various environments, from local development to production cloud hosting.*
