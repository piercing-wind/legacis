import BannerForm from "@/components/admin/bannerForm";
import { findBannerById } from "@/lib/data/admin/banner";

async function Page({params}: { params: Promise<{ id: string }>}) {
   const { id } = await params;
   const banner = id === "new" ? null : await findBannerById(id);
   return (
      <div className="p-8 w-full">
         <BannerForm  banner={banner} />
      </div>
   )
}

export default Page;