module.exports = [
"[project]/constants/canvas.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ESPACIO_SILLA",
    ()=>ESPACIO_SILLA,
    "GAP_ESTANDAR",
    ()=>GAP_ESTANDAR,
    "GAP_MINIMO",
    ()=>GAP_MINIMO,
    "HISTORIAL_LIMITE",
    ()=>HISTORIAL_LIMITE,
    "MARGEN_ESQUINA",
    ()=>MARGEN_ESQUINA,
    "TAMANO_SILLA",
    ()=>TAMANO_SILLA,
    "UMBRAL_SNAP",
    ()=>UMBRAL_SNAP
]);
const TAMANO_SILLA = 24;
const ESPACIO_SILLA = 18;
const MARGEN_ESQUINA = 6;
const GAP_MINIMO = 4;
const GAP_ESTANDAR = 10;
const HISTORIAL_LIMITE = 50;
const UMBRAL_SNAP = 8;
}),
"[project]/utils/mesa-utils.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "calcularBoundingBox",
    ()=>calcularBoundingBox,
    "calcularLimites",
    ()=>calcularLimites,
    "esTamanoValido",
    ()=>esTamanoValido,
    "obtenerPosicionesSillas",
    ()=>obtenerPosicionesSillas,
    "obtenerSiguienteId",
    ()=>obtenerSiguienteId,
    "obtenerSiguienteNombre",
    ()=>obtenerSiguienteNombre
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$canvas$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/constants/canvas.ts [app-ssr] (ecmascript)");
;
const obtenerSiguienteId = (mesasExistentes)=>{
    const maxNum = mesasExistentes.reduce((max, m)=>{
        const match = m.id.match(/^T(\d+)$/);
        if (match) return Math.max(max, Number.parseInt(match[1]));
        return max;
    }, 0);
    return `T${maxNum + 1}`;
};
const obtenerSiguienteNombre = (etiquetaBase, mesasExistentes)=>{
    const match = etiquetaBase.match(/^(.*?)(\d+)$/);
    if (!match) return etiquetaBase + " (Copia)";
    const prefix = match[1];
    const maxNum = mesasExistentes.reduce((max, m)=>{
        const mMatch = m.etiqueta.match(/^(.*?)(\d+)$/);
        if (mMatch && mMatch[1] === prefix) return Math.max(max, Number.parseInt(mMatch[2]));
        return max;
    }, 0);
    return `${prefix}${maxNum + 1}`;
};
const esTamanoValido = (mesa, nuevoAncho, nuevoAlto, nuevasSillas = null)=>{
    const cantidadSillas = nuevasSillas !== null ? nuevasSillas : mesa.sillas;
    const { forma, ladosActivos } = mesa;
    const lados = ladosActivos || [
        "top",
        "bottom",
        "left",
        "right"
    ];
    if (forma === "circulo") {
        const perimetroDisponible = Math.PI * nuevoAncho;
        const perimetroNecesario = cantidadSillas * (__TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$canvas$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TAMANO_SILLA"] + 2);
        return perimetroDisponible >= perimetroNecesario;
    }
    const lPos = [
        {
            id: "top",
            l: nuevoAncho
        },
        {
            id: "bottom",
            l: nuevoAncho
        },
        {
            id: "right",
            l: nuevoAlto
        },
        {
            id: "left",
            l: nuevoAlto
        }
    ].filter((k)=>lados.includes(k.id));
    if (lPos.length === 0) return true;
    const pTotal = lPos.reduce((a, b)=>a + b.l, 0);
    let asg = 0;
    const dist = lPos.map((l)=>{
        const c = Math.floor(l.l / pTotal * cantidadSillas);
        const r = l.l / pTotal * mesa.sillas - c;
        asg += c;
        return {
            ...l,
            c,
            r
        };
    });
    dist.sort((a, b)=>b.r - a.r);
    for(let i = 0; i < cantidadSillas - asg; i++)if (dist[i]) dist[i].c++;
    return dist.every((d)=>{
        if (d.c === 0) return true;
        const espacioRequerido = d.c * __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$canvas$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TAMANO_SILLA"] + (d.c - 1) * __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$canvas$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["GAP_MINIMO"] + __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$canvas$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MARGEN_ESQUINA"] * 2;
        return d.l >= espacioRequerido;
    });
};
const calcularLimites = (mesa)=>{
    const minBase = 50;
    const maxBase = 500;
    const encontrarMinimoValido = (eje)=>{
        let low = minBase;
        let high = maxBase;
        let minValido = maxBase;
        while(low <= high){
            const mid = Math.floor((low + high) / 2);
            const w = eje === "ancho" ? mid : mesa.ancho;
            const h = eje === "alto" ? mid : mesa.alto;
            if (esTamanoValido(mesa, w, h)) {
                minValido = mid;
                high = mid - 1;
            } else {
                low = mid + 1;
            }
        }
        return minValido;
    };
    return {
        minW: encontrarMinimoValido("ancho"),
        minH: encontrarMinimoValido("alto")
    };
};
const obtenerPosicionesSillas = (mesa)=>{
    const { x, y, ancho, alto, sillas, forma } = mesa;
    const lados = mesa.ladosActivos || [
        "top",
        "bottom",
        "left",
        "right"
    ];
    const factorEspacio = (mesa.espacioEntreSillas ?? 50) / 100;
    if (forma === "circulo") {
        const radio = Math.max(ancho, alto) / 2 + __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$canvas$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ESPACIO_SILLA"];
        return Array.from({
            length: sillas
        }).map((_, i)=>{
            const angRad = (i * 360 / sillas - 90) * (Math.PI / 180);
            const anguloSilla = i * 360 / sillas;
            return {
                x: x + radio * Math.cos(angRad),
                y: y + radio * Math.sin(angRad),
                angulo: anguloSilla
            };
        });
    }
    const lPos = [
        {
            id: "top",
            l: ancho
        },
        {
            id: "bottom",
            l: ancho
        },
        {
            id: "right",
            l: alto
        },
        {
            id: "left",
            l: alto
        }
    ].filter((k)=>lados.includes(k.id));
    if (lPos.length === 0) return [];
    const pTotal = lPos.reduce((a, b)=>a + b.l, 0);
    let asg = 0;
    const dist = lPos.map((l)=>{
        const c = Math.floor(l.l / pTotal * sillas);
        const r = l.l / pTotal * mesa.sillas - c;
        asg += c;
        return {
            ...l,
            c,
            r
        };
    });
    dist.sort((a, b)=>b.r - a.r);
    for(let i = 0; i < sillas - asg; i++)if (dist[i]) dist[i].c++;
    const pos = [];
    const b = {
        l: x - ancho / 2,
        r: x + ancho / 2,
        t: y - alto / 2,
        b: y + alto / 2
    };
    const addSillas = (s, c)=>{
        if (c === 0) return;
        const longLado = s === "top" || s === "bottom" ? ancho : alto;
        const espacioDisponible = longLado - __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$canvas$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MARGEN_ESQUINA"] * 2;
        const anchoTotalSillas = c * __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$canvas$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TAMANO_SILLA"];
        const espacioLibre = espacioDisponible - anchoTotalSillas;
        const gapMaximo = c > 1 ? espacioLibre / (c - 1) : 0;
        const gapFinal = c > 1 ? __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$canvas$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["GAP_MINIMO"] + (gapMaximo - __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$canvas$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["GAP_MINIMO"]) * factorEspacio : 0;
        const anchoOcupado = anchoTotalSillas + (c - 1) * gapFinal;
        const offsetInicio = (longLado - anchoOcupado) / 2 + __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$canvas$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TAMANO_SILLA"] / 2;
        for(let i = 0; i < c; i++){
            const offset = offsetInicio + i * (__TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$canvas$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TAMANO_SILLA"] + gapFinal);
            if (s === "top") pos.push({
                x: b.l + offset,
                y: b.t - __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$canvas$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ESPACIO_SILLA"],
                angulo: 180
            });
            if (s === "bottom") pos.push({
                x: b.l + offset,
                y: b.b + __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$canvas$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ESPACIO_SILLA"],
                angulo: 0
            });
            if (s === "right") pos.push({
                x: b.r + __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$canvas$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ESPACIO_SILLA"],
                y: b.t + offset,
                angulo: 270
            });
            if (s === "left") pos.push({
                x: b.l - __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$canvas$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ESPACIO_SILLA"],
                y: b.t + offset,
                angulo: 90
            });
        }
    };
    dist.forEach((d)=>addSillas(d.id, d.c));
    return pos;
};
const calcularBoundingBox = (mesasArray, padding = 20)=>{
    if (mesasArray.length === 0) return null;
    let minX = Number.POSITIVE_INFINITY, minY = Number.POSITIVE_INFINITY, maxX = Number.NEGATIVE_INFINITY, maxY = Number.NEGATIVE_INFINITY;
    const pad = __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$canvas$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ESPACIO_SILLA"] + __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$canvas$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TAMANO_SILLA"] + padding;
    mesasArray.forEach((m)=>{
        const scale = m.escala || 1;
        const l = m.x - m.ancho * scale / 2 - pad;
        const r = m.x + m.ancho * scale / 2 + pad;
        const t = m.y - m.alto * scale / 2 - pad;
        const b = m.y + m.alto * scale / 2 + pad;
        if (l < minX) minX = l;
        if (r > maxX) maxX = r;
        if (t < minY) minY = t;
        if (b > maxY) maxY = b;
    });
    return {
        minX,
        minY,
        maxX,
        maxY,
        width: maxX - minX,
        height: maxY - minY
    };
};
}),
"[project]/utils/export-utils.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "descargarJSON",
    ()=>descargarJSON,
    "exportarSVG",
    ()=>exportarSVG
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$canvas$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/constants/canvas.ts [app-ssr] (ecmascript)");
;
const exportarSVG = (svgRef, mesas, imagenFondo, dimensionesImagen, tipoMapa)=>{
    const clone = svgRef.cloneNode(true);
    clone.querySelector("#capa-fondo")?.remove();
    clone.querySelector("#capa-grid")?.remove();
    clone.querySelector("#capa-guias")?.remove();
    clone.querySelector("#capa-seleccion")?.remove();
    clone.setAttribute("width", "100%");
    clone.setAttribute("height", "100%");
    clone.style.width = "100%";
    clone.style.height = "100%";
    if (!imagenFondo && mesas.length > 0) {
        let minX = Number.POSITIVE_INFINITY, minY = Number.POSITIVE_INFINITY, maxX = Number.NEGATIVE_INFINITY, maxY = Number.NEGATIVE_INFINITY;
        const pad = 50;
        mesas.forEach((m)=>{
            const l = m.x - m.ancho / 2 - __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$canvas$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ESPACIO_SILLA"] - __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$canvas$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TAMANO_SILLA"];
            const r = m.x + m.ancho / 2 + __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$canvas$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ESPACIO_SILLA"] + __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$canvas$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TAMANO_SILLA"];
            const t = m.y - m.alto / 2 - __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$canvas$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ESPACIO_SILLA"] - __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$canvas$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TAMANO_SILLA"];
            const b = m.y + m.alto / 2 + __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$canvas$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ESPACIO_SILLA"] + __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$canvas$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TAMANO_SILLA"] + 20;
            if (l < minX) minX = l;
            if (r > maxX) maxX = r;
            if (t < minY) minY = t;
            if (b > maxY) maxY = b;
        });
        if (minX !== Number.POSITIVE_INFINITY) {
            const w = maxX - minX + pad * 2;
            const h = maxY - minY + pad * 2;
            clone.setAttribute("viewBox", `${minX - pad} ${minY - pad} ${w} ${h}`);
            const contentGroup = clone.querySelector("#contenido-mapa");
            if (contentGroup) contentGroup.removeAttribute("transform");
        }
    } else if (imagenFondo) {
        clone.setAttribute("viewBox", `0 0 ${dimensionesImagen.w} ${dimensionesImagen.h}`);
        const contentGroup = clone.querySelector("#contenido-mapa");
        if (contentGroup) contentGroup.removeAttribute("transform");
    }
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([
        new XMLSerializer().serializeToString(clone)
    ], {
        type: "image/svg+xml;charset=utf-8"
    }));
    a.download = `plano_${tipoMapa}_${Date.now()}.svg`;
    a.click();
};
const descargarJSON = (mesas, sectores, tipoMapa, imagenFondo, dimensionesImagen)=>{
    const dataToSave = {
        tipo: tipoMapa,
        sectores
    };
    if (imagenFondo) {
        dataToSave.dimensiones = dimensionesImagen;
        dataToSave.mesas = mesas;
    } else {
        if (mesas.length === 0) {
            dataToSave.dimensiones = {
                w: 800,
                h: 600
            };
            dataToSave.mesas = [];
        } else {
            let minX = Number.POSITIVE_INFINITY, minY = Number.POSITIVE_INFINITY, maxX = Number.NEGATIVE_INFINITY, maxY = Number.NEGATIVE_INFINITY;
            const pad = 50;
            mesas.forEach((m)=>{
                const l = m.x - m.ancho / 2 - __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$canvas$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ESPACIO_SILLA"] - __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$canvas$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TAMANO_SILLA"];
                const r = m.x + m.ancho / 2 + __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$canvas$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ESPACIO_SILLA"] + __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$canvas$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TAMANO_SILLA"];
                const t = m.y - m.alto / 2 - __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$canvas$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ESPACIO_SILLA"] - __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$canvas$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TAMANO_SILLA"];
                const b = m.y + m.alto / 2 + __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$canvas$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ESPACIO_SILLA"] + __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$canvas$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TAMANO_SILLA"] + 20;
                if (l < minX) minX = l;
                if (r > maxX) maxX = r;
                if (t < minY) minY = t;
                if (b > maxY) maxY = b;
            });
            const originX = minX - pad;
            const originY = minY - pad;
            const width = maxX - minX + pad * 2;
            const height = maxY - minY + pad * 2;
            dataToSave.dimensiones = {
                w: width,
                h: height
            };
            dataToSave.mesas = mesas.map((m)=>({
                    ...m,
                    x: m.x - originX,
                    y: m.y - originY
                }));
        }
    }
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([
        JSON.stringify(dataToSave, null, 2)
    ], {
        type: "application/json"
    }));
    a.download = `datos_${tipoMapa}_${Date.now()}.json`;
    a.click();
};
}),
"[project]/hooks/use-historial.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useHistorial",
    ()=>useHistorial
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$canvas$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/constants/canvas.ts [app-ssr] (ecmascript)");
"use client";
;
;
function useHistorial(mesas, sectores, idsSeleccionados, setMesas, setSectores, setIdsSeleccionados) {
    const [historial, setHistorial] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        pasado: [],
        futuro: []
    });
    const snapshotRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const guardarHistorial = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        setHistorial((prev)=>{
            const nuevoEstado = {
                mesas: JSON.parse(JSON.stringify(mesas)),
                sectores: JSON.parse(JSON.stringify(sectores)),
                idsSeleccionados: [
                    ...idsSeleccionados
                ]
            };
            const nuevoPasado = [
                ...prev.pasado,
                nuevoEstado
            ].slice(-__TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$canvas$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["HISTORIAL_LIMITE"]);
            return {
                pasado: nuevoPasado,
                futuro: []
            };
        });
    }, [
        mesas,
        sectores,
        idsSeleccionados
    ]);
    const tomarSnapshot = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        snapshotRef.current = {
            mesas: JSON.parse(JSON.stringify(mesas)),
            sectores: JSON.parse(JSON.stringify(sectores)),
            idsSeleccionados: [
                ...idsSeleccionados
            ]
        };
    }, [
        mesas,
        sectores,
        idsSeleccionados
    ]);
    const confirmarSnapshotSiHuboCambios = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        if (!snapshotRef.current) return;
        const estadoPrevio = snapshotRef.current;
        const huboCambios = JSON.stringify(estadoPrevio.mesas) !== JSON.stringify(mesas) || JSON.stringify(estadoPrevio.sectores) !== JSON.stringify(sectores);
        if (huboCambios) {
            setHistorial((prev)=>({
                    pasado: [
                        ...prev.pasado,
                        estadoPrevio
                    ].slice(-__TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$canvas$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["HISTORIAL_LIMITE"]),
                    futuro: []
                }));
        }
        snapshotRef.current = null;
    }, [
        mesas,
        sectores
    ]);
    const deshacer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        if (historial.pasado.length === 0) return;
        const estadoAnterior = historial.pasado[historial.pasado.length - 1];
        const nuevoPasado = historial.pasado.slice(0, -1);
        const estadoActual = {
            mesas,
            sectores,
            idsSeleccionados
        };
        setHistorial({
            pasado: nuevoPasado,
            futuro: [
                estadoActual,
                ...historial.futuro
            ]
        });
        setMesas(estadoAnterior.mesas);
        setSectores(estadoAnterior.sectores);
        setIdsSeleccionados(estadoAnterior.idsSeleccionados || []);
    }, [
        historial,
        mesas,
        sectores,
        idsSeleccionados,
        setMesas,
        setSectores,
        setIdsSeleccionados
    ]);
    const rehacer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        if (historial.futuro.length === 0) return;
        const estadoSiguiente = historial.futuro[0];
        const nuevoFuturo = historial.futuro.slice(1);
        const estadoActual = {
            mesas,
            sectores,
            idsSeleccionados
        };
        setHistorial({
            pasado: [
                ...historial.pasado,
                estadoActual
            ],
            futuro: nuevoFuturo
        });
        setMesas(estadoSiguiente.mesas);
        setSectores(estadoSiguiente.sectores);
        setIdsSeleccionados(estadoSiguiente.idsSeleccionados || []);
    }, [
        historial,
        mesas,
        sectores,
        idsSeleccionados,
        setMesas,
        setSectores,
        setIdsSeleccionados
    ]);
    return {
        historial,
        guardarHistorial,
        tomarSnapshot,
        confirmarSnapshotSiHuboCambios,
        deshacer,
        rehacer,
        puedeDeshacer: historial.pasado.length > 0,
        puedeRehacer: historial.futuro.length > 0
    };
}
}),
"[project]/hooks/use-canvas.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useCanvas",
    ()=>useCanvas
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$canvas$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/constants/canvas.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$mesa$2d$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/mesa-utils.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$export$2d$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/export-utils.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$historial$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/hooks/use-historial.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
function useCanvas() {
    // --- CONFIGURACIÓN INICIAL ---
    const [modoConfigurado, setModoConfigurado] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [pasoModal, setPasoModal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("seleccion");
    const [tipoMapa, setTipoMapa] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("completo");
    const [configSectorUnico, setConfigSectorUnico] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        nombre: "General",
        color: "#40A578",
        precio: 100
    });
    // --- ESTADO DE DATOS ---
    const [sectores, setSectores] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([
        {
            id: "S1",
            nombre: "General",
            color: "#94a3b8",
            precio: 50
        },
        {
            id: "S2",
            nombre: "VIP",
            color: "#8B6FFA",
            precio: 150
        }
    ]);
    const [mesas, setMesas] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [idsSeleccionados, setIdsSeleccionados] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    // --- HISTORIAL ---
    const { guardarHistorial, tomarSnapshot, confirmarSnapshotSiHuboCambios, deshacer, rehacer, puedeDeshacer, puedeRehacer } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$historial$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useHistorial"])(mesas, sectores, idsSeleccionados, setMesas, setSectores, setIdsSeleccionados);
    // --- ESTADO DE INTERACCIÓN ---
    const [herramienta, setHerramienta] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("seleccion");
    const [herramientaTemporal, setHerramientaTemporal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [arrastrandoMesa, setArrastrandoMesa] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [cajaSeleccion, setCajaSeleccion] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [offsetsMesas, setOffsetsMesas] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({});
    const [idMesaArrastradaPrincipal, setIdMesaArrastradaPrincipal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [guias, setGuias] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [mostrarAyudaAtajos, setMostrarAyudaAtajos] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [editandoNombreMesa, setEditandoNombreMesa] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [mesasPortapapeles, setMesasPortapapeles] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [menuDescargaAbierto, setMenuDescargaAbierto] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    // --- NAVEGACIÓN ---
    const [zoom, setZoom] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(1);
    const [pan, setPan] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        x: 0,
        y: 0
    });
    const [isPanning, setIsPanning] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const panStart = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])({
        x: 0,
        y: 0
    });
    const lastTouchDistance = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const lastTouchCenter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const touchTimeout = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [panelActivo, setPanelActivo] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("propiedades");
    const [imagenFondo, setImagenFondo] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [dimensionesImagen, setDimensionesImagen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        w: 800,
        h: 600
    });
    const [vistaCentradaInicial, setVistaCentradaInicial] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    // --- REFS ---
    const referenciaSvg = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const contenedorRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const inputNombreRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const inputArchivoRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const herramientaActiva = herramientaTemporal || herramienta;
    // --- FUNCIONES AUXILIARES ---
    const getMousePos = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((clientX, clientY)=>{
        if (!referenciaSvg.current) return {
            x: 0,
            y: 0
        };
        const rect = referenciaSvg.current.getBoundingClientRect();
        return {
            x: (clientX - rect.left - pan.x) / zoom,
            y: (clientY - rect.top - pan.y) / zoom
        };
    }, [
        pan,
        zoom
    ]);
    const centrarlVista = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        setPan({
            x: 0,
            y: 0
        });
        setZoom(1);
    }, []);
    const zoomToFit = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        if (!referenciaSvg.current || mesas.length === 0) {
            centrarlVista();
            return;
        }
        const bbox = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$mesa$2d$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calcularBoundingBox"])(mesas);
        if (!bbox) return;
        const rect = referenciaSvg.current.getBoundingClientRect();
        const padding = 50;
        const scaleX = (rect.width - padding * 2) / bbox.width;
        const scaleY = (rect.height - padding * 2) / bbox.height;
        const newZoom = Math.min(Math.max(Math.min(scaleX, scaleY), 0.1), 2);
        const centerX = (bbox.minX + bbox.maxX) / 2;
        const centerY = (bbox.minY + bbox.maxY) / 2;
        setZoom(newZoom);
        setPan({
            x: rect.width / 2 - centerX * newZoom,
            y: rect.height / 2 - centerY * newZoom
        });
    }, [
        mesas,
        centrarlVista
    ]);
    const zoomToSelection = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        if (!referenciaSvg.current || idsSeleccionados.length === 0) return;
        const mesasSeleccionadas = mesas.filter((m)=>idsSeleccionados.includes(m.id));
        const bbox = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$mesa$2d$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calcularBoundingBox"])(mesasSeleccionadas);
        if (!bbox) return;
        const rect = referenciaSvg.current.getBoundingClientRect();
        const padding = 100;
        const scaleX = (rect.width - padding * 2) / bbox.width;
        const scaleY = (rect.height - padding * 2) / bbox.height;
        const newZoom = Math.min(Math.max(Math.min(scaleX, scaleY), 1.5), 3);
        const centerX = (bbox.minX + bbox.maxX) / 2;
        const centerY = (bbox.minY + bbox.maxY) / 2;
        setZoom(newZoom);
        setPan({
            x: rect.width / 2 - centerX * newZoom,
            y: rect.height / 2 - centerY * newZoom
        });
    }, [
        mesas,
        idsSeleccionados
    ]);
    // --- GESTIÓN DE SECTORES ---
    const agregarSector = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        guardarHistorial();
        const nuevoId = `S${Date.now()}`;
        const colores = [
            "#ef4444",
            "#f59e0b",
            "#10b981",
            "#3b82f6",
            "#ec4899",
            "#8b5cf6"
        ];
        const color = colores[sectores.length % colores.length];
        setSectores([
            ...sectores,
            {
                id: nuevoId,
                nombre: `Nuevo Sector ${sectores.length + 1}`,
                color,
                precio: 0
            }
        ]);
    }, [
        guardarHistorial,
        sectores
    ]);
    const actualizarSector = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((id, k, v)=>{
        setSectores((prev)=>prev.map((s)=>s.id === id ? {
                    ...s,
                    [k]: v
                } : s));
    }, []);
    const eliminarSector = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((id)=>{
        if (sectores.length <= 1) return;
        guardarHistorial();
        const fallback = sectores.find((s)=>s.id !== id).id;
        setMesas((prev)=>prev.map((m)=>m.sectorId === id ? {
                    ...m,
                    sectorId: fallback
                } : m));
        setSectores(sectores.filter((s)=>s.id !== id));
    }, [
        guardarHistorial,
        sectores
    ]);
    // --- GESTIÓN DE MESAS ---
    const agregarMesa = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((forma)=>{
        guardarHistorial();
        const nuevoId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$mesa$2d$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["obtenerSiguienteId"])(mesas);
        const sz = forma === "circulo" ? 110 : 100;
        if (referenciaSvg.current) {
            const rect = referenciaSvg.current.getBoundingClientRect();
            const worldPos = getMousePos(rect.left + rect.width / 2, rect.top + rect.height / 2);
            const nuevoNombre = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$mesa$2d$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["obtenerSiguienteNombre"])("Mesa 0", mesas);
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
                    ladosActivos: [
                        "top",
                        "bottom",
                        "left",
                        "right"
                    ],
                    bloqueada: false,
                    espacioEntreSillas: 50
                }
            ]);
            setIdsSeleccionados([
                nuevoId
            ]);
            setPanelActivo("propiedades");
            setHerramienta("seleccion");
        }
    }, [
        guardarHistorial,
        mesas,
        sectores,
        getMousePos
    ]);
    const insertarNuevasMesas = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((origenMesas, offsetX, offsetY)=>{
        const nuevasMesas = [];
        const mesasTemp = [
            ...mesas
        ];
        origenMesas.forEach((base)=>{
            const nuevoId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$mesa$2d$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["obtenerSiguienteId"])(mesasTemp);
            const nuevoNombre = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$mesa$2d$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["obtenerSiguienteNombre"])(base.etiqueta, mesasTemp);
            const nuevaMesa = {
                ...base,
                id: nuevoId,
                x: base.x + offsetX,
                y: base.y + offsetY,
                etiqueta: nuevoNombre,
                bloqueada: false
            };
            nuevasMesas.push(nuevaMesa);
            mesasTemp.push(nuevaMesa);
        });
        setMesas((prev)=>[
                ...prev,
                ...nuevasMesas
            ]);
        setIdsSeleccionados(nuevasMesas.map((m)=>m.id));
    }, [
        mesas
    ]);
    const duplicarMesasSeleccionadas = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        if (idsSeleccionados.length > 0) {
            guardarHistorial();
            const seleccionadas = mesas.filter((m)=>idsSeleccionados.includes(m.id));
            insertarNuevasMesas(seleccionadas, 40, 40);
        }
    }, [
        idsSeleccionados,
        mesas,
        guardarHistorial,
        insertarNuevasMesas
    ]);
    const eliminarSeleccionadas = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        setMesas(mesas.filter((m)=>!idsSeleccionados.includes(m.id)));
        setIdsSeleccionados([]);
    }, [
        mesas,
        idsSeleccionados
    ]);
    const toggleBloqueo = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        if (idsSeleccionados.length === 0) return;
        guardarHistorial();
        const mesasSeleccionadas = mesas.filter((m)=>idsSeleccionados.includes(m.id));
        const todasBloqueadas = mesasSeleccionadas.every((m)=>m.bloqueada);
        setMesas((prev)=>prev.map((m)=>idsSeleccionados.includes(m.id) ? {
                    ...m,
                    bloqueada: !todasBloqueadas
                } : m));
    }, [
        idsSeleccionados,
        mesas,
        guardarHistorial
    ]);
    const actualizarMesa = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((k, v)=>{
        setMesas((prevMesas)=>prevMesas.map((m)=>{
                if (idsSeleccionados.includes(m.id)) {
                    if (k === "forma" && v === "circulo") {
                        const maxDimension = Math.max(m.ancho, m.alto);
                        return {
                            ...m,
                            forma: v,
                            ancho: maxDimension,
                            alto: maxDimension
                        };
                    }
                    if (k === "ancho" || k === "alto" || k === "sillas") {
                        const nAncho = k === "ancho" ? v : m.ancho;
                        const nAlto = k === "alto" ? v : m.alto;
                        const nSillas = k === "sillas" ? v : m.sillas;
                        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$mesa$2d$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["esTamanoValido"])(m, nAncho, nAlto, nSillas)) return m;
                    }
                    return {
                        ...m,
                        [k]: v
                    };
                }
                return m;
            }));
    }, [
        idsSeleccionados
    ]);
    const actualizarDiametro = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((d)=>{
        setMesas((prevMesas)=>prevMesas.map((m)=>{
                if (idsSeleccionados.includes(m.id)) {
                    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$mesa$2d$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["esTamanoValido"])(m, d, d)) return m;
                    return {
                        ...m,
                        ancho: d,
                        alto: d
                    };
                }
                return m;
            }));
    }, [
        idsSeleccionados
    ]);
    const toggleLado = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((lado)=>{
        guardarHistorial();
        setMesas((prevMesas)=>prevMesas.map((m)=>{
                if (idsSeleccionados.includes(m.id)) {
                    const act = m.ladosActivos || [
                        "top",
                        "bottom",
                        "left",
                        "right"
                    ];
                    return {
                        ...m,
                        ladosActivos: act.includes(lado) ? act.filter((l)=>l !== lado) : [
                            ...act,
                            lado
                        ]
                    };
                }
                return m;
            }));
    }, [
        idsSeleccionados,
        guardarHistorial
    ]);
    const confirmarNombreMesa = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        if (!editandoNombreMesa) return;
        setMesas((prev)=>prev.map((m)=>m.id === editandoNombreMesa.id ? {
                    ...m,
                    etiqueta: editandoNombreMesa.valor || m.etiqueta
                } : m));
        setEditandoNombreMesa(null);
    }, [
        editandoNombreMesa
    ]);
    // --- CONFIGURACIÓN INICIAL ---
    const confirmarSectorUnico = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        setSectores([
            {
                id: "S1",
                nombre: configSectorUnico.nombre,
                color: configSectorUnico.color,
                precio: configSectorUnico.precio
            }
        ]);
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
                ladosActivos: [
                    "top",
                    "bottom",
                    "left",
                    "right"
                ],
                bloqueada: false,
                espacioEntreSillas: 50
            }
        ]);
        setTipoMapa("sector");
        setModoConfigurado(true);
        centrarlVista();
    }, [
        configSectorUnico,
        centrarlVista
    ]);
    const iniciarMapaCompleto = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        setTipoMapa("completo");
        setSectores([
            {
                id: "S1",
                nombre: "General",
                color: "#94a3b8",
                precio: 50
            },
            {
                id: "S2",
                nombre: "VIP",
                color: "#8B6FFA",
                precio: 150
            }
        ]);
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
                ladosActivos: [
                    "top",
                    "bottom",
                    "left",
                    "right"
                ],
                bloqueada: false,
                espacioEntreSillas: 50
            }
        ]);
        setModoConfigurado(true);
        centrarlVista();
    }, [
        centrarlVista
    ]);
    // --- INTERACCIONES DEL MOUSE ---
    const alPresionarMouse = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((e, tipo, mesa = null)=>{
        if (herramientaActiva === "mano" || e.button === 1) {
            setIsPanning(true);
            panStart.current = {
                x: e.clientX - pan.x,
                y: e.clientY - pan.y
            };
            return;
        }
        const mousePos = getMousePos(e.clientX, e.clientY);
        if (tipo === "mesa" && mesa) {
            e.stopPropagation();
            if (mesa.bloqueada && !e.shiftKey) {
                setIdsSeleccionados([
                    mesa.id
                ]);
                setPanelActivo("propiedades");
                return;
            }
            tomarSnapshot();
            let nuevosIdsSeleccionados = [
                ...idsSeleccionados
            ];
            if (e.shiftKey) {
                if (idsSeleccionados.includes(mesa.id)) {
                    nuevosIdsSeleccionados = idsSeleccionados.filter((id)=>id !== mesa.id);
                } else {
                    nuevosIdsSeleccionados.push(mesa.id);
                }
            } else {
                if (!idsSeleccionados.includes(mesa.id)) {
                    nuevosIdsSeleccionados = [
                        mesa.id
                    ];
                }
            }
            const mesasParaArrastrar = mesas.filter((m)=>nuevosIdsSeleccionados.includes(m.id));
            const algunaBloqueada = mesasParaArrastrar.some((m)=>m.bloqueada);
            if (algunaBloqueada) {
                setIdsSeleccionados(nuevosIdsSeleccionados);
                setPanelActivo("propiedades");
                return;
            }
            if (e.altKey && nuevosIdsSeleccionados.length > 0) {
                const mesasADuplicar = mesas.filter((m)=>nuevosIdsSeleccionados.includes(m.id));
                const nuevasMesas = [];
                const mapeoIds = {};
                const mesasTemp = [
                    ...mesas
                ];
                mesasADuplicar.forEach((base)=>{
                    const nuevoId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$mesa$2d$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["obtenerSiguienteId"])(mesasTemp);
                    const nuevoNombre = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$mesa$2d$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["obtenerSiguienteNombre"])(base.etiqueta, mesasTemp);
                    const nuevaMesa = {
                        ...base,
                        id: nuevoId,
                        etiqueta: nuevoNombre,
                        bloqueada: false
                    };
                    nuevasMesas.push(nuevaMesa);
                    mesasTemp.push(nuevaMesa);
                    mapeoIds[base.id] = nuevoId;
                });
                setMesas((prev)=>[
                        ...prev,
                        ...nuevasMesas
                    ]);
                const nuevosIds = nuevasMesas.map((m)=>m.id);
                setIdsSeleccionados(nuevosIds);
                nuevosIdsSeleccionados = nuevosIds;
                const offsets = {};
                nuevasMesas.forEach((m)=>{
                    offsets[m.id] = {
                        x: mousePos.x - m.x,
                        y: mousePos.y - m.y
                    };
                });
                setOffsetsMesas(offsets);
                setIdMesaArrastradaPrincipal(mapeoIds[mesa.id]);
                setArrastrandoMesa(true);
                setPanelActivo("propiedades");
                return;
            }
            setIdsSeleccionados(nuevosIdsSeleccionados);
            setArrastrandoMesa(true);
            setPanelActivo("propiedades");
            setIdMesaArrastradaPrincipal(mesa.id);
            const offsets = {};
            mesas.forEach((m)=>{
                if (nuevosIdsSeleccionados.includes(m.id)) {
                    offsets[m.id] = {
                        x: mousePos.x - m.x,
                        y: mousePos.y - m.y
                    };
                }
            });
            setOffsetsMesas(offsets);
        } else if (tipo === "lienzo") {
            if (!e.shiftKey) {
                setIdsSeleccionados([]);
                setCajaSeleccion({
                    startX: mousePos.x,
                    startY: mousePos.y,
                    currentX: mousePos.x,
                    currentY: mousePos.y
                });
                setMenuDescargaAbierto(false);
            } else {
                setCajaSeleccion({
                    startX: mousePos.x,
                    startY: mousePos.y,
                    currentX: mousePos.x,
                    currentY: mousePos.y
                });
            }
        }
    }, [
        herramientaActiva,
        pan,
        getMousePos,
        idsSeleccionados,
        mesas,
        tomarSnapshot
    ]);
    const manejarDobleClickMesa = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((mesa)=>{
        if (mesa.bloqueada || !referenciaSvg.current) return;
        const rect = referenciaSvg.current.getBoundingClientRect();
        const screenX = mesa.x * zoom + pan.x + rect.left;
        const screenY = mesa.y * zoom + pan.y + rect.top - 20;
        setEditandoNombreMesa({
            id: mesa.id,
            x: screenX,
            y: screenY,
            valor: mesa.etiqueta
        });
    }, [
        zoom,
        pan
    ]);
    const alMoverMouse = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((e)=>{
        if (isPanning) {
            setPan({
                x: e.clientX - panStart.current.x,
                y: e.clientY - panStart.current.y
            });
            return;
        }
        const mousePos = getMousePos(e.clientX, e.clientY);
        if (arrastrandoMesa && idsSeleccionados.length > 0) {
            const mesaPrincipal = mesas.find((m)=>m.id === idMesaArrastradaPrincipal);
            if (!mesaPrincipal) return;
            const offsetPrincipal = offsetsMesas[mesaPrincipal.id] || {
                x: 0,
                y: 0
            };
            let nuevoX = mousePos.x - offsetPrincipal.x;
            let nuevoY = mousePos.y - offsetPrincipal.y;
            const otrasMesas = mesas.filter((m)=>!idsSeleccionados.includes(m.id));
            const umbral = __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$canvas$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["UMBRAL_SNAP"] / zoom;
            const nuevasGuias = [];
            const w = mesaPrincipal.ancho * (mesaPrincipal.escala || 1);
            const h = mesaPrincipal.alto * (mesaPrincipal.escala || 1);
            const misPuntosX = {
                c: nuevoX,
                l: nuevoX - w / 2,
                r: nuevoX + w / 2
            };
            const misPuntosY = {
                c: nuevoY,
                t: nuevoY - h / 2,
                b: nuevoY + h / 2
            };
            let snapX = false;
            let snapY = false;
            for (const otra of otrasMesas){
                const ow = otra.ancho * (otra.escala || 1);
                const oh = otra.alto * (otra.escala || 1);
                const objetivosX = [
                    otra.x,
                    otra.x - ow / 2,
                    otra.x + ow / 2
                ];
                if (!snapX) {
                    for (const target of objetivosX){
                        if (Math.abs(misPuntosX.c - target) < umbral) {
                            nuevoX = target;
                            snapX = true;
                            nuevasGuias.push({
                                type: "v",
                                pos: target
                            });
                            break;
                        }
                        if (Math.abs(misPuntosX.l - target) < umbral) {
                            nuevoX = target + w / 2;
                            snapX = true;
                            nuevasGuias.push({
                                type: "v",
                                pos: target
                            });
                            break;
                        }
                        if (Math.abs(misPuntosX.r - target) < umbral) {
                            nuevoX = target - w / 2;
                            snapX = true;
                            nuevasGuias.push({
                                type: "v",
                                pos: target
                            });
                            break;
                        }
                    }
                }
                const objetivosY = [
                    otra.y,
                    otra.y - oh / 2,
                    otra.y + oh / 2
                ];
                if (!snapY) {
                    for (const target of objetivosY){
                        if (Math.abs(misPuntosY.c - target) < umbral) {
                            nuevoY = target;
                            snapY = true;
                            nuevasGuias.push({
                                type: "h",
                                pos: target
                            });
                            break;
                        }
                        if (Math.abs(misPuntosY.t - target) < umbral) {
                            nuevoY = target + h / 2;
                            snapY = true;
                            nuevasGuias.push({
                                type: "h",
                                pos: target
                            });
                            break;
                        }
                        if (Math.abs(misPuntosY.b - target) < umbral) {
                            nuevoY = target - h / 2;
                            snapY = true;
                            nuevasGuias.push({
                                type: "h",
                                pos: target
                            });
                            break;
                        }
                    }
                }
                if (snapX && snapY) break;
            }
            setGuias(nuevasGuias);
            const deltaX = nuevoX - mesaPrincipal.x;
            const deltaY = nuevoY - mesaPrincipal.y;
            setMesas((prev)=>prev.map((m)=>idsSeleccionados.includes(m.id) ? {
                        ...m,
                        x: m.x + deltaX,
                        y: m.y + deltaY
                    } : m));
        } else if (cajaSeleccion) {
            setCajaSeleccion({
                ...cajaSeleccion,
                currentX: mousePos.x,
                currentY: mousePos.y
            });
        }
    }, [
        isPanning,
        getMousePos,
        arrastrandoMesa,
        idsSeleccionados,
        mesas,
        idMesaArrastradaPrincipal,
        offsetsMesas,
        zoom,
        cajaSeleccion
    ]);
    const alSoltarMouse = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        if (cajaSeleccion) {
            const x1 = Math.min(cajaSeleccion.startX, cajaSeleccion.currentX);
            const x2 = Math.max(cajaSeleccion.startX, cajaSeleccion.currentX);
            const y1 = Math.min(cajaSeleccion.startY, cajaSeleccion.currentY);
            const y2 = Math.max(cajaSeleccion.startY, cajaSeleccion.currentY);
            const mesasEnCaja = mesas.filter((m)=>{
                const escala = m.escala || 1;
                const ancho = m.ancho * escala;
                const alto = m.alto * escala;
                const mesaLeft = m.x - ancho / 2;
                const mesaRight = m.x + ancho / 2;
                const mesaTop = m.y - alto / 2;
                const mesaBottom = m.y + alto / 2;
                return !(mesaRight < x1 || mesaLeft > x2 || mesaBottom < y1 || mesaTop > y2);
            }).map((m)=>m.id);
            setIdsSeleccionados((prev)=>[
                    ...new Set([
                        ...prev,
                        ...mesasEnCaja
                    ])
                ]);
            setCajaSeleccion(null);
        }
        if (arrastrandoMesa) {
            confirmarSnapshotSiHuboCambios();
        }
        setArrastrandoMesa(false);
        setIsPanning(false);
        setGuias([]);
        setIdMesaArrastradaPrincipal(null);
    }, [
        cajaSeleccion,
        mesas,
        arrastrandoMesa,
        confirmarSnapshotSiHuboCambios
    ]);
    // --- HANDLERS DE TOUCH (MOBILE) ---
    const getTouchPos = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((clientX, clientY)=>{
        const contenedor = contenedorRef.current;
        if (!contenedor) return {
            x: 0,
            y: 0
        };
        const rect = contenedor.getBoundingClientRect();
        return {
            x: (clientX - rect.left - pan.x) / zoom,
            y: (clientY - rect.top - pan.y) / zoom
        };
    }, [
        pan,
        zoom
    ]);
    const alPresionarTouch = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((e, tipo, mesa = null)=>{
        e.preventDefault();
        const touches = e.touches;
        // Pinch-to-zoom con 2 dedos
        if (touches.length === 2) {
            const dx = touches[0].clientX - touches[1].clientX;
            const dy = touches[0].clientY - touches[1].clientY;
            lastTouchDistance.current = Math.hypot(dx, dy);
            lastTouchCenter.current = {
                x: (touches[0].clientX + touches[1].clientX) / 2,
                y: (touches[0].clientY + touches[1].clientY) / 2
            };
            return;
        }
        // Un solo dedo
        if (touches.length === 1) {
            const touch = touches[0];
            // Si herramienta mano o toque en lienzo sin mesa -> pan
            if (herramientaActiva === "mano" || tipo === "lienzo" && !mesa) {
                setIsPanning(true);
                panStart.current = {
                    x: touch.clientX - pan.x,
                    y: touch.clientY - pan.y
                };
                return;
            }
            const touchPos = getTouchPos(touch.clientX, touch.clientY);
            if (tipo === "mesa" && mesa) {
                e.stopPropagation();
                if (mesa.bloqueada) {
                    setIdsSeleccionados([
                        mesa.id
                    ]);
                    setPanelActivo("propiedades");
                    return;
                }
                tomarSnapshot();
                setIdsSeleccionados([
                    mesa.id
                ]);
                setArrastrandoMesa(true);
                setPanelActivo("propiedades");
                setIdMesaArrastradaPrincipal(mesa.id);
                const offsets = {};
                offsets[mesa.id] = {
                    x: touchPos.x - mesa.x,
                    y: touchPos.y - mesa.y
                };
                setOffsetsMesas(offsets);
            } else if (tipo === "lienzo") {
                setIdsSeleccionados([]);
                setMenuDescargaAbierto(false);
            }
        }
    }, [
        herramientaActiva,
        pan,
        getTouchPos,
        tomarSnapshot
    ]);
    const alMoverTouch = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((e)=>{
        e.preventDefault();
        const touches = e.touches;
        // Pinch-to-zoom
        if (touches.length === 2 && lastTouchDistance.current !== null) {
            const dx = touches[0].clientX - touches[1].clientX;
            const dy = touches[0].clientY - touches[1].clientY;
            const newDistance = Math.hypot(dx, dy);
            const scale = newDistance / lastTouchDistance.current;
            const newZoom = Math.min(Math.max(zoom * scale, 0.1), 3);
            setZoom(newZoom);
            lastTouchDistance.current = newDistance;
            return;
        }
        // Un solo dedo
        if (touches.length === 1) {
            const touch = touches[0];
            if (isPanning) {
                setPan({
                    x: touch.clientX - panStart.current.x,
                    y: touch.clientY - panStart.current.y
                });
                return;
            }
            const touchPos = getTouchPos(touch.clientX, touch.clientY);
            if (arrastrandoMesa && idsSeleccionados.length > 0) {
                const mesaPrincipal = mesas.find((m)=>m.id === idMesaArrastradaPrincipal);
                if (!mesaPrincipal) return;
                const offsetPrincipal = offsetsMesas[mesaPrincipal.id] || {
                    x: 0,
                    y: 0
                };
                let nuevoX = touchPos.x - offsetPrincipal.x;
                let nuevoY = touchPos.y - offsetPrincipal.y;
                // Snap a otras mesas
                const otrasMesas = mesas.filter((m)=>!idsSeleccionados.includes(m.id));
                const umbral = __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$canvas$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["UMBRAL_SNAP"] / zoom;
                const nuevasGuias = [];
                const w = mesaPrincipal.ancho * (mesaPrincipal.escala || 1);
                const h = mesaPrincipal.alto * (mesaPrincipal.escala || 1);
                const misPuntosX = {
                    c: nuevoX,
                    l: nuevoX - w / 2,
                    r: nuevoX + w / 2
                };
                const misPuntosY = {
                    c: nuevoY,
                    t: nuevoY - h / 2,
                    b: nuevoY + h / 2
                };
                let snapX = false;
                let snapY = false;
                for (const otra of otrasMesas){
                    const ow = otra.ancho * (otra.escala || 1);
                    const oh = otra.alto * (otra.escala || 1);
                    const objetivosX = [
                        otra.x,
                        otra.x - ow / 2,
                        otra.x + ow / 2
                    ];
                    if (!snapX) {
                        for (const target of objetivosX){
                            if (Math.abs(misPuntosX.c - target) < umbral) {
                                nuevoX = target;
                                snapX = true;
                                nuevasGuias.push({
                                    type: "v",
                                    pos: target
                                });
                                break;
                            }
                            if (Math.abs(misPuntosX.l - target) < umbral) {
                                nuevoX = target + w / 2;
                                snapX = true;
                                nuevasGuias.push({
                                    type: "v",
                                    pos: target
                                });
                                break;
                            }
                            if (Math.abs(misPuntosX.r - target) < umbral) {
                                nuevoX = target - w / 2;
                                snapX = true;
                                nuevasGuias.push({
                                    type: "v",
                                    pos: target
                                });
                                break;
                            }
                        }
                    }
                    const objetivosY = [
                        otra.y,
                        otra.y - oh / 2,
                        otra.y + oh / 2
                    ];
                    if (!snapY) {
                        for (const target of objetivosY){
                            if (Math.abs(misPuntosY.c - target) < umbral) {
                                nuevoY = target;
                                snapY = true;
                                nuevasGuias.push({
                                    type: "h",
                                    pos: target
                                });
                                break;
                            }
                            if (Math.abs(misPuntosY.t - target) < umbral) {
                                nuevoY = target + h / 2;
                                snapY = true;
                                nuevasGuias.push({
                                    type: "h",
                                    pos: target
                                });
                                break;
                            }
                            if (Math.abs(misPuntosY.b - target) < umbral) {
                                nuevoY = target - h / 2;
                                snapY = true;
                                nuevasGuias.push({
                                    type: "h",
                                    pos: target
                                });
                                break;
                            }
                        }
                    }
                    if (snapX && snapY) break;
                }
                setGuias(nuevasGuias);
                const deltaX = nuevoX - mesaPrincipal.x;
                const deltaY = nuevoY - mesaPrincipal.y;
                setMesas((prev)=>prev.map((m)=>idsSeleccionados.includes(m.id) ? {
                            ...m,
                            x: m.x + deltaX,
                            y: m.y + deltaY
                        } : m));
            }
        }
    }, [
        isPanning,
        getTouchPos,
        arrastrandoMesa,
        idsSeleccionados,
        mesas,
        idMesaArrastradaPrincipal,
        offsetsMesas,
        zoom
    ]);
    const alSoltarTouch = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        lastTouchDistance.current = null;
        lastTouchCenter.current = null;
        if (arrastrandoMesa) {
            confirmarSnapshotSiHuboCambios();
        }
        setArrastrandoMesa(false);
        setIsPanning(false);
        setGuias([]);
    }, [
        arrastrandoMesa,
        confirmarSnapshotSiHuboCambios
    ]);
    // --- IO ---
    const manejarSubidaImagen = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((e)=>{
        const f = e.target.files?.[0];
        if (f) {
            const r = new FileReader();
            r.onload = (ev)=>{
                const i = new Image();
                i.crossOrigin = "anonymous";
                i.onload = ()=>{
                    setImagenFondo(ev.target?.result);
                    setDimensionesImagen({
                        w: i.width,
                        h: i.height
                    });
                };
                i.src = ev.target?.result;
            };
            r.readAsDataURL(f);
        }
    }, []);
    const handleExportarSVG = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        if (referenciaSvg.current) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$export$2d$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["exportarSVG"])(referenciaSvg.current, mesas, imagenFondo, dimensionesImagen, tipoMapa);
            setMenuDescargaAbierto(false);
        }
    }, [
        mesas,
        imagenFondo,
        dimensionesImagen,
        tipoMapa
    ]);
    const handleDescargarJSON = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$export$2d$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["descargarJSON"])(mesas, sectores, tipoMapa, imagenFondo, dimensionesImagen);
        setMenuDescargaAbierto(false);
    }, [
        mesas,
        sectores,
        tipoMapa,
        imagenFondo,
        dimensionesImagen
    ]);
    // --- ATAJOS DE TECLADO ---
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const manejarKeyDown = (e)=>{
            if (e.target.tagName === "INPUT") return;
            console.log("[v0] Key pressed:", e.key, "Code:", e.code, "Shift:", e.shiftKey);
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
                e.preventDefault();
                if (e.shiftKey) rehacer();
                else deshacer();
            }
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
                e.preventDefault();
                rehacer();
            }
            if ((e.ctrlKey || e.metaKey) && e.key === "1") {
                e.preventDefault();
                zoomToFit();
            }
            if ((e.ctrlKey || e.metaKey) && e.key === "2") {
                e.preventDefault();
                zoomToSelection();
            }
            if ((e.ctrlKey || e.metaKey) && e.key === "0") {
                e.preventDefault();
                centrarlVista();
            }
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "l") {
                e.preventDefault();
                toggleBloqueo();
            }
            if (e.key === "Escape") {
                if (mostrarAyudaAtajos) setMostrarAyudaAtajos(false);
                else if (idsSeleccionados.length > 0) setIdsSeleccionados([]);
            }
            if (e.key === "?" || e.key === "¿" || e.code === "Slash" || e.shiftKey && e.key === "/") {
                e.preventDefault();
                setMostrarAyudaAtajos((prev)=>!prev);
            }
            if (e.key === "v") setHerramienta("seleccion");
            if (e.key === "h") setHerramienta("mano");
            if (e.key === " ") {
                e.preventDefault();
                if (herramienta !== "mano") setHerramientaTemporal("mano");
            }
            if ([
                "ArrowUp",
                "ArrowDown",
                "ArrowLeft",
                "ArrowRight"
            ].includes(e.key)) {
                if (idsSeleccionados.length > 0) {
                    const mesasSeleccionadas = mesas.filter((m)=>idsSeleccionados.includes(m.id));
                    if (mesasSeleccionadas.some((m)=>m.bloqueada)) return;
                    e.preventDefault();
                    const distancia = e.shiftKey ? 10 : 1;
                    let deltaX = 0;
                    let deltaY = 0;
                    if (e.key === "ArrowUp") deltaY = -distancia;
                    if (e.key === "ArrowDown") deltaY = distancia;
                    if (e.key === "ArrowLeft") deltaX = -distancia;
                    if (e.key === "ArrowRight") deltaX = distancia;
                    guardarHistorial();
                    setMesas((prev)=>prev.map((m)=>idsSeleccionados.includes(m.id) ? {
                                ...m,
                                x: m.x + deltaX,
                                y: m.y + deltaY
                            } : m));
                }
            }
            if (e.key === "Delete" || e.key === "Backspace") {
                if (idsSeleccionados.length > 0) {
                    guardarHistorial();
                    eliminarSeleccionadas();
                }
            }
            if ((e.ctrlKey || e.metaKey) && e.key === "c") {
                if (idsSeleccionados.length > 0) {
                    const aCopiar = mesas.filter((m)=>idsSeleccionados.includes(m.id));
                    aCopiar.sort((a, b)=>a.y - b.y || a.x - b.x);
                    setMesasPortapapeles(aCopiar);
                }
            }
            if ((e.ctrlKey || e.metaKey) && e.key === "v") {
                if (mesasPortapapeles.length > 0) {
                    guardarHistorial();
                    insertarNuevasMesas(mesasPortapapeles, 20, 20);
                }
            }
            if ((e.ctrlKey || e.metaKey) && e.key === "d") {
                e.preventDefault();
                duplicarMesasSeleccionadas();
            }
            if ((e.ctrlKey || e.metaKey) && e.key === "a") {
                e.preventDefault();
                setIdsSeleccionados(mesas.map((m)=>m.id));
            }
        };
        const manejarKeyUp = (e)=>{
            if (e.key === " ") {
                if (herramientaTemporal === "mano") setHerramientaTemporal(null);
            }
        };
        window.addEventListener("keydown", manejarKeyDown);
        window.addEventListener("keyup", manejarKeyUp);
        return ()=>{
            window.removeEventListener("keydown", manejarKeyDown);
            window.removeEventListener("keyup", manejarKeyUp);
        };
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
        insertarNuevasMesas
    ]);
    // --- WHEEL / ZOOM ---
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const contenedor = contenedorRef.current;
        if (!contenedor) return;
        const handleWheel = (e)=>{
            e.preventDefault();
            if (!referenciaSvg.current) return;
            const rect = referenciaSvg.current.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            if (e.ctrlKey) {
                const scaleFactor = 0.05;
                const direction = -Math.sign(e.deltaY);
                const newZoom = Math.max(0.1, Math.min(5, zoom + direction * scaleFactor));
                const newPanX = mouseX - (mouseX - pan.x) * (newZoom / zoom);
                const newPanY = mouseY - (mouseY - pan.y) * (newZoom / zoom);
                setZoom(newZoom);
                setPan({
                    x: newPanX,
                    y: newPanY
                });
            } else {
                setPan((prev)=>({
                        x: prev.x - e.deltaX,
                        y: prev.y - e.deltaY
                    }));
            }
        };
        contenedor.addEventListener("wheel", handleWheel, {
            passive: false
        });
        return ()=>contenedor.removeEventListener("wheel", handleWheel);
    }, [
        zoom,
        pan
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const preventGlobalZoom = (e)=>{
            if (e.ctrlKey) e.preventDefault();
        };
        document.addEventListener("wheel", preventGlobalZoom, {
            passive: false
        });
        return ()=>document.removeEventListener("wheel", preventGlobalZoom);
    }, []);
    // --- ZOOM TO FIT INICIAL ---
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!vistaCentradaInicial && referenciaSvg.current && mesas.length > 0) {
            const timer = setTimeout(()=>{
                zoomToFit();
                setVistaCentradaInicial(true);
            }, 100);
            return ()=>clearTimeout(timer);
        }
    }, [
        mesas,
        vistaCentradaInicial,
        zoomToFit
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const preventGlobalZoom = (e)=>{
            if (e.ctrlKey) e.preventDefault();
        };
        document.addEventListener("wheel", preventGlobalZoom, {
            passive: false
        });
        return ()=>document.removeEventListener("wheel", preventGlobalZoom);
    }, []);
    // --- FOCUS INPUT NOMBRE ---
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (editandoNombreMesa && inputNombreRef.current) {
            inputNombreRef.current.focus();
            inputNombreRef.current.select();
        }
    }, [
        editandoNombreMesa
    ]);
    // --- VARIABLES CALCULADAS ---
    const mesaActiva = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>idsSeleccionados.length > 0 ? mesas.find((m)=>m.id === idsSeleccionados[idsSeleccionados.length - 1]) || null : null, [
        mesas,
        idsSeleccionados
    ]);
    const hayMesasBloqueadas = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>mesas.filter((m)=>idsSeleccionados.includes(m.id)).some((m)=>m.bloqueada), [
        mesas,
        idsSeleccionados
    ]);
    const limitesSlider = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if (!mesaActiva) return {
            minW: 50,
            minH: 50
        };
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$mesa$2d$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calcularLimites"])(mesaActiva);
    }, [
        mesaActiva
    ]);
    const cursorStyle = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if (herramientaActiva === "mano") return isPanning ? "grabbing" : "grab";
        return "default";
    }, [
        herramientaActiva,
        isPanning
    ]);
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
        limitesSlider
    };
}
}),
"[project]/hooks/use-is-mac.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useIsMac",
    ()=>useIsMac
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
"use client";
;
function useIsMac() {
    const [isMac, setIsMac] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        setIsMac(navigator.platform.toUpperCase().indexOf("MAC") >= 0);
    }, []);
    return isMac;
}
}),
"[project]/components/ui/tooltip-custom.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Tooltip",
    ()=>Tooltip,
    "TooltipProvider",
    ()=>TooltipProvider,
    "formatShortcut",
    ()=>formatShortcut
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$dom$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-dom.js [app-ssr] (ecmascript)");
"use client";
;
;
;
const formatShortcut = (s, isMac)=>{
    if (isMac) {
        return s.replace(/Ctrl/g, "⌘").replace(/Alt/g, "⌥").replace(/Shift/g, "⇧").replace(/Delete/g, "⌫");
    }
    return s;
};
function TooltipProvider({ children }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: children
    }, void 0, false);
}
function Tooltip({ children, label, shortcut, isMac, position = "top" }) {
    const [show, setShow] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [coords, setCoords] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        x: 0,
        y: 0
    });
    const triggerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const handleMouseEnter = ()=>{
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            let x = 0;
            let y = 0;
            switch(position){
                case "top":
                    x = rect.left + rect.width / 2;
                    y = rect.top - 8;
                    break;
                case "bottom":
                    x = rect.left + rect.width / 2;
                    y = rect.bottom + 8;
                    break;
                case "left":
                    x = rect.left - 8;
                    y = rect.top + rect.height / 2;
                    break;
                case "right":
                    x = rect.right + 8;
                    y = rect.top + rect.height / 2;
                    break;
            }
            setCoords({
                x,
                y
            });
        }
        setShow(true);
    };
    const getTransformStyle = ()=>{
        switch(position){
            case "top":
                return "translate(-50%, -100%)";
            case "bottom":
                return "translate(-50%, 0)";
            case "left":
                return "translate(-100%, -50%)";
            case "right":
                return "translate(0, -50%)";
        }
    };
    const getArrowStyle = ()=>{
        const base = "absolute w-0 h-0 border-[6px]";
        switch(position){
            case "top":
                return `${base} left-1/2 -translate-x-1/2 top-full border-t-slate-800 border-l-transparent border-r-transparent border-b-transparent`;
            case "bottom":
                return `${base} left-1/2 -translate-x-1/2 bottom-full border-b-slate-800 border-l-transparent border-r-transparent border-t-transparent`;
            case "left":
                return `${base} top-1/2 -translate-y-1/2 left-full border-l-slate-800 border-t-transparent border-b-transparent border-r-transparent`;
            case "right":
                return `${base} top-1/2 -translate-y-1/2 right-full border-r-slate-800 border-t-transparent border-b-transparent border-l-transparent`;
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: triggerRef,
        className: "relative inline-flex",
        onMouseEnter: handleMouseEnter,
        onMouseLeave: ()=>setShow(false),
        children: [
            children,
            show && ("TURBOPACK compile-time value", "undefined") !== "undefined" && /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$dom$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].createPortal(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed px-2 py-1 bg-slate-800 text-white text-xs rounded whitespace-nowrap z-[99999] pointer-events-none",
                style: {
                    left: coords.x,
                    top: coords.y,
                    transform: getTransformStyle()
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-1.5",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: label
                            }, void 0, false, {
                                fileName: "[project]/components/ui/tooltip-custom.tsx",
                                lineNumber: 113,
                                columnNumber: 15
                            }, this),
                            shortcut && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("kbd", {
                                className: "px-1 py-0.5 bg-slate-700 rounded text-[10px] font-mono",
                                children: formatShortcut(shortcut, isMac)
                            }, void 0, false, {
                                fileName: "[project]/components/ui/tooltip-custom.tsx",
                                lineNumber: 115,
                                columnNumber: 17
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/ui/tooltip-custom.tsx",
                        lineNumber: 112,
                        columnNumber: 13
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: getArrowStyle()
                    }, void 0, false, {
                        fileName: "[project]/components/ui/tooltip-custom.tsx",
                        lineNumber: 120,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/ui/tooltip-custom.tsx",
                lineNumber: 104,
                columnNumber: 11
            }, this), document.body)
        ]
    }, void 0, true, {
        fileName: "[project]/components/ui/tooltip-custom.tsx",
        lineNumber: 94,
        columnNumber: 5
    }, this);
}
;
}),
"[project]/components/sidebar/sidebar-izquierda.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SidebarIzquierda",
    ()=>SidebarIzquierda
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mouse$2d$pointer$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MousePointer2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/mouse-pointer-2.js [app-ssr] (ecmascript) <export default as MousePointer2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$hand$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Hand$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/hand.js [app-ssr] (ecmascript) <export default as Hand>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$download$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Download$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/download.js [app-ssr] (ecmascript) <export default as Download>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$image$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ImageIcon$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/image.js [app-ssr] (ecmascript) <export default as ImageIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__XCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-x.js [app-ssr] (ecmascript) <export default as XCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layers$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Layers$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/layers.js [app-ssr] (ecmascript) <export default as Layers>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$pen$2d$line$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Edit3$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/pen-line.js [app-ssr] (ecmascript) <export default as Edit3>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$json$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FileJson$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/file-json.js [app-ssr] (ecmascript) <export default as FileJson>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$image$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FileImage$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/file-image.js [app-ssr] (ecmascript) <export default as FileImage>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$help$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__HelpCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-help.js [app-ssr] (ecmascript) <export default as HelpCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$tooltip$2d$custom$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/tooltip-custom.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
const MesaRedondaIcon = ()=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        width: "20",
        height: "20",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                cx: "12",
                cy: "12",
                r: "5"
            }, void 0, false, {
                fileName: "[project]/components/sidebar/sidebar-izquierda.tsx",
                lineNumber: 29,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                cx: "12",
                cy: "4",
                r: "1.5"
            }, void 0, false, {
                fileName: "[project]/components/sidebar/sidebar-izquierda.tsx",
                lineNumber: 31,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                cx: "18.5",
                cy: "8",
                r: "1.5"
            }, void 0, false, {
                fileName: "[project]/components/sidebar/sidebar-izquierda.tsx",
                lineNumber: 32,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                cx: "18.5",
                cy: "16",
                r: "1.5"
            }, void 0, false, {
                fileName: "[project]/components/sidebar/sidebar-izquierda.tsx",
                lineNumber: 33,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                cx: "12",
                cy: "20",
                r: "1.5"
            }, void 0, false, {
                fileName: "[project]/components/sidebar/sidebar-izquierda.tsx",
                lineNumber: 34,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                cx: "5.5",
                cy: "16",
                r: "1.5"
            }, void 0, false, {
                fileName: "[project]/components/sidebar/sidebar-izquierda.tsx",
                lineNumber: 35,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                cx: "5.5",
                cy: "8",
                r: "1.5"
            }, void 0, false, {
                fileName: "[project]/components/sidebar/sidebar-izquierda.tsx",
                lineNumber: 36,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/components/sidebar/sidebar-izquierda.tsx",
        lineNumber: 18,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0));
