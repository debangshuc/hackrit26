import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "RedFlag — Emergency Cyber Defense & Scam Scanner",
  description:
    "Instant AI-powered scam detection, Golden Hour emergency response, and family guardian protection for Indian citizens.",
  keywords: "scam, fraud, emergency, response, India, cybercrime, 1930, RedFlag",
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
