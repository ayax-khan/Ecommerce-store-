const categories = [
  'Deals', 'Electronics', 'Fine Arts', 'Pens', 'Brushes', 'Office Supplies', 'School Supplies', 'Books & Novels', 'Arts & Crafts', 'Canvas & Easel', 'Top Brands'
];

export function CategoriesNav() {
  return (
    <div className="border-y border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-neutral-950/60 backdrop-blur sticky top-0 z-30">
      <div className="container mx-auto px-4 overflow-x-auto">
        <nav className="flex gap-2 py-3 text-sm min-w-full">
          {categories.map((c) => (
            <a key={c} href="/catalog" className="whitespace-nowrap px-3 py-1.5 rounded-full border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors">{c}</a>
          ))}
        </nav>
      </div>
    </div>
  );
}
