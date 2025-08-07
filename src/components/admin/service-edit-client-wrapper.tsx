"use client";
import { useState } from "react";
import ServiceEditForm from "./service-edit-form";
import { ResearchAdvisoryStockListForm } from "./stock-forms/research-advisory-form";
import { ServiceWithStocksAndAgreements } from "@/lib/data/admin/services";
import { AgreementIdName } from "@/lib/data/admin/agreement";
import { ServiceListItem } from "@/app/(admin-routes)/admin/services/page";
import { ResearchAdvisoryModelPortfolioStockListForm } from "./stock-forms/research-advisory-model-portfolio-form";
import { ResearchAdvisoryMutualFundStockListForm } from "./stock-forms/research-advisory-mutul-funds-form";
import { Button } from "../ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ServiceEditClientWrapper({
  service,
  services,
  agreement,
}: {
  service?: ServiceWithStocksAndAgreements | null;
  services : ServiceListItem[];
  agreement: AgreementIdName[];
}) {
   const router = useRouter();
  const [selectedType, setSelectedType] = useState("");

  const filteredServices = services.filter((s) => s.type === selectedType)
   .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); 

  return (
    <>
      <div className="flex justify-between mb-6 w-full">
         <div className="flex items-center gap-4">
            <Button asChild>
               <Link href={'/admin/services'} className="flex items-center gap-2 hover:!text-legacisGreen"> <ArrowLeft size={20}/> Back </Link>
            </Button>
            {service && service.type !== 'PLATINA_WEALTH' && service.type !== 'PORTFOLIO_REVIEW' && (
               <Button asChild>
                  <Link href={'#stocklist'} className="flex items-center gap-2 hover:!text-legacisGreen">
                     Edit Stocks
                  </Link>
               </Button>
            )}
         </div>
         <h1 className="text-2xl font-bold mb-6">{service?.name || 'New Service'}</h1>
      </div>
      <ServiceEditForm
        service={service}
        agreement={agreement}
        onTypeChange={setSelectedType}
      />
      {service && selectedType === "RESEARCH_ADVISORY" && (
         <div id="stocklist" className="my-8 w-full h-screen border-t-4 p-4">
            <h2  className="text-xl font-medium mb-4">{service.name} Stock List</h2>
            <ResearchAdvisoryStockListForm
               serviceId={service?.id}
               services={filteredServices}
               initialStocks={service?.researchAdvisoryStockList}
            />
         </div>
      )}
      {service && selectedType === "RESEARCH_ADVISORY_MODEL_PORTFOLIO" && (
         <div id="stocklist" className="my-8 w-full h-screen border-t-4 p-4">
            <h2  className="text-xl font-medium mb-4">{service.name} Stock List</h2>
            <ResearchAdvisoryModelPortfolioStockListForm
               serviceId={service?.id}
               services={filteredServices}
               initialStocks={service?.researchAdvisoryModelPortfolioStockList}
            />
         </div>
      )}
      {service && selectedType === "RESEARCH_ADVISORY_MUTUAL_FUNDS" && (
         <div id="stocklist" className="my-8 w-full h-screen border-t-4 p-4">
            <h2  className="text-xl font-medium mb-4">{service.name} Stock List</h2>
            <ResearchAdvisoryMutualFundStockListForm
               serviceId={service?.id}
               services={filteredServices}
               initialStocks={service?.researchAdvisoryMutualFundStockList}
            />
         </div>
      )}
    </>
  );
}
