import { Authentication } from "@/components/auth/auth-page";
import Login from "@/components/auth/login";
import { Suspense } from "react";

export function Page() {
   return (
      <main className='w-full min-h-screen px-5 lg:px-10 xl:px-24 py-14'>
         <section className="relative max-w-5xl w-full mx-auto h-full flex items-center justify-center">
            <Suspense>
               <Authentication />
            </Suspense>
         </section>
      </main>
   );
}

export default Page;