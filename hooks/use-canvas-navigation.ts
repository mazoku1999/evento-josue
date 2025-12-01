"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import type { Mesa } from "@/types/mesa"
import { calcularBoundingBox } from "@/utils/mesa-utils"

interface UseCanvasNavigationProps {
  mesas: Mesa[]
  idsSeleccionados: string[]
  referenciaSvg: React.RefObject<SVGSVGElement | null>
}

export function useCanvasNavigation({ mesas, idsSeleccionados, referenciaSvg }: UseCanvasNavigationProps) {
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const panStart = useRef({ x: 0, y: 0 })

  const getMousePos = useCallback(
    (clientX: number, clientY: number) => {
      if (!referenciaSvg.current) return { x: 0, y: 0 }
      const rect = referenciaSvg.current.getBoundingClientRect()
      return { x: (clientX - rect.left - pan.x) / zoom, y: (clientY - rect.top - pan.y) / zoom }
    },
    [pan, zoom, referenciaSvg],
  )

  const centrarlVista = useCallback(() => {
    setPan({ x: 0, y: 0 })
    setZoom(1)
  }, [])

  const zoomToFit = useCallback(() => {
    if (!referenciaSvg.current || mesas.length === 0) {
      centrarlVista()
      return
    }

    const bbox = calcularBoundingBox(mesas)
    if (!bbox) return

    const rect = referenciaSvg.current.getBoundingClientRect()
    const padding = 50

    const scaleX = (rect.width - padding * 2) / bbox.width
    const scaleY = (rect.height - padding * 2) / bbox.height
    const newZoom = Math.min(Math.max(Math.min(scaleX, scaleY), 0.1), 2)

    const centerX = (bbox.minX + bbox.maxX) / 2
    const centerY = (bbox.minY + bbox.maxY) / 2

    setZoom(newZoom)
    setPan({ x: rect.width / 2 - centerX * newZoom, y: rect.height / 2 - centerY * newZoom })
  }, [mesas, centrarlVista, referenciaSvg])

  const zoomToSelection = useCallback(() => {
    if (!referenciaSvg.current || idsSeleccionados.length === 0) return

    const mesasSeleccionadas = mesas.filter((m) => idsSeleccionados.includes(m.id))
    const bbox = calcularBoundingBox(mesasSeleccionadas)
    if (!bbox) return

    const rect = referenciaSvg.current.getBoundingClientRect()
    const padding = 100

    const scaleX = (rect.width - padding * 2) / bbox.width
    const scaleY = (rect.height - padding * 2) / bbox.height
    const newZoom = Math.min(Math.max(Math.min(scaleX, scaleY), 1.5), 3)

    const centerX = (bbox.minX + bbox.maxX) / 2
    const centerY = (bbox.minY + bbox.maxY) / 2

    setZoom(newZoom)
    setPan({ x: rect.width / 2 - centerX * newZoom, y: rect.height / 2 - centerY * newZoom })
  }, [mesas, idsSeleccionados, referenciaSvg])

  const startPanning = useCallback(
    (clientX: number, clientY: number) => {
      setIsPanning(true)
      panStart.current = { x: clientX - pan.x, y: clientY - pan.y }
    },
    [pan],
  )

  const updatePanning = useCallback(
    (clientX: number, clientY: number) => {
      if (isPanning) {
        setPan({ x: clientX - panStart.current.x, y: clientY - panStart.current.y })
      }
    },
    [isPanning],
  )

  const stopPanning = useCallback(() => {
    setIsPanning(false)
  }, [])

  const handleWheel = useCallback(
    (e: WheelEvent, rect: DOMRect) => {
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top

      if (e.ctrlKey) {
        const scaleFactor = 0.05
        const direction = -Math.sign(e.deltaY)
        const newZoom = Math.max(0.1, Math.min(5, zoom + direction * scaleFactor))
        const newPanX = mouseX - (mouseX - pan.x) * (newZoom / zoom)
        const newPanY = mouseY - (mouseY - pan.y) * (newZoom / zoom)
        setZoom(newZoom)
        setPan({ x: newPanX, y: newPanY })
      } else {
        setPan((prev) => ({ x: prev.x - e.deltaX, y: prev.y - e.deltaY }))
      }
    },
    [zoom, pan],
  )

  const zoomIn = useCallback(() => setZoom((z) => Math.min(z + 0.1, 5)), [])
  const zoomOut = useCallback(() => setZoom((z) => Math.max(z - 0.1, 0.1)), [])

  return {
    zoom,
    setZoom,
    pan,
    setPan,
    isPanning,
    getMousePos,
    centrarlVista,
    zoomToFit,
    zoomToSelection,
    startPanning,
    updatePanning,
    stopPanning,
    handleWheel,
    zoomIn,
    zoomOut,
  }
}
