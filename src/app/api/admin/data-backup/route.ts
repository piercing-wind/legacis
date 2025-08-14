// import { auth } from "@/auth";
// import { exec } from "child_process";
// import { NextResponse } from "next/server";

// export const POST = auth(async (request) => {
//   if (!request.auth) throw new Error("Unauthorized");
//   const user = request.auth.user;
//   if (!user || user.role !== 'ADMIN') throw new Error("Admin access required");

//   const { type } = await request.json(); // type: "data" or "full"

//   // Parse DB connection info from DATABASE_URL
//   const dbUrl = process.env.DATABASE_URL || "";
//   const match = dbUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):([0-9]+)\/([^?]+)/);
//   if (!match) throw new Error("Invalid DATABASE_URL");

//   const [, dbUser, dbPass, dbHost, dbPort, dbName] = match;

//   // Set env for password
//   process.env.PGPASSWORD = dbPass;

//   // Build pg_dump command
//   let dumpCmd = "";
//   if (type === "data") {
//     dumpCmd = `pg_dump --data-only --no-owner --no-privileges -h ${dbHost} -p ${dbPort} -U ${dbUser} ${dbName}`;
//   } else {
//     dumpCmd = `pg_dump --no-owner --no-privileges -h ${dbHost} -p ${dbPort} -U ${dbUser} ${dbName}`;
//   }

//   return new Promise((resolve, reject) => {
//     exec(dumpCmd, { env: process.env }, (error, stdout, stderr) => {
//       if (error) {
//         resolve(new NextResponse(stderr, { status: 500 }));
//       } else {
//         resolve(new NextResponse(stdout, {
//           headers: {
//             "Content-Type": "application/sql",
//             "Content-Disposition": `attachment; filename=backup_${type}_${Date.now()}.sql`,
//           },
//         }));
//       }
//     });
//   });
// });