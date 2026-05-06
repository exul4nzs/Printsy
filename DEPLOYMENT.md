# Deployment Preparation Sprint

This document serves as the comprehensive deployment documentation for Printsy, fulfilling Activity 3 of Lab 17.

## Deployment Overview

Printsy utilizes Docker for containerization, ensuring consistent runtime environments across local, staging, and production setups. The deployment is orchestrated via `docker-compose`.

### Deployment Artifacts Created:
1.  `backend/Dockerfile`: Production-ready Gunicorn server for Django.
2.  `frontend/Dockerfile`: Multi-stage build for Next.js standalone optimization.
3.  `docker-compose.yml`: Service orchestration connecting frontend, backend, and PostgreSQL.
4.  `deploy.sh`: Automated deployment shell script.
5.  `.github/workflows/ci-cd.yml`: CI/CD Pipeline.

## Automated CI/CD Pipeline

We have implemented a GitHub Actions workflow that automatically runs on pushes to the `main` or `develop` branch.
-   **Test Job**: Sets up Python 3.12, installs dependencies, and runs the Django test suite to ensure no regressions.
-   **Build Job**: Sets up Node.js 20 and builds the Next.js frontend to verify that there are no compilation errors.

## Manual Deployment Guide

If you are deploying manually to a VPS (e.g., DigitalOcean, AWS EC2), follow these steps:

### Prerequisites
- Docker and Docker Compose installed on the host machine.
- Environment variables configured (Stripe keys).

### Step 1: Clone and Configure
```bash
git clone https://github.com/exul4nzs/Printsy.git
cd Printsy
# Create a .env file based on backend/.env.example
```

### Step 2: Automated Deployment Script
Execute the provided deployment script. This script handles building images, spinning up containers, and running necessary database migrations.

```bash
chmod +x deploy.sh
./deploy.sh
```

### Step 3: Verification
The script will output `docker-compose ps` at the end. Ensure all three containers (`db`, `backend`, `frontend`) show a status of "Up".

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000/api/`

## Troubleshooting

-   **Database Connection Issues**: If the backend fails to connect to the database, it may be starting faster than PostgreSQL is ready. The `deploy.sh` script includes a 5-second sleep to mitigate this, but on slower servers, you may need to increase the sleep duration or implement a `wait-for-it.sh` script.
-   **Missing Migrations**: If `deploy.sh` fails on the migration step, ensure the `db` container is fully running and accessible. Run `docker-compose exec backend python manage.py migrate` manually to debug.
