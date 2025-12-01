import type { Mesa } from "@/types/mesa"
import { TAMANO_SILLA, ESPACIO_SILLA, MARGEN_ESQUINA, GAP_MINIMO } from "@/constants/canvas"

export const obtenerSiguienteId = (mesasExistentes: Mesa[]): string => {
  const maxNum = mesasExistentes.reduce((max, m) => {
    const match = m.id.match(/^T(\d+)$/)
    if (match) return Math.max(max, Number.parseInt(match[1]))
    return max
  }, 0)
  return `T${maxNum + 1}`
}

export const obtenerSiguienteNombre = (etiquetaBase: string, mesasExistentes: Mesa[]): string => {
  const match = etiquetaBase.match(/^(.*?)(\d+)$/)
  if (!match) return etiquetaBase + " (Copia)"
  const prefix = match[1]
  const maxNum = mesasExistentes.reduce((max, m) => {
    const mMatch = m.etiqueta.match(/^(.*?)(\d+)$/)
    if (mMatch && mMatch[1] === prefix) return Math.max(max, Number.parseInt(mMatch[2]))
    return max
  }, 0)
  return `${prefix}${maxNum + 1}`
}

export const esTamanoValido = (
  mesa: Mesa,
  nuevoAncho: number,
  nuevoAlto: number,
  nuevasSillas: number | null = null,
): boolean => {
  const cantidadSillas = nuevasSillas !== null ? nuevasSillas : mesa.sillas
  const { forma, ladosActivos } = mesa
  const lados = ladosActivos || ["top", "bottom", "left", "right"]

  if (forma === "circulo") {
    const perimetroDisponible = Math.PI * nuevoAncho
    const perimetroNecesario = cantidadSillas * (TAMANO_SILLA + 2)
    return perimetroDisponible >= perimetroNecesario
  }

  const lPos = [
    { id: "top", l: nuevoAncho },
    { id: "bottom", l: nuevoAncho },
    { id: "right", l: nuevoAlto },
    { id: "left", l: nuevoAlto },
  ].filter((k) => lados.includes(k.id))

  if (lPos.length === 0) return true

  const pTotal = lPos.reduce((a, b) => a + b.l, 0)
  let asg = 0
  const dist = lPos.map((l) => {
    const c = Math.floor((l.l / pTotal) * cantidadSillas)
    const r = (l.l / pTotal) * mesa.sillas - c
    asg += c
    return { ...l, c, r }
  })

  dist.sort((a, b) => b.r - a.r)
  for (let i = 0; i < cantidadSillas - asg; i++) if (dist[i]) dist[i].c++

  return dist.every((d) => {
    if (d.c === 0) return true
    const espacioRequerido = d.c * TAMANO_SILLA + (d.c - 1) * GAP_MINIMO + MARGEN_ESQUINA * 2
    return d.l >= espacioRequerido
  })
}

export const calcularLimites = (mesa: Mesa): { minW: number; minH: number } => {
  const minBase = 50
  const maxBase = 500

  const encontrarMinimoValido = (eje: "ancho" | "alto"): number => {
    let low = minBase
    let high = maxBase
    let minValido = maxBase

    while (low <= high) {
      const mid = Math.floor((low + high) / 2)
      const w = eje === "ancho" ? mid : mesa.ancho
      const h = eje === "alto" ? mid : mesa.alto

      if (esTamanoValido(mesa, w, h)) {
        minValido = mid
        high = mid - 1
      } else {
        low = mid + 1
      }
    }
    return minValido
  }

  return { minW: encontrarMinimoValido("ancho"), minH: encontrarMinimoValido("alto") }
}

