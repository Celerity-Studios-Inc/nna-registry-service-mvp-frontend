# NNA Registry Service Project Context

## Project Structure
- Backend: NestJS application in `/nna-registry-service`
- Frontend: React/TypeScript application in `/nna-registry-service-frontend`

## Environment Setup (Updated April 27, 2025)

### Prerequisites
1. Node.js v22.14.0
2. MongoDB running locally on port 27017
3. Git configured

### Critical Files
1. Backend (.env in `/nna-registry-service`):
```
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/nna-registry
JWT_SECRET=development-secret-key
CORS_ORIGIN=http://localhost:3001
STORAGE_PATH=./storage
STORAGE_MODE=local
```

2. Frontend (.env in `/nna-registry-service-frontend`):
```
REACT_APP_USE_MOCK_DATA=false
REACT_APP_API_URL=http://localhost:3000/api
REACT_APP_ENV=development
```

### Setup Steps (In Order)

1. **MongoDB Setup**:
   ```bash
   # Create MongoDB data directory
   mkdir -p ~/data/db
   
   # Start MongoDB
   mongod --dbpath ~/data/db
   ```
   Verify: MongoDB should be running on port 27017

2. **Backend Setup**:
   ```bash
   cd nna-registry-service
   
   # Create .env file (if not exists)
   cp .env.example .env
   
   # Install dependencies
   npm install
   
   # Start in development mode
   npm run start:dev
   ```
   Verify: Backend should be running on http://localhost:3000
   Swagger docs: http://localhost:3000/api/docs

3. **Frontend Setup**:
   ```bash
   cd nna-registry-service-frontend
   
   # Create .env file (if not exists)
   cp .env.example .env
   
   # Install dependencies
   npm install
   
   # Start development server
   npm start
   ```
   Note: When prompted about port 3000 being in use, select 'Y' to use port 3001
   Verify: Frontend should be running on http://localhost:3001

### Verification Steps

1. **MongoDB Connection**:
   - Check MongoDB logs for: "Waiting for connections on port 27017"
   - Backend logs should show successful Mongoose connection

2. **Backend Health**:
   - Visit http://localhost:3000/api/docs
   - Should see Swagger documentation
   - All routes should be initialized (auth, assets)

3. **Frontend Connection**:
   - Visit http://localhost:3001
   - Should see login page
   - Test login with pre-registered user
   - Dashboard should load with assets overview

### Common Issues and Solutions

1. **Port Conflicts**:
   ```bash
   # Kill processes on specific ports
   lsof -ti:3000,3001 | xargs kill -9
   ```

2. **MongoDB Connection Issues**:
   - Always use 127.0.0.1 instead of localhost in MONGODB_URI
   - Check if MongoDB is running: `ps aux | grep mongod`

3. **.env File Permissions**:
   - Keep .env.example files in both frontend and backend
   - Add .env to .gitignore
   - Copy .env.example to .env in local setup

4. **Git Security Blocks**:
   ```bash
   # Temporarily allow .env files
   git config --local core.ignorecase false
   cp .env.example .env
   git config --local core.ignorecase true
   ```

### Current Working State (April 27, 2025)
- MongoDB: Running and accepting connections
- Backend: All routes initialized and working
- Frontend: Successfully connecting to backend
- Authentication: Working with pre-registered users
- Asset Management: Functional with 30 registered assets

### Next Development Steps
1. Implement proper CI/CD configuration
2. Add automated environment setup scripts
3. Improve error handling and logging
4. Add automated testing

### Important URLs
- Frontend Application: http://localhost:3001
- Backend API: http://localhost:3000/api
- API Documentation: http://localhost:3000/api/docs
- MongoDB: mongodb://127.0.0.1:27017/nna-registry 