

// import { Server as HTTPServer } from "http";
// import app from "./app";


// const port = 5000;

// async function main() {
//   const httpServer: HTTPServer = app.listen(port, () => {
//     console.log("🚀 Food Delivery Server is running on port", port);
//   });
  

// }

// main();





import { Server as HTTPServer } from "http";
import app from "./app";
import prisma from "./shared/prisma";
import bcrypt from "bcrypt";

const port = 5000;

async function createAdmin() {
  try {
    const adminEmail = "admin@gmail.com"; // অ্যাডমিনের email

    // email দিয়ে চেক করা
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existingAdmin) {
      console.log("⚠️ Admin already exists");
      return;
    }

    // নতুন অ্যাডমিন তৈরি
    const hashedPassword = await bcrypt.hash("admin123", 12);
    const admin = await prisma.user.create({
      data: {
        name: "Admin",
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
        status:"approved"
      },
    });

    console.log("✅ Admin created:", admin.email);
  } catch (error) {
    console.error("❌ Error creating admin:", error);
  }
}

async function main() {
  const httpServer: HTTPServer = app.listen(port, () => {
    console.log("🚀 Food Delivery Server is running on port", port);
  });

  await createAdmin();
}

main();
