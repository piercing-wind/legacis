"use client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { useTransition, useState } from "react";
import { deleteMessage } from "@/actions/admin/contact"; // Move your deleteMessage to a separate actions.ts file
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

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
            <TableCell className="max-w-xs">{(msg.message).length > 30 ? msg.message.slice(0, 30) + "..." : msg.message} 
              <Dialog>
                  <DialogTrigger className="text-blue-500 hover:underline">Open</DialogTrigger>
                  <DialogContent className="max-w-2xl mx-auto">
                     <DialogHeader>
                        <DialogTitle>{msg.name}</DialogTitle>
                        <DialogDescription>
                           {msg.message}
                        </DialogDescription>
                     </DialogHeader>
                  </DialogContent>
              </Dialog>
            </TableCell>
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