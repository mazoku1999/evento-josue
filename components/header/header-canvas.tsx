"use client"

import { ZoomIn, ZoomOut, Download, ChevronDown, Undo2, Redo2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface HeaderCanvasProps {
  zoom: number
  canUndo: boolean
  canRedo: boolean
  isMac: boolean
  onZoomIn: () => void
  onZoomOut: () => void
  onResetZoom: () => void
  onUndo: () => void
  onRedo: () => void
  onExportPNG: () => void
  onExportJSON: () => void
  onImportJSON: () => void
}

export function HeaderCanvas({
  zoom,
  canUndo,
  canRedo,
  isMac,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onUndo,
  onRedo,
  onExportPNG,
  onExportJSON,
  onImportJSON,
}: HeaderCanvasProps) {
  const modKey = isMac ? "⌘" : "Ctrl"

  return (
    <div className="h-12 bg-[#1a1a1a] border-b border-[#333] flex items-center justify-between px-4">
      <div className="flex items-center gap-2">
        <h1 className="text-white font-semibold text-lg">Editor de Mesas</h1>
      </div>

      <div className="flex items-center gap-1">
        {/* Undo/Redo */}
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="p-2 text-gray-400 hover:text-white hover:bg-[#333] rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title={`Deshacer (${modKey}+Z)`}
        >
          <Undo2 size={18} />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className="p-2 text-gray-400 hover:text-white hover:bg-[#333] rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title={`Rehacer (${modKey}+Shift+Z)`}
        >
          <Redo2 size={18} />
        </button>

        <div className="w-px h-6 bg-[#444] mx-2" />

        {/* Zoom controls */}
        <button
          onClick={onZoomOut}
          className="p-2 text-gray-400 hover:text-white hover:bg-[#333] rounded transition-colors"
          title="Alejar"
        >
          <ZoomOut size={18} />
        </button>
        <button
          onClick={onResetZoom}
          className="px-3 py-1 text-gray-300 hover:text-white hover:bg-[#333] rounded text-sm min-w-[60px] transition-colors"
          title="Restablecer zoom"
        >
          {Math.round(zoom * 100)}%
        </button>
        <button
          onClick={onZoomIn}
          className="p-2 text-gray-400 hover:text-white hover:bg-[#333] rounded transition-colors"
          title="Acercar"
        >
          <ZoomIn size={18} />
        </button>

        <div className="w-px h-6 bg-[#444] mx-2" />

        {/* Export dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-1 px-3 py-2 text-gray-300 hover:text-white hover:bg-[#333] rounded transition-colors">
              <Download size={18} />
              <span className="text-sm">Exportar</span>
              <ChevronDown size={14} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-[#2a2a2a] border-[#444]">
            <DropdownMenuItem
              onClick={onExportPNG}
              className="text-gray-300 hover:text-white focus:text-white focus:bg-[#333]"
            >
              Exportar como PNG
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onExportJSON}
              className="text-gray-300 hover:text-white focus:text-white focus:bg-[#333]"
            >
              Exportar como JSON
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[#444]" />
            <DropdownMenuItem
              onClick={onImportJSON}
              className="text-gray-300 hover:text-white focus:text-white focus:bg-[#333]"
            >
              Importar JSON
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
