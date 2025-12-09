import { marked, Renderer, type Tokens } from "marked";
import DOMPurify from "isomorphic-dompurify";

/**
 * Configure marked options for better markdown rendering
 */
marked.setOptions({
  breaks: true, // Convert line breaks to <br>
  gfm: true, // Enable GitHub Flavored Markdown
});

/**
 * Create a default renderer to access the original code renderer
 */
const defaultRenderer = new Renderer();

/**
 * Add custom renderer for Mermaid diagrams
 * Converts ```mermaid code blocks to <div class="mermaid"> elements
 * Uses the default renderer for all other code blocks to ensure proper escaping
 */
marked.use({
  renderer: {
    code(token: Tokens.Code): string {
      // Check if this is a mermaid code block
      if (token.lang === "mermaid") {
        // Return a div with class "mermaid" instead of pre/code
        // Note: Mermaid code is not escaped as it will be processed by Mermaid.js
        return `<div class="mermaid">${token.text}</div>\n`;
      }
      // For all other code blocks, use the default renderer to ensure proper escaping
      return defaultRenderer.code(token);
    },
  },
});

/**
 * Sanitize HTML to prevent XSS attacks
 * Uses isomorphic-dompurify which works in both browser and Node.js environments
 * 
 * This fixes CVE-2025-55182 (React2Shell) by properly sanitizing HTML before
 * it is rendered via dangerouslySetInnerHTML, preventing XSS attacks.
 */
const sanitizeHtml = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      // Text content
      "p", "br", "span", "div",
      // Headings
      "h1", "h2", "h3", "h4", "h5", "h6",
      // Lists
      "ul", "ol", "li",
      // Formatting
      "strong", "em", "u", "s", "del", "ins", "sub", "sup", "mark",
      // Code
      "code", "pre",
      // Links
      "a",
      // Tables
      "table", "thead", "tbody", "tr", "th", "td",
      // Blockquotes
      "blockquote",
      // Horizontal rule
      "hr",
      // Images
      "img",
      // Mermaid diagrams
      "svg", "g", "path", "rect", "circle", "ellipse", "line", "polyline", "polygon", "text", "tspan", "defs", "marker", "foreignObject",
    ],
    ALLOWED_ATTR: [
      // Common attributes
      "class", "id",
      // Link attributes
      "href", "target", "rel",
      // Image attributes
      "src", "alt", "width", "height",
      // Table attributes
      "colspan", "rowspan", "align",
      // SVG attributes (for Mermaid diagrams only)
      "viewBox", "xmlns", "fill", "stroke", "stroke-width", "x", "y", "x1", "y1", "x2", "y2",
      "cx", "cy", "r", "rx", "ry", "points", "d", "transform", "text-anchor", "font-size",
      "font-family", "font-weight", "dx", "dy", "refX", "refY", "markerWidth",
      "markerHeight", "orient", "markerUnits",
    ],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|data|blob):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    ALLOW_DATA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false,
    SAFE_FOR_TEMPLATES: true,
    // Explicitly forbid dangerous tags and attributes
    FORBID_TAGS: ["script", "style", "iframe", "object", "embed", "base", "link", "meta", "form", "input", "button"],
    FORBID_ATTR: ["style", "onerror", "onload", "onclick", "onmouseover", "onfocus", "onblur", "oninput", "onchange", "onsubmit", "onreset", "onselect", "onabort", "onanimationend", "onanimationiteration", "onanimationstart", "onbeforeunload", "onblur", "oncancel", "oncanplay", "oncanplaythrough", "onchange", "onclick", "onclose", "oncontextmenu", "oncopy", "oncuechange", "oncut", "ondblclick", "ondrag", "ondragend", "ondragenter", "ondragleave", "ondragover", "ondragstart", "ondrop", "ondurationchange", "onemptied", "onended", "onerror", "onfocus", "onformdata", "oninput", "oninvalid", "onkeydown", "onkeypress", "onkeyup", "onload", "onloadeddata", "onloadedmetadata", "onloadstart", "onmousedown", "onmouseenter", "onmouseleave", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "onpaste", "onpause", "onplay", "onplaying", "onprogress", "onratechange", "onreset", "onresize", "onscroll", "onsecuritypolicyviolation", "onseeked", "onseeking", "onselect", "onslotchange", "onstalled", "onsubmit", "onsuspend", "ontimeupdate", "ontoggle", "onvolumechange", "onwaiting", "onwheel"],
  });
};

/**
 * Convert markdown to HTML
 * Sanitizes the output to prevent XSS attacks (CVE-2025-55182)
 */
export function markdownToHtml(markdown: string): string {
  if (!markdown) {
    return "";
  }

  try {
    // Convert markdown to HTML
    const rawHtml = marked.parse(markdown, { async: false }) as string;
    // Sanitize HTML to prevent XSS attacks
    return sanitizeHtml(rawHtml);
  } catch (error) {
    console.error("Error converting markdown to HTML:", error);
    return "";
  }
}

/**
 * Get a styled HTML document with GitHub-style markdown CSS
 * This is useful for PDF generation
 */
