"use client"

import { Undo, Redo, MousePointer2, Hand } from "lucide-react"
import { Tooltip, TooltipProvider } from "@/components/ui/tooltip-custom"

interface EditorHeaderProps {
  tipoMapa: string
  sectorNombre?: string
  sectorPrecio?: number
  isMac: boolean
  puedeDeshacer: boolean
  puedeRehacer: boolean
  onDeshacer: () => void
  onRehacer: () => void
  cantidadSeleccionadas: number
  herramientaActiva: string
}

export function EditorHeader({
  tipoMapa,
  sectorNombre,
  sectorPrecio,
  isMac,
  puedeDeshacer,
  puedeRehacer,
  onDeshacer,
  onRehacer,
  cantidadSeleccionadas,
  herramientaActiva,
}: EditorHeaderProps) {
  return (
    <TooltipProvider>
      <div className="h-14 bg-white border-b border-slate-200 flex items-center px-6 justify-between shrink-0 z-20 shadow-sm">
        <div className="flex items-center gap-4">
          <h1 className="font-bold text-lg text-slate-700 flex items-center gap-2">
            {tipoMapa === "completo" ? "Mapa Multisector" : `Sector: ${sectorNombre}`}
            {tipoMapa === "sector" && (
              <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                Bs. {sectorPrecio}
              </span>
            )}
          </h1>

          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
            <Tooltip label="Deshacer" shortcut="Ctrl + Z" isMac={isMac} position="bottom">
              <button
                onClick={onDeshacer}
                disabled={!puedeDeshacer}
                className={`p-1.5 rounded transition-colors ${
                  !puedeDeshacer
                    ? "text-slate-300"
                    : "text-slate-600 hover:bg-white hover:text-indigo-600 hover:shadow-sm"
                }`}
              >
                <Undo size={16} />
              </button>
            </Tooltip>
            <Tooltip label="Rehacer" shortcut="Ctrl + Y" isMac={isMac} position="bottom">
              <button
                onClick={onRehacer}
                disabled={!puedeRehacer}
                className={`p-1.5 rounded transition-colors ${
                  !puedeRehacer
                    ? "text-slate-300"
                    : "text-slate-600 hover:bg-white hover:text-indigo-600 hover:shadow-sm"
                }`}
              >
                <Redo size={16} />
              </button>
            </Tooltip>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {cantidadSeleccionadas > 0 && (
            <span className="text-xs font-bold bg-indigo-100 text-indigo-600 px-2 py-1 rounded-full">
              {cantidadSeleccionadas} seleccionada(s)
            </span>
          )}
          <div className="text-sm text-slate-400 flex items-center gap-2">
            {herramientaActiva === "mano" ? <Hand size={14} /> : <MousePointer2 size={14} />}
            {herramientaActiva === "mano" ? "Modo Paneo" : "Modo Edición"}
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
