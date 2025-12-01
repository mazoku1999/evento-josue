"use client"

interface ModalConfirmacionProps {
  mensaje: string
  onConfirm: () => void
  onCancel: () => void
}

export function ModalConfirmacion({ mensaje, onConfirm, onCancel }: ModalConfirmacionProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200]">
      <div className="bg-[#2a2a2a] rounded-lg p-6 w-96 border border-[#444]">
        <p className="text-white mb-6">{mensaje}</p>
        <div className="flex gap-2 justify-end">
          <button onClick={onCancel} className="px-4 py-2 text-gray-400 hover:text-white transition-colors">
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  )
}
