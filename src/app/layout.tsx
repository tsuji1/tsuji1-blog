import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "tsuji1 website",
  description: "Welcome to my page!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <nav className="bg-gray-800 py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <div>
              <a href="/" className="text-white font-bold text-xl">tsuji1's Webpage</a>
            </div>
            <div className="flex space-x-4">
              <a
                href="/profile"
                className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md"
              >
                Profile
              </a>
              <a
                href="/blog"
                className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md"
              >
                Blog
              </a>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
