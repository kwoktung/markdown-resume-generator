import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Plus } from "lucide-react";

interface DocumentEmptyStateProps {
  onCreateDocument: () => void;
}

export const DocumentEmptyState = ({
  onCreateDocument,
}: DocumentEmptyStateProps) => {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <FileText className="size-12 text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-2">No documents yet</h3>
        <p className="text-muted-foreground mb-6 max-w-sm">
          Get started by creating your first resume document
        </p>
        <Button onClick={onCreateDocument}>
          <Plus className="size-4" />
          Create Your First Document
        </Button>
      </CardContent>
    </Card>
  );
};
