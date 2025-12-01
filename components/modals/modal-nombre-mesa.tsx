"use client"

import type React from "react"

import { useState, useEffect } from "react"
import type { Mesa } from "@/types/mesa"

interface ModalNombreMesaProps {
  mesa: Mesa | null
  onClose: () => void
  onSave: (id: string, nombre: string) => void
}

export function ModalNombreMesa({ mesa, onClose, onSave }: ModalNombreMesaProps) {
  const [nombre, setNombre] = useState("")

  useEffect(() => {
    if (mesa) {
      setNombre(mesa.nombre)
    }
  }, [mesa])

  if (!mesa) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(mesa.id, nombre)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200]">
      <div className="bg-[#2a2a2a] rounded-lg p-6 w-80 border border-[#444]">
        <h3 className="text-lg font-semibold text-white mb-4">Editar nombre de mesa</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full bg-[#1a1a1a] border border-[#555] rounded px-3 py-2 text-white mb-4 focus:outline-none focus:border-orange-500"
            autoFocus
          />
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded transition-colors"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
