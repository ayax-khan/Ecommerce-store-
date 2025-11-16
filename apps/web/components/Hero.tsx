export function Hero() {
  return (
    <div className="relative overflow-hidden rounded-xl p-[1px] bg-gradient-to-r from-neutral-700 via-neutral-800 to-neutral-900">
      <div className="relative bg-neutral-900 text-white rounded-xl p-8 md:p-12">
        <div className="absolute -top-10 -right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="max-w-2xl relative">
          <div className="text-sm uppercase tracking-wide text-neutral-300">Seasonal Offers</div>
          <h2 className="text-3xl md:text-4xl font-extrabold mt-2">Back-to-School Essentials</h2>
          <p className="mt-2 text-neutral-200">Save up to 20% on notebooks, pens, and art supplies. Limited time only.</p>
          <div className="mt-4 flex gap-3">
            <a href="/catalog" className="inline-block bg-white text-black rounded-md px-4 py-2 text-sm font-medium">Shop Now</a>
            <a href="/catalog" className="inline-block bg-transparent border border-white/40 rounded-md px-4 py-2 text-sm">View Deals</a>
          </div>
        </div>
      </div>
    </div>
  );
}
