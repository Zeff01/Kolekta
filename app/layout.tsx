import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import CacheStatus from "@/components/dev/CacheStatus";
import { CollectionProvider } from "@/contexts/CollectionContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { ToastProvider } from "@/contexts/ToastContext";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Kolekta Korner - Pokemon TCG Collector",
  description: "Browse, collect, and track your Pokemon TCG cards with Kolekta Korner",
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
                <ToastProvider>
                  <Navbar />
                  <main className="min-h-screen">{children}</main>
                  <CacheStatus />
                </ToastProvider>
              </CollectionProvider>
            </CurrencyProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
