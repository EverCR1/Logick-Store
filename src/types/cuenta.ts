export interface CuentaData {
  id: number
  nombre: string
  apellido: string
  nombre_completo: string
  email: string
  telefono: string | null
  avatar: string | null
  puntos_saldo: number
  estado: string
  tiene_password: boolean
  creado_en: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegistroPayload {
  nombre: string
  apellido: string
  email: string
  password: string
  password_confirmation: string
  telefono?: string
}

export interface AuthResponse {
  success: boolean
  token: string
  cuenta: CuentaData
}

export interface PedidoItemDetalle {
  id: number
  producto_id: number | null
  nombre_producto: string
  cantidad: number
  precio_unitario: number
  subtotal: number
  imagen: string | null
}

export interface PedidoDetalle {
  id: number
  numero_pedido: string
  estado: string
  metodo_pago: string
  subtotal: number
  costo_envio: number
  descuento_cupon: number
  total: number
  puntos_ganados: number
  nombre: string
  telefono: string
  departamento: string
  municipio: string
  direccion: string
  referencias: string | null
  notas: string | null
  comprobante_url: string | null
  created_at: string
  detalles: PedidoItemDetalle[]
}