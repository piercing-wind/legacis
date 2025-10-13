import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

type TableHeadings = (string | number)[];
type TableRows = (string | number)[][];

interface ClientComplaintsTableProps {
  headings: TableHeadings;
  rows: TableRows;
}

export function SubmissionTable({
  headings,
  rows,
}: ClientComplaintsTableProps
) {
  return (
    <Table className="rounded-xl overflow-hidden border border-neutral-300">
      <TableHeader>
        <TableRow className="bg-neutral-100 dark:bg-neutral-800">
          {headings.map((heading, idx) => (
            <TableHead key={idx} className="text-center">{heading}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row, rowIdx) => (
          <TableRow key={rowIdx}>
            {row.map((cell, cellIdx) => (
              <TableCell key={cellIdx} className="text-center">{cell}</TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}