import { auth } from "@/auth";
import { sendMail } from "@/emails/sendmail";
import { db } from "@/lib/db";
import { ServiceUpdateRequest } from "@/types/service";

export const POST = auth(async (request) => {
   if (!request.auth) throw new Error("Unauthorized");
   const body = await request.json() as ServiceUpdateRequest;
   const user = request.auth.user;
   if (!user || user.role !== 'ADMIN')  throw new Error("Admin access required");

   try {     
      const serviceId = body.serviceId;
      const service = await db.service.findUnique({
         where: { id: serviceId },
         select: {
            id: true,
            name: true,
            type: true,
            purchasedServices :{ 
               where:{
                  expiryDate: { gt:  new Date()},
               },
               select: {
                  user : {
                     select : {
                        email : true,
                        name : true,
                     }
                  }
               }
            }
         }
      })
   
   
     const recipients = service?.purchasedServices.map(ps => ps.user) || [];
   
      if (recipients.length === 0) {
         return new Response(JSON.stringify({ message: "No Subscriber found yet for emails updates" }), { status: 404 });
      }
      for (const recipient of recipients) {
         await sendMail({
            to: recipient.email,
            subject: `Stock Update for ${service?.name}`,
            template: 'serviceUpdate',
            context : {
               name: recipient.name || recipient.email,
               serviceName: service?.name || "Service",
               dashboardUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`,
               title: `Legacis Capital - Stock Update for ${service?.name}`,
               year: new Date().getFullYear(),
            }
         });
      }
   
      return new Response(JSON.stringify({message : "Mails sent successfully!"}), {status: 200});
   } catch (error) {
      console.log("Error in send-stock-update route:", error);
      return new Response(JSON.stringify({ message: "Internal Server Error" }), { status: 500 });
      
   }
})