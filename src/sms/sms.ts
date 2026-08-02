type SmsRequest = {
  operation: "OTP" | "EXPIRY" | "UPDATE";
  phoneNumber: string;
  text: string;
  templateId: string;
};

function requiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

function getErrorDetails(error: unknown) {
  if (!(error instanceof Error)) {
    return {
      name: "UnknownError",
      message: String(error),
    };
  }

  const cause = error.cause as
    | {
      name?: string;
      message?: string;
      code?: string;
    }
    | undefined;

  return {
    name: error.name,
    message: error.message,
    causeName: cause?.name,
    causeMessage: cause?.message,
    causeCode: cause?.code,
  };
}

async function sendSMS({ operation, phoneNumber, text, templateId }: SmsRequest) {
  const baseUrl = requiredEnv("SMS_GATEWAYHUB_URL");
  const apiKey = requiredEnv("SMS_GATEWAYHUB_API_KEY");
  const senderId = requiredEnv("SMS_GATEWAYHUB_SENDER_ID");
  const entityId = requiredEnv("DLT_ENTITY_ID");

  const normalizedBaseUrl = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;

  const url = new URL("SendSMS", normalizedBaseUrl);

  url.search = new URLSearchParams({
    APIKey: apiKey,
    senderid: senderId,
    channel: "2",
    DCS: "0",
    flashsms: "0",
    number: phoneNumber,
    text,
    route: "47",
    EntityId: entityId,
    dlttemplateid: templateId,
  }).toString();

  const startedAt = Date.now();

  try {
    const response = await fetch(url, {
      method: "GET",
      cache: "no-store",

      // OTP/SMS should not leave the request hanging indefinitely.
      signal: AbortSignal.timeout(10_000), // 10 seconds timeout

      headers: {
        Accept: "application/json",
      },
    });

    const responseBody = await response.text();

    if (!response.ok) {
      throw new Error(`SMS gateway returned HTTP ${response.status}`);
    }

    let data: unknown;

    try {
      data = JSON.parse(responseBody);
    } catch {
      throw new Error(`SMS gateway returned an invalid JSON response`);
    }

    console.info("[SMS gateway succeeded]", {
      operation,
      status: response.status,
      durationMs: Date.now() - startedAt,
    });

    return data;
  } catch (error) {
    /*
     * Never log the full URL. It contains:
     * - API key
     * - phone number
     * - OTP/message text
     */
    console.error("[SMS gateway failed]", {
      operation,
      durationMs: Date.now() - startedAt,
      ...getErrorDetails(error),
    });

    throw error;
  }
}

export const sendOTPSMS = async ({ phoneNumber, otp, type }: { phoneNumber: string; otp: string; type: string }) => {
  const text =
    `Dear User, Please use OTP ${otp} for ${type}. ` +
    `Do not share it with anyone! ` +
    `Team Legacis - Samar Wealth Advisors`;

  return sendSMS({
    operation: "OTP",
    phoneNumber,
    text,
    templateId: requiredEnv("DLT_SMS_TEMPLATE_ID"),
  });
};

export const sendExpirySMS = async ({
  userName,
  serviceName,
  phoneNumber,
}: {
  userName: string;
  serviceName: string;
  phoneNumber: string;
}) => {
  const text =
    `Dear ${userName},Your subscription to ${serviceName} has expired.` +
    `“The best investment you can make is in yourself.” — Warren Buffett | ` +
    `Renew now to continue receiving stock recommendations. ` +
    `https://legaciscapital.com/services?q=${serviceName} ` +
    `Team Legacis - Samar Wealth Advisors`;

  return sendSMS({
    operation: "EXPIRY",
    phoneNumber,
    text,
    templateId: requiredEnv("DLT_SMS_EXPIRY_TEMPLATE_ID"),
  });
};

