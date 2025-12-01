"use client";

import { useEffect, useState } from "react";

// Mermaid.js types
declare global {
  interface Window {
    mermaid?: {
      initialize: (config: { theme: string; startOnLoad: boolean }) => void;
      run: (config?: { querySelector?: string }) => Promise<void>;
    };
  }
}

interface MermaidRendererProps {
  html: string;
  isDark: boolean;
}

export function MermaidRenderer({ html, isDark }: MermaidRendererProps) {
  const [mermaidLoaded, setMermaidLoaded] = useState(false);

  // Load Mermaid.js library
  useEffect(() => {
    // Check if Mermaid is already loaded
    if (window.mermaid) {
      setMermaidLoaded(true);
      return;
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector('script[src*="mermaid"]');
    if (existingScript) {
      existingScript.addEventListener("load", () => {
        setMermaidLoaded(true);
      });
      return;
    }

    // Load Mermaid.js from CDN
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js";
    script.async = true;
    script.onload = () => {
      setMermaidLoaded(true);
    };
    script.onerror = () => {
      console.error("Failed to load Mermaid.js");
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup: remove script if component unmounts
      const scriptToRemove = document.querySelector('script[src*="mermaid"]');
      if (scriptToRemove && scriptToRemove.parentNode) {
        scriptToRemove.parentNode.removeChild(scriptToRemove);
      }
    };
  }, []);

  // Initialize and render Mermaid diagrams
  useEffect(() => {
    if (!mermaidLoaded || !window.mermaid) {
      return;
    }

    const renderMermaid = async () => {
      try {
        // Initialize Mermaid with theme
        const mermaidTheme = isDark ? "dark" : "default";
        window.mermaid!.initialize({
          theme: mermaidTheme,
          startOnLoad: false, // We'll manually trigger rendering
        });

        // Wait a bit for DOM to be ready
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Render all mermaid diagrams
        const mermaidElements = document.querySelectorAll(".mermaid");
        if (mermaidElements.length > 0) {
          await window.mermaid!.run({
            querySelector: ".mermaid",
          });
        }
      } catch (error) {
        console.error("Error rendering Mermaid diagrams:", error);
      }
    };

    renderMermaid();
  }, [html, mermaidLoaded, isDark]);

  // This component doesn't render anything itself
  // It just handles the Mermaid initialization and rendering
  return null;
}
