import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

export function AnnualDisposalTable() {
  const years = [
    { year: "2021-22" },
    { year: "2022-23" },
    { year: "2023-24" },
  ];
  return (
    <div className="w-full overflow-x-auto">
      <Table className="rounded-xl overflow-hidden border border-neutral-300 min-w-[700px]">
        <TableHeader>
          <TableRow className="bg-neutral-100 dark:bg-neutral-800">
            <TableHead className="text-center">Year</TableHead>
            <TableHead className="text-center">Carried forward from previous year</TableHead>
            <TableHead className="text-center">RECEIVED</TableHead>
            <TableHead className="text-center">RESOLVED</TableHead>
            <TableHead className="text-center">TOTAL PENDING</TableHead>
            <TableHead className="text-center">PENDING DISPOSAL &gt; 3 MONTH</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {years.map((row, idx) => (
            <TableRow key={row.year} >
              <TableCell className="text-center font-medium">{row.year}</TableCell>
              <TableCell className="text-center">Nil</TableCell>
              <TableCell className="text-center">Nil</TableCell>
              <TableCell className="text-center">N.A</TableCell>
              <TableCell className="text-center">Nil</TableCell>
              <TableCell className="text-center">Nil</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}