export const obtenerPosicionesSillas = (mesa: Mesa): { x: number; y: number; angulo: number }[] => {
  const { x, y, ancho, alto, sillas, forma } = mesa
  const lados = mesa.ladosActivos || ["top", "bottom", "left", "right"]
  const factorEspacio = (mesa.espacioEntreSillas ?? 50) / 100

  if (forma === "circulo") {
    const radio = Math.max(ancho, alto) / 2 + ESPACIO_SILLA
    return Array.from({ length: sillas }).map((_, i) => {
      const angRad = ((i * 360) / sillas - 90) * (Math.PI / 180)
      const anguloSilla = (i * 360) / sillas
      return {
        x: x + radio * Math.cos(angRad),
        y: y + radio * Math.sin(angRad),
        angulo: anguloSilla,
      }
    })
  }

  const lPos = [
    { id: "top", l: ancho },
    { id: "bottom", l: ancho },
    { id: "right", l: alto },
    { id: "left", l: alto },
  ].filter((k) => lados.includes(k.id))

  if (lPos.length === 0) return []

  const pTotal = lPos.reduce((a, b) => a + b.l, 0)
  let asg = 0
  const dist = lPos.map((l) => {
    const c = Math.floor((l.l / pTotal) * sillas)
    const r = (l.l / pTotal) * mesa.sillas - c
    asg += c
    return { ...l, c, r }
  })

  dist.sort((a, b) => b.r - a.r)
  for (let i = 0; i < sillas - asg; i++) if (dist[i]) dist[i].c++

  const pos: { x: number; y: number; angulo: number }[] = []
  const b = { l: x - ancho / 2, r: x + ancho / 2, t: y - alto / 2, b: y + alto / 2 }

  const addSillas = (s: string, c: number) => {
    if (c === 0) return
    const longLado = s === "top" || s === "bottom" ? ancho : alto
    const espacioDisponible = longLado - MARGEN_ESQUINA * 2

    const anchoTotalSillas = c * TAMANO_SILLA
    const espacioLibre = espacioDisponible - anchoTotalSillas
    const gapMaximo = c > 1 ? espacioLibre / (c - 1) : 0
    const gapFinal = c > 1 ? GAP_MINIMO + (gapMaximo - GAP_MINIMO) * factorEspacio : 0

    const anchoOcupado = anchoTotalSillas + (c - 1) * gapFinal
    const offsetInicio = (longLado - anchoOcupado) / 2 + TAMANO_SILLA / 2

    for (let i = 0; i < c; i++) {
      const offset = offsetInicio + i * (TAMANO_SILLA + gapFinal)
      if (s === "top") pos.push({ x: b.l + offset, y: b.t - ESPACIO_SILLA, angulo: 180 })
      if (s === "bottom") pos.push({ x: b.l + offset, y: b.b + ESPACIO_SILLA, angulo: 0 })
      if (s === "right") pos.push({ x: b.r + ESPACIO_SILLA, y: b.t + offset, angulo: 270 })
      if (s === "left") pos.push({ x: b.l - ESPACIO_SILLA, y: b.t + offset, angulo: 90 })
    }
  }

  dist.forEach((d) => addSillas(d.id, d.c))
  return pos
}

export const calcularBoundingBox = (
  mesasArray: Mesa[],
  padding = 20,
): { minX: number; minY: number; maxX: number; maxY: number; width: number; height: number } | null => {
  if (mesasArray.length === 0) return null

  let minX = Number.POSITIVE_INFINITY,
    minY = Number.POSITIVE_INFINITY,
    maxX = Number.NEGATIVE_INFINITY,
    maxY = Number.NEGATIVE_INFINITY
  const pad = ESPACIO_SILLA + TAMANO_SILLA + padding

  mesasArray.forEach((m) => {
    const scale = m.escala || 1
    const l = m.x - (m.ancho * scale) / 2 - pad
    const r = m.x + (m.ancho * scale) / 2 + pad
    const t = m.y - (m.alto * scale) / 2 - pad
    const b = m.y + (m.alto * scale) / 2 + pad
    if (l < minX) minX = l
    if (r > maxX) maxX = r
    if (t < minY) minY = t
    if (b > maxY) maxY = b
  })

  return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY }
}
