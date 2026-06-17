import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://vs-arena-two.vercel.app"),
  title: "VS Arena - 남들 싸우는 거 구경하다 못 참으면 참전",
  description: "편 갈리는 주제에 투표하고, 댓글로 참전하는 VS 토론 커뮤니티",
  openGraph: {
    type: "website",
    title: "VS Arena",
    description: "남들 싸우는 거 구경하다 못 참겠으면 바로 참전.",
    url: "https://vs-arena-two.vercel.app/",
    siteName: "VS Arena",
    locale: "ko_KR",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "VS Arena",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VS Arena",
    description: "남들 싸우는 거 구경하다 못 참겠으면 바로 참전.",
    images: ["/og-image.png"],
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
