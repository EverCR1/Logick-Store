'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { useCuenta } from '@/store/cuenta'
import { tiendaApi } from '@/lib/api'

function VerificadorSesion() {
  const token        = useCuenta((s) => s.token)
  const autenticado  = useCuenta((s) => s.autenticado)
  const cerrarSesion = useCuenta((s) => s.cerrarSesion)
  const actualizarCuenta = useCuenta((s) => s.actualizarCuenta)

  useEffect(() => {
    if (!autenticado || !token) return

    // Verificar que el token sigue siendo válido al montar la app
    tiendaApi.auth.me(token)
      .then((res) => actualizarCuenta(res.cuenta))
      .catch(() => cerrarSesion()) // token inválido → cerrar sesión local
  }, []) // solo al montar, no en cada cambio

  return null
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5,
        retry: 1,
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      <VerificadorSesion />
      {children}
    </QueryClientProvider>
  )
}