"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Pencil,
  Trash2,
  FileText,
  Loader2,
  Copy,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { httpClient } from "@/lib/client";

import { DocumentLoadingState } from "./loading-state";
import { DocumentErrorState } from "./error-state";
import { DocumentEmptyState } from "./empty-state";

interface Document {
  id: number;
  title: string;
  content: string;
  userId: string;
  createdAt: string | null;
  updatedAt: string | null;
  deletedAt: string | null;
}

interface DocumentListResponse {
  documents: Document[];
  total: number;
}

const limit = 10;

const Dashboard = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [offset, setOffset] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null,
  );

  // Fetch documents
  const { data, isLoading, error } = useQuery<DocumentListResponse>({
    queryKey: ["documents", limit, offset],
    queryFn: async () => {
      const response = await httpClient.get("/api/services/document", {
        params: {
          limit,
          offset,
        },
      });
      return response.data;
    },
  });

  // Delete document mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await httpClient.delete(`/api/services/document/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      setDeleteDialogOpen(false);
      setSelectedDocument(null);
    },
  });

  // Duplicate document mutation
  const duplicateMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await httpClient.post(
        `/api/services/document/${id}/duplicate`,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });

  const handleDeleteClick = (document: Document) => {
    setSelectedDocument(document);
    setDeleteDialogOpen(true);
  };

  const handleDuplicate = (documentId: number) => {
    duplicateMutation.mutate(documentId);
  };

  const handleDelete = () => {
    if (selectedDocument) {
      deleteMutation.mutate(selectedDocument.id);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Pagination helpers
  const totalPages = data ? Math.ceil(data.total / limit) : 0;
  const currentPage = Math.floor(offset / limit) + 1;
  const showPagination = data && data.total > limit;

  const handlePreviousPage = () => {
    if (offset > 0) {
      setOffset(Math.max(0, offset - limit));
    }
  };

  const handleNextPage = () => {
    if (data && offset + limit < data.total) {
      setOffset(offset + limit);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight mb-2">
                My Documents
              </h1>
              <p className="text-muted-foreground text-lg">
                Create and manage your resume documents
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                size="lg"
                variant="outline"
                className="gap-2"
                onClick={() => router.push("/sign-out")}
              >
                <LogOut className="size-5" />
                Logout
              </Button>
              <Button
                size="lg"
                className="gap-2"
                onClick={() => router.push("/editor")}
              >
                <Plus className="size-5" />
                New Document
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        {isLoading && <DocumentLoadingState />}

        {error && <DocumentErrorState />}

        {data && data.documents.length === 0 && (
          <DocumentEmptyState onCreateDocument={() => router.push("/editor")} />
        )}

        {data && data.documents.length > 0 && (
          <>
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50%] py-4">Title</TableHead>
                    <TableHead className="w-[20%] py-4">Created</TableHead>
                    <TableHead className="w-[20%] py-4">Updated</TableHead>
                    <TableHead className="w-[10%] text-right py-2">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.documents.map((document) => (
                    <TableRow
                      key={document.id}
                      className="cursor-pointer"
                      onClick={() => router.push(`/editor?id=${document.id}`)}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <FileText className="size-4 text-muted-foreground shrink-0" />
                          <span className="line-clamp-1">{document.title}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDate(document.createdAt)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDate(document.updatedAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-1 justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/editor?id=${document.id}`);
                            }}
                            title="Edit"
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDuplicate(document.id);
                            }}
                            disabled={duplicateMutation.isPending}
                            title="Duplicate"
                          >
                            {duplicateMutation.isPending &&
                            duplicateMutation.variables === document.id ? (
                              <Loader2 className="size-4 animate-spin" />
                            ) : (
                              <Copy className="size-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(document);
                            }}
                            title="Delete"
                          >
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {showPagination && (
              <div className="flex items-center justify-between px-2 py-4">
                <div className="text-sm text-muted-foreground">
                  Showing {offset + 1} to {Math.min(offset + limit, data.total)}{" "}
                  of {data.total} documents
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousPage}
                    disabled={offset === 0 || isLoading}
                    className="gap-1"
                  >
                    <ChevronLeft className="size-4" />
                    Previous
                  </Button>
                  <div className="text-sm font-medium">
                    Page {currentPage} of {totalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={offset + limit >= data.total || isLoading}
                    className="gap-1"
                  >
                    Next
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Delete Confirmation Dialog */}
            <AlertDialog
              open={deleteDialogOpen}
              onOpenChange={setDeleteDialogOpen}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    the document &quot;{selectedDocument?.title}&quot;.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={deleteMutation.isPending}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {deleteMutation.isPending && (
                      <Loader2 className="size-4 animate-spin" />
                    )}
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
