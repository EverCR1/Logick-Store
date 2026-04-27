import { CategoriaArbol, CategoriaSugerida, FiltrosProducto, Producto, ProductosPaginados } from '@/types/producto'
import { AuthResponse, LoginPayload, RegistroPayload, CuentaData, PedidoDetalle } from '@/types/cuenta'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'https://api.logickem.com/api'

function authHeaders(token: string): HeadersInit {
  return { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'Accept': 'application/json' }
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${endpoint}`

  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    ...options,
  })

  if (!res.ok) {
    const error: any = new Error(`Error ${res.status}: ${res.statusText}`)
    error.response = res
    throw error
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

  resenas: {
    listar: (productoId: number) =>
      request<{ success: boolean; promedio: number | null; total: number; resenas: any[] }>(
        `/tienda/productos/${productoId}/resenas`
      ),

    mia: (productoId: number, token: string) =>
      request<{ success: boolean; resena: any | null; puede_resenar: boolean }>(
        `/tienda/productos/${productoId}/resenas/mia`,
        { headers: authHeaders(token) }
      ),

    crear: (productoId: number, token: string, payload: { rating: number; comentario?: string }) =>
      request<{ success: boolean; message: string }>(
        `/tienda/productos/${productoId}/resenas`,
        { method: 'POST', headers: authHeaders(token), body: JSON.stringify(payload) }
      ),
  },

  preguntas: {
    listar: (productoId: number) =>
      request<{ success: boolean; preguntas: any[] }>(
        `/tienda/productos/${productoId}/preguntas`
      ),

    crear: (productoId: number, token: string, payload: { pregunta: string }) =>
      request<{ success: boolean; message: string }>(
        `/tienda/productos/${productoId}/preguntas`,
        { method: 'POST', headers: authHeaders(token), body: JSON.stringify(payload) }
      ),
  },

  categorias: {
    tree: () =>
      request<{ success: boolean; categorias: CategoriaArbol[] }>('/tienda/categorias'),

    buscar: (q: string) =>
      request<{ success: boolean; categorias: CategoriaSugerida[] }>(
        `/tienda/categorias/buscar?q=${encodeURIComponent(q)}`
      ),
  },

  auth: {
    registro: (payload: RegistroPayload) =>
      request<AuthResponse>('/tienda/auth/registro', {
        method: 'POST',
        body:   JSON.stringify(payload),
      }),

    login: (payload: LoginPayload) =>
      request<AuthResponse>('/tienda/auth/login', {
        method: 'POST',
        body:   JSON.stringify(payload),
      }),

    googleVerify: (code: string) =>
      request<AuthResponse>('/tienda/auth/google/verify', {
        method: 'POST',
        body:   JSON.stringify({ code }),
      }),

    logout: (token: string) =>
      request<{ success: boolean }>('/tienda/auth/logout', {
        method:  'POST',
        headers: authHeaders(token),
      }),

    me: (token: string) =>
      request<{ success: boolean; cuenta: CuentaData }>('/tienda/auth/me', {
        headers: authHeaders(token),
      }),

    actualizarPerfil: (token: string, payload: Partial<Pick<CuentaData, 'nombre' | 'apellido' | 'email' | 'telefono'>>) =>
      request<{ success: boolean; cuenta: CuentaData }>('/tienda/auth/perfil', {
        method:  'PUT',
        headers: authHeaders(token),
        body:    JSON.stringify(payload),
      }),

    cambiarPassword: (token: string, payload: { password_actual: string; password: string; password_confirmation: string }) =>
      request<{ success: boolean }>('/tienda/auth/password', {
        method:  'PUT',
        headers: authHeaders(token),
        body:    JSON.stringify(payload),
      }),
  },

  // ── Sucursales ────────────────────────────────────────────────────────────
  sucursales: {
    listar: () =>
      request<{
        success: boolean
        sucursales: {
          id: number; nombre: string; direccion: string | null
          municipio: string | null; departamento: string | null
          referencia: string | null; horario: string | null
          telefono: string | null; lat: number | null; lng: number | null
        }[]
      }>('/tienda/sucursales'),
  },

  // ── Reportes de problemas ─────────────────────────────────────────────────
  reportes: {
    categorias: () =>
      request<{ success: boolean; categorias: Record<string, string> }>('/tienda/reportes/categorias'),

    enviar: (payload: {
      categoria: string
      descripcion: string
      nombre_contacto?: string
      email_contacto?: string
      telefono_contacto?: string
    }, token?: string | null) =>
      request<{ success: boolean; message: string }>('/tienda/reportes', {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept':       'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      }),

    miReportes: (token: string) =>
      request<{
        success: boolean
        reportes: {
          id: number
          categoria: string
          descripcion: string
          estado: string
          puntos_otorgados: number | null
          nota_admin: string | null
          created_at: string
        }[]
      }>('/tienda/cuenta/reportes', { headers: authHeaders(token) }),
  },

  // ── Cupones ───────────────────────────────────────────────────────────────
  cupones: {
    validar: (codigo: string, subtotal: number, token?: string | null) =>
      request<{
        success: boolean
        cupon_id: number
        codigo: string
        descripcion: string | null
        tipo: 'porcentaje' | 'monto_fijo'
        valor: number
        descuento: number
        maximo_descuento: number | null
      }>('/tienda/cupones/validar', {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept':       'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ codigo, subtotal }),
      }),
  },

  // ── Cuenta autenticada ────────────────────────────────────────────────────
  cuenta: {
    pedidos: (token: string) =>
      request<{ success: boolean; pedidos: any[] }>('/tienda/cuenta/pedidos', {
        headers: authHeaders(token),
      }),

    pedido: (token: string, numero: string) =>
      request<{ success: boolean; pedido: PedidoDetalle }>(`/tienda/cuenta/pedidos/${numero}`, {
        headers: authHeaders(token),
      }),

    direcciones: {
      listar: (token: string) =>
        request<{ success: boolean; direcciones: any[] }>('/tienda/cuenta/direcciones', {
          headers: authHeaders(token),
        }),

      crear: (token: string, payload: object) =>
        request<{ success: boolean; direccion: any }>('/tienda/cuenta/direcciones', {
          method:  'POST',
          headers: authHeaders(token),
          body:    JSON.stringify(payload),
        }),

      actualizar: (token: string, id: number, payload: object) =>
        request<{ success: boolean; direccion: any }>(`/tienda/cuenta/direcciones/${id}`, {
          method:  'PUT',
          headers: authHeaders(token),
          body:    JSON.stringify(payload),
        }),

      eliminar: (token: string, id: number) =>
        request<{ success: boolean }>(`/tienda/cuenta/direcciones/${id}`, {
          method:  'DELETE',
          headers: authHeaders(token),
        }),

      marcarPrincipal: (token: string, id: number) =>
        request<{ success: boolean }>(`/tienda/cuenta/direcciones/${id}/principal`, {
          method:  'PUT',
          headers: authHeaders(token),
        }),
    },

    cupones: {
      listar: (token: string) =>
        request<{ success: boolean; cupones: any[] }>('/tienda/cuenta/cupones', {
          headers: authHeaders(token),
        }),
    },

    puntos: {
      listar: (token: string) =>
        request<{
          success: boolean
          saldo: number
          opciones_canje: Record<string, number>
          historial: { id: number; tipo: string; puntos: number; descripcion: string; fecha: string }[]
        }>('/tienda/cuenta/puntos', {
          headers: authHeaders(token),
        }),

      canjear: (token: string, puntos: number) =>
        request<{
          success: boolean
          message: string
          cupon: { codigo: string; valor: number; fecha_fin: string }
          nuevo_saldo: number
        }>('/tienda/cuenta/puntos/canjear', {
          method:  'POST',
          headers: authHeaders(token),
          body:    JSON.stringify({ puntos }),
        }),
    },

    favoritos: {
      listar: (token: string) =>
        request<{ success: boolean; favoritos: any[] }>('/tienda/cuenta/favoritos', {
          headers: authHeaders(token),
        }),

      agregar: (token: string, productoId: number) =>
        request<{ success: boolean }>('/tienda/cuenta/favoritos', {
          method:  'POST',
          headers: authHeaders(token),
          body:    JSON.stringify({ producto_id: productoId }),
        }),

      quitar: (token: string, productoId: number) =>
        request<{ success: boolean }>(`/tienda/cuenta/favoritos/${productoId}`, {
          method:  'DELETE',
          headers: authHeaders(token),
        }),
    },
  },
}