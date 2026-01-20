# Pokemon TCG Collector - Project Instructions

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

## Project Overview

Next.js 14 (App Router) Pokemon TCG collection tracker with:
- Card browsing and search
- Collection management (owned cards with quantities)
- Wishlist management (wanted cards with priorities)
- Real-time price tracking from Pokemon TCG API
- Historical price graphs (builds over time with real data)
- Print card functionality
- Dark mode support
- Currency conversion (USD, CAD, EUR, GBP, JPY)

## Tech Stack

- Next.js 14 (App Router, Server Components)
- React 18
- TypeScript
- Tailwind CSS
- MongoDB (price history storage)
- Pokemon TCG SDK
- Recharts (price graphs)
- LocalStorage (collection/wishlist)

## Key Features

1. **Card Browsing**: Browse all Pokemon cards with filters
2. **Collection Tracking**: Add cards to collection with quantities
3. **Wishlist**: Save wanted cards with priority levels (low, medium, high)
4. **Price Tracking**: Real-time prices and historical graphs
5. **Currency Support**: Multi-currency with conversion
6. **Print Cards**: Generate printable card sheets

## Development Guidelines

- Use TypeScript strict mode
- Never use "any" type
- Prefer server components over client components
- Use Tailwind utility classes
- Keep components small and focused
- Follow Next.js 14 App Router patterns
