import { useState, useEffect } from 'react'
import exportarHistorialExcel from './exportarHistorialExcel'

function App() {
  const [formData, setFormData] = useState({
    nombre: '',
    costo_base: '',
    margen_deseado: ''
  })

  const [resultados, setResultados] = useState(null)
  const [historial, setHistorial] = useState(() => {
    const data = localStorage.getItem('historial')
    return data ? JSON.parse(data) : []
  })

  useEffect(() => {
    localStorage.setItem('historial', JSON.stringify(historial))
  }, [historial])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const calcular = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/calcular', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: formData.nombre,
          costo_base: parseFloat(formData.costo_base),
          margen_deseado: parseFloat(formData.margen_deseado)
        })
      })
      const data = await response.json()
      setResultados(data.precios)

      const nuevoRegistro = {
        fecha: new Date().toLocaleString(),
        nombre: formData.nombre,
        costo_base: formData.costo_base,
        margen_deseado: formData.margen_deseado,
        precios: data.precios
      }
      setHistorial([nuevoRegistro, ...historial])
    } catch (error) {
      console.error("Error al calcular:", error)
    }
  }

  const exportar = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/exportar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: formData.nombre,
          costo_base: parseFloat(formData.costo_base),
          margen_deseado: parseFloat(formData.margen_deseado)
        })
      })
      if (!response.ok) throw new Error("No se pudo exportar el archivo")
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `simulacion_${formData.nombre || 'producto'}.xlsx`
      document.body.appendChild(a)
      a.click()
      a.remove()
    } catch (error) {
      console.error("Error al exportar:", error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-start p-4">
      <div className="bg-gray-800 p-6 rounded-xl shadow-md w-full max-w-md mb-6">
        <h1 className="text-2xl font-bold text-center mb-4">Simulador de Precios</h1>
        <input
          className="w-full mb-3 p-2 border border-gray-700 bg-gray-700 text-white rounded"
          type="text"
          name="nombre"
          placeholder="Nombre del producto"
          onChange={handleChange}
        />
        <input
          className="w-full mb-3 p-2 border border-gray-700 bg-gray-700 text-white rounded"
          type="number"
          name="costo_base"
          placeholder="Costo base"
          onChange={handleChange}
        />
        <input
          className="w-full mb-3 p-2 border border-gray-700 bg-gray-700 text-white rounded"
          type="number"
          name="margen_deseado"
          placeholder="Margen deseado (%)"
          onChange={handleChange}
        />
        <div className="flex justify-between mt-4 flex-wrap gap-2">
          <button onClick={calcular} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Calcular
          </button>
          <button onClick={exportar} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            Exportar
          </button>
          <button
            onClick={() => exportarHistorialExcel(historial)}
            className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
          >
            Exportar historial
          </button>
        </div>
        {resultados && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">Precios sugeridos</h2>
            <ul className="space-y-1">
              {Object.entries(resultados).map(([canal, precio]) => (
                <li key={canal}>
                  <strong>{canal}</strong>: ${precio}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {historial.length > 0 && (
        <div className="w-full max-w-4xl">
          <h2 className="text-xl font-bold mb-2">Historial de Cálculos</h2>
          <table className="w-full table-auto text-sm bg-gray-800 rounded overflow-hidden">
            <thead>
              <tr className="bg-gray-700 text-white">
                <th className="p-2 border border-gray-600">Fecha</th>
                <th className="p-2 border border-gray-600">Producto</th>
                <th className="p-2 border border-gray-600">Costo</th>
                <th className="p-2 border border-gray-600">Margen</th>
                <th className="p-2 border border-gray-600">Canales</th>
              </tr>
            </thead>
            <tbody>
              {historial.map((item, index) => (
                <tr key={index} className="text-white">
                  <td className="p-2 border border-gray-700">{item.fecha}</td>
                  <td className="p-2 border border-gray-700">{item.nombre}</td>
                  <td className="p-2 border border-gray-700">${item.costo_base}</td>
                  <td className="p-2 border border-gray-700">{item.margen_deseado}%</td>
                  <td className="p-2 border border-gray-700">
                    {Object.entries(item.precios).map(([canal, precio]) => (
                      <div key={canal}>{canal}: ${precio}</div>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default App