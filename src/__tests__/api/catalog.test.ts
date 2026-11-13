import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "@/app/api/catalog/[type]/route";

describe("Route Handler /api/catalog/[type]", () => {
  it("debe retornar error 400 si el tipo no es movie, tv o anime", async () => {
    const req = new NextRequest("http://localhost:3000/api/catalog/invalid");
    const res = await GET(req, { params: Promise.resolve({ type: "invalid" }) });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body).toHaveProperty("error");
  });

  it("debe retornar catálogo 200 con cabeceras de caché para type=movie", async () => {
    const req = new NextRequest("http://localhost:3000/api/catalog/movie?page=1");
    const res = await GET(req, { params: Promise.resolve({ type: "movie" }) });

    expect(res.status).toBe(200);
    expect(res.headers.get("Cache-Control")).toContain("public");
    expect(res.headers.get("X-Catalog-Source")).toBeDefined();

    const body = await res.json();
    expect(body.type).toBe("movie");
    expect(body.page).toBe(1);
    expect(Array.isArray(body.results)).toBe(true);
    expect(body.results.length).toBeGreaterThan(0);
  });

  it("debe responder para anime con resultados estructurados", async () => {
    const req = new NextRequest("http://localhost:3000/api/catalog/anime?page=1");
    const res = await GET(req, { params: Promise.resolve({ type: "anime" }) });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.type).toBe("anime");
    expect(body.results.length).toBeGreaterThan(0);
  });
});
