import { pokemonAPI } from "@/lib/pokemon-api";
import SetsPageClient from "@/components/pokemon/SetsPageClient";

export const metadata = {
  title: "Pokemon TCG Sets | Kolekta Korner",
  description: "Browse all Pokemon Trading Card Game sets",
};

// Enable ISR - revalidate every 7 days (new sets are rare)
export const revalidate = 604800;

export default async function SetsPage() {
  const { data: sets } = await pokemonAPI.getSets({ pageSize: 500 });

  return <SetsPageClient sets={sets} />;
}
