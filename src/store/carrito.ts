import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Producto } from '@/types/producto'

export interface ItemCarrito {
  id: number
  nombre: string
  precio: number
  imagen: string | null
  cantidad: number
  stock: number   // máximo permitido
}

interface CarritoStore {
  items: ItemCarrito[]
  agregar: (producto: Producto) => void
  quitar: (id: number) => void
  actualizarCantidad: (id: number, cantidad: number) => void
  vaciar: () => void
  total: () => number
  totalItems: () => number
}

export const useCarrito = create<CarritoStore>()(
  persist(
    (set, get) => ({
      items: [],

      agregar: (producto) => {
        const items  = get().items
        const existe = items.find((i) => i.id === producto.id)
        const stock  = producto.stock ?? 99

        if (existe) {
          if (existe.cantidad >= stock) return  // tope de stock
          set({
            items: items.map((i) =>
              i.id === producto.id ? { ...i, cantidad: i.cantidad + 1 } : i
            ),
          })
        } else {
          set({
            items: [
              ...items,
              {
                id:       producto.id,
                nombre:   producto.nombre,
                precio:   producto.precio_final,
                imagen:   producto.imagen_principal,
                cantidad: 1,
                stock,
              },
            ],
          })
        }
      },

      quitar: (id) =>
        set({ items: get().items.filter((i) => i.id !== id) }),

      actualizarCantidad: (id, cantidad) => {
        if (cantidad <= 0) {
          get().quitar(id)
          return
        }
        const item = get().items.find((i) => i.id === id)
        const tope = item?.stock ?? 99
        set({
          items: get().items.map((i) =>
            i.id === id ? { ...i, cantidad: Math.min(cantidad, tope) } : i
          ),
        })
      },

      vaciar: () => set({ items: [] }),

      total: () =>
        get().items.reduce((sum, i) => sum + i.precio * i.cantidad, 0),

      totalItems: () =>
        get().items.reduce((sum, i) => sum + i.cantidad, 0),
    }),
    { name: 'logick-carrito' }
  )
)