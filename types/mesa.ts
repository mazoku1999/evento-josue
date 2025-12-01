export type Mesa = {
  id: string
  x: number
  y: number
  etiqueta: string
  forma: "circulo" | "cuadrado"
  sillas: number
  ancho: number
  alto: number
  escala: number
  sectorId: string
  ladosActivos: string[]
  bloqueada: boolean
  espacioEntreSillas: number // Nuevo campo para controlar espacio entre sillas (0-100%)
}

export type Sector = {
  id: string
  nombre: string
  color: string
  precio: number
}

export type HistorialEstado = {
  mesas: Mesa[]
  sectores: Sector[]
  idsSeleccionados: string[]
}

export type CajaSeleccion = {
  startX: number
  startY: number
  currentX: number
  currentY: number
} | null

export type Guia = {
  type: "v" | "h"
  pos: number
}

export type EditandoNombre = {
  id: string
  x: number
  y: number
  valor: string
} | null
