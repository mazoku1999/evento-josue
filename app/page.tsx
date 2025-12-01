"use client"

import { useCanvas } from "@/hooks/use-canvas"
import { useIsMac } from "@/hooks/use-is-mac"
import { TooltipProvider } from "@/components/ui/tooltip-custom"
import { SidebarIzquierda } from "@/components/sidebar/sidebar-izquierda"
import { ModalConfiguracion } from "@/components/modals/modal-configuracion"
import { PanelPropiedades } from "@/components/panels/panel-propiedades"
import { ModalConfirmacion } from "@/components/modals/modal-confirmacion"
import { ModalNombreMesa } from "@/components/modals/modal-nombre-mesa"
import { ModalAyuda } from "@/components/modals/modal-ayuda"
import { EditorHeader } from "@/components/header/editor-header"
import { CanvasArea } from "@/components/canvas/canvas-area"
import { ZoomControls } from "@/components/controls/zoom-controls"
import { useState } from "react"

export default function App() {
  const canvas = useCanvas()
  const isMac = useIsMac()
  const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false)
  const [mostrarModalNombre, setMostrarModalNombre] = useState(false)

  // Modal de configuración inicial
  if (!canvas.modoConfigurado) {
    return (
      <ModalConfiguracion
        pasoModal={canvas.pasoModal}
        setPasoModal={canvas.setPasoModal}
        configSectorUnico={canvas.configSectorUnico}
        setConfigSectorUnico={canvas.setConfigSectorUnico}
        onConfirmarSectorUnico={canvas.confirmarSectorUnico}
        onIniciarMapaCompleto={canvas.iniciarMapaCompleto}
      />
    )
  }

  return (
    <TooltipProvider>
      <div className="flex h-screen bg-slate-50 font-sans text-slate-800">
        {/* INPUT OCULTO PARA IMAGEN */}
        <input
          type="file"
          ref={canvas.inputArchivoRef}
          onChange={canvas.manejarSubidaImagen}
          accept="image/*"
          className="hidden"
        />

        {/* SIDEBAR IZQUIERDA */}
        <SidebarIzquierda
          isMac={isMac}
          herramienta={canvas.herramienta}
          setHerramienta={canvas.setHerramienta}
          agregarMesa={canvas.agregarMesa}
          tipoMapa={canvas.tipoMapa}
          panelActivo={canvas.panelActivo}
          setPanelActivo={canvas.setPanelActivo}
          imagenFondo={canvas.imagenFondo}
          onSubirImagen={() => canvas.inputArchivoRef.current?.click()}
          onQuitarImagen={() => { }}
          menuDescargaAbierto={canvas.menuDescargaAbierto}
          setMenuDescargaAbierto={canvas.setMenuDescargaAbierto}
          onExportarSVG={canvas.handleExportarSVG}
          onDescargarJSON={canvas.handleDescargarJSON}
          onMostrarAyuda={() => canvas.setMostrarAyudaAtajos(true)}
        />

        {/* ÁREA PRINCIPAL */}
        <div className="flex-1 relative bg-slate-200 overflow-hidden flex flex-col ml-16">
          {/* HEADER */}
          <EditorHeader
            tipoMapa={canvas.tipoMapa}
            sectorNombre={canvas.sectores[0]?.nombre}
            sectorPrecio={canvas.sectores[0]?.precio}
            isMac={isMac}
            puedeDeshacer={canvas.puedeDeshacer}
            puedeRehacer={canvas.puedeRehacer}
            onDeshacer={canvas.deshacer}
            onRehacer={canvas.rehacer}
            cantidadSeleccionadas={canvas.idsSeleccionados.length}
            herramientaActiva={canvas.herramientaActiva}
          />

          {/* CANVAS */}
          <CanvasArea
            referenciaSvg={canvas.referenciaSvg}
            contenedorRef={canvas.contenedorRef}
            cursorStyle={canvas.cursorStyle}
            pan={canvas.pan}
            zoom={canvas.zoom}
            imagenFondo={canvas.imagenFondo}
            dimensionesImagen={canvas.dimensionesImagen}
            guias={canvas.guias}
            mesas={canvas.mesas}
            sectores={canvas.sectores}
            idsSeleccionados={canvas.idsSeleccionados}
            cajaSeleccion={canvas.cajaSeleccion}
            editandoNombreMesa={canvas.editandoNombreMesa}
            inputNombreRef={canvas.inputNombreRef}
            onMouseDown={canvas.alPresionarMouse}
            onMouseMove={canvas.alMoverMouse}
            onMouseUp={canvas.alSoltarMouse}
            onDoubleClickMesa={canvas.manejarDobleClickMesa}
            onEditandoNombreChange={canvas.setEditandoNombreMesa}
            onConfirmarNombre={canvas.confirmarNombreMesa}
            onTouchStart={canvas.alPresionarTouch}
            onTouchMove={canvas.alMoverTouch}
            onTouchEnd={canvas.alSoltarTouch}
          />

          {/* CONTROLES DE ZOOM */}
          <ZoomControls
            zoom={canvas.zoom}
            isMac={isMac}
            onZoomIn={() => canvas.setZoom((z) => Math.min(z + 0.1, 5))}
            onZoomOut={() => canvas.setZoom((z) => Math.max(z - 0.1, 0.1))}
            onResetView={canvas.centrarlVista}
          />
        </div>

        {/* PANEL DE PROPIEDADES */}
        <PanelPropiedades
          panelActivo={canvas.panelActivo}
          setPanelActivo={canvas.setPanelActivo}
          tipoMapa={canvas.tipoMapa}
          sectores={canvas.sectores}
          mesaActiva={canvas.mesaActiva}
          idsSeleccionados={canvas.idsSeleccionados}
          hayMesasBloqueadas={canvas.hayMesasBloqueadas}
          limitesSlider={canvas.limitesSlider}
          onActualizarMesa={canvas.actualizarMesa}
          onActualizarDiametro={canvas.actualizarDiametro}
          onToggleLado={canvas.toggleLado}
          onToggleBloqueo={canvas.toggleBloqueo}
          onDuplicar={canvas.duplicarMesasSeleccionadas}
          onEliminar={() => setMostrarModalEliminar(true)}
          onEditarNombre={() => setMostrarModalNombre(true)}
          onAgregarSector={canvas.agregarSector}
          onActualizarSector={canvas.actualizarSector}
          onEliminarSector={canvas.eliminarSector}
          onGuardarHistorial={canvas.guardarHistorial}
        />

        {/* MODALES */}
        {mostrarModalEliminar && (
          <ModalConfirmacion
            mensaje={`¿Eliminar ${canvas.idsSeleccionados.length} mesa(s)?`}
            onConfirmar={() => {
              canvas.guardarHistorial()
              canvas.eliminarSeleccionadas()
              setMostrarModalEliminar(false)
            }}
            onCancelar={() => setMostrarModalEliminar(false)}
          />
        )}

        {mostrarModalNombre && canvas.mesaActiva && (
          <ModalNombreMesa
            valorInicial={canvas.mesaActiva.etiqueta}
            onConfirmar={(nuevoNombre) => {
              canvas.actualizarMesa("etiqueta", nuevoNombre)
              setMostrarModalNombre(false)
            }}
            onCancelar={() => setMostrarModalNombre(false)}
          />
        )}

        {canvas.mostrarAyudaAtajos && <ModalAyuda isMac={isMac} onClose={() => canvas.setMostrarAyudaAtajos(false)} />}
      </div>
    </TooltipProvider>
  )
}
