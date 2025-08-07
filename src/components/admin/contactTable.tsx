"use client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { useTransition, useState } from "react";
import { deleteMessage } from "@/actions/admin/contact"; // Move your deleteMessage to a separate actions.ts file

export function ContactTable({ initialMessages }: { initialMessages: any[] }) {
  const [messages, setMessages] = useState(initialMessages);
  const [isPending, startTransition] = useTransition();

  const handleDelete = (id: string) => {
    startTransition(async () => {
      await deleteMessage(id);
      setMessages(msgs => msgs.filter(m => m.id !== id));
    });
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>Message</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {messages.map(msg => (
          <TableRow key={msg.id}>
            <TableCell>{msg.name}</TableCell>
            <TableCell>{msg.email}</TableCell>
            <TableCell>{msg.phone}</TableCell>
            <TableCell className="max-w-xs truncate">{msg.message}</TableCell>
            <TableCell>{new Date(msg.createdAt).toLocaleString()}</TableCell>
            <TableCell>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                aria-label="Delete"
                className="text-red-500 hover:bg-red-50"
                onClick={() => handleDelete(msg.id)}
                disabled={isPending}
              >
                <Trash size={16} />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}