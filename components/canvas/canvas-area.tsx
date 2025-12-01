"use client"

import type React from "react"

import type { Mesa, Sector, CajaSeleccion, Guia, EditandoNombre } from "@/types/mesa"
import { MesaSvg } from "@/components/canvas/mesa-svg"

interface CanvasAreaProps {
  referenciaSvg: React.RefObject<SVGSVGElement>
  contenedorRef: React.RefObject<HTMLDivElement>
  cursorStyle: string
  pan: { x: number; y: number }
  zoom: number
  imagenFondo: string | null
  dimensionesImagen: { w: number; h: number }
  guias: Guia[]
  mesas: Mesa[]
  sectores: Sector[]
  idsSeleccionados: string[]
  cajaSeleccion: CajaSeleccion
  editandoNombreMesa: EditandoNombre
  inputNombreRef: React.RefObject<HTMLInputElement>
  onMouseDown: (e: React.MouseEvent, tipo: string, mesa?: Mesa | null) => void
  onMouseMove: (e: React.MouseEvent) => void
  onMouseUp: () => void
  onDoubleClickMesa: (mesa: Mesa) => void
  onEditandoNombreChange: (e: EditandoNombre) => void
  onConfirmarNombre: () => void
  onTouchStart: (e: React.TouchEvent, tipo: string, mesa?: Mesa | null) => void
  onTouchMove: (e: React.TouchEvent) => void
  onTouchEnd: () => void
}

export function CanvasArea({
  referenciaSvg,
  contenedorRef,
  cursorStyle,
  pan,
  zoom,
  imagenFondo,
  dimensionesImagen,
  guias,
  mesas,
  sectores,
  idsSeleccionados,
  cajaSeleccion,
  editandoNombreMesa,
  inputNombreRef,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onDoubleClickMesa,
  onEditandoNombreChange,
  onConfirmarNombre,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
}: CanvasAreaProps) {
  return (
    <div
      ref={contenedorRef}
      className="flex-1 relative overflow-hidden"
      style={{ cursor: cursorStyle, touchAction: "none" }}
      onMouseDown={(e) => onMouseDown(e, "lienzo")}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onTouchStart={(e) => onTouchStart(e, "lienzo")}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <svg ref={referenciaSvg} width="100%" height="100%" className="w-full h-full block">
        <defs>
          <filter id="chair-shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="1" dy="1" stdDeviation="2" floodColor="#000000" floodOpacity="0.15" />
          </filter>
          {!imagenFondo && (
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#cbd5e1" strokeWidth="1" />
            </pattern>
          )}
        </defs>

        <g id="contenido-mapa" transform={`translate(${pan.x},${pan.y}) scale(${zoom})`}>
          {imagenFondo ? (
            <g id="capa-fondo">
              <rect
                x="0"
                y="0"
                width={dimensionesImagen.w}
                height={dimensionesImagen.h}
                fill="white"
                stroke="#ddd"
                strokeWidth="2"
              />
              <image
                href={imagenFondo}
                x="0"
                y="0"
                width={dimensionesImagen.w}
                height={dimensionesImagen.h}
                opacity={0.6}
              />
            </g>
          ) : (
            <g id="capa-grid">
              <rect x="-50000" y="-50000" width="100000" height="100000" fill="url(#grid)" />
              <line x1="-50000" y1="0" x2="50000" y2="0" stroke="#94a3b8" strokeWidth="2" />
              <line x1="0" y1="-50000" x2="0" y2="50000" stroke="#94a3b8" strokeWidth="2" />
            </g>
          )}

          <g id="capa-guias">
            {guias.map((guia, i) =>
              guia.type === "v" ? (
                <line
                  key={i}
                  x1={guia.pos}
                  y1={-50000}
                  x2={guia.pos}
                  y2={50000}
                  stroke="#ff00ff"
                  strokeWidth={1 / zoom}
                  strokeDasharray="4,4"
                />
              ) : (
                <line
                  key={i}
                  x1={-50000}
                  y1={guia.pos}
                  x2={50000}
                  y2={guia.pos}
                  stroke="#ff00ff"
                  strokeWidth={1 / zoom}
                  strokeDasharray="4,4"
                />
              ),
            )}
          </g>

          {mesas.map((m) => (
            <MesaSvg
              key={m.id}
              mesa={m}
              sectores={sectores}
              isSelected={idsSeleccionados.includes(m.id)}
              onMouseDown={(e, mesa) => onMouseDown(e, "mesa", mesa)}
              onDoubleClick={onDoubleClickMesa}
              onTouchStart={(e, mesa) => onTouchStart(e, "mesa", mesa)}
            />
          ))}

          {cajaSeleccion && (
            <rect
              id="capa-seleccion"
              x={Math.min(cajaSeleccion.startX, cajaSeleccion.currentX)}
              y={Math.min(cajaSeleccion.startY, cajaSeleccion.currentY)}
              width={Math.abs(cajaSeleccion.currentX - cajaSeleccion.startX)}
              height={Math.abs(cajaSeleccion.currentY - cajaSeleccion.startY)}
              fill="rgba(99, 102, 241, 0.1)"
              stroke="#6366f1"
              strokeWidth={1 / zoom}
              strokeDasharray="4,4"
            />
          )}
        </g>
      </svg>

      {/* INPUT EDICIÓN NOMBRE */}
      {editandoNombreMesa && (
        <div
          className="fixed z-50"
          style={{ left: editandoNombreMesa.x, top: editandoNombreMesa.y, transform: "translateX(-50%)" }}
        >
          <input
            ref={inputNombreRef}
            type="text"
            value={editandoNombreMesa.valor}
            onChange={(e) => onEditandoNombreChange({ ...editandoNombreMesa, valor: e.target.value })}
            onBlur={onConfirmarNombre}
            onKeyDown={(e) => {
              if (e.key === "Enter") onConfirmarNombre()
              if (e.key === "Escape") onEditandoNombreChange(null)
            }}
            className="px-2 py-1 text-sm font-semibold text-center bg-white border-2 border-indigo-500 rounded shadow-lg outline-none min-w-[80px]"
            style={{ fontSize: `${Math.max(12, 14 * zoom)}px` }}
          />
        </div>
      )}
    </div>
  )
}
