"use client"

import type React from "react"

import type { Mesa, Sector } from "@/types/mesa"
import { obtenerPosicionesSillas } from "@/utils/mesa-utils"
import { TAMANO_SILLA } from "@/constants/canvas"
import { Lock } from "lucide-react"

interface MesaSvgProps {
  mesa: Mesa
  sectores: Sector[]
  isSelected: boolean
  onMouseDown: (e: React.MouseEvent, mesa: Mesa) => void
  onDoubleClick: (mesa: Mesa) => void
  onTouchStart?: (e: React.TouchEvent, mesa: Mesa) => void
}

export function MesaSvg({ mesa, sectores, isSelected, onMouseDown, onDoubleClick, onTouchStart }: MesaSvgProps) {
  const sectorMesa = sectores.find((s) => s.id === mesa.sectorId) || sectores[0]
  const stroke = isSelected ? "#6366f1" : sectorMesa.color

  // Mesa local para calcular posiciones de sillas relativas al centro
  const mesaLocal: Mesa = { ...mesa, x: 0, y: 0 }
  const pos = obtenerPosicionesSillas(mesaLocal)

  const radioCirculo = Math.max(mesa.ancho, mesa.alto) / 2

  return (
    <g
      transform={`translate(${mesa.x},${mesa.y}) scale(${mesa.escala || 1})`}
      onMouseDown={(e) => onMouseDown(e, mesa)}
      onDoubleClick={() => onDoubleClick(mesa)}
      onTouchStart={(e) => onTouchStart?.(e, mesa)}
      style={{ cursor: mesa.bloqueada ? "not-allowed" : "move" }}
    >
      {/* Sillas - Ahora cada silla tiene rotación individual */}
      {pos.map((p, i) => (
        <g key={i} transform={`translate(${p.x}, ${p.y}) rotate(${p.angulo})`}>
          <rect
            x={-TAMANO_SILLA / 2}
            y={-TAMANO_SILLA / 2}
            width={TAMANO_SILLA}
            height={TAMANO_SILLA}
            rx={4}
            fill="#e2e8f0"
            stroke="white"
            strokeWidth="2"
            filter="url(#chair-shadow)"
            opacity={mesa.bloqueada ? 0.5 : 1}
          />
        </g>
      ))}

      {/* Mesa */}
      {mesa.forma === "circulo" ? (
        <circle
          cx={0}
          cy={0}
          r={radioCirculo}
          fill="#FFFFFF"
          stroke={stroke}
          strokeWidth={isSelected ? 3 : 2}
          strokeDasharray={mesa.bloqueada ? "8,4" : "none"}
        />
      ) : (
        <rect
          x={-mesa.ancho / 2}
          y={-mesa.alto / 2}
          width={mesa.ancho}
          height={mesa.alto}
          rx={8}
          fill="#FFFFFF"
          stroke={stroke}
          strokeWidth={isSelected ? 3 : 2}
          strokeDasharray={mesa.bloqueada ? "8,4" : "none"}
        />
      )}

      {/* Etiqueta */}
      <text
        x={0}
        y={0}
        dy="5"
        textAnchor="middle"
        className="text-xs font-bold pointer-events-none select-none"
        style={{ fill: stroke }}
      >
        {mesa.etiqueta}
      </text>

      {/* Icono de bloqueo */}
      {mesa.bloqueada && (
        <g transform={`translate(${mesa.ancho / 2 - 10}, ${-mesa.alto / 2 + 10})`}>
          <circle cx={0} cy={0} r={10} fill="white" stroke={stroke} strokeWidth={1} />
          <Lock x={-6} y={-6} size={12} style={{ fill: "none", stroke: "#64748b" }} />
        </g>
      )}
    </g>
  )
}
