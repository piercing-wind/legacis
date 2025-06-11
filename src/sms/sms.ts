export const sendOTPSMS = async ({phoneNumber, otp, type}:{phoneNumber: string, otp: string, type: string}) => {
  
   const text = `Dear User, Please use OTP ${otp} for ${type}. Do not share it with anyone! Team Legacis - Samar Wealth Advisors`;
   const url = `${process.env.SMS_GATEWAYHUB_URL}/SendSMS?` +
    `APIKey=${process.env.SMS_GATEWAYHUB_API_KEY}` +
    `&senderid=${process.env.SMS_GATEWAYHUB_SENDER_ID}` +
    `&channel=2` + 
    `&DCS=0` +
    `&flashsms=0` +
    `&number=${phoneNumber}` +
    `&text=${encodeURIComponent(text)}` +
    `&route=47` +
    `&EntityId=${process.env.DLT_ENTITY_ID}` +
    `&dlttemplateid=${process.env.DLT_SMS_TEMPLATE_ID}`;

  const result = await fetch(url);
  const data = await result.json();
  return data;
};