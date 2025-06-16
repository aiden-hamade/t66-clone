# T66 Docker Configuration

This directory contains Docker configuration files for the T66 application.

## Files (Coming Soon)

- `Dockerfile.frontend` - Frontend React app container
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

### Database & Backend
- Firebase services (hosted)
- Authentication, Firestore, Functions
- No local database container needed

## Environment Variables

Copy `../env.example` to `.env` and configure:
- Firebase configuration
- API keys for AI providers
- Security settings 