"use client"

import type React from "react"

import { useState, useCallback } from "react"
import type { Sector, Mesa } from "@/types/mesa"

interface UseSectoresProps {
  guardarHistorial: () => void
  setMesas: React.Dispatch<React.SetStateAction<Mesa[]>>
}

const COLORES_SECTOR = ["#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#ec4899", "#8b5cf6"]

export function useSectores({ guardarHistorial, setMesas }: UseSectoresProps) {
  const [sectores, setSectores] = useState<Sector[]>([
    { id: "S1", nombre: "General", color: "#94a3b8", precio: 50 },
    { id: "S2", nombre: "VIP", color: "#8B6FFA", precio: 150 },
  ])

  const agregarSector = useCallback(() => {
    guardarHistorial()
    const nuevoId = `S${Date.now()}`
    const color = COLORES_SECTOR[sectores.length % COLORES_SECTOR.length]
    setSectores((prev) => [...prev, { id: nuevoId, nombre: `Nuevo Sector ${sectores.length + 1}`, color, precio: 0 }])
  }, [guardarHistorial, sectores.length])

  const actualizarSector = useCallback((id: string, k: string, v: any) => {
    setSectores((prev) => prev.map((s) => (s.id === id ? { ...s, [k]: v } : s)))
  }, [])

  const eliminarSector = useCallback(
    (id: string) => {
      if (sectores.length <= 1) return
      guardarHistorial()
      const fallback = sectores.find((s) => s.id !== id)!.id
      setMesas((prev) => prev.map((m) => (m.sectorId === id ? { ...m, sectorId: fallback } : m)))
      setSectores((prev) => prev.filter((s) => s.id !== id))
    },
    [guardarHistorial, sectores, setMesas],
  )

  return {
    sectores,
    setSectores,
    agregarSector,
    actualizarSector,
    eliminarSector,
  }
}
