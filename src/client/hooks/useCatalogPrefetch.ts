"use client";

import { useEffect, useCallback } from "react";
import { MediaType } from "@/types";

const clientMemoryCache = new Set<string>();

/**
 * Hook para precarga pasiva de catálogos en el cliente.
 * Al cargar o al hacer hover sobre las categorías, precarga los JSONs en segundo plano
 * garantizando cambio de pestañas instantáneo sin latencia ni recargas.
 */
export function useCatalogPrefetch() {
  const prefetchCatalog = useCallback((type: MediaType) => {
    const url = `/api/catalog/${type}?page=1`;
    if (clientMemoryCache.has(url)) return;

    clientMemoryCache.add(url);
    if (typeof window !== "undefined") {
      fetch(url, { priority: "low" }).catch(() => {
        clientMemoryCache.delete(url);
      });
    }
  }, []);

  // Precarga pasiva durante tiempo inactivo del navegador
  useEffect(() => {
    if (typeof window === "undefined") return;

    const timer = setTimeout(() => {
      prefetchCatalog("movie");
      prefetchCatalog("tv");
      prefetchCatalog("anime");
    }, 800); // 800ms tras hidratación inicial

    return () => clearTimeout(timer);
  }, [prefetchCatalog]);

  return { prefetchCatalog };
}
