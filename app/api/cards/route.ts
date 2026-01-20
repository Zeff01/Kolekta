import { pokemonAPI } from "@/lib/pokemon-api";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '50');
    const searchQuery = searchParams.get('q') || '';

    let response;

    // If there's a search query, use searchCards, otherwise use getCards
    if (searchQuery) {
      response = await pokemonAPI.searchCards(searchQuery, { page, pageSize });
    } else {
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
