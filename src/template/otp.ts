// templates/otp.template.ts

export const otpTemplate = (otp: string, logoUrl: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Verify Your Email</title>
</head>

<body style="margin:0;padding:0;background:#f4f6f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;background:#f4f6f9;">
<tr>
<td align="center">

<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,.08);">

<!-- Header -->
<tr>
  <td
    align="center"
    valign="middle"
    style="
      background:#2563eb;
      padding:40px 24px 36px;
      text-align:center;
    "
  >

    <!-- Logo circle -->
    <table
      role="presentation"
      cellpadding="0"
      cellspacing="0"
      border="0"
      width="100"
      height="100"
      align="center"
      style="
        width:100px;
        height:100px;
        margin:0 auto 20px;
        background:#ffffff;
        border-radius:50%;
      "
    >
      <tr>
        <td
          align="center"
          valign="middle"
          width="100"
          height="100"
          style="
            width:100px;
            height:100px;
            padding:0;
            text-align:center;
            vertical-align:middle;
          "
        >
          <img
            src="${logoUrl}"
            alt="Atlas"
            width="72"
            height="72"
            style="
              display:block;
              width:72px;
              height:72px;
              margin:0 auto;
              border:0;
              outline:none;
              text-decoration:none;
              object-fit:contain;
            "
          />
        </td>
      </tr>
    </table>


    <!-- Subtitle -->
    <p
      style="
        margin:8px 0 0;
        padding:0;
        color:#dbeafe;
        font-size:16px;
        line-height:24px;
        text-align:center;
      "
    >
      Secure Email Verification
    </p>

  </td>
</tr>

<!-- Body -->
<tr>
<td style="padding:40px;">

<p style="margin:0 0 20px;font-size:16px;line-height:28px;color:#4b5563;">
Use the verification code below to continue.
For your security, never share this code with anyone.
</p>

<!-- OTP -->
<table width="100%" cellpadding="0" cellspacing="0">
<tr>
<td align="center">

<div style="
display:inline-block;
background:#eff6ff;
border:2px dashed #2563eb;
border-radius:12px;
padding:18px 32px;
margin:20px 0;
">

<span style="
font-size:38px;
font-weight:700;
letter-spacing:12px;
color:#2563eb;
font-family:monospace;
">
${otp}
</span>

</div>

</td>
</tr>
</table>

<p style="margin:0;font-size:15px;color:#6b7280;text-align:center;">
This code will expire in
<strong style="color:#111827;">10 minutes</strong>.
</p>

<hr style="margin:40px 0;border:none;border-top:1px solid #e5e7eb;">

<p style="margin:0;font-size:14px;line-height:24px;color:#6b7280;">
If you didn't request this verification code, you can safely ignore this email.
No changes will be made to your account.
</p>

</td>
</tr>

<!-- Footer -->
<tr>
<td style="background:#f9fafb;padding:24px;text-align:center;">

<p style="margin:0;font-size:14px;color:#6b7280;">
Need help? Contact our support team.
</p>

<p style="margin:12px 0 0;font-size:13px;color:#9ca3af;">
© ${new Date().getFullYear()} Atlas. All rights reserved.
</p>

</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>
`;
