import { getRiskProfileQuestions, getUsersRiskProfile } from "@/lib/data/admin/risk-profile";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { formatHumanDate } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RiskProfileQuestionsAdmin } from "@/components/admin/riskprofile-questions-forms";
import { RiskLevelServiceRecommendationForm } from "@/components/admin/riskLevelRecommendation";
import { findRiskRecommendations } from "@/lib/data/riskLevelServiceRecommendation";
import { findServices } from "@/lib/data/admin/services";

export default async function Page() {
   const [riskProfiles, questions, riskLevelServiceRecommendation, services] = await Promise.all([
      getUsersRiskProfile(),
      getRiskProfileQuestions(),
      findRiskRecommendations(),
      findServices()
   ]);
   
  return (

    <div className="w-full mx-auto overflow-x-auto py-8 px-4">

      <RiskLevelServiceRecommendationForm
         recommendations={riskLevelServiceRecommendation}
         allServices={services.map(service => ({ id: service.id, name: service.name }))}
      />
      
      <RiskProfileQuestionsAdmin
         questions={questions}
      />
      {/* Risk Profiles */}
      <div className="w-full">
         <h1 className="text-2xl font-medium mb-4 w-full">Risk Profiles</h1>
         <div className="rounded-md border w-full ">
         <Table>
            <TableHeader>
               <TableRow>
               <TableHead className="w-[60px]">#</TableHead>
               <TableHead>User</TableHead>
               <TableHead>Email</TableHead>
               <TableHead>Phone</TableHead>
               <TableHead>Risk Level</TableHead>
               <TableHead>Risk %</TableHead>
               <TableHead>Consent</TableHead>
               <TableHead>Completed At</TableHead>
               <TableHead>Updated At</TableHead>
               <TableHead>Response</TableHead>
               </TableRow>
            </TableHeader>
            <TableBody className="text-xs">
               {riskProfiles?.map((profile, index) => (
               <TableRow key={profile.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{profile.user?.name || "N/A"}</TableCell>
                  <TableCell>{profile.user?.email || "N/A"}</TableCell>
                  <TableCell>{profile.user?.phone || "N/A"}</TableCell>
                  <TableCell>{profile.riskLevel}</TableCell>
                  <TableCell>{profile.riskPercentage}%</TableCell>
                  <TableCell>{profile.consentGiven ? 'Yes': 'No'}</TableCell>
                  <TableCell>{formatHumanDate(profile.completedAt)}</TableCell>
                  <TableCell>{formatHumanDate(profile.lastUpdated)}</TableCell>
                  <TableCell>
                     <Button asChild>
                        <Link href={`/admin/risk-profile/${profile.userId}`}>View</Link>
                     </Button>
                     </TableCell>
               </TableRow>
               ))}
            </TableBody>
         </Table>
         {(!riskProfiles || riskProfiles.length === 0) && (
            <div className="text-center py-8">
               <div className="text-muted-foreground">No users have completed the risk profile yet.</div>
            </div>
         )}
         </div>
      </div>
    </div>
  );
}