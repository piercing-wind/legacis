import { sendMail } from "@/emails/sendmail";
import { db } from "@/lib/db";
import { formatDateWithTime } from "@/lib/utils";

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
   let subsUpdated = 0;

   for (const sub of expiredSubs) {
      try {
         if (
         sub.user?.email &&
         sub.service?.name &&
         sub.expiryDate &&
         sub.service?.slug
         ) {
         const serviceUrl = `https://legaciscapital.com/services/${sub.service.slug}`;
         const dashboardUrl = `https://legaciscapital.com/dashboard`;

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
         expiredIds.push(sub.id);
         emailsSent++;
         } else {
            console.log(
               `⚠️  Skipping subscription ${sub.id} - missing required data`
            );
         }
      } catch (emailError) {
         console.error(`❌ Failed to process subscription ${sub.id}:`, emailError);
      }
   }

      // Bulk update all expired subscriptions to inactive
      if (expiredIds.length > 0) {
         const updateResult = await db.userPurchasedServices.updateMany({
            where: { id: { in: expiredIds } },
            data: { isActive: false },
         });
         subsUpdated = updateResult.count ?? expiredIds.length;
      }

      return new Response(
         JSON.stringify({
            message: "Cron job executed successfully",
            emailsSent,
            subsUpdated,
            expiredIds,
            timestamp: new Date().toISOString(),
         }),
         {
            status: 200,
            headers: { "Content-Type": "application/json" },
         }
      );
}
