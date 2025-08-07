import { UserEditForm } from "@/components/admin/user-edit-form";
import { findUserById } from "@/lib/data/admin/users";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const user = id === "new" ? null : await  findUserById(id);

    return (
      <div className="p-8 max-w-7xl mx-auto py-14 mb-14">
         <h1 className="text-2xl font-bold mb-12">{user ? `Edit User: ${user.name}` : "Create New User"}</h1>
         <UserEditForm user={user} />
      </div>
    )
}