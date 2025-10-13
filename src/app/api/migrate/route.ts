// this is temporary, will be removed after migration is done

import { db } from "@/lib/db";

export async function GET(request: Request) {
    const stock = await db.researchAdvisoryStockList.findMany({
        select: {
            id: true,
            entryDate: true,
            exitDate: true,
        }
    });

    // Add 5 hours 30 minutes to entryDate and exitDate for each record
    const updated = [];
    for (const s of stock) {
        const newEntryDate = s.entryDate
            ? new Date(new Date(s.entryDate).getTime() - 5.5 * 60 * 60 * 1000)
            : null;
        const newExitDate = s.exitDate
            ? new Date(new Date(s.exitDate).getTime() - 5.5 * 60 * 60 * 1000)
            : null;

        await db.researchAdvisoryStockList.update({
            where: { id: s.id },
            data: {
                entryDate: newEntryDate,
                exitDate: newExitDate,
            },
        });

        updated.push({
            id: s.id,
            entryDate: newEntryDate,
            exitDate: newExitDate,
        });
    }

    console.log("Updated stock list, total:", updated.length);
    return new Response(JSON.stringify(updated));
}