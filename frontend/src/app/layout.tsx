import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "AI Scam Shield — Emergency Scam Response",
  description:
    "Not 'is this a scam?' — 'you may already be a victim. Here's exactly what to do in the next 5 minutes,' in your language, with your family looped in.",
  keywords: "scam, fraud, emergency, response, India, cybercrime, 1930",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
