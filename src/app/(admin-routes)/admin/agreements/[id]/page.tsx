import AgreementForm from "@/components/admin/agreement-form";
import { findAgreementById } from "@/lib/data/admin/agreement";

async function Page({params}: { params: Promise<{ id: string }>}) {
   const { id } = await params;
   const agreement = id === "new" ? null : await findAgreementById(id);
   return (
      <div className="py-8 max-w-7xl mx-auto">
         <h1 className="text-2xl font-bold mb-6">
            {agreement ? `Edit Agreement: ${agreement.name}` : "Create New Agreement"}
         </h1>
         <AgreementForm agreement={agreement} />
      </div>
   )
}

export default Page;