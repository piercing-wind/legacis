import { db } from "@/lib/db";
import { ContactTable } from "@/components/admin/contactTable";

export default async function Page() {
  const messages = await db.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="py-8 w-full px-4">
      <h1 className="text-2xl font-bold mb-6">Contact Messages</h1>
      <ContactTable initialMessages={messages} />
      {messages.length === 0 && (
        <div className="text-center text-gray-500 mt-8">No messages found.</div>
      )}
    </div>
  );
}