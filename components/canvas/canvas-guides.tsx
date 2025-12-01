"use client"

import type { Guia } from "@/types/mesa"

interface CanvasGuidesProps {
  guias: Guia[]
  zoom: number
}

export function CanvasGuides({ guias, zoom }: CanvasGuidesProps) {
  return (
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
  )
}
