//======================================
// MEJORAS.JS
// Módulo de mejoras aprobadas:
// - Variación vs. periodo anterior y
//   semaforización en los KPIs
// - Barra meta/real en cumplimiento
// - Modo "Comparar vs. periodo anterior"
// - Buscador en Detalle por Ejecutivo
// - Badge de alertas críticas en el nav
//======================================

//======================================
// ESTADO
//======================================

window.modoComparacionActivo = window.modoComparacionActivo || false;

//======================================
// PERIODO ANTERIOR
// (mismo tamaño de ventana de DÍA que el
// periodo filtrado actual, tomado justo
// antes, respetando ejecutivo/antigüedad
// si están filtrados)
//======================================

function obtenerRangoDiasFiltrados() {

    const dias = dataFiltrada
        .map(f => Number(f["DIA"]))
        .filter(d => !isNaN(d));

    if (!dias.length) return null;

    return {
        min: Math.min(...dias),
        max: Math.max(...dias)
    };

}

function obtenerDataPeriodoAnterior() {

    //----------------------------------
    // El campo DIA reinicia en cada mes
    // (1 a 31), así que "periodo anterior"
    // se define como el MISMO rango de días,
    // pero del mes calendario anterior —
    // no como una resta directa de DIA que
    // termine cruzando hacia otro mes.
    //----------------------------------

    const mesActual = document.getElementById("filtroMes")?.value ||
        (typeof obtenerUltimoMesDisponible === "function" ? obtenerUltimoMesDisponible() : null);

    const mesAnterior = (typeof obtenerMesAnterior === "function")
        ? obtenerMesAnterior(mesActual)
        : null;

    if (!mesAnterior) return [];

    const rango = obtenerRangoDiasFiltrados();

    const ejecutivo = document.getElementById("filtroEjecutivo")?.value || "";
    const antiguedad = document.getElementById("filtroAntiguedad")?.value || "";

    return masterData.filter(f => {

        if (String(f["MES"] || "") !== mesAnterior) return false;

        if (rango) {

            const dia = Number(f["DIA"]);

            if (dia < rango.min || dia > rango.max) return false;

        }

        if (ejecutivo && String(f["EJECUTIVO"] || "") !== ejecutivo) return false;

        if (antiguedad && String(f["ANTIGÜEDAD"] || "") !== antiguedad) return false;

        return true;

    });

}

function sumarEn(dataset, columna) {

    return dataset.reduce((total, fila) => total + Number(fila[columna] || 0), 0);

}

function obtenerKPIsPeriodoAnterior() {

    const ds = obtenerDataPeriodoAnterior();

    if (!ds.length) return null;

    const solicitudes = sumarEn(ds, "SOLICITUDES");
    const habilitadas = sumarEn(ds, "HABILITADAS");
    const cuotaSol = sumarEn(ds, "CUOTA SOL");
    const cuotaHab = sumarEn(ds, "CUOTA HAB");
    const dias = sumarEn(ds, "TO PROD");
    const programado = sumarEn(ds, "PROGRAMADO");
    const conexion = sumarEn(ds, "CONEXIÓN");

    return {

        solicitudes,
        habilitadas,

        conversion: solicitudes ? (habilitadas / solicitudes) * 100 : 0,

        productividad: dias ? solicitudes / dias : 0,

        adherencia: programado ? (conexion / programado) * 100 : 0,

        cumplimientoSolicitudes: cuotaSol ? (solicitudes / cuotaSol) * 100 : 0,

        cumplimientoHabilitadas: cuotaHab ? (habilitadas / cuotaHab) * 100 : 0

    };

}

function calcularVariacion(actual, anterior) {

    if (anterior === null || anterior === undefined || anterior === 0) return null;

    return ((actual - anterior) / anterior) * 100;

}

//======================================
// RENDER DE DELTA (▲ / ▼)
//======================================

function renderDelta(id, actual, anterior) {

    const el = document.getElementById(id);

    if (!el) return;

    const variacion = calcularVariacion(actual, anterior);

    if (variacion === null) {

        el.innerHTML = `<span class="kpi-delta-sin">Sin periodo anterior comparable</span>`;
        return;

    }

    const positivo = variacion >= 0;

    const claseColor = positivo ? "kpi-delta-up" : "kpi-delta-down";
    const flecha = positivo ? "▲" : "▼";

    el.innerHTML = `
        <span class="${claseColor}">
            ${flecha} ${Math.abs(variacion).toFixed(1)}% vs. periodo anterior
        </span>
    `;

}

//======================================
// SEMÁFORO DE TARJETAS KPI
//======================================

function aplicarSemaforoTarjeta(idCard, valor, meta) {

    const card = document.getElementById(idCard);

    if (!card || !meta) return;

    const progreso = (valor / meta) * 100;

    card.classList.remove("kpi-ok", "kpi-alerta", "kpi-critico");

    if (progreso >= 100) {
        card.classList.add("kpi-ok");
    } else if (progreso >= 90) {
        card.classList.add("kpi-alerta");
    } else {
        card.classList.add("kpi-critico");
    }

}

