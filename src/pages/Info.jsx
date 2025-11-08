const bins = [
  {
    key: 'blanco',
    title: 'Contenedor Blanco',
    description:
      'Residuos aprovechables: papel, cartón, plástico, vidrio y metales. Limpios y secos.',
    color: 'bg-white border',
    text: 'text-gray-800',
    img: 'https://images.unsplash.com/photo-1582407947302-fd05a914e76b?w=800&q=80&auto=format&fit=crop',
  },
  {
    key: 'verde',
    title: 'Contenedor Verde',
    description:
      'Residuos orgánicos: restos de comida, cáscaras, vegetales y residuos biodegradables.',
    color: 'bg-green-500',
    text: 'text-white',
    img: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800&q=80&auto=format&fit=crop',
  },
  {
    key: 'negro',
    title: 'Contenedor Negro',
    description:
      'Residuos no aprovechables: papel higiénico, servilletas, empaques contaminados, etc.',
    color: 'bg-black',
    text: 'text-white',
    img: 'https://images.unsplash.com/photo-1529121200730-6710be0f2c45?w=800&q=80&auto=format&fit=crop',
  },
]

export default function Info() {
  return (
    <section>
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Sección informativa</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {bins.map((bin) => (
          <div key={bin.key} className="rounded-lg overflow-hidden border shadow-sm bg-white">
            <img src={bin.img} alt={bin.title} className="h-32 sm:h-40 w-full object-cover" />
            <div className="p-3 sm:p-4">
              <h2 className="font-semibold text-base sm:text-lg mb-1 sm:mb-2">{bin.title}</h2>
              <p className="text-sm text-gray-700 mb-3 sm:mb-4">{bin.description}</p>
              <div className={`h-8 rounded ${bin.color} ${bin.text} flex items-center justify-center font-medium text-xs sm:text-sm`}>
                {bin.key.toUpperCase()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}