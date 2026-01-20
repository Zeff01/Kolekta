import { pokemonAPI } from "@/lib/pokemon-api";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    pokemonAPI.clearCache();
    return NextResponse.json({ success: true, message: 'Cache cleared' });
  } catch (error) {
    console.error('Error clearing cache:', error);
    return NextResponse.json(
      { error: 'Failed to clear cache' },
      { status: 500 }
    );
  }
}
