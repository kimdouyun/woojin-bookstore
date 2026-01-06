import type { Metadata } from "next";
import "./globals.css";
import Navigation from "./components/Navigation";

export const metadata: Metadata = {
  title: "책 리뷰 사이트",
  description: "나만의 온라인 책 리뷰 사이트",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
        <Navigation />
        <main>{children}</main>
      </body>
    </html>
  );
}

