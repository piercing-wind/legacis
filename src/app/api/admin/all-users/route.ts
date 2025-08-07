import { auth } from "@/auth";
import { db } from "@/lib/db";
import ExcelJS from "exceljs";


export const POST = auth(async (request) => {
   if (!request.auth) throw new Error("Unauthorized");
   const user = request.auth.user;

   if (!user || user.role !== 'ADMIN')  throw new Error("Admin access required");
   const users = await db.user.findMany({
      orderBy: { createdAt: "desc" },
      include:{
         panVerificationData: true,
      }
   });

   
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Users");

   users.forEach((user) => {
    worksheet.addRow({
      name: user.name,
      email: user.email,
      phone: user.phone,
      username: user.username,
      dob: user.dob,
      role: user.role,
      createdAt: user.createdAt,
      pan: user.pan,
      panStatus: user.panVerificationData?.status ?? "",
      aadharNumber: user.aadharNumber,
      gstin: user.gstin,
      address: user.address,
      state: user.state,
      city: user.city,
      zip: user.zip,
      isBanned: user.isBanned ? "Yes" : "No",
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return new Response(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": "attachment; filename=users.xlsx",
    },
  });
})