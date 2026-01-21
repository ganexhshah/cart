# Restaurant Management System - API Documentation

## Base URL
```
http://localhost:3001/api
```

## Authentication
All API endpoints require authentication using Bearer token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Response Format
All API responses follow this format:
```json
{
  "success": true|false,
  "data": <response_data>,
  "message": "Optional message",
  "error": "Error message (if success is false)"
}
```

---

## 1. Authentication APIs

### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "1234567890"
    },
    "token": "jwt-token",
    "refreshToken": "refresh-token"
  }
}
```

### POST /auth/login
Login with email and password.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### POST /auth/logout
Logout and invalidate tokens.

### POST /auth/refresh
Refresh access token using refresh token.

### POST /auth/forgot-password
Request password reset.

### POST /auth/reset-password
Reset password with token.

### POST /auth/verify-otp
Verify OTP for two-factor authentication.

---

## 2. Restaurant APIs

### GET /restaurants
Get all restaurants for the authenticated user.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search by name or location

### POST /restaurants
Create a new restaurant.

**Request Body:**
```json
{
  "name": "My Restaurant",
  "description": "Best food in town",
  "address": "123 Main St",
  "city": "New York",
  "state": "NY",
  "zipCode": "10001",
  "phone": "1234567890",
  "email": "restaurant@example.com",
  "cuisine": "Italian",
  "priceRange": "$$"
}
```

### GET /restaurants/:id
Get restaurant by ID.

### PUT /restaurants/:id
Update restaurant details.

### DELETE /restaurants/:id
Delete restaurant.

### POST /restaurants/:id/upload-image
Upload restaurant image.

---

## 3. Menu Management APIs

### GET /menu/categories
Get all menu categories for a restaurant.

### POST /menu/categories
Create a new menu category.

**Request Body:**
```json
{
  "name": "Appetizers",
  "description": "Start your meal right",
  "displayOrder": 1,
  "isActive": true
}
```

### GET /menu/items
Get all menu items.

**Query Parameters:**
- `categoryId` (optional): Filter by category
- `isActive` (optional): Filter by active status
- `search` (optional): Search by name or description

### POST /menu/items
Create a new menu item.

**Request Body:**
```json
{
  "name": "Margherita Pizza",
  "description": "Fresh tomatoes, mozzarella, basil",
  "price": 12.99,
  "categoryId": "category-uuid",
  "ingredients": ["tomatoes", "mozzarella", "basil"],
  "allergens": ["dairy"],
  "isVegetarian": true,
  "isVegan": false,
  "isGlutenFree": false,
  "preparationTime": 15,
  "calories": 250,
  "isActive": true
}
```

### PUT /menu/items/:id
Update menu item.

### DELETE /menu/items/:id
Delete menu item.

---

## 4. Order Management APIs

### GET /orders
Get all orders.

**Query Parameters:**
- `status` (optional): Filter by status (pending, confirmed, preparing, ready, delivered, cancelled)
- `tableId` (optional): Filter by table
- `startDate` (optional): Filter by date range
- `endDate` (optional): Filter by date range
- `page` (optional): Page number
- `limit` (optional): Items per page

### POST /orders
Create a new order.

**Request Body:**
```json
{
  "tableId": "table-uuid",
  "customerName": "John Doe",
  "customerPhone": "1234567890",
  "items": [
    {
      "menuItemId": "item-uuid",
      "quantity": 2,
      "specialInstructions": "Extra cheese"
    }
  ],
  "notes": "Customer notes"
}
```

### GET /orders/:id
Get order by ID.

### PUT /orders/:id/status
Update order status.

**Request Body:**
```json
{
  "status": "confirmed",
  "notes": "Order confirmed by kitchen"
}
```

### POST /orders/:id/cancel
Cancel an order.

---

## 5. Table Management APIs

### GET /tables
Get all tables for a restaurant.

### POST /tables
Create a new table.

**Request Body:**
```json
{
  "number": "T001",
  "capacity": 4,
  "location": "Main Hall",
  "isActive": true
}
```

### PUT /tables/:id
Update table details.

### DELETE /tables/:id
Delete table.

### GET /tables/:id/qr-code
Generate QR code for table.

---

## 6. Staff Management APIs

### GET /staff
Get all staff members.

### POST /staff
Add new staff member.

**Request Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@restaurant.com",
  "phone": "1234567890",
  "role": "waiter",
  "salary": 30000,
  "hireDate": "2024-01-15",
  "isActive": true
}
```

### PUT /staff/:id
Update staff member.

### DELETE /staff/:id
Remove staff member.

---

## 7. Customer Management APIs

### GET /customers
Get all customers.

### POST /customers
Add new customer.

**Request Body:**
```json
{
  "name": "Customer Name",
  "email": "customer@example.com",
  "phone": "1234567890",
  "address": "Customer Address",
  "dateOfBirth": "1990-01-01",
  "preferences": ["vegetarian"]
}
```

### GET /customers/:id
Get customer by ID.

### PUT /customers/:id
Update customer details.

---

## 8. Inventory Management APIs

### GET /inventory/materials
Get all raw materials.

### POST /inventory/materials
Add new raw material.

**Request Body:**
```json
{
  "name": "Tomatoes",
  "unit": "kg",
  "category": "vegetables",
  "minimumStock": 10,
  "currentStock": 50,
  "unitCost": 2.50,
  "supplier": "Local Farm"
}
```

### PUT /inventory/materials/:id
Update raw material.

### POST /inventory/materials/:id/adjust-stock
Adjust stock levels.

**Request Body:**
```json
{
  "quantity": 10,
  "type": "add|subtract",
  "reason": "Purchase|Usage|Waste|Adjustment",
  "notes": "Weekly stock adjustment"
}
```

