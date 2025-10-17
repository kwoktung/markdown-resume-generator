import Link from "next/link";
import { FileText, Sparkles, Download, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
          <Link href="/" className="flex items-center gap-2">
            <FileText className="h-6 w-6" />
            <span className="text-lg font-semibold tracking-tight">
              Markdown Resume
            </span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              href="/dashboard"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Dashboard
            </Link>
            <Link
              href="/sign-in"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Sign In
            </Link>
            <ThemeToggle />
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="container mx-auto flex flex-col items-center justify-center gap-8 px-4 py-24 md:px-8 md:py-32 lg:py-40">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-1.5 text-sm">
              <Sparkles className="h-4 w-4" />
              <span>Create professional resumes in minutes</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl max-w-4xl">
              Build Your Resume with{" "}
              <span className="text-primary">Markdown</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl sm:text-xl">
              Write your resume in markdown, preview in real-time, and export as
              a beautiful PDF. Simple, fast, and version-control friendly.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 mt-4">
            <Button asChild size="lg" className="text-base">
              <Link href="/sign-up">
                Get Started
                <Edit className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-base">
              <Link href="/editor">
                Try Demo
                <FileText className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 py-16 md:px-8 md:py-24 border-t border-border">
          <div className="flex flex-col items-center gap-4 text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Why Markdown Resume?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl">
              A modern approach to resume creation that combines simplicity with
              power.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="flex flex-col items-center gap-4 text-center p-6 rounded-lg border border-border bg-card hover:shadow-lg transition-shadow">
              <div className="p-3 rounded-full bg-primary/10">
                <Edit className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Easy to Write</h3>
              <p className="text-muted-foreground">
                Use simple markdown syntax to create your resume. No complex
                formatting needed.
              </p>
            </div>

            <div className="flex flex-col items-center gap-4 text-center p-6 rounded-lg border border-border bg-card hover:shadow-lg transition-shadow">
              <div className="p-3 rounded-full bg-primary/10">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Live Preview</h3>
              <p className="text-muted-foreground">
                See your changes instantly with our real-time markdown preview.
              </p>
            </div>

            <div className="flex flex-col items-center gap-4 text-center p-6 rounded-lg border border-border bg-card hover:shadow-lg transition-shadow">
              <div className="p-3 rounded-full bg-primary/10">
                <Download className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Export to PDF</h3>
              <p className="text-muted-foreground">
                Download your resume as a professional-looking PDF with one
                click.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-16 md:px-8 md:py-24 border-t border-border">
          <div className="flex flex-col items-center gap-6 text-center rounded-lg border border-border bg-muted/50 p-12 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl">
              Join thousands of professionals who create their resumes with
              markdown.
            </p>
            <Button asChild size="lg" className="text-base">
              <Link href="/sign-up">
                Create Your Resume
                <FileText className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/50">
        <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-6 md:px-8">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Markdown Resume. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="/documents"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Documents
            </Link>
            <Link
              href="/plans"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Plans
            </Link>
            <Link
              href="/dashboard"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
