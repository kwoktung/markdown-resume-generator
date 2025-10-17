import { Card, CardContent } from "@/components/ui/card";

export const DocumentErrorState = () => {
  return (
    <Card className="border-destructive">
      <CardContent className="pt-6">
        <p className="text-destructive text-center">
          Failed to load documents. Please try again.
        </p>
      </CardContent>
    </Card>
  );
};
