"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CategoryForm } from "../../CategoryForm";

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

export default function AdminEditCategoryPage() {
  const params = useParams();
  const router = useRouter();
  const categoryId = params?.id as string;

  const [initial, setInitial] = useState<CategoryDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = window.localStorage.getItem("b2e_token");
    if (!token) {
      router.replace("/login");
      return;
    }
    if (!categoryId) {
      setError("Category ID missing");
      setLoading(false);
      return;
    }
    async function load() {
      try {
        const res = await fetch(`${API_URL}/admin/categories/${categoryId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load category");
        setInitial(data);
      } catch (e: any) {
        setError(e.message || "Failed to load category");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [categoryId, router]);

  if (loading) {
    return <div className="py-8 text-sm text-neutral-500">Loading category...</div>;
  }

  if (error) {
    return (
      <div className="py-8">
        <div className="text-sm text-red-600 mb-2">{error}</div>
        <button
          className="text-sm text-blue-600 hover:underline"
          onClick={() => router.back()}
        >
          a Go back
        </button>
      </div>
    );
  }

  return <CategoryForm mode="edit" categoryId={categoryId} initial={initial} />;
}