export function getStyledHtmlDocument(
  markdownHtml: string,
  title: string = "Document",
): string {
  // Check if HTML contains mermaid diagrams
  const hasMermaid = markdownHtml.includes('class="mermaid"');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  ${hasMermaid ? '<script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>' : ""}
  <style>
    /* GitHub Markdown CSS - Minimal version for PDF */
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif;
      font-size: 16px;
      line-height: 1.5;
      word-wrap: break-word;
      max-width: 980px;
      margin: 0 auto;
      padding: 45px;
      background-color: #ffffff;
      color: #1f2328;
    }

    h1, h2, h3, h4, h5, h6 {
      margin-top: 24px;
      margin-bottom: 16px;
      font-weight: 600;
      line-height: 1.25;
    }

    h1 { font-size: 2em; border-bottom: 1px solid #d0d7de; padding-bottom: 0.3em; }
    h2 { font-size: 1.5em; border-bottom: 1px solid #d0d7de; padding-bottom: 0.3em; }
    h3 { font-size: 1.25em; }
    h4 { font-size: 1em; }
    h5 { font-size: 0.875em; }
    h6 { font-size: 0.85em; color: #656d76; }

    p { margin-top: 0; margin-bottom: 10px; }

    a { color: #000; text-decoration: none; }
    a:hover { text-decoration: underline; }

    code {
      padding: 0.2em 0.4em;
      margin: 0;
      font-size: 85%;
      background-color: #f6f8fa;
      border-radius: 6px;
      font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace;
    }

    pre {
      padding: 16px;
      overflow: auto;
      font-size: 85%;
      line-height: 1.45;
      background-color: #f6f8fa;
      border-radius: 6px;
      margin-top: 0;
      margin-bottom: 16px;
    }

    pre code {
      padding: 0;
      background-color: transparent;
      border: 0;
    }

    ul, ol {
      margin-top: 0;
      margin-bottom: 16px;
      padding-left: 2em;
    }

    li + li { margin-top: 0.25em; }

    blockquote {
      margin: 0;
      padding: 0 1em;
      color: #656d76;
      border-left: 0.25em solid #d0d7de;
      margin-bottom: 16px;
    }

    table {
      border-spacing: 0;
      border-collapse: collapse;
      margin-top: 0;
      margin-bottom: 16px;
      width: 100%;
    }

    table tr {
      background-color: #ffffff;
      border-top: 1px solid #d0d7de;
    }

    table tr:nth-child(2n) {
      background-color: #f6f8fa;
    }

    table th, table td {
      padding: 6px 13px;
      border: 1px solid #d0d7de;
    }

    table th {
      font-weight: 600;
      background-color: #f6f8fa;
    }

    hr {
      height: 0.25em;
      padding: 0;
      margin: 24px 0;
      background-color: #d0d7de;
      border: 0;
    }

    img {
      max-width: 100%;
      box-sizing: content-box;
    }

    strong { font-weight: 600; }
    em { font-style: italic; }

    /* Mermaid diagram styling */
    .mermaid {
      margin: 16px 0;
      text-align: center;
      overflow-x: auto;
    }

    .mermaid svg {
      max-width: 100%;
      height: auto;
    }
  </style>
</head>
<body>
  <div class="markdown-body">
    ${markdownHtml}
  </div>
  ${
    hasMermaid
      ? `
  <script>
    (async function() {
      // Wait for Mermaid.js to load
      let retries = 50; // 5 seconds max wait
      while (typeof mermaid === 'undefined' && retries > 0) {
        await new Promise(resolve => setTimeout(resolve, 100));
        retries--;
      }
      
      if (typeof mermaid !== 'undefined') {
        mermaid.initialize({ 
          theme: 'default',
          startOnLoad: false 
        });
        try {
          await mermaid.run({ querySelector: '.mermaid' });
          // Signal that Mermaid rendering is complete
          window.mermaidReady = true;
        } catch (error) {
          console.error('Mermaid rendering error:', error);
          window.mermaidReady = false;
        }
      } else {
        console.error('Mermaid.js failed to load');
        window.mermaidReady = false;
      }
    })();
  </script>
  `
      : ""
  }
</body>
</html>
  `.trim();
}

/**
 * Extract plain text from markdown (removes all formatting)
 */
export function markdownToPlainText(markdown: string): string {
  if (!markdown) {
    return "";
  }

  // Remove markdown syntax
  return markdown
    .replace(/#{1,6}\s+/g, "") // Remove headers
    .replace(/\*\*(.+?)\*\*/g, "$1") // Remove bold
    .replace(/\*(.+?)\*/g, "$1") // Remove italic
    .replace(/\[(.+?)\]\(.+?\)/g, "$1") // Remove links, keep text
    .replace(/`(.+?)`/g, "$1") // Remove inline code
    .replace(/```[\s\S]+?```/g, "") // Remove code blocks
    .replace(/>\s+/g, "") // Remove blockquotes
    .replace(/[-*+]\s+/g, "") // Remove list markers
    .replace(/\d+\.\s+/g, "") // Remove numbered list markers
    .trim();
}

/**
 * Get word count from markdown
 */
export function getWordCount(markdown: string): number {
  const plainText = markdownToPlainText(markdown);
  return plainText.split(/\s+/).filter((word) => word.length > 0).length;
}

/**
 * Validate markdown syntax (basic validation)
 */
export function validateMarkdown(markdown: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!markdown || markdown.trim().length === 0) {
    errors.push("Markdown content is empty");
  }

  // Check for unclosed code blocks
  const codeBlockCount = (markdown.match(/```/g) || []).length;
  if (codeBlockCount % 2 !== 0) {
    errors.push("Unclosed code block detected");
  }

  // Check for unmatched brackets in links
  const openBrackets = (markdown.match(/\[/g) || []).length;
  const closeBrackets = (markdown.match(/\]/g) || []).length;
  if (openBrackets !== closeBrackets) {
    errors.push("Unmatched brackets in links");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
