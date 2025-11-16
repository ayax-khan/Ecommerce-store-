export function Footer() {
  return (
    <footer className="mt-10 border-t border-neutral-200 dark:border-neutral-800">
      <div className="container mx-auto px-4 py-8 text-sm text-neutral-600 dark:text-neutral-300 grid md:grid-cols-3 gap-6">
        <div>
          <div className="font-semibold mb-2">Buy2Enjoy</div>
          <p>Quality stationery and fine art supplies.</p>
        </div>
        <div>
          <div className="font-semibold mb-2">Company</div>
          <ul className="space-y-1">
            <li><a href="#" className="hover:underline">About</a></li>
            <li><a href="#" className="hover:underline">Policies</a></li>
            <li><a href="#" className="hover:underline">Contact</a></li>
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-2">Newsletter</div>
          <div className="flex gap-2">
            <input className="flex-1 h-10 px-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white/80 dark:bg-neutral-900" placeholder="you@example.com" />
            <button className="h-10 px-4 rounded-md bg-black text-white dark:bg-white dark:text-black">Subscribe</button>
          </div>
        </div>
      </div>
      <div className="text-center text-xs text-neutral-500 py-4">© {new Date().getFullYear()} Buy2Enjoy. All rights reserved.</div>
    </footer>
  );
}
