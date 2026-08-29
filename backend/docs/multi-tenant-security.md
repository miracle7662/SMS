# Multi-Tenant Security Guidelines

This document outlines the security rules that must be followed for all multi-tenant operations in the Society Management ERP backend.

## Fundamental Principles

### 1. Never Trust Frontend Context

- **Rule:** Never read `society_id` from query parameters, request body, or session cookies for authorization decisions.
- **Why:** The frontend is untrusted. Users can modify client-side data to access unauthorized societies.
- **Implementation:** Always use `req.auth.activeSocietyId` from the server-validated JWT token.

```javascript
// ✗ WRONG - trusts frontend data
const societyId = req.body.society_id;
const records = await db.query('SELECT * FROM records WHERE society_id = ?', [societyId]);

// ✓ CORRECT - uses server context
const societyId = req.auth.activeSocietyId;
const records = await db.query('SELECT * FROM records WHERE society_id = ?', [societyId]);
```

### 2. Tenant-Scoped Queries

- **Rule:** Every future query on a society-scoped table MUST include `WHERE society_id = ?` with the authenticated context.
- **Why:** Prevents accidental cross-tenant data leaks.
- **Implementation:** Use parameterized queries with `req.auth.activeSocietyId`.

```javascript
// ✓ CORRECT - all queries are tenant-scoped
const bills = await db.query(
  'SELECT * FROM bills WHERE society_id = ? AND deleted_at IS NULL',
  [req.auth.activeSocietyId]
);
```

### 3. Record ID Alone Is Never Sufficient

- **Rule:** A record ID (e.g., `bill_id`, `member_id`) alone does not prove access. Always verify both the record ID AND the active society ID.
- **Why:** A user might guess another society's record ID.
- **Implementation:** Query the record, verify its `society_id`, then check it matches `req.auth.activeSocietyId`.

```javascript
// ✓ CORRECT - dual verification
const bill = await db.query(
  'SELECT * FROM bills WHERE id = ? AND society_id = ?',
  [billId, req.auth.activeSocietyId]
);

if (!bill) {
  throw new ApiError(404, 'Bill not found');
}
```

### 4. Super Admin Must Explicitly Select a Society

- **Rule:** SUPER_ADMIN users must explicitly select an active society before using any society-scoped APIs.
- **Why:** Prevents accidental cross-tenant operations by platform admins.
- **Implementation:** The `selectSociety` endpoint ensures `req.auth.activeSocietyId` is set in the JWT.

```javascript
// ✓ CORRECT - requires active society even for SUPER_ADMIN
const middleware = (req, res, next) => {
  if (!req.auth.activeSocietyId) {
    throw new ApiError(400, 'Please select a society first');
  }
  next();
};
```

### 5. Platform APIs vs. Society APIs Must Remain Separate

- **Rule:** Platform-level APIs (e.g., `/api/v1/admin/societies`, `/api/v1/admin/users`) must require `activeSocietyId === null` (platform context only).
- **Why:** Prevents confusion and accidental permission escalation.
- **Implementation:** Check that the user has SUPER_ADMIN role and no society is selected, or reject the request.

```javascript
// ✓ CORRECT - platform API requires no active society
export const platformOnlyMiddleware = (req, res, next) => {
  if (req.auth.activeSocietyId !== null) {
    throw new ApiError(403, 'This is a platform-only operation');
  }
  if (!req.auth.roles.includes('SUPER_ADMIN')) {
    throw new ApiError(403, 'Only Super Admin can access this');
  }
  next();
};
```

### 6. Never Allow Society Admins to Assign SUPER_ADMIN

- **Rule:** Only SUPER_ADMIN can assign the SUPER_ADMIN role to users.
- **Why:** Prevents privilege escalation.
- **Implementation:** Check role assignment permissions at the service layer.

