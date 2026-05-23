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
Node.js (LTS 24.x) => Runtime </br>
TypeScript => Type-safe development </br>
Express.js => HTTP server & routing </br>
PostgreSQL => Relational database </br>
pg (native => driver) Raw SQL with pool.query() — no ORM </br>
bcrypt => Password hashing (salt rounds: 10) </br>
jsonwebtoken => JWT generation & verification </br>

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

POST => /api/auth/signup => Public => Register a new user </br>
POST => /api/auth/login => Public => Login and receive JWT token </br>
GET => /api/issues => Public => Get all issues (supports filtering & sorting) </br>
GET => /api/issues/:id => Public => Get a single issue by ID </br>
POST => /api/issues => Authenticated => Create a new issue </br>
PATCH => /api/issues/:id => Authenticated => Update an issue </br>
DELETE => /api/issues/:id => Maintainer only => Delete an issue </br>

# Database schema summary

Relationship — issues.reporter_id references users.id but there is no hard foreign key constraint in the DB. Validation is handled in application logic (the service layer checks the user exists via a separate query before inserting).
</br>
updated_at — not auto-updated by Postgres. Unlike created_at which uses DEFAULT NOW(), the updated_at field must be manually set to NOW() in every UPDATE query. This is already handled in issues.service.ts. </br>
No JOINs allowed — even though reporter_id links the two tables, the spec requires fetching reporter details with a separate WHERE id = ANY($1) query, not a SQL JOIN.
