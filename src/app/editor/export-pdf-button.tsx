"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { httpClient } from "@/lib/client";

interface ExportPdfButtonProps {
  documentId: string | null;
  title: string;
  disabled?: boolean;
  variant?:
    | "default"
    | "outline"
    | "ghost"
    | "link"
    | "destructive"
    | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function ExportPdfButton({
  documentId,
  title,
  disabled = false,
  variant = "outline",
  size = "sm",
  className,
}: ExportPdfButtonProps) {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleExportPdf = useCallback(async () => {
    if (!documentId) {
      alert("Please save the document first");
      return;
    }

    setIsGeneratingPdf(true);
    try {
      const response = await httpClient.post(
        `/api/services/document/${documentId}/pdf`,
        {},
        {
          responseType: "blob",
        },
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${title.replace(/[^a-z0-9]/gi, "_")}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF");
    } finally {
      setIsGeneratingPdf(false);
    }
  }, [documentId, title]);

  return (
    <Button
      onClick={handleExportPdf}
      disabled={!documentId || isGeneratingPdf || disabled}
      variant={variant}
      size={size}
      className={className}
    >
      <Download className="h-4 w-4 mr-2" />
      {isGeneratingPdf ? "Generating..." : "Export PDF"}
    </Button>
  );
}
