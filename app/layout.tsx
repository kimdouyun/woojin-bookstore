import type { Metadata } from "next";
import "../styles/variables.css";
import "./globals.css";
import "../styles/components.css";
import "../styles/utilities.css";
import Navigation from "./components/Navigation";
import ThemeCustomizer from "./components/ThemeCustomizer";

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
      <body className="min-h-screen">
        <div className="relative min-h-screen library-gradient">
          <div className="library-paper-overlay pointer-events-none" />
          <div className="library-shelf-overlay pointer-events-none" />

          <Navigation />
          <main className="relative z-10">{children}</main>

          <ThemeCustomizer />
        </div>
      </body>
    </html>
  );
}

