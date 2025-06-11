const emailHeader = `
 <!DOCTYPE html>
  <html>
    <head>
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>Legacis Email</title>
      <link href="https://fonts.googleapis.com/css?family=Poppins:400,600&display=swap" rel="stylesheet" />
      <style>
        body, * {
          font-family: 'Poppins', Arial, Helvetica, sans-serif !important;
        }
      </style>
    </head>
  <body style="margin:0;padding:0;background:radial-gradient(circle at 50% 30%, #4AEDB9 0%, #FA2EF3 60%, #8036F2 100%);">
  <div style="background:#fff;width:100%;border-radius:0 0 24px 24px;padding:32px 0 24px 0;box-sizing:border-box;text-align:left;">
    <img src="https://legacis.com/logo.png" alt="Legacis" width="120" style="margin-left:32px;margin-bottom:0;" />
  </div>
  <div style="background:rgba(255,255,255,0.5);width:100%;margin:0 auto;padding:32px;border-radius:8px;box-shadow:0 2px 8px #eee;">
`;

const emailFooter = `
   </div>
      <hr style="border:none;border-top:1px solid #eee;margin:32px 0 16px 0;width:100%;" />
      <div style="margin-top:32px;text-align:center;font-size:12px;color:#888;">
      &copy; ${new Date().getFullYear()} Legacis. All rights reserved.
      </div>
   </body>
  </html>
`;

const OTPEmail = (otp: string) => {
  return `${emailHeader}
      <h2 style="font-size:24px;font-weight:bold;margin-bottom:16px;">Your OTP Code</h2>
      <p style="font-size:16px;margin-bottom:24px;">Use the following OTP code to verify your email address:</p>
      <h1 style="font-size:32px;font-weight:bold;color:#8036F2;background:#fff;padding:16px 0;border-radius:10px;box-shadow:0 2px 8px #e0e0e0;letter-spacing:18px;text-align:center;display:inline-block;width:100%;">${otp}</h1>
      ${emailFooter}`;
};


export {
   OTPEmail,
};


// ZeptoMail Template

export const templateId = {
  otp: {
     id: "2518b.71ae238b58705b69.k1.7149c3a0-3889-11f0-b421-8e9a6c33ddc2.19701d3b4da",
     fields : ['title', 'name', 'otp', 'year'],   
   },
   update: {
       id: "2518b.71ae238b58705b69.k1.7149c3a0-3889-11f0-b421-8e9a6c33ddc2.19701d3b4da",
       fields : ['title', 'name', 'year'],
    },
   subscription: {
       id: "2518b.71ae238b58705b69.k1.7149c3a0-3889-11f0-b421-8e9a6c33ddc2.19701d3b4da",
       fields : ['title', 'name', 'year'],
    },
};