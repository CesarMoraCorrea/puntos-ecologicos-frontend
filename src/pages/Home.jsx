import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { createPlayer } from '../utils/api.js'
import { encryptJSON, decryptJSON } from '../utils/crypto.js'

export default function Home() {
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ nombre: '', apellido: '', estudianteId: '', website: '' }) // website: honeypot
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [player, setPlayer] = useState(null)
  const [openedAt, setOpenedAt] = useState(0)
  

  const secret = useMemo(() => import.meta.env.VITE_STORAGE_SECRET || 'demo-secret', [])

  const registered = useMemo(() => localStorage.getItem('registered') === 'true', [])
  const location = useLocation()

  useEffect(() => {
    (async () => {
      try {
        const payload = localStorage.getItem('player_enc')
        if (payload) {
          const data = await decryptJSON(JSON.parse(payload), secret)
          setPlayer(data)
        }
      } catch {
        // ignore decrypt errors
      }
    })()
  }, [secret])

  const validate = (f) => {
    const e = {}
    if (!f.nombre || f.nombre.trim().length < 2) e.nombre = 'Ingresa un nombre válido'
    if (!f.apellido || f.apellido.trim().length < 2) e.apellido = 'Ingresa un apellido válido'
    if (!f.estudianteId || !/^[0-9]{6,}$/.test(f.estudianteId)) e.estudianteId = 'ID debe ser numérico (mín. 6 dígitos)'
    if (f.website && f.website.trim().length > 0) e.website = 'Bloqueado (antispam)'
    return e
  }

  const onChange = (e) => {
    const next = { ...form, [e.target.name]: e.target.value }
    setForm(next)
    setErrors(validate(next))
  }

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    if (params.get('register') === '1') {
      setShowModal(true)
      setOpenedAt(Date.now())
    }
  }, [location.search])

  // Solicitar registro inmediatamente al acceder si no está registrado
  useEffect(() => {
    if (!registered) {
      setShowModal(true)
      setOpenedAt(Date.now())
    }
  }, [registered])

  const onSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    const eNow = validate(form)
    setErrors(eNow)
    const elapsed = Date.now() - openedAt
    if (Object.keys(eNow).length > 0 || elapsed < 2000) {
      setMessage(elapsed < 2000 ? 'Completa el formulario y espera un momento...' : 'Corrige los campos para continuar.')
      return
    }
    try {
      // anti-spam simple: limitar intentos rápidos
      const attempts = parseInt(sessionStorage.getItem('registerAttempts') || '0', 10)
      if (attempts >= 3) {
        setMessage('Demasiados intentos. Intenta de nuevo en unos segundos.')
        return
      }
      sessionStorage.setItem('registerAttempts', String(attempts + 1))

      setLoading(true)
      const payload = { firstName: form.nombre.trim(), lastName: form.apellido.trim(), studentId: form.estudianteId.trim() }
      const playerCreated = await createPlayer(payload)
      const encrypted = await encryptJSON(payload, secret)
      localStorage.setItem('player_enc', JSON.stringify(encrypted))
      localStorage.setItem('registered', 'true')
      setPlayer(playerCreated ?? payload)
      setShowModal(false)
      setMessage('Registro completado. ¡Ya puedes jugar!')
    } catch (err) {
      setMessage('Ocurrió un error registrando al jugador.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="space-y-6">
      {/* Hero visual con paleta armonizada */}
      <div className="rounded-xl bg-gradient-to-r from-emerald-700 to-teal-600 text-white p-5 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold">Puntos Ecológicos: aprende jugando</h1>
        <p className="mt-2 text-sm sm:text-base opacity-90">Clasifica residuos correctamente y suma puntos. Regístrate para participar.</p>
      </div>

      {/* Introducción breve */}
      <p className="text-base sm:text-lg leading-relaxed">
        Un punto ecológico en Colombia es un conjunto de contenedores destinados a la separación adecuada de residuos para su manejo responsable. Fomenta el reciclaje y la reducción de impactos ambientales.
      </p>

      <div className="rounded-lg border p-3 sm:p-4 bg-gray-50">
        <h2 className="text-lg sm:text-xl font-semibold mb-3">Resolución 2184 de 2019 — Colores oficiales</h2>
        <ul className="space-y-2">
          <li className="flex items-center gap-2 text-sm sm:text-base">
            <span className="inline-block w-4 h-4 rounded border" style={{ backgroundColor: '#ffffff' }}></span>
            <span><strong>Blanco:</strong> residuos aprovechables (papel, cartón, plástico, vidrio, metales).</span>
          </li>
          <li className="flex items-center gap-2 text-sm sm:text-base">
            <span className="inline-block w-4 h-4 rounded" style={{ backgroundColor: '#22c55e' }}></span>
            <span><strong>Verde:</strong> residuos orgánicos (restos de comida, cáscaras, vegetales).</span>
          </li>
          <li className="flex items-center gap-2 text-sm sm:text-base">
            <span className="inline-block w-4 h-4 rounded" style={{ backgroundColor: '#111827' }}></span>
            <span><strong>Negro:</strong> residuos no aprovechables (papel higiénico, servilletas, empaques contaminados).</span>
          </li>
        </ul>
      </div>


      {/* Bloque informativo (contenido integrado de Info) */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-3">Contenedores y residuos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[
            {
              key: 'blanco',
              title: 'Contenedor Blanco',
              description: 'Aprovechables: papel, cartón, plástico, vidrio y metales. Limpios y secos.',
              color: 'bg-white border',
              text: 'text-gray-800',
              icon: (
                <svg role="img" aria-label="Contenedor blanco" viewBox="0 0 64 64" className="w-full h-full">
                  <rect x="12" y="18" width="40" height="36" rx="6" fill="#ffffff" stroke="#d1d5db" />
                  <rect x="22" y="24" width="20" height="6" rx="2" fill="#9ca3af" />
                </svg>
              ),
            },
            {
              key: 'verde',
              title: 'Contenedor Verde',
              description: 'Orgánicos: restos de comida, cáscaras, vegetales y residuos biodegradables.',
              color: 'bg-green-500',
              text: 'text-white',
              icon: (
                <svg role="img" aria-label="Contenedor verde" viewBox="0 0 64 64" className="w-full h-full">
                  <rect x="12" y="18" width="40" height="36" rx="6" fill="#10b981" />
                  <path d="M26 36c6-8 12-8 18 0" fill="none" stroke="#064e3b" strokeWidth="3" />
                </svg>
              ),
            },
            {
              key: 'negro',
              title: 'Contenedor Negro',
              description: 'No aprovechables: papel higiénico, servilletas, empaques contaminados, etc.',
              color: 'bg-black',
              text: 'text-white',
              icon: (
                <svg role="img" aria-label="Contenedor negro" viewBox="0 0 64 64" className="w-full h-full">
                  <rect x="12" y="18" width="40" height="36" rx="6" fill="#111827" />
                  <circle cx="32" cy="36" r="6" fill="#374151" />
                </svg>
              ),
            },
          ].map((bin) => (
            <div key={bin.key} className="rounded-lg overflow-hidden border shadow-sm bg-white">
              <div className="h-32 sm:h-40 w-full flex items-center justify-center">
                <div className="w-28 h-28">{bin.icon}</div>
              </div>
              <div className="p-3 sm:p-4">
                <h3 className="font-semibold text-base sm:text-lg mb-1 sm:mb-2">{bin.title}</h3>
                <p className="text-sm text-gray-700 mb-3 sm:mb-4">{bin.description}</p>
                <div className={`h-8 rounded ${bin.color} ${bin.text} flex items-center justify-center font-medium text-xs sm:text-sm`}>
                  {bin.key.toUpperCase()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-30">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md">
            <h2 className="text-lg sm:text-xl font-semibold mb-2">Registro de jugadores</h2>
            <p className="text-sm text-gray-600 mb-4">Completa todos los datos. Se requiere para participar en el juego.</p>
            <form onSubmit={onSubmit} className="space-y-4" aria-label="Formulario de registro">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre</label>
                <input name="nombre" value={form.nombre} onChange={onChange} type="text" autoComplete="given-name" className="w-full border rounded px-3 py-3 min-h-[44px]" />
                {errors.nombre && <p className="text-xs text-red-600 mt-1">{errors.nombre}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Apellido</label>
                <input name="apellido" value={form.apellido} onChange={onChange} type="text" autoComplete="family-name" className="w-full border rounded px-3 py-3 min-h-[44px]" />
                {errors.apellido && <p className="text-xs text-red-600 mt-1">{errors.apellido}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">ID del estudiante</label>
                <input name="estudianteId" value={form.estudianteId} onChange={onChange} inputMode="numeric" pattern="[0-9]*" className="w-full border rounded px-3 py-3 min-h-[44px] tracking-wider" />
                {errors.estudianteId && <p className="text-xs text-red-600 mt-1">{errors.estudianteId}</p>}
              </div>
              {/* Honeypot */}
              <input name="website" value={form.website} onChange={onChange} className="hidden" aria-hidden="true" tabIndex={-1} />

              <div className="flex gap-2">
                <button type="submit" disabled={loading} className="flex-1 bg-emerald-700 text-white px-4 py-3 rounded-md min-h-[44px] hover:bg-emerald-800 disabled:opacity-50">{loading ? 'Registrando...' : 'Registrar y jugar'}</button>
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-3 rounded border min-h-[44px]">Cancelar</button>
              </div>
            </form>
            {message && <p className="mt-3 text-sm" aria-live="polite">{message}</p>}
          </div>
        </div>
      )}
      {/* Cómo se juega */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-3">¿Cómo se juega?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { title: 'Observa el residuo', desc: 'Verás el nombre e imagen del residuo actual.', icon: '🧭' },
            { title: 'Elige el contenedor', desc: 'Toca el color correcto: blanco, verde o negro.', icon: '🗑️' },
            { title: 'Suma puntos', desc: 'Aciertos dan +10, fallas restan tiempo. ¡Apresúrate!', icon: '⭐' },
          ].map((s, i) => (
            <div key={i} className="rounded-lg border p-4 bg-white">
              <div className="text-2xl" aria-hidden>{s.icon}</div>
              <h3 className="font-semibold mt-2">{s.title}</h3>
              <p className="text-sm text-gray-700 mt-1">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA final: acceso al juego al final de la página */}
      <div className="pt-4">
        <Link to="/juego" className="inline-flex items-center gap-2 bg-emerald-700 text-white px-5 py-3 rounded-md hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500">
          <span>Ir al juego</span>
          <span aria-hidden>▶</span>
        </Link>
        {!registered && (
          <p className="mt-2 text-sm text-gray-700">Para jugar necesitas registrarte. Si no estás registrado, el juego te redirigirá aquí para completar el formulario.</p>
        )}
      </div>

    </section>
  )
}