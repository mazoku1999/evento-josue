"use client"

import { ZoomIn, ZoomOut, Maximize } from "lucide-react"
import { Tooltip, TooltipProvider } from "@/components/ui/tooltip-custom"

interface CanvasControlsProps {
  zoom: number
  isMac: boolean
  onZoomIn: () => void
  onZoomOut: () => void
  onZoomToFit: () => void
}

export function CanvasControls({ zoom, isMac, onZoomIn, onZoomOut, onZoomToFit }: CanvasControlsProps) {
  return (
    <TooltipProvider>
      <div className="absolute bottom-6 right-6 flex flex-col gap-2 bg-white rounded-xl shadow-lg p-2 border border-slate-200">
        <Tooltip label="Acercar" isMac={isMac} position="left">
          <button onClick={onZoomIn} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors">
            <ZoomIn size={20} />
          </button>
        </Tooltip>
        <Tooltip label="Alejar" isMac={isMac} position="left">
          <button onClick={onZoomOut} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors">
            <ZoomOut size={20} />
          </button>
        </Tooltip>
        <div className="h-px bg-slate-200 my-1" />
        <Tooltip label="Ajustar vista" shortcut="Ctrl + 1" isMac={isMac} position="left">
          <button onClick={onZoomToFit} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors">
            <Maximize size={20} />
          </button>
        </Tooltip>
        <div className="text-xs text-center text-slate-500 font-medium">{Math.round(zoom * 100)}%</div>
      </div>
    </TooltipProvider>
  )
}
