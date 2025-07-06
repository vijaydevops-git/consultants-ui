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

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "id": 1,
  "email": "admin@company.com",
  "first_name": "Admin",
  "last_name": "User",
  "role": "admin"
}
```

### Consultants

#### GET /consultants
Get all consultants (requires authentication).

**Response:**
```json
[
  {
    "id": 1,
    "first_name": "John",
    "last_name": "Smith",
    "email": "john.smith@email.com",
    "phone": "555-0101",
    "skills": ["React", "Node.js", "PostgreSQL"],
    "experience_years": 8,
    "rate_per_hour": 125.00,
    "availability_status": "available",
    "location": "San Francisco, CA",
    "notes": null,
    "is_active": true,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
]
```

#### POST /consultants
Create a new consultant (admin only).

**Request Body:**
```json
{
  "first_name": "Jane",
  "last_name": "Doe",
  "email": "jane.doe@email.com",
  "phone": "555-0123",
  "skills": ["Python", "Django", "AWS"],
  "experience_years": 5,
  "rate_per_hour": 100.00,
  "location": "New York, NY"
}
```

#### PUT /consultants/:id
Update a consultant (admin only).

#### DELETE /consultants/:id
Soft delete a consultant (admin only).

### Companies

#### GET /companies
Get all companies (requires authentication).

**Response:**
```json
[
  {
    "id": 1,
    "name": "TechCorp Solutions",
    "industry": "Technology",
    "location": "San Francisco, CA",
    "website": "https://techcorp.com",
    "contact_email": "hr@techcorp.com",
    "contact_phone": null,
    "notes": null,
    "is_active": true,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
]
```

#### POST /companies
Create a new company (admin only).

**Request Body:**
```json
{
  "name": "New Company",
  "industry": "Technology",
  "location": "Austin, TX",
  "website": "https://newcompany.com",
  "contact_email": "hr@newcompany.com"
}
```

#### PUT /companies/:id
Update a company (admin only).

#### DELETE /companies/:id
Soft delete a company (admin only).

### Submissions

#### GET /submissions
Get submissions with optional filtering.

**Query Parameters:**
- `consultant_id` - Filter by consultant ID
- `company_id` - Filter by company ID
- `status` - Filter by status (submitted, interviewing, accepted, rejected, withdrawn)
- `start_date` - Filter submissions from this date (YYYY-MM-DD)
- `end_date` - Filter submissions to this date (YYYY-MM-DD)

**Response:**
```json
[
  {
    "id": 1,
    "consultant_id": 1,
    "company_id": 1,
    "recruiter_id": 2,
    "position_title": "Senior Full Stack Developer",
    "submission_date": "2024-01-15",
    "status": "interviewing",
    "rate_submitted": 125.00,
    "notes": "Strong React and Node.js background",
    "interview_date": null,
    "feedback": null,
    "created_at": "2024-01-15T00:00:00.000Z",
    "updated_at": "2024-01-15T00:00:00.000Z",
    "consultant_first_name": "John",
    "consultant_last_name": "Smith",
    "company_name": "TechCorp Solutions",
    "recruiter_first_name": "Jane",
    "recruiter_last_name": "Recruiter"
  }
]
```

#### POST /submissions
Create a new submission.

**Request Body:**
```json
{
  "consultant_id": 1,
  "company_id": 1,
  "position_title": "Frontend Developer",
  "submission_date": "2024-01-20",
  "rate_submitted": 110.00,
  "notes": "Great React skills"
}
```

#### PUT /submissions/:id
Update a submission.

**Request Body:**
```json
{
  "status": "accepted",
  "interview_date": "2024-01-25T10:00:00.000Z",
  "feedback": "Excellent interview, hired!"
}
```

#### DELETE /submissions/:id
Delete a submission.

#### GET /submissions/stats
Get submission statistics.

**Response:**
```json
{
  "total_submissions": 25,
  "submitted_count": 10,
  "interviewing_count": 8,
  "accepted_count": 5,
  "rejected_count": 2,
  "average_rate": 118.50
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error message description"
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting

API endpoints are rate limited to prevent abuse:
- 100 requests per minute per IP address
- 1000 requests per hour per authenticated user

## Data Validation

### Email Format
All email fields must be valid email addresses.

### Required Fields
- Users: email, password, first_name, last_name, role
- Consultants: first_name, last_name, email
- Companies: name
- Submissions: consultant_id, company_id, position_title, submission_date

### Enum Values
- User roles: `admin`, `recruiter`
- Consultant availability: `available`, `busy`, `unavailable`
- Submission status: `submitted`, `interviewing`, `accepted`, `rejected`, `withdrawn`