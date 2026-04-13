import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CuentaData } from '@/types/cuenta'

interface CuentaStore {
  token: string | null
  cuenta: CuentaData | null
  autenticado: boolean
  iniciarSesion: (token: string, cuenta: CuentaData) => void
  cerrarSesion: () => void
  actualizarCuenta: (cuenta: CuentaData) => void
}

export const useCuenta = create<CuentaStore>()(
  persist(
    (set) => ({
      token:       null,
      cuenta:      null,
      autenticado: false,

      iniciarSesion: (token, cuenta) =>
        set({ token, cuenta, autenticado: true }),

      cerrarSesion: () =>
        set({ token: null, cuenta: null, autenticado: false }),

      actualizarCuenta: (cuenta) =>
        set({ cuenta }),
    }),
    {
      name: 'logickem-cuenta', // clave en localStorage
    }
  )
)