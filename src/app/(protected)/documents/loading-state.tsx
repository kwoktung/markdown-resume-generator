import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const DocumentLoadingState = () => {
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50%] py-4">Title</TableHead>
            <TableHead className="w-[20%] py-4">Created</TableHead>
            <TableHead className="w-[20%] py-4">Updated</TableHead>
            <TableHead className="w-[10%] text-right py-2">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <Skeleton className="size-4 shrink-0" />
                  <Skeleton className="h-5 w-[60%]" />
                </div>
              </TableCell>
              <TableCell className="text-sm">
                <Skeleton className="h-5 w-24" />
              </TableCell>
              <TableCell className="text-sm">
                <Skeleton className="h-5 w-24" />
              </TableCell>
              <TableCell className="text-right">
                <div className="flex gap-1 justify-end">
                  <Skeleton className="size-9" />
                  <Skeleton className="size-9" />
                  <Skeleton className="size-9" />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
