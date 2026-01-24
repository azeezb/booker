import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <h1 className="text-4xl font-bold text-gray-900 mb-2 text-center">
          Booker
        </h1>
        <p className="text-gray-600 text-center mb-6">
          Book Club Management Platform
        </p>
        
        <div className="space-y-4">
          <button 
            onClick={() => setCount((count) => count + 1)}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-md"
          >
            Count: {count}
          </button>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 text-sm font-medium">
              ✅ Frontend Setup Complete
            </p>
            <ul className="text-green-700 text-xs mt-2 space-y-1">
              <li>• React + TypeScript</li>
              <li>• Vite</li>
              <li>• Tailwind CSS v3</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
