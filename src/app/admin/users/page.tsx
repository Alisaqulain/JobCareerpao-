"use client";

import { useEffect, useState } from "react";
import { api } from "@/hooks/useApi";

interface UserRow {
  _id: string;
  name: string;
  email: string;
  phone: string;
  profileComplete: boolean;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [search, setSearch] = useState("");

  const load = () => {
    const params = new URLSearchParams({ limit: "100" });
    if (search) params.set("search", search);
    api<UserRow[]>(`/api/admin/users?${params}`).then((res) => {
      if (res.data) setUsers(res.data);
    });
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <>
      <h1 className="font-display text-2xl font-bold text-brand-dark">Users</h1>
      <div className="mt-4 flex gap-2">
        <input
          className="h-10 rounded-xl border border-slate-200 px-3 text-sm"
          placeholder="Search users"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="button" onClick={load} className="rounded-xl bg-brand-blue px-4 text-sm text-white">
          Search
        </button>
      </div>
      <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-brand-gray text-left text-xs uppercase text-brand-slate">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Profile</th>
              <th className="px-4 py-3">Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} className="border-t border-slate-100">
                <td className="px-4 py-3 font-medium">{user.name}</td>
                <td className="px-4 py-3">{user.email}</td>
                <td className="px-4 py-3">{user.phone}</td>
                <td className="px-4 py-3">{user.profileComplete ? "Complete" : "Incomplete"}</td>
                <td className="px-4 py-3">{new Date(user.createdAt).toLocaleDateString("en-IN")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
