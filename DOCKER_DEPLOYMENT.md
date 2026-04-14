# Docker Deployment Guide for GigShield

## 📋 Prerequisites

- Docker Desktop installed and running
- Docker Compose (included with Docker Desktop)
- Minimum 4GB RAM allocated to Docker
- Ports available: 80 (frontend), 4000 (backend), 8000 (AI service), 3306 (MySQL)

## 🚀 Quick Start

### 1. **Prepare Environment Variables**

Copy the example environment file:

```bash
# Windows (PowerShell)
Copy-Item .env.example .env

# Linux/Mac
cp .env.example .env
```

Edit `.env` file to customize values if needed (mail credentials, payment keys, etc.)

### 2. **Build and Start All Services**

```bash
# Build all Docker images and start services
docker-compose up --build

# Or run in background (detached mode)
docker-compose up -d --build
```

Wait 30-60 seconds for MySQL to initialize on first run.

### 3. **Access the Application**

- **Frontend**: http://localhost
- **Backend API**: http://localhost:4000
- **AI Service**: http://localhost:8000/docs
- **MySQL**: localhost:3306

## 📊 Service Architecture

```
┌─────────────────────────────────────────────────┐
│               DOCKER NETWORK                    │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌──────────────┐  ┌──────────────┐          │
│  │  Frontend    │  │   Backend    │          │
│  │  (React/Nginx)  │ (Spring Boot) │          │
│  │  Port: 80    │  │  Port: 4000  │          │
│  └──────────────┘  └──────────────┘          │
│         ▲                    ▲               │
│         │                    │               │
│         └────────┬───────────┘               │
│                  ▼                           │
│          ┌─────────────────┐                │
│          │  AI Service     │                │
│          │  (Python/FastAPI)                │
│          │  Port: 8000     │                │
│          └─────────────────┘                │
│                  ▲                           │
│                  │                           │
│         ┌────────▼────────┐                 │
│         │   Database      │                 │
│         │   (MySQL 8.4)   │                 │
│         │   Port: 3306    │                 │
│         └─────────────────┘                 │
└─────────────────────────────────────────────────┘
```

### Service Details

| Service | Image | Port | Purpose |
|---------|-------|------|---------|
| **Frontend** | node:18-alpine + nginx:alpine | 80 | React SPA UI |
| **Backend** | maven:3.8.4 + eclipse-temurin:17 | 4000 | Spring Boot API |
| **AI Model** | python:3.9-slim | 8000 | AI/ML services |
| **MySQL** | mysql:8.4.0 | 3306 | Persistent data storage |

## 🔧 Common Commands

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f ai-model
docker-compose logs -f mysql
```

### Stop Services
```bash
# Stop all services (keep containers)
docker-compose stop

# Stop and remove all containers
docker-compose down

# Stop and remove all containers + volumes (DELETE DATABASE)
docker-compose down -v
```

### Restart Services
```bash
# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart backend
```

### Rebuild a Service
```bash
# Rebuild backend after code changes
docker-compose build backend --no-cache
docker-compose up -d backend

# Or rebuild all
docker-compose build --no-cache
docker-compose up -d
```

### Execute Commands in Container
```bash
# Connect to backend container
docker-compose exec backend bash

# Connect to MySQL
docker-compose exec mysql mysql -u root -p

# Run tests in backend
docker-compose exec backend mvn test
```

### View Running Containers
```bash
docker-compose ps
```

## 🌐 Networking

All services communicate using Docker's internal DNS:
- Backend → MySQL: `jdbc:mysql://mysql:3306/ai_insurance`
- Backend → AI Service: `http://ai-model:8000`
- Frontend → Backend: Configured in environment (localhost for dev, Docker host IP for prod)

## 📦 Volume Management

**MySQL Data Persistence**: Data is stored in a named volume `mysql_data`

