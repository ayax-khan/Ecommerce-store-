export function ThemeScript() {
  const code = `(() => {
    try {
      const ls = localStorage.getItem('theme');
      const mql = window.matchMedia('(prefers-color-scheme: dark)');
      const dark = ls ? ls === 'dark' : mql.matches;
      const root = document.documentElement;
      if (dark) root.classList.add('dark'); else root.classList.remove('dark');
      root.style.colorScheme = dark ? 'dark' : 'light';
    } catch { /* ignore */ }
  })();`;
  return (
    <script dangerouslySetInnerHTML={{ __html: code }} />
  );
}
