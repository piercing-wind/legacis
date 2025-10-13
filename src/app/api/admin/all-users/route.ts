import { auth } from "@/auth";
import { db } from "@/lib/db";
import { convertUTCToIST, formatDateWithTime } from "@/lib/utils";
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

  worksheet.columns = [
  { header: 'Name', key: 'name', width: 20 },
  { header: 'Email', key: 'email', width: 25 },
  { header: 'Phone', key: 'phone', width: 15 },
  { header: 'Username', key: 'username', width: 18 },
  { header: 'DOB', key: 'dob', width: 12 },
  { header: 'Role', key: 'role', width: 10 },
  { header: 'Created At', key: 'createdAt', width: 20 },
  { header: 'PAN', key: 'pan', width: 15 },
  { header: 'PAN Status', key: 'panStatus', width: 12 },
  { header: 'Aadhar Number', key: 'aadharNumber', width: 18 },
  { header: 'GSTIN', key: 'gstin', width: 18 },
  { header: 'Address', key: 'address', width: 30 },
  { header: 'State', key: 'state', width: 15 },
  { header: 'City', key: 'city', width: 15 },
  { header: 'ZIP', key: 'zip', width: 10 },
  { header: 'Is Banned', key: 'isBanned', width: 10 },
  { header: 'Created At', key: 'created', width: 8 }
];

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
      created: formatDateWithTime(user.createdAt),
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