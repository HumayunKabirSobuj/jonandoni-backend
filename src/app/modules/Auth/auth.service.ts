import { User, UserRole, UserStatus } from "@prisma/client";
import prisma from "../../../shared/prisma";
import bcrypt from "bcrypt";
import config from "../../../config";
import { Secret } from "jsonwebtoken";
import { jwtHelpers } from "../../../helpers/jwtHelpers";
import AppError from "../../Errors/AppError";
import status from "http-status";
import * as nodemailer from "nodemailer";

const createUser = async (data: User) => {
  // 1️⃣ Validate email
  if (!data.email) {
    throw new AppError(status.BAD_REQUEST, "Email is required");
  }

  // 2️⃣ Check if user already exists
  const isUserExist = await prisma.user.findFirst({
    where: { email: data.email, isDeleted: false },
  });
  if (isUserExist) {
    throw new AppError(status.CONFLICT, "User Already Exist!");
  }

  // 3️⃣ Assign role automatically
  let role: UserRole;
  if (data.business_name) {
    role = UserRole.shop_owner;
  } else {
    role = UserRole.customer;
  }

  // 4️⃣ Hash password
  if (!data.password) {
    throw new AppError(status.BAD_REQUEST, "Password is required");
  }
  const hashedPassword = bcrypt.hashSync(data.password, 10);

  // 5️⃣ Prepare user data
  const createData: any = {
    ...data,
    role,
    password: hashedPassword,
    status:
      role === UserRole.shop_owner ? UserStatus.pending : UserStatus.approved,
    isActive: true,
  };

  // 6️⃣ If shop_owner, validate business_category
  if (role === UserRole.shop_owner) {
    if (!data.business_category || !Array.isArray(data.business_category)) {
      throw new AppError(
        status.BAD_REQUEST,
        "business_category must be an array of valid categories"
      );
    }
    createData.business_category = data.business_category;
  }

  // 7️⃣ Save to database
  const user = await prisma.user.create({
    data: createData,
  });

  return user;
};

