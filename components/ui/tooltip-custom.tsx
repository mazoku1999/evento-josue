"use client"

import type React from "react"
import { useState, useRef } from "react"
import ReactDOM from "react-dom"

type TooltipPosition = "top" | "right" | "left" | "bottom"

interface TooltipProps {
  children: React.ReactNode
  label: string
  shortcut?: string
  isMac: boolean
  position?: TooltipPosition
}

const formatShortcut = (s: string, isMac: boolean): string => {
  if (isMac) {
    return s
      .replace(/Ctrl/g, "⌘")
      .replace(/Alt/g, "⌥")
      .replace(/Shift/g, "⇧")
      .replace(/Delete/g, "⌫")
  }
  return s
}

export function TooltipProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

export function Tooltip({ children, label, shortcut, isMac, position = "top" }: TooltipProps) {
  const [show, setShow] = useState(false)
  const [coords, setCoords] = useState({ x: 0, y: 0 })
  const triggerRef = useRef<HTMLDivElement>(null)

  const handleMouseEnter = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      let x = 0
      let y = 0

      switch (position) {
        case "top":
          x = rect.left + rect.width / 2
          y = rect.top - 8
          break
        case "bottom":
          x = rect.left + rect.width / 2
          y = rect.bottom + 8
          break
        case "left":
          x = rect.left - 8
          y = rect.top + rect.height / 2
          break
        case "right":
          x = rect.right + 8
          y = rect.top + rect.height / 2
          break
      }
      setCoords({ x, y })
    }
    setShow(true)
  }

  const getTransformStyle = () => {
    switch (position) {
      case "top":
        return "translate(-50%, -100%)"
      case "bottom":
        return "translate(-50%, 0)"
      case "left":
        return "translate(-100%, -50%)"
      case "right":
        return "translate(0, -50%)"
    }
  }

  const getArrowStyle = () => {
    const base = "absolute w-0 h-0 border-[6px]"
    switch (position) {
      case "top":
        return `${base} left-1/2 -translate-x-1/2 top-full border-t-slate-800 border-l-transparent border-r-transparent border-b-transparent`
      case "bottom":
        return `${base} left-1/2 -translate-x-1/2 bottom-full border-b-slate-800 border-l-transparent border-r-transparent border-t-transparent`
      case "left":
        return `${base} top-1/2 -translate-y-1/2 left-full border-l-slate-800 border-t-transparent border-b-transparent border-r-transparent`
      case "right":
        return `${base} top-1/2 -translate-y-1/2 right-full border-r-slate-800 border-t-transparent border-b-transparent border-l-transparent`
    }
  }

  return (
    <div
      ref={triggerRef}
      className="relative inline-flex"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show &&
        typeof window !== "undefined" &&
        ReactDOM.createPortal(
          <div
            className="fixed px-2 py-1 bg-slate-800 text-white text-xs rounded whitespace-nowrap z-[99999] pointer-events-none"
            style={{
              left: coords.x,
              top: coords.y,
              transform: getTransformStyle(),
            }}
          >
            <div className="flex items-center gap-1.5">
              <span>{label}</span>
              {shortcut && (
                <kbd className="px-1 py-0.5 bg-slate-700 rounded text-[10px] font-mono">
                  {formatShortcut(shortcut, isMac)}
                </kbd>
              )}
            </div>
            <div className={getArrowStyle()} />
          </div>,
          document.body,
        )}
    </div>
  )
}

export { formatShortcut }
