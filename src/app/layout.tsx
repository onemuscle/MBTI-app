import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "Type Atlas | 16タイプ性格図鑑 × 関係性ナビ",
  description:
    "16タイプの性格図鑑と、仕事・友達・恋愛の3つの関係別相性ガイド。相手を理解し、伝え方を変え、関係を良くするためのWebアプリ。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased min-h-screen pb-20 md:pb-0 md:pt-16">
        <Nav />
        <main className="mx-auto max-w-3xl px-4 py-6">{children}</main>
        <footer className="mx-auto max-w-3xl px-4 pb-8 pt-4 text-center text-xs text-ink/50">
          Type Atlas は自己理解と対話の補助ツールです。タイプは傾向の一つであり、
          科学的診断・能力評価ではありません。
        </footer>
      </body>
    </html>
  );
}
