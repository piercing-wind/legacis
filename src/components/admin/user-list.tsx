"use client";
import React, { useState } from "react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { panVerificationData, User } from "@/prisma/generated/client";
import { identifyInputType } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Input } from "../ui/input";
import * as XLSX from "xlsx";
import { Plus } from "lucide-react";

export const UserList = ({
  users,
}: {
  users: (User & { panVerificationData: panVerificationData | null })[];
}) => {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const value = search.trim();
    if (value) {
      router.push(`?identifier=${encodeURIComponent(value)}`);
    } else {
      router.push("?");
    }
  };
  const handleExport = () => {
   // Prepare data for export (flatten nested objects if needed)
   const exportData = users.map(user => ({
      Name: user.name,
      Email: user.email,
      Phone: user.phone,
      Username: user.username,
      DOB: user.dob,
      Role: user.role,
      Created: formatHumanDate(user.createdAt),
      PAN: user.pan,
      PANStatus: user.panVerificationData?.status ?? "",
      Aadhar: user.aadharNumber,
      GST: user.gstin,
      Address: user.address,
      State: user.state,
      City: user.city,
      Zip: user.zip,
      Banned: user.isBanned ? "Yes" : "No",
   }));

   const worksheet = XLSX.utils.json_to_sheet(exportData);
   const workbook = XLSX.utils.book_new();
   XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
   XLSX.writeFile(workbook, "Legacis_Users.xlsx");
  };

  const handleExportAll = async () => {
      const res = await fetch("/api/admin/all-users", {
         method: "POST",
         headers: {
            "Content-Type": "application/json",
         },
         body: JSON.stringify({}), // You can send filters here if needed
      });

      if (!res.ok) {
         alert("Failed to export users.");
         return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Legacis_Users_All.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
  };
  
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
         <form onSubmit={handleSearch} className="mb-4 flex gap-2">
         <Input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by username, email, or phone"
            className="border rounded px-3 py-2 w-72 placeholder:text-xs"
         />
         <Button type="submit">Search</Button>
         <Button
            type="button"
            variant="outline"
            onClick={() => {
               setSearch("");
               router.push("?");
            }}
         >
            Reset
         </Button>
         </form>
         <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={handleExportAll}>
            Export to Excel All
            </Button>
            <Button type="button" variant="secondary" onClick={handleExport}>
                Export to Excel
            </Button>
         <Button variant={'default'} asChild>
            <Link href={`/admin/users/new`} className="hover:!text-legacisGreen flex items-center gap-2">
               <Plus size={20}/> Add New User
            </Link>
         </Button>

         </div>
      </div>
      <Table
        containerClass="border p-4 rounded-2xl"
        className="p-4 rounded-2xl text-xs"
      >
        <TableHeader>
          <TableRow>
            <TableHead>#</TableHead>
            <TableHead>Profile</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Username</TableHead>
            <TableHead>D O B</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>PAN</TableHead>
            <TableHead>PAN Response</TableHead>
            <TableHead>PAN Verified</TableHead>
            <TableHead>PAN Status</TableHead>
            <TableHead>Aadhar</TableHead>
            <TableHead>GST</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>State</TableHead>
            <TableHead>City</TableHead>
            <TableHead>Zip</TableHead>
            <TableHead>Banned</TableHead>
            <TableHead>Edit</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user, i) => (
            <TableRow key={user.id}>
              <TableCell>{i + 1}</TableCell>
              <TableCell>
                <Avatar>
                  <AvatarImage src={user.image || "/icons/favicon.ico"} />
                  <AvatarFallback>DP</AvatarFallback>
                </Avatar>
              </TableCell>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.phone}</TableCell>
              <TableCell>@{user.username}</TableCell>
              <TableCell>{user.dob ? user.dob : "-"}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell>{formatHumanDate(user.createdAt)}</TableCell>
              <TableCell>{user.pan}</TableCell>
              <TableCell>
                <Dialog>
                  <DialogTrigger className="bg-purple-50 dark:text-neutral-800 p-1 px-4 rounded">
                    See
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>
                        Data Returned By PAN Verification API.
                      </DialogTitle>
                    </DialogHeader>
                    <pre className="whitespace-pre-wrap break-all text-xs">
                      {user.panVerificationData?.result
                        ? JSON.stringify(
                            user.panVerificationData.result,
                            null,
                            2
                          )
                        : "-"}
                    </pre>
                  </DialogContent>
                </Dialog>
              </TableCell>
              <TableCell>
                {user.panVerified ? formatHumanDate(user.panVerified) : "No"}
              </TableCell>
              <TableCell>{user.panVerificationData?.status ?? "N/A"}</TableCell>
              <TableCell>{user.aadharNumber}</TableCell>
              <TableCell>{user.gstin ? user.gstin : "-"}</TableCell>
              <TableCell>{user.address ?? "-"}</TableCell>
              <TableCell>{user.state ?? "-"}</TableCell>
              <TableCell>{user.city ?? "-"}</TableCell>
              <TableCell>{user.zip ?? "-"}</TableCell>
              <TableCell>{user.isBanned ? "Yes" : "No"}</TableCell>
              <TableCell>
                <Button variant={"outline"} asChild>
                  <Link href={`/admin/users/${user.id}`}>Edit</Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};