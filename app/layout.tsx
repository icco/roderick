import type { Metadata, Viewport } from "next";
import "./globals.css";

import { ThemeProvider } from "@icco/react-common/ThemeProvider";
import ThemeToggle from "@icco/react-common/ThemeToggle";
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
          <nav className="sticky top-0 z-30 flex items-center gap-4 border-b border-base-300 bg-base-100/90 px-6 py-3 backdrop-blur">
            <Link
              href="/"
              className="flex-none text-xl font-medium tracking-tight"
            >
              Roderick
            </Link>
            <div className="grow">
              <SearchBar />
            </div>
            <ThemeToggle />
            <a
              href="/random"
              aria-label="Random"
              className="flex flex-none items-center gap-2"
            >
              <span aria-hidden>🎲</span>
              <span className="hidden md:inline">Random</span>
            </a>
          </nav>
          <main>{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
