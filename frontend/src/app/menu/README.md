# Customer Menu Page

A customer-facing menu page where customers can browse restaurant items, select tables, add items to cart, and call waiters.

## Features

### 🍽️ Menu Browsing
- Browse menu items with images, descriptions, and prices
- Filter by categories (pizza, burgers, sushi, salads, etc.)
- Search functionality for finding specific items
- View item ratings, preparation time, and dietary information
- Responsive grid layout for different screen sizes

### 🪑 Table Selection
- Select from available tables with different capacities
- View table locations (Window Side, Center, Corner, Patio, Private Room)
- Table selection is required before placing orders
- Current table is displayed in the navbar

### 🛒 Shopping Cart
- Add/remove items with quantity controls
- Real-time cart total calculation
- Cart item count badge in navbar
- Review order before booking
- Persistent cart state during session

### 🔔 Waiter Service
- Call waiter button with predefined reasons:
  - Need assistance with menu
  - Ready to order
  - Request for water
  - Need extra napkins
  - Request for bill
  - Other assistance

### 📱 Responsive Design
- Mobile-first design with responsive navbar
- Collapsible mobile menu with all features
- Touch-friendly interface for mobile devices
- Desktop optimized layout with search bar

### 🎨 UI Components
- Built with shadcn/ui components
- Consistent design system
- Dark/light theme support
- Accessible components with proper ARIA labels

## Components

### CustomerNavbar
- Responsive navigation with logo and branding
- Search functionality (desktop and mobile)
- Table selection, cart, and waiter call buttons
- User profile dropdown
- Mobile hamburger menu

### CustomerLayout
- Wrapper component for consistent page layout
- Handles navbar props and state management
- Provides consistent spacing and background

## Usage

```tsx
import CustomerMenuPage from '@/app/menu/page';

// The page handles all state management internally
<CustomerMenuPage />
```

## File Structure

```
frontend/src/app/menu/
├── page.tsx              # Main menu page component
├── README.md            # This documentation
└── ...

frontend/src/components/customer/
├── navbar.tsx           # Customer navigation component
├── layout.tsx          # Customer layout wrapper
└── ...
```

## State Management

The page manages several pieces of state:
- `searchTerm`: Current search query
- `categoryFilter`: Selected category filter
- `selectedTable`: Currently selected table
- `cart`: Array of cart items with quantities
- `showCartDialog`: Cart dialog visibility
- `showTableDialog`: Table selection dialog visibility
- `showCallWaiterDialog`: Waiter call dialog visibility

## Future Enhancements

- [ ] Real-time order tracking
- [ ] Payment integration
- [ ] Order history
- [ ] Favorites/wishlist
- [ ] Nutritional information
- [ ] Allergen filtering
- [ ] Multi-language support
- [ ] Voice ordering
- [ ] AR menu visualization