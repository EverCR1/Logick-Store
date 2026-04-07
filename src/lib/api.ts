import { FiltrosProducto, Producto, ProductosPaginados } from '@/types/producto'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${endpoint}`

  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    ...options,
  })

  if (!res.ok) {
    throw new Error(`Error ${res.status}: ${res.statusText}`)
  }

  return res.json()
}

// ── Tienda — Productos ────────────────────────────────────────────────────────

export const tiendaApi = {
  productos: {
    listar: (filtros: FiltrosProducto = {}) => {
      const params = new URLSearchParams()
      Object.entries(filtros).forEach(([key, val]) => {
        if (val !== undefined && val !== '' && val !== false) {
          params.set(key, String(val))
        }
      })
      const query = params.toString() ? `?${params.toString()}` : ''
      return request<{ success: boolean; productos: { data: Producto[] } & object }>(`/tienda/productos${query}`)
    },

    detalle: (id: number) =>
      request<{ success: boolean; producto: Producto }>(`/tienda/productos/${id}`),

    buscar: (q: string) =>
      request<{ success: boolean; productos: Producto[] }>(`/tienda/productos/buscar?q=${encodeURIComponent(q)}`),

    destacados: () =>
      request<{ success: boolean; productos: Producto[] }>('/tienda/productos/destacados'),

    ofertas: (page = 1) =>
      request<{ success: boolean; productos: ProductosPaginados }>(`/tienda/productos/ofertas?page=${page}`),
  },
}