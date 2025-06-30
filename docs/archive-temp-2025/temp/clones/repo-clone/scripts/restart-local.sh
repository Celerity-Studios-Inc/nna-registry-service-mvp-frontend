#!/bin/bash

echo "Killing processes on ports 3000 and 3001..."
lsof -ti:3000 | xargs kill -9 2>/dev/null
lsof -ti:3001 | xargs kill -9 2>/dev/null

echo "Building and starting backend..."
cd /Users/ajaymadhok/nna-registry-service
npm run build
npm run start:prod &

echo "Building and starting frontend..."
cd ../nna-registry-service-frontend
npm run build
npm run start &

echo "Waiting for services to start..."
sleep 5

echo "Checking service status..."
curl -s http://localhost:3000/api/docs > /dev/null && echo "Backend is running" || echo "Backend failed to start"
curl -s http://localhost:3001 > /dev/null && echo "Frontend is running" || echo "Frontend failed to start" 