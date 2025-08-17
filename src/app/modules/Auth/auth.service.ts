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
      status: UserStatus.approved,
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
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; background: #f4f7fb; padding: 40px; border-radius: 12px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #4CAF50; margin: 0; font-size: 28px;">My Shop</h1>
            <p style="color: #777; margin: 5px 0;">Secure Login Verification</p>
          </div>
          <div style="background: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0px 2px 8px rgba(0,0,0,0.05); text-align: center;">
            <h2 style="color: #333; margin-bottom: 15px;">Your Verification Code</h2>
            <p style="color: #555; margin-bottom: 20px;">Use the following code to complete your login. It will expire in <b>5 minutes</b>.</p>
            <div style="display: inline-block; padding: 15px 30px; background: #4CAF50; color: #fff; font-size: 32px; letter-spacing: 8px; border-radius: 8px; font-weight: bold;">
              ${otp}
            </div>
            <p style="color: #999; font-size: 13px; margin-top: 20px;">
              ⚠️ Do not share this code with anyone for security reasons.
            </p>
          </div>
          <div style="text-align: center; margin-top: 30px; color: #aaa; font-size: 12px;">
            <p>If you did not request this, you can safely ignore this email.</p>
            <p>© ${new Date().getFullYear()} My Shop. All Rights Reserved.</p>
          </div>
        </div>
      `,
  });

  return { message: "Verification code sent to your email." };
};

const verifyLogin = async (data: { email: string; code: string }) => {
  const userData = await prisma.user.findUnique({
    where: { email: data.email , isDeleted:false},
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
