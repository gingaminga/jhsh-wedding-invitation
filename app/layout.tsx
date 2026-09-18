import type { Metadata } from "next";
import "./globals.css";

const siteUrl = new URL("https://jhsh-wedding-invitation.vercel.app");

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: "지환 & 서희, 결혼합니다",
  description: "2026년 10월 25일, 수원 마이어스에서 저희 두 사람의 시작을 함께해 주세요.",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.png", type: "image/png", sizes: "64x64" },
    ],
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "지환 & 서희의 모바일 청첩장",
    title: "지환 & 서희, 결혼합니다",
    description: "2026년 10월 25일 일요일 오후 12시 10분 · 수원 마이어스",
    images: [{ url: "/og.png", width: 1731, height: 909, alt: "지환과 서희의 결혼식 초대" }],
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
