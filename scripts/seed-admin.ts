import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db/mongoose";
import { Admin } from "@/models/Admin";

function loadEnvLocal() {
  const envPath = resolve(process.cwd(), ".env.local");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvLocal();

async function seed() {
  await connectDB();

  const email = (process.env.ADMIN_EMAIL || "admin@jobcareerpao.com").toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "ChangeMe@123456";
  const name = process.env.ADMIN_NAME || "Super Admin";

  const hashed = await bcrypt.hash(password, 12);
  const existing = await Admin.findOne({ email });

  if (existing) {
    existing.password = hashed;
    existing.name = name;
    await existing.save();
    console.log("Admin password updated:", email);
    await mongoose.disconnect();
    return;
  }

  await Admin.create({ email, password: hashed, name });
  console.log("Admin seeded:", email);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
