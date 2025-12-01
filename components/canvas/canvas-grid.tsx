"use client"

interface CanvasGridProps {
  imagenFondo: string | null
  dimensionesImagen: { w: number; h: number }
}

export function CanvasGrid({ imagenFondo, dimensionesImagen }: CanvasGridProps) {
  if (imagenFondo) {
    return (
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
        <image href={imagenFondo} x="0" y="0" width={dimensionesImagen.w} height={dimensionesImagen.h} opacity={0.6} />
      </g>
    )
  }

  return (
    <g id="capa-grid">
      <rect x="-50000" y="-50000" width="100000" height="100000" fill="url(#grid)" />
      <line x1="-50000" y1="0" x2="50000" y2="0" stroke="#94a3b8" strokeWidth="2" />
      <line x1="0" y1="-50000" x2="0" y2="50000" stroke="#94a3b8" strokeWidth="2" />
    </g>
  )
}
