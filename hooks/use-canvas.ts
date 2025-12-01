"use client"

import type React from "react"

import { useState, useRef, useCallback, useMemo, useEffect } from "react"
import type { Mesa, Sector, CajaSeleccion, Guia, EditandoNombre } from "@/types/mesa"
import { UMBRAL_SNAP } from "@/constants/canvas"
import {
  obtenerSiguienteId,
  obtenerSiguienteNombre,
  esTamanoValido,
  calcularLimites,
  calcularBoundingBox,
} from "@/utils/mesa-utils"
import { exportarSVG, descargarJSON } from "@/utils/export-utils"
import { useHistorial } from "@/hooks/use-historial"

interface UseCanvasReturn {
  // Estado de configuración
  modoConfigurado: boolean
  pasoModal: string
  setPasoModal: (paso: string) => void
  tipoMapa: string
  configSectorUnico: { nombre: string; color: string; precio: number }
  setConfigSectorUnico: (config: { nombre: string; color: string; precio: number }) => void
  confirmarSectorUnico: () => void
  iniciarMapaCompleto: () => void

  // Datos principales
  mesas: Mesa[]
  setMesas: React.Dispatch<React.SetStateAction<Mesa[]>>
  sectores: Sector[]
  idsSeleccionados: string[]
  setIdsSeleccionados: React.Dispatch<React.SetStateAction<string[]>>

  // Navegación
  zoom: number
  setZoom: React.Dispatch<React.SetStateAction<number>>
  pan: { x: number; y: number }
  herramienta: string
  setHerramienta: (h: string) => void
  herramientaActiva: string
  isPanning: boolean
  cursorStyle: string

  // UI state
  panelActivo: string
  setPanelActivo: (p: string) => void
  imagenFondo: string | null
  dimensionesImagen: { w: number; h: number }
  menuDescargaAbierto: boolean
  setMenuDescargaAbierto: (b: boolean) => void
  mostrarAyudaAtajos: boolean
  setMostrarAyudaAtajos: (b: boolean) => void
  editandoNombreMesa: EditandoNombre
  setEditandoNombreMesa: (e: EditandoNombre) => void
  guias: Guia[]
  cajaSeleccion: CajaSeleccion

  // Historial
  puedeDeshacer: boolean
  puedeRehacer: boolean
  deshacer: () => void
  rehacer: () => void
  guardarHistorial: () => void

  // Acciones de mesas
  agregarMesa: (forma: "circulo" | "cuadrado") => void
  duplicarMesasSeleccionadas: () => void
  eliminarSeleccionadas: () => void
  toggleBloqueo: () => void
  actualizarMesa: (k: string, v: any) => void
  actualizarDiametro: (d: number) => void
  toggleLado: (lado: string) => void
  confirmarNombreMesa: () => void

  // Acciones de sectores
  agregarSector: () => void
  actualizarSector: (id: string, k: string, v: any) => void
  eliminarSector: (id: string) => void

  // Acciones de navegación
  centrarlVista: () => void
  zoomToFit: () => void
  zoomToSelection: () => void

  // Handlers de mouse
  alPresionarMouse: (e: React.MouseEvent, tipo: string, mesa?: Mesa | null) => void
  alMoverMouse: (e: React.MouseEvent) => void
  alSoltarMouse: () => void
  manejarDobleClickMesa: (mesa: Mesa) => void

  // Handlers de touch (mobile)
  alPresionarTouch: (e: React.TouchEvent, tipo: string, mesa?: Mesa | null) => void
  alMoverTouch: (e: React.TouchEvent) => void
  alSoltarTouch: () => void

  // IO
  manejarSubidaImagen: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleExportarSVG: () => void
  handleDescargarJSON: () => void

  // Refs
  referenciaSvg: React.RefObject<SVGSVGElement>
  contenedorRef: React.RefObject<HTMLDivElement>
  inputNombreRef: React.RefObject<HTMLInputElement>
  inputArchivoRef: React.RefObject<HTMLInputElement>

  // Computed
  mesaActiva: Mesa | null
  hayMesasBloqueadas: boolean
  limitesSlider: { minW: number; minH: number }
}

