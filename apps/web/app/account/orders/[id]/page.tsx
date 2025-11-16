"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

type OrderItem = {
  id: number;
  productId: string;
  quantity: number;
  unitPrice: string;
};

type Order = {
  id: number;
  status: string;
  totalAmount: string;
  createdAt: string;
  items: OrderItem[];
};

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
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
        const res = await fetch(`${API_URL}/orders/${params.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to load order");
        const data = await res.json();
        setOrder(data);
      } catch (e: any) {
        setError(e.message || "Failed to load order");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id, router]);

  if (loading) return <div className="py-8 text-sm text-neutral-500">Loading order...</div>;
  if (error) return <div className="py-8 text-sm text-red-600">{error}</div>;
  if (!order) return <div className="py-8 text-sm text-neutral-500">Order not found.</div>;

  return (
    <div className="py-8">
      <h1 className="text-2xl font-bold mb-4">Order #{order.id}</h1>
      <div className="mb-4 text-sm text-neutral-600">
        <div>Status: {order.status}</div>
        <div>Placed at: {new Date(order.createdAt).toLocaleString()}</div>
        <div>Total: PKR {order.totalAmount}</div>
      </div>
      <h2 className="text-lg font-semibold mb-2">Items</h2>
      <div className="space-y-2 text-sm">
        {order.items.map((it) => (
          <div key={it.id} className="flex justify-between border rounded p-2">
            <div>
              <div>Product {it.productId}</div>
              <div className="text-neutral-500">Qty: {it.quantity}</div>
            </div>
            <div>PKR {it.unitPrice}</div>
          </div>
        ))}
      </div>
    </div>
  );
}