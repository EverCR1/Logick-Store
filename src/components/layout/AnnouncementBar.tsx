export default function AnnouncementBar() {
  const message = 'Envío gratis en pedidos de Q500 o más'
  // Repetimos el mensaje para que el scroll sea continuo
  const items = Array(6).fill(message)

  return (
    <div className="bg-green-600 text-white text-sm font-medium py-2 overflow-hidden">
      <div className="flex whitespace-nowrap announcement-track">
        {items.map((text, i) => (
          <span key={i} className="flex items-center gap-2 px-10">
            <span>🚚</span>
            {text}
          </span>
        ))}
      </div>
    </div>
  )
}
