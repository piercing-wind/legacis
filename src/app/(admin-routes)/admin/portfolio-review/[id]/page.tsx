import AdminPortfolioReviewForm from "@/components/admin/portfolio-review-form";
import { getPortfolioReviewById } from "@/lib/data/admin/portfolio-review";

export default async function UserPlatinaDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const review = await getPortfolioReviewById(id);
   if(!review) {
      return <div className="p-4">Portfolio review not found.</div>;
   }

  return (
   <div className="max-w-7xl mx-auto p-4 overflow-x-auto">
         <AdminPortfolioReviewForm
              portfolioReview={review}
         />
   </div>
  );
}
