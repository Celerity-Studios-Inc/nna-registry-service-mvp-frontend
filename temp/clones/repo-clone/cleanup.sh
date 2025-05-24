#!/bin/bash

# Kill any running processes
echo "Killing existing processes..."
lsof -ti:3000,3001 | xargs kill -9 2>/dev/null || true
pkill -f mongod || true
pkill -f node || true

# Clean MongoDB data
echo "Cleaning MongoDB data..."
rm -rf ~/data/db/*

# Reset backend
echo "Resetting backend..."
cd /Users/ajaymadhok/nna-registry-service
git checkout v1.2.0-local-stable
cp .env.example .env
npm install
npm run build

# Reset frontend
echo "Resetting frontend..."
cd /Users/ajaymadhok/nna-registry-service-frontend
git checkout v1.2.0-local-stable
cp .env.example .env
npm install
npm run build

# Start services
echo "Starting services..."
# Start MongoDB
mkdir -p ~/data/db
mongod --dbpath ~/data/db &

# Wait for MongoDB to start
sleep 5

# Start backend
cd /Users/ajaymadhok/nna-registry-service
npm run start:dev &

# Wait for backend to start
sleep 5

# Start frontend
cd /Users/ajaymadhok/nna-registry-service-frontend
npm start &

echo "All services should be starting up..."
echo "MongoDB: mongodb://127.0.0.1:27017"
echo "Backend: http://localhost:3000"
echo "Frontend: http://localhost:3001"
echo "Swagger: http://localhost:3000/api/docs" 