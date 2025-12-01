"use client"

import {
  MousePointer2,
  Hand,
  Download,
  ImageIcon,
  XCircle,
  Layers,
  Edit3,
  FileJson,
  FileImage,
  HelpCircle,
} from "lucide-react"
import { TooltipProvider, Tooltip } from "@/components/ui/tooltip-custom"

const MesaRedondaIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Mesa circular */}
    <circle cx="12" cy="12" r="5" />
    {/* Sillas alrededor */}
    <circle cx="12" cy="4" r="1.5" />
    <circle cx="18.5" cy="8" r="1.5" />
    <circle cx="18.5" cy="16" r="1.5" />
    <circle cx="12" cy="20" r="1.5" />
    <circle cx="5.5" cy="16" r="1.5" />
    <circle cx="5.5" cy="8" r="1.5" />
  </svg>
)

const MesaRectangularIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Mesa rectangular */}
    <rect x="6" y="8" width="12" height="8" rx="1" />
    {/* Sillas arriba */}
    <rect x="7" y="3" width="3" height="3" rx="0.5" />
    <rect x="14" y="3" width="3" height="3" rx="0.5" />
    {/* Sillas abajo */}
    <rect x="7" y="18" width="3" height="3" rx="0.5" />
    <rect x="14" y="18" width="3" height="3" rx="0.5" />
  </svg>
)

interface SidebarIzquierdaProps {
  isMac: boolean
  herramienta: string
  setHerramienta: (h: string) => void
  agregarMesa: (forma: "circulo" | "cuadrado") => void
  tipoMapa: string
  panelActivo: string
  setPanelActivo: (p: string) => void
  imagenFondo: string | null
  onSubirImagen: () => void
  onQuitarImagen: () => void
  menuDescargaAbierto: boolean
  setMenuDescargaAbierto: (open: boolean) => void
  onExportarSVG: () => void
  onDescargarJSON: () => void
  onMostrarAyuda: () => void
}

