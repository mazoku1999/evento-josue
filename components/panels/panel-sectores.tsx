"use client"

import type { Mesa, Sector } from "@/types/mesa"
import { TooltipProvider, Tooltip } from "@/components/ui/tooltip-custom"
import { Plus, Trash2 } from "lucide-react"

interface PanelSectoresProps {
  sectores: Sector[]
  mesas: Mesa[]
  tipoMapa: string
  isMac: boolean
  onAgregarSector: () => void
  onActualizarSector: (id: string, key: string, value: any) => void
  onEliminarSector: (id: string) => void
  onIniciarEdicion: () => void
  onFinalizarEdicion: () => void
}

export function PanelSectores({
  sectores,
  mesas,
  tipoMapa,
  isMac,
  onAgregarSector,
  onActualizarSector,
  onEliminarSector,
  onIniciarEdicion,
  onFinalizarEdicion,
}: PanelSectoresProps) {
  return (
    <>
      <TooltipProvider>
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <h2 className="font-semibold text-slate-800">{tipoMapa === "completo" ? "Sectores" : "Configuración"}</h2>
          {tipoMapa === "completo" && (
            <Tooltip label="Añadir Sector" isMac={isMac} position="left">
              <button onClick={onAgregarSector} className="text-indigo-600 hover:bg-indigo-50 p-1.5 rounded-lg">
                <Plus size={18} />
              </button>
            </Tooltip>
          )}
        </div>
      </TooltipProvider>
      <div className="p-4 space-y-3 flex-1 overflow-y-auto">
        {sectores.map((sector) => (
          <div key={sector.id} className="border border-slate-100 rounded-xl p-3 bg-slate-50/50">
            <div className="flex items-center gap-2 mb-2">
              <input
                type="color"
                value={sector.color}
                onFocus={onIniciarEdicion}
                onBlur={onFinalizarEdicion}
                onChange={(e) => onActualizarSector(sector.id, "color", e.target.value)}
                className="w-7 h-7 rounded-lg cursor-pointer border-none bg-transparent"
              />
              <input
                type="text"
                value={sector.nombre}
                onFocus={onIniciarEdicion}
                onBlur={onFinalizarEdicion}
                onChange={(e) => onActualizarSector(sector.id, "nombre", e.target.value)}
                className="flex-1 text-sm font-medium bg-transparent border-b border-transparent focus:border-indigo-400 outline-none"
              />
              {tipoMapa === "completo" && sectores.length > 1 && (
                <button onClick={() => onEliminarSector(sector.id)} className="text-slate-300 hover:text-red-500 p-1">
                  <Trash2 size={14} />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">Precio</span>
              <div className="flex items-center bg-white rounded border border-slate-200 px-2 py-1">
                <span className="text-slate-400">Bs.</span>
                <input
                  type="number"
                  value={sector.precio}
                  onFocus={onIniciarEdicion}
                  onBlur={onFinalizarEdicion}
                  onChange={(e) => onActualizarSector(sector.id, "precio", Number.parseInt(e.target.value))}
                  className="w-16 text-xs bg-transparent outline-none pl-1"
                />
              </div>
              <span className="text-slate-400 ml-auto">
                {mesas.filter((m) => m.sectorId === sector.id).length} mesas
              </span>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
