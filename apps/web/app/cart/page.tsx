"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

type CartItem = {
  id: number;
  productId: string;
  quantity: number;
  unitPrice: string | null;
};

type Cart = {
  id: number;
  items: CartItem[];
};

type Product = {
  _id: string;
  title: string;
  price: number;
};

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [verificationRequired, setVerificationRequired] = useState(false);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const token = window.localStorage.getItem("b2e_token");
    const storedEmail = window.localStorage.getItem("b2e_email");
    setEmail(storedEmail);
    if (!token) {
      router.replace("/login");
      return;
    }
    async function load() {
      try {
        const res = await fetch(`${API_URL}/cart`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to load cart");
        const data = await res.json();
        setCart(data);
        // fetch product details for nicer display
        const ids = (data.items || []).map((i: CartItem) => i.productId);
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
        setError(e.message || "Failed to load cart");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  const total = cart?.items.reduce((sum, i) => {
    const price = Number(i.unitPrice ?? 0);
    return sum + price * i.quantity;
  }, 0) ?? 0;

  async function handleCheckout() {
    const token = window.localStorage.getItem("b2e_token");
    if (!token) {
      router.replace("/login");
      return;
    }
    setCheckoutLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ successUrl: "http://localhost:3000/success", cancelUrl: "http://localhost:3000/cart" }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        if (data.code === "EMAIL_VERIFICATION_REQUIRED") {
          setVerificationRequired(true);
          setError(data.message || "Please verify your email address.");
          return;
        }
        throw new Error(data.error || data.message || "Checkout failed");
      }
      if (data.url) {
        window.location.href = data.url;
      } else {
        router.push(`/success?orderId=${data.orderId}`);
      }
    } catch (e: any) {
      setError(e.message || "Checkout failed");
    } finally {
      setCheckoutLoading(false);
    }
  }

  if (loading) return <div className="py-8 text-sm text-neutral-500">Loading cart...</div>;
  if (!cart || cart.items.length === 0) return <div className="py-8 text-sm text-neutral-500">Your cart is empty.</div>;

  return (
    <div className="py-8 grid gap-6" style={{ gridTemplateColumns: "2fr 1fr" }}>
      <div>
        <h1 className="text-2xl font-bold mb-4">Shopping Cart</h1>
        <div className="space-y-3">
          {cart.items.map((item) => {
            const p = products[item.productId];
            const title = p?.title || `Product ${item.productId}`;
            const price = Number(item.unitPrice ?? p?.price ?? 0);
            return (
              <div key={item.id} className="flex items-center justify-between border rounded p-3 text-sm">
                <div>
                  <div className="font-medium">{title}</div>
                  <div className="text-neutral-500">Qty: {item.quantity}</div>
                </div>
                <div className="text-right">
                  <div>PKR {price}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="border rounded p-4 h-fit">
        <h2 className="text-lg font-semibold mb-2">Order Summary</h2>
        <div className="flex justify-between text-sm mb-2">
          <span>Subtotal</span>
          <span>PKR {total}</span>
        </div>
        {error && <div className="text-sm text-red-600 mb-2">{error}</div>}
        {verificationRequired && (
          <div className="text-xs text-neutral-600 mb-2">
            We&apos;ve sent a verification link to {email || "your email"}. Please verify your email, then click Checkout again.
          </div>
        )}
        <button
          className="w-full bg-black text-white rounded py-2 mt-2 disabled:opacity-60"
          onClick={handleCheckout}
          disabled={checkoutLoading}
        >
          {checkoutLoading ? "Processing..." : "Checkout"}
        </button>
      </div>
    </div>
  );
}