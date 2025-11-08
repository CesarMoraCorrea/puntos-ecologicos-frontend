import { useEffect, useState } from 'react'
import { getLeaderboard } from '../utils/api.js'

export default function Leaderboard() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    (async () => {
      try {
        setLoading(true)
        const data = await getLeaderboard(10)
        setRows(data)
      } catch (e) {
        setError('No se pudo cargar la tabla de posiciones.')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  return (
    <section className="space-y-4 sm:space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold">Tabla de posiciones</h1>
      {loading && <p>Cargando...</p>}
      {error && <p className="text-red-600 text-sm">{error}</p>}
      {!loading && rows.length === 0 && <p className="text-sm text-gray-600">Aún no hay puntajes.</p>}
      {rows.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:hidden gap-3">
            {rows.map((r, idx) => (
              <div key={r._id} className={`rounded border p-3 ${idx < 3 ? 'bg-yellow-50' : 'bg-white'}`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">#{idx + 1}</span>
                  <span className="text-sm">{r.points} pts</span>
                </div>
                <div className="mt-1 text-sm">
                  <p className="font-medium">{r.player?.firstName} {r.player?.lastName}</p>
                  <p className="text-xs text-gray-600">ID: {r.player?.studentId} • Correctos: {r.correctCount}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="overflow-x-auto rounded border hidden sm:block">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-2">#</th>
                  <th className="text-left p-2">Jugador</th>
                  <th className="text-left p-2">ID</th>
                  <th className="text-left p-2">Puntaje</th>
                  <th className="text-left p-2">Correctos</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, idx) => (
                  <tr key={r._id} className={idx < 3 ? 'bg-yellow-50' : ''}>
                    <td className="p-2">{idx + 1}</td>
                    <td className="p-2">{r.player?.firstName} {r.player?.lastName}</td>
                    <td className="p-2">{r.player?.studentId}</td>
                    <td className="p-2 font-semibold">{r.points}</td>
                    <td className="p-2">{r.correctCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  )
}