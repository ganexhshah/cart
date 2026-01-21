# API Endpoints Summary

## Base URL: `http://localhost:3001/api`

### Authentication Endpoints
```
POST   /auth/register           - Register new user
POST   /auth/login              - User login
POST   /auth/logout             - User logout
POST   /auth/refresh            - Refresh access token
POST   /auth/forgot-password    - Request password reset
POST   /auth/reset-password     - Reset password with token
POST   /auth/verify-otp         - Verify OTP
```

### Restaurant Management
```
GET    /restaurants             - Get all restaurants
POST   /restaurants             - Create new restaurant
GET    /restaurants/:id         - Get restaurant by ID
PUT    /restaurants/:id         - Update restaurant
DELETE /restaurants/:id         - Delete restaurant
POST   /restaurants/:id/upload-image - Upload restaurant image
```

### Menu Management
```
GET    /menu/categories         - Get menu categories
POST   /menu/categories         - Create menu category
PUT    /menu/categories/:id     - Update menu category
DELETE /menu/categories/:id     - Delete menu category

GET    /menu/items              - Get menu items
POST   /menu/items              - Create menu item
GET    /menu/items/:id          - Get menu item by ID
PUT    /menu/items/:id          - Update menu item
DELETE /menu/items/:id          - Delete menu item
POST   /menu/items/:id/upload-image - Upload menu item image
```

### Order Management
```
GET    /orders                  - Get all orders
POST   /orders                  - Create new order
GET    /orders/:id              - Get order by ID
PUT    /orders/:id              - Update order
PUT    /orders/:id/status       - Update order status
POST   /orders/:id/cancel       - Cancel order
DELETE /orders/:id              - Delete order
```

### Table Management
```
GET    /tables                  - Get all tables
POST   /tables                  - Create new table
GET    /tables/:id              - Get table by ID
PUT    /tables/:id              - Update table
DELETE /tables/:id              - Delete table
GET    /tables/:id/qr-code      - Generate table QR code
PUT    /tables/:id/status       - Update table status
```

### Staff Management
```
GET    /staff                   - Get all staff
POST   /staff                   - Create new staff member
GET    /staff/:id               - Get staff by ID
PUT    /staff/:id               - Update staff member
DELETE /staff/:id               - Delete staff member
PUT    /staff/:id/status        - Update staff status
```

### Customer Management
```
GET    /customers               - Get all customers
POST   /customers               - Create new customer
GET    /customers/:id           - Get customer by ID
PUT    /customers/:id           - Update customer
DELETE /customers/:id           - Delete customer
GET    /customers/:id/orders    - Get customer orders
```

### Inventory Management
```
GET    /inventory/materials     - Get all raw materials
POST   /inventory/materials     - Create raw material
GET    /inventory/materials/:id - Get material by ID
PUT    /inventory/materials/:id - Update material
DELETE /inventory/materials/:id - Delete material
POST   /inventory/materials/:id/adjust-stock - Adjust stock
GET    /inventory/stock-alerts  - Get low stock alerts
GET    /inventory/usage-history - Get usage history
```

### Purchase Management
```
GET    /purchases/suppliers     - Get all suppliers
POST   /purchases/suppliers     - Create supplier
PUT    /purchases/suppliers/:id - Update supplier

GET    /purchases/orders        - Get purchase orders
POST   /purchases/orders        - Create purchase order
GET    /purchases/orders/:id    - Get purchase order by ID
PUT    /purchases/orders/:id/status - Update PO status
POST   /purchases/orders/:id/receive - Receive PO items

GET    /purchases/history       - Get purchase history
GET    /purchases/cost-tracking - Get cost tracking data
POST   /purchases/cost-tracking/update - Update cost tracking
```

### Billing Management
```
GET    /billing/invoices        - Get all invoices
POST   /billing/invoices        - Create invoice
GET    /billing/invoices/:id    - Get invoice by ID
PUT    /billing/invoices/:id    - Update invoice
PUT    /billing/invoices/:id/payment - Record payment
DELETE /billing/invoices/:id    - Delete invoice

GET    /billing/reports/daily   - Daily billing report
GET    /billing/reports/weekly  - Weekly billing report
GET    /billing/reports/monthly - Monthly billing report
GET    /billing/reports/yearly  - Yearly billing report
```

