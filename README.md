# AI Assisted Journal System

## Tech Stack

Backend: Node.js + Express  
Frontend: React  
Database: SQLite  

## Setup

### Backend

cd backend  
npm install  
node server.js

Runs at: http://localhost:4000

### Frontend

cd frontend  
npm install  
npm start

Runs at: http://localhost:3000

## API Endpoints

POST /api/journal  
GET /api/journal/:userId  
POST /api/journal/analyze  
GET /api/journal/insights/:userId  
DELETE /api/journal/:id