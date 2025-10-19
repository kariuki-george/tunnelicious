import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ReactScan } from "@/components/reactscan";
import "./globals.css";
import TRPCProvider from "@/app/_trpc/Provider";
import { Toaster } from "@/components/ui/sonner";
import { env } from "@/env";
import { AuthProvider } from "./_auth/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "tunnelicious",
  description:
    "Tunnelicious — a lightweight HTTP traffic tunneling system that securely exposes your local or internal services to the internet over HTTPS.",
  keywords: ["tunnel", "ngrok", "cloudflare tunnels", "http/2"],
  openGraph: {
    title: "tunnelicious",
    description:
      "Tunnelicious — a lightweight HTTP traffic tunneling system that securely exposes your local or internal services to the internet over HTTPS.",
    url: "https://tunnelicious.kariukigeorge.me",
    siteName: "tunnelicious",
    images: [
      {
        url: "https://tunnelicious.kariukigeorge.me/og-image.jpg", // Replace with actual OG image
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "tunnelicious",
    description:
      "Tunnelicious — a lightweight HTTP traffic tunneling system that securely exposes your local or internal services to the internet over HTTPS.",
    images: ["https://tunnelicious.kariukigeorge.me/og-image.jpg"], // Replace with actual Twitter image
  },
  metadataBase: new URL("https://tunnelicious.kariukigeorge.me"), // Replace with your actual domain
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {env.NODE_ENV === "development" && <ReactScan />}
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <TRPCProvider>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </TRPCProvider>
      </body>
    </html>
  );
}