```bash
# View volumes
docker volume ls

# Remove unused volumes
docker volume prune

# Backup database
docker-compose exec mysql mysqldump -u root -p ai_insurance > backup.sql

# Restore database
docker-compose exec -T mysql mysql -u root -p < backup.sql
```

## 🔐 Security Considerations

### Production Deployment

1. **Update Credentials** in `.env`:
   - Change MySQL passwords
   - Update SMTP credentials
   - Rotate Razorpay keys
   - Set actual Firebase credentials in frontend

2. **Network Configuration**:
   - Use environment-specific port mappings
   - Restrict external DB access (remove MySQL port mapping for prod)
   - Use reverse proxy (Nginx/Traefik) for SSL/TLS

3. **Environment Variables**:
   - Never commit `.env` to version control
   - Use Docker secrets in production
   - Rotate API keys regularly

### Database Security
```bash
# Connect to MySQL in container
docker-compose exec mysql mysql -u root -p

# Inside MySQL, create limited user for production
CREATE USER 'appuser'@'%' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON ai_insurance.* TO 'appuser'@'%';
FLUSH PRIVILEGES;
```

## 🛠️ Troubleshooting

### 1. **Services won't start**
```bash
# Check logs
docker-compose logs -f

# Check disk space
docker system df

# Clean up unused resources
docker system prune -a
```

### 2. **Database connection error**
- Wait 60 seconds for MySQL to fully initialize
- Check network connectivity: `docker-compose exec backend ping mysql`
- Verify credentials in `.env` file

### 3. **Frontend shows blank page**
- Verify backend is running: `curl http://localhost:4000/health` (if health endpoint exists)
- Check CORS configuration in backend
- Clear browser cache

### 4. **Out of disk space**
```bash
# View Docker disk usage
docker system df

# Remove unused images/containers
docker system prune -a --volumes
```

### 5. **Port conflicts**
```bash
# Check what's using a port (Windows PowerShell)
netstat -ano | findstr :4000

# Check what's using a port (Linux/Mac)
lsof -i :4000

# Change port in docker-compose.yml or .env
```

## 📝 Environment Variables Reference

### Database
- `DB_ROOT_PASSWORD`: MySQL root password
- `DB_NAME`: Database name (default: ai_insurance)
- `DB_USER`: MySQL user
- `DB_PASSWORD`: MySQL password
- `DB_PORT`: MySQL port (default: 3306)

### Backend/Services
- `BACKEND_PORT`: Backend server port (default: 4000)
- `AI_SERVICE_PORT`: AI service port (default: 8000)
- `FRONTEND_PORT`: Frontend port (default: 80)
- `FRONTEND_URL`: Frontend URL for CORS

### Email (Gmail SMTP)
- `SPRING_MAIL_HOST`: SMTP server
- `SPRING_MAIL_PORT`: SMTP port
- `SPRING_MAIL_USERNAME`: Gmail email
- `SPRING_MAIL_PASSWORD`: Gmail app password
- `EMAIL_MOCK_ENABLED`: Use mock email (true/false)

### External Services
- `OWM_API_KEY`: OpenWeatherMap API key (for weather data)
- `RAZORPAY_KEY_ID`: Razorpay merchant key
- `RAZORPAY_KEY_SECRET`: Razorpay merchant secret
- `PAYMENT_RAZORPAY_ENABLED`: Enable Razorpay (true/false)

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [Spring Boot Docker Guide](https://spring.io/guides/gs/spring-boot-docker/)
- [Node.js Docker Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)

## 🎯 Next Steps for Production

1. Set up Docker registry (Docker Hub, ECR, etc.)
2. Configure CI/CD pipeline (GitHub Actions, GitLab CI, etc.)
3. Set up orchestration (Kubernetes, Docker Swarm)
4. Implement monitoring (Prometheus, Grafana, ELK)
5. Set up backup strategy for database
6. Configure SSL/TLS certificates
7. Implement secrets management
