'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { useCuenta } from '@/store/cuenta'
import { tiendaApi } from '@/lib/api'

function CallbackInner() {
  const router        = useRouter()
  const searchParams  = useSearchParams()
  const iniciarSesion = useCuenta((s) => s.iniciarSesion)

  useEffect(() => {
    const token = searchParams.get('token')
    const error = searchParams.get('error')

    if (error || !token) {
      router.replace('/auth/login?error=google')
      return
    }

    tiendaApi.auth.me(token)
      .then((res) => {
        iniciarSesion(token, res.cuenta)
        router.replace('/cuenta')
      })
      .catch(() => {
        router.replace('/auth/login?error=google')
      })
  }, [searchParams, router, iniciarSesion])

  return (
    <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    </div>
  )
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    }>
      <CallbackInner />
    </Suspense>
  )
}
