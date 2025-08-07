import { getAllServices } from "@/lib/data/admin/combo";
import React from "react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button";
import { Pencil, Plus } from "lucide-react";
import { ComboAttachForm } from "@/components/admin/combo-forms";

async function Page() {
   const allServices = await getAllServices();
   
   const servicesWithComplimentary = allServices.filter(service =>
    service.complimentaryService.length > 0
   ).map(service => ({
    ...service,
    complimentaryService: service.complimentaryService.map(cs => cs.complimentaryService)
   }));

  return (
    <div className="w-full mx-auto overflow-x-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
         <h1 className="text-2xl font-bold mb-6">Combo Services</h1>
         <Dialog>
            <DialogTrigger asChild>
               <Button className="flex items-center gap-2">
                  <Plus size={20}/>Create Combo
               </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
               <DialogHeader>
                  <DialogTitle>Create Combo Plan</DialogTitle>
               </DialogHeader>
               <ComboAttachForm
                  allServices={allServices}
               />
            </DialogContent>
         </Dialog>
      </div>
      {servicesWithComplimentary.length === 0 ? (
        <p className="text-gray-500">No combo services found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {servicesWithComplimentary.map(service => (
            <div
              key={service.id}
              className="bg-card dark:bg-neutral-900 border rounded-xl shadow-sm p-6 flex flex-col gap-3"
            >
              <div className="text-lg font-semibold flex items-center justify-between">
                  <span>{service.name}</span>
                  <Dialog>
                     <DialogTrigger asChild>
                        <Button variant={'ghost'} className="flex items-center gap-2">
                           <Pencil size={20}/>Edit
                        </Button>
                     </DialogTrigger>
                     <DialogContent className="sm:max-w-2xl">
                        <DialogHeader>
                           <DialogTitle>Edit Combo Plan</DialogTitle>
                        </DialogHeader>
                        <ComboAttachForm
                           allServices={allServices}
                           editServiceId={service.id}
                        />
                     </DialogContent>
                  </Dialog>
               </div>
              <div className="text-xs text-gray-500 mb-2">Complimentary Services:</div>
              <div className="flex flex-wrap gap-2">
                {service.complimentaryService.length === 0 ? (
                  <span className="text-gray-400 text-sm">None</span>
                ) : (
                  service.complimentaryService.map(cs => (
                    <Badge
                      key={cs.id}
                      variant="secondary"
                      className="text-xs font-medium px-3 py-1"
                    >
                      {cs.name}
                    </Badge>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Page;