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