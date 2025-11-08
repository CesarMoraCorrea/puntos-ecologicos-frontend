// En desarrollo usa localhost:4000; en producción usa VITE_API_URL si está definida.
// Si no está definida en producción, usaremos rutas relativas ("/api") y se puede configurar un proxy/rewrites.
const isDev = import.meta.env.DEV;
export const API_URL = isDev
  ? (import.meta.env.VITE_API_URL || 'http://localhost:4000')
  : (import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL.trim().length > 0 ? import.meta.env.VITE_API_URL : '');

export async function createPlayer(data) {
  const base = API_URL;
  const res = await fetch(`${base}/api/players`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error al crear jugador');
  return res.json();
}

export async function saveScore(data) {
  const base = API_URL;
  const res = await fetch(`${base}/api/scores`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error al guardar puntaje');
  return res.json();
}

export async function getLeaderboard(limit = 10) {
  const base = API_URL;
  const res = await fetch(`${base}/api/leaderboard?limit=${limit}`);
  if (!res.ok) throw new Error('Error al obtener tabla de posiciones');
  return res.json();
}