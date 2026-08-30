# Society Management ERP - Backend API

A Node.js + Express.js backend for a multi-tenant Society Management ERP system.

## Prerequisites

- Node.js 18+ (npm 9+)
- MySQL 8.0+

## MySQL 8 Setup

### 1. Create the Database

Run this SQL command in your MySQL client:

```sql
CREATE DATABASE society_erp
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
```

### 2. Verify Database Creation

```sql
SHOW DATABASES;
```

You should see `society_erp` in the list.

## Installation

### 1. Copy Environment File

```bash
cd backend
cp .env.example .env
```

### 2. Configure Environment Variables

Edit `backend/.env` and set your database credentials:

```
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

DB_HOST=localhost
DB_PORT=3306
DB_NAME=society_erp
DB_USER=root
DB_PASSWORD=your_mysql_password

JWT_ACCESS_SECRET=replace_with_a_long_random_access_secret_min_32_chars
JWT_REFRESH_SECRET=replace_with_a_different_long_random_refresh_secret_min_32_chars
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=12
MAX_LOGIN_ATTEMPTS=5
LOGIN_LOCK_MINUTES=15

SUPER_ADMIN_NAME=Miracle Infotech Admin
SUPER_ADMIN_MOBILE=9999999999
SUPER_ADMIN_EMAIL=admin@example.com
SUPER_ADMIN_PASSWORD=change_this_password
```

**Important:** Never commit `.env` to version control.

### 3. Install Dependencies

```bash
npm install
```

### 4. Run the Authentication Migration and Seed

```bash
npm run migrate
npm run seed:auth
```

Both commands are idempotent and can be safely run again.

## Running the Backend

### Development Mode (with auto-reload)

```bash
npm run dev
```

The server will start on `http://localhost:5000` with nodemon watching for file changes.

### Production Mode

```bash
npm start
```

## NPM Scripts

```bash
npm run dev          # Start with nodemon
npm start            # Start in production mode
npm run migrate      # Apply pending SQL migrations
npm run seed:auth    # Seed roles, permissions, and Super Admin
```

## Health Check API

### Endpoint

```
GET http://localhost:5000/api/v1/health
```

### Expected Success Response (200 OK)

```json
{
  "success": true,
  "message": "Society ERP API is running",
  "data": {
    "environment": "development",
    "database": "connected",
    "timestamp": "2024-08-26T10:30:45.123Z"
  }
}
```

### Error Response (503 Service Unavailable)

If the database is not accessible:

```json
{
  "success": false,
  "message": "Database connection failed",
  "errors": [
    "Unable to establish database connection. Please check your configuration."
  ]
}
```

## Troubleshooting

### Notification providers

In-app notifications require no external provider. For Email, SMS or WhatsApp,
configure the matching `*_PROVIDER_WEBHOOK_URL` and optional
`*_PROVIDER_API_KEY` values in `.env`. The webhook receives JSON containing
`recipient`, `title`, `message`, `channel` and `notification_id`.

Queued messages can be dispatched or retried from the Notification Center.

### MySQL Connection Errors

#### Error: `connect ECONNREFUSED 127.0.0.1:3306`

**Cause:** MySQL server is not running.

**Solution:**
- Start MySQL service (macOS: `brew services start mysql`, Linux: `sudo systemctl start mysql`, Windows: search for MySQL service in Services)
- Verify MySQL is listening on port 3306

#### Error: `Access denied for user 'root'@'localhost'`

**Cause:** Incorrect database credentials.

**Solution:**
- Verify `DB_USER` and `DB_PASSWORD` in `.env`
- Test MySQL connection: `mysql -h localhost -u root -p` and enter your password
- Update `.env` with correct credentials

#### Error: `Unknown database 'society_erp'`

**Cause:** Database not created.

**Solution:**
- Run the SQL command from the "MySQL 8 Setup" section
- Verify database exists: `mysql -u root -p society_erp`

### Port Already in Use

**Error:** `Error: listen EADDRINUSE: address already in use :::5000`

**Solution:**
- Change `PORT` in `.env` to an available port
- Or kill the process using port 5000

## Authentication API

All authentication routes are mounted below `/api/v1/auth`.

### Login

```http
POST /api/v1/auth/login
Content-Type: application/json

{"login":"9999999999","password":"your_password"}
```

The response includes a short-lived `access_token`, a `refresh_token`, the
authenticated user, and the societies available to that user.

### Select a Society

Super Admins and users with access to multiple societies must select an active
society before calling society-scoped APIs.

```http
POST /api/v1/auth/select-society
Authorization: Bearer <access_token>
Content-Type: application/json

{"society_id":10}
```

The response contains a new access token scoped to the selected society.

### Refresh, Logout, and Current User

```http
POST /api/v1/auth/refresh
Content-Type: application/json

{"refresh_token":"<refresh_token>"}
```

```http
POST /api/v1/auth/logout
Authorization: Bearer <access_token>
Content-Type: application/json

{"refresh_token":"<refresh_token>"}
```

