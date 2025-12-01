"use client"

import { useState, useCallback } from "react"
import type { Mesa, Sector } from "@/types/mesa"
import { obtenerSiguienteId, obtenerSiguienteNombre, esTamanoValido } from "@/utils/mesa-utils"

interface UseMesasProps {
  sectores: Sector[]
  guardarHistorial: () => void
}

export function useMesas({ sectores, guardarHistorial }: UseMesasProps) {
  const [mesas, setMesas] = useState<Mesa[]>([])
  const [idsSeleccionados, setIdsSeleccionados] = useState<string[]>([])
  const [mesasPortapapeles, setMesasPortapapeles] = useState<Mesa[]>([])

  const agregarMesa = useCallback(
    (forma: "circulo" | "cuadrado", posicion: { x: number; y: number }) => {
      guardarHistorial()
      const nuevoId = obtenerSiguienteId(mesas)
      const sz = forma === "circulo" ? 110 : 100
      const nuevoNombre = obtenerSiguienteNombre("Mesa 0", mesas)

      const nuevaMesa: Mesa = {
        id: nuevoId,
        x: posicion.x,
        y: posicion.y,
        etiqueta: nuevoNombre,
        forma,
        sillas: forma === "cuadrado" ? 8 : 4,
        ancho: forma === "cuadrado" ? 120 : sz,
        alto: forma === "cuadrado" ? 200 : sz,
        escala: 1,
        sectorId: sectores[0]?.id || "S1",
        ladosActivos: ["top", "bottom", "left", "right"],
        bloqueada: false,
      }

      setMesas((prev) => [...prev, nuevaMesa])
      setIdsSeleccionados([nuevoId])
      return nuevoId
    },
    [guardarHistorial, mesas, sectores],
  )

  const insertarNuevasMesas = useCallback(
    (origenMesas: Mesa[], offsetX: number, offsetY: number) => {
      const nuevasMesas: Mesa[] = []
      const mesasTemp = [...mesas]

      origenMesas.forEach((base) => {
        const nuevoId = obtenerSiguienteId(mesasTemp)
        const nuevoNombre = obtenerSiguienteNombre(base.etiqueta, mesasTemp)
        const nuevaMesa: Mesa = {
          ...base,
          id: nuevoId,
          x: base.x + offsetX,
          y: base.y + offsetY,
          etiqueta: nuevoNombre,
          bloqueada: false,
        }
        nuevasMesas.push(nuevaMesa)
        mesasTemp.push(nuevaMesa)
      })

      setMesas((prev) => [...prev, ...nuevasMesas])
      setIdsSeleccionados(nuevasMesas.map((m) => m.id))
      return nuevasMesas
    },
    [mesas],
  )

  const duplicarMesasSeleccionadas = useCallback(() => {
    if (idsSeleccionados.length > 0) {
      guardarHistorial()
      const seleccionadas = mesas.filter((m) => idsSeleccionados.includes(m.id))
      insertarNuevasMesas(seleccionadas, 40, 40)
    }
  }, [idsSeleccionados, mesas, guardarHistorial, insertarNuevasMesas])

  const eliminarSeleccionadas = useCallback(() => {
    setMesas((prev) => prev.filter((m) => !idsSeleccionados.includes(m.id)))
    setIdsSeleccionados([])
  }, [idsSeleccionados])

  const toggleBloqueo = useCallback(() => {
    if (idsSeleccionados.length === 0) return
    guardarHistorial()

    const mesasSeleccionadas = mesas.filter((m) => idsSeleccionados.includes(m.id))
    const todasBloqueadas = mesasSeleccionadas.every((m) => m.bloqueada)

    setMesas((prev) =>
      prev.map((m) => {
        if (idsSeleccionados.includes(m.id)) {
          return { ...m, bloqueada: !todasBloqueadas }
        }
        return m
      }),
    )
  }, [idsSeleccionados, mesas, guardarHistorial])

  const actualizarMesa = useCallback(
    (k: string, v: any) => {
      setMesas((prevMesas) =>
        prevMesas.map((m) => {
          if (idsSeleccionados.includes(m.id)) {
            if (k === "ancho" || k === "alto" || k === "sillas") {
              const nAncho = k === "ancho" ? v : m.ancho
              const nAlto = k === "alto" ? v : m.alto
              const nSillas = k === "sillas" ? v : m.sillas
              if (!esTamanoValido(m, nAncho, nAlto, nSillas)) return m
            }
            return { ...m, [k]: v }
          }
          return m
        }),
      )
    },
    [idsSeleccionados],
  )

  const actualizarDiametro = useCallback(
    (d: number) => {
      setMesas((prevMesas) =>
        prevMesas.map((m) => {
          if (idsSeleccionados.includes(m.id)) {
            if (!esTamanoValido(m, d, d)) return m
            return { ...m, ancho: d, alto: d }
          }
          return m
        }),
      )
    },
    [idsSeleccionados],
  )

  const toggleLado = useCallback(
    (lado: string) => {
      guardarHistorial()
      setMesas((prevMesas) =>
        prevMesas.map((m) => {
          if (idsSeleccionados.includes(m.id)) {
            const act = m.ladosActivos || ["top", "bottom", "left", "right"]
            return { ...m, ladosActivos: act.includes(lado) ? act.filter((l) => l !== lado) : [...act, lado] }
          }
          return m
        }),
      )
    },
    [idsSeleccionados, guardarHistorial],
  )

  const copiarSeleccionadas = useCallback(() => {
    if (idsSeleccionados.length > 0) {
      const aCopiar = mesas.filter((m) => idsSeleccionados.includes(m.id))
      aCopiar.sort((a, b) => a.y - b.y || a.x - b.x)
      setMesasPortapapeles(aCopiar)
    }
  }, [idsSeleccionados, mesas])

  const pegarMesas = useCallback(() => {
    if (mesasPortapapeles.length > 0) {
      guardarHistorial()
      insertarNuevasMesas(mesasPortapapeles, 20, 20)
    }
  }, [mesasPortapapeles, guardarHistorial, insertarNuevasMesas])

  const seleccionarTodas = useCallback(() => {
    setIdsSeleccionados(mesas.map((m) => m.id))
  }, [mesas])

  const moverSeleccionadas = useCallback(
    (deltaX: number, deltaY: number) => {
      const mesasSeleccionadas = mesas.filter((m) => idsSeleccionados.includes(m.id))
      if (mesasSeleccionadas.some((m) => m.bloqueada)) return

      guardarHistorial()
      setMesas((prev) =>
        prev.map((m) => {
          if (idsSeleccionados.includes(m.id)) {
            return { ...m, x: m.x + deltaX, y: m.y + deltaY }
          }
          return m
        }),
      )
    },
    [idsSeleccionados, mesas, guardarHistorial],
  )

  return {
    mesas,
    setMesas,
    idsSeleccionados,
    setIdsSeleccionados,
    mesasPortapapeles,
    agregarMesa,
    insertarNuevasMesas,
    duplicarMesasSeleccionadas,
    eliminarSeleccionadas,
    toggleBloqueo,
    actualizarMesa,
    actualizarDiametro,
    toggleLado,
    copiarSeleccionadas,
    pegarMesas,
    seleccionarTodas,
    moverSeleccionadas,
  }
}
