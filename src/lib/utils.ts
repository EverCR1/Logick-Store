/**
 * Formatea un número como precio en quetzales.
 * Ej: 1500 → "Q 1,500.00"
 */
export function formatPrecio(valor: number): string {
  return `Q ${valor.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

/**
 * Calcula el porcentaje de descuento entre precio original y oferta.
 * Ej: (100, 75) → "25%"
 */
export function calcularDescuento(precioOriginal: number, precioOferta: number): string {
  const porcentaje = Math.round(((precioOriginal - precioOferta) / precioOriginal) * 100)
  return `${porcentaje}%`
}

/**
 * Trunca un texto a N caracteres agregando "..." al final.
 */
export function truncar(texto: string, maxLength = 100): string {
  if (texto.length <= maxLength) return texto
  return texto.slice(0, maxLength).trimEnd() + '...'
}

/**
 * Genera un slug SEO-friendly a partir del nombre e ID del producto.
 * Ej: ("Memoria RAM Corsair 16GB", 42) → "memoria-ram-corsair-16gb-42"
 */
export function toSlug(nombre: string, id: number): string {
  const slug = nombre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
  return `${slug}-${id}`
}

/**
 * Extrae el ID numérico del slug de un producto.
 * Ej: "memoria-ram-corsair-16gb-42" → 42
 */
export function idFromSlug(slug: string): number {
  const parts = slug.split('-')
  return parseInt(parts[parts.length - 1]) || 0
}

/**
 * Devuelve el nombre del producto concatenado con el color si existe.
 * Ej: ("Silla Gamer", "Negro") → "Silla Gamer - Negro"
 * Ej: ("Laptop HP 15", null)   → "Laptop HP 15"
 */
export function nombreConColor(nombre: string, color: string | null | undefined): string {
  return color ? `${nombre} - ${color}` : nombre
}