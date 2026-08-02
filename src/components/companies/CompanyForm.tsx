"use client";

import { useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CompanyLogo } from "@/components/ui/CompanyLogo";
import {
  COMPANY_CATEGORIES,
  COMPANY_SIZES,
  HIRING_STATUSES,
  VERIFICATION_STATUSES,
} from "@/lib/constants/companies";
import type { CompanyFormValues } from "@/lib/companies/form";
import { toast } from "sonner";

interface CompanyFormProps {
  form: CompanyFormValues;
  onChange: (form: CompanyFormValues) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  saving?: boolean;
  submitLabel?: string;
}

const inputClass =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-blue";

async function uploadImage(file: File, type: string) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("type", type);
  const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || "Upload failed");
  return data.data as { url: string; publicId: string };
}

export function CompanyForm({
  form,
  onChange,
  onSubmit,
  onCancel,
  saving,
  submitLabel = "Save Company",
}: CompanyFormProps) {
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  const handleUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    kind: "logo" | "banner"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const setLoading = kind === "logo" ? setUploadingLogo : setUploadingBanner;
    setLoading(true);
    try {
      const result = await uploadImage(file, kind === "logo" ? "company" : "company-banner");
      if (kind === "logo") {
        onChange({ ...form, logoUrl: result.url, logoPublicId: result.publicId });
      } else {
        onChange({ ...form, bannerUrl: result.url, bannerPublicId: result.publicId });
      }
      toast.success(kind === "logo" ? "Logo uploaded" : "Banner uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
      <div className="md:col-span-2">
        <h3 className="font-display text-lg font-semibold text-brand-dark">Basic Information</h3>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Company Name *</label>
        <input
          className={inputClass}
          required
          minLength={2}
          value={form.name}
          onChange={(e) => onChange({ ...form, name: e.target.value })}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Company Category *</label>
        <select
          className={inputClass}
          required
          value={form.category}
          onChange={(e) => onChange({ ...form, category: e.target.value as CompanyFormValues["category"] })}
        >
          {COMPANY_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Industry *</label>
        <input
          className={inputClass}
          required
          placeholder="e.g. Software Development"
          value={form.industry}
          onChange={(e) => onChange({ ...form, industry: e.target.value })}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Company Size</label>
        <select
          className={inputClass}
          value={form.companySize}
          onChange={(e) =>
            onChange({ ...form, companySize: e.target.value as CompanyFormValues["companySize"] })
          }
        >
          <option value="">Select size</option>
          {COMPANY_SIZES.map((s) => (
            <option key={s} value={s}>
              {s} employees
            </option>
          ))}
        </select>
      </div>

      <div className="md:col-span-2">
        <label className="mb-1 block text-sm font-medium">Description *</label>
        <textarea
          className={`${inputClass} min-h-[100px] py-2`}
          required
          minLength={10}
          value={form.description}
          onChange={(e) => onChange({ ...form, description: e.target.value })}
        />
      </div>

      <div className="md:col-span-2 mt-2">
        <h3 className="font-display text-lg font-semibold text-brand-dark">Contact & Address</h3>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Website</label>
        <input
          className={inputClass}
          type="url"
          placeholder="https://"
          value={form.website}
          onChange={(e) => onChange({ ...form, website: e.target.value })}
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Email</label>
        <input
          className={inputClass}
          type="email"
          value={form.email}
          onChange={(e) => onChange({ ...form, email: e.target.value })}
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Phone</label>
        <input
          className={inputClass}
          value={form.phone}
          onChange={(e) => onChange({ ...form, phone: e.target.value })}
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">HR Contact Person</label>
        <input
          className={inputClass}
          value={form.hrContactPerson}
          onChange={(e) => onChange({ ...form, hrContactPerson: e.target.value })}
        />
      </div>
      <div className="md:col-span-2">
        <label className="mb-1 block text-sm font-medium">Head Office *</label>
        <input
          className={inputClass}
          required
          value={form.headOffice}
          onChange={(e) => onChange({ ...form, headOffice: e.target.value })}
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">City *</label>
        <input
          className={inputClass}
          required
          value={form.city}
          onChange={(e) => onChange({ ...form, city: e.target.value })}
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">State *</label>
        <input
          className={inputClass}
          required
          value={form.state}
          onChange={(e) => onChange({ ...form, state: e.target.value })}
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Country</label>
        <input
          className={inputClass}
          value={form.country}
          onChange={(e) => onChange({ ...form, country: e.target.value })}
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Pincode</label>
        <input
          className={inputClass}
          value={form.pincode}
          onChange={(e) => onChange({ ...form, pincode: e.target.value })}
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Founded Year</label>
        <input
          className={inputClass}
          value={form.foundedYear}
          onChange={(e) => onChange({ ...form, foundedYear: e.target.value })}
        />
      </div>

      <div className="md:col-span-2 mt-2">
        <h3 className="font-display text-lg font-semibold text-brand-dark">Status & Branding</h3>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Hiring Status</label>
        <select
          className={inputClass}
          value={form.hiringStatus}
          onChange={(e) =>
            onChange({ ...form, hiringStatus: e.target.value as CompanyFormValues["hiringStatus"] })
          }
        >
          {HIRING_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Verification Status</label>
        <select
          className={inputClass}
          value={form.verificationStatus}
          onChange={(e) =>
            onChange({
              ...form,
              verificationStatus: e.target.value as CompanyFormValues["verificationStatus"],
            })
          }
        >
          {VERIFICATION_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Brand Color</label>
        <input
          type="color"
          className="h-11 w-full rounded-xl border border-slate-200"
          value={form.color}
          onChange={(e) => onChange({ ...form, color: e.target.value })}
        />
      </div>
      <div className="flex items-end">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => onChange({ ...form, isActive: e.target.checked })}
          />
          Visible on website
        </label>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Company Logo</label>
        <label className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 text-sm text-brand-slate hover:border-brand-blue">
          <Upload className="h-4 w-4" />
          {uploadingLogo ? "Uploading..." : "Upload Logo"}
          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(e, "logo")} />
        </label>
        {form.logoUrl && (
          <CompanyLogo
            name={form.name || "C"}
            logoUrl={form.logoUrl}
            fallback={form.name.charAt(0) || "C"}
            color={form.color}
            size="sm"
            className="mt-2"
          />
        )}
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Company Banner</label>
        <label className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 text-sm text-brand-slate hover:border-brand-blue">
          <Upload className="h-4 w-4" />
          {uploadingBanner ? "Uploading..." : "Upload Banner"}
          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(e, "banner")} />
        </label>
        {form.bannerUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={form.bannerUrl} alt="Banner preview" className="mt-2 h-20 w-full rounded-xl object-cover" />
        )}
      </div>

      <div className="md:col-span-2 mt-2">
        <h3 className="font-display text-lg font-semibold text-brand-dark">SEO</h3>
      </div>
      <div className="md:col-span-2">
        <label className="mb-1 block text-sm font-medium">Meta Title</label>
        <input
          className={inputClass}
          value={form.metaTitle}
          onChange={(e) => onChange({ ...form, metaTitle: e.target.value })}
        />
      </div>
      <div className="md:col-span-2">
        <label className="mb-1 block text-sm font-medium">Meta Description</label>
        <textarea
          className={`${inputClass} min-h-[80px] py-2`}
          maxLength={160}
          value={form.metaDescription}
          onChange={(e) => onChange({ ...form, metaDescription: e.target.value })}
        />
      </div>

      <div className="flex flex-wrap gap-2 md:col-span-2">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : submitLabel}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
