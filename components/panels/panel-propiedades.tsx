"use client"

import type { Mesa, Sector } from "@/types/mesa"
import { TooltipProvider, Tooltip } from "@/components/ui/tooltip-custom"
import { Copy, Trash2, Lock, Unlock, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, X } from "lucide-react"

const tieneMasDeUnaSillaPorLado = (mesa: Mesa): boolean => {
  if (mesa.forma === "circulo") {
    return mesa.sillas > 1
  }

  const lados = mesa.ladosActivos || ["top", "bottom", "left", "right"]
  const ladosActivos = [
    { id: "top", l: mesa.ancho },
    { id: "bottom", l: mesa.ancho },
    { id: "right", l: mesa.alto },
    { id: "left", l: mesa.alto },
  ].filter((k) => lados.includes(k.id))

  if (ladosActivos.length === 0) return false

  const pTotal = ladosActivos.reduce((a, b) => a + b.l, 0)
  let asg = 0
  const dist = ladosActivos.map((l) => {
    const c = Math.floor((l.l / pTotal) * mesa.sillas)
    const r = (l.l / pTotal) * mesa.sillas - c
    asg += c
    return { ...l, c, r }
  })

  dist.sort((a, b) => b.r - a.r)
  for (let i = 0; i < mesa.sillas - asg; i++) if (dist[i]) dist[i].c++

  // Retorna true si algún lado tiene más de 1 silla
  return dist.some((d) => d.c > 1)
}

interface PanelPropiedadesProps {
  panelActivo: boolean
  setPanelActivo: (v: boolean) => void
  mesaActiva: Mesa | null
  idsSeleccionados: string[]
  sectores: Sector[]
  tipoMapa: string
  hayMesasBloqueadas: boolean
  limitesSlider: { minW: number; minH: number }
  onToggleBloqueo: () => void
  onDuplicar: () => void
  onEliminar: () => void
  onEditarNombre: () => void
  onActualizarMesa: (key: string, value: any) => void
  onActualizarDiametro: (d: number) => void
  onToggleLado: (lado: string) => void
  onAgregarSector: () => void
  onActualizarSector: (id: string, key: string, value: any) => void
  onEliminarSector: (id: string) => void
  onGuardarHistorial: () => void
}

