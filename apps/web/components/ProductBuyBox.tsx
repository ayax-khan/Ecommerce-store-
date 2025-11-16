"use client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

type Product = {
  _id: string;
  price: number;
};

export function ProductBuyBox({ product }: { product: Product }) {
  async function addToCart() {
    const token = window.localStorage.getItem('b2e_token');
    if (!token) {
      window.location.href = '/login';
      return;
    }
    const res = await fetch(`${API_URL}/cart`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ productId: product._id, quantity: 1, unitPrice: product.price }),
    });
    if (res.ok) {
      window.location.href = '/cart';
    } else {
      alert('Failed to add to cart');
    }
  }

  return (
    <div className="border rounded p-4 h-fit">
      <div className="text-2xl font-semibold mb-3">PKR {product.price}</div>
      <button onClick={addToCart} className="w-full bg-black text-white rounded py-2">
        Add to Cart
      </button>
    </div>
  );
}