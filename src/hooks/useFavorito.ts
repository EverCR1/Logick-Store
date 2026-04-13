import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useCuenta } from '@/store/cuenta'
import { tiendaApi } from '@/lib/api'

const QUERY_KEY = ['favoritos-ids']

/**
 * Carga los IDs favoritos una sola vez (cache compartido entre todos los componentes).
 * Devuelve esFavorito + toggle para un productoId específico.
 */
export function useFavorito(productoId: number) {
  const token       = useCuenta((s) => s.token)
  const autenticado = useCuenta((s) => s.autenticado)
  const queryClient = useQueryClient()

  // ── Obtener lista de IDs favoritos ─────────────────────────────────────────
  const { data: ids = [] } = useQuery<number[]>({
    queryKey: QUERY_KEY,
    queryFn:  async () => {
      const res = await tiendaApi.cuenta.favoritos.listar(token!)
      return res.favoritos.map((f: any) => f.id as number)
    },
    enabled:   autenticado && !!token,
    staleTime: 1000 * 60 * 5,
  })

  const esFavorito = ids.includes(productoId)

  // ── Mutación optimista ──────────────────────────────────────────────────────
  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      esFavorito
        ? tiendaApi.cuenta.favoritos.quitar(token!, productoId)
        : tiendaApi.cuenta.favoritos.agregar(token!, productoId),

    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY })
      const prev = queryClient.getQueryData<number[]>(QUERY_KEY) ?? []
      const next = esFavorito
        ? prev.filter((id) => id !== productoId)
        : [...prev, productoId]
      queryClient.setQueryData(QUERY_KEY, next)
      return { prev }
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(QUERY_KEY, ctx.prev)
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ['cuenta-favoritos'] })
    },
  })

  const toggle = () => {
    if (!autenticado) return // el componente decide qué hacer sin sesión
    mutate()
  }

  return { esFavorito, toggle, isPending, autenticado }
}