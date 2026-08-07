//======================================
// SCORE.JS
// Motor de Score Gerencial
//======================================

//======================================
// PESOS DEL SCORE
//======================================

const PESOS_SCORE = {

    cumplimientoSol : 0.25,

    cumplimientoHab : 0.25,

    conversion      : 0.15,

    conversionESIM  : 0.10,

    conversionE2H   : 0.10,

    conversionEA    : 0.10,

    adherencia      : 0.05

};

//======================================
// METAS OPERACIONALES
//======================================

const METAS = {

    conversion:80,

    esim:15,

    express2H:20,

    expressAgendado:25

};

//======================================
// TRAMOS DE PUNTAJE SEGÚN CUMPLIMIENTO
// (100%+ = 100 · 90%-99.99% = 50 ·
//  80%-89.99% = 25 · <80% = 0)
//======================================

function tramoPuntajeCumplimiento(progresoPct) {

    const progreso = Number(progresoPct || 0);

    if (progreso >= 100) return 100;

    if (progreso >= 90) return 50;

    if (progreso >= 80) return 25;

    return 0;

}

//======================================
// CALCULAR SCORE
//======================================

function calcularScore(e){

    //----------------------------------
    // Cada indicador aporta puntaje
    // graduado según su % de cumplimiento
    // respecto a su propia meta:
    // 100%+ = 100% del peso
    // 90% a 99.99% = 50% del peso
    // 80% a 89.99% = 25% del peso
    // menor a 80% = 0
    //----------------------------------

    //----------------------------------
    // Cumplimiento Solicitudes
    // (ya viene expresado como % de la cuota)
    //----------------------------------

    const cumplimientoSol = tramoPuntajeCumplimiento(e.cumplimientoSol);

    //----------------------------------
    // Cumplimiento Habilitadas
    //----------------------------------

    const cumplimientoHab = tramoPuntajeCumplimiento(e.cumplimientoHab);

    //----------------------------------
    // Conversión
    //----------------------------------

    const progresoConversion = METAS.conversion > 0
        ? (Number(e.conversion || 0) / METAS.conversion) * 100
        : 0;

    const conversion = tramoPuntajeCumplimiento(progresoConversion);

    //----------------------------------
    // eSIM (participación sobre el total
    // de solicitudes, objetivo 15%)
    //----------------------------------

    const progresoESIM = METAS.esim > 0
        ? (Number(e.repESIM || 0) / METAS.esim) * 100
        : 0;

    const conversionESIM = tramoPuntajeCumplimiento(progresoESIM);

    //----------------------------------
    // Express 2 Horas (participación,
    // objetivo 20%)
    //----------------------------------

    const progresoE2H = METAS.express2H > 0
        ? (Number(e.repE2H || 0) / METAS.express2H) * 100
        : 0;

    const conversionE2H = tramoPuntajeCumplimiento(progresoE2H);

    //----------------------------------
    // Express Agendado (participación,
    // objetivo 25%)
    //----------------------------------

    const progresoEA = METAS.expressAgendado > 0
        ? (Number(e.repEA || 0) / METAS.expressAgendado) * 100
        : 0;

    const conversionEA = tramoPuntajeCumplimiento(progresoEA);

    //----------------------------------
    // Adherencia
    //----------------------------------

    const adherencia = tramoPuntajeCumplimiento(e.adherencia);

    //----------------------------------
    // SCORE FINAL
    //----------------------------------

    const score =

        (cumplimientoSol * PESOS_SCORE.cumplimientoSol) +

        (cumplimientoHab * PESOS_SCORE.cumplimientoHab) +

        (conversion * PESOS_SCORE.conversion) +

        (conversionESIM * PESOS_SCORE.conversionESIM) +

        (conversionE2H * PESOS_SCORE.conversionE2H) +

        (conversionEA * PESOS_SCORE.conversionEA) +

        (adherencia * PESOS_SCORE.adherencia);

    return Number(

        score.toFixed(2)

    );

}
//======================================
// COLOR DEL SCORE
//======================================

function colorScore(score) {

    if (score >= 95)
        return "#16a34a";

    if (score >= 85)
        return "#65a30d";

    if (score >= 70)
        return "#f59e0b";

    return "#dc2626";

}

//======================================
// NIVEL DEL SCORE
//======================================

function nivelScore(score) {

    if (score >= 95)
        return "Destacado";

    if (score >= 85)
        return "Bueno";

    if (score >= 70)
        return "Mejorable";

    return "Crítico";

}

//======================================
// DETALLE DEL SCORE
//======================================

