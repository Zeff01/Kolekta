import SetsPageClient from "@/components/pokemon/SetsPageClient";

export const metadata = {
  title: "Pokemon TCG Sets | Kolekta Korner",
  description: "Browse all Pokemon Trading Card Game sets",
};

// Force dynamic rendering to avoid build-time API calls
export const dynamic = 'force-dynamic';

export default async function SetsPage() {
  // Start with empty sets - client will fetch on mount
  return <SetsPageClient sets={[]} />;
}