### GET /inventory/stock-alerts
Get low stock alerts.

---

## 9. Purchase Management APIs

### GET /purchases/suppliers
Get all suppliers.

### POST /purchases/suppliers
Create new supplier.

**Request Body:**
```json
{
  "name": "Fresh Dairy Co.",
  "contactPerson": "Ram Sharma",
  "email": "ram@freshdairy.com",
  "phone": "9841234567",
  "address": "Kathmandu, Nepal",
  "businessType": "distributor",
  "paymentTerms": "credit_30"
}
```

### GET /purchases/orders
Get all purchase orders.

### POST /purchases/orders
Create new purchase order.

**Request Body:**
```json
{
  "supplierId": "supplier-uuid",
  "expectedDeliveryDate": "2024-01-25",
  "items": [
    {
      "rawMaterialId": "material-uuid",
      "itemName": "Milk",
      "unit": "liter",
      "quantity": 50,
      "unitPrice": 50.00
    }
  ],
  "notes": "Urgent delivery required"
}
```

### PUT /purchases/orders/:id/status
Update purchase order status.

### POST /purchases/orders/:id/receive
Receive purchase order items.

### GET /purchases/history
Get purchase history.

### GET /purchases/cost-tracking
Get cost tracking data.

---

## 10. Billing Management APIs

### GET /billing/invoices
Get all invoices.

### POST /billing/invoices
Create new invoice.

**Request Body:**
```json
{
  "orderId": "order-uuid",
  "customerId": "customer-uuid",
  "items": [
    {
      "description": "Margherita Pizza",
      "quantity": 2,
      "unitPrice": 12.99,
      "totalPrice": 25.98
    }
  ],
  "subtotal": 25.98,
  "taxRate": 0.13,
  "taxAmount": 3.38,
  "totalAmount": 29.36,
  "paymentMethod": "cash"
}
```

### GET /billing/invoices/:id
Get invoice by ID.

### PUT /billing/invoices/:id/payment
Record payment for invoice.

### GET /billing/reports/daily
Get daily billing report.

### GET /billing/reports/monthly
Get monthly billing report.

---

## 11. KOT (Kitchen Order Ticket) APIs

### GET /kot/tickets
Get all KOT tickets.

### POST /kot/tickets
Create new KOT ticket.

**Request Body:**
```json
{
  "orderId": "order-uuid",
  "tableNumber": "T001",
  "items": [
    {
      "menuItemId": "item-uuid",
      "itemName": "Margherita Pizza",
      "quantity": 2,
      "specialInstructions": "Extra cheese"
    }
  ],
  "priority": "normal",
  "notes": "Rush order"
}
```

### PUT /kot/tickets/:id/status
Update KOT status.

### GET /kot/kitchen-display
Get kitchen display data.

---

## 12. POS (Point of Sale) APIs

### POST /pos/transactions
Process POS transaction.

**Request Body:**
```json
{
  "items": [
    {
      "menuItemId": "item-uuid",
      "quantity": 2,
      "unitPrice": 12.99
    }
  ],
  "paymentMethod": "cash",
  "amountPaid": 30.00,
  "customerId": "customer-uuid",
  "tableId": "table-uuid"
}
```

### GET /pos/transactions
Get POS transactions.

### GET /pos/daily-summary
Get daily POS summary.

---

## 13. Analytics APIs

### GET /analytics/dashboard
Get dashboard analytics.

### GET /analytics/sales
Get sales analytics.

**Query Parameters:**
- `period`: daily|weekly|monthly|yearly
- `startDate`: Start date (YYYY-MM-DD)
- `endDate`: End date (YYYY-MM-DD)

### GET /analytics/menu-performance
Get menu item performance analytics.

### GET /analytics/customer-insights
Get customer behavior insights.

### GET /analytics/revenue
Get revenue analytics.

---

## 14. Review Management APIs

### GET /reviews
Get all reviews for restaurant.

### POST /reviews
Create new review.

**Request Body:**
```json
{
  "customerId": "customer-uuid",
  "orderId": "order-uuid",
  "rating": 5,
  "comment": "Excellent food and service!",
  "foodRating": 5,
  "serviceRating": 5,
  "ambianceRating": 4
}
```

### PUT /reviews/:id/response
Respond to review.

### GET /reviews/summary
Get review summary and statistics.

---

## 15. Upload APIs

### POST /upload/image
Upload image file.

**Request:** Multipart form data with image file

**Response:**
```json
{
  "success": true,
  "data": {
    "url": "https://cloudinary.com/image-url",
    "publicId": "image-public-id"
  }
}
```

---

## Error Codes

| Code | Description |
|------|-------------|
| 400  | Bad Request - Invalid input data |
| 401  | Unauthorized - Invalid or missing token |
| 403  | Forbidden - Insufficient permissions |
| 404  | Not Found - Resource not found |
| 409  | Conflict - Resource already exists |
| 422  | Unprocessable Entity - Validation errors |
| 500  | Internal Server Error |

## Rate Limiting
- 100 requests per minute per IP address
- 1000 requests per hour per authenticated user

## Pagination
For endpoints that return lists, use these query parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)

Response includes pagination metadata:
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

## WebSocket Events
Real-time updates are available via WebSocket connection at `ws://localhost:3001`

### Events:
- `order:created` - New order created
- `order:updated` - Order status updated
- `kot:created` - New KOT ticket created
- `kot:updated` - KOT status updated
- `table:occupied` - Table occupied
- `table:available` - Table available

## Environment Variables
```env
PORT=3001
NODE_ENV=development
DATABASE_URL=postgresql://username:password@localhost:5432/restaurant_db
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
REDIS_URL=redis://localhost:6379
FRONTEND_URL=http://localhost:3000
```