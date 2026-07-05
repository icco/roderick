import type { Metadata, Viewport } from "next";
import "./globals.css";

import { ThemeProvider } from "@icco/react-common/ThemeProvider";
import { SiteHeader } from "@icco/react-common/SiteHeader";
import Link from "next/link";
import { Roboto, Roboto_Mono } from "next/font/google";

import SearchBar from "@/components/SearchBar";
import Footer from "@/components/Footer";

const roboto = Roboto({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-roboto",
  display: "swap",
});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-roboto-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://roderick.natwelch.com"),
  title: {
    default: "Roderick — a dictionary for exploring words",
    template: "%s · Roderick",
  },
  description:
    "A dictionary that promotes exploring of words. Wander from word to word, discover the word of the day, or take a random leap.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${roboto.variable} ${robotoMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-base-100 text-base-content antialiased">
        <ThemeProvider>
          {/* Sticky so the auto-centering scroll on word pages can't hide the header. */}
          <div className="sticky top-0 z-30 border-b border-base-300 bg-base-100/90 backdrop-blur">
            <SiteHeader
              brand={
                <Link href="/" className="text-xl font-medium tracking-tight">
                  Roderick
                </Link>
              }
              links={[
                {
                  name: "Random",
                  href: "/random",
                  icon: <span aria-hidden>🎲</span>,
                },
              ]}
            />
            <SearchBar />
          </div>
          <main>{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
