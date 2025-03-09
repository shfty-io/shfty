import { Loader2 } from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";

interface LoadingStateProps {
  colSpan: number;
}

export function LoadingState({ colSpan }: LoadingStateProps) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="text-center py-4">
        <div className="flex justify-center">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading...
        </div>
      </TableCell>
    </TableRow>
  );
} 