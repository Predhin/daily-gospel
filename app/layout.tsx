import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from '@vercel/analytics/react';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Daily Gospel - Daily Scripture Readings and Reflections",
  description:
    "Discover daily gospel readings, scripture reflections, and spiritual guidance. A new gospel reading every day to inspire and guide your spiritual journey.",
  keywords:
    "daily gospel, scripture readings, bible verses, spiritual reflection, daily devotional, christian readings",
  authors: [{ name: "Daily Gospel" }],
  openGraph: {
    title: "Daily Gospel - Daily Scripture Readings and Reflections",
    description:
      "Discover daily gospel readings, scripture reflections, and spiritual guidance.",
    type: "website",
    locale: "en_US",
    siteName: "Daily Gospel",
  },
  twitter: {
    card: "summary_large_image",
    title: "Daily Gospel - Daily Scripture Readings",
    description: "Discover daily gospel readings and spiritual reflections.",
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Analytics />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
