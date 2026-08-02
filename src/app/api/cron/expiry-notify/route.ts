import { investment_advisory_services } from "@/constant/service_categorized";
import { sendMail } from "@/emails/sendmail";
import { db } from "@/lib/db";
import { formatDateWithTime } from "@/lib/utils";
import { sendExpirySMS } from "@/sms/sms";

export async function GET(request: Request) {

   const authHeader = request.headers.get("authorization");
   const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;
   
   if( token !== process.env.CRON_AUTH_TOKEN ) {
      return new Response("Unauthorized", { status: 401 });
   }
   const expiredSubs = await db.userPurchasedServices.findMany({
      where: {
         expiryDate: { lte: new Date() },
         isActive: true,
         service: {
         type: { not: "PORTFOLIO_REVIEW" }, // exclude portfolio review services
         },
      },
      include: {
         user: true,
         service: true,
      },
   });
   
   const expiredIds: string[] = [];

   let emailsSent = 0;
   let emailsFailed = 0;
   let smsSent = 0;
   let smsFailed = 0;
   let subsUpdated = 0;

   for (const sub of expiredSubs) {
        /*
         * The subscription is already expired according to expiryDate.
         * Notification success should not decide whether it becomes inactive.
         */
      expiredIds.push(sub.id);

      if (
      sub.user?.email &&
      sub.service?.name &&
      sub.expiryDate &&
      sub.service?.slug
      ) {
         
      const serviceUrl = `https://legaciscapital.com/${investment_advisory_services.includes(sub.service.type) ? 'ia-services' : 'ra-services'}/${sub.service.slug}`;
      const dashboardUrl = `https://legaciscapital.com/dashboard`;
         try {
            await sendMail({
               to: sub.user.email,
               subject: `Legacis - Your subscription for ${sub.service.name} has expired`,
               template: "subscriptionExpiry",
               context: {
                  customerName: sub.user.name || sub.user.email,
                  serviceName: sub.service.name,
                  expiryDate: formatDateWithTime(sub.expiryDate),
                  serviceUrl,
                  dashboardUrl,
                  year: new Date().getFullYear(),
                  title: "Subscription Expired",
               },
            });
            emailsSent++;

         } catch (error) {
            emailsFailed++;
            console.error("[Expiry email failed]", {
               subscriptionId: sub.id,
               userId: sub.user.id,
               name: error instanceof Error ? error.name : "UnknownError",
               message:
                  error instanceof Error ? error.message : String(error),
            });
         }
         
      } else {
         console.warn("[Expiry email skipped]", {
            subscriptionId: sub.id,
            reason: "Missing email or service information",
         });
      }
      
      if(sub.user.phone && sub.user.phone.length >=10){
         try{
            await sendExpirySMS({
               userName: sub.user.name?.slice(0, 28) || "User",
               serviceName: sub.service?.name?.slice(0, 28) || "Service",
               phoneNumber: sub.user.phone
            })
            smsSent++
         }catch(error){
            smsFailed++;

            const cause =
               error instanceof Error &&
               error.cause &&
               typeof error.cause === "object" &&
               "code" in error.cause
                  ? String(error.cause.code)
                  : undefined;

            console.error("[Expiry SMS failed]", {
               subscriptionId: sub.id,
               userId: sub.user.id,
               name: error instanceof Error ? error.name : "UnknownError",
               message:
                  error instanceof Error ? error.message : String(error),
               cause,
            });
         }

         } else {
            console.warn("[Expiry SMS skipped]", {
               subscriptionId: sub.id,
               reason: "Missing or invalid phone number",
            });
         }
         
      }

   // Bulk update all expired subscriptions to inactive 
   if (expiredIds.length > 0) {
      const updateResult =
         await db.userPurchasedServices.updateMany({
         where: {
            id: {
               in: expiredIds,
            },
         },
         data: {
            isActive: false,
         },
         });

      subsUpdated = updateResult.count;
   }
      
   return Response.json({
      message: "Cron job executed successfully",
      expiredFound: expiredSubs.length,
      emailsSent,
      emailsFailed,
      smsSent,
      smsFailed,
      subsUpdated,
      expiredIds,
      timestamp: new Date().toISOString(),
   });
}