export function PanelPropiedades({
  panelActivo,
  setPanelActivo,
  mesaActiva,
  idsSeleccionados,
  sectores,
  tipoMapa,
  hayMesasBloqueadas,
  limitesSlider,
  onToggleBloqueo,
  onDuplicar,
  onEliminar,
  onEditarNombre,
  onActualizarMesa,
  onActualizarDiametro,
  onToggleLado,
  onAgregarSector,
  onActualizarSector,
  onEliminarSector,
  onGuardarHistorial,
}: PanelPropiedadesProps) {
  if (!panelActivo || !mesaActiva) {
    return null
  }

  const mostrarEspacioSillas = tieneMasDeUnaSillaPorLado(mesaActiva)

  return (
    <div className="w-72 bg-white border-l border-slate-200 flex flex-col h-full shadow-lg">
      {/* Header del panel */}
      <div className="p-4 border-b border-slate-100">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            {hayMesasBloqueadas && (
              <span className="w-5 h-5 rounded bg-amber-100 flex items-center justify-center">
                <Lock size={10} className="text-amber-600" />
              </span>
            )}
            <div>
              <h2 className="font-semibold text-slate-800 text-sm">
                {idsSeleccionados.length > 1 ? `${idsSeleccionados.length} mesas` : mesaActiva.etiqueta}
              </h2>
              <span className="text-xs text-slate-400">
                {idsSeleccionados.length > 1 ? "Edición múltiple" : `ID: ${mesaActiva.id}`}
              </span>
            </div>
          </div>
          <button
            onClick={() => setPanelActivo(false)}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Acciones rápidas */}
        <div className="flex gap-2">
          <TooltipProvider>
            <Tooltip label={hayMesasBloqueadas ? "Desbloquear" : "Bloquear"} shortcut="Ctrl+L" position="bottom">
              <button
                onClick={onToggleBloqueo}
                className={`p-2.5 rounded-lg transition-colors ${hayMesasBloqueadas
                    ? "bg-amber-500 text-white hover:bg-amber-600"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
              >
                {hayMesasBloqueadas ? <Unlock size={16} /> : <Lock size={16} />}
              </button>
            </Tooltip>

            <Tooltip label="Duplicar" shortcut="Ctrl+D" position="bottom">
              <button
                onClick={onDuplicar}
                disabled={hayMesasBloqueadas}
                className={`p-2.5 rounded-lg transition-colors ${hayMesasBloqueadas
                    ? "bg-slate-50 text-slate-300 cursor-not-allowed"
                    : "bg-slate-100 text-slate-600 hover:bg-indigo-100 hover:text-indigo-600"
                  }`}
              >
                <Copy size={16} />
              </button>
            </Tooltip>

            <Tooltip label="Eliminar" shortcut="Supr" position="bottom">
              <button
                onClick={onEliminar}
                disabled={hayMesasBloqueadas}
                className={`p-2.5 rounded-lg transition-colors ${hayMesasBloqueadas
                    ? "bg-slate-50 text-slate-300 cursor-not-allowed"
                    : "bg-slate-100 text-slate-600 hover:bg-red-100 hover:text-red-600"
                  }`}
              >
                <Trash2 size={16} />
              </button>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Contenido scrolleable */}
      <div className="p-4 space-y-4 flex-1 overflow-y-auto">
        {/* Nombre (solo si es 1 mesa) */}
        {idsSeleccionados.length === 1 && (
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-500">Nombre</label>
            <input
              type="text"
              value={mesaActiva.etiqueta}
              onChange={(e) => onActualizarMesa("etiqueta", e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
              disabled={mesaActiva.bloqueada}
            />
          </div>
        )}

        {/* Selector de Sector */}
        {tipoMapa === "completo" && (
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-500">Sector</label>
            <select
              value={mesaActiva.sectorId}
              onChange={(e) => onActualizarMesa("sectorId", e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
              disabled={hayMesasBloqueadas}
            >
              {sectores.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Forma */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-500">Forma</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                onGuardarHistorial()
                onActualizarMesa("forma", "circulo")
              }}
              className={`py-2 rounded-lg text-sm font-medium transition-colors ${mesaActiva.forma === "circulo"
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              disabled={hayMesasBloqueadas}
            >
              Redonda
            </button>
            <button
              onClick={() => {
                onGuardarHistorial()
                onActualizarMesa("forma", "cuadrado")
              }}
              className={`py-2 rounded-lg text-sm font-medium transition-colors ${mesaActiva.forma === "cuadrado"
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              disabled={hayMesasBloqueadas}
            >
              Cuadrada
            </button>
          </div>
        </div>

        {/* Escala */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-medium text-slate-500">Escala</label>
            <span className="text-xs font-medium text-indigo-600">{Math.round((mesaActiva.escala || 1) * 100)}%</span>
          </div>
          <input
            type="range"
            min="50"
            max="200"
            value={(mesaActiva.escala || 1) * 100}
            onChange={(e) => onActualizarMesa("escala", Number.parseInt(e.target.value) / 100)}
            className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer"
            disabled={hayMesasBloqueadas}
          />
        </div>

        {/* Lados con sillas (solo cuadrado) */}
        {mesaActiva.forma === "cuadrado" && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-500">Lados con sillas</label>
            <div className="bg-slate-50 p-4 rounded-xl flex flex-col items-center gap-2">
              <button
                onClick={() => onToggleLado("top")}
                className={`w-10 h-6 rounded-md transition-colors ${mesaActiva.ladosActivos?.includes("top")
                    ? "bg-indigo-500 text-white"
                    : "bg-white border border-slate-200 text-slate-400 hover:bg-slate-100"
                  }`}
              >
                <ChevronUp size={14} className="mx-auto" />
              </button>
              <div className="flex gap-2 items-center">
                <button
                  onClick={() => onToggleLado("left")}
                  className={`w-6 h-10 rounded-md transition-colors ${mesaActiva.ladosActivos?.includes("left")
                      ? "bg-indigo-500 text-white"
                      : "bg-white border border-slate-200 text-slate-400 hover:bg-slate-100"
                    }`}
                >
                  <ChevronLeft size={14} className="mx-auto" />
                </button>
                <div className="w-12 h-10 border-2 border-slate-300 rounded-lg bg-white" />
                <button
                  onClick={() => onToggleLado("right")}
                  className={`w-6 h-10 rounded-md transition-colors ${mesaActiva.ladosActivos?.includes("right")
                      ? "bg-indigo-500 text-white"
                      : "bg-white border border-slate-200 text-slate-400 hover:bg-slate-100"
                    }`}
                >
                  <ChevronRight size={14} className="mx-auto" />
                </button>
              </div>
              <button
                onClick={() => onToggleLado("bottom")}
                className={`w-10 h-6 rounded-md transition-colors ${mesaActiva.ladosActivos?.includes("bottom")
                    ? "bg-indigo-500 text-white"
                    : "bg-white border border-slate-200 text-slate-400 hover:bg-slate-100"
                  }`}
              >
                <ChevronDown size={14} className="mx-auto" />
              </button>
            </div>
          </div>
        )}

        {/* Sillas */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-medium text-slate-500">Sillas</label>
            <span className="text-xs font-medium text-slate-600">{mesaActiva.sillas}</span>
          </div>
          <input
            type="range"
            min="1"
            max="30"
            value={mesaActiva.sillas}
            onChange={(e) => onActualizarMesa("sillas", Number.parseInt(e.target.value))}
            className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer"
            disabled={hayMesasBloqueadas}
          />
        </div>

        {mostrarEspacioSillas && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-medium text-slate-500">Espacio entre sillas</label>
              <span className="text-xs font-medium text-slate-600">{mesaActiva.espacioEntreSillas ?? 50}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={mesaActiva.espacioEntreSillas ?? 50}
              onChange={(e) => onActualizarMesa("espacioEntreSillas", Number.parseInt(e.target.value))}
              className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer"
              disabled={hayMesasBloqueadas}
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Juntas</span>
              <span>Separadas</span>
            </div>
          </div>
        )}

        {/* Dimensiones */}
        {mesaActiva.forma === "circulo" ? (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-medium text-slate-500">Diámetro</label>
              <span className="text-xs text-slate-400">{mesaActiva.ancho}px</span>
            </div>
            <input
              type="range"
              min={limitesSlider.minW}
              max="400"
              value={mesaActiva.ancho}
              onChange={(e) => onActualizarDiametro(Number.parseInt(e.target.value))}
              className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer"
              disabled={hayMesasBloqueadas}
            />
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-medium text-slate-500">Ancho</label>
                <span className="text-xs text-slate-400">{mesaActiva.ancho}px</span>
              </div>
              <input
                type="range"
                min={limitesSlider.minW}
                max="400"
                value={mesaActiva.ancho}
                onChange={(e) => onActualizarMesa("ancho", Number.parseInt(e.target.value))}
                className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer"
                disabled={hayMesasBloqueadas}
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-medium text-slate-500">Alto</label>
                <span className="text-xs text-slate-400">{mesaActiva.alto}px</span>
              </div>
              <input
                type="range"
                min={limitesSlider.minH}
                max="400"
                value={mesaActiva.alto}
                onChange={(e) => onActualizarMesa("alto", Number.parseInt(e.target.value))}
                className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer"
                disabled={hayMesasBloqueadas}
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
