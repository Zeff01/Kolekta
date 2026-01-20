# Pokemon TCG Collector

A modern web application for browsing and exploring Pokemon Trading Card Game cards and sets. Built with Next.js, TypeScript, and the Pokemon TCG API.

## Features

- **Browse Sets**: View all Pokemon TCG sets with detailed information
- **Search Cards**: Search through thousands of Pokemon cards
- **Card Details**: View comprehensive information about each card including:
  - High-resolution card images
  - Stats (HP, types, attacks, abilities)
  - Pricing information (TCGPlayer)
  - Set information and rarity
- **Responsive Design**: Optimized for desktop and mobile devices
- **Dark Mode Support**: Automatic dark/light theme based on system preferences
- **Modern UI**: Clean, collector-focused interface with Tailwind CSS

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **API**: Pokemon TCG API (pokemontcg.io)
- **Image Optimization**: Next.js Image component

## Project Structure

```
pokemon-tcg/
├── app/                      # Next.js App Router pages
│   ├── cards/               # Cards browsing and detail pages
│   │   ├── [id]/           # Individual card detail page
│   │   └── page.tsx        # Cards listing with search
│   ├── sets/               # Sets browsing and detail pages
│   │   ├── [id]/           # Individual set detail page
│   │   └── page.tsx        # Sets listing
│   ├── layout.tsx          # Root layout with navigation
│   ├── page.tsx            # Home page
│   └── globals.css         # Global styles
├── components/             # React components
│   └── pokemon/           # Pokemon-specific components
│       ├── CardGrid.tsx   # Grid display for cards
│       ├── SetCard.tsx    # Set card component
│       ├── SearchBar.tsx  # Search functionality
│       └── LoadingSpinner.tsx
├── lib/                   # Utility functions
│   └── pokemon-api.ts    # Pokemon TCG API client
├── types/                # TypeScript type definitions
│   └── pokemon.ts        # Pokemon card/set types
└── public/               # Static assets
```

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd pokemon-tcg
```

2. Install dependencies:
```bash
npm install
```

3. (Optional) Get a Pokemon TCG API key:
   - Visit [https://dev.pokemontcg.io](https://dev.pokemontcg.io)
   - Register for a free API key
   - Add to `.env.local`:
```bash
NEXT_PUBLIC_POKEMON_TCG_API_KEY=your_key_here
```

**Note**: The API key is optional. Without it, you get 1,000 requests/day. With it, you get 20,000 requests/day.

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production (pre-generates all set pages)
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Performance & Static Generation

This app uses **Static Site Generation (SSG)** with **Incremental Static Regeneration (ISR)** for blazing-fast performance:

### How It Works

1. **Build Time**: All set pages are pre-generated during `npm run build`
   - Fetches all sets from Pokemon TCG API once
   - Generates static HTML for every set detail page
   - Takes 5-10 minutes but only happens at deploy

2. **Runtime**: Pages are served instantly from cache
   - **Home page**: Cached, rebuilds every 7 days
   - **Sets page**: Cached, rebuilds every 7 days
   - **Set detail pages**: Pre-built, rebuilds every 7 days
   - **Cards page**: Cached, rebuilds every 7 days
   - **Card detail pages**: Generated on-demand, cached for 30 days

3. **Zero API Calls**: Users get instant page loads with no API requests

### ISR Revalidation

Pages automatically rebuild in the background:
- **Sets/Home**: Every 7 days (new sets are rare)
- **Cards**: Every 7 days
- **Individual cards**: Every 30 days (data never changes)

### Benefits

- ⚡ **Instant page loads** - No waiting for API
- 💰 **Free hosting** - Works on Vercel free tier
- 🚀 **Scalable** - Handles unlimited traffic
- 📊 **SEO optimized** - All pages are pre-rendered

## API Information

This app uses the [Pokemon TCG API](https://pokemontcg.io) which provides:

- Comprehensive card data from all Pokemon TCG sets
- High-quality card images
- Pricing information from TCGPlayer and Cardmarket
- Set metadata and release information
- Advanced search and filtering capabilities

### Rate Limits

- **Without API Key**: 1,000 requests/day, 30 requests/minute
- **With Free API Key**: 20,000 requests/day, 30 requests/minute

### Testing Static Build Locally

To test the production build with static generation:

```bash
# Build the app (this will pre-generate all pages)
npm run build

# Start the production server
npm run start
```

The first build will take 5-10 minutes as it fetches and generates all set pages. Subsequent page visits will be instant!

### Deploying to Vercel

1. Push your code to GitHub
2. Import the project on [Vercel](https://vercel.com)
3. Vercel will automatically:
   - Run `npm run build` (generates all static pages)
   - Deploy to global CDN
   - Enable automatic ISR revalidation

**No environment variables needed** - the app works without an API key!

## Architecture Highlights

### Clean Architecture

- **Separation of Concerns**: API logic separated from UI components
- **Type Safety**: Full TypeScript coverage with no `any` types
- **Reusable Components**: Modular component structure
- **Server Components**: Leverages Next.js App Router for optimal performance

### API Client (`lib/pokemon-api.ts`)

Modern fetch-based API client with:
- Type-safe responses
- Built-in caching
- Error handling
- Query builders for filtering

### Component Structure

- **Server Components**: Pages and data-fetching components
- **Client Components**: Interactive elements (search, navigation)
- **Loading States**: Suspense boundaries and loading components
- **Error Boundaries**: Graceful error handling

## Features to Add (Future Enhancements)

- User authentication and collections
- Favorite cards and sets
- Advanced filtering (by type, rarity, etc.)
- Card comparison tool
- Price tracking over time
- Deck builder
- Collection statistics

## License

MIT

## Acknowledgments

- Pokemon TCG API by Andrew Backes
- Pokemon Company International for card data and images
