# Salon POS API Documentation

## Base URL

```
http://localhost:5000/api
```

## Authentication

- All endpoints (except `/auth/login` and `/auth/register`) require JWT token in header
- Header: `Authorization: Bearer <token>`

---

## PHASE 1 Endpoints

### Authentication

#### POST /auth/login

Login user and return JWT tokens

**Request:**

```json
{
  "email": "admin@salon.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": {
    "id": 1,
    "name": "Admin",
    "email": "admin@salon.com",
    "role": "admin"
  }
}
```

#### POST /auth/refresh

Refresh access token

**Request:**

```json
{
  "refreshToken": "eyJhbGc..."
}
```

**Response:**

```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

#### POST /auth/logout

Logout user (invalidate tokens)

---

### User Management

#### GET /users

Get all users (Admin only)

**Query Params:**

- `page`: number (default: 1)
- `limit`: number (default: 10)
- `role`: 'admin' | 'employee'
- `status`: 'active' | 'inactive' | 'disabled'

**Response:**

```json
{
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@salon.com",
      "role": "employee",
      "status": "active",
      "createdAt": "2025-03-28T10:00:00Z"
    }
  ],
  "total": 50,
  "page": 1,
  "limit": 10
}
```

#### POST /users

Create new user (Admin only)

**Request:**

```json
{
  "name": "New Employee",
  "email": "employee@salon.com",
  "password": "secure_password",
  "phone": "+1234567890",
  "role": "employee"
}
```

**Response:**

```json
{
  "id": 5,
  "name": "New Employee",
  "email": "employee@salon.com",
  "role": "employee",
  "status": "active"
}
```

#### GET /users/:id

Get user details

#### PATCH /users/:id

Update user details (Admin or self)

**Request:**

```json
{
  "name": "Updated Name",
  "phone": "+9876543210",
  "status": "active"
}
```

#### PATCH /users/:id/disable

Disable user account (Admin only)

#### POST /users/:id/assign-role

Assign role to user (Admin only)

**Request:**

```json
{
  "role": "admin"
}
```

---

### Service Management

#### GET /services

Get all services

**Query Params:**

- `category_id`: number
- `is_active`: 1 | 0
- `page`: number
- `limit`: number

**Response:**

```json
{
  "data": [
    {
      "id": 1,
      "name": "Hair Cut",
      "category": "Hair",
      "duration": 30,
      "basePrice": 500,
      "commissionType": "percentage",
      "commissionValue": 20,
      "isActive": true
    }
  ]
}
```

#### POST /services

Create new service (Admin only)

**Request:**

```json
{
  "name": "Hair Cut",
  "categoryId": 1,
  "description": "Standard hair cut",
  "duration": 30,
  "basePrice": 500,
  "commissionType": "percentage",
  "commissionValue": 20
}
```

#### GET /services/:id

Get service details

#### PATCH /services/:id

Update service (Admin only)

#### PATCH /services/:id/disable

Disable service (Admin only)

---

#### GET /service-categories

Get all service categories

#### POST /service-categories

Create service category (Admin only)

**Request:**

```json
{
  "name": "Hair",
  "description": "Hair services"
}
```

---

### Task Management

#### GET /tasks

Get tasks (filter by role and location)

**Query Params:**

- `employee_id`: number
- `date`: YYYY-MM-DD
- `status`: 'pending' | 'in_progress' | 'completed' | 'cancelled'
- `page`: number
- `limit`: number

**Response:**

```json
{
  "data": [
    {
      "id": 1,
      "employeeId": 2,
      "employeeName": "John Doe",
      "customerId": 5,
      "customerName": "Jane Smith",
      "serviceId": 1,
      "serviceName": "Hair Cut",
      "startTime": "2025-03-28T10:00:00Z",
      "endTime": "2025-03-28T10:30:00Z",
      "status": "completed",
      "price": 500,
      "notes": "Customer requested layers",
      "productsUsed": [
        {
          "productId": 1,
          "productName": "Hair Spray",
          "quantityUsed": 50
        }
      ]
    }
  ]
}
```

#### POST /tasks

Create new task (Employee creates own task)

**Request:**

```json
{
  "serviceId": 1,
  "customerId": 5,
  "startTime": "2025-03-28T10:00:00Z",
  "endTime": "2025-03-28T10:30:00Z",
  "price": 500,
  "notes": "Customer notes here",
  "productsUsed": [
    {
      "productId": 1,
      "batchId": 5,
      "quantityUsed": 50
    }
  ]
}
```

#### GET /tasks/:id

Get task details

#### PATCH /tasks/:id

Update task

**Request (partial update):**

```json
{
  "status": "completed",
  "endTime": "2025-03-28T10:30:00Z",
  "price": 550
}
```

#### GET /tasks/:id/performance

Get employee performance summary

**Response:**

```json
{
  "employeeId": 2,
  "employeeName": "John Doe",
  "today": {
    "tasksCompleted": 8,
    "totalRevenue": 4000,
    "averagePrice": 500
  },
  "thisMonth": {
    "tasksCompleted": 120,
    "totalRevenue": 60000
  }
}
```

---

### Commission Management

#### GET /commissions/:employeeId/:month

Get commission report for employee in month

**Response:**

```json
{
  "employeeId": 2,
  "month": "2025-03",
  "totalCommissionAmount": 12000,
  "commissionByService": [
    {
      "serviceName": "Hair Cut",
      "tasksCompleted": 80,
      "totalRevenue": 40000,
      "commissionPercentage": 20,
      "commissionAmount": 8000
    }
  ]
}
```

---

### Reports

#### GET /reports/sales

Get sales report

**Query Params:**

- `startDate`: YYYY-MM-DD
- `endDate`: YYYY-MM-DD
- `groupBy`: 'day' | 'week' | 'month'

**Response:**

```json
{
  "startDate": "2025-03-01",
  "endDate": "2025-03-28",
  "totalRevenue": 150000,
  "totalTasks": 300,
  "averageTaskValue": 500,
  "dailyBreakdown": [
    {
      "date": "2025-03-28",
      "revenue": 5000,
      "tasksCompleted": 10
    }
  ]
}
```

#### GET /reports/employees

Get employee performance report

**Query Params:**

- `month`: YYYY-MM
- `sortBy`: 'revenue' | 'tasks' | 'commission'

**Response:**

```json
{
  "month": "2025-03",
  "employees": [
    {
      "employeeId": 2,
      "employeeName": "John Doe",
      "tasksCompleted": 120,
      "totalRevenue": 60000,
      "commissionEarned": 12000
    }
  ]
}
```

#### GET /reports/services

Get service popularity report

**Response:**

```json
{
  "period": "month",
  "services": [
    {
      "serviceId": 1,
      "serviceName": "Hair Cut",
      "timesPerformed": 150,
      "totalRevenue": 75000,
      "averagePrice": 500
    }
  ]
}
```

---

## PHASE 2 Endpoints (POS & Inventory)

### Invoices

#### POST /invoices

Create invoice

#### GET /invoices

Get invoices list

#### PATCH /invoices/:id/void

Void an invoice

---

### Inventory

#### POST /inventory/products

Add product

#### GET /inventory/batches

Get batch list

#### POST /inventory/purchase

Record purchase entry

#### GET /inventory/alerts

Get low stock and expiry alerts

---

## PHASE 3 Endpoints (Customers)

### Customers

#### GET /customers

Get customers list

#### POST /customers

Create customer

#### GET /customers/:id

Get customer profile

---

## Error Responses

### 400 Bad Request

```json
{
  "error": "Validation failed",
  "details": ["Email is required", "Password must be at least 6 characters"]
}
```

### 401 Unauthorized

```json
{
  "error": "Unauthorized",
  "message": "Invalid token or token expired"
}
```

### 403 Forbidden

```json
{
  "error": "Forbidden",
  "message": "You don't have permission to access this resource"
}
```

### 404 Not Found

```json
{
  "error": "Not found",
  "message": "Resource not found"
}
```

### 500 Internal Server Error

```json
{
  "error": "Internal server error",
  "message": "Something went wrong on the server"
}
```

---

## Status Codes

- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `422`: Unprocessable Entity
- `500`: Internal Server Error

---

## Rate Limiting

- Login endpoint: 5 requests per minute per IP
- General endpoints: 100 requests per minute per user

---

**API Version:** 1.0.0
**Last Updated:** 2025-03-28