export function SidebarIzquierda({
  isMac,
  herramienta,
  setHerramienta,
  agregarMesa,
  tipoMapa,
  panelActivo,
  setPanelActivo,
  imagenFondo,
  onSubirImagen,
  onQuitarImagen,
  menuDescargaAbierto,
  setMenuDescargaAbierto,
  onExportarSVG,
  onDescargarJSON,
  onMostrarAyuda,
}: SidebarIzquierdaProps) {
  return (
    <TooltipProvider>
      <div className="fixed left-0 top-0 h-full w-16 bg-white/90 backdrop-blur-lg shadow-xl flex flex-col items-center py-4 z-30">
        {/* HERRAMIENTAS SELECCION / MANO */}
        <div className="w-full px-2 pb-3 flex flex-col items-center gap-1">
          <Tooltip label="Seleccionar y Mover" shortcut="V" isMac={isMac} position="right">
            <button
              onClick={() => setHerramienta("seleccion")}
              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                herramienta === "seleccion"
                  ? "bg-indigo-100 text-indigo-600 ring-2 ring-indigo-200"
                  : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
              }`}
            >
              <MousePointer2 size={18} />
            </button>
          </Tooltip>
          <Tooltip label="Modo Mano" shortcut="H" isMac={isMac} position="right">
            <button
              onClick={() => setHerramienta("mano")}
              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                herramienta === "mano"
                  ? "bg-indigo-100 text-indigo-600 ring-2 ring-indigo-200"
                  : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Hand size={18} />
            </button>
          </Tooltip>
        </div>

        {/* SEPARADOR */}
        <div className="w-10 h-px bg-slate-200 mb-3" />

        {/* AGREGAR MESAS */}
        <div className="w-full px-2 pb-3 flex flex-col items-center gap-1">
          <Tooltip label="Agregar Mesa Redonda" isMac={isMac} position="right">
            <button
              onClick={() => agregarMesa("circulo")}
              className="w-10 h-10 rounded-lg flex items-center justify-center transition-all text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
            >
              <MesaRedondaIcon />
            </button>
          </Tooltip>
          <Tooltip label="Agregar Mesa Rectangular" isMac={isMac} position="right">
            <button
              onClick={() => agregarMesa("cuadrado")}
              className="w-10 h-10 rounded-lg flex items-center justify-center transition-all text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
            >
              <MesaRectangularIcon />
            </button>
          </Tooltip>
        </div>

        {/* SEPARADOR */}
        <div className="w-10 h-px bg-slate-200 mb-3" />

        {/* SECTORES */}
        <div className="w-full px-2 pb-3 flex flex-col items-center gap-1">
          <Tooltip label="Gestionar Sectores" isMac={isMac} position="right">
            <button
              onClick={() => setPanelActivo("sectores")}
              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                panelActivo === "sectores"
                  ? "bg-indigo-100 text-indigo-600 ring-2 ring-indigo-200"
                  : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
              }`}
            >
              {tipoMapa === "completo" ? <Layers size={18} /> : <Edit3 size={18} />}
            </button>
          </Tooltip>
        </div>

        {/* SEPARADOR */}
        <div className="w-10 h-px bg-slate-200 mb-3" />

        {/* IMAGEN DE FONDO */}
        <div className="w-full px-2 flex flex-col items-center">
          {!imagenFondo ? (
            <Tooltip label="Añadir Imagen de Fondo" isMac={isMac} position="right">
              <button
                onClick={onSubirImagen}
                className="w-10 h-10 rounded-lg flex items-center justify-center transition-all text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
              >
                <ImageIcon size={18} />
              </button>
            </Tooltip>
          ) : (
            <Tooltip label="Quitar Imagen de Fondo" isMac={isMac} position="right">
              <button
                onClick={onQuitarImagen}
                className="w-10 h-10 rounded-lg flex items-center justify-center transition-all text-red-400 hover:text-red-600 hover:bg-red-50"
              >
                <XCircle size={18} />
              </button>
            </Tooltip>
          )}
        </div>

        {/* SPACER */}
        <div className="flex-1" />

        {/* MENÚ DE DESCARGA Y AYUDA */}
        <div className="flex flex-col gap-1 relative w-full px-2 pb-2">
          {menuDescargaAbierto && (
            <div className="absolute bottom-full left-2 mb-2 w-48 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-in slide-in-from-bottom-2 fade-in duration-200 z-50">
              <button
                onClick={onExportarSVG}
                className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-center gap-3 text-xs font-medium text-slate-600 transition-colors border-b border-slate-100"
              >
                <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded">
                  <FileImage size={16} />
                </div>
                <div>
                  <span className="block font-bold text-slate-800">Imagen SVG</span>
                  <span className="block text-[10px] text-slate-400">Para web e impresión</span>
                </div>
              </button>
              <button
                onClick={onDescargarJSON}
                className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-center gap-3 text-xs font-medium text-slate-600 transition-colors"
              >
                <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded">
                  <FileJson size={16} />
                </div>
                <div>
                  <span className="block font-bold text-slate-800">Datos JSON</span>
                  <span className="block text-[10px] text-slate-400">Guardar proyecto editable</span>
                </div>
              </button>
            </div>
          )}

          <Tooltip label="Exportar Plano" isMac={isMac} position="right">
            <button
              onClick={() => setMenuDescargaAbierto(!menuDescargaAbierto)}
              className={`w-10 h-10 mx-auto rounded-lg flex items-center justify-center transition-all ${
                menuDescargaAbierto
                  ? "bg-indigo-100 text-indigo-600 ring-2 ring-indigo-200"
                  : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Download size={18} />
            </button>
          </Tooltip>

          <Tooltip label="Mostrar Atajos" shortcut="?" isMac={isMac} position="right">
            <button
              onClick={onMostrarAyuda}
              className="w-10 h-10 mx-auto rounded-lg flex items-center justify-center transition-all text-slate-400 hover:text-slate-600 hover:bg-slate-50"
            >
              <HelpCircle size={18} />
            </button>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  )
}
