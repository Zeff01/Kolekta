# Pokemon TCG Price Tracking System

This document explains how the price tracking system works and how to use it.

## Overview

The price tracking system automatically fetches and stores daily price snapshots for Pokemon cards, allowing you to view historical price trends and graphs.

## Architecture

### Components

1. **MongoDB Database** - Stores historical price data
2. **Mongoose Models** - Schema definition for price snapshots
3. **API Endpoints** - REST APIs for saving and fetching price data
4. **Cron Job** - Automated daily price fetching
5. **PriceGraph Component** - React component that displays price history

### Database Schema

```typescript
{
  cardId: string;           // Pokemon card ID
  cardName: string;         // Card name
  setId: string;            // Set ID
  setName: string;          // Set name
  variant: string;          // normal | holofoil | reverseHolofoil | firstEdition
  marketPrice: number;      // Current market price
  lowPrice: number;         // Lowest listing
  midPrice: number;         // Mid-range price
  highPrice: number;        // Highest listing
  directLowPrice?: number;  // Direct low price (optional)
  date: Date;               // Snapshot date
  createdAt: Date;          // Record creation timestamp
}
```

## Setup Instructions

### 1. Install MongoDB

**Option A: Local MongoDB**
```bash
# macOS
brew install mongodb-community
brew services start mongodb-community

# Linux
sudo apt-get install mongodb
sudo systemctl start mongodb

# Windows
# Download from https://www.mongodb.com/try/download/community
```

**Option B: MongoDB Atlas (Cloud)**
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get your connection string

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your values:

```env
MONGODB_URI=mongodb://localhost:27017/pokemon-tcg
CRON_SECRET=your-super-secret-key-here
NEXT_PUBLIC_POKEMON_TCG_API_KEY=your_pokemon_tcg_api_key
```

### 3. Start the Application

```bash
# Install dependencies
npm install

# Start the Next.js dev server
npm run dev
```

### 4. Start the Price Tracking Cron Job

In a separate terminal:

```bash
# Run continuously (checks daily at 2 AM)
npm run price-cron

# Run once immediately (for testing)
npm run price-cron:once
```

## Usage

### View Price History

Price graphs automatically appear on card detail pages (`/cards/[id]`) for cards that have pricing data.

### Manual Price Fetch

You can manually trigger a price fetch using the API:

```bash
curl -X POST http://localhost:3000/api/prices/save \
  -H "Authorization: Bearer your-secret-key" \
  -H "Content-Type: application/json" \
  -d '{"limit": 50}'
```

### Query Price History

Fetch price history for a specific card:

```bash
curl "http://localhost:3000/api/prices/history?cardId=base1-4&variant=holofoil&days=90"
```

Response:

```json
{
  "cardId": "base1-4",
  "variant": "holofoil",
  "history": [
    {
      "date": "2024-01-01T00:00:00.000Z",
      "marketPrice": 150.25,
      "lowPrice": 145.00,
      "highPrice": 160.00
    },
    ...
  ],
  "stats": {
    "currentPrice": 152.50,
    "priceChange": 2.25,
    "priceChangePercent": 1.5,
    "maxPrice": 165.00,
    "minPrice": 145.00,
    "avgPrice": 151.75,
    "dataPoints": 90
  }
}
```

## API Endpoints

### POST /api/prices/save

Fetches current prices from Pokemon TCG API and saves to database.

**Authentication:** Bearer token (CRON_SECRET)

**Request Body:**
```json
{
  "cardId": "base1-4",  // Optional: specific card
  "limit": 50           // Optional: number of cards to fetch (default: 50)
}
```

### GET /api/prices/history

Retrieves historical price data for a card.

**Query Parameters:**
- `cardId` (required): Pokemon card ID
- `variant` (optional): Card variant (default: 'normal')
- `days` (optional): Number of days to fetch (default: 365)

## Cron Job Configuration

The cron job runs daily at 2:00 AM to fetch prices.

### Schedule Customization

Edit `scripts/fetch-prices-cron.ts`:

