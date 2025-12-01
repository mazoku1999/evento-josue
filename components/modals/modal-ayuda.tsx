"use client"

import { HelpCircle, X } from "lucide-react"
import { formatShortcut } from "@/components/ui/tooltip-custom"

interface ModalAyudaProps {
  isMac: boolean
  onClose: () => void
}

export function ModalAyuda({ isMac, onClose }: ModalAyudaProps) {
  const atajos = {
    navegacion: [
      { label: "Zoom to Fit", shortcut: "Ctrl + 1" },
      { label: "Zoom to Selection", shortcut: "Ctrl + 2" },
      { label: "Centrar vista", shortcut: "Ctrl + 0" },
      { label: "Paneo temporal", shortcut: "Espacio" },
    ],
    herramientas: [
      { label: "Modo Selección", shortcut: "V" },
      { label: "Modo Mano", shortcut: "H" },
    ],
    edicion: [
      { label: "Deshacer", shortcut: "Ctrl + Z" },
      { label: "Rehacer", shortcut: "Ctrl + Y" },
      { label: "Copiar", shortcut: "Ctrl + C" },
      { label: "Pegar", shortcut: "Ctrl + V" },
      { label: "Duplicar", shortcut: "Ctrl + D" },
      { label: "Seleccionar todo", shortcut: "Ctrl + A" },
      { label: "Eliminar", shortcut: "Delete" },
      { label: "Bloquear/Desbloquear", shortcut: "Ctrl + L" },
    ],
    movimiento: [
      { label: "Mover 1px", shortcut: "Flechas" },
      { label: "Mover 10px", shortcut: "Shift + Flechas" },
      { label: "Duplicar arrastrando", shortcut: "Alt + Arrastrar" },
    ],
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-slate-200 flex justify-between items-center">
          <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            <HelpCircle size={20} className="text-indigo-600" />
            Atajos de Teclado
            <span className="text-xs font-normal text-slate-400 ml-2">({isMac ? "macOS" : "Windows/Linux"})</span>
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>
        <div className="p-5 overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase mb-3">Navegación</h3>
              <div className="space-y-2">
                {atajos.navegacion.map((a) => (
                  <div key={a.label} className="flex justify-between text-sm">
                    <span className="text-slate-600">{a.label}</span>
                    <kbd className="px-2 py-0.5 bg-slate-100 rounded text-xs font-mono">
                      {formatShortcut(a.shortcut, isMac)}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase mb-3">Herramientas</h3>
              <div className="space-y-2">
                {atajos.herramientas.map((a) => (
                  <div key={a.label} className="flex justify-between text-sm">
                    <span className="text-slate-600">{a.label}</span>
                    <kbd className="px-2 py-0.5 bg-slate-100 rounded text-xs font-mono">
                      {formatShortcut(a.shortcut, isMac)}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase mb-3">Edición</h3>
              <div className="space-y-2">
                {atajos.edicion.map((a) => (
                  <div key={a.label} className="flex justify-between text-sm">
                    <span className="text-slate-600">{a.label}</span>
                    <kbd className="px-2 py-0.5 bg-slate-100 rounded text-xs font-mono">
                      {formatShortcut(a.shortcut, isMac)}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase mb-3">Movimiento</h3>
              <div className="space-y-2">
                {atajos.movimiento.map((a) => (
                  <div key={a.label} className="flex justify-between text-sm">
                    <span className="text-slate-600">{a.label}</span>
                    <kbd className="px-2 py-0.5 bg-slate-100 rounded text-xs font-mono">
                      {formatShortcut(a.shortcut, isMac)}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="p-4 border-t border-slate-100 bg-slate-50 text-center">
          <p className="text-xs text-slate-400">
            Presiona <kbd className="px-1.5 py-0.5 bg-white rounded border text-[10px]">?</kbd> para abrir/cerrar esta
            ayuda
          </p>
        </div>
      </div>
    </div>
  )
}
