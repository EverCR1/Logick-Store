'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Search } from 'lucide-react'
import { toSlug } from '@/lib/utils'

const LIMITE = 5

interface Rango { label: string; min: number; max: number }

function buildRangos(precios: number[]): Rango[] {
  if (!precios.length) return []
  const min = Math.min(...precios)
  const max = Math.max(...precios)
  const TODOS: Rango[] = [
    { label: 'Menos de Q100',    min: 0,      max: 100     },
    { label: 'Q100 – Q500',      min: 100,    max: 500     },
    { label: 'Q500 – Q1,000',    min: 500,    max: 1_000   },
    { label: 'Q1,000 – Q3,000',  min: 1_000,  max: 3_000   },
    { label: 'Q3,000 – Q10,000', min: 3_000,  max: 10_000  },
    { label: 'Más de Q10,000',   min: 10_000, max: 999_999 },
  ]
  return TODOS.filter(r => r.max > min && r.min <= max)
}

function Seccion({ titulo, children, defaultOpen = true }: {
  titulo: string; children: React.ReactNode; defaultOpen?: boolean
}) {
  const [abierto, setAbierto] = useState(defaultOpen)
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setAbierto(!abierto)}
        className="w-full flex items-center justify-between py-3 text-sm font-semibold text-gray-700 hover:text-gray-900"
      >
        {titulo}
        {abierto ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>
      {abierto && <div className="pb-3">{children}</div>}
    </div>
  )
}

interface Props {
  productos: any[]
  marcasActivas: string[]
  categoriasActivas: string[]
  precioMinActual: string
  precioMaxActual: string
  stockFiltro: string
  search: string
  searchDesc: boolean
  onFiltrar: (updates: Record<string, string | null>) => void
}

