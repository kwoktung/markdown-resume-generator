"use client";

import { useEffect, useMemo, useState } from "react";
import { useTheme } from "next-themes";
import { markdownToHtml } from "@/lib/markdown";
import { getMarkdownBodyBackgroundColor } from "@/lib/color";
import "github-markdown-css/github-markdown.css";

interface MarkdownPreviewProps {
  markdown: string;
  className?: string;
}

const useMarkdownBodyBackgroundColor = () => {
  const [bgColor, setBgColor] = useState<string>("transparent");
  useEffect(() => {
    const t = setTimeout(() => {
      const color = getMarkdownBodyBackgroundColor();
      setBgColor(color);
    }, 100);
    return () => clearTimeout(t);
  }, []);

  return bgColor;
};

export function MarkdownPreview({
  markdown,
  className = "",
}: MarkdownPreviewProps) {
  const { theme, resolvedTheme } = useTheme();
  const bgColor = useMarkdownBodyBackgroundColor();
  const html = useMemo(() => {
    return markdownToHtml(markdown);
  }, [markdown]);

  // Determine which theme to use (resolvedTheme accounts for system preference)
  const currentTheme = resolvedTheme || theme;
  const isDark = currentTheme === "dark";

  if (!markdown) {
    return (
      <div
        className={`h-full flex items-center justify-center text-muted-foreground ${className}`}
      >
        <p>Preview will appear here...</p>
      </div>
    );
  }

  return (
    <div className={`h-full overflow-auto ${className}`}>
      <div className="p-6" style={{ backgroundColor: bgColor }}>
        <div
          className="markdown-body"
          data-color-mode={isDark ? "dark" : "light"}
          data-dark-theme="dark"
          data-light-theme="light"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  );
}
