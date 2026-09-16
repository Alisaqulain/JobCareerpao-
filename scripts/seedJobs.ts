import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import mongoose from "mongoose";
import type { CompanyCategory } from "../src/lib/constants/companies";
import { STANDARD_APPLICATION_FIELDS } from "../src/lib/application-form";

const JOBS_PER_COMPANY = 10;
const APPLICATION_FEE = 199;
const SALARY_MIN = 15000;
const SALARY_MAX = 30000;

const DEFAULT_DYNAMIC_FIELDS = STANDARD_APPLICATION_FIELDS;

const TITLES_BY_CATEGORY: Record<string, string[]> = {
  "IT Company": [
    "Software Trainee",
    "Junior Developer",
    "Technical Support Executive",
    "Data Entry Operator",
    "QA Testing Associate",
    "IT Helpdesk Executive",
    "Desktop Support Engineer",
    "Digital Marketing Executive",
    "Network Support Trainee",
    "BPO Technical Associate",
  ],
  Hospital: [
    "Staff Nurse",
    "Ward Assistant",
    "Lab Technician",
    "Pharmacy Assistant",
    "Front Desk Executive",
    "Patient Care Coordinator",
    "Medical Records Assistant",
    "OT Assistant",
    "Radiology Assistant",
    "Housekeeping Supervisor",
  ],
  Hotel: [
    "Front Office Executive",
    "Housekeeping Staff",
    "Food Service Associate",
    "Kitchen Helper",
    "Guest Relations Executive",
    "Banquet Server",
    "Laundry Attendant",
    "Security Guard",
    "Reservation Executive",
    "Restaurant Waiter",
  ],
  Banking: [
    "Banking Associate",
    "Customer Service Officer",
    "Operations Executive",
    "Data Entry Operator",
    "Loan Processing Assistant",
    "Cash Counter Executive",
    "Relationship Executive",
    "Back Office Assistant",
    "KYC Verification Executive",
    "Branch Support Staff",
  ],
  "BPO / KPO": [
    "Customer Support Executive",
    "Voice Process Associate",
    "Non-Voice Process Executive",
    "Chat Support Agent",
    "Email Support Executive",
    "Team Coordinator",
    "Quality Analyst Trainee",
    "Data Processing Executive",
    "Technical Support Associate",
    "Operations Trainee",
  ],
};

const GENERIC_TITLES = [
  "Customer Support Executive",
  "Sales Associate",
  "Operations Executive",
  "Admin Assistant",
  "Field Executive",
  "Store Coordinator",
  "Delivery Executive",
  "Quality Checker",
  "Production Helper",
  "Office Assistant",
];

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

function slugify(title: string, company: string) {
  const base = `${title}-${company}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `${base}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

function pickTitles(category: string, count: number) {
  const pool = TITLES_BY_CATEGORY[category] || GENERIC_TITLES;
  const titles: string[] = [];
  for (let i = 0; i < count; i++) {
    titles.push(pool[i % pool.length]);
  }
  return titles;
}

function randomSalary() {
  const min = SALARY_MIN + Math.floor(Math.random() * 8000);
  const max = Math.min(SALARY_MAX, min + 3000 + Math.floor(Math.random() * 7000));
  return { min, max: Math.max(max, min + 1000), currency: "INR" as const };
}

function buildDescription(title: string, company: string, city: string, industry: string) {
  return `${title} opening at ${company} in ${city}. ${company} is a leading ${industry} employer hiring motivated candidates. Responsibilities include day-to-day operations, team coordination, and delivering quality work. Freshers and candidates with up to 2 years experience may apply. Monthly salary ₹15,000 – ₹30,000. Apply online through JobCareerPao.`;
}

function skillsForTitle(title: string, category: string) {
  if (category === "IT Company") {
    return ["Communication", "MS Office", "Basic Computer", "Teamwork"];
  }
  if (category === "Hospital") {
    return ["Patient Care", "Communication", "Basic Medical Knowledge", "Teamwork"];
  }
  if (category === "Hotel") {
    return ["Customer Service", "Communication", "Hospitality", "Teamwork"];
  }
  return ["Communication", "Customer Service", "MS Office", "Teamwork"];
}

async function seedJobs() {
  loadEnvLocal();
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is required. Set it in .env.local");

  await mongoose.connect(uri);
  const { Company } = await import("../src/models/Company");
  const { Job } = await import("../src/models/Job");

  const companies = await Company.find({ isActive: true }).lean();
  console.log(`Found ${companies.length} active companies`);

  let created = 0;
  let updated = 0;

  for (const company of companies) {
    const companyId = String(company._id);
    const existingCount = await Job.countDocuments({ companyId, status: "active" });
    const toCreate = Math.max(0, JOBS_PER_COMPANY - existingCount);

    if (toCreate > 0) {
      const titles = pickTitles(company.category as CompanyCategory, toCreate);
      const location = [company.city, company.state].filter(Boolean).join(", ") || "India";

      for (const title of titles) {
        const salary = randomSalary();
        await Job.create({
          title,
          company: company.name,
          companyId: company._id,
          description: buildDescription(
            title,
            company.name,
            company.city || "India",
            company.industry || company.category
          ),
          salary,
          experience: "0-2 years",
          qualification: "10th / 12th / Diploma / Graduate",
          skills: skillsForTitle(title, company.category),
          location,
          jobType: "Full-time",
          mode: ["On-site", "Hybrid", "Remote"][Math.floor(Math.random() * 3)],
          applicationFee: APPLICATION_FEE,
          lastDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
          status: "active",
          dynamicFields: DEFAULT_DYNAMIC_FIELDS,
          requiredDocuments: ["Resume"],
          slug: slugify(title, company.name),
        });
        created += 1;
      }
      console.log(`  ${company.name}: created ${toCreate} jobs (${existingCount} already existed)`);
    } else {
      console.log(`  ${company.name}: already has ${existingCount} jobs`);
    }
  }

  const feeResult = await Job.updateMany({}, { $set: { applicationFee: APPLICATION_FEE } });
  updated += feeResult.modifiedCount;

  const allJobs = await Job.find({}).select("_id salary").lean();
  for (const job of allJobs) {
    const salary = randomSalary();
    await Job.updateOne({ _id: job._id }, { $set: { salary } });
    updated += 1;
  }

  console.log(`\nCreated: ${created} new jobs`);
  console.log(`Updated fees on: ${feeResult.modifiedCount} jobs`);
  console.log(`Updated salary on: ${allJobs.length} jobs (₹15K–₹30K/month)`);
  console.log(`Application fee for all jobs: ₹${APPLICATION_FEE}`);
  console.log(`Total active jobs: ${await Job.countDocuments({ status: "active" })}`);

  await mongoose.disconnect();
}

seedJobs().catch((err) => {
  console.error(err);
  process.exit(1);
});
