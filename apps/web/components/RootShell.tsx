"use client";

import { usePathname } from "next/navigation";
import { AnnouncementBar } from "./AnnouncementBar";
import { CategoriesNav } from "./CategoriesNav";
import { Header } from "./Header";
import { Footer } from "./Footer";

export function RootShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    // For admin area, show only the nested /admin layout (sidebar etc.)
    return <>{children}</>;
  }

  // Storefront shell
  return (
    <>
      <AnnouncementBar />
      <Header />
      <CategoriesNav />
      <main className="container mx-auto px-4">{children}</main>
      <Footer />
    </>
  );
}
