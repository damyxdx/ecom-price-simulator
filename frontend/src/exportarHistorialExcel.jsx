import { utils, writeFile } from 'xlsx'

const exportarHistorialExcel = (historial) => {
  const rows = historial.flatMap(item => {
    return Object.entries(item.precios).map(([canal, precio]) => ({
      Fecha: item.fecha,
      Producto: item.nombre,
      'Costo base': item.costo_base,
      'Margen (%)': item.margen_deseado,
      Canal: canal,
      Precio: precio
    }))
  })

  const worksheet = utils.json_to_sheet(rows)
  const workbook = utils.book_new()
  utils.book_append_sheet(workbook, worksheet, "Historial")

  const nombreArchivo = `historial_simulaciones_${new Date().toISOString().slice(0, 10)}.xlsx`
  writeFile(workbook, nombreArchivo)
}

export default exportarHistorialExcel