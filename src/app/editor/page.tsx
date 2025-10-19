"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MarkdownEditor } from "@/components/markdown-editor";
import { MarkdownPreview } from "@/components/markdown-preview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { Save, ArrowLeft, Eye, Code, Check, FileText } from "lucide-react";
import { httpClient } from "@/lib/client";
import { useSession } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";
import { useAutoSave } from "./auto-save-context";
import { ExportPdfButton } from "./export-pdf-button";

const UNSAVED_DOCUMENT_KEY = "editor-unsaved-document";
const DEFAULT_DOCUMENT_TITLE = "Untitled Document";
const AUTO_SAVE_DELAY = 10000;

function EditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const documentId = searchParams?.get("id");
  const { autoSaveEnabled, setAutoSaveEnabled } = useAutoSave();
  const [title, setTitle] = useState(DEFAULT_DOCUMENT_TITLE);
  const [content, setContent] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showPreview, setShowPreview] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const autosaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isLoadingRef = useRef(false);

  // Load document on mount
  useEffect(() => {
    if (documentId) {
      // Load from server if we have an ID
      loadDocument(documentId);
    } else {
      // Load from sessionStorage if no ID (unsaved document)
      try {
        const saved = sessionStorage.getItem(UNSAVED_DOCUMENT_KEY);
        if (saved) {
          const { title: savedTitle, content: savedContent } =
            JSON.parse(saved);
          setTitle(savedTitle || DEFAULT_DOCUMENT_TITLE);
          setContent(savedContent || "");
        }
      } catch (error) {
        console.error("Error loading from sessionStorage:", error);
      }
    }
  }, [documentId]);

  const loadDocument = async (id: string) => {
    try {
      isLoadingRef.current = true;
      const response = await httpClient.get(`/api/services/document/${id}`);
      const { document } = response.data;
      setTitle(document.title);
      setContent(document.content);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error("Error loading document:", error);
      alert("Failed to load document");
    } finally {
      isLoadingRef.current = false;
    }
  };

  const handleSave = useCallback(async () => {
    if (!session) {
      router.push("/sign-in");
      return;
    }
    setIsSaving(true);
    try {
      if (documentId) {
        // Update existing document
        await httpClient.put(`/api/services/document/${documentId}`, {
          title,
          content,
        });
      } else {
        // Create new document
        const response = await httpClient.post("/api/services/document", {
          title,
          content,
        });
        const { id } = response.data;

        // Clear sessionStorage backup once saved to server
        try {
          sessionStorage.removeItem(UNSAVED_DOCUMENT_KEY);
        } catch (error) {
          console.error("Error clearing sessionStorage:", error);
        }

        // Update URL with new document ID
        router.push(`/editor?id=${id}`);
      }
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    } catch (error) {
      console.error("Error saving document:", error);
      alert("Failed to save document");
    } finally {
      setIsSaving(false);
    }
  }, [documentId, title, content, router, queryClient, session]);

  // Save to sessionStorage for unsaved documents (prevent data loss on reload)
  useEffect(() => {
    if (!documentId && (title !== DEFAULT_DOCUMENT_TITLE || content !== "")) {
      try {
        sessionStorage.setItem(
          UNSAVED_DOCUMENT_KEY,
          JSON.stringify({ title, content }),
        );
      } catch (error) {
        console.error("Error saving to sessionStorage:", error);
      }
    }
  }, [documentId, title, content]);

  // Autosave effect - triggers 2 seconds after last change
  useEffect(() => {
    if (
      !autoSaveEnabled ||
      !hasUnsavedChanges ||
      isLoadingRef.current ||
      !documentId
    ) {
      return;
    }

    // Clear existing timeout
    if (autosaveTimeoutRef.current) {
      clearTimeout(autosaveTimeoutRef.current);
    }

    // Set new timeout for autosave
    autosaveTimeoutRef.current = setTimeout(() => {
      handleSave();
    }, AUTO_SAVE_DELAY); // Autosave after AUTO_SAVE_DELAY milliseconds of inactivity

    return () => {
      if (autosaveTimeoutRef.current) {
        clearTimeout(autosaveTimeoutRef.current);
      }
    };
  }, [autoSaveEnabled, hasUnsavedChanges, documentId, handleSave]);

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    setHasUnsavedChanges(true);
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    setHasUnsavedChanges(true);
  };

  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b bg-card px-6 py-4 shadow-sm">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/documents")}
            className="shrink-0"
            title="Back to documents"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-3 min-w-0 flex-1">
            <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
            <Input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="border-none shadow-none text-lg font-semibold h-auto py-0 px-0 focus-visible:ring-0 bg-transparent"
              placeholder="Untitled Document"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Status Indicator */}
          <div className="flex items-center gap-2">
            {isSaving && (
              <span className="text-sm text-primary flex items-center gap-2">
                <Save className="h-4 w-4 animate-pulse" />
                <span className="font-medium">Saving...</span>
              </span>
            )}
            {!isSaving && lastSaved && !hasUnsavedChanges && (
              <span className="text-sm text-emerald-600 dark:text-emerald-500 flex items-center gap-2">
                <Check className="h-4 w-4" />
                <span className="font-medium">Saved</span>
              </span>
            )}
            {!isSaving && hasUnsavedChanges && (
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-amber-500" />
                <span className="font-medium">Unsaved</span>
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={togglePreview}
              title={showPreview ? "Hide preview" : "Show preview"}
              className="shrink-0"
            >
              {showPreview ? (
                <Code className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </Button>

            {/* Auto-save Toggle */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-background/50">
              <Switch
                id="auto-save-editor"
                checked={autoSaveEnabled}
                onCheckedChange={setAutoSaveEnabled}
              />
              <Label
                htmlFor="auto-save-editor"
                className="text-sm font-medium cursor-pointer"
              >
                Auto-save
              </Label>
            </div>

            <Button
              onClick={handleSave}
              disabled={isSaving || !hasUnsavedChanges}
              size="sm"
              className="shrink-0"
            >
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>

            <ExportPdfButton
              documentId={documentId}
              title={title}
              variant="outline"
              size="sm"
              className="shrink-0"
            />
          </div>
        </div>
      </header>

      {/* Editor and Preview */}
      <div className="flex-1 overflow-hidden">
        {showPreview ? (
          <ResizablePanelGroup direction="horizontal" className="h-full">
            <ResizablePanel defaultSize={50} minSize={30}>
              <div className="h-full bg-card">
                <MarkdownEditor
                  value={content}
                  onChange={handleContentChange}
                />
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={50} minSize={30}>
              <div className="h-full bg-card">
                <MarkdownPreview markdown={content} />
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        ) : (
          <div className="h-full bg-card">
            <MarkdownEditor value={content} onChange={handleContentChange} />
          </div>
        )}
      </div>
    </div>
  );
}

export default function EditorPage() {
  return (
    <Suspense fallback={null}>
      <EditorContent />
    </Suspense>
  );
}
