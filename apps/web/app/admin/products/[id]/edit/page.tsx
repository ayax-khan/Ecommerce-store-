"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ProductForm, AdminProductDto } from "../../ProductForm";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export default function AdminEditProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id as string;

  const [productData, setProductData] = useState<AdminProductDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = window.localStorage.getItem("b2e_token");
    if (!token) {
      router.replace("/login");
      return;
    }
    if (!productId) {
      setError("Product ID missing");
      setLoading(false);
      return;
    }
    async function load() {
      try {
        const res = await fetch(`${API_URL}/admin/products/${productId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          throw new Error("Failed to load product");
        }
        const data = await res.json();
        setProductData(data);
      } catch (e: any) {
        setError(e.message || "Failed to load product");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [productId, router]);

  if (loading) {
    return <div className="py-8 text-sm text-neutral-500">Loading product...</div>;
  }

  if (error) {
    return (
      <div className="py-8">
        <div className="text-sm text-red-600 mb-2">{error}</div>
        <button
          className="text-sm text-blue-600 hover:underline"
          onClick={() => router.back()}
        >
          ← Go back
        </button>
      </div>
    );
  }

  return <ProductForm mode="edit" productId={productId} initial={productData} />;
}
