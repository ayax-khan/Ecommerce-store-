"use client";

import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

type WishlistItem = {
  id: number;
  productId: string;
};

type Wishlist = {
  id: number;
  items: WishlistItem[];
};

type Product = {
  _id: string;
  title: string;
  price: number;
};

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = window.localStorage.getItem("b2e_token");
    if (!token) {
      window.location.href = "/login";
      return;
    }
    async function load() {
      try {
        const res = await fetch(`${API_URL}/wishlist`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load wishlist");
        setWishlist(data);
        const ids = (data.items || []).map((i: WishlistItem) => i.productId);
        const uniq = Array.from(new Set(ids));
        const entries: [string, Product][] = await Promise.all(
          uniq.map(async (id) => {
            try {
              const pr = await fetch(`${API_URL}/products/${id}`).then((r) => r.json());
              return [id, pr as Product];
            } catch {
              return [id, { _id: id, title: `Product ${id}`, price: 0 } as Product];
            }
          }),
        );
        setProducts(Object.fromEntries(entries));
      } catch (e: any) {
        setError(e.message || "Failed to load wishlist");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function removeItem(itemId: number) {
    const token = window.localStorage.getItem("b2e_token");
    if (!token) return;
    const res = await fetch(`${API_URL}/wishlist/${itemId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setWishlist((prev) => (prev ? { ...prev, items: prev.items.filter((i) => i.id !== itemId) } : prev));
    }
  }

  if (loading) return <div className="py-8 text-sm text-neutral-500">Loading wishlist...</div>;
  if (error) return <div className="py-8 text-sm text-red-600">{error}</div>;
  if (!wishlist || wishlist.items.length === 0)
    return <div className="py-8 text-sm text-neutral-500">Your wishlist is empty.</div>;

  return (
    <div className="py-8">
      <h1 className="text-2xl font-bold mb-4">Wishlist</h1>
      <div className="space-y-3">
        {wishlist.items.map((item) => {
          const p = products[item.productId];
          return (
            <div key={item.id} className="flex items-center justify-between border rounded p-3 text-sm">
              <div>
                <div className="font-medium">{p?.title || item.productId}</div>
                {p && <div className="text-neutral-600">PKR {p.price}</div>}
              </div>
              <div className="flex items-center gap-2">
                <a href={`/product/${item.productId}`} className="text-xs text-blue-600 hover:underline">
                  View
                </a>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-xs text-red-600 hover:underline"
                >
                  Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
