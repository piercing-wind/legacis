import { getAllUsersPurchasedServicesPortfolio } from "@/lib/data/admin/portfolio-review";
import {
   Table,
   TableBody,
   TableCaption,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
} from "@/components/ui/table";
import { PortfolioReviewStatus } from "@/prisma/generated/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import Link from "next/link";

async function Page({ searchParams }: { searchParams?: Record<string, string> }) {
   const params = await searchParams || {};
   const search = params.search?.toLowerCase() || "";
   const status = params.status || "ALL";
   const page = Number(params.page) || 1;
   const USER_PER_PAGE = 20;
   const skip = (page - 1) * USER_PER_PAGE;

   const { items: portfolioReviews, total } = await getAllUsersPurchasedServicesPortfolio({
      search,
      status,
      skip,
      take: USER_PER_PAGE,
   });

   const totalPages = Math.ceil(total / USER_PER_PAGE);

  return (
    <div className="w-full mx-auto overflow-x-auto py-8 px-4">
      <h1 className="text-2xl font-semibold mb-4">Portfolio Reviews</h1>
         {/* Search Form */}
   {/* Search & Status Filter Form */}
      <form method="GET" action="" className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
        <Input
          type="text"
          name="search"
          placeholder="Search by name or email"
          className="border px-3 py-2 rounded w-full sm:w-auto"
          defaultValue={params?.search || ""}
        />
        <Select
          name="status"
          defaultValue={status}
        >
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            {Object.values(PortfolioReviewStatus).map((s) => (
              <SelectItem key={s} value={s}>
                {s.replace(/_/g, " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button type="submit" className="w-full sm:w-auto">Search</Button>
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto"
            asChild
          >
            <Link href="/admin/portfolio-review">
               Clear
            </Link>
          </Button>
        </div>
      </form>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>#</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Uploaded Stock File</TableHead>
            <TableHead>Reviewed File</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {portfolioReviews.map((review, idx) => (
            <TableRow key={review.id}>
               <TableCell>{idx + 1}</TableCell>
              <TableCell>
                  <div className="flex flex-col">
                     <span className="font-medium">{review.user.name}</span>
                     <span>{review.user.email}</span>
                  </div>
              </TableCell>
               <TableCell>
                  <div className="flex flex-col">
                     <span className="text-sm text-muted-foreground">
                        {review.servicePlan?.stockLimit } Stocks
                     </span>
                  </div>
               </TableCell>

              <TableCell>{review.portfolioReview?.status || "No status available"}</TableCell>
              <TableCell>
                {review.portfolioReview?.uploadedFileName ? (
                  <a
                    href={review.portfolioReview.uploadedFileUrl || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    {review.portfolioReview.uploadedFileName}
                  </a>
                ) : (
                  "No file uploaded"
                )}
              </TableCell>
              <TableCell>
                {review.portfolioReview?.reviewedFileName ? (
                  <a
                    href={review.portfolioReview.reviewedFileUrl || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    {review.portfolioReview.reviewedFileName}
                  </a>
                ) : (
                  "No file reviewed"
                )}
              </TableCell>
              <TableCell>
                <Button asChild variant="secondary" className="text-sm">
                  <a href={`/admin/portfolio-review/${review.portfolioReview?.id}`} className="hover:underline">
                    Edit
                  </a>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

       {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            {page > 1 && (
              <PaginationItem>
                <PaginationPrevious href={`?page=${page - 1}`} />
              </PaginationItem>
            )}
            {Array.from({ length: totalPages }, (_, i) => {
              const pageNumber = i + 1;
              return (
                <PaginationItem key={pageNumber}>
                  <PaginationLink
                    href={`?page=${pageNumber}`}
                    isActive={page === pageNumber}
                  >
                    {pageNumber}
                  </PaginationLink>
                </PaginationItem>
              );
            })}
            {page < totalPages && (
              <PaginationItem>
                <PaginationNext href={`?page=${page + 1}`} />
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}

export default Page;