const loginUser = async (data: { email: string; password: string }) => {
  const userData = await prisma.user.findFirst({
    where: {
      email: data.email,
      isActive: true,
      isDeleted: false,
    },
  });

  if (!userData) {
    throw new AppError(status.NOT_FOUND, "User not found..");
  }

  if (userData.status?.toLowerCase() === UserStatus.pending) {
    throw new AppError(
      status.CONFLICT,
      "Please wait for approval before accessing the system."
    );
  }

  const isCorrectPassword: boolean = await bcrypt.compare(
    data.password,
    userData.password
  );

  if (!isCorrectPassword) {
    throw new AppError(status.UNAUTHORIZED, "Your password is incorrect.");
  }

  // Generate OTP (6 digit code)
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expireAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expire

  // Save OTP in DB
  await prisma.user.update({
    where: { id: userData.id },
    data: { verificationCode: otp, codeExpireAt: expireAt },
  });

  // Send OTP via Nodemailer
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"My Shop" <${process.env.EMAIL_USER}>`,
    to: userData.email,
    subject: "🔐 Verify Your Login - One Time Password (OTP)",
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Login Verification</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          
          * { margin: 0; padding: 0; box-sizing: border-box; }
          
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 20px;
            min-height: 100vh;
          }
          
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          }
          
          .header {
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
            padding: 40px 30px;
            text-align: center;
            color: white;
          }
          
          .header h1 {
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 8px;
            letter-spacing: -0.5px;
          }
          
          .header p {
            font-size: 16px;
            opacity: 0.9;
            font-weight: 500;
          }
          
          .content {
            padding: 50px 40px;
            text-align: center;
          }
          
          .welcome-text {
            font-size: 24px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 16px;
            line-height: 1.3;
          }
          
          .description {
            font-size: 16px;
            color: #6b7280;
            margin-bottom: 40px;
            line-height: 1.6;
          }
          
          .otp-container {
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            border: 2px solid #e5e7eb;
            border-radius: 20px;
            padding: 40px 30px;
            margin: 30px 0;
            position: relative;
          }
          
          .otp-label {
            font-size: 14px;
            font-weight: 600;
            color: #374151;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 16px;
          }
          
          .otp-code {
            font-size: 48px;
            font-weight: 700;
            color: #1e40af;
            letter-spacing: 8px;
            font-family: 'Courier New', monospace;
            background: white;
            padding: 20px 30px;
            border-radius: 12px;
            border: 2px solid #ddd6fe;
            display: inline-block;
            box-shadow: 0 4px 12px rgba(30, 64, 175, 0.1);
          }
          
          .timer {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 12px;
            padding: 16px 24px;
            margin: 30px 0;
            display: inline-block;
          }
          
          .timer-text {
            font-size: 14px;
            font-weight: 600;
            color: #92400e;
          }
          
          .security-notice {
            background: #fef2f2;
            border: 1px solid #fca5a5;
            border-radius: 12px;
            padding: 20px;
            margin: 30px 0;
          }
          
          .security-notice p {
            font-size: 14px;
            color: #991b1b;
            font-weight: 500;
            margin: 0;
          }
          
          .footer {
            background: #f9fafb;
            padding: 30px 40px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
          }
          
          .footer p {
            font-size: 13px;
            color: #6b7280;
            margin: 4px 0;
          }
          
          .footer .company {
            font-weight: 600;
            color: #374151;
          }
          
          @media only screen and (max-width: 600px) {
            body { padding: 10px; }
            .container { border-radius: 16px; }
            .header { padding: 30px 20px; }
            .header h1 { font-size: 28px; }
            .content { padding: 40px 20px; }
            .welcome-text { font-size: 20px; }
            .otp-code { 
              font-size: 36px; 
              letter-spacing: 4px;
              padding: 16px 20px;
            }
            .footer { padding: 20px; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>My Shop</h1>
            <p>Secure Login Verification</p>
          </div>
          
          <div class="content">
            <h2 class="welcome-text">Verify Your Login</h2>
            <p class="description">
              We've sent you a secure verification code to complete your login. 
              Enter the code below to access your account.
            </p>
            
            <div class="otp-container">
              <div class="otp-label">Your Verification Code</div>
              <div class="otp-code">${otp}</div>
            </div>
            
            <div class="timer">
              <div class="timer-text">⏰ This code expires in 5 minutes</div>
            </div>
            
            <div class="security-notice">
              <p>🔒 For your security, never share this code with anyone. Our team will never ask for your verification code.</p>
            </div>
          </div>
          
          <div class="footer">
            <p>If you didn't request this verification, you can safely ignore this email.</p>
            <p class="company">© ${new Date().getFullYear()} My Shop. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  });

  return { message: "Verification code sent to your email." };
};

const verifyLogin = async (data: { email: string; code: string }) => {
  const userData = await prisma.user.findUnique({
    where: { email: data.email, isDeleted: false },
  });

  if (!userData) {
    throw new AppError(status.NOT_FOUND, "User not found..");
  }

  if (
    !userData.verificationCode ||
    userData.verificationCode !== data.code ||
    !userData.codeExpireAt ||
    new Date() > userData.codeExpireAt
  ) {
    throw new AppError(status.BAD_REQUEST, "Invalid or expired code.");
  }

  // Clear OTP from DB
  await prisma.user.update({
    where: { id: userData.id },
    data: { verificationCode: null, codeExpireAt: null },
  });

  const displayName =
    userData.role === "admin"
      ? userData.name
      : userData.role === "shop_owner"
      ? userData.business_name
      : userData.role === "customer"
      ? userData.name
      : "Unknown";

  const accessToken = jwtHelpers.generateToken(
    {
      id: userData.id,
      name: displayName,
      email: userData.email,
      role: userData.role,
    },
    process.env.ACCESS_TOKEN_SECRET as string,
    process.env.ACCESS_TOKEN_EXPIRES_IN as string
  );

  return { accessToken };
};

// const refreshAccessToken = async (token: string) => {
//   try {
//     // validate refresh token
//     const decoded = jwtHelpers.verifyToken(
//       token,
//       config.jwt.refresh_token_secret as Secret
//     );

//     const { email } = decoded;

//     const user = await prisma.user.findUnique({
//       where: { email },
//     });

//     if (!user) {
//       throw new AppError(status.NOT_FOUND, "User not found");
//     }

//     const newAccessToken = jwtHelpers.generateToken(
//       {
//         id: user.id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//       },
//       config.jwt.access_token_secret as Secret,
//       config.jwt.access_token_expires_in as string
//     );

//     return {
//       accessToken: newAccessToken,
//     };
//   } catch (err) {
//     throw new AppError(status.UNAUTHORIZED, "Invalid refresh token");
//   }
// };

export const UserService = {
  createUser,
  loginUser,
  verifyLogin,
};
