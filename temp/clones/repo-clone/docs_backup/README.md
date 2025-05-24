# NNA Registry Service Documentation

## Project Structure
```
/nna-registry/
├── backend/         # NestJS backend service
├── frontend/        # React frontend application
└── docs/           # Project documentation
```

## Environment Setup

### Backend (NestJS)
- Port: 3000 (development)
- Production URL: https://registry.reviz.dev
- Stack: NestJS, MongoDB, Google Cloud Storage
- Authentication: JWT-based

### Frontend (React)
- Port: 3001 (development)
- Production URL: https://registry.reviz.dev
- Stack: React, TypeScript

## Core Functionalities
1. Authentication (Login/Register)
2. Asset Registration
3. Asset Browsing
4. Asset Information

## Development Setup
1. Backend:
   ```bash
   cd backend
   npm install
   npm run start:dev
   ```

2. Frontend:
   ```bash
   cd frontend
   npm install
   npm start
   ```

## Deployment
- Backend: Google Cloud Run
- Frontend: Vercel
- Domain: registry.reviz.dev

## Testing
- Backend: API endpoints, Database operations, Container health
- Frontend: End-to-end workflows
- Integration: Cross-service communication

## Version Control
- Backend Repository: https://github.com/EqualsAjayMadhok/nna-registry-service
- Frontend Repository: https://github.com/EqualsAjayMadhok/nna-registry-service-frontend
- Main Branches: stable-backend, stable-frontend 