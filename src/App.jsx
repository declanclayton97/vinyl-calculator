import { useState } from 'react'
import VinylCalculator from './VinylCalculator'

const TABS = [
  { id: 'vinyl', label: 'Vinyl Calculator' },
  { id: 'size', label: 'Size Comparison' },
]

function App() {
  const [tab, setTab] = useState('vinyl')

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <nav className="flex gap-0 bg-gray-900 border-b border-gray-800">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-5 py-3 text-sm font-semibold transition-colors ${
              tab === t.id
                ? 'bg-yellow-400 text-black'
                : 'text-gray-300 hover:text-white hover:bg-gray-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div className="flex-1 min-h-0">
        {tab === 'vinyl' && <VinylCalculator />}
        {tab === 'size' && (
          <iframe
            src="/size-comparison/index.html"
            title="Size Comparison"
            className="w-full h-[calc(100vh-48px)] border-0"
          />
        )}
      </div>
    </div>
  )
}

export default App
