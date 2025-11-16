"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

type CategoryDto = {
  _id?: string;
  name?: string;
  slug?: string;
  thumbnail?: string;
  parentId?: string | null;
  sortOrder?: number;
  isActive?: boolean;
};

type Props = {
  mode: "create" | "edit";
  categoryId?: string;
  initial?: CategoryDto | null;
};

export function CategoryForm({ mode, categoryId, initial }: Props) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [parentId, setParentId] = useState<string | "">("");
  const [sortOrder, setSortOrder] = useState("0");
  const [isActive, setIsActive] = useState(true);
  const [allCategories, setAllCategories] = useState<CategoryDto[]>([]);
  const [loading, setLoading] = useState(false);
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
        if (res.ok) setAllCategories(data || []);
      } catch {
        // ignore
      }
    }
    load();
  }, [router]);

  useEffect(() => {
    if (!initial) return;
    setName(initial.name || "");
    setSlug(initial.slug || "");
    setThumbnail(initial.thumbnail || "");
    setParentId(initial.parentId || "");
    setSortOrder(initial.sortOrder != null ? String(initial.sortOrder) : "0");
    setIsActive(initial.isActive !== false);
  }, [initial]);

  const parentOptions = useMemo(
    () => allCategories.filter((c) => c._id !== categoryId),
    [allCategories, categoryId],
  );

  function autoSlug(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const token = window.localStorage.getItem("b2e_token");
    if (!token) {
      router.replace("/login");
      return;
    }

    const finalSlug = slug || autoSlug(name);
    if (!name.trim() || !finalSlug) {
      setError("Name and slug are required.");
      return;
    }

    const payload = {
      name: name.trim(),
      slug: finalSlug,
      thumbnail: thumbnail || undefined,
      parentId: parentId || null,
      sortOrder: Number(sortOrder) || 0,
      isActive,
    };

    setLoading(true);
    try {
      const url =
        mode === "create"
          ? `${API_URL}/admin/categories`
          : `${API_URL}/admin/categories/${categoryId}`;
      const method = mode === "create" ? "POST" : "PATCH";
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to save category");
      router.push("/admin/categories");
    } catch (e: any) {
      setError(e.message || "Failed to save category");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="py-8 max-w-xl">
      <h1 className="text-2xl font-bold mb-4">
        {mode === "create" ? "Add Category" : "Edit Category"}
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            className="w-full border rounded px-3 py-2"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!slug) setSlug(autoSlug(e.target.value));
            }}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Slug</label>
          <input
            className="w-full border rounded px-3 py-2 text-sm"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            required
          />
          <p className="text-xs text-neutral-500 mt-1">URL-friendly identifier, e.g. school-supplies</p>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Thumbnail URL</label>
          <input
            className="w-full border rounded px-3 py-2 text-sm"
            value={thumbnail}
            onChange={(e) => setThumbnail(e.target.value)}
            placeholder="https://.../image.jpg"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Parent Category</label>
            <select
              className="w-full border rounded px-3 py-2 text-sm"
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
            >
              <option value="">(Root category)</option>
              {parentOptions.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Sort Order</label>
            <input
              type="number"
              className="w-full border rounded px-3 py-2 text-sm"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input
            id="isActive"
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
          <label htmlFor="isActive" className="text-sm">
            Active (visible in storefront filters)
          </label>
        </div>
        {error && <div className="text-sm text-red-600">{error}</div>}
        <div className="flex items-center gap-2 mt-2">
          <button
            type="submit"
            className="bg-black text-white rounded px-4 py-2 text-sm disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Category"}
          </button>
          <button
            type="button"
            className="text-sm text-neutral-600 hover:underline"
            onClick={() => router.back()}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
