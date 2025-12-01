import type { Mesa, Sector } from "@/types/mesa"
import { TAMANO_SILLA, ESPACIO_SILLA } from "@/constants/canvas"

export const exportarSVG = (
  svgRef: SVGSVGElement,
  mesas: Mesa[],
  imagenFondo: string | null,
  dimensionesImagen: { w: number; h: number },
  tipoMapa: string,
) => {
  const clone = svgRef.cloneNode(true) as SVGSVGElement
  clone.querySelector("#capa-fondo")?.remove()
  clone.querySelector("#capa-grid")?.remove()
  clone.querySelector("#capa-guias")?.remove()
  clone.querySelector("#capa-seleccion")?.remove()

  clone.setAttribute("width", "100%")
  clone.setAttribute("height", "100%")
  clone.style.width = "100%"
  clone.style.height = "100%"

  if (!imagenFondo && mesas.length > 0) {
    let minX = Number.POSITIVE_INFINITY,
      minY = Number.POSITIVE_INFINITY,
      maxX = Number.NEGATIVE_INFINITY,
      maxY = Number.NEGATIVE_INFINITY
    const pad = 50

    mesas.forEach((m) => {
      const l = m.x - m.ancho / 2 - ESPACIO_SILLA - TAMANO_SILLA
      const r = m.x + m.ancho / 2 + ESPACIO_SILLA + TAMANO_SILLA
      const t = m.y - m.alto / 2 - ESPACIO_SILLA - TAMANO_SILLA
      const b = m.y + m.alto / 2 + ESPACIO_SILLA + TAMANO_SILLA + 20
      if (l < minX) minX = l
      if (r > maxX) maxX = r
      if (t < minY) minY = t
      if (b > maxY) maxY = b
    })

    if (minX !== Number.POSITIVE_INFINITY) {
      const w = maxX - minX + pad * 2
      const h = maxY - minY + pad * 2
      clone.setAttribute("viewBox", `${minX - pad} ${minY - pad} ${w} ${h}`)
      const contentGroup = clone.querySelector("#contenido-mapa")
      if (contentGroup) contentGroup.removeAttribute("transform")
    }
  } else if (imagenFondo) {
    clone.setAttribute("viewBox", `0 0 ${dimensionesImagen.w} ${dimensionesImagen.h}`)
    const contentGroup = clone.querySelector("#contenido-mapa")
    if (contentGroup) contentGroup.removeAttribute("transform")
  }

  const a = document.createElement("a")
  a.href = URL.createObjectURL(
    new Blob([new XMLSerializer().serializeToString(clone)], { type: "image/svg+xml;charset=utf-8" }),
  )
  a.download = `plano_${tipoMapa}_${Date.now()}.svg`
  a.click()
}

export const descargarJSON = (
  mesas: Mesa[],
  sectores: Sector[],
  tipoMapa: string,
  imagenFondo: string | null,
  dimensionesImagen: { w: number; h: number },
) => {
  const dataToSave: any = { tipo: tipoMapa, sectores }

  if (imagenFondo) {
    dataToSave.dimensiones = dimensionesImagen
    dataToSave.mesas = mesas
  } else {
    if (mesas.length === 0) {
      dataToSave.dimensiones = { w: 800, h: 600 }
      dataToSave.mesas = []
    } else {
      let minX = Number.POSITIVE_INFINITY,
        minY = Number.POSITIVE_INFINITY,
        maxX = Number.NEGATIVE_INFINITY,
        maxY = Number.NEGATIVE_INFINITY
      const pad = 50

      mesas.forEach((m) => {
        const l = m.x - m.ancho / 2 - ESPACIO_SILLA - TAMANO_SILLA
        const r = m.x + m.ancho / 2 + ESPACIO_SILLA + TAMANO_SILLA
        const t = m.y - m.alto / 2 - ESPACIO_SILLA - TAMANO_SILLA
        const b = m.y + m.alto / 2 + ESPACIO_SILLA + TAMANO_SILLA + 20
        if (l < minX) minX = l
        if (r > maxX) maxX = r
        if (t < minY) minY = t
        if (b > maxY) maxY = b
      })

      const originX = minX - pad
      const originY = minY - pad
      const width = maxX - minX + pad * 2
      const height = maxY - minY + pad * 2
      dataToSave.dimensiones = { w: width, h: height }
      dataToSave.mesas = mesas.map((m) => ({ ...m, x: m.x - originX, y: m.y - originY }))
    }
  }

  const a = document.createElement("a")
  a.href = URL.createObjectURL(new Blob([JSON.stringify(dataToSave, null, 2)], { type: "application/json" }))
  a.download = `datos_${tipoMapa}_${Date.now()}.json`
  a.click()
}
