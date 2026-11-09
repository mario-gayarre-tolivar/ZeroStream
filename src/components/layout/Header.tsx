"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Film, Menu, Search, Tv, Sparkles, Bookmark, X } from "lucide-react";
import { useCatalogPrefetch } from "@/hooks/useCatalogPrefetch";
import { MediaType } from "@/types";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { prefetchCatalog } = useCatalogPrefetch();

  const navLinks: { href: string; label: string; icon: any; mediaType?: MediaType }[] = [
    { href: "/", label: "Inicio", icon: Film },
    { href: "/peliculas", label: "Películas", icon: Film, mediaType: "movie" },
    { href: "/series", label: "Series", icon: Tv, mediaType: "tv" },
    { href: "/anime", label: "Anime", icon: Sparkles, mediaType: "anime" },
    { href: "/mi-lista", label: "Mi Lista", icon: Bookmark },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // Redirige al catálogo correspondiente o películas por defecto
    const targetSection = pathname.includes("/anime")
      ? "/anime"
      : pathname.includes("/series")
      ? "/series"
      : "/peliculas";

    startTransition(() => {
      router.push(`${targetSection}?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-bold tracking-tight text-white transition-opacity hover:opacity-90"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-white shadow-sm">
              <Film className="h-4 w-4" />
            </span>
            <span>
              Zero<span className="text-accent">Stream</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-1 md:flex" aria-label="Navegación principal">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onMouseEnter={() => {
                    if (link.mediaType) prefetchCatalog(link.mediaType);
                  }}
                  className={`rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-surface-active text-white"
                      : "text-slate-400 hover:bg-surface-hover hover:text-slate-200"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Search Bar & Mobile Trigger */}
        <div className="flex items-center gap-3">
          <form
            onSubmit={handleSearchSubmit}
            className="relative hidden sm:block w-64 md:w-80"
            role="search"
          >
            <input
              type="search"
              placeholder="Buscar título o género..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface px-9 py-1.5 text-sm text-slate-100 placeholder-slate-500 transition-colors focus:border-accent focus:bg-surface-hover focus:outline-none"
            />
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300"
                aria-label="Limpiar búsqueda"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </form>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex items-center justify-center rounded-lg p-2 text-slate-400 hover:bg-surface-hover hover:text-white md:hidden"
            aria-expanded={mobileMenuOpen}
            aria-label="Abrir menú de navegación"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-border bg-surface px-4 pb-5 pt-3 md:hidden">
          <form onSubmit={handleSearchSubmit} className="mb-4 relative">
            <input
              type="search"
              placeholder="Buscar título o género..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-9 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-accent focus:outline-none"
            />
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
          </form>

          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-surface-active text-white"
                      : "text-slate-400 hover:bg-surface-hover hover:text-slate-200"
                  }`}
                >
                  {Icon && <Icon className="h-4 w-4 text-slate-400" />}
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