export const sendUpdateSMS = async ({
  userName,
  serviceName,
  phoneNumber,
}: {
  userName: string;
  serviceName: string;
  phoneNumber: string;
}) => {
  const text =
    `Dear ${userName}, There has been an update ` +
    `(new stock recommendation or exit) in your ${serviceName} subscription.` +
    `Please review the update to stay aligned with the strategy. ` +
    `https://legaciscapital.com/dashboard ` +
    `Team Legacis - Samar Wealth Advisors`;

  return sendSMS({
    operation: "UPDATE",
    phoneNumber,
    text,
    templateId: requiredEnv("DLT_SMS_UPDATES_TEMPLATE_ID"),
  });
};

// type SmsRequest = {
//   operation: "OTP" | "EXPIRY" | "UPDATE";
//   phoneNumber: string;
//   text: string;
//   templateId: string;
// };

// export const sendOTPSMS = async ({phoneNumber, otp, type}:{phoneNumber: string, otp: string, type: string}) => {

//    const text = `Dear User, Please use OTP ${otp} for ${type}. Do not share it with anyone! Team Legacis - Samar Wealth Advisors`;
//    const url = `${process.env.SMS_GATEWAYHUB_URL}/SendSMS?` +
//     `APIKey=${process.env.SMS_GATEWAYHUB_API_KEY}` +
//     `&senderid=${process.env.SMS_GATEWAYHUB_SENDER_ID}` +
//     `&channel=2` +
//     `&DCS=0` +
//     `&flashsms=0` +
//     `&number=${phoneNumber}` +
//     `&text=${encodeURIComponent(text)}` +
//     `&route=47` +
//     `&EntityId=${process.env.DLT_ENTITY_ID}` +
//     `&dlttemplateid=${process.env.DLT_SMS_TEMPLATE_ID}`;

//   const result = await fetch(url);
//   const data = await result.json();
//   return data;
// };

// export const sendExpirySMS = async ({userName, serviceName, phoneNumber}:{userName: string, serviceName: string, phoneNumber: string}) => {
//   const text = `Dear ${userName},Your subscription to ${serviceName} has expired.“The best investment you can make is in yourself.” — Warren Buffett | Renew now to continue receiving stock recommendations. https://legaciscapital.com/services?q=${serviceName} Team Legacis - Samar Wealth Advisors`;
//   const url = `${process.env.SMS_GATEWAYHUB_URL}/SendSMS?` +
//     `APIKey=${process.env.SMS_GATEWAYHUB_API_KEY}` +
//     `&senderid=${process.env.SMS_GATEWAYHUB_SENDER_ID}` +
//     `&channel=2` +
//     `&DCS=0` +
//     `&flashsms=0` +
//     `&number=${phoneNumber}` +
//     `&text=${encodeURIComponent(text)}` +
//     `&route=47` +
//     `&EntityId=${process.env.DLT_ENTITY_ID}` +
//     `&dlttemplateid=${process.env.DLT_SMS_EXPIRY_TEMPLATE_ID}`;
//   const result = await fetch(url);
//   const data = await result.json();
//   return data;
// }

// export const sendUpdateSMS = async ({ userName, serviceName, phoneNumber}:{ userName: string, serviceName: string, phoneNumber: string}) => {
//   const text = `Dear ${userName}, There has been an update (new stock recommendation or exit) in your ${serviceName} subscription.Please review the update to stay aligned with the strategy. https://legaciscapital.com/dashboard Team Legacis - Samar Wealth Advisors`;
//   const url = `${process.env.SMS_GATEWAYHUB_URL}/SendSMS?` +
//     `APIKey=${process.env.SMS_GATEWAYHUB_API_KEY}` +
//     `&senderid=${process.env.SMS_GATEWAYHUB_SENDER_ID}` +
//     `&channel=2` +
//     `&DCS=0` +
//     `&flashsms=0` +
//     `&number=${phoneNumber}` +
//     `&text=${encodeURIComponent(text)}` +
//     `&route=47` +
//     `&EntityId=${process.env.DLT_ENTITY_ID}` +
//     `&dlttemplateid=${process.env.DLT_SMS_UPDATES_TEMPLATE_ID}`;
//   const result = await fetch(url);
//   const data = await result.json();
//   return data;
// }
