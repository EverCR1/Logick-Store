import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer'
import type { PedidoDetalle } from '@/types/cuenta'

// ── Estilos ────────────────────────────────────────────────────────────────
const C = {
  verde:       '#16a34a',
  verdeClaro:  '#f0fdf4',
  verdeBorde:  '#dcfce7',
  gris900:     '#111827',
  gris700:     '#374151',
  gris500:     '#6b7280',
  gris400:     '#9ca3af',
  gris200:     '#e5e7eb',
  gris100:     '#f3f4f6',
  gris50:      '#f9fafb',
  azulBg:      '#eff6ff',
  azulBorde:   '#bfdbfe',
  azulTexto:   '#1e40af',
  ambarBg:     '#fffbeb',
  ambarBorde:  '#fde68a',
  ambarTexto:  '#92400e',
  blanco:      '#ffffff',
}

const s = StyleSheet.create({
  page: {
    fontFamily:      'Helvetica',
    fontSize:        10,
    color:           C.gris700,
    backgroundColor: C.blanco,
    paddingTop:      0,
    paddingBottom:   32,
    paddingHorizontal: 0,
  },

  // Header
  header: {
    backgroundColor: C.verde,
    paddingVertical: 22,
    paddingHorizontal: 40,
    flexDirection:   'row',
    justifyContent:  'space-between',
    alignItems:      'center',
  },
  headerLeft: {},
  headerTitle: {
    fontSize:    20,
    fontFamily:  'Helvetica-Bold',
    color:       C.blanco,
    letterSpacing: 0.3,
  },
  headerSub: {
    fontSize:  9,
    color:     '#bbf7d0',
    marginTop: 2,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  headerNumero: {
    fontSize:   13,
    fontFamily: 'Helvetica-Bold',
    color:      C.blanco,
    letterSpacing: 0.5,
  },
  headerFecha: {
    fontSize:  9,
    color:     '#bbf7d0',
    marginTop: 3,
  },

  body: {
    paddingHorizontal: 40,
    paddingTop:        20,
  },

  // Sección
  seccionTitulo: {
    fontSize:     8,
    fontFamily:   'Helvetica-Bold',
    color:        C.gris500,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom:  6,
    marginTop:     16,
  },

  // Productos
  productoFila: {
    flexDirection:  'row',
    alignItems:     'center',
    borderBottomWidth: 1,
    borderBottomColor: C.gris200,
    paddingVertical: 8,
  },
  productoNombre: {
    flex:       1,
    fontSize:   10,
    fontFamily: 'Helvetica-Bold',
    color:      C.verde,
  },
  productoSub: {
    fontSize:  8.5,
    color:     C.gris500,
    marginTop: 2,
  },
  productoSubtotal: {
    fontSize:   10,
    fontFamily: 'Helvetica-Bold',
    color:      C.gris900,
    width:      70,
    textAlign:  'right',
  },

  // Tabla de productos header
  tablaHeader: {
    flexDirection:   'row',
    backgroundColor: C.gris100,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius:    4,
    marginBottom:    4,
  },
  thNombre:   { flex: 1, fontSize: 8, fontFamily: 'Helvetica-Bold', color: C.gris500, textTransform: 'uppercase', letterSpacing: 0.5 },
  thCantidad: { width: 55, fontSize: 8, fontFamily: 'Helvetica-Bold', color: C.gris500, textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'center' },
  thPrecio:   { width: 70, fontSize: 8, fontFamily: 'Helvetica-Bold', color: C.gris500, textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'right' },
  thSubtotal: { width: 70, fontSize: 8, fontFamily: 'Helvetica-Bold', color: C.gris500, textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'right' },

  tdNombre:   { flex: 1, fontSize: 10 },
  tdCantidad: { width: 55, fontSize: 10, textAlign: 'center' },
  tdPrecio:   { width: 70, fontSize: 10, textAlign: 'right' },
  tdSubtotal: { width: 70, fontSize: 10, fontFamily: 'Helvetica-Bold', color: C.gris900, textAlign: 'right' },

  // Resumen
  resumenFila: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: C.gris100,
  },
  resumenLabel: { fontSize: 10, color: C.gris500 },
  resumenValor: { fontSize: 10, color: C.gris700 },
  resumenTotalFila: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    paddingTop:     10,
    marginTop:      4,
    borderTopWidth: 1.5,
    borderTopColor: C.verde,
  },
  resumenTotalLabel: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: C.gris900 },
  resumenTotalValor: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: C.verde },

  // Info entrega / pago
  infoGrid: {
    flexDirection: 'row',
    gap:           12,
  },
  infoCard: {
    flex:             1,
    backgroundColor:  C.gris50,
    borderWidth:      1,
    borderColor:      C.gris200,
    borderRadius:     6,
    padding:          10,
  },
  infoCardTitulo: {
    fontSize:     8,
    fontFamily:   'Helvetica-Bold',
    color:        C.gris500,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom:  5,
  },
  infoLinea: {
    fontSize:   9.5,
    color:      C.gris700,
    lineHeight: 1.5,
  },
  infoLineaNegrita: {
    fontSize:   9.5,
    fontFamily: 'Helvetica-Bold',
    color:      C.gris900,
  },

  // Badge estado
  badgeBase: {
    paddingHorizontal: 6,
    paddingVertical:   2,
    borderRadius:      10,
    alignSelf:         'flex-start',
    marginTop:         4,
  },
  badgeTexto: {
    fontSize:   8,
    fontFamily: 'Helvetica-Bold',
  },

  // Aviso
  avisoBox: {
    backgroundColor: C.azulBg,
    borderWidth:     1,
    borderColor:     C.azulBorde,
    borderRadius:    6,
    padding:         10,
    marginTop:       16,
  },
  avisoTitulo: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: C.azulTexto },
  avisoTexto:  { fontSize: 9, color: '#1d4ed8', marginTop: 3, lineHeight: 1.5 },

  // Footer
  footer: {
    marginTop:       28,
    paddingTop:      14,
    borderTopWidth:  1,
    borderTopColor:  C.gris200,
    alignItems:      'center',
  },
  footerTexto: { fontSize: 8, color: C.gris400, lineHeight: 1.5, textAlign: 'center' },
})

