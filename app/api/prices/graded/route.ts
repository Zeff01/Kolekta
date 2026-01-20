import { NextRequest, NextResponse } from 'next/server';
import { ebayAPI } from '@/lib/ebay-api';
import { pokemonAPI } from '@/lib/pokemon-api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cardId = searchParams.get('cardId');
    const basePrice = parseFloat(searchParams.get('basePrice') || '0');
    const cardName = searchParams.get('cardName');
    const setName = searchParams.get('setName');
    const cardNumber = searchParams.get('cardNumber');

    if (!cardId) {
      return NextResponse.json({ error: 'cardId is required' }, { status: 400 });
    }

    // Try to use eBay API if credentials are configured and card details provided
    const useEbayAPI = process.env.EBAY_CLIENT_ID &&
                      process.env.EBAY_CLIENT_SECRET &&
                      cardName &&
                      setName &&
                      cardNumber;

    if (useEbayAPI) {
      console.log('[Graded Prices API] Using eBay API for real data');
      try {
        const ebayResults = await ebayAPI.getGradedCardPrices(
          cardName as string,
          setName as string,
          cardNumber as string
        );

        // Transform eBay results to our format
        const psaGrades = ebayResults
          .filter(r => r.company === 'PSA')
          .map(r => ({
            grade: r.grade,
            price: r.averagePrice,
            population: r.soldCount,
            lowPrice: r.lowPrice,
            highPrice: r.highPrice,
          }));

        const bgsGrades = ebayResults
          .filter(r => r.company === 'BGS')
          .map(r => ({
            grade: r.grade,
            price: r.averagePrice,
            population: r.soldCount,
            lowPrice: r.lowPrice,
            highPrice: r.highPrice,
          }));

        const cgcGrades = ebayResults
          .filter(r => r.company === 'CGC')
          .map(r => ({
            grade: r.grade,
            price: r.averagePrice,
            population: r.soldCount,
            lowPrice: r.lowPrice,
            highPrice: r.highPrice,
          }));

        return NextResponse.json({
          cardId,
          basePrice,
          source: 'ebay',
          psa: psaGrades,
          bgs: bgsGrades,
          cgc: cgcGrades,
        });
      } catch (error) {
        console.error('[Graded Prices API] eBay API error, falling back to estimates:', error);
        // Fall through to mock data below
      }
    }

    console.log('[Graded Prices API] Using estimated prices based on multipliers');

    // Price multipliers for different grades (relative to base holofoil price)
    // These are approximate market multipliers based on typical grading premiums
    const psaMultipliers: Record<number, number> = {
      10: 8.0,  // PSA 10 typically 8x base price
      9: 3.5,   // PSA 9 typically 3.5x base price
      8: 1.8,   // PSA 8 typically 1.8x base price
      7: 1.2,   // PSA 7 typically 1.2x base price
      6: 0.9,   // PSA 6 typically 0.9x base price
      5: 0.7,   // PSA 5 typically 0.7x base price
      4: 0.6,   // PSA 4 typically 0.6x base price
      3: 0.5,   // PSA 3 typically 0.5x base price
      2: 0.4,   // PSA 2 typically 0.4x base price
      1: 0.3,   // PSA 1 typically 0.3x base price
    };

    const bgsMultipliers: Record<number, number> = {
      10: 12.0,  // BGS 10 (Pristine) typically 12x base price
      9.5: 6.0,  // BGS 9.5 typically 6x base price
      9: 3.0,    // BGS 9 typically 3x base price
      8.5: 1.6,  // BGS 8.5 typically 1.6x base price
      8: 1.3,    // BGS 8 typically 1.3x base price
      7.5: 1.0,  // BGS 7.5 typically 1x base price
      7: 0.8,    // BGS 7 typically 0.8x base price
    };

    const cgcMultipliers: Record<number, number> = {
      10: 10.0,  // CGC Pristine 10 typically 10x base price
      9.5: 5.0,  // CGC 9.5 typically 5x base price
      9: 2.8,    // CGC 9 typically 2.8x base price
      8.5: 1.5,  // CGC 8.5 typically 1.5x base price
      8: 1.2,    // CGC 8 typically 1.2x base price
      7.5: 0.9,  // CGC 7.5 typically 0.9x base price
      7: 0.7,    // CGC 7 typically 0.7x base price
    };

    // Mock population data (in a real app, this would come from PSA/BGS/CGC APIs)
    const mockPopulation: Record<string, number> = {
      'psa-10': Math.floor(Math.random() * 5000) + 500,
      'psa-9': Math.floor(Math.random() * 3000) + 300,
      'psa-8': Math.floor(Math.random() * 1500) + 150,
      'psa-7': Math.floor(Math.random() * 800) + 80,
      'psa-6': Math.floor(Math.random() * 400) + 40,
      'psa-5': Math.floor(Math.random() * 200) + 20,
      'psa-4': Math.floor(Math.random() * 100) + 10,
      'psa-3': Math.floor(Math.random() * 50) + 5,
      'psa-2': Math.floor(Math.random() * 25) + 2,
      'psa-1': Math.floor(Math.random() * 10) + 1,
      'bgs-10': Math.floor(Math.random() * 200) + 20,
      'bgs-9.5': Math.floor(Math.random() * 800) + 80,
      'bgs-9': Math.floor(Math.random() * 1500) + 150,
      'bgs-8.5': Math.floor(Math.random() * 600) + 60,
      'bgs-8': Math.floor(Math.random() * 400) + 40,
      'bgs-7.5': Math.floor(Math.random() * 200) + 20,
      'bgs-7': Math.floor(Math.random() * 100) + 10,
      'cgc-10': Math.floor(Math.random() * 300) + 30,
      'cgc-9.5': Math.floor(Math.random() * 1000) + 100,
      'cgc-9': Math.floor(Math.random() * 2000) + 200,
      'cgc-8.5': Math.floor(Math.random() * 800) + 80,
      'cgc-8': Math.floor(Math.random() * 500) + 50,
      'cgc-7.5': Math.floor(Math.random() * 250) + 25,
      'cgc-7': Math.floor(Math.random() * 125) + 12,
    };

    // Calculate prices for each grade
    const psaGrades = Object.entries(psaMultipliers).map(([grade, multiplier]) => ({
      grade: parseInt(grade),
      price: basePrice * multiplier,
      population: mockPopulation[`psa-${grade}`] || 0,
    }));

    const bgsGrades = Object.entries(bgsMultipliers).map(([grade, multiplier]) => ({
      grade: parseFloat(grade),
      price: basePrice * multiplier,
      population: mockPopulation[`bgs-${grade}`] || 0,
    }));

    const cgcGrades = Object.entries(cgcMultipliers).map(([grade, multiplier]) => ({
      grade: parseFloat(grade),
      price: basePrice * multiplier,
      population: mockPopulation[`cgc-${grade}`] || 0,
    }));

    return NextResponse.json({
      cardId,
      basePrice,
      source: 'estimated',
      psa: psaGrades,
      bgs: bgsGrades,
      cgc: cgcGrades,
    });
  } catch (error) {
    console.error('Error fetching graded prices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch graded prices', details: String(error) },
      { status: 500 }
    );
  }
}
