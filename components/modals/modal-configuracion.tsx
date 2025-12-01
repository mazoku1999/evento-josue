"use client"

import { ArrowLeft, Check, LayoutGrid, Map } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface ModalConfiguracionProps {
  pasoModal: string
  setPasoModal: (paso: string) => void
  configSectorUnico: { nombre: string; color: string; precio: number }
  setConfigSectorUnico: (config: { nombre: string; color: string; precio: number }) => void
  onConfirmarSectorUnico: () => void
  onIniciarMapaCompleto: () => void
}

export function ModalConfiguracion({
  pasoModal,
  setPasoModal,
  configSectorUnico,
  setConfigSectorUnico,
  onConfirmarSectorUnico,
  onIniciarMapaCompleto,
}: ModalConfiguracionProps) {
  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-50 p-4">
      <div className="max-w-lg w-full">
        {pasoModal === "seleccion" && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-semibold text-foreground">Selecciona el tipo de mapa</h1>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Mapa Completo */}
              <Card
                className="cursor-pointer hover:border-primary hover:shadow-md transition-all group"
                onClick={onIniciarMapaCompleto}
              >
                <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                  <div className="p-4 bg-primary/10 text-primary rounded-xl group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Map size={32} />
                  </div>
                  <span className="font-medium text-foreground">Mapa Completo</span>
                </CardContent>
              </Card>

              {/* Mapa por Sector */}
              <Card
                className="cursor-pointer hover:border-primary hover:shadow-md transition-all group"
                onClick={() => setPasoModal("configurar_unico")}
              >
                <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                  <div className="p-4 bg-primary/10 text-primary rounded-xl group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <LayoutGrid size={32} />
                  </div>
                  <span className="font-medium text-foreground">Mapa por Sector</span>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {pasoModal === "configurar_unico" && (
          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPasoModal("seleccion")}
                  className="p-0 h-auto hover:bg-transparent"
                >
                  <ArrowLeft size={18} className="text-muted-foreground" />
                </Button>
                <h2 className="text-lg font-semibold text-foreground">Configurar Sector</h2>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre del sector</Label>
                  <Input
                    id="nombre"
                    type="text"
                    value={configSectorUnico.nombre}
                    onChange={(e) => setConfigSectorUnico({ ...configSectorUnico, nombre: e.target.value })}
                    placeholder="Ej: VIP, General, Preferencia"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="color">Color</Label>
                    <div className="flex items-center gap-2 border rounded-md p-2 h-10">
                      <input
                        id="color"
                        type="color"
                        value={configSectorUnico.color}
                        onChange={(e) => setConfigSectorUnico({ ...configSectorUnico, color: e.target.value })}
                        className="h-6 w-6 rounded cursor-pointer bg-transparent border-none"
                      />
                      <span className="text-sm text-muted-foreground font-mono">{configSectorUnico.color}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="precio">Precio (Bs.)</Label>
                    <Input
                      id="precio"
                      type="number"
                      value={configSectorUnico.precio}
                      onChange={(e) =>
                        setConfigSectorUnico({ ...configSectorUnico, precio: Number.parseInt(e.target.value) || 0 })
                      }
                    />
                  </div>
                </div>

                <Button onClick={onConfirmarSectorUnico} className="w-full mt-4">
                  Comenzar <Check size={18} className="ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
