import CardsPageClient from "@/components/pokemon/CardsPageClient";

export const metadata = {
  title: "Pokemon Cards | Kolekta Korner",
  description: "Browse and search Pokemon Trading Card Game cards",
};

// Force dynamic rendering to avoid build-time API calls
export const dynamic = 'force-dynamic';

export default async function CardsPage() {
  // Start with empty cards - client will fetch on mount
  return <CardsPageClient cards={[]} />;
}