function actualizarBarraProgreso(idBarra, valor) {

    const barra = document.getElementById(idBarra);

    if (!barra) return;

    const ancho = Math.max(Math.min(valor, 140), 0);

    barra.style.width = ancho + "%";

    barra.style.background =
        valor >= 100 ? "var(--verde)" :
        valor >= 90  ? "var(--amarillo)" : "var(--rojo)";

}

//======================================
// ACTUALIZAR COMPARATIVO + SEMÁFOROS
//======================================

function actualizarComparativoKPIs() {

    const actual = {

        solicitudes: totalSolicitudes(),
        habilitadas: totalHabilitadas(),
        conversion: conversion(),
        productividad: productividad(),
        adherencia: adherencia(),
        cumplimientoSolicitudes: cumplimientoSolicitudes(),
        cumplimientoHabilitadas: cumplimientoHabilitadas()

    };

    const anterior = obtenerKPIsPeriodoAnterior();

    renderDelta("deltaCuotaSol", actual.cumplimientoSolicitudes, anterior?.cumplimientoSolicitudes);
    renderDelta("deltaCuotaHab", actual.cumplimientoHabilitadas, anterior?.cumplimientoHabilitadas);
    renderDelta("deltaSolicitudes", actual.solicitudes, anterior?.solicitudes);
    renderDelta("deltaHabilitadas", actual.habilitadas, anterior?.habilitadas);
    renderDelta("deltaConversion", actual.conversion, anterior?.conversion);
    renderDelta("deltaProductividad", actual.productividad, anterior?.productividad);
    renderDelta("deltaAdherencia", actual.adherencia, anterior?.adherencia);

    actualizarBarraProgreso("progCuotaSol", actual.cumplimientoSolicitudes);
    actualizarBarraProgreso("progCuotaHab", actual.cumplimientoHabilitadas);

    aplicarSemaforoTarjeta("cardCuotaSol", actual.cumplimientoSolicitudes, 100);
    aplicarSemaforoTarjeta("cardCuotaHab", actual.cumplimientoHabilitadas, 100);

    const metas = (typeof CONFIG !== "undefined" && CONFIG.METAS) ? CONFIG.METAS : {};

    aplicarSemaforoTarjeta("cardConversion", actual.conversion, metas.CONVERSION);
    aplicarSemaforoTarjeta("cardProductividad", actual.productividad, metas.PRODUCTIVIDAD);
    aplicarSemaforoTarjeta("cardAdherencia", actual.adherencia, metas.ADHERENCIA);

}

//======================================
// MODO "COMPARAR VS. PERIODO ANTERIOR"
//======================================

function inicializarBotonComparar() {

    const btn = document.getElementById("btnCompararPeriodo");

    if (!btn || btn.dataset.inicializado) return;

    btn.dataset.inicializado = "1";

    btn.addEventListener("click", () => {

        window.modoComparacionActivo = !window.modoComparacionActivo;

        btn.classList.toggle("activo", window.modoComparacionActivo);

        document.querySelector(".kpis")?.classList.toggle(
            "modo-comparacion",
            window.modoComparacionActivo
        );

        if (typeof renderGraficoTendencia === "function") {
            renderGraficoTendencia();
        }

    });

}

//======================================
// BADGE DE ALERTAS CRÍTICAS
// (visible en el nav, en cualquier pestaña)
//======================================

function actualizarBadgeAlertas() {

    const badge = document.getElementById("navBadgeAlertas");

    if (!badge) return;

    let criticos = 0;

    if (typeof obtenerResumenSupervision === "function") {

        criticos = obtenerResumenSupervision().criticos || 0;

    }

    if (criticos > 0) {

        badge.textContent = criticos;
        badge.style.display = "inline-flex";

    } else {

        badge.style.display = "none";

    }

}

//======================================
// BUSCADOR: DETALLE POR EJECUTIVO
//======================================

function inicializarBuscadorEjecutivo() {

    const input = document.getElementById("buscadorEjecutivo");

    if (!input || input.dataset.inicializado) return;

    input.dataset.inicializado = "1";

    input.addEventListener("input", () => {

        const texto = input.value.trim().toLowerCase();

        const filas = document.querySelectorAll("#tablaEjecutivos tbody tr");

        filas.forEach(fila => {

            if (fila.classList.contains("fila-total-ejecutivos")) return;

            const nombre = (fila.children[0]?.textContent || "").toLowerCase();

            fila.style.display = nombre.includes(texto) ? "" : "none";

        });

    });

}

//======================================
// ORQUESTADOR
//======================================

function aplicarMejorasDashboard() {

    actualizarComparativoKPIs();

    inicializarBotonComparar();

    actualizarBadgeAlertas();

    inicializarBuscadorEjecutivo();

    // El buscador limpia su filtro cada vez que se
    // reconstruye la tabla (nuevo filtro/refresco)
    const input = document.getElementById("buscadorEjecutivo");
    if (input) input.value = "";

}
