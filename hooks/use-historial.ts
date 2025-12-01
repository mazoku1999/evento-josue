"use client"

import { useState, useRef, useCallback } from "react"
import type { Mesa, Sector, HistorialEstado } from "@/types/mesa"
import { HISTORIAL_LIMITE } from "@/constants/canvas"

type Historial = {
  pasado: HistorialEstado[]
  futuro: HistorialEstado[]
}

export function useHistorial(
  mesas: Mesa[],
  sectores: Sector[],
  idsSeleccionados: string[],
  setMesas: (mesas: Mesa[]) => void,
  setSectores: (sectores: Sector[]) => void,
  setIdsSeleccionados: (ids: string[]) => void,
) {
  const [historial, setHistorial] = useState<Historial>({ pasado: [], futuro: [] })
  const snapshotRef = useRef<HistorialEstado | null>(null)

  const guardarHistorial = useCallback(() => {
    setHistorial((prev) => {
      const nuevoEstado: HistorialEstado = {
        mesas: JSON.parse(JSON.stringify(mesas)),
        sectores: JSON.parse(JSON.stringify(sectores)),
        idsSeleccionados: [...idsSeleccionados],
      }
      const nuevoPasado = [...prev.pasado, nuevoEstado].slice(-HISTORIAL_LIMITE)
      return { pasado: nuevoPasado, futuro: [] }
    })
  }, [mesas, sectores, idsSeleccionados])

  const tomarSnapshot = useCallback(() => {
    snapshotRef.current = {
      mesas: JSON.parse(JSON.stringify(mesas)),
      sectores: JSON.parse(JSON.stringify(sectores)),
      idsSeleccionados: [...idsSeleccionados],
    }
  }, [mesas, sectores, idsSeleccionados])

  const confirmarSnapshotSiHuboCambios = useCallback(() => {
    if (!snapshotRef.current) return

    const estadoPrevio = snapshotRef.current
    const huboCambios =
      JSON.stringify(estadoPrevio.mesas) !== JSON.stringify(mesas) ||
      JSON.stringify(estadoPrevio.sectores) !== JSON.stringify(sectores)

    if (huboCambios) {
      setHistorial((prev) => ({
        pasado: [...prev.pasado, estadoPrevio].slice(-HISTORIAL_LIMITE),
        futuro: [],
      }))
    }
    snapshotRef.current = null
  }, [mesas, sectores])

  const deshacer = useCallback(() => {
    if (historial.pasado.length === 0) return

    const estadoAnterior = historial.pasado[historial.pasado.length - 1]
    const nuevoPasado = historial.pasado.slice(0, -1)
    const estadoActual: HistorialEstado = { mesas, sectores, idsSeleccionados }

    setHistorial({
      pasado: nuevoPasado,
      futuro: [estadoActual, ...historial.futuro],
    })

    setMesas(estadoAnterior.mesas)
    setSectores(estadoAnterior.sectores)
    setIdsSeleccionados(estadoAnterior.idsSeleccionados || [])
  }, [historial, mesas, sectores, idsSeleccionados, setMesas, setSectores, setIdsSeleccionados])

  const rehacer = useCallback(() => {
    if (historial.futuro.length === 0) return

    const estadoSiguiente = historial.futuro[0]
    const nuevoFuturo = historial.futuro.slice(1)
    const estadoActual: HistorialEstado = { mesas, sectores, idsSeleccionados }

    setHistorial({
      pasado: [...historial.pasado, estadoActual],
      futuro: nuevoFuturo,
    })

    setMesas(estadoSiguiente.mesas)
    setSectores(estadoSiguiente.sectores)
    setIdsSeleccionados(estadoSiguiente.idsSeleccionados || [])
  }, [historial, mesas, sectores, idsSeleccionados, setMesas, setSectores, setIdsSeleccionados])

  return {
    historial,
    guardarHistorial,
    tomarSnapshot,
    confirmarSnapshotSiHuboCambios,
    deshacer,
    rehacer,
    puedeDeshacer: historial.pasado.length > 0,
    puedeRehacer: historial.futuro.length > 0,
  }
}