// ── Helpers ────────────────────────────────────────────────────────────────
const fmt = (v: number) => 'Q' + v.toFixed(2)

const ESTADO_LABEL: Record<string, string> = {
  pendiente:      'Pendiente',
  confirmado:     'Confirmado',
  en_preparacion: 'En preparación',
  enviado:        'Enviado',
  entregado:      'Entregado',
  cancelado:      'Cancelado',
}

const ESTADO_COLOR: Record<string, { bg: string; text: string }> = {
  pendiente:      { bg: '#fef9c3', text: '#854d0e' },
  confirmado:     { bg: '#dbeafe', text: '#1e40af' },
  en_preparacion: { bg: '#ede9fe', text: '#5b21b6' },
  enviado:        { bg: '#e0f2fe', text: '#075985' },
  entregado:      { bg: '#dcfce7', text: '#166534' },
  cancelado:      { bg: '#fee2e2', text: '#991b1b' },
}

const METODO_LABEL: Record<string, string> = {
  efectivo:               'Efectivo contra entrega',
  deposito_transferencia: 'Depósito / Transferencia',
  tarjeta:                'Tarjeta',
  mixto:                  'Mixto',
}

// ── Componente PDF ─────────────────────────────────────────────────────────
interface Props {
  pedido:    PedidoDetalle & { nombre: string; telefono: string }
  appName?:  string
}

