import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import CacheStatus from "@/components/dev/CacheStatus";
import { CollectionProvider } from "@/contexts/CollectionContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Kolekta - Pokemon TCG Collector",
  description: "Browse, collect, and track your Pokemon TCG cards with Kolekta",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <CurrencyProvider>
              <CollectionProvider>
                <Navbar />
                <main className="min-h-screen">{children}</main>
                <CacheStatus />
              </CollectionProvider>
            </CurrencyProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
