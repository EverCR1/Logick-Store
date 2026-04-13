'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useCuenta } from '@/store/cuenta'
import { tiendaApi } from '@/lib/api'
import Link from 'next/link'
import Image from 'next/image'
import { Star, Loader2 } from 'lucide-react'
import { toSlug } from '@/lib/utils'

function formatPrecio(precio: string | number) {
  return `Q${Number(precio).toLocaleString('es-GT', { minimumFractionDigits: 2 })}`
}

export default function FavoritosPage() {
  const token       = useCuenta((s) => s.token)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['cuenta-favoritos'],
    queryFn:  () => tiendaApi.cuenta.favoritos.listar(token!),
    enabled:  !!token,
  })

  const quitar = useMutation({
    mutationFn: (productoId: number) => tiendaApi.cuenta.favoritos.quitar(token!, productoId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cuenta-favoritos'] }),
  })

  const favoritos = data?.favoritos ?? []

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Favoritos</h1>
        <p className="text-sm text-gray-500 mt-0.5">Productos que guardaste para después</p>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-16 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      )}

      {!isLoading && favoritos.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
            <Star className="w-8 h-8 text-gray-300" />
          </div>
          <div>
            <p className="text-gray-700 font-medium">Sin productos favoritos</p>
            <p className="text-sm text-gray-400 mt-1">Guarda productos que te interesen para verlos después</p>
          </div>
          <Link href="/productos" className="px-5 py-2 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors">
            Explorar productos
          </Link>
        </div>
      )}

      {favoritos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {favoritos.map((p: any) => (
            <div key={p.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden group relative">
              <button
                onClick={() => quitar.mutate(p.id)}
                className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-white/80 backdrop-blur-sm text-yellow-400 hover:text-yellow-500 hover:bg-white transition-colors shadow-sm"
                title="Quitar de favoritos"
              >
                <Star className="w-4 h-4 fill-current" />
              </button>
              <Link href={`/productos/${toSlug(p.nombre, p.id)}`}>
                <div className="aspect-square bg-gray-50 relative overflow-hidden">
                  {p.imagen_principal ? (
                    <Image
                      src={p.imagen_principal}
                      alt={p.nombre}
                      fill
                      className="object-contain p-3 group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-200 text-4xl">📦</div>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-xs text-gray-500 truncate">{p.marca}</p>
                  <p className="text-sm font-medium text-gray-800 line-clamp-2 mt-0.5">{p.nombre}</p>
                  <p className="text-sm font-bold text-green-700 mt-1">{formatPrecio(p.precio_venta)}</p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}