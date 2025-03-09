import { TableCell, TableRow } from "@/components/ui/table";

interface EmptyStateProps {
  colSpan: number;
  message: string;
}

export function EmptyState({ colSpan, message }: EmptyStateProps) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="text-center py-4">
        {message}
      </TableCell>
    </TableRow>
  );
} 