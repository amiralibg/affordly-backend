# Deployment Guide

## Docker Deployment on VPS

### Prerequisites
- Docker and Docker Compose installed on your VPS
- Git installed on your VPS

### Initial Setup

1. **Clone the repository on your VPS:**
```bash
git clone <your-repo-url>
cd affordly-project/affordly-backend
```

2. **Create production environment file:**
```bash
cp .env.production .env
```

3. **Edit `.env` file with your production values:**
```bash
nano .env
```

Update these values:
- `JWT_SECRET`: Generate a secure random string (e.g., `openssl rand -base64 32`)
- `MONGODB_URI`: Use `mongodb://mongodb:27017/affordly` for containerized MongoDB
- Ensure `NODE_ENV=production`

### Deploy with Docker Compose

**Start all services:**
```bash
docker-compose up -d
```

**View logs:**
```bash
docker-compose logs -f
```

**Stop services:**
```bash
docker-compose down
```

**Rebuild and restart:**
```bash
docker-compose up -d --build
```

### Health Checks

**Check if backend is running:**
```bash
curl http://localhost:3000/health
```

Expected response:
```json
{"status":"ok","timestamp":"2024-XX-XXTXX:XX:XX.XXXZ"}
```

**View API documentation:**
```
http://your-vps-ip:3000/api-docs
```

### Using External MongoDB

If you have an external MongoDB instance (MongoDB Atlas, etc.):

1. Update `.env`:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/affordly
```

2. Remove MongoDB service from `docker-compose.yml`:
```bash
# Comment out or remove the mongodb service and depends_on
```

3. Deploy only the backend:
```bash
docker-compose up -d backend
```

### Production Best Practices

1. **Use a reverse proxy (Nginx):**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

2. **Enable SSL with Let's Encrypt:**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

3. **Set up automatic container restarts:**
Docker Compose already includes `restart: unless-stopped`

4. **Monitor logs:**
```bash
docker-compose logs -f backend
docker-compose logs -f mongodb
```

### Updating the Application

```bash
git pull
docker-compose up -d --build
```

### Backup MongoDB Data

```bash
# Backup
docker-compose exec mongodb mongodump --out=/data/backup

# Copy backup to host
docker cp affordly-backend_mongodb_1:/data/backup ./mongodb-backup

# Restore
docker-compose exec mongodb mongorestore /data/backup
```

### Troubleshooting

**Container won't start:**
```bash
docker-compose logs backend
```

**MongoDB connection issues:**
- Ensure MongoDB container is running: `docker-compose ps`
- Check network: `docker network ls`
- Verify MONGODB_URI in `.env`

**Port already in use:**
```bash
# Find process using port 3000
sudo lsof -i :3000
# Kill process or change PORT in docker-compose.yml
```

### Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| PORT | Server port | 3000 |
| MONGODB_URI | MongoDB connection string | mongodb://mongodb:27017/affordly |
| JWT_SECRET | Secret for JWT tokens | your-secret-key |
| NODE_ENV | Environment mode | production |
