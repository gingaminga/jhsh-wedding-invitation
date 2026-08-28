import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const imageUrl = new URL("/og.png", `${protocol}://${host}`);
  return {
    title: "지환 & 서희, 결혼합니다",
    description: "2026년 10월 25일, 수원 마이어스에서 저희 두 사람의 시작을 함께해 주세요.",
    openGraph: {
      title: "지환 & 서희, 결혼합니다",
      description: "2026년 10월 25일 일요일 오후 12시 10분 · 수원 마이어스",
      images: [{ url: imageUrl, width: 1733, height: 909, alt: "지환과 서희의 결혼식 초대" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "지환 & 서희, 결혼합니다",
      description: "2026년 10월 25일 일요일 오후 12시 10분 · 수원 마이어스",
      images: [imageUrl],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
