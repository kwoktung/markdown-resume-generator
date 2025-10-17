import { Loader2 } from "lucide-react";

export const DocumentLoadingState = () => {
  return (
    <div className="flex items-center justify-center py-16">
      <Loader2 className="size-8 animate-spin text-muted-foreground" />
    </div>
  );
};
