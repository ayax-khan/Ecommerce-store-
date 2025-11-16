"use client";

import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    // Read initial state from document to avoid flicker
    setMounted(true);
    const isDark = document.documentElement.classList.contains('dark');
    setDark(isDark);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    document.documentElement.style.colorScheme = next ? 'dark' : 'light';
    try {
      localStorage.setItem('theme', next ? 'dark' : 'light');
    } catch {}
  };

  if (!mounted) return null;
  return (
    <button
      aria-pressed={dark}
      onClick={toggle}
      className="h-8 px-3 rounded-md border border-neutral-300 dark:border-neutral-700 text-xs bg-white/80 dark:bg-neutral-900/80 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
      title={dark ? 'Dark mode' : 'Light mode'}
    >
      {dark ? 'Dark' : 'Light'}
    </button>
  );
}
