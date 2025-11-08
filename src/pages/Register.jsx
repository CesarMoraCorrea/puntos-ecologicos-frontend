import { useState } from 'react'
import { createPlayer } from '../utils/api.js'

export default function Register() {
  const [form, setForm] = useState({ nombre: '', apellido: '', estudianteId: '' })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    if (!form.nombre || !form.apellido || !form.estudianteId) {
      setMessage('Todos los campos son obligatorios.')
      return
    }
    try {
      setLoading(true)
      const player = await createPlayer({
        firstName: form.nombre,
        lastName: form.apellido,
        studentId: form.estudianteId,
      })
      localStorage.setItem('player', JSON.stringify(player))
      setMessage('Registro exitoso. ¡Ya puedes jugar!')
    } catch (err) {
      setMessage('Ocurrió un error registrando al jugador.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="max-w-md mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Registro de jugadores</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nombre</label>
          <input
            name="nombre"
            value={form.nombre}
            onChange={onChange}
            type="text"
            autoComplete="given-name"
            autoCapitalize="words"
            autoCorrect="off"
            enterKeyHint="next"
            placeholder="Ej. Ana"
            className="w-full border rounded px-3 py-3 text-base sm:text-sm min-h-[44px]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Apellido</label>
          <input
            name="apellido"
            value={form.apellido}
            onChange={onChange}
            type="text"
            autoComplete="family-name"
            autoCapitalize="words"
            autoCorrect="off"
            enterKeyHint="next"
            placeholder="Ej. Gómez"
            className="w-full border rounded px-3 py-3 text-base sm:text-sm min-h-[44px]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">ID del estudiante</label>
          <input
            name="estudianteId"
            value={form.estudianteId}
            onChange={onChange}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="off"
            enterKeyHint="done"
            placeholder="Ej. 20231234"
            className="w-full border rounded px-3 py-3 text-base sm:text-sm min-h-[44px] tracking-wider"
          />
        </div>
        <button
          disabled={loading}
          className="w-full bg-green-600 text-white px-4 py-3 rounded-md text-base sm:text-sm min-h-[44px] hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'Registrando...' : 'Registrar'}
        </button>
      </form>
      {message && <p className="mt-4 text-sm text-gray-700" aria-live="polite">{message}</p>}
    </section>
  )
}