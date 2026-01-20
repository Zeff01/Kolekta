import { pokemonAPI } from "@/lib/pokemon-api";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const stats = pokemonAPI.getCacheStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching cache stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cache stats' },
      { status: 500 }
    );
  }
}
