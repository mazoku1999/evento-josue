import type { SelectionBox } from "@/types/mesa"

interface SelectionBoxComponentProps {
  selectionBox: SelectionBox | null
  zoom: number
}

export function SelectionBoxComponent({ selectionBox, zoom }: SelectionBoxComponentProps) {
  if (!selectionBox) return null

  return (
    <div
      className="absolute border-2 border-blue-500 bg-blue-500/10 pointer-events-none z-50"
      style={{
        left: selectionBox.x * zoom,
        top: selectionBox.y * zoom,
        width: selectionBox.width * zoom,
        height: selectionBox.height * zoom,
      }}
    />
  )
}