export default function ComprobantePedido({ pedido, appName = 'Logickem' }: Props) {
  const estadoStyle = ESTADO_COLOR[pedido.estado] ?? { bg: C.gris100, text: C.gris700 }
  const fechaStr    = new Date(pedido.created_at).toLocaleString('es-GT', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

  return (
    <Document title={`Comprobante ${pedido.numero_pedido}`} author={appName}>
      <Page size="A4" style={s.page}>

        {/* ── Header ─────────────────────────────────────────────── */}
        <View style={s.header}>
          <View style={s.headerLeft}>
            <Text style={s.headerTitle}>{appName}</Text>
            <Text style={s.headerSub}>Comprobante de pedido</Text>
          </View>
          <View style={s.headerRight}>
            <Text style={s.headerNumero}>{pedido.numero_pedido}</Text>
            <Text style={s.headerFecha}>{fechaStr}</Text>
          </View>
        </View>

        <View style={s.body}>

          {/* ── Estado ─────────────────────────────────────────────── */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 8 }}>
            <Text style={{ fontSize: 9, color: C.gris500 }}>Estado del pedido:</Text>
            <View style={[s.badgeBase, { backgroundColor: estadoStyle.bg }]}>
              <Text style={[s.badgeTexto, { color: estadoStyle.text }]}>
                {ESTADO_LABEL[pedido.estado] ?? pedido.estado}
              </Text>
            </View>
          </View>

          {/* ── Productos ──────────────────────────────────────────── */}
          <Text style={s.seccionTitulo}>Productos</Text>

          <View style={s.tablaHeader}>
            <Text style={s.thNombre}>Producto</Text>
            <Text style={s.thCantidad}>Cant.</Text>
            <Text style={s.thPrecio}>Precio unit.</Text>
            <Text style={s.thSubtotal}>Subtotal</Text>
          </View>

          {pedido.detalles.map((d, i) => (
            <View
              key={i}
              style={[
                s.productoFila,
                { paddingHorizontal: 10, backgroundColor: i % 2 === 0 ? C.blanco : C.gris50 },
              ]}
            >
              <Text style={s.tdNombre}>{d.nombre_producto}</Text>
              <Text style={s.tdCantidad}>
                {d.cantidad} {d.cantidad === 1 ? 'und.' : 'unds.'}
              </Text>
              <Text style={s.tdPrecio}>{fmt(d.precio_unitario)}</Text>
              <Text style={s.tdSubtotal}>{fmt(d.subtotal)}</Text>
            </View>
          ))}

          {/* ── Resumen ────────────────────────────────────────────── */}
          <Text style={s.seccionTitulo}>Resumen de pago</Text>

          <View>
            <View style={s.resumenFila}>
              <Text style={s.resumenLabel}>Subtotal</Text>
              <Text style={s.resumenValor}>{fmt(pedido.subtotal)}</Text>
            </View>
            <View style={s.resumenFila}>
              <Text style={s.resumenLabel}>Envío</Text>
              <Text style={[s.resumenValor, pedido.costo_envio === 0 ? { color: C.verde, fontFamily: 'Helvetica-Bold' } : {}]}>
                {pedido.costo_envio === 0 ? 'Gratis' : fmt(pedido.costo_envio)}
              </Text>
            </View>
            {pedido.descuento_cupon > 0 && (
              <View style={s.resumenFila}>
                <Text style={[s.resumenLabel, { color: C.verde }]}>Descuento cupón</Text>
                <Text style={[s.resumenValor, { color: C.verde }]}>-{fmt(pedido.descuento_cupon)}</Text>
              </View>
            )}
            <View style={s.resumenTotalFila}>
              <Text style={s.resumenTotalLabel}>Total</Text>
              <Text style={s.resumenTotalValor}>{fmt(pedido.total)}</Text>
            </View>
          </View>

          {/* ── Info entrega + pago ─────────────────────────────────── */}
          <Text style={s.seccionTitulo}>Información</Text>

          <View style={s.infoGrid}>
            {/* Entrega */}
            <View style={s.infoCard}>
              <Text style={s.infoCardTitulo}>Entrega</Text>
              <Text style={s.infoLineaNegrita}>{pedido.nombre}</Text>
              <Text style={s.infoLinea}>{pedido.telefono}</Text>
              <Text style={s.infoLinea}>{pedido.direccion}</Text>
              <Text style={s.infoLinea}>{pedido.municipio}, {pedido.departamento}</Text>
              {pedido.referencias ? (
                <Text style={[s.infoLinea, { color: C.gris400, marginTop: 2 }]}>{pedido.referencias}</Text>
              ) : null}
            </View>

            {/* Pago */}
            <View style={s.infoCard}>
              <Text style={s.infoCardTitulo}>Pago</Text>
              <Text style={s.infoLineaNegrita}>{METODO_LABEL[pedido.metodo_pago] ?? pedido.metodo_pago}</Text>
              {pedido.metodo_pago === 'tarjeta' && (
                <Text style={[s.infoLinea, { marginTop: 4 }]}>
                  Link de pago enviado por WhatsApp o correo.
                </Text>
              )}
              {pedido.metodo_pago === 'deposito_transferencia' && (
                <Text style={[s.infoLinea, { marginTop: 4 }]}>
                  Adjunta el comprobante de transferencia.
                </Text>
              )}
              {pedido.notas ? (
                <>
                  <Text style={[s.infoLinea, { marginTop: 8, color: C.gris500 }]}>Notas:</Text>
                  <Text style={s.infoLinea}>{pedido.notas}</Text>
                </>
              ) : null}
            </View>
          </View>

          {/* ── Footer ─────────────────────────────────────────────── */}
          <View style={s.footer}>
            <Text style={s.footerTexto}>
              Gracias por tu compra — {appName}
            </Text>
            <Text style={s.footerTexto}>
              soporte@logickem.com · WhatsApp 4710 4888
            </Text>
          </View>

        </View>
      </Page>
    </Document>
  )
}