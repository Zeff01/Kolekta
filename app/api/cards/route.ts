import { pokemonAPI } from "@/lib/pokemon-api";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '50');
    const searchQuery = searchParams.get('q') || '';
    const type = searchParams.get('type') || '';
    const rarity = searchParams.get('rarity') || '';

    let response;

    // If there are filters, use filtered API methods
    if (type && rarity) {
      // Both type and rarity filters - use combined query
      response = await pokemonAPI.getCardsByTypeAndRarity(type, rarity, { page, pageSize });
    } else if (type) {
      // Only type filter
      response = await pokemonAPI.getCardsByType(type, { page, pageSize });
    } else if (rarity) {
      // Only rarity filter
      response = await pokemonAPI.getCardsByRarity(rarity, { page, pageSize });
    } else if (searchQuery) {
      // Search query
      response = await pokemonAPI.searchCards(searchQuery, { page, pageSize });
    } else {
      // No filters - get all cards
      response = await pokemonAPI.getCards({ page, pageSize });
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching cards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cards' },
      { status: 500 }
    );
  }
}
