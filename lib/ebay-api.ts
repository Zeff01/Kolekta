// eBay API integration for graded Pokemon card pricing
// Uses eBay Browse API (free tier)

const EBAY_API_BASE = 'https://api.ebay.com';
const CLIENT_ID = process.env.EBAY_CLIENT_ID;
const CLIENT_SECRET = process.env.EBAY_CLIENT_SECRET;

interface EbayAuthToken {
  access_token: string;
  expires_in: number;
  token_type: string;
}

interface EbayItem {
  itemId: string;
  title: string;
  price: {
    value: string;
    currency: string;
  };
  condition?: string;
  itemEndDate?: string;
  image?: {
    imageUrl: string;
  };
  seller?: {
    username: string;
    feedbackPercentage: string;
  };
}

interface EbaySearchResponse {
  total: number;
  itemSummaries?: EbayItem[];
}

interface GradedCardPrice {
  grade: number;
  company: 'PSA' | 'BGS' | 'CGC';
  averagePrice: number;
  lowPrice: number;
  highPrice: number;
  soldCount: number;
  recentSales: Array<{
    price: number;
    date: string;
    title: string;
  }>;
}

class EbayAPI {
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  /**
   * Get OAuth access token for eBay API
   */
  private async getAccessToken(): Promise<string> {
    // Return cached token if still valid
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    if (!CLIENT_ID || !CLIENT_SECRET) {
      throw new Error('eBay API credentials not configured. Please set EBAY_CLIENT_ID and EBAY_CLIENT_SECRET in .env');
    }

    try {
      console.log('[eBay API] Fetching new access token...');

      const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');

      const response = await fetch(`${EBAY_API_BASE}/identity/v1/oauth2/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${credentials}`,
        },
        body: 'grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope',
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`eBay OAuth failed: ${response.status} - ${error}`);
      }

      const data: EbayAuthToken = await response.json();
      this.accessToken = data.access_token;
      // Set expiry 5 minutes before actual expiry for safety
      this.tokenExpiry = Date.now() + (data.expires_in - 300) * 1000;

      console.log('[eBay API] Access token obtained successfully');
      return this.accessToken;
    } catch (error) {
      console.error('[eBay API] Error getting access token:', error);
      throw error;
    }
  }

  /**
   * Search eBay for sold graded cards
   */
  private async searchSoldListings(
    cardName: string,
    setName: string,
    cardNumber: string,
    grade: number,
    company: 'PSA' | 'BGS' | 'CGC'
  ): Promise<EbaySearchResponse> {
    const token = await this.getAccessToken();

    // Build search query
    // Example: "Charizard Base Set 4/102 PSA 10"
    const query = `${cardName} ${setName} ${cardNumber} ${company} ${grade}`;

    console.log(`[eBay API] Searching for: "${query}"`);

    try {
      const params = new URLSearchParams({
        q: query,
        filter: 'conditionIds:{3000}|itemLocationCountry:US|deliveryCountry:US', // Graded cards
        category_ids: '183454', // Trading Card Singles category
        limit: '50', // Get up to 50 recent sales
        sort: 'endTimeSoonest', // Most recent sales first
      });

      const response = await fetch(
        `${EBAY_API_BASE}/buy/browse/v1/item_summary/search?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
            'X-EBAY-C-ENDUSERCTX': 'contextualLocation=country=US',
          },
        }
      );

      if (!response.ok) {
        const error = await response.text();
        console.error(`[eBay API] Search failed: ${response.status} - ${error}`);
        return { total: 0, itemSummaries: [] };
      }

      const data: EbaySearchResponse = await response.json();
      console.log(`[eBay API] Found ${data.total} results for ${company} ${grade}`);

      return data;
    } catch (error) {
      console.error('[eBay API] Search error:', error);
      return { total: 0, itemSummaries: [] };
    }
  }

  /**
   * Get graded card prices for a specific card
   */
  async getGradedCardPrices(
    cardName: string,
    setName: string,
    cardNumber: string
  ): Promise<GradedCardPrice[]> {
    console.log(`[eBay API] Fetching graded prices for: ${cardName} ${setName} ${cardNumber}`);

    const results: GradedCardPrice[] = [];

    // Grades and companies to search for
    const companies: Array<'PSA' | 'BGS' | 'CGC'> = ['PSA', 'BGS', 'CGC'];
    const grades = {
      PSA: [10, 9, 8, 7],
      BGS: [10, 9.5, 9, 8.5],
      CGC: [10, 9.5, 9, 8.5],
    };

    // Search for each company and grade combination
    for (const company of companies) {
      for (const grade of grades[company]) {
        try {
          const searchResults = await this.searchSoldListings(
            cardName,
            setName,
            cardNumber,
            grade,
            company
          );

          if (!searchResults.itemSummaries || searchResults.itemSummaries.length === 0) {
            console.log(`[eBay API] No results for ${company} ${grade}`);
            continue;
          }

          // Extract prices from sold listings
          const prices = searchResults.itemSummaries
            .filter(item => item.price && item.price.value)
            .map(item => parseFloat(item.price.value));

          if (prices.length === 0) {
            continue;
          }

          // Calculate statistics
          const averagePrice = prices.reduce((a, b) => a + b, 0) / prices.length;
          const lowPrice = Math.min(...prices);
          const highPrice = Math.max(...prices);

          // Get recent sales details
          const recentSales = searchResults.itemSummaries.slice(0, 10).map(item => ({
            price: parseFloat(item.price.value),
            date: item.itemEndDate || new Date().toISOString(),
            title: item.title,
          }));

          results.push({
            grade,
            company,
            averagePrice,
            lowPrice,
            highPrice,
            soldCount: prices.length,
            recentSales,
          });

          console.log(`[eBay API] ${company} ${grade}: $${averagePrice.toFixed(2)} (${prices.length} sales)`);

          // Add small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.error(`[eBay API] Error fetching ${company} ${grade}:`, error);
          continue;
        }
      }
    }

    console.log(`[eBay API] Completed - Found prices for ${results.length} grade/company combinations`);
    return results;
  }

  /**
   * Get population data from eBay (how many cards exist at each grade)
   * Note: This is an estimate based on active + sold listings
   */
  async getGradedPopulation(
    cardName: string,
    setName: string,
    cardNumber: string,
    grade: number,
    company: 'PSA' | 'BGS' | 'CGC'
  ): Promise<number> {
    try {
      const searchResults = await this.searchSoldListings(
        cardName,
        setName,
        cardNumber,
        grade,
        company
      );

      // eBay's total represents the number of listings (not perfect but gives us an estimate)
      return searchResults.total || 0;
    } catch (error) {
      console.error(`[eBay API] Error fetching population for ${company} ${grade}:`, error);
      return 0;
    }
  }
}

export const ebayAPI = new EbayAPI();
