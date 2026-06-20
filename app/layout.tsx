import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://vs-arena-two.vercel.app"),
  title: "VS Arena - 둘 중 하나만 골라",
  description:
    "요즘 사람들 생각이 갈리는 질문들. A/B 중 하나를 고르고 다른 사람들의 선택을 확인해보세요.",
  openGraph: {
    type: "website",
    title: "VS Arena - 사람들은 뭘 선택했을까?",
    description:
      "A/B 중 하나를 고르고, 다른 사람들의 선택과 의견을 확인해보세요.",
    url: "https://vs-arena-two.vercel.app/",
    siteName: "VS Arena",
    locale: "ko_KR",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "VS Arena",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VS Arena - 사람들은 뭘 선택했을까?",
    description:
      "A/B 중 하나를 고르고, 다른 사람들의 선택과 의견을 확인해보세요.",
    images: ["/opengraph-image"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
