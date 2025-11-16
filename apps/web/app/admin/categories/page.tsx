"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

type Category = {
  _id: string;
  name: string;
  slug: string;
  thumbnail?: string;
  parentId?: string | null;
  sortOrder?: number;
  isActive?: boolean;
};

export default function AdminCategoriesPage() {
  const router = useRouter();
  const [items, setItems] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = window.localStorage.getItem("b2e_token");
    if (!token) {
      router.replace("/login");
      return;
    }
    async function load() {
      try {
        const res = await fetch(`${API_URL}/admin/categories`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load categories");
        setItems(data || []);
      } catch (e: any) {
        setError(e.message || "Failed to load categories");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  const byId = useMemo(() => {
    const map = new Map<string, Category>();
    items.forEach((c) => map.set(c._id, c));
    return map;
  }, [items]);

  async function handleDelete(id: string) {
    const token = window.localStorage.getItem("b2e_token");
    if (!token) {
      router.replace("/login");
      return;
    }
    const ok = window.confirm("Delete this category (and its direct sub-categories)?");
    if (!ok) return;
    try {
      const res = await fetch(`${API_URL}/admin/categories/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to delete category");
      setItems((prev) => prev.filter((c) => c._id !== id && c.parentId !== id));
    } catch (e: any) {
      alert(e.message || "Failed to delete category");
    }
  }

  return (
    <div className="py-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Categories</h1>
        <a
          href="/admin/categories/new"
          className="bg-black text-white rounded px-4 py-2 text-sm"
        >
          + Add Category
        </a>
      </div>
      {loading && <div className="text-sm text-neutral-500">Loading...</div>}
      {error && <div className="text-sm text-red-600 mb-2">{error}</div>}
      {!loading && items.length === 0 && (
        <div className="text-sm text-neutral-500">No categories yet.</div>
      )}
      {!loading && items.length > 0 && (
        <table className="w-full text-sm border">
          <thead className="bg-neutral-50">
            <tr>
              <th className="text-left px-3 py-2 border-b">Name</th>
              <th className="text-left px-3 py-2 border-b">Slug</th>
              <th className="text-left px-3 py-2 border-b">Parent</th>
              <th className="text-left px-3 py-2 border-b">Sort</th>
              <th className="text-left px-3 py-2 border-b">Status</th>
              <th className="text-left px-3 py-2 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c._id} className="border-t">
                <td className="px-3 py-2 flex items-center gap-2">
                  {c.thumbnail && (
                    <img
                      src={c.thumbnail}
                      alt="thumb"
                      className="w-6 h-6 rounded object-cover border"
                    />
                  )}
                  <span>{c.name}</span>
                </td>
                <td className="px-3 py-2 text-xs text-neutral-600">{c.slug}</td>
                <td className="px-3 py-2 text-xs">
                  {c.parentId ? byId.get(c.parentId)?.name || "-" : "Root"}
                </td>
                <td className="px-3 py-2 text-xs">{c.sortOrder ?? 0}</td>
                <td className="px-3 py-2 text-xs">
                  {c.isActive === false ? "Inactive" : "Active"}
                </td>
                <td className="px-3 py-2 space-x-3">
                  <a
                    href={`/admin/categories/${c._id}/edit`}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Edit
                  </a>
                  <button
                    type="button"
                    className="text-xs text-red-600 hover:underline"
                    onClick={() => handleDelete(c._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
