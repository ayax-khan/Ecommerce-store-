"use client";

import { useEffect, useState } from 'react';
import { ThemeToggle } from './ThemeToggle';

export function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = window.localStorage.getItem('b2e_token');
    const storedRole = window.localStorage.getItem('b2e_role');
    setIsLoggedIn(!!token);
    setRole(storedRole);
  }, []);

  const accountHref = isLoggedIn ? '/account/orders' : '/login';
  const cartHref = '/cart';

  function handleLogout() {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem('b2e_token');
    window.localStorage.removeItem('b2e_role');
    window.localStorage.removeItem('b2e_email');
    window.location.href = '/';
  }

  return (
    <div className="sticky top-0 z-40 border-b border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-950/70 backdrop-blur supports-[backdrop-filter]:bg-white/50">
      <div className="container mx-auto px-4 py-3 flex items-center gap-4">
        <a href="/" className="font-extrabold text-xl">Buy2Enjoy</a>
        <form
          action="/catalog"
          className="flex-1 flex"
        >
          <input
            name="q"
            className="flex-1 h-10 px-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white/80 dark:bg-neutral-900"
            placeholder="Search stationery..."
          />
        </form>
        <nav className="hidden md:flex items-center gap-4 text-sm">
          <a href="/catalog" className="hover:underline">Catalog</a>
          <a href="#" className="hover:underline">Wishlist</a>
          <a href={accountHref} className="hover:underline">Account</a>
          <a href={cartHref} className="hover:underline">Cart</a>
          {isLoggedIn && (
            <button onClick={handleLogout} className="text-xs text-neutral-500 hover:underline">
              Logout
            </button>
          )}
          <ThemeToggle />
        </nav>
      </div>
    </div>
  );
}
