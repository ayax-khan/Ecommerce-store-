"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

type Order = {
  id: number;
  status: string;
  totalAmount: string;
  createdAt: string;
};

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
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
        const res = await fetch(`${API_URL}/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to load orders");
        const data = await res.json();
        setOrders(data ?? []);
      } catch (e: any) {
        setError(e.message || "Failed to load orders");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  if (loading) return <div className="py-8 text-sm text-neutral-500">Loading orders...</div>;
  if (error) return <div className="py-8 text-sm text-red-600">{error}</div>;
  if (orders.length === 0) return <div className="py-8 text-sm text-neutral-500">You have no orders yet.</div>;

  return (
    <div className="py-8">
      <h1 className="text-2xl font-bold mb-4">My Orders</h1>
      <div className="space-y-3 text-sm">
        {orders.map((o) => (
          <a
            key={o.id}
            href={`/account/orders/${o.id}`}
            className="block border rounded p-3 hover:bg-neutral-50"
          >
            <div className="flex justify-between">
              <span>Order #{o.id}</span>
              <span className="font-semibold">PKR {o.totalAmount}</span>
            </div>
            <div className="flex justify-between text-xs text-neutral-500 mt-1">
              <span>Status: {o.status}</span>
              <span>{new Date(o.createdAt).toLocaleString()}</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}