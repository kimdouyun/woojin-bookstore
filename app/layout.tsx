import type { Metadata } from "next";
import "./globals.css";

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
      <body>{children}</body>
    </html>
  );
}

