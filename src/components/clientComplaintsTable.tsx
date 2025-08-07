import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

export function ClientComplaintsTable() {
  return (
    <Table className="rounded-xl overflow-hidden border border-neutral-300">
      <TableHeader>
        <TableRow className="bg-neutral-100">
          <TableHead className="text-center">RECEIVED FORM</TableHead>
          <TableHead className="text-center">PENDING AT THE END OF LAST MONTH</TableHead>
          <TableHead className="text-center">RECEIVED</TableHead>
          <TableHead className="text-center">RESOLVED</TableHead>
          <TableHead className="text-center">TOTAL PENDING</TableHead>
          <TableHead className="text-center">PENDING COMPLAINTS &gt; 3 MONTH</TableHead>
          <TableHead className="text-center">AVERAGE RESOLUTION TIME</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {[
          "Directly from Investor",
          "SEBI (SCORES)",
          "Other Sources (If any)",
          "Grand Total",
        ].map((source, idx) => (
          <TableRow key={source} className={""}>
            <TableCell className="text-center font-medium">{source}</TableCell>
            <TableCell className="text-center">Nil</TableCell>
            <TableCell className="text-center">Nil</TableCell>
            <TableCell className="text-center">N.A</TableCell>
            <TableCell className="text-center">Nil</TableCell>
            <TableCell className="text-center">Nil</TableCell>
            <TableCell className="text-center">N.A</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}