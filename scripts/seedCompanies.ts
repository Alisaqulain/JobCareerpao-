import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import mongoose from "mongoose";
import type { CompanyCategory } from "../src/lib/constants/companies";
import { slugifyCompany } from "../src/lib/services/company.service";
import { ALL_SEED_COMPANIES, type SeedCompanyRow } from "./data/companies";

const BRAND_COLORS = [
  "#0B4F8A",
  "#0891B2",
  "#1D4ED8",
  "#0369A1",
  "#0F766E",
  "#4338CA",
  "#7C3AED",
  "#B45309",
  "#BE123C",
  "#059669",
];

/** Names that should be treated as the same company when skipping duplicates. */
const DUPLICATE_GROUPS: string[][] = [
  ["tata consultancy services (tcs)", "tcs", "tata consultancy services"],
  ["ernst & young (ey)", "ernst & young", "ey", "ernst and young"],
  ["hcltech", "hcl technologies", "hcl tech"],
  ["amazon", "amazon india"],
  ["samsung india", "samsung"],
  ["aakash healthcare", "aakash healthcare super speciality hospital"],
  ["blk-max hospital", "blk max hospital", "blk super speciality hospital"],
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

function normalizeName(name: string) {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

function logoUrl(name: string, color: string) {
  const initials = name
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase() || name.slice(0, 2).toUpperCase();

  const params = new URLSearchParams({
    name: initials,
    background: color.replace("#", ""),
    color: "ffffff",
    size: "128",
    bold: "true",
    format: "png",
  });
  return `https://ui-avatars.com/api/?${params.toString()}`;
}

function ensureUniqueSlug(base: string, usedSlugs: Set<string>) {
  let slug = slugifyCompany(base);
  if (!slug) slug = "company";
  let candidate = slug;
  let suffix = 0;
  while (usedSlugs.has(candidate)) {
    suffix += 1;
    candidate = `${slug}-${suffix}`;
  }
  usedSlugs.add(candidate);
  return candidate;
}

function buildDuplicateIndex(existingNames: string[]) {
  const index = new Map<string, string>();
  for (const name of existingNames) {
    const key = normalizeName(name);
    index.set(key, key);
    for (const group of DUPLICATE_GROUPS) {
      if (group.includes(key)) {
        for (const alias of group) index.set(alias, key);
      }
    }
  }
  return index;
}

function isDuplicate(name: string, duplicateIndex: Map<string, string>) {
  const key = normalizeName(name);
  if (duplicateIndex.has(key)) return true;
  for (const group of DUPLICATE_GROUPS) {
    if (!group.includes(key)) continue;
    return group.some((alias) => duplicateIndex.has(alias));
  }
  return false;
}

function registerName(name: string, duplicateIndex: Map<string, string>) {
  const key = normalizeName(name);
  duplicateIndex.set(key, key);
  for (const group of DUPLICATE_GROUPS) {
    if (group.includes(key)) {
      for (const alias of group) duplicateIndex.set(alias, key);
    }
  }
}

function dedupeSeedList(rows: readonly SeedCompanyRow[]) {
  const seen = new Set<string>();
  const unique: SeedCompanyRow[] = [];
  for (const row of rows) {
    const key = normalizeName(row[0]);
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(row);
  }
  return unique;
}

async function seedCompanies() {
  loadEnvLocal();
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is required. Set it in .env.local");

  await mongoose.connect(uri);
  const { Company } = await import("../src/models/Company");

  const seedRows = dedupeSeedList(ALL_SEED_COMPANIES);
  console.log(`Prepared ${seedRows.length} companies from seed list...`);

  const existing = await Company.find({}, { name: 1, slug: 1 }).lean();
  const duplicateIndex = buildDuplicateIndex(existing.map((c) => c.name));
  const usedSlugs = new Set(existing.map((c) => c.slug));

  const documents: Record<string, unknown>[] = [];
  let skipped = 0;

  for (let i = 0; i < seedRows.length; i++) {
    const [name, category, industry, website, city, state, description] = seedRows[i];
    const normalizedName = name.trim();

    if (isDuplicate(normalizedName, duplicateIndex)) {
      skipped += 1;
      console.log(`  Skipped (exists): ${normalizedName}`);
      continue;
    }

    const slug = ensureUniqueSlug(normalizedName, usedSlugs);
    const color = BRAND_COLORS[i % BRAND_COLORS.length];
    const headOffice = `${city}, ${state}, India`;

    documents.push({
      name: normalizedName,
      slug,
      logoUrl: logoUrl(normalizedName, color),
      category: category as CompanyCategory,
      industry,
      description,
      website: website || undefined,
      headOffice,
      headquarters: headOffice,
      city,
      state,
      country: "India",
      hiringStatus: "active",
      verificationStatus: "verified",
      metaTitle: `${normalizedName} Careers & Jobs | JobCareerPao`,
      metaDescription: `${normalizedName} — ${industry} in ${city}, ${state}. Explore careers on JobCareerPao.`,
      color,
      isActive: true,
    });

    registerName(normalizedName, duplicateIndex);
  }

  let inserted = 0;

  for (const doc of documents) {
    try {
      await Company.create(doc);
      inserted += 1;
      console.log(`  Created: ${doc.name}`);
    } catch (err) {
      skipped += 1;
      if (err instanceof mongoose.mongo.MongoServerError && err.code === 11000) {
        console.warn(`  Skipped duplicate key: ${doc.name}`);
      } else {
        throw err;
      }
    }
  }

  console.log(`\nInserted: ${inserted}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Total in database: ${await Company.countDocuments()}`);

  await mongoose.disconnect();
}

seedCompanies().catch((err) => {
  console.error(err);
  process.exit(1);
});
