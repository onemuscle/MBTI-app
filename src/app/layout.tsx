import type { Metadata, Viewport } from "next";
import { Oswald, Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";

const display = Oswald({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});

const body = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-body",
});

const SITE_URL = "https://onemuscle.github.io/MBTI-app/";
const DESCRIPTION =
  "16タイプの性格図鑑と、仕事・友達・恋愛の3つの関係別相性ガイド。相手を理解し、伝え方を変え、関係を良くするためのWebアプリ。登録不要・無料。";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Type Atlas | 16タイプ性格図鑑 × 関係性ナビ",
  description: DESCRIPTION,
  // public/manifest.webmanifest に basePath を直書きしているため、
  // SITE_URL（basePathを含む）を変える場合はそちらも合わせて更新すること
  manifest: `${SITE_URL}manifest.webmanifest`,
  openGraph: {
    title: "Type Atlas | 16タイプ性格図鑑 × 関係性ナビ",
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: "Type Atlas",
    locale: "ja_JP",
    type: "website",
    images: [
      {
        url: `${SITE_URL}og.png`,
        width: 1200,
        height: 630,
        alt: "Type Atlas - 16タイプ性格図鑑 × 相性ナビ",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Type Atlas | 16タイプ性格図鑑 × 関係性ナビ",
    description: DESCRIPTION,
    images: [`${SITE_URL}og.png`],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Type Atlas",
  },
};

export const viewport: Viewport = {
  themeColor: "#2E6F6A",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${display.variable} ${body.variable}`}>
      <body className="font-sans antialiased min-h-screen pb-20 md:pb-0 md:pt-16">
        <ServiceWorkerRegister />
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
