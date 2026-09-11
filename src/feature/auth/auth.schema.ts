import z from "zod";

const ACCEPTED_EMAIL_DOMAINS = [
  "mailinator.com",
  "yopmail.com",
  "temp.jo3.org",
];
// const ACCEPTED_EMAIL_DOMAINS = [
//   "gmail.com",
//   "outlook.com",
//   "hotmail.com",
//   "yahoo.com",
//   "rediffmail.com",
// ];

export const sendOtpSchema = z.object({
  email: z
    .email({
      error: "Please enter a valid email address",
    })
    .refine(
      (email) => {
        const domain = email.split("@")[1]?.toLowerCase();

        return domain !== undefined && ACCEPTED_EMAIL_DOMAINS.includes(domain);
      },
      {
        error: "Email domain is not supported",
      },
    ),
});
export const verifyEmailSchema = z.object({
  email: z
    .email({
      error: "Please enter a valid email address",
    })
    .refine(
      (email) => {
        const domain = email.split("@")[1]?.toLowerCase();

        return domain !== undefined && ACCEPTED_EMAIL_DOMAINS.includes(domain);
      },
      {
        error: "Email domain is not supported",
      },
    ),
  otp: z
    .string()
    .min(6, "OTP must be 6 digits long")
    .max(6, "OTP must be 6 digits long")
    .regex(/^\d+$/, "OTP must contain only digits"),
});