### KOT (Kitchen Order Ticket) Management
```
GET    /kot/tickets             - Get all KOT tickets
POST   /kot/tickets             - Create KOT ticket
GET    /kot/tickets/:id         - Get KOT by ID
PUT    /kot/tickets/:id         - Update KOT
PUT    /kot/tickets/:id/status  - Update KOT status
DELETE /kot/tickets/:id         - Delete KOT

GET    /kot/kitchen-display     - Get kitchen display data
GET    /kot/pending             - Get pending KOTs
GET    /kot/completed           - Get completed KOTs
```

### POS (Point of Sale) Management
```
GET    /pos/transactions        - Get POS transactions
POST   /pos/transactions        - Create POS transaction
GET    /pos/transactions/:id    - Get transaction by ID
PUT    /pos/transactions/:id    - Update transaction
DELETE /pos/transactions/:id    - Delete transaction

GET    /pos/daily-summary       - Get daily POS summary
GET    /pos/shift-summary       - Get shift summary
POST   /pos/shift/open          - Open new shift
POST   /pos/shift/close         - Close current shift
```

### Analytics & Reports
```
GET    /analytics/dashboard     - Get dashboard analytics
GET    /analytics/sales         - Get sales analytics
GET    /analytics/revenue       - Get revenue analytics
GET    /analytics/menu-performance - Get menu performance
GET    /analytics/customer-insights - Get customer insights
GET    /analytics/staff-performance - Get staff performance
GET    /analytics/inventory-turnover - Get inventory turnover
```

### Review Management
```
GET    /reviews                 - Get all reviews
POST   /reviews                 - Create review
GET    /reviews/:id             - Get review by ID
PUT    /reviews/:id             - Update review
DELETE /reviews/:id             - Delete review
PUT    /reviews/:id/response    - Respond to review
GET    /reviews/summary         - Get review summary
```

### Security & User Management
```
GET    /users                   - Get all users
POST   /users                   - Create user
GET    /users/:id               - Get user by ID
PUT    /users/:id               - Update user
DELETE /users/:id               - Delete user
PUT    /users/:id/password      - Change user password
PUT    /users/:id/role          - Update user role

GET    /security/audit-logs     - Get audit logs
GET    /security/login-attempts - Get login attempts
POST   /security/block-ip       - Block IP address
POST   /security/unblock-ip     - Unblock IP address
```

### Subscription Management
```
GET    /subscriptions           - Get subscription details
POST   /subscriptions/upgrade   - Upgrade subscription
POST   /subscriptions/downgrade - Downgrade subscription
POST   /subscriptions/cancel    - Cancel subscription
GET    /subscriptions/usage     - Get usage statistics
```

### File Upload
```
POST   /upload/image            - Upload image file
POST   /upload/document         - Upload document
DELETE /upload/:publicId        - Delete uploaded file
```

### Health & System
```
GET    /health                  - Health check endpoint
GET    /status                  - System status
GET    /version                 - API version info
```

## HTTP Status Codes Used

| Code | Description |
|------|-------------|
| 200  | OK - Request successful |
| 201  | Created - Resource created successfully |
| 204  | No Content - Request successful, no content returned |
| 400  | Bad Request - Invalid request data |
| 401  | Unauthorized - Authentication required |
| 403  | Forbidden - Access denied |
| 404  | Not Found - Resource not found |
| 409  | Conflict - Resource already exists |
| 422  | Unprocessable Entity - Validation failed |
| 429  | Too Many Requests - Rate limit exceeded |
| 500  | Internal Server Error - Server error |

## Authentication Required
All endpoints except `/health`, `/status`, `/version`, and authentication endpoints require a valid JWT token in the Authorization header:

```
Authorization: Bearer <jwt-token>
```

## Rate Limiting
- 100 requests per minute per IP
- 1000 requests per hour per authenticated user

## CORS Configuration
- Allowed Origins: `http://localhost:3000` (frontend)
- Allowed Methods: GET, POST, PUT, PATCH, DELETE
- Allowed Headers: Content-Type, Authorization
- Credentials: Enabled