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

export interface CategoriaArbol {
  id: number
  nombre: string
  parent_id: number | null
  children_recursive: CategoriaArbol[]
}

export interface CategoriaSugerida {
  id: number
  nombre: string
  parent_id: number | null
  imagen: string | null
}

export interface Atributo {
  nombre: string
  valor: string
}

export interface Variante {
  id: number
  color: string | null
  atributos: Atributo[]
  precio_venta: number
  precio_oferta: number | null
  en_oferta: boolean
  imagen_principal: string | null
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
  stock: number
  garantia: string | null
  categorias: Categoria[]
  imagen_principal: string | null
  imagenes: ImagenProducto[]
  // Solo en detalle
  descripcion?: string | null
  especificaciones?: string | null
  grupo_variante?: string | null
  atributos?: Atributo[]
  variantes?: Variante[]
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
  search_desc?: boolean
  stock?: 'disponible' | 'agotado'
  categoria_id?: number

  marca?: string
  precio_min?: number
  precio_max?: number
  solo_ofertas?: boolean
  sort?: 'nombre_asc' | 'nombre_desc' | 'precio_asc' | 'precio_desc' | 'nuevos' | 'mejor_rating'
  page?: number
  per_page?: number
}