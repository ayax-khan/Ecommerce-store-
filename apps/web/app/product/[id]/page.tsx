import { ProductBuyBox } from '../../../components/ProductBuyBox';

async function fetchProduct(id: string) {
  const api = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
  try {
    const res = await fetch(`${api}/products/${id}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await fetchProduct(params.id);
  if (!product) return <div className="p-6 text-sm text-gray-500">Product not found.</div>;
  return (
    <div className="p-6 grid gap-4" style={{ gridTemplateColumns: '1.5fr 1fr' }}>
      <div>
        {/* image placeholder */}
        <div className="w-full aspect-video bg-gray-100 rounded mb-4" />
        <div className="prose max-w-none">
          <h1 className="text-2xl font-bold mb-2">{product.title}</h1>
          <p className="text-gray-700">{product.description}</p>
        </div>
      </div>
      <ProductBuyBox product={product} />
    </div>
  );
}
