"use client";
import React from "react";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { createPlatinaPortfolio } from "@/actions/admin/create-platina-portfolio";
import { useRouter } from "next/navigation";

const CreatePlatinaPortfolio = ({ userId, platinaServiceId }: { userId: string; platinaServiceId: string; }) => {
   const router = useRouter();
   const handleCreatePortfolio = async () => {
      // Logic to create a new Platina portfolio
      try {
         const result = await createPlatinaPortfolio(userId, platinaServiceId);
         if (result.success) {
            toast.success(result.message, {
               description: "Refreshing the page...",
            });
            router.refresh();
         } else {
            toast.error(result.message);
         }
      } catch (error) {
         toast.error("Failed to create portfolio. Please try again.");
      }
   };
   return (
      <div>
         <Button onClick={handleCreatePortfolio}>
            <Plus className="w-4 h-4 mr-2" />
            Create Portfolio
         </Button>
      </div>
   );
};

export default CreatePlatinaPortfolio;
