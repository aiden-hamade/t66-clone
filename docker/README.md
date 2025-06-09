# T66 Docker Configuration

This directory contains Docker configuration files for the T66 application.

## Files (Coming Soon)

- `Dockerfile.frontend` - Frontend React app container
- `Dockerfile.backend` - PocketBase backend container  
- `docker-compose.yml` - Multi-container orchestration
- `docker-compose.prod.yml` - Production configuration

## Quick Start

```bash
# Development
docker-compose up -d

# Production  
docker-compose -f docker-compose.prod.yml up -d
```

## Services

### Frontend (React)
- Port: 3000
- Built with Vite
- Nginx serving in production

### Backend (PocketBase)
- Port: 8090
- Persistent volume for database
- Health checks enabled

### Database
- SQLite (embedded in PocketBase)
- Automatic backups in production

## Environment Variables

Copy `../env.example` to `.env` and configure:
- API keys for AI providers
- Database credentials  
- Security settings 