import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db/mongoose";
import { Admin } from "@/models/Admin";

async function seed() {
  await connectDB();

  const email = process.env.ADMIN_EMAIL || "admin@jobcareerpao.com";
  const password = process.env.ADMIN_PASSWORD || "ChangeMe@123456";
  const name = process.env.ADMIN_NAME || "Super Admin";

  const existing = await Admin.findOne({ email });
  if (existing) {
    console.log("Admin already exists:", email);
    await mongoose.disconnect();
    return;
  }

  const hashed = await bcrypt.hash(password, 12);
  await Admin.create({ email, password: hashed, name });
  console.log("Admin seeded:", email);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
