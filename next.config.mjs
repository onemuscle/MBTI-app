/** @type {import('next').NextConfig} */
// basePath は public/manifest.webmanifest と src/app/layout.tsx の SITE_URL にも
// 直書きされている。デプロイ先を変える場合は3箇所まとめて更新すること。
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig = {
  // GitHub Pages等の静的ホスティングに配置できるよう全ページを静的出力する
  output: "export",
  trailingSlash: true,
  basePath,
  images: { unoptimized: true },
};

export default nextConfig;
