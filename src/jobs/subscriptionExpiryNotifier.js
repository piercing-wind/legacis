require("dotenv").config();
const cron = require("node-cron");
const fs = require("fs");
const path = require("path");

function startCronJob() {
  const apiUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/cron/expiry-notify`;
  const authToken = process.env.CRON_AUTH_TOKEN;
  const logFile = path.resolve(
    process.env.HOME || process.env.USERPROFILE,
    "Documents",
    "cron-response.log"
  );
  // 0 18 * * * means every day at 12 AM IST (18:00 UTC)
  cron.schedule("0 18 * * *", async () => {
    try {
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      });

      let logEntry = `[${new Date().toISOString()}] Status: ${response.status}\n`;
      try {
        const json = await response.json();
        logEntry += `Result: ${JSON.stringify(json)}\n`;
      } catch {
        const text = await response.text();
        logEntry += `Result: ${text}\n`;
      }
      fs.appendFileSync(logFile, logEntry);

      if (!response.ok) {
        throw new Error(`Failed to trigger API: ${response.statusText}`);
      }
    } catch (error) {
      const errorLog = `[${new Date().toISOString()}] ERROR: ${error.message}\n`;
      fs.appendFileSync(logFile, errorLog);
      console.error("💥 Error in subscription expiry notifier job:", error);
    }
  });
}

startCronJob();
console.log("⏱️  Cron job scheduled. Press Ctrl+C to stop.");