const MesaRectangularIcon = ()=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        width: "20",
        height: "20",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                x: "6",
                y: "8",
                width: "12",
                height: "8",
                rx: "1"
            }, void 0, false, {
                fileName: "[project]/components/sidebar/sidebar-izquierda.tsx",
                lineNumber: 52,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                x: "7",
                y: "3",
                width: "3",
                height: "3",
                rx: "0.5"
            }, void 0, false, {
                fileName: "[project]/components/sidebar/sidebar-izquierda.tsx",
                lineNumber: 54,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                x: "14",
                y: "3",
                width: "3",
                height: "3",
                rx: "0.5"
            }, void 0, false, {
                fileName: "[project]/components/sidebar/sidebar-izquierda.tsx",
                lineNumber: 55,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                x: "7",
                y: "18",
                width: "3",
                height: "3",
                rx: "0.5"
            }, void 0, false, {
                fileName: "[project]/components/sidebar/sidebar-izquierda.tsx",
                lineNumber: 57,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                x: "14",
                y: "18",
                width: "3",
                height: "3",
                rx: "0.5"
            }, void 0, false, {
                fileName: "[project]/components/sidebar/sidebar-izquierda.tsx",
                lineNumber: 58,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/components/sidebar/sidebar-izquierda.tsx",
        lineNumber: 41,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0));
