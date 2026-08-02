"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CompanyFilters, type CompanyFilterValues } from "@/components/companies/CompanyFilters";
import { CompanyAdminTable } from "@/components/companies/CompanyAdminTable";
import { CompanyForm } from "@/components/companies/CompanyForm";
import { api } from "@/hooks/useApi";
import { toast } from "sonner";
import type { CompanyRecord } from "@/lib/companies/form";
import {
  emptyCompanyForm,
  companyToFormValues,
  formValuesToPayload,
  type CompanyFormValues,
} from "@/lib/companies/form";
import {
  createCompanyAction,
  updateCompanyAction,
  deleteCompanyAction,
} from "@/lib/actions/companies";

const defaultFilters: CompanyFilterValues = {
  search: "",
  category: "",
  city: "",
  state: "",
  hiringStatus: "",
  isActive: "",
};

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<CompanyRecord[]>([]);
  const [filters, setFilters] = useState<CompanyFilterValues>(defaultFilters);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CompanyFormValues>(emptyCompanyForm());

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ limit: "100", order: "desc" });
    if (filters.search) params.set("search", filters.search);
    if (filters.category) params.set("category", filters.category);
    if (filters.city) params.set("city", filters.city);
    if (filters.state) params.set("state", filters.state);
    if (filters.hiringStatus) params.set("hiringStatus", filters.hiringStatus);
    if (filters.isActive) params.set("isActive", filters.isActive);

    api<CompanyRecord[]>(`/api/admin/companies?${params}`)
      .then((res) => {
        if (res.data) setCompanies(res.data);
      })
      .finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(load, 300);
    return () => clearTimeout(timer);
  }, [load]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyCompanyForm());
    setShowForm(true);
  };

  const openEdit = (company: CompanyRecord) => {
    setEditingId(company._id);
    setForm(companyToFormValues(company));
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyCompanyForm());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = formValuesToPayload(form);
      const result = editingId
        ? await updateCompanyAction(editingId, payload)
        : await createCompanyAction(payload);

      if (!result.success) throw new Error(result.message);
      toast.success(editingId ? "Company updated" : "Company created");
      closeForm();
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this company? This cannot be undone.")) return;
    const result = await deleteCompanyAction(id);
    if (result.success) {
      toast.success("Company deleted");
      load();
    } else {
      toast.error(result.message || "Delete failed");
    }
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-brand-dark">Company Management</h1>
          <p className="text-sm text-brand-slate">
            Master company records — add companies first, then create jobs linked to each company.
          </p>
        </div>
        <Button type="button" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Add Company
        </Button>
      </div>

      <div className="mt-6">
        <CompanyFilters values={filters} onChange={setFilters} />
      </div>

      {showForm && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-display text-xl font-semibold text-brand-dark">
            {editingId ? "Edit Company" : "Add Company"}
          </h2>
          <CompanyForm
            form={form}
            onChange={setForm}
            onSubmit={handleSubmit}
            onCancel={closeForm}
            saving={saving}
            submitLabel={editingId ? "Update Company" : "Create Company"}
          />
        </div>
      )}

      <div className="mt-6">
        <CompanyAdminTable
          companies={companies}
          loading={loading}
          onEdit={openEdit}
          onDelete={remove}
        />
      </div>

      {companies.length > 0 && !showForm && (
        <p className="mt-4 text-sm text-brand-slate">
          Ready to post jobs?{" "}
          <a href="/admin/jobs/new" className="font-semibold text-brand-blue hover:underline">
            Create Job →
          </a>
        </p>
      )}
    </>
  );
}
