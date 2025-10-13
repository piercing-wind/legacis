export const dynamic = "force-dynamic";

import { SubmissionTable } from "@/components/periodic-submission-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, MapPin, LifeBuoy } from "lucide-react";
import { Metadata } from "next";
import * as XLSX from "xlsx";

// export const metadata: Metadata = {
//     title: "Contact Us",
//     description: "Get in touch with Legacis Capital, your trusted partner in financial services.",
// };


function excelDateToMonthYear(serial: number) {
    // Excel's epoch starts at 1899-12-30
    const utc_days = Math.floor(serial - 25569);
    const utc_value = utc_days * 86400; // seconds
    const date_info = new Date(utc_value * 1000);
    const month = date_info.toLocaleString('en-US', { month: 'short' });
    const year = date_info.getFullYear();
    return `${month} ${year}`;
}

export default async function PeriodicSubmission() {
    const sheets = [
        { name: "Number of Client Complaints - IA", gid: 0 },
        { name: "Trend of Annual Disposal of Complaints - IA", gid: 1918526893 },
        { name: "Trend of Monthly Disposal of Complaints - IA", gid: 933105541 },
        { name: "Number of Client Complaints - RA", gid: 710067527 },
        { name: "Trend of Annual Disposal of Complaints - RA", gid: 1708744872 },
        { name: "Trend of Monthly Disposal of Complaints - RA", gid: 1137699456 },
        { name: "Investment Advisory Audits", gid: 2026342601 },
    ];

    
    // Use Promise.all to fetch all sheets in parallel
    const sheetData = await Promise.all(
        sheets.map(async ({ gid, name }, index) => {
            const csvUrl = `https://docs.google.com/spreadsheets/d/e/2PACX-1vR1ro2m9_fWWnu1qFpay8r4t48wNPSuMPqGze8PMiZtBkrfN1TDKPArW3XVIYyN8Rcg-ZKMeBfoUllA/pub?gid=${gid}&single=true&output=csv`;
            const res = await fetch(csvUrl, { cache: 'no-store' });
            const csvText = await res.text();

            // Parse CSV using xlsx
            const workbook = XLSX.read(csvText, { type: "string" });
            const sheetName = workbook.SheetNames[0];
            const data: any[][] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });

            const headings = data[0] || [];
            const rows = data.slice(1).map(row =>
                row.map(cell => {
                    if (typeof cell === "number" && cell > 20000 && cell < 60000) {
                        return excelDateToMonthYear(cell);
                    }
                    if (typeof cell === "string" && /^\d{4}-\d{2}-\d{2}/.test(cell)) {
                        const date = new Date(cell);
                        return date.toLocaleString("en-US", { month: "short", year: "numeric" });
                    }
                    return cell;
                })
            );

            return {
                key: `${gid}${index}`,
                name,
                headings,
                rows,
            };
        })
    );


  return (
    <section className="w-full relative px-5 lg:px-10 xl:px-24 flex flex-col gap-10 py-10">
        <h1 className="sm:text-center text-2xl font-semibold">Periodic Submission</h1>
            {sheetData.map(({ key, name, headings, rows }) => (
                <div key={key} className="w-full overflow-x-auto mt-8">
                    <h5 className="mb-4 text-lg font-medium">{name}</h5>
                    <SubmissionTable headings={headings} rows={rows} />
                </div>
            ))}
     
    </section>
  );
}


// // export const dynamic = "force-dynamic";

// import { SubmissionTable } from "@/components/periodic-submission/clientComplaintsTable";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Mail, Phone, MapPin, LifeBuoy } from "lucide-react";
// import { Metadata } from "next";
// import * as XLSX from "xlsx";

// export default async function PeriodicSubmission() {
//     // Fetch the entire workbook
//     const workbookUrl = `https://docs.google.com/spreadsheets/d/e/2PACX-1vR1ro2m9_fWWnu1qFpay8r4t48wNPSuMPqGze8PMiZtBkrfN1TDKPArW3XVIYyN8Rcg-ZKMeBfoUllA/pub?output=xlsx`;
    
//     const workbookRes = await fetch(workbookUrl, {cache: 'no-store'});
//     const workbookBuffer = await workbookRes.arrayBuffer();
//     const workbook = XLSX.read(workbookBuffer, { type: "array" });

//     return (
//         <section className="w-full relative px-5 lg:px-10 xl:px-24 flex flex-col gap-10 py-10">
//             {workbook.SheetNames.map((sheetName, index) => {
//                 const worksheet = workbook.Sheets[sheetName];
//                 const data: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                
//                 const headings = data[0] || [];
//                 const rows = data.slice(1);
                
//                 return (
//                     <div key={index} className="w-full overflow-x-auto">
//                         <h5 className="mb-4 text-lg font-medium">{sheetName}</h5>
//                         <SubmissionTable headings={headings} rows={rows} />
//                     </div>
//                 );
//             })}
//         </section>
//     );
// }