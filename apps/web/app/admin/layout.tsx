"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ThemeToggle } from "../../components/ThemeToggle";

function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = window.localStorage.getItem("b2e_token");
    if (!token) {
      router.replace("/login");
    }
  }, [router]);

  return (
    <div className="h-screen flex bg-neutral-50 dark:bg-neutral-900 overflow-hidden">
      <aside className="w-60 bg-white dark:bg-neutral-950 border-r dark:border-neutral-800 flex flex-col sticky top-0 left-0 h-screen">
        <div className="h-16 flex items-center justify-between px-4 border-b border-neutral-200 dark:border-neutral-800 text-sm font-semibold text-neutral-800 dark:text-neutral-100">
          <span>Buy2Enjoy Admin</span>
          <ThemeToggle />
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 text-sm overflow-y-auto">
          <a
            href="/admin"
            className={`block px-3 py-2 rounded hover:bg-neutral-100 ${
              pathname === "/admin" ? "bg-neutral-100 font-medium" : ""
            }`}
          >
            Dashboard
          </a>
          <a
            href="/admin/categories"
            className={`block px-3 py-2 rounded hover:bg-neutral-100 ${
              pathname.startsWith("/admin/categories") ? "bg-neutral-100 font-medium" : ""
            }`}
          >
            Categories
          </a>
          <a
            href="/admin/products"
            className={`block px-3 py-2 rounded hover:bg-neutral-100 ${
              pathname.startsWith("/admin/products") ? "bg-neutral-100 font-medium" : ""
            }`}
          >
            Products
          </a>
          <a
            href="/admin/orders"
            className={`block px-3 py-2 rounded hover:bg-neutral-100 ${
              pathname.startsWith("/admin/orders") ? "bg-neutral-100 font-medium" : ""
            }`}
          >
            Orders
          </a>
        </nav>
        <div className="border-t border-neutral-200 dark:border-neutral-800 px-3 py-3 text-xs text-neutral-500 dark:text-neutral-400 flex justify-between items-center">
          <span>Admin</span>
          <button
            type="button"
            className="hover:underline"
            onClick={() => {
              window.localStorage.removeItem("b2e_token");
              router.push("/");
            }}
          >
            Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 px-8 py-6 overflow-y-auto bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-50">
        {children}
      </main>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
