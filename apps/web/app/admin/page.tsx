"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

type Order = {
  id: number;
  status: string;
  totalAmount: string;
  createdAt: string;
};

type Product = {
  _id: string;
  title: string;
  price: number;
  availableQty?: number;
  stockStatus?: string;
};

export default function AdminHomePage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
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
        const [ordersRes, productsRes] = await Promise.all([
          fetch(`${API_URL}/admin/orders`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/admin/products`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const ordersData = await ordersRes.json().catch(() => []);
        const productsData = await productsRes.json().catch(() => []);
        if (!ordersRes.ok) throw new Error(ordersData.message || "Failed to load orders");
        if (!productsRes.ok) throw new Error(productsData.message || "Failed to load products");
        setOrders(ordersData || []);
        setProducts(productsData || []);
      } catch (e: any) {
        setError(e.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  const stats = useMemo(() => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfDay);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    let dailyRevenue = 0;
    let weeklyRevenue = 0;
    let monthlyRevenue = 0;
    let totalRevenue = 0;
    const statusCounts: Record<string, number> = {};

    for (const o of orders) {
      const created = new Date(o.createdAt);
      const amount = Number(o.totalAmount) || 0;
      totalRevenue += amount;
      if (created >= startOfDay) dailyRevenue += amount;
      if (created >= startOfWeek) weeklyRevenue += amount;
      if (created >= startOfMonth) monthlyRevenue += amount;
      statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
    }

    const lowStock = products.filter((p) => (p.availableQty ?? 0) > 0 && (p.availableQty ?? 0) <= 5);

    const sortedBySales = [...products].sort((a, b) => (b.price || 0) - (a.price || 0));
    const trending = sortedBySales.slice(0, 5);

    return {
      dailyRevenue,
      weeklyRevenue,
      monthlyRevenue,
      totalRevenue,
      totalOrders: orders.length,
      statusCounts,
      totalCustomers: 0, // we don't have an admin users endpoint yet
      lowStock,
      trending,
    };
  }, [orders, products]);

  return (
    <div className="py-4 space-y-6">
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        {loading && <span className="text-xs text-neutral-500">Loading...</span>}
      </div>
      {error && <div className="text-sm text-red-600">{error}</div>}

      {/* Top metrics cards */}
      <div className="grid gap-4 md:grid-cols-4 text-sm">
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg p-4 text-neutral-900 dark:text-neutral-100">
          <div className="text-xs text-neutral-500 mb-1">Daily Sales</div>
          <div className="text-xl font-semibold">PKR {stats.dailyRevenue.toFixed(0)}</div>
        </div>
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg p-4 text-neutral-900 dark:text-neutral-100">
          <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Weekly Sales</div>
          <div className="text-xl font-semibold">PKR {stats.weeklyRevenue.toFixed(0)}</div>
        </div>
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg p-4 text-neutral-900 dark:text-neutral-100">
          <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Monthly Sales</div>
          <div className="text-xl font-semibold">PKR {stats.monthlyRevenue.toFixed(0)}</div>
        </div>
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg p-4 text-neutral-900 dark:text-neutral-100">
          <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Total Revenue</div>
          <div className="text-xl font-semibold">PKR {stats.totalRevenue.toFixed(0)}</div>
        </div>
      </div>

      {/* Orders / customers overview */}
      <div className="grid gap-4 md:grid-cols-3 text-sm">
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg p-4 text-neutral-900 dark:text-neutral-100">
          <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Total Orders</div>
          <div className="text-2xl font-semibold mb-2">{stats.totalOrders}</div>
          <div className="text-xs text-neutral-500 mb-1">By Status</div>
          <div className="flex flex-wrap gap-2">
            {Object.keys(stats.statusCounts).length === 0 && (
              <span className="text-xs text-neutral-400">No orders yet.</span>
            )}
            {Object.entries(stats.statusCounts).map(([status, count]) => (
              <span key={status} className="px-2 py-1 rounded-full bg-neutral-100 text-[11px]">
                {status}: {count}
              </span>
            ))}
          </div>
        </div>
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg p-4 text-neutral-900 dark:text-neutral-100">
          <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Total Customers</div>
          <div className="text-2xl font-semibold">{stats.totalCustomers}</div>
          <div className="text-[11px] text-neutral-400 mt-1">(Hook to admin users endpoint later)</div>
        </div>
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg p-4 text-neutral-900 dark:text-neutral-100">
          <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">Pending Orders</div>
          <ul className="space-y-1 max-h-32 overflow-auto">
            {orders.filter((o) => o.status === "Pending").length === 0 && (
              <li className="text-xs text-neutral-400">No pending orders.</li>
            )}
            {orders
              .filter((o) => o.status === "Pending")
              .slice(0, 5)
              .map((o) => (
                <li key={o.id} className="flex items-center justify-between text-xs">
                  <span>Order #{o.id}</span>
                  <span>PKR {o.totalAmount}</span>
                </li>
              ))}
          </ul>
        </div>
      </div>

      {/* Revenue graph (simple bar chart by day of week) */}
      <div className="grid gap-4 md:grid-cols-3 text-sm">
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg p-4 md:col-span-2 text-neutral-900 dark:text-neutral-100">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-xs text-neutral-500">Revenue (last 7 days)</div>
            </div>
          </div>
          <RevenueBars orders={orders} />
        </div>
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg p-4 text-neutral-900 dark:text-neutral-100">
          <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">Abandoned Carts</div>
          <div className="text-sm text-neutral-400">
            Analytics coming soon. We will show carts that were not checked out.
          </div>
        </div>
      </div>

      {/* Low stock + trending products */}
      <div className="grid gap-4 md:grid-cols-2 text-sm">
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg p-4 text-neutral-900 dark:text-neutral-100">
          <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">Low-stock Products (≤ 5)</div>
          {stats.lowStock.length === 0 && (
            <div className="text-xs text-neutral-400">No low-stock products right now.</div>
          )}
          <ul className="space-y-1 max-h-40 overflow-auto">
            {stats.lowStock.map((p) => (
              <li key={p._id} className="flex items-center justify-between text-xs">
                <span className="truncate max-w-[70%]">{p.title}</span>
                <span>
                  {p.availableQty ?? 0} pcs
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg p-4 text-neutral-900 dark:text-neutral-100">
          <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">Trending Products</div>
          {stats.trending.length === 0 && (
            <div className="text-xs text-neutral-400">Not enough data yet.</div>
          )}
          <ul className="space-y-1 max-h-40 overflow-auto">
            {stats.trending.map((p) => (
              <li key={p._id} className="flex items-center justify-between text-xs">
                <span className="truncate max-w-[70%]">{p.title}</span>
                <span>PKR {p.price}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function RevenueBars({ orders }: { orders: Order[] }) {
  const now = new Date();
  const labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const sums = new Array(7).fill(0) as number[];

  for (const o of orders) {
    const d = new Date(o.createdAt);
    const diffDays = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays <= 7) {
      const day = d.getDay();
      sums[day] += Number(o.totalAmount) || 0;
    }
  }

  const max = Math.max(...sums, 1);

  return (
    <div className="flex items-end gap-3 h-40">
      {sums.map((value, idx) => {
        const height = (value / max) * 100;
        return (
          <div key={labels[idx]} className="flex-1 flex flex-col items-center justify-end gap-1">
            <div
              className="w-full max-w-[24px] bg-blue-500 rounded-t"
              style={{ height: `${height}%` }}
            />
            <div className="text-[10px] text-neutral-500">{labels[idx]}</div>
          </div>
        );
      })}
    </div>
  );
}