export default function FiltrosPanel({
  productos,
  marcasActivas,
  categoriasActivas,
  precioMinActual,
  precioMaxActual,
  stockFiltro,
  search,
  searchDesc,
  onFiltrar,
}: Props) {

  // ── Opciones derivadas ────────────────────────────────────────────────────
  const marcas: string[] = [...new Set(
    productos.map((p: any) => p.marca).filter(Boolean) as string[]
  )].sort()

  const catMap = new Map<number, { id: number; nombre: string }>()
  productos.forEach((p: any) => {
    ;(p.categorias ?? []).forEach((c: any) => {
      if (!catMap.has(c.id)) catMap.set(c.id, { id: c.id, nombre: c.nombre })
    })
  })
  const categorias = [...catMap.values()].sort((a, b) => a.nombre.localeCompare(b.nombre))

  const precios = productos
    .map((p: any) => p.precio_final ?? p.precio_venta ?? 0)
    .filter((v: number) => v > 0)
  const rangos = buildRangos(precios)

  // ── Estado local ──────────────────────────────────────────────────────────
  const [customMin, setCustomMin] = useState(precioMinActual)
  const [customMax, setCustomMax] = useState(precioMaxActual)

  const [busqMarca, setBusqMarca]           = useState('')
  const [verTodasMarcas, setVerTodasMarcas] = useState(false)

  const [busqCat, setBusqCat]             = useState('')
  const [verTodasCats, setVerTodasCats]   = useState(false)

  // ── Precio ────────────────────────────────────────────────────────────────
  const rangoPredefActivo = rangos.find(
    r => String(r.min) === precioMinActual && String(r.max) === precioMaxActual
  )
  const usandoCustom = !!precioMinActual && !rangoPredefActivo

  // ── Handlers ──────────────────────────────────────────────────────────────
  const toggleMarca = (m: string) => {
    const next = marcasActivas.includes(m)
      ? marcasActivas.filter(x => x !== m)
      : [...marcasActivas, m]
    onFiltrar({ marca: next.length ? next.join(',') : null })
  }

  const toggleCategoria = (c: { id: number; nombre: string }) => {
    const slug = toSlug(c.nombre, c.id)
    const idStr = String(c.id)
    const idsActivos = categoriasActivas.map(s => {
      const parts = s.split('-')
      return parts[parts.length - 1]
    })
    const next = idsActivos.includes(idStr)
      ? idsActivos.filter(x => x !== idStr)
      : [...idsActivos, idStr]
    const slugsActivos = categoriasActivas.includes(slug)
      ? categoriasActivas.filter(x => x !== slug)
      : [...categoriasActivas, slug]
    onFiltrar({
      categoria_id: next.length ? next.join(',') : null,
      categoria:    slugsActivos.length === 1 ? slugsActivos[0] : null,
    })
  }

  const aplicarRangoPredef = (r: Rango) => {
    const activo = rangoPredefActivo?.min === r.min
    setCustomMin('')
    setCustomMax('')
    onFiltrar({
      precio_min: activo ? null : String(r.min),
      precio_max: activo ? null : String(r.max),
    })
  }

  const aplicarCustom = () => {
    if (!customMin && !customMax) return onFiltrar({ precio_min: null, precio_max: null })
    onFiltrar({ precio_min: customMin || null, precio_max: customMax || null })
  }

  const hayFiltros =
    marcasActivas.length > 0 || categoriasActivas.length > 0 || precioMinActual || stockFiltro

  // ── Listas filtradas por búsqueda interna ─────────────────────────────────
  const marcasFiltradas = marcas.filter(m =>
    m.toLowerCase().includes(busqMarca.toLowerCase())
  )
  const marcasVisibles = verTodasMarcas ? marcasFiltradas : marcasFiltradas.slice(0, LIMITE)

  const catsFiltradas = categorias.filter(c =>
    c.nombre.toLowerCase().includes(busqCat.toLowerCase())
  )
  const catsVisibles = verTodasCats ? catsFiltradas : catsFiltradas.slice(0, LIMITE)

  return (
    <div className="bg-white border border-gray-200 rounded-2xl px-4 py-1 shadow-sm">

      {hayFiltros && (
        <div className="pt-2 pb-1">
          <button
            onClick={() => {
              setCustomMin(''); setCustomMax('')
              onFiltrar({ marca: null, categoria: null, categoria_id: null, precio_min: null, precio_max: null, stock: null })
            }}
            className="text-xs text-red-500 hover:text-red-700 font-medium"
          >
            Limpiar filtros
          </button>
        </div>
      )}

      {/* Búsqueda — checkbox de descripción */}
      {search && (
        <Seccion titulo="Búsqueda" defaultOpen={true}>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={searchDesc}
              onChange={e => onFiltrar({ search_desc: e.target.checked ? '1' : null })}
              className="w-3.5 h-3.5 accent-green-600 shrink-0"
            />
            <span className="text-sm text-gray-600">Incluir descripción</span>
          </label>
        </Seccion>
      )}

      {/* Marcas */}
      {marcas.length > 0 && (
        <Seccion titulo={`Marca${marcasActivas.length ? ` (${marcasActivas.length})` : ''}`}>
          {/* Mini buscador — solo si hay más del límite */}
          {marcas.length > LIMITE && (
            <div className="relative mb-2">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={busqMarca}
                onChange={e => { setBusqMarca(e.target.value); setVerTodasMarcas(true) }}
                placeholder="Buscar marca..."
                className="w-full pl-6 pr-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-400 bg-gray-50"
              />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            {marcasVisibles.map(m => (
              <label key={m} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={marcasActivas.includes(m)}
                  onChange={() => toggleMarca(m)}
                  className="w-3.5 h-3.5 accent-green-600 shrink-0"
                />
                <span className={`text-sm transition-colors ${
                  marcasActivas.includes(m)
                    ? 'text-green-700 font-semibold'
                    : 'text-gray-600 group-hover:text-gray-900'
                }`}>
                  {m}
                </span>
              </label>
            ))}

            {marcasFiltradas.length === 0 && (
              <p className="text-xs text-gray-400 italic">Sin resultados</p>
            )}
          </div>

          {/* Mostrar más / menos */}
          {marcasFiltradas.length > LIMITE && (
            <button
              onClick={() => setVerTodasMarcas(!verTodasMarcas)}
              className="mt-2 text-xs text-green-600 hover:text-green-800 font-medium"
            >
              {verTodasMarcas
                ? 'Mostrar menos'
                : `Mostrar ${marcasFiltradas.length - LIMITE} más`}
            </button>
          )}
        </Seccion>
      )}

      {/* Categorías */}
      {categorias.length > 0 && (
        <Seccion titulo={`Categoría${categoriasActivas.length ? ` (${categoriasActivas.length})` : ''}`}>
          {/* Mini buscador */}
          {categorias.length > LIMITE && (
            <div className="relative mb-2">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={busqCat}
                onChange={e => { setBusqCat(e.target.value); setVerTodasCats(true) }}
                placeholder="Buscar categoría..."
                className="w-full pl-6 pr-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-400 bg-gray-50"
              />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            {catsVisibles.map(c => {
              const slug = toSlug(c.nombre, c.id)
              const activo = categoriasActivas.includes(slug)
              return (
                <label key={c.id} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={activo}
                    onChange={() => toggleCategoria(c)}
                    className="w-3.5 h-3.5 accent-green-600 shrink-0"
                  />
                  <span className={`text-sm transition-colors ${
                    activo ? 'text-green-700 font-semibold' : 'text-gray-600 group-hover:text-gray-900'
                  }`}>
                    {c.nombre}
                  </span>
                </label>
              )
            })}

            {catsFiltradas.length === 0 && (
              <p className="text-xs text-gray-400 italic">Sin resultados</p>
            )}
          </div>

          {/* Mostrar más / menos */}
          {catsFiltradas.length > LIMITE && (
            <button
              onClick={() => setVerTodasCats(!verTodasCats)}
              className="mt-2 text-xs text-green-600 hover:text-green-800 font-medium"
            >
              {verTodasCats
                ? 'Mostrar menos'
                : `Mostrar ${catsFiltradas.length - LIMITE} más`}
            </button>
          )}
        </Seccion>
      )}

      {/* Precio */}
      {(rangos.length > 0 || precios.length > 0) && (
        <Seccion titulo="Precio">
          {rangos.length > 0 && (
            <div className="flex flex-col gap-1.5 mb-3">
              {rangos.map(r => {
                const activo = rangoPredefActivo?.min === r.min && rangoPredefActivo?.max === r.max
                return (
                  <label key={r.label} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="radio"
                      name="rango-precio"
                      checked={activo}
                      onChange={() => aplicarRangoPredef(r)}
                      onClick={() => activo && aplicarRangoPredef(r)}
                      className="w-3.5 h-3.5 accent-green-600 shrink-0"
                    />
                    <span className={`text-sm transition-colors ${
                      activo ? 'text-green-700 font-semibold' : 'text-gray-600 group-hover:text-gray-900'
                    }`}>
                      {r.label}
                    </span>
                  </label>
                )
              })}
            </div>
          )}

          <div className={`rounded-xl border p-3 ${usandoCustom ? 'border-green-300 bg-green-50' : 'border-gray-100 bg-gray-50'}`}>
            <p className="text-xs font-semibold text-gray-500 mb-2">Rango personalizado</p>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <label className="text-[10px] text-gray-400 block mb-1">Mín (Q)</label>
                <input
                  type="number"
                  min={0}
                  value={customMin}
                  onChange={e => setCustomMin(e.target.value)}
                  placeholder="0"
                  className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-green-400 bg-white"
                />
              </div>
              <span className="text-gray-400 text-sm mt-4">–</span>
              <div className="flex-1">
                <label className="text-[10px] text-gray-400 block mb-1">Máx (Q)</label>
                <input
                  type="number"
                  min={0}
                  value={customMax}
                  onChange={e => setCustomMax(e.target.value)}
                  placeholder="∞"
                  className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-green-400 bg-white"
                />
              </div>
            </div>
            <button
              onClick={aplicarCustom}
              className="mt-2 w-full bg-green-600 hover:bg-green-700 text-white text-xs font-semibold py-1.5 rounded-lg transition-colors"
            >
              Aplicar rango
            </button>
            {usandoCustom && (
              <button
                onClick={() => { setCustomMin(''); setCustomMax(''); onFiltrar({ precio_min: null, precio_max: null }) }}
                className="mt-1 w-full text-xs text-gray-400 hover:text-red-500 transition-colors"
              >
                Quitar rango
              </button>
            )}
          </div>
        </Seccion>
      )}

      {/* Disponibilidad */}
      <Seccion titulo={`Disponibilidad${stockFiltro ? ' (1)' : ''}`}>
        <div className="flex flex-col gap-1.5">
          {([
            { value: '',           label: 'Todos' },
            { value: 'disponible', label: 'Con stock' },
            { value: 'agotado',    label: 'Agotados' },
          ] as const).map(op => (
            <label key={op.value} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="stock-filtro"
                checked={stockFiltro === op.value}
                onChange={() => onFiltrar({ stock: op.value || null })}
                className="w-3.5 h-3.5 accent-green-600 shrink-0"
              />
              <span className={`text-sm transition-colors ${
                stockFiltro === op.value
                  ? 'text-green-700 font-semibold'
                  : 'text-gray-600 group-hover:text-gray-900'
              }`}>
                {op.label}
              </span>
            </label>
          ))}
        </div>
      </Seccion>

      {!marcas.length && !categorias.length && !rangos.length && (
        <p className="py-4 text-xs text-gray-400 text-center">Sin opciones disponibles</p>
      )}
    </div>
  )
}