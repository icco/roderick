import type { Metadata, Viewport } from "next";
import "./globals.css";

import { ThemeProvider } from "@icco/react-common/ThemeProvider";
import { Roboto, Roboto_Mono } from "next/font/google";

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
          <main>{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
