'use client';

import { PokemonCard, ApiResponse } from "@/types/pokemon";

interface FetchCardsOptions {
  page?: number;
  pageSize?: number;
  searchQuery?: string;
}

export async function fetchCardsClient(options: FetchCardsOptions = {}): Promise<ApiResponse<PokemonCard[]>> {
  const { page = 1, pageSize = 50, searchQuery = '' } = options;

  const params = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString(),
  });

  if (searchQuery) {
    params.append('q', searchQuery);
  }

  const response = await fetch(`/api/cards?${params.toString()}`);

  if (!response.ok) {
    throw new Error('Failed to fetch cards');
  }

  return response.json();
}
