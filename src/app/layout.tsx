import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./github-markdown-css.css";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryProvider } from "@/components/query-provider";
import { SessionProvider } from "next-auth/react";
import { EditorAutoSaveProvider } from "@/app/editor/auto-save-context";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Markdown Pro - Online Markdown Editor with PDF Export",
    template: "%s | Markdown Pro",
  },
  description:
    "Write, preview, and export your markdown documents to PDF with ease. Free online markdown editor with real-time preview, PDF export, and AI-powered assistance.",
  keywords: [
    "markdown editor",
    "online markdown",
    "markdown to PDF",
    "markdown preview",
    "document editor",
    "markdown converter",
    "free markdown editor",
    "PDF export",
    "markdown writing",
    "text editor",
    "AI writing assistant",
  ],
  authors: [{ name: "Markdown Pro" }],
  creator: "Markdown Pro",
  publisher: "Markdown Pro",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://markdown-resume.kwoktung.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "Markdown Pro - Online Markdown Editor with PDF Export",
    description:
      "Write, preview, and export your markdown documents to PDF with ease. Free online markdown editor with real-time preview, PDF export, and AI-powered assistance.",
    siteName: "Markdown Pro",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Markdown Pro",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Markdown Pro - Online Markdown Editor with PDF Export",
    description:
      "Write, preview, and export your markdown documents to PDF with ease. Free online markdown editor with real-time preview, PDF export, and AI-powered assistance.",
    images: ["/logo.png"],
    creator: "@markdownpro",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/logo.png",
  },
  manifest: "/manifest.json",
  applicationName: "Markdown Pro",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Markdown Pro",
  },
  verification: {
    // Add your verification tokens here when you get them
    // google: 'your-google-site-verification-code',
    // yandex: 'your-yandex-verification-code',
    // bing: 'your-bing-verification-code',
  },
  category: "productivity",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <SessionProvider>
              <EditorAutoSaveProvider>{children}</EditorAutoSaveProvider>
              <Toaster />
            </SessionProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
