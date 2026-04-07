export interface ImagenProducto {
  id: number
  url: string
  url_thumb: string
  url_medium: string
  es_principal: boolean
}

export interface Categoria {
  id: number
  nombre: string
}

export interface Producto {
  id: number
  nombre: string
  marca: string | null
  color: string | null
  precio_venta: number
  precio_oferta: number | null
  precio_final: number
  en_oferta: boolean
  disponible: boolean
  garantia: string | null
  categorias: Categoria[]
  imagen_principal: string | null
  imagenes: ImagenProducto[]
  // Solo en detalle
  descripcion?: string | null
  especificaciones?: string | null
}

export interface Paginacion {
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number | null
  to: number | null
}

export interface ProductosPaginados extends Paginacion {
  data: Producto[]
}

export interface FiltrosProducto {
  search?: string
  categoria_id?: number
  marca?: string
  precio_min?: number
  precio_max?: number
  solo_ofertas?: boolean
  sort?: 'nombre_asc' | 'precio_asc' | 'precio_desc' | 'nuevos'
  page?: number
  per_page?: number
}