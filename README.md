# A collaborative platform for software teams to report bugs, suggest features, and coordinate resolutions.

## Live URL: https://devpulse-rust-one.vercel.app

User Authentication — Register and log in with JWT-based auth
Role-Based Access Control — contributor and maintainer roles with different permissions
Issue Management — Create, view, update, and delete bug reports and feature requests
Issue Filtering — Filter issues by type and status, sort by newest or oldest
Secure Passwords — Passwords hashed with bcrypt, never exposed in responses
Input Validation — All endpoints validate request data with clear error messages

# Tech Stack

Technology
Node.js (LTS 24.x) ==> Runtime
TypeScript ==> Type-safe development
Express.js ==> HTTP server & routing
PostgreSQL ==> Relational database
pg (native ==> driver) Raw SQL with pool.query() — no ORM
bcrypt ===> Password hashing (salt rounds: 10)
jsonwebtoken ==> JWT generation & verification

# Setup & Installation

1. npm init -y
2. npm install -D typescript
3. npx tsc –init
4. Now configure the tsconfig.json file 
   a. Comment out the rootDir and outDir
   b. Write “esnext” on “module”
   c. Write “node” inside “types”
   d. Comment the “jsx”: “react-jsx”
5. Now install npm install -D @types/node
6. Now change the type common.js to “module” inside the pacakage.json
7. npm install -D tsx
8. write this inside the scripts: "dev": "tsx watch ./src/server.ts",
9. Now command this in the terminal: npm run dev

# API Endpoints

POST => /api/auth/signup ==> Public => Register a new user
POST => /api/auth/login ==> Public => Login and receive JWT token
GET => /api/issues ==> Public => Get all issues (supports filtering & sorting)
GET => /api/issues/:id ==> Public => Get a single issue by ID
POST => /api/issues => Authenticated => Create a new issue
PATCH => /api/issues/:id => Authenticated => Update an issue
DELETE => /api/issues/:id => Maintainer only => Delete an issue
