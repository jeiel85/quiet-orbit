import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const description =
  "작은 행성 위를 천천히 산책하며 빛나는 메시지 조각을 발견하는 조용한 3D 경험.";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title: "Quiet Orbit",
  description,
  applicationName: "Quiet Orbit",
  openGraph: {
    title: "Quiet Orbit",
    description,
    siteName: "Quiet Orbit",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Quiet Orbit",
    description,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#bdeaf2",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${geistSans.variable} h-full antialiased`}>
      <body className="h-full overflow-hidden">{children}</body>
    </html>
  );
}
