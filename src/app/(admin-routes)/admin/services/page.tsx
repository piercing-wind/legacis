import { findServices } from "@/lib/data/admin/services";
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
import { ServicePlan } from "@/prisma/generated/client";

export type ServiceListItem = {
  id: string;
  order: number;
  name: string;
  slug: string;
  tag: string | null;
  plans : ServicePlan[];   
  active: boolean;
  type: string;
  createdAt: Date;
};

async function Page() {
  const services: ServiceListItem[] = await findServices();

  return (
    <div className="w-full mx-auto overflow-x-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
         <h1 className="text-2xl font-bold mb-6">All Services</h1>
         <Button variant={'default'} asChild>
            <Link href={`/admin/services/new`} className="hover:!text-legacisGreen flex items-center gap-2">
              <Plus size={20}/> Add New
            </Link>
         </Button>
      </div>
      <Table containerClass="border p-4 rounded-2xl" className="p-4 rounded-2xl ">
        <TableHeader>
          <TableRow>
            <TableHead>#</TableHead>
            <TableHead>Id</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Order</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Tag</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Active</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {services.map((service, i) => (
            <TableRow key={service.id}>
              <TableCell>{i + 1}</TableCell>
              <TableCell>{service.id}</TableCell>
              <TableCell>{service.name}</TableCell>
              <TableCell>{service.order}</TableCell>
              <TableCell>{service.slug}</TableCell>
              <TableCell>{service.tag}</TableCell>
              <TableCell>₹{service.plans[0]?.price}</TableCell>
              <TableCell>{service.active ? "Yes" : "No"}</TableCell>
              <TableCell>{service.type}</TableCell>
              <TableCell>{formatHumanDate(service.createdAt)}</TableCell>
              <TableCell>
                <Button variant={'outline'} asChild>
                  <Link href={`/admin/services/${service.id}`}>Edit</Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default Page;