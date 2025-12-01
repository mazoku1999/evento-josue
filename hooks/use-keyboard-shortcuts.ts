"use client"

import { useEffect, useCallback } from "react"

interface UseKeyboardShortcutsProps {
  idsSeleccionados: string[]
  mostrarAyudaAtajos: boolean
  herramienta: string
  herramientaTemporal: string | null
  onDeshacer: () => void
  onRehacer: () => void
  onZoomToFit: () => void
  onZoomToSelection: () => void
  onCentrarVista: () => void
  onToggleBloqueo: () => void
  onSetMostrarAyuda: (show: boolean) => void
  onSetIdsSeleccionados: (ids: string[]) => void
  onSetHerramienta: (h: string) => void
  onSetHerramientaTemporal: (h: string | null) => void
  onMoverSeleccionadas: (dx: number, dy: number) => void
  onEliminarSeleccionadas: () => void
  onCopiarSeleccionadas: () => void
  onPegarMesas: () => void
  onDuplicarSeleccionadas: () => void
  onSeleccionarTodas: () => void
}

export function useKeyboardShortcuts({
  idsSeleccionados,
  mostrarAyudaAtajos,
  herramienta,
  herramientaTemporal,
  onDeshacer,
  onRehacer,
  onZoomToFit,
  onZoomToSelection,
  onCentrarVista,
  onToggleBloqueo,
  onSetMostrarAyuda,
  onSetIdsSeleccionados,
  onSetHerramienta,
  onSetHerramientaTemporal,
  onMoverSeleccionadas,
  onEliminarSeleccionadas,
  onCopiarSeleccionadas,
  onPegarMesas,
  onDuplicarSeleccionadas,
  onSeleccionarTodas,
}: UseKeyboardShortcutsProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === "INPUT") return

      // Undo/Redo
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault()
        if (e.shiftKey) onRehacer()
        else onDeshacer()
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
        e.preventDefault()
        onRehacer()
      }

      // Zoom shortcuts
      if ((e.ctrlKey || e.metaKey) && e.key === "1") {
        e.preventDefault()
        onZoomToFit()
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "2") {
        e.preventDefault()
        onZoomToSelection()
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "0") {
        e.preventDefault()
        onCentrarVista()
      }

      // Lock
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "l") {
        e.preventDefault()
        onToggleBloqueo()
      }

      // Escape
      if (e.key === "Escape") {
        if (mostrarAyudaAtajos) onSetMostrarAyuda(false)
        else if (idsSeleccionados.length > 0) onSetIdsSeleccionados([])
      }

      // Help
      if (e.key === "?" || (e.shiftKey && e.key === "/")) {
        e.preventDefault()
        onSetMostrarAyuda(!mostrarAyudaAtajos)
      }

      // Tools
      if (e.key === "v") onSetHerramienta("seleccion")
      if (e.key === "h") onSetHerramienta("mano")
      if (e.key === " ") {
        e.preventDefault()
        if (herramienta !== "mano") onSetHerramientaTemporal("mano")
      }

      // Arrow keys
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        if (idsSeleccionados.length > 0) {
          e.preventDefault()
          const distancia = e.shiftKey ? 10 : 1
          let deltaX = 0
          let deltaY = 0

          if (e.key === "ArrowUp") deltaY = -distancia
          if (e.key === "ArrowDown") deltaY = distancia
          if (e.key === "ArrowLeft") deltaX = -distancia
          if (e.key === "ArrowRight") deltaX = distancia

          onMoverSeleccionadas(deltaX, deltaY)
        }
      }

      // Delete
      if (e.key === "Delete" || e.key === "Backspace") {
        if (idsSeleccionados.length > 0) {
          onEliminarSeleccionadas()
        }
      }

      // Copy/Paste/Duplicate/Select All
      if ((e.ctrlKey || e.metaKey) && e.key === "c") {
        onCopiarSeleccionadas()
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "v") {
        onPegarMesas()
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "d") {
        e.preventDefault()
        onDuplicarSeleccionadas()
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "a") {
        e.preventDefault()
        onSeleccionarTodas()
      }
    },
    [
      idsSeleccionados,
      mostrarAyudaAtajos,
      herramienta,
      onDeshacer,
      onRehacer,
      onZoomToFit,
      onZoomToSelection,
      onCentrarVista,
      onToggleBloqueo,
      onSetMostrarAyuda,
      onSetIdsSeleccionados,
      onSetHerramienta,
      onSetHerramientaTemporal,
      onMoverSeleccionadas,
      onEliminarSeleccionadas,
      onCopiarSeleccionadas,
      onPegarMesas,
      onDuplicarSeleccionadas,
      onSeleccionarTodas,
    ],
  )

  const handleKeyUp = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === " ") {
        if (herramientaTemporal === "mano") onSetHerramientaTemporal(null)
      }
    },
    [herramientaTemporal, onSetHerramientaTemporal],
  )

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [handleKeyDown, handleKeyUp])
}