```http
GET /api/v1/auth/me
Authorization: Bearer <access_token>
```

```http
GET /api/v1/auth/societies
Authorization: Bearer <access_token>
```

Refresh tokens are rotated. The previous refresh token is revoked after a
successful refresh and cannot be reused.

## Step 2 Database Schema

The authentication migration creates these tables:

- `societies` - Tenant organizations
- `users` - Platform users and password hashes
- `roles` and `permissions` - Access-control definitions
- `role_permissions` - Role-to-permission mappings
- `user_societies` - User-to-society access assignments
- `user_roles` - Platform and society role assignments
- `refresh_tokens` - Hashed refresh tokens and revocation state
- `audit_logs` - Authentication and security audit events
- `schema_migrations` - Applied migration tracking

## Multi-Tenant Security Rules

- Read the active tenant only from `req.auth.activeSocietyId`.
- Never trust a frontend `society_id` for query scoping.
- Every society query must include `WHERE society_id = ?`.
- Verify both the requested record ID and its society ID.
- Super Admins must select a society for society-scoped operations.
- Passwords and refresh tokens are stored only as hashes.
- Do not return `password_hash` or `token_hash` in API responses.

See [docs/multi-tenant-security.md](docs/multi-tenant-security.md) for the full
security checklist and endpoint guidance.

## Authentication Verification

Use Postman or curl after starting the server:

1. Call login and save both returned tokens.
2. Call `/api/v1/auth/me` with the access token.
3. Call refresh and confirm that a new token pair is returned.
4. Try the old refresh token and confirm it returns `401`.
5. Call logout, then confirm the refresh token is rejected.
6. Try `/api/v1/auth/me` without a token and confirm it returns `401`.
7. Try an invalid password and confirm the response is generic and contains no
  password or token hash.

The migration and seed commands can be run repeatedly to verify idempotency.

## API Response Format

### Success Response

```json
{
  "success": true,
  "message": "Readable message describing the result",
  "data": {}
}
```

### Error Response

```json
{
  "success": false,
  "message": "Readable error message",
  "errors": []
}
```

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js      # MySQL pool configuration
│   │   └── env.js           # Environment variable validation
│   ├── controllers/
│   │   └── health.controller.js  # Health check logic
│   ├── middleware/
│   │   ├── error.middleware.js   # Global error handler
│   │   └── not-found.middleware.js # 404 handler
│   ├── routes/
│   │   ├── health.routes.js # Health check routes
│   │   └── index.js         # Route aggregator
│   ├── utils/
│   │   ├── api-error.js     # Custom error class
│   │   ├── api-response.js  # Response helpers
│   │   └── async-handler.js # Async error wrapper
│   ├── app.js               # Express app setup
│   └── server.js            # Server startup and shutdown
├── package.json
├── .env.example             # Environment template
├── .gitignore
└── README.md
```

## Multi-Tenant Architecture

Every society-specific table includes a `society_id` column. Key principles:

- `society_id` must come from authenticated server-side context (never trust frontend)
- SUPER_ADMIN can select society explicitly
- Other users access only assigned societies
- Every query must be tenant-scoped

## Security Notes

- Never log database credentials
- Always use parameterized queries
- Validate and sanitize user input
- Keep environment secrets in `.env`
- Use CORS to allow only trusted frontend URLs

## License

ISC
## SaaS subscriptions and platform billing

Run `npm run migrate` after updating the code. Migration `029_saas_subscription_billing.sql` creates plans, society subscriptions, platform invoices and payments. Existing societies receive the unlimited `LEGACY_FREE` plan so the rollout does not block them.

Super Admin endpoints are under `/api/v1/platform`: `GET /subscriptions`, `POST /subscription-plans`, `POST /subscriptions`, `PATCH /subscriptions/:id/status`, `POST /invoices` and `POST /invoices/:id/payments`.

Society-scoped APIs reject inactive or expired subscriptions. Plan limits are enforced while creating buildings, generating flats and adding society users. A `NULL` limit means unlimited.

## Security monitoring

Migration `030_security_monitoring.sql` adds safe security events for failed logins and locked accounts. Super Admin can use `GET /api/v1/platform/security`, resolve alerts, unlock a verified user and revoke that user's refresh-token sessions. Passwords, raw tokens and unmasked login identifiers are never written to security events.

## Backup and system health

Migration `031_backup_and_system_health.sql` tracks MySQL backups and health snapshots. Configure `MYSQLDUMP_PATH`, `MYSQL_PATH`, `BACKUP_DIR` and `BACKUP_RETENTION_DAYS` in `.env`. Super Admin can create, download, verify and restore backups from `/api/v1/platform/backups`; restore requires the exact confirmation phrase and creates a pre-restore backup first. Database passwords are passed to MySQL tools through the child-process environment and are never included in command arguments or logs.

Run `npm run backup` for a scheduled backup. On Windows, create a Task Scheduler job that runs `npm.cmd run backup` with the `backend` folder as its working directory. Schedule this command daily and monitor its non-zero exit code for failures.
