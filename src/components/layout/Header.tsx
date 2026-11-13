"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Film, Menu, Tv, Clapperboard, Bookmark, X } from "lucide-react";
import { useCatalogPrefetch } from "@/hooks/useCatalogPrefetch";
import { LiveSearch } from "./LiveSearch";
import { MediaType } from "@/types";

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { prefetchCatalog } = useCatalogPrefetch();

  const navLinks: { href: string; label: string; icon: typeof Film; mediaType?: MediaType }[] = [
    { href: "/", label: "Inicio", icon: Film },
    { href: "/peliculas", label: "Películas", icon: Film, mediaType: "movie" },
    { href: "/series", label: "Series", icon: Tv, mediaType: "tv" },
    { href: "/anime", label: "Anime", icon: Clapperboard, mediaType: "anime" },
    { href: "/mi-lista", label: "Mi lista", icon: Bookmark },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="flex items-center gap-2.5 font-display text-lg font-bold tracking-tight text-foreground transition-opacity hover:opacity-90"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-poster bg-accent text-accent-ink">
              <Film className="h-4 w-4" />
            </span>
            <span className="font-medium tracking-tight">
              Zero<span className="text-accent font-semibold">Stream</span>
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
                  className={`rounded-poster px-3 py-1.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "text-foreground border-b-2 border-accent"
                      : "text-muted hover:bg-surface-hover hover:text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Live Search Bar (Desktop) & Mobile Trigger */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            <LiveSearch />
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex items-center justify-center rounded-poster p-2 text-muted hover:bg-surface-hover hover:text-foreground md:hidden"
            aria-expanded={mobileMenuOpen}
            aria-label="Abrir menú de navegación"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-border bg-surface px-4 pb-5 pt-3 md:hidden">
          <div className="mb-4">
            <LiveSearch onSelect={() => setMobileMenuOpen(false)} isMobile />
          </div>

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
                  className={`flex items-center gap-3 rounded-poster px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-surface-active text-foreground border-l-2 border-accent"
                      : "text-muted hover:bg-surface-hover hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4 text-muted" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
