import puppeteer, { type Browser, BrowserWorker } from "@cloudflare/puppeteer";
import { getStyledHtmlDocument, markdownToHtml } from "./markdown";

/**
 * PDF generation options
 */
export interface PdfOptions {
  format?: "A4" | "Letter" | "Legal";
  margin?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
  displayHeaderFooter?: boolean;
  headerTemplate?: string;
  footerTemplate?: string;
  printBackground?: boolean;
}

/**
 * Default PDF options
 */
const DEFAULT_PDF_OPTIONS: PdfOptions = {
  format: "A4",
  margin: {
    top: "20mm",
    right: "20mm",
    bottom: "20mm",
    left: "20mm",
  },
  printBackground: true,
  displayHeaderFooter: false,
};

/**
 * Generate PDF from HTML using Cloudflare Browser Rendering
 * @param browserBinding - Cloudflare Browser binding from env.BROWSER
 * @param htmlContent - HTML content to convert to PDF
 * @param options - PDF generation options
 * @returns PDF as Uint8Array
 */
export async function generatePdfFromHtml(
  browserBinding: BrowserWorker,
  htmlContent: string,
  options: PdfOptions = {},
): Promise<Uint8Array> {
  let browser: Browser | null = null;

  try {
    // Launch browser using Cloudflare's Browser Rendering API
    browser = await puppeteer.launch(browserBinding);

    // Create a new page
    const page = await browser.newPage();

    // Set content
    await page.setContent(htmlContent, {
      waitUntil: "networkidle0",
    });

    // Merge options with defaults
    const pdfOptions = { ...DEFAULT_PDF_OPTIONS, ...options };

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: pdfOptions.format,
      margin: pdfOptions.margin,
      printBackground: pdfOptions.printBackground,
      displayHeaderFooter: pdfOptions.displayHeaderFooter,
      headerTemplate: pdfOptions.headerTemplate,
      footerTemplate: pdfOptions.footerTemplate,
    });

    return pdfBuffer;
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw new Error(
      `Failed to generate PDF: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  } finally {
    // Always close the browser
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Generate PDF from markdown HTML
 * @param browserBinding - Cloudflare Browser binding from env.BROWSER
 * @param markdownHtml - Rendered markdown HTML
 * @param title - Document title
 * @param options - PDF generation options
 * @returns PDF as Uint8Array
 */
export async function generatePdfFromMarkdown(
  browserBinding: BrowserWorker,
  markdownHtml: string,
  title: string = "Document",
  options: PdfOptions = {},
): Promise<Uint8Array> {
  // Create styled HTML document
  const styledHtml = getStyledHtmlDocument(markdownHtml, title);

  // Generate PDF
  return generatePdfFromHtml(browserBinding, styledHtml, options);
}

/**
 * Get PDF filename from document title
 */
export function getPdfFilename(title: string): string {
  // Sanitize title for filename
  const sanitized = title
    .replace(/[^a-z0-9]/gi, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "")
    .toLowerCase();

  const timestamp = new Date().toISOString().split("T")[0];
  return `${sanitized}_${timestamp}.pdf`;
}

/**
 * Create PDF response headers
 */
export function getPdfHeaders(filename: string): Record<string, string> {
  return {
    "Content-Disposition": `attachment; filename="${filename}"`,
    "Content-Type": "application/pdf",
    "Cache-Control": "no-cache, no-store, must-revalidate",
    Pragma: "no-cache",
    Expires: "0",
  };
}

/**
 * Generate PDF Response from markdown content
 * This is a high-level utility that combines all PDF generation steps
 * @param browserBinding - Cloudflare Browser binding from env.BROWSER
 * @param title - Document title
 * @param markdownContent - Markdown content to convert
 * @param options - PDF generation options
 * @returns Response object with PDF
 * @throws Error if browser binding is not available or PDF generation fails
 */
export async function generatePdfResponse(
  browserBinding: BrowserWorker | undefined,
  title: string,
  markdownContent: string,
  options: PdfOptions = {},
): Promise<Response> {
  // Check browser binding availability
  if (!browserBinding) {
    throw new Error("Browser rendering not available");
  }

  // Convert markdown to HTML
  const html = markdownToHtml(markdownContent);

  // Generate PDF
  const pdfBuffer = await generatePdfFromMarkdown(
    browserBinding,
    html,
    title,
    options,
  );

  // Get PDF filename and headers
  const filename = getPdfFilename(title);
  const headers = getPdfHeaders(filename);

  // Return PDF Response
  return new Response(Buffer.from(pdfBuffer), {
    headers,
  });
}
