"use client"

import { ZoomIn, ZoomOut, Maximize } from "lucide-react"
import { TooltipProvider, Tooltip } from "@/components/ui/tooltip-custom"

interface ZoomControlsProps {
  zoom: number
  isMac: boolean
  onZoomIn: () => void
  onZoomOut: () => void
  onResetView: () => void
}

export function ZoomControls({ zoom, isMac, onZoomIn, onZoomOut, onResetView }: ZoomControlsProps) {
  return (
    <TooltipProvider>
      <div className="absolute bottom-6 right-6 flex items-center gap-2 bg-white rounded-xl shadow-lg p-2 border border-slate-200 z-10">
        <span className="text-xs font-medium text-slate-500 px-2 min-w-[50px] text-center">
          {Math.round(zoom * 100)}%
        </span>

        <div className="w-px h-5 bg-slate-200" />

        <Tooltip label="Acercar" isMac={isMac} position="left">
          <button
            onClick={onZoomIn}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600 hover:text-indigo-600"
          >
            <ZoomIn size={16} />
          </button>
        </Tooltip>

        <Tooltip label="Alejar" isMac={isMac} position="left">
          <button
            onClick={onZoomOut}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600 hover:text-indigo-600"
          >
            <ZoomOut size={16} />
          </button>
        </Tooltip>

        <div className="w-px h-5 bg-slate-200" />

        <Tooltip label="Restablecer vista" shortcut="Ctrl + 0" isMac={isMac} position="left">
          <button
            onClick={onResetView}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600 hover:text-indigo-600"
          >
            <Maximize size={16} />
          </button>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}
