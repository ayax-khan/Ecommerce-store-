export default function CatalogLayout({ children }: { children: React.ReactNode }) {
  return (
    <section className="p-6">
      <h1 className="text-2xl font-bold mb-4">Catalog</h1>
      {children}
    </section>
  );
}
