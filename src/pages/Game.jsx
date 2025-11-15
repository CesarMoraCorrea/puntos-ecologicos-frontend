import { useEffect, useMemo, useState } from 'react'
import { decryptJSON } from '../utils/crypto.js'
import { useNavigate } from 'react-router-dom'
import { wasteItems, bins } from '../data/wasteItems.js'
import { saveScore } from '../utils/api.js'

function getRandomItem() {
  return wasteItems[Math.floor(Math.random() * wasteItems.length)]
}

export default function Game({ isRegistered, onRequireRegister = () => {}, player: propPlayer = null }) {
  const [current, setCurrent] = useState(getRandomItem())
  const [score, setScore] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60)
  const [playing, setPlaying] = useState(false)
  const [feedback, setFeedback] = useState(null) // { type: 'success'|'error', text }
  const [lastChoice, setLastChoice] = useState(null) // { binKey, correct }
  const [player, setPlayer] = useState(propPlayer || null)
  const [imageFailed, setImageFailed] = useState(false)
  const secret = useMemo(() => import.meta.env.VITE_STORAGE_SECRET || 'demo-secret', [])
  const navigate = useNavigate()

  useEffect(() => {
    if (!playing) return
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(interval)
          setPlaying(false)
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [playing])

  // Cargar jugador desde almacenamiento cifrado si existe
  useEffect(() => {
    if (propPlayer) return
    (async () => {
      try {
        const payload = localStorage.getItem('player_enc')
        if (payload) {
          const data = await decryptJSON(JSON.parse(payload), secret)
          setPlayer(data)
        }
      } catch {
        // ignorar errores de descifrado
      }
    })()
  }, [propPlayer, secret])

  // Reiniciar estado de imagen cuando cambia el residuo actual
  useEffect(() => {
    setImageFailed(false)
  }, [current])

  const start = () => {
    const registered = typeof isRegistered === 'boolean' ? isRegistered : (localStorage.getItem('registered') === 'true')
    if (!registered) {
      // Prefer redirect to Home with register modal
      navigate('/?register=1')
      onRequireRegister()
      return
    }
    setScore(0)
    setCorrect(0)
    setTimeLeft(60)
    setPlaying(true)
    setCurrent(getRandomItem())
    setFeedback(null)
    setLastChoice(null)
  }

  const chooseBin = (binKey) => {
    // Si el juego no está en curso, iniciar al primer toque
    if (!playing) {
      const registered = typeof isRegistered === 'boolean' ? isRegistered : (localStorage.getItem('registered') === 'true')
      if (!registered) {
        navigate('/?register=1')
        onRequireRegister()
        return
      }
      setScore(0)
      setCorrect(0)
      setTimeLeft(60)
      setPlaying(true)
      setFeedback(null)
      setLastChoice(null)
      // mantenemos el residuo actual para evaluar esta primera selección
    }
    if (binKey === current.type) {
      setScore((s) => s + 10)
      setCorrect((c) => c + 1)
      setFeedback({ type: 'success', text: '¡Correcto! +10 puntos' })
      setLastChoice({ binKey, correct: true })
    } else {
      setTimeLeft((t) => Math.max(0, t - 5))
      setFeedback({ type: 'error', text: 'Incorrecto. -5 segundos' })
      setLastChoice({ binKey, correct: false })
    }
    setCurrent(getRandomItem())
    setTimeout(() => setFeedback(null), 800)
    setTimeout(() => setLastChoice(null), 500)
  }

  const finished = !playing && timeLeft === 0
  const progressPct = Math.round((timeLeft / 60) * 100)

  const handleSave = async () => {
    if (!player) return
    try {
      await saveScore({
        studentId: player.studentId,
        points: score,
        correctCount: correct,
      })
    } catch (e) {
      // ignore error, could show message
    }
  }

  useEffect(() => {
    if (finished) handleSave()
  }, [finished])

  // funciones de sonido eliminadas

  // Íconos de contenedores (reutilizados del Home)
  const BinIcon = ({ variant }) => {
    if (variant === 'blanco') {
      return (
        <svg role="img" aria-label="Contenedor blanco" viewBox="0 0 64 64" className="w-16 h-16 sm:w-20 sm:h-20">
          <rect x="12" y="18" width="40" height="36" rx="6" fill="#ffffff" stroke="#d1d5db" />
          <rect x="22" y="24" width="20" height="6" rx="2" fill="#9ca3af" />
        </svg>
      )
    }
    if (variant === 'verde') {
      return (
        <svg role="img" aria-label="Contenedor verde" viewBox="0 0 64 64" className="w-16 h-16 sm:w-20 sm:h-20">
          <rect x="12" y="18" width="40" height="36" rx="6" fill="#10b981" />
          <path d="M26 36c6-8 12-8 18 0" fill="none" stroke="#064e3b" strokeWidth="3" />
        </svg>
      )
    }
    return (
      <svg role="img" aria-label="Contenedor negro" viewBox="0 0 64 64" className="w-16 h-16 sm:w-20 sm:h-20">
        <rect x="12" y="18" width="40" height="36" rx="6" fill="#111827" />
        <circle cx="32" cy="36" r="6" fill="#374151" />
      </svg>
    )
  }

  // Ícono representativo del residuo
  const ResidueIcon = ({ name, type }) => {
    const lower = name.toLowerCase()
    if (lower.includes('botella')) {
      return (
        <svg role="img" aria-label="Botella" viewBox="0 0 64 64" className="w-24 h-24">
          <rect x="30" y="10" width="4" height="8" fill="#4b5563" />
          <rect x="24" y="18" width="16" height="36" rx="6" fill="#60a5fa" stroke="#1f2937" />
        </svg>
      )
    }
    if (lower.includes('lata')) {
      return (
        <svg role="img" aria-label="Lata" viewBox="0 0 64 64" className="w-24 h-24">
          <rect x="20" y="16" width="24" height="32" rx="4" fill="#9ca3af" stroke="#374151" />
          <rect x="22" y="20" width="20" height="4" fill="#d1d5db" />
        </svg>
      )
    }
    if (lower.includes('papel')) {
      return (
        <svg role="img" aria-label="Papel" viewBox="0 0 64 64" className="w-24 h-24">
          <rect x="18" y="16" width="28" height="32" rx="2" fill="#f9fafb" stroke="#9ca3af" />
          <line x1="22" y1="24" x2="42" y2="24" stroke="#9ca3af" />
          <line x1="22" y1="30" x2="42" y2="30" stroke="#9ca3af" />
        </svg>
      )
    }
    if (lower.includes('banano') || lower.includes('cáscara')) {
      return (
        <svg role="img" aria-label="Cáscara" viewBox="0 0 64 64" className="w-24 h-24">
          <path d="M16 40c8-12 24-12 32 0" fill="#f59e0b" stroke="#b45309" strokeWidth="2" />
        </svg>
      )
    }
    if (lower.includes('vegetal') || lower.includes('orgánico')) {
      return (
        <svg role="img" aria-label="Hoja" viewBox="0 0 64 64" className="w-24 h-24">
          <path d="M32 48c12-6 16-18 8-30-12 2-22 12-20 24 4 6 6 8 12 6z" fill="#10b981" stroke="#065f46" />
        </svg>
      )
    }
    if (lower.includes('servilleta')) {
      return (
        <svg role="img" aria-label="Servilleta" viewBox="0 0 64 64" className="w-24 h-24">
          <rect x="18" y="20" width="28" height="24" rx="2" fill="#e5e7eb" stroke="#9ca3af" />
        </svg>
      )
    }
    if (lower.includes('higiénico')) {
      return (
        <svg role="img" aria-label="Rollo" viewBox="0 0 64 64" className="w-24 h-24">
          <circle cx="24" cy="32" r="10" fill="#e5e7eb" stroke="#9ca3af" />
          <circle cx="24" cy="32" r="4" fill="#9ca3af" />
          <rect x="30" y="24" width="16" height="16" rx="2" fill="#f3f4f6" stroke="#9ca3af" />
        </svg>
      )
    }
    if (lower.includes('empaque') || lower.includes('pack')) {
      return (
        <svg role="img" aria-label="Empaque" viewBox="0 0 64 64" className="w-24 h-24">
          <rect x="16" y="20" width="32" height="24" rx="2" fill="#f59e0b" stroke="#b45309" />
          <line x1="16" y1="32" x2="48" y2="32" stroke="#111827" />
        </svg>
      )
    }
    // Genérico
    return (
      <svg role="img" aria-label="Residuo" viewBox="0 0 64 64" className="w-24 h-24">
        <rect x="20" y="20" width="24" height="24" rx="4" fill="#d1d5db" stroke="#6b7280" />
      </svg>
    )
  }

  return (
    <section className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl sm:text-3xl font-bold">Minijuego: clasifica el residuo</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <div className="rounded-xl border p-4 sm:p-6 bg-gradient-to-br from-emerald-50 to-teal-50">
            {/* HUD superior */}
            <p className="text-xs sm:text-sm text-gray-600" aria-live="polite">Tiempo: <span className="font-semibold">{timeLeft}s</span> — Puntaje: <span className="font-semibold">{score}</span> — Correctos: <span className="font-semibold">{correct}</span></p>
            <div className="mt-2 h-2 w-full bg-gray-100 rounded">
              <div className="h-2 bg-green-500 rounded transition-all" style={{ width: `${progressPct}%` }} aria-hidden></div>
            </div>
            <div className="mt-3 min-h-[36px]">
              {feedback && (
                <div className={`inline-flex items-center gap-2 px-3 py-2 rounded border text-sm transition-opacity ${feedback.type==='success' ? 'bg-green-100 text-green-700 border-green-300' : 'bg-red-100 text-red-700 border-red-300'}`}>
                  <span aria-hidden>{feedback.type==='success' ? '✅' : '⚠️'}</span>
                  <span>{feedback.text}</span>
                </div>
              )}
            </div>

            {/* Residuo actual con imagen real */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div className="rounded border bg-gray-50 overflow-hidden">
                <div className="h-40 sm:h-48 bg-white">
                  {current?.image && !imageFailed ? (
                    <img
                      src={current.image}
                      alt={current.name}
                      className="w-full h-full object-contain"
                      style={{ objectPosition: 'center' }}
                      loading="lazy"
                      onError={() => setImageFailed(true)}
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <ResidueIcon name={current.name} type={current.type} />
                    </div>
                  )}
                </div>
              </div>
              <div>
                <p className="text-base sm:text-lg">Residuo: <span className="font-semibold">{current.name}</span></p>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">Selecciona el contenedor correcto. Fallar resta 5 segundos.</p>
              </div>
            </div>

            {/* Mensaje fijo de retroalimentación gestionado arriba */}
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-gray-600">Jugador: {player ? `${player.firstName} ${player.lastName} (${player.studentId})` : 'no registrado'}</p>
          <p className="text-xs text-gray-500">Consejo: toca el contenedor correcto. Fallar resta tiempo.</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 sm:gap-6">
        {bins.map((b) => (
          <button
            key={b.key}
            onClick={() => chooseBin(b.key)}
            aria-label={`Seleccionar contenedor ${b.label}`}
            className={`h-20 sm:h-28 rounded-lg border shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 hover:shadow-md ${
              b.key === 'blanco' ? 'bg-white' : b.key === 'verde' ? 'bg-green-500 text-white' : 'bg-black text-white'
            } ${lastChoice?.binKey===b.key ? (lastChoice.correct ? 'ring-2 ring-green-400' : 'ring-2 ring-red-400') : ''}`}
          >
            <div className="h-full w-full flex items-center justify-center">
              <BinIcon variant={b.key} />
            </div>
          </button>
        ))}
      </div>

      {finished && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-xs text-center space-y-3 shadow-lg">
            <h2 className="text-lg sm:text-xl font-semibold">Tiempo terminado</h2>
            <p>Correctos: <strong>{correct}</strong></p>
            <p>Puntaje final: <strong>{score}</strong></p>
            <p className="text-xs text-gray-500">El puntaje se guardará si estás registrado.</p>
            <button onClick={start} className="min-h-[44px] bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Jugar de nuevo</button>
          </div>
        </div>
      )}
      {/* footer removido */}
    </section>
  )
}