export function useCanvas(): UseCanvasReturn {
  // --- CONFIGURACIÓN INICIAL ---
  const [modoConfigurado, setModoConfigurado] = useState(false)
  const [pasoModal, setPasoModal] = useState("seleccion")
  const [tipoMapa, setTipoMapa] = useState("completo")
  const [configSectorUnico, setConfigSectorUnico] = useState({ nombre: "General", color: "#40A578", precio: 100 })

  // --- ESTADO DE DATOS ---
  const [sectores, setSectores] = useState<Sector[]>([
    { id: "S1", nombre: "General", color: "#94a3b8", precio: 50 },
    { id: "S2", nombre: "VIP", color: "#8B6FFA", precio: 150 },
  ])
  const [mesas, setMesas] = useState<Mesa[]>([])
  const [idsSeleccionados, setIdsSeleccionados] = useState<string[]>([])

  // --- HISTORIAL ---
  const {
    guardarHistorial,
    tomarSnapshot,
    confirmarSnapshotSiHuboCambios,
    deshacer,
    rehacer,
    puedeDeshacer,
    puedeRehacer,
  } = useHistorial(mesas, sectores, idsSeleccionados, setMesas, setSectores, setIdsSeleccionados)

  // --- ESTADO DE INTERACCIÓN ---
  const [herramienta, setHerramienta] = useState("seleccion")
  const [herramientaTemporal, setHerramientaTemporal] = useState<string | null>(null)
  const [arrastrandoMesa, setArrastrandoMesa] = useState(false)
  const [cajaSeleccion, setCajaSeleccion] = useState<CajaSeleccion>(null)
  const [offsetsMesas, setOffsetsMesas] = useState<{ [key: string]: { x: number; y: number } }>({})
  const [idMesaArrastradaPrincipal, setIdMesaArrastradaPrincipal] = useState<string | null>(null)
  const [guias, setGuias] = useState<Guia[]>([])
  const [mostrarAyudaAtajos, setMostrarAyudaAtajos] = useState(false)
  const [editandoNombreMesa, setEditandoNombreMesa] = useState<EditandoNombre>(null)
  const [mesasPortapapeles, setMesasPortapapeles] = useState<Mesa[]>([])
  const [menuDescargaAbierto, setMenuDescargaAbierto] = useState(false)

  // --- NAVEGACIÓN ---
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const panStart = useRef({ x: 0, y: 0 })
  const lastTouchDistance = useRef<number | null>(null)
  const lastTouchCenter = useRef<{ x: number; y: number } | null>(null)
  const touchTimeout = useRef<NodeJS.Timeout | null>(null)
  const [panelActivo, setPanelActivo] = useState("propiedades")
  const [imagenFondo, setImagenFondo] = useState<string | null>(null)
  const [dimensionesImagen, setDimensionesImagen] = useState({ w: 800, h: 600 })
  const [vistaCentradaInicial, setVistaCentradaInicial] = useState(false)

  // --- REFS ---
  const referenciaSvg = useRef<SVGSVGElement>(null)
  const contenedorRef = useRef<HTMLDivElement>(null)
  const inputNombreRef = useRef<HTMLInputElement>(null)
  const inputArchivoRef = useRef<HTMLInputElement>(null)

  const herramientaActiva = herramientaTemporal || herramienta

  // --- FUNCIONES AUXILIARES ---
  const getMousePos = useCallback(
    (clientX: number, clientY: number) => {
      if (!referenciaSvg.current) return { x: 0, y: 0 }
      const rect = referenciaSvg.current.getBoundingClientRect()
      return { x: (clientX - rect.left - pan.x) / zoom, y: (clientY - rect.top - pan.y) / zoom }
    },
    [pan, zoom],
  )

  const centrarlVista = useCallback(() => {
    setPan({ x: 0, y: 0 })
    setZoom(1)
  }, [])

  const zoomToFit = useCallback(() => {
    if (!referenciaSvg.current || mesas.length === 0) {
      centrarlVista()
      return
    }
    const bbox = calcularBoundingBox(mesas)
    if (!bbox) return

    const rect = referenciaSvg.current.getBoundingClientRect()
    const padding = 50
    const scaleX = (rect.width - padding * 2) / bbox.width
    const scaleY = (rect.height - padding * 2) / bbox.height
    const newZoom = Math.min(Math.max(Math.min(scaleX, scaleY), 0.1), 2)

    const centerX = (bbox.minX + bbox.maxX) / 2
    const centerY = (bbox.minY + bbox.maxY) / 2

    setZoom(newZoom)
    setPan({ x: rect.width / 2 - centerX * newZoom, y: rect.height / 2 - centerY * newZoom })
  }, [mesas, centrarlVista])

  const zoomToSelection = useCallback(() => {
    if (!referenciaSvg.current || idsSeleccionados.length === 0) return

    const mesasSeleccionadas = mesas.filter((m) => idsSeleccionados.includes(m.id))
    const bbox = calcularBoundingBox(mesasSeleccionadas)
    if (!bbox) return

    const rect = referenciaSvg.current.getBoundingClientRect()
    const padding = 100
    const scaleX = (rect.width - padding * 2) / bbox.width
    const scaleY = (rect.height - padding * 2) / bbox.height
    const newZoom = Math.min(Math.max(Math.min(scaleX, scaleY), 1.5), 3)

    const centerX = (bbox.minX + bbox.maxX) / 2
    const centerY = (bbox.minY + bbox.maxY) / 2

    setZoom(newZoom)
    setPan({ x: rect.width / 2 - centerX * newZoom, y: rect.height / 2 - centerY * newZoom })
  }, [mesas, idsSeleccionados])

  // --- GESTIÓN DE SECTORES ---
  const agregarSector = useCallback(() => {
    guardarHistorial()
    const nuevoId = `S${Date.now()}`
    const colores = ["#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#ec4899", "#8b5cf6"]
    const color = colores[sectores.length % colores.length]
    setSectores([...sectores, { id: nuevoId, nombre: `Nuevo Sector ${sectores.length + 1}`, color, precio: 0 }])
  }, [guardarHistorial, sectores])

  const actualizarSector = useCallback((id: string, k: string, v: any) => {
    setSectores((prev) => prev.map((s) => (s.id === id ? { ...s, [k]: v } : s)))
  }, [])

  const eliminarSector = useCallback(
    (id: string) => {
      if (sectores.length <= 1) return
      guardarHistorial()
      const fallback = sectores.find((s) => s.id !== id)!.id
      setMesas((prev) => prev.map((m) => (m.sectorId === id ? { ...m, sectorId: fallback } : m)))
      setSectores(sectores.filter((s) => s.id !== id))
    },
    [guardarHistorial, sectores],
  )

  // --- GESTIÓN DE MESAS ---
  const agregarMesa = useCallback(
    (forma: "circulo" | "cuadrado") => {
      guardarHistorial()
      const nuevoId = obtenerSiguienteId(mesas)
      const sz = forma === "circulo" ? 110 : 100

      if (referenciaSvg.current) {
        const rect = referenciaSvg.current.getBoundingClientRect()
        const worldPos = getMousePos(rect.left + rect.width / 2, rect.top + rect.height / 2)
        const nuevoNombre = obtenerSiguienteNombre("Mesa 0", mesas)

        setMesas([
          ...mesas,
          {
            id: nuevoId,
            x: worldPos.x,
            y: worldPos.y,
            etiqueta: nuevoNombre,
            forma,
            sillas: forma === "cuadrado" ? 8 : 4,
            ancho: forma === "cuadrado" ? 120 : sz,
            alto: forma === "cuadrado" ? 200 : sz,
            escala: 1,
            sectorId: sectores[0].id,
            ladosActivos: ["top", "bottom", "left", "right"],
            bloqueada: false,
            espacioEntreSillas: 50, // valor por defecto para espacio entre sillas
          },
        ])
        setIdsSeleccionados([nuevoId])
        setPanelActivo("propiedades")
        setHerramienta("seleccion")
      }
    },
    [guardarHistorial, mesas, sectores, getMousePos],
  )

  const insertarNuevasMesas = useCallback(
    (origenMesas: Mesa[], offsetX: number, offsetY: number) => {
      const nuevasMesas: Mesa[] = []
      const mesasTemp = [...mesas]

      origenMesas.forEach((base) => {
        const nuevoId = obtenerSiguienteId(mesasTemp)
        const nuevoNombre = obtenerSiguienteNombre(base.etiqueta, mesasTemp)
        const nuevaMesa: Mesa = {
          ...base,
          id: nuevoId,
          x: base.x + offsetX,
          y: base.y + offsetY,
          etiqueta: nuevoNombre,
          bloqueada: false,
        }
        nuevasMesas.push(nuevaMesa)
        mesasTemp.push(nuevaMesa)
      })

      setMesas((prev) => [...prev, ...nuevasMesas])
      setIdsSeleccionados(nuevasMesas.map((m) => m.id))
    },
    [mesas],
  )

  const duplicarMesasSeleccionadas = useCallback(() => {
    if (idsSeleccionados.length > 0) {
      guardarHistorial()
      const seleccionadas = mesas.filter((m) => idsSeleccionados.includes(m.id))
      insertarNuevasMesas(seleccionadas, 40, 40)
    }
  }, [idsSeleccionados, mesas, guardarHistorial, insertarNuevasMesas])

  const eliminarSeleccionadas = useCallback(() => {
    setMesas(mesas.filter((m) => !idsSeleccionados.includes(m.id)))
    setIdsSeleccionados([])
  }, [mesas, idsSeleccionados])

  const toggleBloqueo = useCallback(() => {
    if (idsSeleccionados.length === 0) return
    guardarHistorial()
    const mesasSeleccionadas = mesas.filter((m) => idsSeleccionados.includes(m.id))
    const todasBloqueadas = mesasSeleccionadas.every((m) => m.bloqueada)
    setMesas((prev) => prev.map((m) => (idsSeleccionados.includes(m.id) ? { ...m, bloqueada: !todasBloqueadas } : m)))
  }, [idsSeleccionados, mesas, guardarHistorial])

  const actualizarMesa = useCallback(
    (k: string, v: any) => {
      setMesas((prevMesas) =>
        prevMesas.map((m) => {
          if (idsSeleccionados.includes(m.id)) {
            if (k === "forma" && v === "circulo") {
              const maxDimension = Math.max(m.ancho, m.alto)
              return { ...m, forma: v, ancho: maxDimension, alto: maxDimension }
            }
            if (k === "ancho" || k === "alto" || k === "sillas") {
              const nAncho = k === "ancho" ? v : m.ancho
              const nAlto = k === "alto" ? v : m.alto
              const nSillas = k === "sillas" ? v : m.sillas
              if (!esTamanoValido(m, nAncho, nAlto, nSillas)) return m
            }
            return { ...m, [k]: v }
          }
          return m
        }),
      )
    },
    [idsSeleccionados],
  )

  const actualizarDiametro = useCallback(
    (d: number) => {
      setMesas((prevMesas) =>
        prevMesas.map((m) => {
          if (idsSeleccionados.includes(m.id)) {
            if (!esTamanoValido(m, d, d)) return m
            return { ...m, ancho: d, alto: d }
          }
          return m
        }),
      )
    },
    [idsSeleccionados],
  )

  const toggleLado = useCallback(
    (lado: string) => {
      guardarHistorial()
      setMesas((prevMesas) =>
        prevMesas.map((m) => {
          if (idsSeleccionados.includes(m.id)) {
            const act = m.ladosActivos || ["top", "bottom", "left", "right"]
            return { ...m, ladosActivos: act.includes(lado) ? act.filter((l) => l !== lado) : [...act, lado] }
          }
          return m
        }),
      )
    },
    [idsSeleccionados, guardarHistorial],
  )

  const confirmarNombreMesa = useCallback(() => {
    if (!editandoNombreMesa) return
    setMesas((prev) =>
      prev.map((m) =>
        m.id === editandoNombreMesa.id ? { ...m, etiqueta: editandoNombreMesa.valor || m.etiqueta } : m,
      ),
    )
    setEditandoNombreMesa(null)
  }, [editandoNombreMesa])

  // --- CONFIGURACIÓN INICIAL ---
  const confirmarSectorUnico = useCallback(() => {
    setSectores([
      { id: "S1", nombre: configSectorUnico.nombre, color: configSectorUnico.color, precio: configSectorUnico.precio },
    ])
    setMesas([
      {
        id: "T1",
        x: 0,
        y: 0,
        etiqueta: "Mesa 1",
        forma: "cuadrado",
        sillas: 8,
        ancho: 120,
        alto: 200,
        escala: 1,
        sectorId: "S1",
        ladosActivos: ["top", "bottom", "left", "right"],
        bloqueada: false,
        espacioEntreSillas: 50, // valor por defecto
      },
    ])
    setTipoMapa("sector")
    setModoConfigurado(true)
    centrarlVista()
  }, [configSectorUnico, centrarlVista])

  const iniciarMapaCompleto = useCallback(() => {
    setTipoMapa("completo")
    setSectores([
      { id: "S1", nombre: "General", color: "#94a3b8", precio: 50 },
      { id: "S2", nombre: "VIP", color: "#8B6FFA", precio: 150 },
    ])
    setMesas([
      {
        id: "T1",
        x: 0,
        y: 0,
        etiqueta: "Mesa 1",
        forma: "circulo",
        sillas: 4,
        ancho: 110,
        alto: 110,
        escala: 1,
        sectorId: "S1",
        ladosActivos: ["top", "bottom", "left", "right"],
        bloqueada: false,
        espacioEntreSillas: 50, // valor por defecto
      },
    ])
    setModoConfigurado(true)
    centrarlVista()
  }, [centrarlVista])

  // --- INTERACCIONES DEL MOUSE ---
  const alPresionarMouse = useCallback(
    (e: React.MouseEvent, tipo: string, mesa: Mesa | null = null) => {
      if (herramientaActiva === "mano" || e.button === 1) {
        setIsPanning(true)
        panStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y }
        return
      }

      const mousePos = getMousePos(e.clientX, e.clientY)

      if (tipo === "mesa" && mesa) {
        e.stopPropagation()

        if (mesa.bloqueada && !e.shiftKey) {
          setIdsSeleccionados([mesa.id])
          setPanelActivo("propiedades")
          return
        }

        tomarSnapshot()

        let nuevosIdsSeleccionados = [...idsSeleccionados]

        if (e.shiftKey) {
          if (idsSeleccionados.includes(mesa.id)) {
            nuevosIdsSeleccionados = idsSeleccionados.filter((id) => id !== mesa.id)
          } else {
            nuevosIdsSeleccionados.push(mesa.id)
          }
        } else {
          if (!idsSeleccionados.includes(mesa.id)) {
            nuevosIdsSeleccionados = [mesa.id]
          }
        }

        const mesasParaArrastrar = mesas.filter((m) => nuevosIdsSeleccionados.includes(m.id))
        const algunaBloqueada = mesasParaArrastrar.some((m) => m.bloqueada)

        if (algunaBloqueada) {
          setIdsSeleccionados(nuevosIdsSeleccionados)
          setPanelActivo("propiedades")
          return
        }

        if (e.altKey && nuevosIdsSeleccionados.length > 0) {
          const mesasADuplicar = mesas.filter((m) => nuevosIdsSeleccionados.includes(m.id))
          const nuevasMesas: Mesa[] = []
          const mapeoIds: { [key: string]: string } = {}

          const mesasTemp = [...mesas]
          mesasADuplicar.forEach((base) => {
            const nuevoId = obtenerSiguienteId(mesasTemp)
            const nuevoNombre = obtenerSiguienteNombre(base.etiqueta, mesasTemp)
            const nuevaMesa: Mesa = { ...base, id: nuevoId, etiqueta: nuevoNombre, bloqueada: false }
            nuevasMesas.push(nuevaMesa)
            mesasTemp.push(nuevaMesa)
            mapeoIds[base.id] = nuevoId
          })

          setMesas((prev) => [...prev, ...nuevasMesas])

          const nuevosIds = nuevasMesas.map((m) => m.id)
          setIdsSeleccionados(nuevosIds)
          nuevosIdsSeleccionados = nuevosIds

          const offsets: { [key: string]: { x: number; y: number } } = {}
          nuevasMesas.forEach((m) => {
            offsets[m.id] = { x: mousePos.x - m.x, y: mousePos.y - m.y }
          })
          setOffsetsMesas(offsets)
          setIdMesaArrastradaPrincipal(mapeoIds[mesa.id])
          setArrastrandoMesa(true)
          setPanelActivo("propiedades")
          return
        }

        setIdsSeleccionados(nuevosIdsSeleccionados)
        setArrastrandoMesa(true)
        setPanelActivo("propiedades")
        setIdMesaArrastradaPrincipal(mesa.id)

        const offsets: { [key: string]: { x: number; y: number } } = {}
        mesas.forEach((m) => {
          if (nuevosIdsSeleccionados.includes(m.id)) {
            offsets[m.id] = { x: mousePos.x - m.x, y: mousePos.y - m.y }
          }
        })
        setOffsetsMesas(offsets)
      } else if (tipo === "lienzo") {
        if (!e.shiftKey) {
          setIdsSeleccionados([])
          setCajaSeleccion({ startX: mousePos.x, startY: mousePos.y, currentX: mousePos.x, currentY: mousePos.y })
          setMenuDescargaAbierto(false)
        } else {
          setCajaSeleccion({ startX: mousePos.x, startY: mousePos.y, currentX: mousePos.x, currentY: mousePos.y })
        }
      }
    },
    [herramientaActiva, pan, getMousePos, idsSeleccionados, mesas, tomarSnapshot],
  )

  const manejarDobleClickMesa = useCallback(
    (mesa: Mesa) => {
      if (mesa.bloqueada || !referenciaSvg.current) return

      const rect = referenciaSvg.current.getBoundingClientRect()
      const screenX = mesa.x * zoom + pan.x + rect.left
      const screenY = mesa.y * zoom + pan.y + rect.top - 20

      setEditandoNombreMesa({
        id: mesa.id,
        x: screenX,
        y: screenY,
        valor: mesa.etiqueta,
      })
    },
    [zoom, pan],
  )

  const alMoverMouse = useCallback(
    (e: React.MouseEvent) => {
      if (isPanning) {
        setPan({ x: e.clientX - panStart.current.x, y: e.clientY - panStart.current.y })
        return
      }

      const mousePos = getMousePos(e.clientX, e.clientY)

      if (arrastrandoMesa && idsSeleccionados.length > 0) {
        const mesaPrincipal = mesas.find((m) => m.id === idMesaArrastradaPrincipal)
        if (!mesaPrincipal) return

        const offsetPrincipal = offsetsMesas[mesaPrincipal.id] || { x: 0, y: 0 }
        let nuevoX = mousePos.x - offsetPrincipal.x
        let nuevoY = mousePos.y - offsetPrincipal.y

        const otrasMesas = mesas.filter((m) => !idsSeleccionados.includes(m.id))
        const umbral = UMBRAL_SNAP / zoom
        const nuevasGuias: Guia[] = []

        const w = mesaPrincipal.ancho * (mesaPrincipal.escala || 1)
        const h = mesaPrincipal.alto * (mesaPrincipal.escala || 1)
        const misPuntosX = { c: nuevoX, l: nuevoX - w / 2, r: nuevoX + w / 2 }
        const misPuntosY = { c: nuevoY, t: nuevoY - h / 2, b: nuevoY + h / 2 }

        let snapX = false
        let snapY = false

        for (const otra of otrasMesas) {
          const ow = otra.ancho * (otra.escala || 1)
          const oh = otra.alto * (otra.escala || 1)
          const objetivosX = [otra.x, otra.x - ow / 2, otra.x + ow / 2]

          if (!snapX) {
            for (const target of objetivosX) {
              if (Math.abs(misPuntosX.c - target) < umbral) {
                nuevoX = target
                snapX = true
                nuevasGuias.push({ type: "v", pos: target })
                break
              }
              if (Math.abs(misPuntosX.l - target) < umbral) {
                nuevoX = target + w / 2
                snapX = true
                nuevasGuias.push({ type: "v", pos: target })
                break
              }
              if (Math.abs(misPuntosX.r - target) < umbral) {
                nuevoX = target - w / 2
                snapX = true
                nuevasGuias.push({ type: "v", pos: target })
                break
              }
            }
          }

          const objetivosY = [otra.y, otra.y - oh / 2, otra.y + oh / 2]
          if (!snapY) {
            for (const target of objetivosY) {
              if (Math.abs(misPuntosY.c - target) < umbral) {
                nuevoY = target
                snapY = true
                nuevasGuias.push({ type: "h", pos: target })
                break
              }
              if (Math.abs(misPuntosY.t - target) < umbral) {
                nuevoY = target + h / 2
                snapY = true
                nuevasGuias.push({ type: "h", pos: target })
                break
              }
              if (Math.abs(misPuntosY.b - target) < umbral) {
                nuevoY = target - h / 2
                snapY = true
                nuevasGuias.push({ type: "h", pos: target })
                break
              }
            }
          }
          if (snapX && snapY) break
        }

        setGuias(nuevasGuias)

        const deltaX = nuevoX - mesaPrincipal.x
        const deltaY = nuevoY - mesaPrincipal.y

        setMesas((prev) =>
          prev.map((m) => (idsSeleccionados.includes(m.id) ? { ...m, x: m.x + deltaX, y: m.y + deltaY } : m)),
        )
      } else if (cajaSeleccion) {
        setCajaSeleccion({ ...cajaSeleccion, currentX: mousePos.x, currentY: mousePos.y })
      }
    },
    [
      isPanning,
      getMousePos,
      arrastrandoMesa,
      idsSeleccionados,
      mesas,
      idMesaArrastradaPrincipal,
      offsetsMesas,
      zoom,
      cajaSeleccion,
    ],
  )

  const alSoltarMouse = useCallback(() => {
    if (cajaSeleccion) {
      const x1 = Math.min(cajaSeleccion.startX, cajaSeleccion.currentX)
      const x2 = Math.max(cajaSeleccion.startX, cajaSeleccion.currentX)
      const y1 = Math.min(cajaSeleccion.startY, cajaSeleccion.currentY)
      const y2 = Math.max(cajaSeleccion.startY, cajaSeleccion.currentY)

      const mesasEnCaja = mesas
        .filter((m) => {
          const escala = m.escala || 1
          const ancho = m.ancho * escala
          const alto = m.alto * escala
          const mesaLeft = m.x - ancho / 2
          const mesaRight = m.x + ancho / 2
          const mesaTop = m.y - alto / 2
          const mesaBottom = m.y + alto / 2

          return !(mesaRight < x1 || mesaLeft > x2 || mesaBottom < y1 || mesaTop > y2)
        })
        .map((m) => m.id)

      setIdsSeleccionados((prev) => [...new Set([...prev, ...mesasEnCaja])])
      setCajaSeleccion(null)
    }

    if (arrastrandoMesa) {
      confirmarSnapshotSiHuboCambios()
    }

    setArrastrandoMesa(false)
    setIsPanning(false)
    setGuias([])
    setIdMesaArrastradaPrincipal(null)
  }, [cajaSeleccion, mesas, arrastrandoMesa, confirmarSnapshotSiHuboCambios])

  // --- HANDLERS DE TOUCH (MOBILE) ---
  const getTouchPos = useCallback(
    (clientX: number, clientY: number) => {
      const contenedor = contenedorRef.current
      if (!contenedor) return { x: 0, y: 0 }
      const rect = contenedor.getBoundingClientRect()
      return {
        x: (clientX - rect.left - pan.x) / zoom,
        y: (clientY - rect.top - pan.y) / zoom,
      }
    },
    [pan, zoom],
  )

  const alPresionarTouch = useCallback(
    (e: React.TouchEvent, tipo: string, mesa: Mesa | null = null) => {
      e.preventDefault()

      const touches = e.touches

      if (touches.length === 2) {
        const dx = touches[0].clientX - touches[1].clientX
        const dy = touches[0].clientY - touches[1].clientY
        lastTouchDistance.current = Math.hypot(dx, dy)
        lastTouchCenter.current = {
          x: (touches[0].clientX + touches[1].clientX) / 2,
          y: (touches[0].clientY + touches[1].clientY) / 2,
        }
        // Iniciar pan desde el centro de los dos dedos
        setIsPanning(true)
        panStart.current = {
          x: lastTouchCenter.current.x - pan.x,
          y: lastTouchCenter.current.y - pan.y,
        }
        return
      }

      // Un solo dedo
      if (touches.length === 1) {
        const touch = touches[0]
        const touchPos = getTouchPos(touch.clientX, touch.clientY)

        if (herramientaActiva === "mano") {
          setIsPanning(true)
          panStart.current = { x: touch.clientX - pan.x, y: touch.clientY - pan.y }
          return
        }

        if (tipo === "mesa" && mesa) {
          e.stopPropagation()

          if (mesa.bloqueada) {
            setIdsSeleccionados([mesa.id])
            setPanelActivo("propiedades")
            return
          }

          tomarSnapshot()

          let nuevosIdsSeleccionados = [...idsSeleccionados]
          if (!idsSeleccionados.includes(mesa.id)) {
            nuevosIdsSeleccionados = [mesa.id]
          }

          setIdsSeleccionados(nuevosIdsSeleccionados)
          setArrastrandoMesa(true)
          setPanelActivo("propiedades")
          setIdMesaArrastradaPrincipal(mesa.id)

          // Calcular offsets para todas las mesas seleccionadas
          const offsets: { [key: string]: { x: number; y: number } } = {}
          mesas.forEach((m) => {
            if (nuevosIdsSeleccionados.includes(m.id)) {
              offsets[m.id] = { x: touchPos.x - m.x, y: touchPos.y - m.y }
            }
          })
          setOffsetsMesas(offsets)
        } else if (tipo === "lienzo") {
          setIdsSeleccionados([])
          setCajaSeleccion({ startX: touchPos.x, startY: touchPos.y, currentX: touchPos.x, currentY: touchPos.y })
          setMenuDescargaAbierto(false)
        }
      }
    },
    [herramientaActiva, pan, getTouchPos, tomarSnapshot, idsSeleccionados, mesas],
  )

  const alMoverTouch = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault()
      const touches = e.touches

      if (touches.length === 2) {
        const dx = touches[0].clientX - touches[1].clientX
        const dy = touches[0].clientY - touches[1].clientY
        const newDistance = Math.hypot(dx, dy)
        const newCenter = {
          x: (touches[0].clientX + touches[1].clientX) / 2,
          y: (touches[0].clientY + touches[1].clientY) / 2,
        }

        // Zoom con pinch
        if (lastTouchDistance.current !== null) {
          const scale = newDistance / lastTouchDistance.current
          const newZoom = Math.min(Math.max(zoom * scale, 0.1), 3)
          setZoom(newZoom)
          lastTouchDistance.current = newDistance
        }

        // Pan con movimiento del centro
        if (isPanning) {
          setPan({
            x: newCenter.x - panStart.current.x,
            y: newCenter.y - panStart.current.y,
          })
        }

        lastTouchCenter.current = newCenter
        return
      }

      // Un solo dedo
      if (touches.length === 1) {
        const touch = touches[0]

        // Pan si está en modo pan
        if (isPanning) {
          setPan({
            x: touch.clientX - panStart.current.x,
            y: touch.clientY - panStart.current.y,
          })
          return
        }

        const touchPos = getTouchPos(touch.clientX, touch.clientY)

        if (arrastrandoMesa && idsSeleccionados.length > 0) {
          const mesaPrincipal = mesas.find((m) => m.id === idMesaArrastradaPrincipal)
          if (!mesaPrincipal) return

          const offsetPrincipal = offsetsMesas[mesaPrincipal.id] || { x: 0, y: 0 }
          let nuevoX = touchPos.x - offsetPrincipal.x
          let nuevoY = touchPos.y - offsetPrincipal.y

          // Snap a otras mesas
          const otrasMesas = mesas.filter((m) => !idsSeleccionados.includes(m.id))
          const umbral = UMBRAL_SNAP / zoom
          const nuevasGuias: Guia[] = []

          const w = mesaPrincipal.ancho * (mesaPrincipal.escala || 1)
          const h = mesaPrincipal.alto * (mesaPrincipal.escala || 1)
          const misPuntosX = { c: nuevoX, l: nuevoX - w / 2, r: nuevoX + w / 2 }
          const misPuntosY = { c: nuevoY, t: nuevoY - h / 2, b: nuevoY + h / 2 }

          let snapX = false
          let snapY = false

          for (const otra of otrasMesas) {
            const ow = otra.ancho * (otra.escala || 1)
            const oh = otra.alto * (otra.escala || 1)
            const objetivosX = [otra.x, otra.x - ow / 2, otra.x + ow / 2]

            if (!snapX) {
              for (const target of objetivosX) {
                if (Math.abs(misPuntosX.c - target) < umbral) {
                  nuevoX = target
                  snapX = true
                  nuevasGuias.push({ type: "v", pos: target })
                  break
                }
                if (Math.abs(misPuntosX.l - target) < umbral) {
                  nuevoX = target + w / 2
                  snapX = true
                  nuevasGuias.push({ type: "v", pos: target })
                  break
                }
                if (Math.abs(misPuntosX.r - target) < umbral) {
                  nuevoX = target - w / 2
                  snapX = true
                  nuevasGuias.push({ type: "v", pos: target })
                  break
                }
              }
            }

            const objetivosY = [otra.y, otra.y - oh / 2, otra.y + oh / 2]
            if (!snapY) {
              for (const target of objetivosY) {
                if (Math.abs(misPuntosY.c - target) < umbral) {
                  nuevoY = target
                  snapY = true
                  nuevasGuias.push({ type: "h", pos: target })
                  break
                }
                if (Math.abs(misPuntosY.t - target) < umbral) {
                  nuevoY = target + h / 2
                  snapY = true
                  nuevasGuias.push({ type: "h", pos: target })
                  break
                }
                if (Math.abs(misPuntosY.b - target) < umbral) {
                  nuevoY = target - h / 2
                  snapY = true
                  nuevasGuias.push({ type: "h", pos: target })
                  break
                }
              }
            }
            if (snapX && snapY) break
          }

          setGuias(nuevasGuias)

          const deltaX = nuevoX - mesaPrincipal.x
          const deltaY = nuevoY - mesaPrincipal.y

          setMesas((prev) =>
            prev.map((m) => {
              if (idsSeleccionados.includes(m.id) && !m.bloqueada) {
                return { ...m, x: m.x + deltaX, y: m.y + deltaY }
              }
              return m
            }),
          )
        } else if (cajaSeleccion) {
          setCajaSeleccion({ ...cajaSeleccion, currentX: touchPos.x, currentY: touchPos.y })
        }
      }
    },
    [
      isPanning,
      getTouchPos,
      arrastrandoMesa,
      idsSeleccionados,
      mesas,
      idMesaArrastradaPrincipal,
      offsetsMesas,
      zoom,
      cajaSeleccion,
    ],
  )

  const alSoltarTouch = useCallback(() => {
    lastTouchDistance.current = null
    lastTouchCenter.current = null

    if (cajaSeleccion) {
      const x1 = Math.min(cajaSeleccion.startX, cajaSeleccion.currentX)
      const x2 = Math.max(cajaSeleccion.startX, cajaSeleccion.currentX)
      const y1 = Math.min(cajaSeleccion.startY, cajaSeleccion.currentY)
      const y2 = Math.max(cajaSeleccion.startY, cajaSeleccion.currentY)

      const mesasEnCaja = mesas
        .filter((m) => {
          const escala = m.escala || 1
          const ancho = m.ancho * escala
          const alto = m.alto * escala
          const mesaLeft = m.x - ancho / 2
          const mesaRight = m.x + ancho / 2
          const mesaTop = m.y - alto / 2
          const mesaBottom = m.y + alto / 2

          return !(mesaRight < x1 || mesaLeft > x2 || mesaBottom < y1 || mesaTop > y2)
        })
        .map((m) => m.id)

      setIdsSeleccionados((prev) => [...new Set([...prev, ...mesasEnCaja])])
      setCajaSeleccion(null)
    }

    if (arrastrandoMesa) {
      confirmarSnapshotSiHuboCambios()
    }

    setArrastrandoMesa(false)
    setIsPanning(false)
    setGuias([])
    setIdMesaArrastradaPrincipal(null)
  }, [cajaSeleccion, mesas, arrastrandoMesa, confirmarSnapshotSiHuboCambios])

  // --- IO ---
  const manejarSubidaImagen = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) {
      const r = new FileReader()
      r.onload = (ev) => {
        const i = new Image()
        i.crossOrigin = "anonymous"
        i.onload = () => {
          setImagenFondo(ev.target?.result as string)
          setDimensionesImagen({ w: i.width, h: i.height })
        }
        i.src = ev.target?.result as string
      }
      r.readAsDataURL(f)
    }
  }, [])

  const handleExportarSVG = useCallback(() => {
    if (referenciaSvg.current) {
      exportarSVG(referenciaSvg.current, mesas, imagenFondo, dimensionesImagen, tipoMapa)
      setMenuDescargaAbierto(false)
    }
  }, [mesas, imagenFondo, dimensionesImagen, tipoMapa])

  const handleDescargarJSON = useCallback(() => {
    descargarJSON(mesas, sectores, tipoMapa, imagenFondo, dimensionesImagen)
    setMenuDescargaAbierto(false)
  }, [mesas, sectores, tipoMapa, imagenFondo, dimensionesImagen])

  // --- ATAJOS DE TECLADO ---
  useEffect(() => {
    const manejarKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === "INPUT") return

      console.log("[v0] Key pressed:", e.key, "Code:", e.code, "Shift:", e.shiftKey)

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault()
        if (e.shiftKey) rehacer()
        else deshacer()
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
        e.preventDefault()
        rehacer()
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "1") {
        e.preventDefault()
        zoomToFit()
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "2") {
        e.preventDefault()
        zoomToSelection()
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "0") {
        e.preventDefault()
        centrarlVista()
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "l") {
        e.preventDefault()
        toggleBloqueo()
      }
      if (e.key === "Escape") {
        if (mostrarAyudaAtajos) setMostrarAyudaAtajos(false)
        else if (idsSeleccionados.length > 0) setIdsSeleccionados([])
      }
      if (e.key === "?" || e.key === "¿" || e.code === "Slash" || (e.shiftKey && e.key === "/")) {
        e.preventDefault()
        setMostrarAyudaAtajos((prev) => !prev)
      }
      if (e.key === "v") setHerramienta("seleccion")
      if (e.key === "h") setHerramienta("mano")
      if (e.key === " ") {
        e.preventDefault()
        if (herramienta !== "mano") setHerramientaTemporal("mano")
      }
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        if (idsSeleccionados.length > 0) {
          const mesasSeleccionadas = mesas.filter((m) => idsSeleccionados.includes(m.id))
          if (mesasSeleccionadas.some((m) => m.bloqueada)) return

          e.preventDefault()
          const distancia = e.shiftKey ? 10 : 1
          let deltaX = 0
          let deltaY = 0

          if (e.key === "ArrowUp") deltaY = -distancia
          if (e.key === "ArrowDown") deltaY = distancia
          if (e.key === "ArrowLeft") deltaX = -distancia
          if (e.key === "ArrowRight") deltaX = distancia

          guardarHistorial()
          setMesas((prev) =>
            prev.map((m) => (idsSeleccionados.includes(m.id) ? { ...m, x: m.x + deltaX, y: m.y + deltaY } : m)),
          )
        }
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        if (idsSeleccionados.length > 0) {
          guardarHistorial()
          eliminarSeleccionadas()
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "c") {
        if (idsSeleccionados.length > 0) {
          const aCopiar = mesas.filter((m) => idsSeleccionados.includes(m.id))
          aCopiar.sort((a, b) => a.y - b.y || a.x - b.x)
          setMesasPortapapeles(aCopiar)
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "v") {
        if (mesasPortapapeles.length > 0) {
          guardarHistorial()
          insertarNuevasMesas(mesasPortapapeles, 20, 20)
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "d") {
        e.preventDefault()
        duplicarMesasSeleccionadas()
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "a") {
        e.preventDefault()
        setIdsSeleccionados(mesas.map((m) => m.id))
      }
    }

    const manejarKeyUp = (e: KeyboardEvent) => {
      if (e.key === " ") {
        if (herramientaTemporal === "mano") setHerramientaTemporal(null)
      }
    }

    window.addEventListener("keydown", manejarKeyDown)
    window.addEventListener("keyup", manejarKeyUp)
    return () => {
      window.removeEventListener("keydown", manejarKeyDown)
      window.removeEventListener("keyup", manejarKeyUp)
    }
  }, [
    idsSeleccionados,
    mesas,
    mesasPortapapeles,
    herramientaTemporal,
    herramienta,
    mostrarAyudaAtajos,
    deshacer,
    rehacer,
    zoomToFit,
    zoomToSelection,
    centrarlVista,
    toggleBloqueo,
    guardarHistorial,
    eliminarSeleccionadas,
    duplicarMesasSeleccionadas,
    insertarNuevasMesas,
  ])

  // --- WHEEL / ZOOM ---
  useEffect(() => {
    const contenedor = contenedorRef.current
    if (!contenedor) return

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      if (!referenciaSvg.current) return

      const rect = referenciaSvg.current.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top

      if (e.ctrlKey) {
        const scaleFactor = 0.05
        const direction = -Math.sign(e.deltaY)
        const newZoom = Math.max(0.1, Math.min(5, zoom + direction * scaleFactor))
        const newPanX = mouseX - (mouseX - pan.x) * (newZoom / zoom)
        const newPanY = mouseY - (mouseY - pan.y) * (newZoom / zoom)
        setZoom(newZoom)
        setPan({ x: newPanX, y: newPanY })
      } else {
        setPan((prev) => ({ x: prev.x - e.deltaX, y: prev.y - e.deltaY }))
      }
    }

    contenedor.addEventListener("wheel", handleWheel, { passive: false })
    return () => contenedor.removeEventListener("wheel", handleWheel)
  }, [zoom, pan])

  useEffect(() => {
    const preventGlobalZoom = (e: WheelEvent) => {
      if (e.ctrlKey) e.preventDefault()
    }
    document.addEventListener("wheel", preventGlobalZoom, { passive: false })
    return () => document.removeEventListener("wheel", preventGlobalZoom)
  }, [])

  // --- ZOOM TO FIT INICIAL ---
  useEffect(() => {
    if (!vistaCentradaInicial && referenciaSvg.current && mesas.length > 0) {
      const timer = setTimeout(() => {
        zoomToFit()
        setVistaCentradaInicial(true)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [mesas, vistaCentradaInicial, zoomToFit])

  useEffect(() => {
    const preventGlobalZoom = (e: WheelEvent) => {
      if (e.ctrlKey) e.preventDefault()
    }
    document.addEventListener("wheel", preventGlobalZoom, { passive: false })
    return () => document.removeEventListener("wheel", preventGlobalZoom)
  }, [])

  // --- FOCUS INPUT NOMBRE ---
  useEffect(() => {
    if (editandoNombreMesa && inputNombreRef.current) {
      inputNombreRef.current.focus()
      inputNombreRef.current.select()
    }
  }, [editandoNombreMesa])

  // --- VARIABLES CALCULADAS ---
  const mesaActiva = useMemo(
    () =>
      idsSeleccionados.length > 0
        ? mesas.find((m) => m.id === idsSeleccionados[idsSeleccionados.length - 1]) || null
        : null,
    [mesas, idsSeleccionados],
  )

  const hayMesasBloqueadas = useMemo(
    () => mesas.filter((m) => idsSeleccionados.includes(m.id)).some((m) => m.bloqueada),
    [mesas, idsSeleccionados],
  )

  const limitesSlider = useMemo(() => {
    if (!mesaActiva) return { minW: 50, minH: 50 }
    return calcularLimites(mesaActiva)
  }, [mesaActiva])

  const cursorStyle = useMemo(() => {
    if (herramientaActiva === "mano") return isPanning ? "grabbing" : "grab"
    return "default"
  }, [herramientaActiva, isPanning])

  return {
    // Estado de configuración
    modoConfigurado,
    pasoModal,
    setPasoModal,
    tipoMapa,
    configSectorUnico,
    setConfigSectorUnico,
    confirmarSectorUnico,
    iniciarMapaCompleto,

    // Datos principales
    mesas,
    setMesas,
    sectores,
    idsSeleccionados,
    setIdsSeleccionados,

    // Navegación
    zoom,
    setZoom,
    pan,
    herramienta,
    setHerramienta,
    herramientaActiva,
    isPanning,
    cursorStyle,

    // UI state
    panelActivo,
    setPanelActivo,
    imagenFondo,
    dimensionesImagen,
    menuDescargaAbierto,
    setMenuDescargaAbierto,
    mostrarAyudaAtajos,
    setMostrarAyudaAtajos,
    editandoNombreMesa,
    setEditandoNombreMesa,
    guias,
    cajaSeleccion,

    // Historial
    puedeDeshacer,
    puedeRehacer,
    deshacer,
    rehacer,
    guardarHistorial,

    // Acciones de mesas
    agregarMesa,
    duplicarMesasSeleccionadas,
    eliminarSeleccionadas,
    toggleBloqueo,
    actualizarMesa,
    actualizarDiametro,
    toggleLado,
    confirmarNombreMesa,

    // Acciones de sectores
    agregarSector,
    actualizarSector,
    eliminarSector,

    // Acciones de navegación
    centrarlVista,
    zoomToFit,
    zoomToSelection,

    // Handlers de mouse
    alPresionarMouse,
    alMoverMouse,
    alSoltarMouse,
    manejarDobleClickMesa,

    // Handlers de touch (mobile)
    alPresionarTouch,
    alMoverTouch,
    alSoltarTouch,

    // IO
    manejarSubidaImagen,
    handleExportarSVG,
    handleDescargarJSON,

    // Refs
    referenciaSvg,
    contenedorRef,
    inputNombreRef,
    inputArchivoRef,

    // Computed
    mesaActiva,
    hayMesasBloqueadas,
    limitesSlider,
  }
}
