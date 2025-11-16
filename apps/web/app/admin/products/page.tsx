"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

type Product = {
  _id: string;
  title: string;
  price: number;
  regularPrice?: number;
  salePrice?: number;
  brand?: string;
  availableQty?: number;
  stockStatus?: string;
  isActive?: boolean;
};

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const token = window.localStorage.getItem("b2e_token");
    if (!token) {
      router.replace("/login");
      return;
    }
    async function load() {
      try {
        const res = await fetch(`${API_URL}/admin/products`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          throw new Error("Failed to load products");
        }
        const data = await res.json();
        setProducts(data ?? []);
      } catch (e: any) {
        setError(e.message || "Failed to load products");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  const filtered = useMemo(
    () =>
      products.filter((p) => {
        if (!query.trim()) return true;
        const q = query.toLowerCase();
        return (
          p.title.toLowerCase().includes(q) ||
          (p.brand ?? "").toLowerCase().includes(q)
        );
      }),
    [products, query],
  );

  return (
    <div className="py-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Products</h1>
        <a
          href="/admin/products/new"
          className="bg-black text-white rounded px-4 py-2 text-sm"
        >
          + Add Product
        </a>
      </div>
      <div className="flex items-center justify-between mb-3 gap-3">
        <div className="flex-1 max-w-xs">
          <input
            type="text"
            placeholder="Search products..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700"
          />
        </div>
      </div>
      {loading && <div className="text-sm text-neutral-500">Loading...</div>}
      {error && <div className="text-sm text-red-600 mb-2">{error}</div>}
      {!loading && filtered.length === 0 && (
        <div className="text-sm text-neutral-500">No products found.</div>
      )}
      {!loading && filtered.length > 0 && (
        <table className="w-full text-sm border">
          <thead className="bg-neutral-50">
            <tr>
              <th className="text-left px-3 py-2 border-b">Title</th>
              <th className="text-left px-3 py-2 border-b">Brand</th>
              <th className="text-left px-3 py-2 border-b">Price (PKR)</th>
              <th className="text-left px-3 py-2 border-b">Stock</th>
              <th className="text-left px-3 py-2 border-b">Status</th>
              <th className="text-left px-3 py-2 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const hasSale = p.salePrice && p.salePrice < (p.regularPrice || p.price);
              return (
                <tr key={p._id} className="border-t">
                  <td className="px-3 py-2">{p.title}</td>
                  <td className="px-3 py-2">{p.brand || "-"}</td>
                  <td className="px-3 py-2">
                    {hasSale ? (
                      <span>
                        <span className="line-through text-neutral-400 mr-1">{p.regularPrice}</span>
                        <span className="font-semibold">{p.salePrice}</span>
                      </span>
                    ) : (
                      <span>{p.regularPrice ?? p.price}</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {p.availableQty ?? 0} ({p.stockStatus || (p.availableQty && p.availableQty > 0 ? 'in_stock' : 'out_of_stock')})
                  </td>
                  <td className="px-3 py-2">{p.isActive === false ? 'Inactive' : 'Active'}</td>
                  <td className="px-3 py-2 space-x-3">
                    <a
                      href={`/admin/products/${p._id}/edit`}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Edit
                    </a>
                    <button
                      type="button"
                      className="text-xs text-red-600 hover:underline"
                      onClick={async () => {
                        const token = window.localStorage.getItem("b2e_token");
                        if (!token) {
                          router.replace("/login");
                          return;
                        }
                        const ok = window.confirm("Are you sure you want to delete this product? This cannot be undone.");
                        if (!ok) return;
                        try {
                          const res = await fetch(`${API_URL}/admin/products/${p._id}`, {
                            method: "DELETE",
                            headers: { Authorization: `Bearer ${token}` },
                          });
                          if (!res.ok) {
                            const data = await res.json().catch(() => ({}));
                            throw new Error(data.message || "Failed to delete product");
                          }
                          setProducts((prev) => prev.filter((x) => x._id !== p._id));
                        } catch (e: any) {
                          alert(e.message || "Failed to delete product");
                        }
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
