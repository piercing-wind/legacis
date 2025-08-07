import { db } from "@/lib/db";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatHumanDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function Page() {
  const agreements = await db.agreement.findMany({
   select: {
      id: true,
      name: true,
      type: true,
      policyType: true,
      version: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="w-full mx-auto overflow-x-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold mb-6">All Agreements & Policies</h1>
        <Button variant={'default'} asChild>
          <Link href={`/admin/agreements/new`} className="hover:!text-legacisGreen flex items-center gap-2">
            <Plus size={20}/> Create Agreement
          </Link>
        </Button>
      </div>
      <Table containerClass="border p-4 rounded-2xl" className="p-4 rounded-2xl ">
        <TableHeader>
          <TableRow>
            <TableHead>#</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Policy Type</TableHead>
            <TableHead>Version</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {agreements.map((agreement, i) => (
            <TableRow key={agreement.id}>
              <TableCell>{i + 1}</TableCell>
              <TableCell>{agreement.name}</TableCell>
              <TableCell>{agreement.type}</TableCell>
              <TableCell>{agreement.policyType ?? "-"}</TableCell>
              <TableCell>{agreement.version}</TableCell>
              <TableCell>{formatHumanDate(agreement.createdAt)}</TableCell>
              <TableCell>{formatHumanDate(agreement.updatedAt)}</TableCell>
              <TableCell>
                <Button variant={'outline'} asChild>
                  <Link href={`/admin/agreements/${agreement.id}`}>Edit</Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}