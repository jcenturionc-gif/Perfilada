//======================================
// WEEKLY.JS
// Totalizador por semana + comparativos
//======================================

//======================================
// TOTALIZAR UN CONJUNTO DE REGISTROS
// (función base reutilizada por semana
// individual y por el total general)
//======================================

function totalizarConjunto(registros, etiqueta) {

    const solicitudes = registros.reduce((s, f) => s + Number(f["SOLICITUDES"] || 0), 0);
    const habilitadas = registros.reduce((s, f) => s + Number(f["HABILITADAS"] || 0), 0);
    const dias = registros.reduce((s, f) => s + Number(f["TO PROD"] || 0), 0);
    const programado = registros.reduce((s, f) => s + Number(f["PROGRAMADO"] || 0), 0);
    const conexion = registros.reduce((s, f) => s + Number(f["CONEXIÓN"] || 0), 0);
    const cuotaSol = registros.reduce((s, f) => s + Number(f["CUOTA SOL"] || 0), 0);
    const cuotaHab = registros.reduce((s, f) => s + Number(f["CUOTA HAB"] || 0), 0);
    const esim = registros.reduce((s, f) => s + Number(f["S. ESIM"] || 0), 0);
    const e2h = registros.reduce((s, f) => s + Number(f["S. E2H"] || 0), 0);
    const ea = registros.reduce((s, f) => s + Number(f["S. EA"] || 0), 0);
    const dr = registros.reduce((s, f) => s + Number(f["S. DR"] || 0), 0);
    const rt = registros.reduce((s, f) => s + Number(f["S. RT"] || 0), 0);
    const llamadasIn = registros.reduce((s, f) => s + Number(f["LLAMADAS IN"] || 0), 0);
    const llamadasOut = registros.reduce((s, f) => s + Number(f["LLAMADAS OU"] || 0), 0);
    const tiempoHablado = registros.reduce((s, f) => s + Number(f["TIEMPO HABLADO"] || 0), 0);

    const ejecutivosSemana = new Set(
        registros.map(f => f["EJECUTIVO"]).filter(Boolean)
    ).size;

    return {

        semana: etiqueta,
        solicitudes,
        habilitadas,
        ejecutivos: ejecutivosSemana,
        conversion: solicitudes > 0 ? (habilitadas / solicitudes) * 100 : 0,
        productividad: dias > 0 ? solicitudes / dias : 0,
        adherencia: programado > 0 ? (conexion / programado) * 100 : 0,
        cumplimientoSolicitudes: cuotaSol > 0 ? (solicitudes / cuotaSol) * 100 : 0,
        cumplimientoHabilitadas: cuotaHab > 0 ? (habilitadas / cuotaHab) * 100 : 0,
        participacionEsim: solicitudes > 0 ? (esim / solicitudes) * 100 : 0,
        participacionE2H: solicitudes > 0 ? (e2h / solicitudes) * 100 : 0,
        participacionEA: solicitudes > 0 ? (ea / solicitudes) * 100 : 0,
        participacionDR: solicitudes > 0 ? (dr / solicitudes) * 100 : 0,
        participacionRT: solicitudes > 0 ? (rt / solicitudes) * 100 : 0,
        tmo: (llamadasIn + llamadasOut) > 0 ? tiempoHablado / (llamadasIn + llamadasOut) : 0

    };

}

//======================================
// TOTALIZAR UNA SEMANA
//======================================

function totalizarSemana(base, numeroSemana) {

    if (numeroSemana === null || numeroSemana === undefined) return null;

    const registros = base.filter(f => Number(f["SEMANA"] || 0) === numeroSemana);

    return totalizarConjunto(registros, numeroSemana);

}

//======================================
// BASE DE DATOS PARA COMPARATIVOS
// (respeta el mes filtrado —por defecto el
// último mes de la data— para que el Resumen
// Ejecutivo no mezcle semanas de otros meses)
//======================================

function baseSemanal() {

    return (typeof dataFiltrada !== "undefined") ? dataFiltrada : masterData;

}

//======================================
// SEMANA ACTUAL VS. SEMANA ANTERIOR
//======================================

function obtenerComparativoSemanal() {

    const base = baseSemanal();

    const semanas = [...new Set(base.map(f => Number(f["SEMANA"] || 0)))].sort((a, b) => b - a);

    if (semanas.length === 0) return null;

    const semanaActual = semanas[0];
    const semanaAnterior = semanas.length > 1 ? semanas[1] : null;

    const actual = totalizarSemana(base, semanaActual);
    const anterior = totalizarSemana(base, semanaAnterior);

    function variacion(valorActual, valorAnterior) {

        if (!anterior || valorAnterior === 0 || valorAnterior === null || valorAnterior === undefined) {
            return null;
        }

        return ((valorActual - valorAnterior) / valorAnterior) * 100;

    }

    const metricas = [
        "solicitudes", "habilitadas", "conversion", "productividad", "adherencia",
        "cumplimientoSolicitudes", "cumplimientoHabilitadas",
        "participacionEsim", "participacionE2H", "participacionEA",
        "participacionDR", "participacionRT", "tmo"
    ];

    const variaciones = {};

    metricas.forEach(m => {
        variaciones[m] = anterior ? variacion(actual[m], anterior[m]) : null;
    });

    return {

        semanaActual,
        semanaAnterior,
        actual,
        anterior,
        variaciones

    };

}

//======================================
// SERIE COMPLETA: TODAS LAS SEMANAS
// (ordenadas de la más antigua a la más reciente)
//======================================

function obtenerSerieSemanal() {

    const base = baseSemanal();

    const semanas = [...new Set(base.map(f => Number(f["SEMANA"] || 0)))].sort((a, b) => a - b);

    return semanas.map(s => totalizarSemana(base, s));

}

//======================================
// TOTAL GENERAL (TODAS LAS SEMANAS JUNTAS)
//======================================

function obtenerTotalSemanal() {

    const base = baseSemanal();

    return totalizarConjunto(base, "Total");

}