function SidebarIzquierda({ isMac, herramienta, setHerramienta, agregarMesa, tipoMapa, panelActivo, setPanelActivo, imagenFondo, onSubirImagen, onQuitarImagen, menuDescargaAbierto, setMenuDescargaAbierto, onExportarSVG, onDescargarJSON, onMostrarAyuda }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$tooltip$2d$custom$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TooltipProvider"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "fixed left-0 top-0 h-full w-16 bg-white/90 backdrop-blur-lg shadow-xl flex flex-col items-center py-4 z-30",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "w-full px-2 pb-3 flex flex-col items-center gap-1",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$tooltip$2d$custom$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Tooltip"], {
                            label: "Seleccionar y Mover",
                            shortcut: "V",
                            isMac: isMac,
                            position: "right",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setHerramienta("seleccion"),
                                className: `w-10 h-10 rounded-lg flex items-center justify-center transition-all ${herramienta === "seleccion" ? "bg-indigo-100 text-indigo-600 ring-2 ring-indigo-200" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"}`,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mouse$2d$pointer$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MousePointer2$3e$__["MousePointer2"], {
                                    size: 18
                                }, void 0, false, {
                                    fileName: "[project]/components/sidebar/sidebar-izquierda.tsx",
                                    lineNumber: 111,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/sidebar/sidebar-izquierda.tsx",
                                lineNumber: 103,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/components/sidebar/sidebar-izquierda.tsx",
                            lineNumber: 102,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$tooltip$2d$custom$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Tooltip"], {
                            label: "Modo Mano",
                            shortcut: "H",
                            isMac: isMac,
                            position: "right",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setHerramienta("mano"),
                                className: `w-10 h-10 rounded-lg flex items-center justify-center transition-all ${herramienta === "mano" ? "bg-indigo-100 text-indigo-600 ring-2 ring-indigo-200" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"}`,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$hand$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Hand$3e$__["Hand"], {
                                    size: 18
                                }, void 0, false, {
                                    fileName: "[project]/components/sidebar/sidebar-izquierda.tsx",
                                    lineNumber: 123,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/sidebar/sidebar-izquierda.tsx",
                                lineNumber: 115,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/components/sidebar/sidebar-izquierda.tsx",
                            lineNumber: 114,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/sidebar/sidebar-izquierda.tsx",
                    lineNumber: 101,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "w-10 h-px bg-slate-200 mb-3"
                }, void 0, false, {
                    fileName: "[project]/components/sidebar/sidebar-izquierda.tsx",
                    lineNumber: 129,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "w-full px-2 pb-3 flex flex-col items-center gap-1",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$tooltip$2d$custom$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Tooltip"], {
                            label: "Agregar Mesa Redonda",
                            isMac: isMac,
                            position: "right",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>agregarMesa("circulo"),
                                className: "w-10 h-10 rounded-lg flex items-center justify-center transition-all text-slate-400 hover:text-indigo-600 hover:bg-indigo-50",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(MesaRedondaIcon, {}, void 0, false, {
                                    fileName: "[project]/components/sidebar/sidebar-izquierda.tsx",
                                    lineNumber: 138,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/sidebar/sidebar-izquierda.tsx",
                                lineNumber: 134,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/components/sidebar/sidebar-izquierda.tsx",
                            lineNumber: 133,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$tooltip$2d$custom$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Tooltip"], {
                            label: "Agregar Mesa Rectangular",
                            isMac: isMac,
                            position: "right",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>agregarMesa("cuadrado"),
                                className: "w-10 h-10 rounded-lg flex items-center justify-center transition-all text-slate-400 hover:text-indigo-600 hover:bg-indigo-50",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(MesaRectangularIcon, {}, void 0, false, {
                                    fileName: "[project]/components/sidebar/sidebar-izquierda.tsx",
                                    lineNumber: 146,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/sidebar/sidebar-izquierda.tsx",
                                lineNumber: 142,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/components/sidebar/sidebar-izquierda.tsx",
                            lineNumber: 141,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/sidebar/sidebar-izquierda.tsx",
                    lineNumber: 132,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "w-10 h-px bg-slate-200 mb-3"
                }, void 0, false, {
                    fileName: "[project]/components/sidebar/sidebar-izquierda.tsx",
                    lineNumber: 152,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "w-full px-2 pb-3 flex flex-col items-center gap-1",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$tooltip$2d$custom$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Tooltip"], {
                        label: "Gestionar Sectores",
                        isMac: isMac,
                        position: "right",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: ()=>setPanelActivo("sectores"),
                            className: `w-10 h-10 rounded-lg flex items-center justify-center transition-all ${panelActivo === "sectores" ? "bg-indigo-100 text-indigo-600 ring-2 ring-indigo-200" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"}`,
                            children: tipoMapa === "completo" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layers$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Layers$3e$__["Layers"], {
                                size: 18
                            }, void 0, false, {
                                fileName: "[project]/components/sidebar/sidebar-izquierda.tsx",
                                lineNumber: 165,
                                columnNumber: 42
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$pen$2d$line$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Edit3$3e$__["Edit3"], {
                                size: 18
                            }, void 0, false, {
                                fileName: "[project]/components/sidebar/sidebar-izquierda.tsx",
                                lineNumber: 165,
                                columnNumber: 65
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/components/sidebar/sidebar-izquierda.tsx",
                            lineNumber: 157,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/sidebar/sidebar-izquierda.tsx",
                        lineNumber: 156,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/components/sidebar/sidebar-izquierda.tsx",
                    lineNumber: 155,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "w-10 h-px bg-slate-200 mb-3"
                }, void 0, false, {
                    fileName: "[project]/components/sidebar/sidebar-izquierda.tsx",
                    lineNumber: 171,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "w-full px-2 flex flex-col items-center",
                    children: !imagenFondo ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$tooltip$2d$custom$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Tooltip"], {
                        label: "Añadir Imagen de Fondo",
                        isMac: isMac,
                        position: "right",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: onSubirImagen,
                            className: "w-10 h-10 rounded-lg flex items-center justify-center transition-all text-slate-400 hover:text-indigo-600 hover:bg-indigo-50",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$image$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ImageIcon$3e$__["ImageIcon"], {
                                size: 18
                            }, void 0, false, {
                                fileName: "[project]/components/sidebar/sidebar-izquierda.tsx",
                                lineNumber: 181,
                                columnNumber: 17
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/components/sidebar/sidebar-izquierda.tsx",
                            lineNumber: 177,
                            columnNumber: 15
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/sidebar/sidebar-izquierda.tsx",
                        lineNumber: 176,
                        columnNumber: 13
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$tooltip$2d$custom$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Tooltip"], {
                        label: "Quitar Imagen de Fondo",
                        isMac: isMac,
                        position: "right",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: onQuitarImagen,
                            className: "w-10 h-10 rounded-lg flex items-center justify-center transition-all text-red-400 hover:text-red-600 hover:bg-red-50",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__XCircle$3e$__["XCircle"], {
                                size: 18
                            }, void 0, false, {
                                fileName: "[project]/components/sidebar/sidebar-izquierda.tsx",
                                lineNumber: 190,
                                columnNumber: 17
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/components/sidebar/sidebar-izquierda.tsx",
                            lineNumber: 186,
                            columnNumber: 15
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/sidebar/sidebar-izquierda.tsx",
                        lineNumber: 185,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/components/sidebar/sidebar-izquierda.tsx",
                    lineNumber: 174,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex-1"
                }, void 0, false, {
                    fileName: "[project]/components/sidebar/sidebar-izquierda.tsx",
                    lineNumber: 197,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-col gap-1 relative w-full px-2 pb-2",
                    children: [
                        menuDescargaAbierto && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "absolute bottom-full left-2 mb-2 w-48 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-in slide-in-from-bottom-2 fade-in duration-200 z-50",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: onExportarSVG,
                                    className: "w-full text-left px-4 py-3 hover:bg-slate-50 flex items-center gap-3 text-xs font-medium text-slate-600 transition-colors border-b border-slate-100",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "p-1.5 bg-indigo-50 text-indigo-600 rounded",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$image$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FileImage$3e$__["FileImage"], {
                                                size: 16
                                            }, void 0, false, {
                                                fileName: "[project]/components/sidebar/sidebar-izquierda.tsx",
                                                lineNumber: 208,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/components/sidebar/sidebar-izquierda.tsx",
                                            lineNumber: 207,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "block font-bold text-slate-800",
                                                    children: "Imagen SVG"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/sidebar/sidebar-izquierda.tsx",
                                                    lineNumber: 211,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "block text-[10px] text-slate-400",
                                                    children: "Para web e impresión"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/sidebar/sidebar-izquierda.tsx",
                                                    lineNumber: 212,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/sidebar/sidebar-izquierda.tsx",
                                            lineNumber: 210,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/sidebar/sidebar-izquierda.tsx",
                                    lineNumber: 203,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: onDescargarJSON,
                                    className: "w-full text-left px-4 py-3 hover:bg-slate-50 flex items-center gap-3 text-xs font-medium text-slate-600 transition-colors",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "p-1.5 bg-emerald-50 text-emerald-600 rounded",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$json$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FileJson$3e$__["FileJson"], {
                                                size: 16
                                            }, void 0, false, {
                                                fileName: "[project]/components/sidebar/sidebar-izquierda.tsx",
                                                lineNumber: 220,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/components/sidebar/sidebar-izquierda.tsx",
                                            lineNumber: 219,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "block font-bold text-slate-800",
                                                    children: "Datos JSON"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/sidebar/sidebar-izquierda.tsx",
                                                    lineNumber: 223,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "block text-[10px] text-slate-400",
                                                    children: "Guardar proyecto editable"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/sidebar/sidebar-izquierda.tsx",
                                                    lineNumber: 224,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/sidebar/sidebar-izquierda.tsx",
                                            lineNumber: 222,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/sidebar/sidebar-izquierda.tsx",
                                    lineNumber: 215,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/sidebar/sidebar-izquierda.tsx",
                            lineNumber: 202,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$tooltip$2d$custom$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Tooltip"], {
                            label: "Exportar Plano",
                            isMac: isMac,
                            position: "right",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setMenuDescargaAbierto(!menuDescargaAbierto),
                                className: `w-10 h-10 mx-auto rounded-lg flex items-center justify-center transition-all ${menuDescargaAbierto ? "bg-indigo-100 text-indigo-600 ring-2 ring-indigo-200" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"}`,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$download$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Download$3e$__["Download"], {
                                    size: 18
                                }, void 0, false, {
                                    fileName: "[project]/components/sidebar/sidebar-izquierda.tsx",
                                    lineNumber: 239,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/sidebar/sidebar-izquierda.tsx",
                                lineNumber: 231,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/components/sidebar/sidebar-izquierda.tsx",
                            lineNumber: 230,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$tooltip$2d$custom$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Tooltip"], {
                            label: "Mostrar Atajos",
                            shortcut: "?",
                            isMac: isMac,
                            position: "right",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: onMostrarAyuda,
                                className: "w-10 h-10 mx-auto rounded-lg flex items-center justify-center transition-all text-slate-400 hover:text-slate-600 hover:bg-slate-50",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$help$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__HelpCircle$3e$__["HelpCircle"], {
                                    size: 18
                                }, void 0, false, {
                                    fileName: "[project]/components/sidebar/sidebar-izquierda.tsx",
                                    lineNumber: 248,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/sidebar/sidebar-izquierda.tsx",
                                lineNumber: 244,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/components/sidebar/sidebar-izquierda.tsx",
                            lineNumber: 243,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/sidebar/sidebar-izquierda.tsx",
                    lineNumber: 200,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/sidebar/sidebar-izquierda.tsx",
            lineNumber: 99,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/sidebar/sidebar-izquierda.tsx",
        lineNumber: 98,
        columnNumber: 5
    }, this);
}
}),
"[project]/lib/utils.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "cn",
    ()=>cn
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/clsx/dist/clsx.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/tailwind-merge/dist/bundle-mjs.mjs [app-ssr] (ecmascript)");
;
;
function cn(...inputs) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["twMerge"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["clsx"])(inputs));
}
}),
"[project]/components/ui/card.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Card",
    ()=>Card,
    "CardAction",
    ()=>CardAction,
    "CardContent",
    ()=>CardContent,
    "CardDescription",
    ()=>CardDescription,
    "CardFooter",
    ()=>CardFooter,
    "CardHeader",
    ()=>CardHeader,
    "CardTitle",
    ()=>CardTitle
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-ssr] (ecmascript)");
;
;
function Card({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])('bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/card.tsx",
        lineNumber: 7,
        columnNumber: 5
    }, this);
}
function CardHeader({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card-header",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])('@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/card.tsx",
        lineNumber: 20,
        columnNumber: 5
    }, this);
}
function CardTitle({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card-title",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])('leading-none font-semibold', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/card.tsx",
        lineNumber: 33,
        columnNumber: 5
    }, this);
}
function CardDescription({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card-description",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])('text-muted-foreground text-sm', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/card.tsx",
        lineNumber: 43,
        columnNumber: 5
    }, this);
}
function CardAction({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card-action",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])('col-start-2 row-span-2 row-start-1 self-start justify-self-end', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/card.tsx",
        lineNumber: 53,
        columnNumber: 5
    }, this);
}
function CardContent({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card-content",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])('px-6', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/card.tsx",
        lineNumber: 66,
        columnNumber: 5
    }, this);
}
function CardFooter({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card-footer",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])('flex items-center px-6 [.border-t]:pt-6', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/card.tsx",
        lineNumber: 76,
        columnNumber: 5
    }, this);
}
;
}),
"[project]/components/ui/button.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Button",
    ()=>Button,
    "buttonVariants",
    ()=>buttonVariants
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slot$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@radix-ui/react-slot/dist/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/class-variance-authority/dist/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-ssr] (ecmascript)");
;
;
;
;
const buttonVariants = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cva"])("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive", {
    variants: {
        variant: {
            default: 'bg-primary text-primary-foreground hover:bg-primary/90',
            destructive: 'bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
            outline: 'border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50',
            secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
            ghost: 'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
            link: 'text-primary underline-offset-4 hover:underline'
        },
        size: {
            default: 'h-9 px-4 py-2 has-[>svg]:px-3',
            sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
            lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
            icon: 'size-9',
            'icon-sm': 'size-8',
            'icon-lg': 'size-10'
        }
    },
    defaultVariants: {
        variant: 'default',
        size: 'default'
    }
});
function Button({ className, variant, size, asChild = false, ...props }) {
    const Comp = asChild ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slot$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Slot"] : 'button';
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Comp, {
        "data-slot": "button",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])(buttonVariants({
            variant,
            size,
            className
        })),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/button.tsx",
        lineNumber: 52,
        columnNumber: 5
    }, this);
}
;
}),
"[project]/components/ui/input.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Input",
    ()=>Input
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-ssr] (ecmascript)");
;
;
function Input({ className, type, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
        type: type,
        "data-slot": "input",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])('file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm', 'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]', 'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/input.tsx",
        lineNumber: 7,
        columnNumber: 5
    }, this);
}
;
}),
"[project]/components/ui/label.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Label",
    ()=>Label
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$label$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@radix-ui/react-label/dist/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
function Label({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$label$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Root"], {
        "data-slot": "label",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])('flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/label.tsx",
        lineNumber: 13,
        columnNumber: 5
    }, this);
}
;
}),
"[project]/components/modals/modal-configuracion.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ModalConfiguracion",
    ()=>ModalConfiguracion
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/arrow-left.js [app-ssr] (ecmascript) <export default as ArrowLeft>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/check.js [app-ssr] (ecmascript) <export default as Check>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layout$2d$grid$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__LayoutGrid$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/layout-grid.js [app-ssr] (ecmascript) <export default as LayoutGrid>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Map$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/map.js [app-ssr] (ecmascript) <export default as Map>");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/card.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/button.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/input.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/label.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
function ModalConfiguracion({ pasoModal, setPasoModal, configSectorUnico, setConfigSectorUnico, onConfirmarSectorUnico, onIniciarMapaCompleto }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 bg-white flex items-center justify-center z-50 p-4",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "max-w-lg w-full",
            children: [
                pasoModal === "seleccion" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "space-y-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-center mb-8",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                className: "text-2xl font-semibold text-foreground",
                                children: "Selecciona el tipo de mapa"
                            }, void 0, false, {
                                fileName: "[project]/components/modals/modal-configuracion.tsx",
                                lineNumber: 32,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/components/modals/modal-configuracion.tsx",
                            lineNumber: 31,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid grid-cols-2 gap-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Card"], {
                                    className: "cursor-pointer hover:border-primary hover:shadow-md transition-all group",
                                    onClick: onIniciarMapaCompleto,
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CardContent"], {
                                        className: "p-6 flex flex-col items-center text-center gap-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "p-4 bg-primary/10 text-primary rounded-xl group-hover:bg-primary group-hover:text-primary-foreground transition-colors",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Map$3e$__["Map"], {
                                                    size: 32
                                                }, void 0, false, {
                                                    fileName: "[project]/components/modals/modal-configuracion.tsx",
                                                    lineNumber: 43,
                                                    columnNumber: 21
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/components/modals/modal-configuracion.tsx",
                                                lineNumber: 42,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "font-medium text-foreground",
                                                children: "Mapa Completo"
                                            }, void 0, false, {
                                                fileName: "[project]/components/modals/modal-configuracion.tsx",
                                                lineNumber: 45,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/modals/modal-configuracion.tsx",
                                        lineNumber: 41,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/components/modals/modal-configuracion.tsx",
                                    lineNumber: 37,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Card"], {
                                    className: "cursor-pointer hover:border-primary hover:shadow-md transition-all group",
                                    onClick: ()=>setPasoModal("configurar_unico"),
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CardContent"], {
                                        className: "p-6 flex flex-col items-center text-center gap-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "p-4 bg-primary/10 text-primary rounded-xl group-hover:bg-primary group-hover:text-primary-foreground transition-colors",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layout$2d$grid$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__LayoutGrid$3e$__["LayoutGrid"], {
                                                    size: 32
                                                }, void 0, false, {
                                                    fileName: "[project]/components/modals/modal-configuracion.tsx",
                                                    lineNumber: 56,
                                                    columnNumber: 21
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/components/modals/modal-configuracion.tsx",
                                                lineNumber: 55,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "font-medium text-foreground",
                                                children: "Mapa por Sector"
                                            }, void 0, false, {
                                                fileName: "[project]/components/modals/modal-configuracion.tsx",
                                                lineNumber: 58,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/modals/modal-configuracion.tsx",
                                        lineNumber: 54,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/components/modals/modal-configuracion.tsx",
                                    lineNumber: 50,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/modals/modal-configuracion.tsx",
                            lineNumber: 35,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/modals/modal-configuracion.tsx",
                    lineNumber: 30,
                    columnNumber: 11
                }, this),
                pasoModal === "configurar_unico" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Card"], {
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CardContent"], {
                        className: "p-6 space-y-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                                        variant: "ghost",
                                        size: "sm",
                                        onClick: ()=>setPasoModal("seleccion"),
                                        className: "p-0 h-auto hover:bg-transparent",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft$3e$__["ArrowLeft"], {
                                            size: 18,
                                            className: "text-muted-foreground"
                                        }, void 0, false, {
                                            fileName: "[project]/components/modals/modal-configuracion.tsx",
                                            lineNumber: 75,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/components/modals/modal-configuracion.tsx",
                                        lineNumber: 69,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: "text-lg font-semibold text-foreground",
                                        children: "Configurar Sector"
                                    }, void 0, false, {
                                        fileName: "[project]/components/modals/modal-configuracion.tsx",
                                        lineNumber: 77,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/modals/modal-configuracion.tsx",
                                lineNumber: 68,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "space-y-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Label"], {
                                                htmlFor: "nombre",
                                                children: "Nombre del sector"
                                            }, void 0, false, {
                                                fileName: "[project]/components/modals/modal-configuracion.tsx",
                                                lineNumber: 82,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Input"], {
                                                id: "nombre",
                                                type: "text",
                                                value: configSectorUnico.nombre,
                                                onChange: (e)=>setConfigSectorUnico({
                                                        ...configSectorUnico,
                                                        nombre: e.target.value
                                                    }),
                                                placeholder: "Ej: VIP, General, Preferencia"
                                            }, void 0, false, {
                                                fileName: "[project]/components/modals/modal-configuracion.tsx",
                                                lineNumber: 83,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/modals/modal-configuracion.tsx",
                                        lineNumber: 81,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "grid grid-cols-2 gap-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "space-y-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Label"], {
                                                        htmlFor: "color",
                                                        children: "Color"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/modals/modal-configuracion.tsx",
                                                        lineNumber: 94,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center gap-2 border rounded-md p-2 h-10",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                id: "color",
                                                                type: "color",
                                                                value: configSectorUnico.color,
                                                                onChange: (e)=>setConfigSectorUnico({
                                                                        ...configSectorUnico,
                                                                        color: e.target.value
                                                                    }),
                                                                className: "h-6 w-6 rounded cursor-pointer bg-transparent border-none"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/modals/modal-configuracion.tsx",
                                                                lineNumber: 96,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-sm text-muted-foreground font-mono",
                                                                children: configSectorUnico.color
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/modals/modal-configuracion.tsx",
                                                                lineNumber: 103,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/modals/modal-configuracion.tsx",
                                                        lineNumber: 95,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/modals/modal-configuracion.tsx",
                                                lineNumber: 93,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "space-y-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Label"], {
                                                        htmlFor: "precio",
                                                        children: "Precio (Bs.)"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/modals/modal-configuracion.tsx",
                                                        lineNumber: 107,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Input"], {
                                                        id: "precio",
                                                        type: "number",
                                                        value: configSectorUnico.precio,
                                                        onChange: (e)=>setConfigSectorUnico({
                                                                ...configSectorUnico,
                                                                precio: Number.parseInt(e.target.value) || 0
                                                            })
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/modals/modal-configuracion.tsx",
                                                        lineNumber: 108,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/modals/modal-configuracion.tsx",
                                                lineNumber: 106,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/modals/modal-configuracion.tsx",
                                        lineNumber: 92,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                                        onClick: onConfirmarSectorUnico,
                                        className: "w-full mt-4",
                                        children: [
                                            "Comenzar ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__["Check"], {
                                                size: 18,
                                                className: "ml-2"
                                            }, void 0, false, {
                                                fileName: "[project]/components/modals/modal-configuracion.tsx",
                                                lineNumber: 120,
                                                columnNumber: 28
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/modals/modal-configuracion.tsx",
                                        lineNumber: 119,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/modals/modal-configuracion.tsx",
                                lineNumber: 80,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/modals/modal-configuracion.tsx",
                        lineNumber: 67,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/components/modals/modal-configuracion.tsx",
                    lineNumber: 66,
                    columnNumber: 11
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/modals/modal-configuracion.tsx",
            lineNumber: 28,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/modals/modal-configuracion.tsx",
        lineNumber: 27,
        columnNumber: 5
    }, this);
}
}),
"[project]/components/panels/panel-propiedades.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PanelPropiedades",
    ()=>PanelPropiedades
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$tooltip$2d$custom$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/tooltip-custom.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$copy$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Copy$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/copy.js [app-ssr] (ecmascript) <export default as Copy>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trash-2.js [app-ssr] (ecmascript) <export default as Trash2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lock$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Lock$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/lock.js [app-ssr] (ecmascript) <export default as Lock>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lock$2d$open$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Unlock$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/lock-open.js [app-ssr] (ecmascript) <export default as Unlock>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$up$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronUp$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-up.js [app-ssr] (ecmascript) <export default as ChevronUp>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-down.js [app-ssr] (ecmascript) <export default as ChevronDown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-left.js [app-ssr] (ecmascript) <export default as ChevronLeft>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-right.js [app-ssr] (ecmascript) <export default as ChevronRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-ssr] (ecmascript) <export default as X>");
"use client";
;
;
;
const tieneMasDeUnaSillaPorLado = (mesa)=>{
    if (mesa.forma === "circulo") {
        return mesa.sillas > 1;
    }
    const lados = mesa.ladosActivos || [
        "top",
        "bottom",
        "left",
        "right"
    ];
    const ladosActivos = [
        {
            id: "top",
            l: mesa.ancho
        },
        {
            id: "bottom",
            l: mesa.ancho
        },
        {
            id: "right",
            l: mesa.alto
        },
        {
            id: "left",
            l: mesa.alto
        }
    ].filter((k)=>lados.includes(k.id));
    if (ladosActivos.length === 0) return false;
    const pTotal = ladosActivos.reduce((a, b)=>a + b.l, 0);
    let asg = 0;
    const dist = ladosActivos.map((l)=>{
        const c = Math.floor(l.l / pTotal * mesa.sillas);
        const r = l.l / pTotal * mesa.sillas - c;
        asg += c;
        return {
            ...l,
            c,
            r
        };
    });
    dist.sort((a, b)=>b.r - a.r);
    for(let i = 0; i < mesa.sillas - asg; i++)if (dist[i]) dist[i].c++;
    // Retorna true si algún lado tiene más de 1 silla
    return dist.some((d)=>d.c > 1);
};
function PanelPropiedades({ panelActivo, setPanelActivo, mesaActiva, idsSeleccionados, sectores, tipoMapa, hayMesasBloqueadas, limitesSlider, onToggleBloqueo, onDuplicar, onEliminar, onEditarNombre, onActualizarMesa, onActualizarDiametro, onToggleLado, onAgregarSector, onActualizarSector, onEliminarSector, onGuardarHistorial }) {
    if (!panelActivo || !mesaActiva) {
        return null;
    }
    const mostrarEspacioSillas = tieneMasDeUnaSillaPorLado(mesaActiva);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "w-72 bg-white border-l border-slate-200 flex flex-col h-full shadow-lg",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "p-4 border-b border-slate-100",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex justify-between items-center mb-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-3",
                                children: [
                                    hayMesasBloqueadas && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "w-5 h-5 rounded bg-amber-100 flex items-center justify-center",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lock$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Lock$3e$__["Lock"], {
                                            size: 10,
                                            className: "text-amber-600"
                                        }, void 0, false, {
                                            fileName: "[project]/components/panels/panel-propiedades.tsx",
                                            lineNumber: 95,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/components/panels/panel-propiedades.tsx",
                                        lineNumber: 94,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                className: "font-semibold text-slate-800 text-sm",
                                                children: idsSeleccionados.length > 1 ? `${idsSeleccionados.length} mesas` : mesaActiva.etiqueta
                                            }, void 0, false, {
                                                fileName: "[project]/components/panels/panel-propiedades.tsx",
                                                lineNumber: 99,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-xs text-slate-400",
                                                children: idsSeleccionados.length > 1 ? "Edición múltiple" : `ID: ${mesaActiva.id}`
                                            }, void 0, false, {
                                                fileName: "[project]/components/panels/panel-propiedades.tsx",
                                                lineNumber: 102,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/panels/panel-propiedades.tsx",
                                        lineNumber: 98,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/panels/panel-propiedades.tsx",
                                lineNumber: 92,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setPanelActivo(false),
                                className: "p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                    size: 16
                                }, void 0, false, {
                                    fileName: "[project]/components/panels/panel-propiedades.tsx",
                                    lineNumber: 111,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/panels/panel-propiedades.tsx",
                                lineNumber: 107,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/panels/panel-propiedades.tsx",
                        lineNumber: 91,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex gap-2",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$tooltip$2d$custom$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TooltipProvider"], {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$tooltip$2d$custom$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Tooltip"], {
                                    label: hayMesasBloqueadas ? "Desbloquear" : "Bloquear",
                                    shortcut: "Ctrl+L",
                                    position: "bottom",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: onToggleBloqueo,
                                        className: `p-2.5 rounded-lg transition-colors ${hayMesasBloqueadas ? "bg-amber-500 text-white hover:bg-amber-600" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`,
                                        children: hayMesasBloqueadas ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lock$2d$open$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Unlock$3e$__["Unlock"], {
                                            size: 16
                                        }, void 0, false, {
                                            fileName: "[project]/components/panels/panel-propiedades.tsx",
                                            lineNumber: 126,
                                            columnNumber: 39
                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lock$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Lock$3e$__["Lock"], {
                                            size: 16
                                        }, void 0, false, {
                                            fileName: "[project]/components/panels/panel-propiedades.tsx",
                                            lineNumber: 126,
                                            columnNumber: 62
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/components/panels/panel-propiedades.tsx",
                                        lineNumber: 119,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/components/panels/panel-propiedades.tsx",
                                    lineNumber: 118,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$tooltip$2d$custom$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Tooltip"], {
                                    label: "Duplicar",
                                    shortcut: "Ctrl+D",
                                    position: "bottom",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: onDuplicar,
                                        disabled: hayMesasBloqueadas,
                                        className: `p-2.5 rounded-lg transition-colors ${hayMesasBloqueadas ? "bg-slate-50 text-slate-300 cursor-not-allowed" : "bg-slate-100 text-slate-600 hover:bg-indigo-100 hover:text-indigo-600"}`,
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$copy$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Copy$3e$__["Copy"], {
                                            size: 16
                                        }, void 0, false, {
                                            fileName: "[project]/components/panels/panel-propiedades.tsx",
                                            lineNumber: 139,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/components/panels/panel-propiedades.tsx",
                                        lineNumber: 131,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/components/panels/panel-propiedades.tsx",
                                    lineNumber: 130,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$tooltip$2d$custom$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Tooltip"], {
                                    label: "Eliminar",
                                    shortcut: "Supr",
                                    position: "bottom",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: onEliminar,
                                        disabled: hayMesasBloqueadas,
                                        className: `p-2.5 rounded-lg transition-colors ${hayMesasBloqueadas ? "bg-slate-50 text-slate-300 cursor-not-allowed" : "bg-slate-100 text-slate-600 hover:bg-red-100 hover:text-red-600"}`,
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"], {
                                            size: 16
                                        }, void 0, false, {
                                            fileName: "[project]/components/panels/panel-propiedades.tsx",
                                            lineNumber: 152,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/components/panels/panel-propiedades.tsx",
                                        lineNumber: 144,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/components/panels/panel-propiedades.tsx",
                                    lineNumber: 143,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/panels/panel-propiedades.tsx",
                            lineNumber: 117,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/panels/panel-propiedades.tsx",
                        lineNumber: 116,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/panels/panel-propiedades.tsx",
                lineNumber: 90,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "p-4 space-y-4 flex-1 overflow-y-auto",
                children: [
                    idsSeleccionados.length === 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-1.5",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "text-xs font-medium text-slate-500",
                                children: "Nombre"
                            }, void 0, false, {
                                fileName: "[project]/components/panels/panel-propiedades.tsx",
                                lineNumber: 164,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "text",
                                value: mesaActiva.etiqueta,
                                onChange: (e)=>onActualizarMesa("etiqueta", e.target.value),
                                className: "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none",
                                disabled: mesaActiva.bloqueada
                            }, void 0, false, {
                                fileName: "[project]/components/panels/panel-propiedades.tsx",
                                lineNumber: 165,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/panels/panel-propiedades.tsx",
                        lineNumber: 163,
                        columnNumber: 11
                    }, this),
                    tipoMapa === "completo" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-1.5",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "text-xs font-medium text-slate-500",
                                children: "Sector"
                            }, void 0, false, {
                                fileName: "[project]/components/panels/panel-propiedades.tsx",
                                lineNumber: 178,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                value: mesaActiva.sectorId,
                                onChange: (e)=>onActualizarMesa("sectorId", e.target.value),
                                className: "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none",
                                disabled: hayMesasBloqueadas,
                                children: sectores.map((s)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: s.id,
                                        children: s.nombre
                                    }, s.id, false, {
                                        fileName: "[project]/components/panels/panel-propiedades.tsx",
                                        lineNumber: 186,
                                        columnNumber: 17
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/components/panels/panel-propiedades.tsx",
                                lineNumber: 179,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/panels/panel-propiedades.tsx",
                        lineNumber: 177,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-1.5",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "text-xs font-medium text-slate-500",
                                children: "Forma"
                            }, void 0, false, {
                                fileName: "[project]/components/panels/panel-propiedades.tsx",
                                lineNumber: 196,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "grid grid-cols-2 gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>{
                                            onGuardarHistorial();
                                            onActualizarMesa("forma", "circulo");
                                        },
                                        className: `py-2 rounded-lg text-sm font-medium transition-colors ${mesaActiva.forma === "circulo" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`,
                                        disabled: hayMesasBloqueadas,
                                        children: "Redonda"
                                    }, void 0, false, {
                                        fileName: "[project]/components/panels/panel-propiedades.tsx",
                                        lineNumber: 198,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>{
                                            onGuardarHistorial();
                                            onActualizarMesa("forma", "cuadrado");
                                        },
                                        className: `py-2 rounded-lg text-sm font-medium transition-colors ${mesaActiva.forma === "cuadrado" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`,
                                        disabled: hayMesasBloqueadas,
                                        children: "Cuadrada"
                                    }, void 0, false, {
                                        fileName: "[project]/components/panels/panel-propiedades.tsx",
                                        lineNumber: 211,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/panels/panel-propiedades.tsx",
                                lineNumber: 197,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/panels/panel-propiedades.tsx",
                        lineNumber: 195,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex justify-between items-center",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "text-xs font-medium text-slate-500",
                                        children: "Escala"
                                    }, void 0, false, {
                                        fileName: "[project]/components/panels/panel-propiedades.tsx",
                                        lineNumber: 230,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-xs font-medium text-indigo-600",
                                        children: [
                                            Math.round((mesaActiva.escala || 1) * 100),
                                            "%"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/panels/panel-propiedades.tsx",
                                        lineNumber: 231,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/panels/panel-propiedades.tsx",
                                lineNumber: 229,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "range",
                                min: "50",
                                max: "200",
                                value: (mesaActiva.escala || 1) * 100,
                                onChange: (e)=>onActualizarMesa("escala", Number.parseInt(e.target.value) / 100),
                                className: "w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer",
                                disabled: hayMesasBloqueadas
                            }, void 0, false, {
                                fileName: "[project]/components/panels/panel-propiedades.tsx",
                                lineNumber: 233,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/panels/panel-propiedades.tsx",
                        lineNumber: 228,
                        columnNumber: 9
                    }, this),
                    mesaActiva.forma === "cuadrado" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "text-xs font-medium text-slate-500",
                                children: "Lados con sillas"
                            }, void 0, false, {
                                fileName: "[project]/components/panels/panel-propiedades.tsx",
                                lineNumber: 247,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-slate-50 p-4 rounded-xl flex flex-col items-center gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>onToggleLado("top"),
                                        className: `w-10 h-6 rounded-md transition-colors ${mesaActiva.ladosActivos?.includes("top") ? "bg-indigo-500 text-white" : "bg-white border border-slate-200 text-slate-400 hover:bg-slate-100"}`,
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$up$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronUp$3e$__["ChevronUp"], {
                                            size: 14,
                                            className: "mx-auto"
                                        }, void 0, false, {
                                            fileName: "[project]/components/panels/panel-propiedades.tsx",
                                            lineNumber: 256,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/components/panels/panel-propiedades.tsx",
                                        lineNumber: 249,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex gap-2 items-center",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>onToggleLado("left"),
                                                className: `w-6 h-10 rounded-md transition-colors ${mesaActiva.ladosActivos?.includes("left") ? "bg-indigo-500 text-white" : "bg-white border border-slate-200 text-slate-400 hover:bg-slate-100"}`,
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__["ChevronLeft"], {
                                                    size: 14,
                                                    className: "mx-auto"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/panels/panel-propiedades.tsx",
                                                    lineNumber: 266,
                                                    columnNumber: 19
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/components/panels/panel-propiedades.tsx",
                                                lineNumber: 259,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "w-12 h-10 border-2 border-slate-300 rounded-lg bg-white"
                                            }, void 0, false, {
                                                fileName: "[project]/components/panels/panel-propiedades.tsx",
                                                lineNumber: 268,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>onToggleLado("right"),
                                                className: `w-6 h-10 rounded-md transition-colors ${mesaActiva.ladosActivos?.includes("right") ? "bg-indigo-500 text-white" : "bg-white border border-slate-200 text-slate-400 hover:bg-slate-100"}`,
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__["ChevronRight"], {
                                                    size: 14,
                                                    className: "mx-auto"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/panels/panel-propiedades.tsx",
                                                    lineNumber: 276,
                                                    columnNumber: 19
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/components/panels/panel-propiedades.tsx",
                                                lineNumber: 269,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/panels/panel-propiedades.tsx",
                                        lineNumber: 258,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>onToggleLado("bottom"),
                                        className: `w-10 h-6 rounded-md transition-colors ${mesaActiva.ladosActivos?.includes("bottom") ? "bg-indigo-500 text-white" : "bg-white border border-slate-200 text-slate-400 hover:bg-slate-100"}`,
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
                                            size: 14,
                                            className: "mx-auto"
                                        }, void 0, false, {
                                            fileName: "[project]/components/panels/panel-propiedades.tsx",
                                            lineNumber: 286,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/components/panels/panel-propiedades.tsx",
                                        lineNumber: 279,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/panels/panel-propiedades.tsx",
                                lineNumber: 248,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/panels/panel-propiedades.tsx",
                        lineNumber: 246,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex justify-between items-center",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "text-xs font-medium text-slate-500",
                                        children: "Sillas"
                                    }, void 0, false, {
                                        fileName: "[project]/components/panels/panel-propiedades.tsx",
                                        lineNumber: 295,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-xs font-medium text-slate-600",
                                        children: mesaActiva.sillas
                                    }, void 0, false, {
                                        fileName: "[project]/components/panels/panel-propiedades.tsx",
                                        lineNumber: 296,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/panels/panel-propiedades.tsx",
                                lineNumber: 294,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "range",
                                min: "1",
                                max: "30",
                                value: mesaActiva.sillas,
                                onChange: (e)=>onActualizarMesa("sillas", Number.parseInt(e.target.value)),
                                className: "w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer",
                                disabled: hayMesasBloqueadas
                            }, void 0, false, {
                                fileName: "[project]/components/panels/panel-propiedades.tsx",
                                lineNumber: 298,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/panels/panel-propiedades.tsx",
                        lineNumber: 293,
                        columnNumber: 9
                    }, this),
                    mostrarEspacioSillas && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex justify-between items-center",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "text-xs font-medium text-slate-500",
                                        children: "Espacio entre sillas"
                                    }, void 0, false, {
                                        fileName: "[project]/components/panels/panel-propiedades.tsx",
                                        lineNumber: 312,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-xs font-medium text-slate-600",
                                        children: [
                                            mesaActiva.espacioEntreSillas ?? 50,
                                            "%"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/panels/panel-propiedades.tsx",
                                        lineNumber: 313,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/panels/panel-propiedades.tsx",
                                lineNumber: 311,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "range",
                                min: "0",
                                max: "100",
                                value: mesaActiva.espacioEntreSillas ?? 50,
                                onChange: (e)=>onActualizarMesa("espacioEntreSillas", Number.parseInt(e.target.value)),
                                className: "w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer",
                                disabled: hayMesasBloqueadas
                            }, void 0, false, {
                                fileName: "[project]/components/panels/panel-propiedades.tsx",
                                lineNumber: 315,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex justify-between text-[10px] text-slate-400",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: "Juntas"
                                    }, void 0, false, {
                                        fileName: "[project]/components/panels/panel-propiedades.tsx",
                                        lineNumber: 325,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: "Separadas"
                                    }, void 0, false, {
                                        fileName: "[project]/components/panels/panel-propiedades.tsx",
                                        lineNumber: 326,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/panels/panel-propiedades.tsx",
                                lineNumber: 324,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/panels/panel-propiedades.tsx",
                        lineNumber: 310,
                        columnNumber: 11
                    }, this),
                    mesaActiva.forma === "circulo" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex justify-between items-center",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "text-xs font-medium text-slate-500",
                                        children: "Diámetro"
                                    }, void 0, false, {
                                        fileName: "[project]/components/panels/panel-propiedades.tsx",
                                        lineNumber: 335,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-xs text-slate-400",
                                        children: [
                                            mesaActiva.ancho,
                                            "px"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/panels/panel-propiedades.tsx",
                                        lineNumber: 336,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/panels/panel-propiedades.tsx",
                                lineNumber: 334,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "range",
                                min: limitesSlider.minW,
                                max: "400",
                                value: mesaActiva.ancho,
                                onChange: (e)=>onActualizarDiametro(Number.parseInt(e.target.value)),
                                className: "w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer",
                                disabled: hayMesasBloqueadas
                            }, void 0, false, {
                                fileName: "[project]/components/panels/panel-propiedades.tsx",
                                lineNumber: 338,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/panels/panel-propiedades.tsx",
                        lineNumber: 333,
                        columnNumber: 11
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex justify-between items-center",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                className: "text-xs font-medium text-slate-500",
                                                children: "Ancho"
                                            }, void 0, false, {
                                                fileName: "[project]/components/panels/panel-propiedades.tsx",
                                                lineNumber: 352,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-xs text-slate-400",
                                                children: [
                                                    mesaActiva.ancho,
                                                    "px"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/panels/panel-propiedades.tsx",
                                                lineNumber: 353,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/panels/panel-propiedades.tsx",
                                        lineNumber: 351,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "range",
                                        min: limitesSlider.minW,
                                        max: "400",
                                        value: mesaActiva.ancho,
                                        onChange: (e)=>onActualizarMesa("ancho", Number.parseInt(e.target.value)),
                                        className: "w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer",
                                        disabled: hayMesasBloqueadas
                                    }, void 0, false, {
                                        fileName: "[project]/components/panels/panel-propiedades.tsx",
                                        lineNumber: 355,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/panels/panel-propiedades.tsx",
                                lineNumber: 350,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex justify-between items-center",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                className: "text-xs font-medium text-slate-500",
                                                children: "Alto"
                                            }, void 0, false, {
                                                fileName: "[project]/components/panels/panel-propiedades.tsx",
                                                lineNumber: 367,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-xs text-slate-400",
                                                children: [
                                                    mesaActiva.alto,
                                                    "px"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/panels/panel-propiedades.tsx",
                                                lineNumber: 368,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/panels/panel-propiedades.tsx",
                                        lineNumber: 366,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "range",
                                        min: limitesSlider.minH,
                                        max: "400",
                                        value: mesaActiva.alto,
                                        onChange: (e)=>onActualizarMesa("alto", Number.parseInt(e.target.value)),
                                        className: "w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer",
                                        disabled: hayMesasBloqueadas
                                    }, void 0, false, {
                                        fileName: "[project]/components/panels/panel-propiedades.tsx",
                                        lineNumber: 370,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/panels/panel-propiedades.tsx",
                                lineNumber: 365,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true)
                ]
            }, void 0, true, {
                fileName: "[project]/components/panels/panel-propiedades.tsx",
                lineNumber: 160,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/panels/panel-propiedades.tsx",
        lineNumber: 88,
        columnNumber: 5
    }, this);
}
}),
"[project]/components/modals/modal-confirmacion.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ModalConfirmacion",
    ()=>ModalConfirmacion
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
"use client";
;
function ModalConfirmacion({ mensaje, onConfirm, onCancel }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 bg-black/50 flex items-center justify-center z-[200]",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "bg-[#2a2a2a] rounded-lg p-6 w-96 border border-[#444]",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-white mb-6",
                    children: mensaje
                }, void 0, false, {
                    fileName: "[project]/components/modals/modal-confirmacion.tsx",
                    lineNumber: 13,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex gap-2 justify-end",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: onCancel,
                            className: "px-4 py-2 text-gray-400 hover:text-white transition-colors",
                            children: "Cancelar"
                        }, void 0, false, {
                            fileName: "[project]/components/modals/modal-confirmacion.tsx",
                            lineNumber: 15,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: onConfirm,
                            className: "px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded transition-colors",
                            children: "Eliminar"
                        }, void 0, false, {
                            fileName: "[project]/components/modals/modal-confirmacion.tsx",
                            lineNumber: 18,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/modals/modal-confirmacion.tsx",
                    lineNumber: 14,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/modals/modal-confirmacion.tsx",
            lineNumber: 12,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/modals/modal-confirmacion.tsx",
        lineNumber: 11,
        columnNumber: 5
    }, this);
}
}),
"[project]/components/modals/modal-nombre-mesa.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ModalNombreMesa",
    ()=>ModalNombreMesa
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
"use client";
;
;
function ModalNombreMesa({ mesa, onClose, onSave }) {
    const [nombre, setNombre] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (mesa) {
            setNombre(mesa.nombre);
        }
    }, [
        mesa
    ]);
    if (!mesa) return null;
    const handleSubmit = (e)=>{
        e.preventDefault();
        onSave(mesa.id, nombre);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 bg-black/50 flex items-center justify-center z-[200]",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "bg-[#2a2a2a] rounded-lg p-6 w-80 border border-[#444]",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                    className: "text-lg font-semibold text-white mb-4",
                    children: "Editar nombre de mesa"
                }, void 0, false, {
                    fileName: "[project]/components/modals/modal-nombre-mesa.tsx",
                    lineNumber: 33,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                    onSubmit: handleSubmit,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                            type: "text",
                            value: nombre,
                            onChange: (e)=>setNombre(e.target.value),
                            className: "w-full bg-[#1a1a1a] border border-[#555] rounded px-3 py-2 text-white mb-4 focus:outline-none focus:border-orange-500",
                            autoFocus: true
                        }, void 0, false, {
                            fileName: "[project]/components/modals/modal-nombre-mesa.tsx",
                            lineNumber: 35,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex gap-2 justify-end",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    onClick: onClose,
                                    className: "px-4 py-2 text-gray-400 hover:text-white transition-colors",
                                    children: "Cancelar"
                                }, void 0, false, {
                                    fileName: "[project]/components/modals/modal-nombre-mesa.tsx",
                                    lineNumber: 43,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "submit",
                                    className: "px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded transition-colors",
                                    children: "Guardar"
                                }, void 0, false, {
                                    fileName: "[project]/components/modals/modal-nombre-mesa.tsx",
                                    lineNumber: 50,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/modals/modal-nombre-mesa.tsx",
                            lineNumber: 42,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/modals/modal-nombre-mesa.tsx",
                    lineNumber: 34,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/modals/modal-nombre-mesa.tsx",
            lineNumber: 32,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/modals/modal-nombre-mesa.tsx",
        lineNumber: 31,
        columnNumber: 5
    }, this);
}
}),
"[project]/components/modals/modal-ayuda.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ModalAyuda",
    ()=>ModalAyuda
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$help$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__HelpCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-help.js [app-ssr] (ecmascript) <export default as HelpCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-ssr] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$tooltip$2d$custom$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/tooltip-custom.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
function ModalAyuda({ isMac, onClose }) {
    const atajos = {
        navegacion: [
            {
                label: "Zoom to Fit",
                shortcut: "Ctrl + 1"
            },
            {
                label: "Zoom to Selection",
                shortcut: "Ctrl + 2"
            },
            {
                label: "Centrar vista",
                shortcut: "Ctrl + 0"
            },
            {
                label: "Paneo temporal",
                shortcut: "Espacio"
            }
        ],
        herramientas: [
            {
                label: "Modo Selección",
                shortcut: "V"
            },
            {
                label: "Modo Mano",
                shortcut: "H"
            }
        ],
        edicion: [
            {
                label: "Deshacer",
                shortcut: "Ctrl + Z"
            },
            {
                label: "Rehacer",
                shortcut: "Ctrl + Y"
            },
            {
                label: "Copiar",
                shortcut: "Ctrl + C"
            },
            {
                label: "Pegar",
                shortcut: "Ctrl + V"
            },
            {
                label: "Duplicar",
                shortcut: "Ctrl + D"
            },
            {
                label: "Seleccionar todo",
                shortcut: "Ctrl + A"
            },
            {
                label: "Eliminar",
                shortcut: "Delete"
            },
            {
                label: "Bloquear/Desbloquear",
                shortcut: "Ctrl + L"
            }
        ],
        movimiento: [
            {
                label: "Mover 1px",
                shortcut: "Flechas"
            },
            {
                label: "Mover 10px",
                shortcut: "Shift + Flechas"
            },
            {
                label: "Duplicar arrastrando",
                shortcut: "Alt + Arrastrar"
            }
        ]
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in duration-200",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden animate-in zoom-in-95 duration-200",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "p-5 border-b border-slate-200 flex justify-between items-center",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            className: "font-bold text-lg text-slate-800 flex items-center gap-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$help$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__HelpCircle$3e$__["HelpCircle"], {
                                    size: 20,
                                    className: "text-indigo-600"
                                }, void 0, false, {
                                    fileName: "[project]/components/modals/modal-ayuda.tsx",
                                    lineNumber: 45,
                                    columnNumber: 13
                                }, this),
                                "Atajos de Teclado",
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-xs font-normal text-slate-400 ml-2",
                                    children: [
                                        "(",
                                        isMac ? "macOS" : "Windows/Linux",
                                        ")"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/modals/modal-ayuda.tsx",
                                    lineNumber: 47,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/modals/modal-ayuda.tsx",
                            lineNumber: 44,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: onClose,
                            className: "p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                size: 20
                            }, void 0, false, {
                                fileName: "[project]/components/modals/modal-ayuda.tsx",
                                lineNumber: 50,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/components/modals/modal-ayuda.tsx",
                            lineNumber: 49,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/modals/modal-ayuda.tsx",
                    lineNumber: 43,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "p-5 overflow-y-auto max-h-[60vh]",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-1 md:grid-cols-2 gap-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-xs font-bold text-slate-500 uppercase mb-3",
                                        children: "Navegación"
                                    }, void 0, false, {
                                        fileName: "[project]/components/modals/modal-ayuda.tsx",
                                        lineNumber: 56,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "space-y-2",
                                        children: atajos.navegacion.map((a)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex justify-between text-sm",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-slate-600",
                                                        children: a.label
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/modals/modal-ayuda.tsx",
                                                        lineNumber: 60,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("kbd", {
                                                        className: "px-2 py-0.5 bg-slate-100 rounded text-xs font-mono",
                                                        children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$tooltip$2d$custom$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatShortcut"])(a.shortcut, isMac)
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/modals/modal-ayuda.tsx",
                                                        lineNumber: 61,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, a.label, true, {
                                                fileName: "[project]/components/modals/modal-ayuda.tsx",
                                                lineNumber: 59,
                                                columnNumber: 19
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/components/modals/modal-ayuda.tsx",
                                        lineNumber: 57,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/modals/modal-ayuda.tsx",
                                lineNumber: 55,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-xs font-bold text-slate-500 uppercase mb-3",
                                        children: "Herramientas"
                                    }, void 0, false, {
                                        fileName: "[project]/components/modals/modal-ayuda.tsx",
                                        lineNumber: 69,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "space-y-2",
                                        children: atajos.herramientas.map((a)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex justify-between text-sm",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-slate-600",
                                                        children: a.label
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/modals/modal-ayuda.tsx",
                                                        lineNumber: 73,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("kbd", {
                                                        className: "px-2 py-0.5 bg-slate-100 rounded text-xs font-mono",
                                                        children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$tooltip$2d$custom$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatShortcut"])(a.shortcut, isMac)
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/modals/modal-ayuda.tsx",
                                                        lineNumber: 74,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, a.label, true, {
                                                fileName: "[project]/components/modals/modal-ayuda.tsx",
                                                lineNumber: 72,
                                                columnNumber: 19
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/components/modals/modal-ayuda.tsx",
                                        lineNumber: 70,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/modals/modal-ayuda.tsx",
                                lineNumber: 68,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-xs font-bold text-slate-500 uppercase mb-3",
                                        children: "Edición"
                                    }, void 0, false, {
                                        fileName: "[project]/components/modals/modal-ayuda.tsx",
                                        lineNumber: 82,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "space-y-2",
                                        children: atajos.edicion.map((a)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex justify-between text-sm",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-slate-600",
                                                        children: a.label
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/modals/modal-ayuda.tsx",
                                                        lineNumber: 86,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("kbd", {
                                                        className: "px-2 py-0.5 bg-slate-100 rounded text-xs font-mono",
                                                        children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$tooltip$2d$custom$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatShortcut"])(a.shortcut, isMac)
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/modals/modal-ayuda.tsx",
                                                        lineNumber: 87,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, a.label, true, {
                                                fileName: "[project]/components/modals/modal-ayuda.tsx",
                                                lineNumber: 85,
                                                columnNumber: 19
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/components/modals/modal-ayuda.tsx",
                                        lineNumber: 83,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/modals/modal-ayuda.tsx",
                                lineNumber: 81,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-xs font-bold text-slate-500 uppercase mb-3",
                                        children: "Movimiento"
                                    }, void 0, false, {
                                        fileName: "[project]/components/modals/modal-ayuda.tsx",
                                        lineNumber: 95,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "space-y-2",
                                        children: atajos.movimiento.map((a)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex justify-between text-sm",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-slate-600",
                                                        children: a.label
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/modals/modal-ayuda.tsx",
                                                        lineNumber: 99,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("kbd", {
                                                        className: "px-2 py-0.5 bg-slate-100 rounded text-xs font-mono",
                                                        children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$tooltip$2d$custom$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatShortcut"])(a.shortcut, isMac)
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/modals/modal-ayuda.tsx",
                                                        lineNumber: 100,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, a.label, true, {
                                                fileName: "[project]/components/modals/modal-ayuda.tsx",
                                                lineNumber: 98,
                                                columnNumber: 19
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/components/modals/modal-ayuda.tsx",
                                        lineNumber: 96,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/modals/modal-ayuda.tsx",
                                lineNumber: 94,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/modals/modal-ayuda.tsx",
                        lineNumber: 54,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/components/modals/modal-ayuda.tsx",
                    lineNumber: 53,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "p-4 border-t border-slate-100 bg-slate-50 text-center",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs text-slate-400",
                        children: [
                            "Presiona ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("kbd", {
                                className: "px-1.5 py-0.5 bg-white rounded border text-[10px]",
                                children: "?"
                            }, void 0, false, {
                                fileName: "[project]/components/modals/modal-ayuda.tsx",
                                lineNumber: 111,
                                columnNumber: 22
                            }, this),
                            " para abrir/cerrar esta ayuda"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/modals/modal-ayuda.tsx",
                        lineNumber: 110,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/components/modals/modal-ayuda.tsx",
                    lineNumber: 109,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/modals/modal-ayuda.tsx",
            lineNumber: 42,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/modals/modal-ayuda.tsx",
        lineNumber: 41,
        columnNumber: 5
    }, this);
}
}),
"[project]/components/header/editor-header.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "EditorHeader",
    ()=>EditorHeader
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$undo$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Undo$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/undo.js [app-ssr] (ecmascript) <export default as Undo>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$redo$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Redo$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/redo.js [app-ssr] (ecmascript) <export default as Redo>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mouse$2d$pointer$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MousePointer2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/mouse-pointer-2.js [app-ssr] (ecmascript) <export default as MousePointer2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$hand$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Hand$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/hand.js [app-ssr] (ecmascript) <export default as Hand>");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$tooltip$2d$custom$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/tooltip-custom.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
function EditorHeader({ tipoMapa, sectorNombre, sectorPrecio, isMac, puedeDeshacer, puedeRehacer, onDeshacer, onRehacer, cantidadSeleccionadas, herramientaActiva }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$tooltip$2d$custom$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TooltipProvider"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "h-14 bg-white border-b border-slate-200 flex items-center px-6 justify-between shrink-0 z-20 shadow-sm",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center gap-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                            className: "font-bold text-lg text-slate-700 flex items-center gap-2",
                            children: [
                                tipoMapa === "completo" ? "Mapa Multisector" : `Sector: ${sectorNombre}`,
                                tipoMapa === "sector" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200",
                                    children: [
                                        "Bs. ",
                                        sectorPrecio
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/header/editor-header.tsx",
                                    lineNumber: 38,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/header/editor-header.tsx",
                            lineNumber: 35,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-1 bg-slate-100 rounded-lg p-1",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$tooltip$2d$custom$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Tooltip"], {
                                    label: "Deshacer",
                                    shortcut: "Ctrl + Z",
                                    isMac: isMac,
                                    position: "bottom",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: onDeshacer,
                                        disabled: !puedeDeshacer,
                                        className: `p-1.5 rounded transition-colors ${!puedeDeshacer ? "text-slate-300" : "text-slate-600 hover:bg-white hover:text-indigo-600 hover:shadow-sm"}`,
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$undo$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Undo$3e$__["Undo"], {
                                            size: 16
                                        }, void 0, false, {
                                            fileName: "[project]/components/header/editor-header.tsx",
                                            lineNumber: 55,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/components/header/editor-header.tsx",
                                        lineNumber: 46,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/components/header/editor-header.tsx",
                                    lineNumber: 45,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$tooltip$2d$custom$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Tooltip"], {
                                    label: "Rehacer",
                                    shortcut: "Ctrl + Y",
                                    isMac: isMac,
                                    position: "bottom",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: onRehacer,
                                        disabled: !puedeRehacer,
                                        className: `p-1.5 rounded transition-colors ${!puedeRehacer ? "text-slate-300" : "text-slate-600 hover:bg-white hover:text-indigo-600 hover:shadow-sm"}`,
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$redo$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Redo$3e$__["Redo"], {
                                            size: 16
                                        }, void 0, false, {
                                            fileName: "[project]/components/header/editor-header.tsx",
                                            lineNumber: 68,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/components/header/editor-header.tsx",
                                        lineNumber: 59,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/components/header/editor-header.tsx",
                                    lineNumber: 58,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/header/editor-header.tsx",
                            lineNumber: 44,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/header/editor-header.tsx",
                    lineNumber: 34,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center gap-4",
                    children: [
                        cantidadSeleccionadas > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-xs font-bold bg-indigo-100 text-indigo-600 px-2 py-1 rounded-full",
                            children: [
                                cantidadSeleccionadas,
                                " seleccionada(s)"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/header/editor-header.tsx",
                            lineNumber: 76,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-sm text-slate-400 flex items-center gap-2",
                            children: [
                                herramientaActiva === "mano" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$hand$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Hand$3e$__["Hand"], {
                                    size: 14
                                }, void 0, false, {
                                    fileName: "[project]/components/header/editor-header.tsx",
                                    lineNumber: 81,
                                    columnNumber: 45
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mouse$2d$pointer$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MousePointer2$3e$__["MousePointer2"], {
                                    size: 14
                                }, void 0, false, {
                                    fileName: "[project]/components/header/editor-header.tsx",
                                    lineNumber: 81,
                                    columnNumber: 66
                                }, this),
                                herramientaActiva === "mano" ? "Modo Paneo" : "Modo Edición"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/header/editor-header.tsx",
                            lineNumber: 80,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/header/editor-header.tsx",
                    lineNumber: 74,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/header/editor-header.tsx",
            lineNumber: 33,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/header/editor-header.tsx",
        lineNumber: 32,
        columnNumber: 5
    }, this);
}
}),
"[project]/components/canvas/mesa-svg.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MesaSvg",
    ()=>MesaSvg
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$mesa$2d$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/mesa-utils.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$canvas$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/constants/canvas.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lock$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Lock$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/lock.js [app-ssr] (ecmascript) <export default as Lock>");
"use client";
;
;
;
;
function MesaSvg({ mesa, sectores, isSelected, onMouseDown, onDoubleClick, onTouchStart }) {
    const sectorMesa = sectores.find((s)=>s.id === mesa.sectorId) || sectores[0];
    const stroke = isSelected ? "#6366f1" : sectorMesa.color;
    // Mesa local para calcular posiciones de sillas relativas al centro
    const mesaLocal = {
        ...mesa,
        x: 0,
        y: 0
    };
    const pos = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$mesa$2d$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["obtenerPosicionesSillas"])(mesaLocal);
    const radioCirculo = Math.max(mesa.ancho, mesa.alto) / 2;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("g", {
        transform: `translate(${mesa.x},${mesa.y}) scale(${mesa.escala || 1})`,
        onMouseDown: (e)=>onMouseDown(e, mesa),
        onDoubleClick: ()=>onDoubleClick(mesa),
        onTouchStart: (e)=>onTouchStart?.(e, mesa),
        style: {
            cursor: mesa.bloqueada ? "not-allowed" : "move"
        },
        children: [
            pos.map((p, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("g", {
                    transform: `translate(${p.x}, ${p.y}) rotate(${p.angulo})`,
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                        x: -__TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$canvas$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TAMANO_SILLA"] / 2,
                        y: -__TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$canvas$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TAMANO_SILLA"] / 2,
                        width: __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$canvas$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TAMANO_SILLA"],
                        height: __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$canvas$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TAMANO_SILLA"],
                        rx: 4,
                        fill: "#e2e8f0",
                        stroke: "white",
                        strokeWidth: "2",
                        filter: "url(#chair-shadow)",
                        opacity: mesa.bloqueada ? 0.5 : 1
                    }, void 0, false, {
                        fileName: "[project]/components/canvas/mesa-svg.tsx",
                        lineNumber: 40,
                        columnNumber: 11
                    }, this)
                }, i, false, {
                    fileName: "[project]/components/canvas/mesa-svg.tsx",
                    lineNumber: 39,
                    columnNumber: 9
                }, this)),
            mesa.forma === "circulo" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                cx: 0,
                cy: 0,
                r: radioCirculo,
                fill: "#FFFFFF",
                stroke: stroke,
                strokeWidth: isSelected ? 3 : 2,
                strokeDasharray: mesa.bloqueada ? "8,4" : "none"
            }, void 0, false, {
                fileName: "[project]/components/canvas/mesa-svg.tsx",
                lineNumber: 57,
                columnNumber: 9
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                x: -mesa.ancho / 2,
                y: -mesa.alto / 2,
                width: mesa.ancho,
                height: mesa.alto,
                rx: 8,
                fill: "#FFFFFF",
                stroke: stroke,
                strokeWidth: isSelected ? 3 : 2,
                strokeDasharray: mesa.bloqueada ? "8,4" : "none"
            }, void 0, false, {
                fileName: "[project]/components/canvas/mesa-svg.tsx",
                lineNumber: 67,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("text", {
                x: 0,
                y: 0,
                dy: "5",
                textAnchor: "middle",
                className: "text-xs font-bold pointer-events-none select-none",
                style: {
                    fill: stroke
                },
                children: mesa.etiqueta
            }, void 0, false, {
                fileName: "[project]/components/canvas/mesa-svg.tsx",
                lineNumber: 81,
                columnNumber: 7
            }, this),
            mesa.bloqueada && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("g", {
                transform: `translate(${mesa.ancho / 2 - 10}, ${-mesa.alto / 2 + 10})`,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                        cx: 0,
                        cy: 0,
                        r: 10,
                        fill: "white",
                        stroke: stroke,
                        strokeWidth: 1
                    }, void 0, false, {
                        fileName: "[project]/components/canvas/mesa-svg.tsx",
                        lineNumber: 95,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lock$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Lock$3e$__["Lock"], {
                        x: -6,
                        y: -6,
                        size: 12,
                        style: {
                            fill: "none",
                            stroke: "#64748b"
                        }
                    }, void 0, false, {
                        fileName: "[project]/components/canvas/mesa-svg.tsx",
                        lineNumber: 96,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/canvas/mesa-svg.tsx",
                lineNumber: 94,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/canvas/mesa-svg.tsx",
        lineNumber: 30,
        columnNumber: 5
    }, this);
}
}),
"[project]/components/canvas/canvas-area.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CanvasArea",
    ()=>CanvasArea
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$canvas$2f$mesa$2d$svg$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/canvas/mesa-svg.tsx [app-ssr] (ecmascript)");
"use client";
;
;
function CanvasArea({ referenciaSvg, contenedorRef, cursorStyle, pan, zoom, imagenFondo, dimensionesImagen, guias, mesas, sectores, idsSeleccionados, cajaSeleccion, editandoNombreMesa, inputNombreRef, onMouseDown, onMouseMove, onMouseUp, onDoubleClickMesa, onEditandoNombreChange, onConfirmarNombre, onTouchStart, onTouchMove, onTouchEnd }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: contenedorRef,
        className: "flex-1 relative overflow-hidden",
        style: {
            cursor: cursorStyle,
            touchAction: "none"
        },
        onMouseDown: (e)=>onMouseDown(e, "lienzo"),
        onMouseMove: onMouseMove,
        onMouseUp: onMouseUp,
        onMouseLeave: onMouseUp,
        onTouchStart: (e)=>onTouchStart(e, "lienzo"),
        onTouchMove: onTouchMove,
        onTouchEnd: onTouchEnd,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                ref: referenciaSvg,
                width: "100%",
                height: "100%",
                className: "w-full h-full block",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("defs", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("filter", {
                                id: "chair-shadow",
                                x: "-50%",
                                y: "-50%",
                                width: "200%",
                                height: "200%",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("feDropShadow", {
                                    dx: "1",
                                    dy: "1",
                                    stdDeviation: "2",
                                    floodColor: "#000000",
                                    floodOpacity: "0.15"
                                }, void 0, false, {
                                    fileName: "[project]/components/canvas/canvas-area.tsx",
                                    lineNumber: 75,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/canvas/canvas-area.tsx",
                                lineNumber: 74,
                                columnNumber: 11
                            }, this),
                            !imagenFondo && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("pattern", {
                                id: "grid",
                                width: "40",
                                height: "40",
                                patternUnits: "userSpaceOnUse",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                    d: "M 40 0 L 0 0 0 40",
                                    fill: "none",
                                    stroke: "#cbd5e1",
                                    strokeWidth: "1"
                                }, void 0, false, {
                                    fileName: "[project]/components/canvas/canvas-area.tsx",
                                    lineNumber: 79,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/canvas/canvas-area.tsx",
                                lineNumber: 78,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/canvas/canvas-area.tsx",
                        lineNumber: 73,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("g", {
                        id: "contenido-mapa",
                        transform: `translate(${pan.x},${pan.y}) scale(${zoom})`,
                        children: [
                            imagenFondo ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("g", {
                                id: "capa-fondo",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                                        x: "0",
                                        y: "0",
                                        width: dimensionesImagen.w,
                                        height: dimensionesImagen.h,
                                        fill: "white",
                                        stroke: "#ddd",
                                        strokeWidth: "2"
                                    }, void 0, false, {
                                        fileName: "[project]/components/canvas/canvas-area.tsx",
                                        lineNumber: 87,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("image", {
                                        href: imagenFondo,
                                        x: "0",
                                        y: "0",
                                        width: dimensionesImagen.w,
                                        height: dimensionesImagen.h,
                                        opacity: 0.6
                                    }, void 0, false, {
                                        fileName: "[project]/components/canvas/canvas-area.tsx",
                                        lineNumber: 96,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/canvas/canvas-area.tsx",
                                lineNumber: 86,
                                columnNumber: 13
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("g", {
                                id: "capa-grid",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                                        x: "-50000",
                                        y: "-50000",
                                        width: "100000",
                                        height: "100000",
                                        fill: "url(#grid)"
                                    }, void 0, false, {
                                        fileName: "[project]/components/canvas/canvas-area.tsx",
                                        lineNumber: 107,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                                        x1: "-50000",
                                        y1: "0",
                                        x2: "50000",
                                        y2: "0",
                                        stroke: "#94a3b8",
                                        strokeWidth: "2"
                                    }, void 0, false, {
                                        fileName: "[project]/components/canvas/canvas-area.tsx",
                                        lineNumber: 108,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                                        x1: "0",
                                        y1: "-50000",
                                        x2: "0",
                                        y2: "50000",
                                        stroke: "#94a3b8",
                                        strokeWidth: "2"
                                    }, void 0, false, {
                                        fileName: "[project]/components/canvas/canvas-area.tsx",
                                        lineNumber: 109,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/canvas/canvas-area.tsx",
                                lineNumber: 106,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("g", {
                                id: "capa-guias",
                                children: guias.map((guia, i)=>guia.type === "v" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                                        x1: guia.pos,
                                        y1: -50000,
                                        x2: guia.pos,
                                        y2: 50000,
                                        stroke: "#ff00ff",
                                        strokeWidth: 1 / zoom,
                                        strokeDasharray: "4,4"
                                    }, i, false, {
                                        fileName: "[project]/components/canvas/canvas-area.tsx",
                                        lineNumber: 116,
                                        columnNumber: 17
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                                        x1: -50000,
                                        y1: guia.pos,
                                        x2: 50000,
                                        y2: guia.pos,
                                        stroke: "#ff00ff",
                                        strokeWidth: 1 / zoom,
                                        strokeDasharray: "4,4"
                                    }, i, false, {
                                        fileName: "[project]/components/canvas/canvas-area.tsx",
                                        lineNumber: 127,
                                        columnNumber: 17
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/components/canvas/canvas-area.tsx",
                                lineNumber: 113,
                                columnNumber: 11
                            }, this),
                            mesas.map((m)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$canvas$2f$mesa$2d$svg$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MesaSvg"], {
                                    mesa: m,
                                    sectores: sectores,
                                    isSelected: idsSeleccionados.includes(m.id),
                                    onMouseDown: (e, mesa)=>onMouseDown(e, "mesa", mesa),
                                    onDoubleClick: onDoubleClickMesa,
                                    onTouchStart: (e, mesa)=>onTouchStart(e, "mesa", mesa)
                                }, m.id, false, {
                                    fileName: "[project]/components/canvas/canvas-area.tsx",
                                    lineNumber: 142,
                                    columnNumber: 13
                                }, this)),
                            cajaSeleccion && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                                id: "capa-seleccion",
                                x: Math.min(cajaSeleccion.startX, cajaSeleccion.currentX),
                                y: Math.min(cajaSeleccion.startY, cajaSeleccion.currentY),
                                width: Math.abs(cajaSeleccion.currentX - cajaSeleccion.startX),
                                height: Math.abs(cajaSeleccion.currentY - cajaSeleccion.startY),
                                fill: "rgba(99, 102, 241, 0.1)",
                                stroke: "#6366f1",
                                strokeWidth: 1 / zoom,
                                strokeDasharray: "4,4"
                            }, void 0, false, {
                                fileName: "[project]/components/canvas/canvas-area.tsx",
                                lineNumber: 154,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/canvas/canvas-area.tsx",
                        lineNumber: 84,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/canvas/canvas-area.tsx",
                lineNumber: 72,
                columnNumber: 7
            }, this),
            editandoNombreMesa && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed z-50",
                style: {
                    left: editandoNombreMesa.x,
                    top: editandoNombreMesa.y,
                    transform: "translateX(-50%)"
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                    ref: inputNombreRef,
                    type: "text",
                    value: editandoNombreMesa.valor,
                    onChange: (e)=>onEditandoNombreChange({
                            ...editandoNombreMesa,
                            valor: e.target.value
                        }),
                    onBlur: onConfirmarNombre,
                    onKeyDown: (e)=>{
                        if (e.key === "Enter") onConfirmarNombre();
                        if (e.key === "Escape") onEditandoNombreChange(null);
                    },
                    className: "px-2 py-1 text-sm font-semibold text-center bg-white border-2 border-indigo-500 rounded shadow-lg outline-none min-w-[80px]",
                    style: {
                        fontSize: `${Math.max(12, 14 * zoom)}px`
                    }
                }, void 0, false, {
                    fileName: "[project]/components/canvas/canvas-area.tsx",
                    lineNumber: 175,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/canvas/canvas-area.tsx",
                lineNumber: 171,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/canvas/canvas-area.tsx",
        lineNumber: 60,
        columnNumber: 5
    }, this);
}
}),
"[project]/components/controls/zoom-controls.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ZoomControls",
    ()=>ZoomControls
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zoom$2d$in$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ZoomIn$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/zoom-in.js [app-ssr] (ecmascript) <export default as ZoomIn>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zoom$2d$out$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ZoomOut$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/zoom-out.js [app-ssr] (ecmascript) <export default as ZoomOut>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$maximize$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Maximize$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/maximize.js [app-ssr] (ecmascript) <export default as Maximize>");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$tooltip$2d$custom$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/tooltip-custom.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
function ZoomControls({ zoom, isMac, onZoomIn, onZoomOut, onResetView }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$tooltip$2d$custom$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TooltipProvider"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "absolute bottom-6 right-6 flex items-center gap-2 bg-white rounded-xl shadow-lg p-2 border border-slate-200 z-10",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "text-xs font-medium text-slate-500 px-2 min-w-[50px] text-center",
                    children: [
                        Math.round(zoom * 100),
                        "%"
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/controls/zoom-controls.tsx",
                    lineNumber: 18,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "w-px h-5 bg-slate-200"
                }, void 0, false, {
                    fileName: "[project]/components/controls/zoom-controls.tsx",
                    lineNumber: 22,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$tooltip$2d$custom$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Tooltip"], {
                    label: "Acercar",
                    isMac: isMac,
                    position: "left",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: onZoomIn,
                        className: "p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600 hover:text-indigo-600",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zoom$2d$in$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ZoomIn$3e$__["ZoomIn"], {
                            size: 16
                        }, void 0, false, {
                            fileName: "[project]/components/controls/zoom-controls.tsx",
                            lineNumber: 29,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/controls/zoom-controls.tsx",
                        lineNumber: 25,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/components/controls/zoom-controls.tsx",
                    lineNumber: 24,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$tooltip$2d$custom$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Tooltip"], {
                    label: "Alejar",
                    isMac: isMac,
                    position: "left",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: onZoomOut,
                        className: "p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600 hover:text-indigo-600",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zoom$2d$out$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ZoomOut$3e$__["ZoomOut"], {
                            size: 16
                        }, void 0, false, {
                            fileName: "[project]/components/controls/zoom-controls.tsx",
                            lineNumber: 38,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/controls/zoom-controls.tsx",
                        lineNumber: 34,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/components/controls/zoom-controls.tsx",
                    lineNumber: 33,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "w-px h-5 bg-slate-200"
                }, void 0, false, {
                    fileName: "[project]/components/controls/zoom-controls.tsx",
                    lineNumber: 42,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$tooltip$2d$custom$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Tooltip"], {
                    label: "Restablecer vista",
                    shortcut: "Ctrl + 0",
                    isMac: isMac,
                    position: "left",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: onResetView,
                        className: "p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600 hover:text-indigo-600",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$maximize$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Maximize$3e$__["Maximize"], {
                            size: 16
                        }, void 0, false, {
                            fileName: "[project]/components/controls/zoom-controls.tsx",
                            lineNumber: 49,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/controls/zoom-controls.tsx",
                        lineNumber: 45,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/components/controls/zoom-controls.tsx",
                    lineNumber: 44,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/controls/zoom-controls.tsx",
            lineNumber: 17,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/controls/zoom-controls.tsx",
        lineNumber: 16,
        columnNumber: 5
    }, this);
}
}),
"[project]/app/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>App
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$canvas$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/hooks/use-canvas.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$is$2d$mac$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/hooks/use-is-mac.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$tooltip$2d$custom$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/tooltip-custom.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$sidebar$2f$sidebar$2d$izquierda$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/sidebar/sidebar-izquierda.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$modals$2f$modal$2d$configuracion$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/modals/modal-configuracion.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$panels$2f$panel$2d$propiedades$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/panels/panel-propiedades.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$modals$2f$modal$2d$confirmacion$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/modals/modal-confirmacion.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$modals$2f$modal$2d$nombre$2d$mesa$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/modals/modal-nombre-mesa.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$modals$2f$modal$2d$ayuda$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/modals/modal-ayuda.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$header$2f$editor$2d$header$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/header/editor-header.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$canvas$2f$canvas$2d$area$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/canvas/canvas-area.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$controls$2f$zoom$2d$controls$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/controls/zoom-controls.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
;
;
;
;
;
;
;
;
function App() {
    const canvas = (0, __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$canvas$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCanvas"])();
    const isMac = (0, __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$is$2d$mac$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useIsMac"])();
    const [mostrarModalEliminar, setMostrarModalEliminar] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [mostrarModalNombre, setMostrarModalNombre] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    // Modal de configuración inicial
    if (!canvas.modoConfigurado) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$modals$2f$modal$2d$configuracion$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ModalConfiguracion"], {
            pasoModal: canvas.pasoModal,
            setPasoModal: canvas.setPasoModal,
            configSectorUnico: canvas.configSectorUnico,
            setConfigSectorUnico: canvas.setConfigSectorUnico,
            onConfirmarSectorUnico: canvas.confirmarSectorUnico,
            onIniciarMapaCompleto: canvas.iniciarMapaCompleto
        }, void 0, false, {
            fileName: "[project]/app/page.tsx",
            lineNumber: 26,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$tooltip$2d$custom$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TooltipProvider"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex h-screen bg-slate-50 font-sans text-slate-800",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                    type: "file",
                    ref: canvas.inputArchivoRef,
                    onChange: canvas.manejarSubidaImagen,
                    accept: "image/*",
                    className: "hidden"
                }, void 0, false, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 41,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$sidebar$2f$sidebar$2d$izquierda$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SidebarIzquierda"], {
                    isMac: isMac,
                    herramienta: canvas.herramienta,
                    setHerramienta: canvas.setHerramienta,
                    agregarMesa: canvas.agregarMesa,
                    tipoMapa: canvas.tipoMapa,
                    panelActivo: canvas.panelActivo,
                    setPanelActivo: canvas.setPanelActivo,
                    imagenFondo: canvas.imagenFondo,
                    onSubirImagen: ()=>canvas.inputArchivoRef.current?.click(),
                    onQuitarImagen: ()=>{},
                    menuDescargaAbierto: canvas.menuDescargaAbierto,
                    setMenuDescargaAbierto: canvas.setMenuDescargaAbierto,
                    onExportarSVG: canvas.handleExportarSVG,
                    onDescargarJSON: canvas.handleDescargarJSON,
                    onMostrarAyuda: ()=>canvas.setMostrarAyudaAtajos(true)
                }, void 0, false, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 50,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex-1 relative bg-slate-200 overflow-hidden flex flex-col ml-16",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$header$2f$editor$2d$header$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["EditorHeader"], {
                            tipoMapa: canvas.tipoMapa,
                            sectorNombre: canvas.sectores[0]?.nombre,
                            sectorPrecio: canvas.sectores[0]?.precio,
                            isMac: isMac,
                            puedeDeshacer: canvas.puedeDeshacer,
                            puedeRehacer: canvas.puedeRehacer,
                            onDeshacer: canvas.deshacer,
                            onRehacer: canvas.rehacer,
                            cantidadSeleccionadas: canvas.idsSeleccionados.length,
                            herramientaActiva: canvas.herramientaActiva
                        }, void 0, false, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 71,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$canvas$2f$canvas$2d$area$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CanvasArea"], {
                            referenciaSvg: canvas.referenciaSvg,
                            contenedorRef: canvas.contenedorRef,
                            cursorStyle: canvas.cursorStyle,
                            pan: canvas.pan,
                            zoom: canvas.zoom,
                            imagenFondo: canvas.imagenFondo,
                            dimensionesImagen: canvas.dimensionesImagen,
                            guias: canvas.guias,
                            mesas: canvas.mesas,
                            sectores: canvas.sectores,
                            idsSeleccionados: canvas.idsSeleccionados,
                            cajaSeleccion: canvas.cajaSeleccion,
                            editandoNombreMesa: canvas.editandoNombreMesa,
                            inputNombreRef: canvas.inputNombreRef,
                            onMouseDown: canvas.alPresionarMouse,
                            onMouseMove: canvas.alMoverMouse,
                            onMouseUp: canvas.alSoltarMouse,
                            onDoubleClickMesa: canvas.manejarDobleClickMesa,
                            onEditandoNombreChange: canvas.setEditandoNombreMesa,
                            onConfirmarNombre: canvas.confirmarNombreMesa,
                            onTouchStart: canvas.alPresionarTouch,
                            onTouchMove: canvas.alMoverTouch,
                            onTouchEnd: canvas.alSoltarTouch
                        }, void 0, false, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 85,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$controls$2f$zoom$2d$controls$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ZoomControls"], {
                            zoom: canvas.zoom,
                            isMac: isMac,
                            onZoomIn: ()=>canvas.setZoom((z)=>Math.min(z + 0.1, 5)),
                            onZoomOut: ()=>canvas.setZoom((z)=>Math.max(z - 0.1, 0.1)),
                            onResetView: canvas.centrarlVista
                        }, void 0, false, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 112,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 69,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$panels$2f$panel$2d$propiedades$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PanelPropiedades"], {
                    panelActivo: canvas.panelActivo,
                    setPanelActivo: canvas.setPanelActivo,
                    tipoMapa: canvas.tipoMapa,
                    sectores: canvas.sectores,
                    mesaActiva: canvas.mesaActiva,
                    idsSeleccionados: canvas.idsSeleccionados,
                    hayMesasBloqueadas: canvas.hayMesasBloqueadas,
                    limitesSlider: canvas.limitesSlider,
                    onActualizarMesa: canvas.actualizarMesa,
                    onActualizarDiametro: canvas.actualizarDiametro,
                    onToggleLado: canvas.toggleLado,
                    onToggleBloqueo: canvas.toggleBloqueo,
                    onDuplicar: canvas.duplicarMesasSeleccionadas,
                    onEliminar: ()=>setMostrarModalEliminar(true),
                    onEditarNombre: ()=>setMostrarModalNombre(true),
                    onAgregarSector: canvas.agregarSector,
                    onActualizarSector: canvas.actualizarSector,
                    onEliminarSector: canvas.eliminarSector,
                    onGuardarHistorial: canvas.guardarHistorial
                }, void 0, false, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 122,
                    columnNumber: 9
                }, this),
                mostrarModalEliminar && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$modals$2f$modal$2d$confirmacion$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ModalConfirmacion"], {
                    mensaje: `¿Eliminar ${canvas.idsSeleccionados.length} mesa(s)?`,
                    onConfirmar: ()=>{
                        canvas.guardarHistorial();
                        canvas.eliminarSeleccionadas();
                        setMostrarModalEliminar(false);
                    },
                    onCancelar: ()=>setMostrarModalEliminar(false)
                }, void 0, false, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 146,
                    columnNumber: 11
                }, this),
                mostrarModalNombre && canvas.mesaActiva && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$modals$2f$modal$2d$nombre$2d$mesa$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ModalNombreMesa"], {
                    valorInicial: canvas.mesaActiva.etiqueta,
                    onConfirmar: (nuevoNombre)=>{
                        canvas.actualizarMesa("etiqueta", nuevoNombre);
                        setMostrarModalNombre(false);
                    },
                    onCancelar: ()=>setMostrarModalNombre(false)
                }, void 0, false, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 158,
                    columnNumber: 11
                }, this),
                canvas.mostrarAyudaAtajos && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$modals$2f$modal$2d$ayuda$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ModalAyuda"], {
                    isMac: isMac,
                    onClose: ()=>canvas.setMostrarAyudaAtajos(false)
                }, void 0, false, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 168,
                    columnNumber: 39
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/app/page.tsx",
            lineNumber: 39,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/page.tsx",
        lineNumber: 38,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=_f71de359._.js.map