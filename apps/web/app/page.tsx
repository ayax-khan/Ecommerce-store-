async function fetchHomeSections() {
  const api = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
  try {
    const res = await fetch(`${api}/products/home-sections`, { next: { revalidate: 60 } });
    if (!res.ok) return { hotDeals: [], bestSellers: [], newArrivals: [] };
    return res.json();
  } catch {
    return { hotDeals: [], bestSellers: [], newArrivals: [] };
  }
}

import { Hero } from '../components/Hero';
import { ProductCard } from '../components/ProductCard';

export default async function HomePage() {
  const { hotDeals, bestSellers, newArrivals } = await fetchHomeSections();
  return (
    <div className="py-6">
      <Hero />
      <section className="mt-8">
        <h2 className="text-lg font-semibold mb-3">Hot Deals</h2>
        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }}>
          {hotDeals.map((p: any) => (
            <ProductCard key={p._id} product={p} />
          ))}
          {hotDeals.length === 0 && (
            <div className="text-sm text-gray-500">No products yet.</div>
          )}
        </div>
      </section>
      <section className="mt-8">
        <h2 className="text-lg font-semibold mb-3">Best Sellers</h2>
        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }}>
          {bestSellers.map((p: any) => (
            <ProductCard key={p._id} product={p} />
          ))}
          {bestSellers.length === 0 && (
            <p className="text-sm text-neutral-500">No best sellers yet.</p>
          )}
        </div>
      </section>
      <section className="mt-8">
        <h2 className="text-lg font-semibold mb-3">New Arrivals</h2>
        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }}>
          {newArrivals.map((p: any) => (
            <ProductCard key={p._id} product={p} />
          ))}
          {newArrivals.length === 0 && (
            <p className="text-sm text-neutral-500">No new arrivals yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}
