import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ToastProvider } from "@/components/ui/toast-provider";
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
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: "Clip Manager",
    template: "%s | Clip Manager",
  },
  description:
    "Organiza y gestiona los mejores momentos de tus streams.",
  icons: {
    icon: "/brand/1.2.png",
    apple: "/brand/1.2.png",
  },
  openGraph: {
    type: "website",
    locale: "es_CO",
    siteName: "Clip Manager",
    title: "Clip Manager",
    description: "Organiza y gestiona los mejores momentos de tus streams.",
    images: [{ url: "/brand/1.2.png", width: 1280, height: 1280, alt: "Clip Manager" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Clip Manager",
    description: "Organiza y gestiona los mejores momentos de tus streams.",
    images: ["/brand/1.2.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body><ToastProvider>{children}</ToastProvider></body>
    </html>
  );
}