```javascript
// ✓ CORRECT - validate role assignment
const assignRoleToUser = async (userId, roleId, societyId, requestingUser) => {
  const role = await roleRepository.findById(roleId);

  // Only SUPER_ADMIN can assign SUPER_ADMIN role
  if (role.role_code === 'SUPER_ADMIN') {
    if (!requestingUser.roles.includes('SUPER_ADMIN')) {
      throw new ApiError(403, 'Only Super Admin can assign Super Admin role');
    }
  }

  // Society admins can only assign society roles in their own society
  if (role.scope === 'SOCIETY' && societyId !== requestingUser.activeSocietyId) {
    throw new ApiError(403, 'You can only assign roles in your own society');
  }
};
```

### 7. Never Allow Cross-Society Access by Changing IDs

- **Rule:** Users cannot access another society by changing a society ID in the request.
- **Why:** A role-based access check alone without society verification is insufficient.
- **Implementation:** Always verify both role and active society context.

```javascript
// ✓ CORRECT - checks both role and society
export const getSocietyMembers = async (req, res) => {
  const societyId = req.auth.activeSocietyId;
  const userId = req.auth.userId;

  // This societyId comes from the JWT, not the request
  const members = await db.query(
    'SELECT * FROM members WHERE society_id = ?',
    [societyId]
  );

  return sendSuccess(res, 200, 'Members retrieved', members);
};
```

## Middleware Implementation

### authenticate Middleware
- Verifies JWT signature
- Checks token expiry
- Verifies `token_type === 'access'`
- Loads current user from database
- Rejects inactive, blocked, or deleted users
- Attaches safe `req.auth` context with `userId`, `activeSocietyId`, `roles`

### requireActiveSociety Middleware
- Ensures `req.auth.activeSocietyId` is not null
- Verifies user still has access to the active society
- Allows SUPER_ADMIN only when explicitly selected

### authorizeRoles Middleware
- Checks if user has one of the allowed roles in current context
- Works with platform roles when `activeSocietyId === null`
- Works with society roles when `activeSocietyId` is set

### authorizePermissions Middleware
- Computes permissions from database role assignments
- Never trusts permissions from the client
- Verifies against role-permission mappings

## Audit Trail

- Every authentication action (login, logout, refresh, select_society) must be logged
- Include user ID, action type, IP address, and user agent
- Audit log failures must not crash successful authentication

## Database Constraints

- Foreign keys are properly configured with ON DELETE and ON UPDATE rules
- `unique` constraints on mobile and email prevent duplicate accounts
- Composite unique key on `(user_id, role_id, society_id)` prevents duplicate role assignments
- `deleted_at` (soft delete) is always checked in WHERE clauses

## Token Security

### Access Token
- Short-lived (15 minutes by default)
- Contains `sub` (user ID), `activeSocietyId`, `roles`, and `tokenType`
- Does not contain password, email, mobile, or detailed permissions
- Signed with `JWT_ACCESS_SECRET`

### Refresh Token
- Longer-lived (7 days by default)
- Stored as a hash in the database (never raw)
- Only the hash is compared during refresh
- Supports token rotation: old token is revoked when a new one is issued
- Signed with `JWT_REFRESH_SECRET` (different from access secret)

## Common Vulnerabilities to Avoid

| Vulnerability | How to Prevent |
|---|---|
| Cross-tenant data leakage | Always include `WHERE society_id = ?` in tenant-scoped queries |
| Privilege escalation | Validate role scope before assignment; SUPER_ADMIN only from platform context |
| Token reuse | Hash and rotate refresh tokens on every use |
| Brute force login | Increment failed attempts; lock account after max attempts |
| Weak session handling | Revoke tokens on logout; verify user is still active on each request |
| SQL injection | Always use parameterized queries; never concatenate user input |

## Checklist for New Endpoints

Before deploying a new society-scoped endpoint:

- [ ] Does it include `authenticate` middleware?
- [ ] Does it include `requireActiveSociety` middleware?
- [ ] Does the query include `WHERE society_id = ?`?
- [ ] Does it use `req.auth.activeSocietyId`, never `req.body.society_id`?
- [ ] Are both the record ID and society ID verified?
- [ ] Are all SQL queries parameterized?
- [ ] Is sensitive data (password_hash, token_hash) never returned in the response?
- [ ] Is the endpoint documented with required roles and permissions?

## Questions?

Refer to the authentication service layer (`src/services/auth.service.js`) and repositories for implementation examples.
