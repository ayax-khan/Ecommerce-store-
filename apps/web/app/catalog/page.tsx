async function fetchProducts(params: URLSearchParams) {
  const api = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
  const qs = params.toString();
  const url = qs ? `${api}/products?${qs}` : `${api}/products`;
  try {
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (!res.ok) return { items: [], total: 0, page: 1, totalPages: 1 };
    return res.json();
  } catch {
    return { items: [], total: 0, page: 1, totalPages: 1 };
  }
}

export default async function CatalogPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const params = new URLSearchParams();
  if (searchParams.q && typeof searchParams.q === 'string') params.set('q', searchParams.q);
  if (searchParams.category && typeof searchParams.category === 'string') params.set('category', searchParams.category);
  if (searchParams.brand && typeof searchParams.brand === 'string') params.set('brand', searchParams.brand);
  if (searchParams.minPrice && typeof searchParams.minPrice === 'string') params.set('minPrice', searchParams.minPrice);
  if (searchParams.maxPrice && typeof searchParams.maxPrice === 'string') params.set('maxPrice', searchParams.maxPrice);
  if (searchParams.sort && typeof searchParams.sort === 'string') params.set('sort', searchParams.sort);
  if (searchParams.page && typeof searchParams.page === 'string') params.set('page', searchParams.page);

  const result = await fetchProducts(params);
  const items = Array.isArray(result) ? result : result.items || [];
  const total = (result as any).total ?? items.length;
  const page = (result as any).page ?? 1;
  const totalPages = (result as any).totalPages ?? 1;

  const currentSort = params.get('sort') || 'newest';
  const currentCategory = params.get('category') || '';
  const currentBrand = params.get('brand') || '';
  const currentQ = params.get('q') || '';
  const currentMin = params.get('minPrice') || '';
  const currentMax = params.get('maxPrice') || '';

  return (
    <div className="py-4 space-y-4">
      <form method="GET" className="grid gap-3 md:grid-cols-4 text-sm">
        <input name="q" defaultValue={currentQ} className="border rounded px-2 py-1" placeholder="Search..." />
        <select name="category" defaultValue={currentCategory} className="border rounded px-2 py-1">
          <option value="">All categories</option>
          <option value="school">School</option>
          <option value="pens">Pens</option>
          <option value="office">Office</option>
          <option value="fine-arts">Fine arts</option>
        </select>
        <input name="brand" defaultValue={currentBrand} className="border rounded px-2 py-1" placeholder="Brand" />
        <select name="sort" defaultValue={currentSort} className="border rounded px-2 py-1">
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
        <div className="grid grid-cols-2 gap-2 md:col-span-2">
          <input name="minPrice" defaultValue={currentMin} className="border rounded px-2 py-1" placeholder="Min price" />
          <input name="maxPrice" defaultValue={currentMax} className="border rounded px-2 py-1" placeholder="Max price" />
        </div>
        <button type="submit" className="border rounded px-3 py-1 md:col-span-2">Apply filters</button>
      </form>
      <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
        {items.map((p: any) => (
          <a key={p._id} href={`/product/${p._id}`} className="border rounded p-3 hover:shadow">
            <div className="font-semibold mb-1 truncate">{p.title}</div>
            <div className="text-sm">PKR {p.price}</div>
          </a>
        ))}
        {items.length === 0 && (
          <div className="text-sm text-gray-500">No products match your filters.</div>
        )}
      </div>
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 text-sm mt-4">
          <span>Page {page} of {totalPages}</span>
        </div>
      )}
    </div>
  );
}
