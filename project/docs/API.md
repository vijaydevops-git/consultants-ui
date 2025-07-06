# API Documentation

## Base URL
```
Production: https://your-domain.com/api
Development: http://localhost:3001/api
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### Authentication

#### POST /auth/login
Login with email and password.

**Request Body:**
```json
{
  "email": "admin@company.com",
  "password": "password"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "admin@company.com",
    "firstName": "Admin",
    "lastName": "User",
    "role": "admin"
  }
}
```

#### GET /auth/me
Get current user information.

### Consultants

#### GET /consultants
Get all consultants (requires authentication).

#### POST /consultants
Create a new consultant (admin only).

#### PUT /consultants/:id
Update a consultant (admin only).

#### DELETE /consultants/:id
Delete a consultant (admin only).

### Companies

#### GET /companies
Get all companies (requires authentication).

#### POST /companies
Create a new company (admin only).

#### PUT /companies/:id
Update a company (admin only).

#### DELETE /companies/:id
Delete a company (admin only).

### Submissions

#### GET /submissions
Get submissions with optional filtering.

#### POST /submissions
Create a new submission.

#### PUT /submissions/:id
Update a submission.

#### DELETE /submissions/:id
Delete a submission.

#### GET /submissions/stats
Get submission statistics.