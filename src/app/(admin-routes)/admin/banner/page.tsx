import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatHumanDate } from "@/lib/utils";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { findBanners } from "@/lib/data/admin/banner";
import { Banner } from "@/prisma/generated/client";

async function Page() {
  const banners = await findBanners();

  return (
    <div className="w-full mx-auto overflow-x-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
         <h1 className="text-2xl font-bold mb-4">Legacis Banners</h1>
         <Button variant={'default'} asChild>
            <Link href={`/admin/banner/new`} className="hover:!text-legacisGreen flex items-center gap-2">
              <Plus size={20}/> Add New
            </Link>
         </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>#</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Text</TableHead>
            <TableHead>Image</TableHead>
            <TableHead>Button</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Start</TableHead>
            <TableHead>End</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {banners.map((banner: Banner, i: number) => (
            <TableRow key={banner.id}>
              <TableCell>{i+1}</TableCell>
              <TableCell className="font-medium">{banner.title}</TableCell>
              <TableCell className="text-xs">{banner.text}</TableCell>
              <TableCell>
                <Image
                  src={banner.imageUrl || "/placeholder.png"}
                  alt={banner.title}
                  width={100}
                  height={56}
                  className="rounded-md overflow-clip"
                  style={{ objectFit: "cover" }}
                  loading="lazy"
                />
              </TableCell>
              <TableCell>
                <Link href={banner.buttonUrl} target="_blank" className="underline text-legacisPurple">
                  {banner.buttonLabel}
                </Link>
              </TableCell>
              <TableCell>
                {banner.isActive ? (
                  <span className="px-2 py-1 rounded bg-green-100 text-green-700 text-xs">Active</span>
                ) : (
                  <span className="px-2 py-1 rounded bg-neutral-100 text-neutral-700 text-xs">Inactive</span>
                )}
              </TableCell>
              <TableCell>{banner.startDate ? formatHumanDate(banner.startDate) : "-"}</TableCell>
              <TableCell>{banner.endDate ? formatHumanDate(banner.endDate) : "-"}</TableCell>
              <TableCell>{formatHumanDate(banner.createdAt)}</TableCell>
              <TableCell>{formatHumanDate(banner.updatedAt)}</TableCell>
              <TableCell>
                <Button variant={'outline'} asChild>
                  <Link href={`/admin/banner/${banner.id}`}>
                    Edit
                  </Link>
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
export const dynamic = "force-dynamic";