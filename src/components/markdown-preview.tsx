"use client";

import { useCallback, useMemo, useRef, useState, memo } from "react";
import { useTheme } from "next-themes";
import { markdownToHtml } from "@/lib/markdown";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MermaidRenderer } from "@/components/mermaid-renderer";

interface MarkdownPreviewProps {
  markdown: string;
  className?: string;
}

const useMarkdownBodyBackgroundColor = () => {
  const [bgColor, setBgColor] = useState<string>("transparent");
  const animationFrameRef = useRef<number | null>(null);

  const markdownBodyRef = useCallback((node: HTMLDivElement | null) => {
    // Cancel any pending animation frame
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    if (node) {
      // Use requestAnimationFrame to ensure styles are computed after paint
      animationFrameRef.current = requestAnimationFrame(() => {
        const styles = getComputedStyle(node);
        const color = styles.getPropertyValue("--bgColor-default");
        setBgColor(color || "transparent");
      });
    }
  }, []);

  return { bgColor, markdownBodyRef };
};

function MarkdownPreviewComponent({
  markdown,
  className = "",
}: MarkdownPreviewProps) {
  const { theme, resolvedTheme } = useTheme();
  const { bgColor, markdownBodyRef } = useMarkdownBodyBackgroundColor();

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
    <ScrollArea className={`h-full ${className}`}>
      <MermaidRenderer html={html} isDark={isDark} />
      <div className="p-6" style={{ backgroundColor: bgColor }}>
        <div
          ref={markdownBodyRef}
          className="markdown-body"
          data-theme={isDark ? "dark" : "light"}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </ScrollArea>
  );
}

export const MarkdownPreview = memo(MarkdownPreviewComponent);
