# T66 Development Scripts

This directory contains automation scripts for development, testing, and deployment.

## Scripts (Coming Soon)

### Setup & Development
- `setup.sh` / `setup.ps1` - Initial project setup
- `dev.sh` / `dev.ps1` - Start development servers  
- `build.sh` / `build.ps1` - Build for production

### Testing
- `test.sh` / `test.ps1` - Run all tests
- `test-frontend.sh` - Frontend tests only
- `test-backend.sh` - Backend tests only
- `test-e2e.sh` - End-to-end tests

### Deployment
- `deploy.sh` / `deploy.ps1` - Deploy to production
- `deploy-staging.sh` - Deploy to staging
- `backup.sh` - Database backup

### Utilities
- `clean.sh` / `clean.ps1` - Clean build artifacts
- `format.sh` - Format code with Prettier
- `lint.sh` - Run ESLint and Go fmt

## Usage

Make scripts executable on Unix systems:
```bash
chmod +x scripts/*.sh
```

Run scripts from project root:
```bash
./scripts/setup.sh
./scripts/dev.sh
```

On Windows, use PowerShell:
```powershell
.\scripts\setup.ps1
.\scripts\dev.ps1
``` 