function obtenerDetalleScore(e) {

    return [

        {
            indicador: "Meta Solicitudes",
            valor: e.cumplimientoSol,
            meta: 100,
            cumple: e.cumplimientoSol >= 100
        },

        {
            indicador: "Meta Habilitadas",
            valor: e.cumplimientoHab,
            meta: 100,
            cumple: e.cumplimientoHab >= 100
        },

        {
            indicador: "Conversión",
            valor: e.conversion,
            meta: 80,
            cumple: e.conversion >= 80
        },

        {
            indicador: "Participación eSIM",
            valor: e.repESIM,
            meta: 15,
            cumple: e.repESIM >= 15
        },

        {
            indicador: "Participación Express 2 Horas",
            valor: e.repE2H,
            meta: 20,
            cumple: e.repE2H >= 20
        },

        {
            indicador: "Participación Express Agendado",
            valor: e.repEA,
            meta: 25,
            cumple: e.repEA >= 25
        },

        {
            indicador: "Adherencia",
            valor: e.adherencia,
            meta: 100,
            cumple: e.adherencia >= 100
        }

    ];

}
//======================================
// DESGLOSE DETALLADO DEL SCORE
// (para la ficha individual del asesor)
//======================================

function obtenerDesgloseScore(e) {

    const filas = [

        { clave:"cumplimientoSol", nombre:"Cumpl. Cuota Solicitudes",       icono:"📋", valor:e.cumplimientoSol, meta:100,                  unidad:"%", peso:PESOS_SCORE.cumplimientoSol },
        { clave:"cumplimientoHab", nombre:"Cumpl. Cuota Habilitadas",       icono:"✅", valor:e.cumplimientoHab, meta:100,                  unidad:"%", peso:PESOS_SCORE.cumplimientoHab },
        { clave:"conversion",      nombre:"Conversión",                     icono:"🎯", valor:e.conversion,      meta:METAS.conversion,      unidad:"%", peso:PESOS_SCORE.conversion },
        { clave:"conversionESIM",  nombre:"Participación eSIM",             icono:"📶", valor:e.repESIM,         meta:METAS.esim,            unidad:"%", peso:PESOS_SCORE.conversionESIM },
        { clave:"conversionE2H",   nombre:"Participación Express 2H",       icono:"📦", valor:e.repE2H,          meta:METAS.express2H,       unidad:"%", peso:PESOS_SCORE.conversionE2H },
        { clave:"conversionEA",    nombre:"Participación Express Agendado", icono:"📅", valor:e.repEA,           meta:METAS.expressAgendado,  unidad:"%", peso:PESOS_SCORE.conversionEA },
        { clave:"adherencia",      nombre:"Adherencia",                     icono:"⏰", valor:e.adherencia,      meta:100,                  unidad:"%", peso:PESOS_SCORE.adherencia }

    ];

    return filas.map(f => {

        const valorNum = Number(f.valor || 0);

        const progresoReal = f.meta > 0 ? (valorNum / f.meta) * 100 : 0;

        const progresoCapado = Math.min(progresoReal, 100);

        const cumple = progresoReal >= 100;

        const puntosMax = 100 * f.peso;

        //----------------------------------
        // Puntaje graduado: 100%+ = 100%,
        // 90%-99.99% = 50%, 80%-89.99% = 25%,
        // menor a 80% = 0
        //----------------------------------

        const tramoPct = tramoPuntajeCumplimiento(progresoReal);

        const puntos = puntosMax * (tramoPct / 100);

        const faltantePts = puntosMax - puntos;

        return {

            ...f,
            valorNum,
            progresoCapado,
            cumple,
            tramoPct,
            pesoPct: f.peso * 100,
            puntos,
            puntosMax,
            faltantePts

        };

    });

}

//======================================
// CUARTILES
//======================================

function obtenerCuartiles() {

    const ranking = obtenerRankingGeneral();

    const total = ranking.length;

    const q = Math.ceil(total / 4);

    return {

        Q1: ranking.slice(0, q),

        Q2: ranking.slice(q, q * 2),

        Q3: ranking.slice(q * 2, q * 3),

        Q4: ranking.slice(q * 3)

    };

}

//======================================
// RESUMEN SCORE
//======================================

function obtenerResumenScore() {

    const ranking = obtenerRankingGeneral();

    if (!ranking.length) {

        return {

            promedio: 0,
            destacados: 0,
            buenos: 0,
            mejorables: 0,
            criticos: 0,
            mejor: null,
            peor: null

        };

    }

    return {

        promedio:

            ranking.reduce((a, b) => a + b.score, 0) / ranking.length,

        destacados:

            ranking.filter(e => e.nivel === "Destacado").length,

        buenos:

            ranking.filter(e => e.nivel === "Bueno").length,

        mejorables:

            ranking.filter(e => e.nivel === "Mejorable").length,

        criticos:

            ranking.filter(e => e.nivel === "Crítico").length,

        mejor: ranking[0],

        peor: ranking[ranking.length - 1]

    };

}
