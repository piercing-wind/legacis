import { findCoupons } from "@/lib/data/admin/coupon";
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
import { Coupon } from "@/prisma/generated/client";


export default async function Page() {
  const coupons: Coupon[] = await findCoupons();

  return (
    <div className="w-full mx-auto overflow-x-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold mb-6">All Coupons</h1>
        <Button variant={'default'} asChild>
          <Link href={`/admin/coupons/new`} className="hover:!text-legacisGreen flex items-center gap-2">
            <Plus size={20}/> Create Coupon
          </Link>
        </Button>
      </div>
      <Table containerClass="border p-4 rounded-2xl" className="p-4 rounded-2xl ">
        <TableHeader>
          <TableRow>
            <TableHead>#</TableHead>
            <TableHead>Code</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Percent Off</TableHead>
            <TableHead>Expiry</TableHead>
            <TableHead>Service</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {coupons.map((coupon, i) => (
            <TableRow key={coupon.id}>
              <TableCell>{i + 1}</TableCell>
              <TableCell>{coupon.code}</TableCell>
              <TableCell>{coupon.description ?? "-"}</TableCell>
              <TableCell>{coupon.percentOff}%</TableCell>
              <TableCell>{formatHumanDate(coupon.expiryDate)}</TableCell>
              <TableCell>{coupon.serviceId ?? "-"}</TableCell>
              <TableCell>{formatHumanDate(coupon.createdAt)}</TableCell>
              <TableCell>
                <Button variant={'outline'} asChild>
                  <Link href={`/admin/coupons/${coupon.id}`}>Edit</Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}