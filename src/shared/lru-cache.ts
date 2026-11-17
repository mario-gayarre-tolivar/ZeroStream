/**
 * BoundedMemoryCache: Caché en memoria acotada con política LRU y expiración TTL.
 * Garantiza O(1) en inserción y lectura, desalojando automáticamente entradas antiguas
 * para fijar un tope estricto de consumo de memoria RAM.
 */
interface CacheItem<T> {
  value: T;
  expiresAt: number;
}

export class BoundedMemoryCache<T> {
  private map: Map<string, CacheItem<T>>;
  private readonly maxSize: number;

  constructor(maxSize: number = 100) {
    this.maxSize = Math.max(1, maxSize);
    this.map = new Map();
  }

  /**
   * Obtiene el valor si no ha expirado su TTL.
   * Si ha expirado, retorna undefined pero retiene el valor para consultas de respaldo (getStale).
   */
  get(key: string): T | undefined {
    const item = this.map.get(key);
    if (!item) return undefined;

    if (Date.now() > item.expiresAt) {
      return undefined;
    }

    // Política LRU: refrescar posición al final de la cola
    this.map.delete(key);
    this.map.set(key, item);
    return item.value;
  }

  /**
   * Obtiene la entrada sin verificar expiración (útil para política Stale-If-Error ante caídas de upstream).
   */
  getStale(key: string): T | undefined {
    const item = this.map.get(key);
    return item ? item.value : undefined;
  }

  set(key: string, value: T, ttlMs: number): void {
    if (this.map.has(key)) {
      this.map.delete(key);
    } else if (this.map.size >= this.maxSize) {
      // Desalojar el elemento más antiguo (primer elemento en Map)
      const oldestKey = this.map.keys().next().value;
      if (oldestKey !== undefined) {
        this.map.delete(oldestKey);
      }
    }

    this.map.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    });
  }

  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  delete(key: string): boolean {
    return this.map.delete(key);
  }

  clear(): void {
    this.map.clear();
  }

  get size(): number {
    return this.map.size;
  }
}
