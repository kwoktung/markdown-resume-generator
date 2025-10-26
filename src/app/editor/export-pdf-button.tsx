"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { Download, FileText } from "lucide-react";
import { httpClient } from "@/lib/client";
import { toast } from "sonner";

interface ExportPdfButtonProps {
  title: string;
  content: string;
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
  title,
  content,
  disabled = false,
  variant = "outline",
  size = "sm",
  className,
}: ExportPdfButtonProps) {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  const handleExportPdf = useCallback(async () => {
    setIsGeneratingPdf(true);
    setProgress(0);

    try {
      // Simulate progress updates
      progressIntervalRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev;
          return Math.min(prev + Math.random() * 20, 90);
        });
      }, 200);

      const response = await httpClient.post(
        `/api/services/export/pdf`,
        {
          title,
          content,
        },
        {
          responseType: "blob",
        },
      );

      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      setProgress(100);

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${title.replace(/\s+/gi, "_")}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to generate PDF";
      toast.error(message);
    } finally {
      // Clear interval in all cases (success or error)
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      setIsGeneratingPdf(false);
      setProgress(0);
    }
  }, [title, content]);

  return (
    <Popover open={isGeneratingPdf}>
      <PopoverTrigger asChild>
        <Button
          onClick={handleExportPdf}
          disabled={disabled || isGeneratingPdf}
          variant={variant}
          size={size}
          className={className}
        >
          <Download className="h-4 w-4 mr-2" />
          {isGeneratingPdf ? "Generating..." : "Export PDF"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-6" align="center">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Generating PDF</h3>
              <p className="text-xs text-muted-foreground">
                Please wait while we prepare your document...
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
