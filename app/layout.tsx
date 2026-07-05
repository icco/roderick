import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://roderick.natwelch.com"),
  title: {
    default: "Roderick — a dictionary for exploring words",
    template: "%s · Roderick",
  },
  description:
    "A dictionary that promotes exploring of words. Wander from word to word, discover the word of the day, or take a random leap.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
