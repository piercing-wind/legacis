import { findUsers, userCount } from "@/lib/data/admin/users";
import { UserList } from "@/components/admin/user-list";
import { identifyInputType } from "@/lib/utils";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

type PageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

async function Page({ searchParams }: PageProps) {
  const USER_PER_PAGE = 20;

  const params = await searchParams;
  const identifier = params?.identifier as string | undefined;
  const page = Number(params?.page) || 1;

  const skip = (page - 1) * USER_PER_PAGE;

  let users;
  let totalUsers;
  if (identifier && identifier.trim() !== "") {
    const type = identifyInputType(identifier);
    users = await findUsers({ type, value: identifier }, skip, USER_PER_PAGE);
    totalUsers = users.length;
  } else {
    const [usersResult, countResult] = await Promise.all([
      findUsers(undefined, skip, USER_PER_PAGE),
      userCount(),
    ]);
    users = usersResult;
    totalUsers = countResult;
  }
  const totalPages = Math.ceil(totalUsers / USER_PER_PAGE);

  return (
    <div className="w-full mx-auto overflow-x-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Users</h1>
      <UserList users={users} />
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
