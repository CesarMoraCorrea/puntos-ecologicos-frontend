import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { useState } from 'react'
import './App.css'

import Home from './pages/Home.jsx'
import Info from './pages/Info.jsx'
import Game from './pages/Game.jsx'
import Leaderboard from './pages/Leaderboard.jsx'

function App() {
  const [open, setOpen] = useState(false)
  const toggle = () => setOpen((v) => !v)
  const close = () => setOpen(false)
  return (
    <Router>
      <header className="border-b bg-white/90 backdrop-blur sticky top-0 z-20">
        <nav className="page-container flex items-center justify-between py-3">
          <Link to="/" onClick={close} className="font-semibold text-lg">Puntos Ecológicos</Link>
          <button aria-label="Abrir menú" onClick={toggle} className="sm:hidden p-2 rounded border">
            ☰
          </button>
          <div className="hidden sm:flex gap-4 text-sm">
            <Link to="/" className="hover:text-green-600">Inicio</Link>
            <Link to="/juego" className="hover:text-green-600">Juego</Link>
            <Link to="/tabla" className="hover:text-green-600">Tabla</Link>
          </div>
        </nav>
        {open && (
          <div className="sm:hidden border-t bg-white">
            <div className="page-container py-2 flex flex-col text-base">
              <Link to="/" onClick={close} className="py-3 border-b">Inicio</Link>
              <Link to="/juego" onClick={close} className="py-3 border-b">Juego</Link>
              <Link to="/tabla" onClick={close} className="py-3">Tabla</Link>
            </div>
          </div>
        )}
      </header>
      <main className="page-container py-4 sm:py-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/info" element={<Info />} />
          <Route path="/juego" element={<Game />} />
          <Route path="/tabla" element={<Leaderboard />} />
        </Routes>
      </main>
      {/* footer eliminado según solicitud */}
    </Router>
  )
}

export default App
