import { pokemonAPI } from "@/lib/pokemon-api";
import CardsPageClient from "@/components/pokemon/CardsPageClient";

export const metadata = {
  title: "Pokemon Cards | Kolekta Korner",
  description: "Browse and search Pokemon Trading Card Game cards",
};

// Enable ISR - revalidate every 7 days
export const revalidate = 604800;

export default async function CardsPage() {
  // Fetch initial batch of cards (first page)
  const { data: cards } = await pokemonAPI.getCards({ page: 1, pageSize: 50 });

  return <CardsPageClient cards={cards} />;
}
