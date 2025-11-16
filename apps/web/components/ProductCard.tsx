type Product = { _id: string; title: string; price: number };

export function ProductCard({ product }: { product: Product }) {
  return (
    <a href={`/product/${product._id}`} className="border rounded-lg p-3 hover:shadow-md hover:-translate-y-0.5 transition-all bg-white/70 dark:bg-neutral-900/70">
      <div className="w-full aspect-square rounded mb-3 bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-700" />
      <div className="font-semibold mb-1 truncate">{product.title}</div>
      <div className="text-sm text-neutral-700 dark:text-neutral-300">PKR {product.price}</div>
    </a>
  );
}
