# Floor Management System

The Floor Management page provides comprehensive table and order management capabilities for restaurant operations.

## Features

### 1. Table Overview
- **Visual Table Grid**: See all tables with their current status
- **Real-time Status**: Available, Occupied, Reserved, Maintenance
- **Quick Filters**: Search by table name/number, filter by status and restaurant
- **Table Information**: Capacity, location, table type

### 2. Table Management
- **Table Details**: View comprehensive table information
- **Status Management**: Change table status with one click
- **Order History**: View all past orders for a table
- **Current Orders**: Manage active orders for each table

### 3. Order Management
- **Order Status Tracking**: Pending → Confirmed → Preparing → Ready → Served → Completed
- **Order Details**: View items, quantities, special instructions
- **Status Updates**: Update order status with action buttons
- **Order History**: Access to completed and cancelled orders

### 4. POS Integration
- **Menu Display**: Browse available menu items
- **Cart Management**: Add/remove items, adjust quantities
- **Order Creation**: Create new orders directly from the floor
- **Payment Processing**: Support for cash, card, and digital payments
- **Real-time Updates**: Automatic table status updates after order creation

### 5. Real-time Features
- **Auto Refresh**: Manual refresh button to get latest data
- **Status Synchronization**: Table and order statuses sync across the system
- **Live Updates**: Changes reflect immediately in the interface

## Usage

### Managing Tables
1. **View Tables**: All tables are displayed in a grid layout
2. **Filter Tables**: Use search and status filters to find specific tables
3. **Change Status**: Use the dropdown on each table card to change status
4. **View Details**: Click "Manage" to see detailed table information

### Managing Orders
1. **View Active Orders**: Click "Manage" on any table to see current orders
2. **Update Status**: Use the status buttons to move orders through the workflow
3. **View History**: Switch to "Order History" tab to see completed orders
4. **Order Details**: Each order shows items, quantities, and total amount

### Creating Orders (POS)
1. **Open POS**: Click "POS" button on any table
2. **Browse Menu**: Select items from the menu grid
3. **Build Cart**: Add items, adjust quantities as needed
4. **Select Payment**: Choose payment method (cash/card/digital)
5. **Process Order**: Click "Process Order" to create the order

### Order Workflow
```
Pending → Confirmed → Preparing → Ready → Served → Completed
```

- **Pending**: Order just created, waiting for confirmation
- **Confirmed**: Order confirmed by staff, ready for kitchen
- **Preparing**: Kitchen is preparing the order
- **Ready**: Order is ready for serving
- **Served**: Order has been served to customers
- **Completed**: Order is finished and paid

## Navigation

Access the Floor Management system through:
- **Dashboard Sidebar**: Management → Floor Management
- **Direct URL**: `/dashboard/floor-management`

## Integration

The Floor Management system integrates with:
- **Tables API**: For table data and status management
- **Orders API**: For order creation and status updates
- **POS API**: For payment processing and order creation
- **Menu API**: For displaying available items
- **Restaurant API**: For restaurant-specific data

## Benefits

1. **Centralized Control**: Manage all tables and orders from one interface
2. **Improved Efficiency**: Quick status updates and order management
3. **Better Service**: Real-time order tracking and status updates
4. **Streamlined Operations**: Integrated POS system for immediate order creation
5. **Enhanced Visibility**: Complete overview of restaurant floor operations