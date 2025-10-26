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
    default: "Markdown Resume Generator - Create Professional Resumes Online",
    template: "%s | Markdown Resume Generator",
  },
  description:
    "Create beautiful, professional resumes with Markdown. Free online resume builder with real-time preview, PDF export, and AI-powered assistance. Build your perfect resume in minutes.",
  keywords: [
    "resume builder",
    "markdown resume",
    "CV creator",
    "online resume",
    "professional resume",
    "resume generator",
    "free resume builder",
    "PDF resume",
    "resume template",
    "markdown editor",
    "AI resume assistant",
  ],
  authors: [{ name: "Markdown Resume Generator" }],
  creator: "Markdown Resume Generator",
  publisher: "Markdown Resume Generator",
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
    title: "Markdown Resume Generator - Create Professional Resumes Online",
    description:
      "Create beautiful, professional resumes with Markdown. Free online resume builder with real-time preview, PDF export, and AI-powered assistance.",
    siteName: "Markdown Resume Generator",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Markdown Resume Generator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Markdown Resume Generator - Create Professional Resumes Online",
    description:
      "Create beautiful, professional resumes with Markdown. Free online resume builder with real-time preview, PDF export, and AI-powered assistance.",
    images: ["/logo.png"],
    creator: "@markdownresume",
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
  applicationName: "Markdown Resume Generator",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Markdown Resume",
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
