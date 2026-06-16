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
  metadataBase: new URL("https://git-hub-j-jerry1031-vs-arena.vercel.app"),
  title: "VS Arena - 남들 싸우는 거 구경하다 못 참으면 참전",
  description: "편 갈리는 주제에 투표하고, 댓글로 참전하는 VS 토론 커뮤니티",
  openGraph: {
    type: "website",
    title: "VS Arena",
    description: "남들 싸우는 거 구경하다 못 참겠으면 바로 참전.",
    url: "https://git-hub-j-jerry1031-vs-arena.vercel.app/",
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: "VS Arena",
    description: "남들 싸우는 거 구경하다 못 참겠으면 바로 참전.",
    images: ["/opengraph-image"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
