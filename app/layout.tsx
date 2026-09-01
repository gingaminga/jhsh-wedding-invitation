import type { Metadata } from "next";
import "./globals.css";

function getSiteUrl() {
  const configuredUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.VERCEL_PROJECT_PRODUCTION_URL ??
    process.env.VERCEL_URL;

  if (!configuredUrl) return new URL("http://localhost:3000");
  return new URL(configuredUrl.startsWith("http") ? configuredUrl : `https://${configuredUrl}`);
}

export const metadata: Metadata = {
  metadataBase: getSiteUrl(),
  title: "지환 & 서희, 결혼합니다",
  description: "2026년 10월 25일, 수원 마이어스에서 저희 두 사람의 시작을 함께해 주세요.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.png", type: "image/png", sizes: "64x64" },
    ],
  },
  openGraph: {
    title: "지환 & 서희, 결혼합니다",
    description: "2026년 10월 25일 일요일 오후 12시 10분 · 수원 마이어스",
    images: [{ url: "/og.png", width: 1733, height: 909, alt: "지환과 서희의 결혼식 초대" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "지환 & 서희, 결혼합니다",
    description: "2026년 10월 25일 일요일 오후 12시 10분 · 수원 마이어스",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
