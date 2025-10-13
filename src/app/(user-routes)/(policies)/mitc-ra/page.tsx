import { QuillHtmlViewer } from '@/components/richTextViewer'
import { db } from '@/lib/db'
import React from 'react'
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "MITC - RA",
    description: "Most Important Terms and conditon for Legacis Research Advisory.",
};

const Page = async () => {
   const policy = await db.agreement.findFirst({
    where: {
      type: 'POLICY',
      policyType: 'MITC_RA'
      
    },
      orderBy: {
         createdAt: 'desc',
      },
   })

   if (!policy) {
      return (
         <section className="py-16 lg:py-24 px-5 lg:px-10 xl:px-24 flex flex-col items-center justify-center h-full">
            <h1 className='text-xl'>Policy not found</h1>
         </section>
      )
   }

   let delta: any = policy.content;
   if (typeof delta === "string") {
      try {
         delta = JSON.parse(delta);
      } catch {
         delta = { ops: [{ insert: policy.content }] };
      }
   }
   return (
    <section className="py-16 lg:py-24 px-5 lg:px-10 xl:px-24 flex flex-col items-center justify-center h-full">
      <h1 className='text-2xl font-medium mb-8'>{policy?.name}</h1>
      <QuillHtmlViewer
         delta={delta}
         className="max-w-5xl w-full prose dark:prose-invert"
      />
   </section>
  )
}

export default Page