"use client";

import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

type Address = {
  id: number;
  label?: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode?: string;
  country: string;
};

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Address>>({ country: "Pakistan" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const token = window.localStorage.getItem("b2e_token");
    if (!token) {
      window.location.href = "/login";
      return;
    }
    async function load() {
      try {
        const res = await fetch(`${API_URL}/me/addresses`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load addresses");
        setAddresses(data || []);
      } catch (e: any) {
        setError(e.message || "Failed to load addresses");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function saveAddress(e: React.FormEvent) {
    e.preventDefault();
    const token = window.localStorage.getItem("b2e_token");
    if (!token) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/me/addresses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save address");
      setAddresses((prev) => [data, ...prev]);
      setForm({ country: "Pakistan" });
    } catch (e: any) {
      setError(e.message || "Failed to save address");
    } finally {
      setSaving(false);
    }
  }

  async function deleteAddress(id: number) {
    const token = window.localStorage.getItem("b2e_token");
    if (!token) return;
    const res = await fetch(`${API_URL}/me/addresses/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    }
  }

  if (loading) return <div className="py-8 text-sm text-neutral-500">Loading addresses...</div>;

  return (
    <div className="py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-4">My Addresses</h1>
      <form className="space-y-3 mb-6" onSubmit={saveAddress}>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Label</label>
            <input
              className="w-full border rounded px-3 py-2 text-sm"
              value={form.label || ""}
              onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
              placeholder="Home / Office"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">City</label>
            <input
              className="w-full border rounded px-3 py-2 text-sm"
              value={form.city || ""}
              onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Address line 1</label>
          <input
            className="w-full border rounded px-3 py-2 text-sm"
            value={form.line1 || ""}
            onChange={(e) => setForm((f) => ({ ...f, line1: e.target.value }))}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Address line 2</label>
          <input
            className="w-full border rounded px-3 py-2 text-sm"
            value={form.line2 || ""}
            onChange={(e) => setForm((f) => ({ ...f, line2: e.target.value }))}
          />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">State</label>
            <input
              className="w-full border rounded px-3 py-2 text-sm"
              value={form.state || ""}
              onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Postal code</label>
            <input
              className="w-full border rounded px-3 py-2 text-sm"
              value={form.postalCode || ""}
              onChange={(e) => setForm((f) => ({ ...f, postalCode: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Country</label>
            <input
              className="w-full border rounded px-3 py-2 text-sm"
              value={form.country || ""}
              onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
            />
          </div>
        </div>
        {error && <div className="text-sm text-red-600">{error}</div>}
        <button
          type="submit"
          className="bg-black text-white rounded px-4 py-2 text-sm disabled:opacity-60"
          disabled={saving}
        >
          {saving ? "Saving..." : "Add address"}
        </button>
      </form>
      <div className="space-y-3 text-sm">
        {addresses.length === 0 && <div className="text-neutral-500">No addresses saved yet.</div>}
        {addresses.map((a) => (
          <div key={a.id} className="border rounded p-3 flex justify-between">
            <div>
              <div className="font-medium">{a.label || "Address"}</div>
              <div>{a.line1}</div>
              {a.line2 && <div>{a.line2}</div>}
              <div>
                {a.city} {a.state && `, ${a.state}`} {a.postalCode && `, ${a.postalCode}`}
              </div>
              <div>{a.country}</div>
            </div>
            <button
              onClick={() => deleteAddress(a.id)}
              className="text-xs text-red-600 hover:underline h-fit"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
