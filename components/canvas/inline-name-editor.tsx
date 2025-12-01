"use client"

import { useRef, useEffect } from "react"
import type { EditandoNombre } from "@/types/mesa"

interface InlineNameEditorProps {
  editandoNombre: EditandoNombre
  onChangeValor: (valor: string) => void
  onConfirmar: () => void
  onCancelar: () => void
}

export function InlineNameEditor({ editandoNombre, onChangeValor, onConfirmar, onCancelar }: InlineNameEditorProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [])

  if (!editandoNombre) return null

  return (
    <div
      className="fixed z-50"
      style={{
        left: editandoNombre.x,
        top: editandoNombre.y,
        transform: "translate(-50%, -100%)",
      }}
    >
      <input
        ref={inputRef}
        type="text"
        value={editandoNombre.valor}
        onChange={(e) => onChangeValor(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onConfirmar()
          if (e.key === "Escape") onCancelar()
        }}
        onBlur={onConfirmar}
        className="px-3 py-2 text-sm font-medium bg-white border-2 border-indigo-500 rounded-lg shadow-xl outline-none min-w-[120px] text-center"
      />
    </div>
  )
}