```typescript
// Current: Daily at 2 AM
cron.schedule('0 2 * * *', async () => {
  await fetchAndSavePrices();
});

// Examples:
// Every 12 hours: '0 */12 * * *'
// Weekly (Sunday 2 AM): '0 2 * * 0'
// Hourly: '0 * * * *'
```

### Cards to Track

By default, the cron job fetches the first 250 cards (5 pages of 50).

To customize, edit `scripts/fetch-prices-cron.ts`:

```typescript
// Fetch more pages
for (let page = 1; page <= 10; page++) { // Increased from 5 to 10
  const response = await pokemonAPI.getCards({ pageSize: 50, page });
  cardsToProcess.push(...response.data);
}
```

## Production Deployment

### Using PM2 (Recommended)

```bash
# Install PM2
npm install -g pm2

# Start Next.js app
pm2 start npm --name "pokemon-tcg-app" -- start

# Start cron job
pm2 start npm --name "pokemon-tcg-cron" -- run price-cron

# Save PM2 config
pm2 save

# Auto-start on reboot
pm2 startup
```

### Using Docker

Create `docker-compose.yml`:

```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - MONGODB_URI=mongodb://mongodb:27017/pokemon-tcg
      - CRON_SECRET=${CRON_SECRET}
    depends_on:
      - mongodb

  cron:
    build: .
    command: npm run price-cron
    environment:
      - MONGODB_URI=mongodb://mongodb:27017/pokemon-tcg
    depends_on:
      - mongodb

volumes:
  mongodb_data:
```

## Monitoring

### Check Database Stats

```bash
# Connect to MongoDB
mongosh pokemon-tcg

# Count total price records
db.cardprices.countDocuments()

# Recent prices
db.cardprices.find().sort({createdAt: -1}).limit(10)

# Price history for specific card
db.cardprices.find({cardId: "base1-4"}).sort({date: -1})
```

### Logs

The cron job outputs detailed logs:

```
[Price Cron] Starting price fetch at 2024-01-20T02:00:00.000Z
[Price Cron] Connected to database
[Price Cron] Fetched page 1 - 50 cards
[Price Cron] Processing 250 cards
[Price Cron] Completed:
  - Saved: 1000 new price snapshots
  - Skipped: 0 (already exists)
  - Errors: 0
```

## Troubleshooting

### "Unable to load price history" error

1. Check MongoDB connection:
   ```bash
   mongosh $MONGODB_URI
   ```

2. Verify environment variables in `.env.local`

3. Check if cron job is running and has saved data

4. Look at browser console for detailed errors

### No price graphs appearing

1. Ensure you have price data:
   ```bash
   npm run price-cron:once
   ```

2. Wait for the job to complete (can take 5-10 minutes for 250 cards)

3. Refresh the card detail page

4. Check browser network tab for API errors

### Cron job not running

1. Check if process is running:
   ```bash
   pm2 list  # if using PM2
   ps aux | grep price-cron  # otherwise
   ```

2. Check logs for errors:
   ```bash
   pm2 logs pokemon-tcg-cron  # if using PM2
   ```

3. Verify MongoDB connection string in .env

## Performance Considerations

### Database Indexing

The schema includes compound indexes for efficient queries:

```typescript
CardPriceSchema.index({ cardId: 1, variant: 1, date: -1 });
```

### Caching

- API responses are cached in Next.js
- Consider adding Redis for additional caching in production

### Rate Limiting

- Pokemon TCG API has rate limits (check their docs)
- The cron job includes delays between requests
- Use an API key to increase limits

## Future Enhancements

- [ ] Add price alerts (notify when price crosses threshold)
- [ ] Email notifications for wishlist price drops
- [ ] Support for graded card prices (PSA, BGS, etc.)
- [ ] Price prediction using machine learning
- [ ] Export price history to CSV
- [ ] Compare prices across different marketplaces

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the logs for error messages
3. Verify your environment configuration
4. Check MongoDB connection and data

## License

MIT
