"use client";

export const getMarkdownBodyBackgroundColor = (): string => {
  // Check if we're in a browser environment
  if (typeof document === "undefined") {
    return "transparent"; // Return default for SSR
  }

  const root = document.querySelector(".markdown-body") as HTMLElement;

  if (!root) {
    return "transparent"; // Return default if element not found
  }

  const styles = getComputedStyle(root);
  const bgColor = styles.getPropertyValue("--bgColor-default");
  return bgColor || "transparent";
};
