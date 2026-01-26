# Kolekta Korner - Pokemon TCG Collector

## Project Information

**App Name**: Kolekta Korner
**Description**: Pokemon TCG collection tracker and marketplace
**Tech Stack**: Next.js 14, React 18, TypeScript, MongoDB, Tailwind CSS
**Port**: 3005
**Started**: January 20, 2026

## Price Data Policy

**IMPORTANT: NEVER use fake, mock, or backdated price data.**

- Only use real price data fetched from the Pokemon TCG API
- Database should only contain actual daily price snapshots
- Historical data will build naturally over time (1 day = 1 data point)
- The cron job at `scripts/fetch-prices-cron.ts` runs daily at 2 AM to collect real prices
- Graph may show limited data points initially - this is expected and correct

### Price Data Scripts

**Approved scripts:**
- `scripts/fetch-prices-cron.ts` - Fetches real prices from Pokemon TCG API (runs daily at 2 AM)
- `scripts/clear-mock-prices.ts` - Removes fake/seeded data, keeps only real data from today

**Do NOT use:**
- `scripts/backdate-real-prices.ts` - Creates fake backdated data
- `scripts/backdate-prices-with-variation.ts` - Creates fake backdated data with variation
- Any script that generates historical data artificially

### Current State

- Database contains only real price data from today
- Historical price tracking started: January 20, 2026
- Data will accumulate daily via automated cron job

## Marketplace Pricing

**IMPORTANT: Marketplace uses PHP (Philippine Peso) only.**

- All marketplace listings are stored in PHP (₱)
- NO currency conversion for marketplace prices
- User-to-user transactions are always in PHP
- Only TCG API card prices use multi-currency conversion
- Price display functions should NOT call `convertPrice()` for marketplace items

## Project Overview

Next.js 14 (App Router) Pokemon TCG collection tracker with marketplace features:

### Core Features
- Card browsing and search
- Collection management (owned cards with quantities)
- Wishlist management (wanted cards with priorities)
- Real-time price tracking from Pokemon TCG API
- Historical price graphs (builds over time with real data)
- Print card functionality
- Dark mode support
- Currency conversion for TCG API prices (USD, CAD, EUR, GBP, JPY)

### Marketplace Features
- User authentication (JWT-based)
- Create listings from collection
- Browse marketplace listings
- Messaging system between buyers/sellers
- Listing management (active/sold/cancelled)
- Quantity locking when listed
- Card condition and grading support (PSA, CGC, BGS)
- Image uploads for listings
- **PHP-only pricing** (no currency conversion)

### User Interface
- Toast notification system (success, error, warning, info)
- Retro Pokemon-themed design
- Pixel font styling
- Mobile-responsive with hamburger menu
- Simplified navigation bar

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS, Custom pixel theme
- **Database**: MongoDB (user data, marketplace, price history)
- **Storage**: LocalStorage (collection/wishlist fallback)
- **Authentication**: JWT tokens, bcrypt
- **APIs**: Pokemon TCG SDK
- **Charts**: Recharts (price graphs)
- **Icons**: Lucide React
- **Image Handling**: Next/Image, file uploads

## Project Structure

```
/app
  /api
    /auth - Authentication endpoints
    /collection - Collection management
    /marketplace - Marketplace CRUD
    /messages - Messaging system
    /preferences - User preferences
    /prices - Price tracking
  /cards - Card browsing
  /collection - User collection
  /marketplace - Marketplace pages
  /wishlist - Wishlist
  /sets - Set browsing
/components
  /pokemon - Card-specific components
  /ui - Reusable UI components
/contexts
  - AuthContext
  - CollectionContext
  - CurrencyContext
  - ToastContext
/lib
  - pokemon-api.ts - TCG API wrapper
  - mongodb.ts - Database connection
  - auth.ts - Auth utilities
/models
  - User, UserCollection, MarketplaceListing, Message, DailyPrice
/public
  - Kolekta-Korner-logo.png
```

## Key Features

1. **Card Browsing**: Browse all Pokemon cards with filters and search
2. **Collection Tracking**: Add cards to collection with quantities
3. **Wishlist**: Save wanted cards with priority levels (low, medium, high)
4. **Price Tracking**: Real-time prices and historical graphs from TCG API
5. **Currency Support**: Multi-currency conversion for TCG prices (not marketplace)
6. **Print Cards**: Generate printable card sheets
7. **Marketplace**: List and buy cards from other users (PHP only)
8. **Messaging**: In-app messaging between buyers and sellers
9. **User Management**: Authentication, profiles, preferences
10. **Toast Notifications**: User feedback for all actions

## Development Guidelines

### TypeScript
- Use TypeScript strict mode
- Never use "any" type
- Define proper interfaces for all data structures

### React/Next.js
- Prefer server components over client components
- Use client components only when needed (interactivity, hooks, context)
- Follow Next.js 14 App Router patterns
- Use metadata for SEO

### Styling
- Use Tailwind utility classes
- Follow retro Pokemon theme (pixel fonts, border styles)
- Keep components small and focused
- Mobile-first responsive design

### API/Database
- Always use `connectToDatabase()` from `@/lib/mongodb`
- Use proper error handling and try-catch blocks
- Return appropriate HTTP status codes
- Use toast notifications instead of browser alerts

### User Experience
- Use toast notifications for all user feedback
- Provide loading states for async operations
- Handle API timeouts gracefully (10s timeout for external APIs)
- Show fallback UI when external services fail

### Marketplace Specific
- Always store/display prices in PHP (₱)
- Lock quantities when creating listings
- Unlock quantities when cancelling/deleting
- Validate ownership before updates/deletes
- No currency conversion for marketplace prices

## Common Patterns

### Using Toast Notifications
```typescript
import { useToast } from '@/contexts/ToastContext';

const toast = useToast();
toast.success('Operation successful!');
toast.error('Something went wrong');
toast.warning('Please check your input');
toast.info('Here is some information');
```

### Database Connection
```typescript
import { connectToDatabase } from '@/lib/mongodb';

await connectToDatabase();
// Then use mongoose models
```

### Authentication Check
```typescript
import { getUserFromRequest } from '@/lib/auth';

const user = await getUserFromRequest(request);
if (!user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

### Marketplace Price Display
```typescript
// CORRECT - No conversion
const formatPrice = (priceInPHP: number) => {
  return `₱${priceInPHP.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
};

// WRONG - Don't use convertPrice for marketplace
const formatPrice = (priceInPHP: number) => {
  const converted = convertPrice(priceInPHP, 'PHP'); // ❌ NO!
  return `${symbol}${converted.toLocaleString(...)}`;
};
```

## Recent Updates (January 2026)

- ✅ Rebranded from "Kolekta" to "Kolekta Korner"
- ✅ Updated logo to Kolekta-Korner-logo.png
- ✅ Implemented toast notification system
- ✅ Fixed marketplace pricing (PHP only, no conversion)
- ✅ Simplified navigation bar
- ✅ Added API timeout handling (10s for external APIs)
- ✅ Fixed import errors in marketplace routes
- ✅ Removed currency conversion from marketplace pages

## Known Issues

- Pokemon TCG API occasionally times out (504 errors) - handled gracefully with fallback UI
- Mobile menu implementation uses PokemonBurger component
- External API dependency for card data
