//======================================
// RANKING.JS
// Dashboard Gerencial ENTEL
//======================================

//======================================
// RANKING COMPLETO
//======================================

function obtenerRanking() {

    return obtenerResumenEjecutivos();

}

//======================================
// MEJOR EJECUTIVO
//======================================

function obtenerMejorEjecutivo() {

    const ranking = obtenerRanking();

    return ranking.length
        ? ranking[0]
        : null;

}

//======================================
// PEOR EJECUTIVO
//======================================

function obtenerPeorEjecutivo() {

    const ranking = obtenerRanking();

    return ranking.length
        ? ranking[ranking.length - 1]
        : null;

}

//======================================
// BUSCAR EJECUTIVO
//======================================

function obtenerEjecutivo(nombre) {

    return obtenerRanking().find(

        e => e.ejecutivo === nombre

    ) || null;

}

//======================================
// RESUMEN DEL RANKING
//======================================

function obtenerResumenRanking() {

    const ranking = obtenerRanking();

    const total = ranking.length;

    return {

        total,

        promedio: total
            ? ranking.reduce((s, e) => s + e.score, 0) / total
            : 0,

        destacados:
            ranking.filter(e => e.nivel === "Destacado").length,

        buenos:
            ranking.filter(e => e.nivel === "Bueno").length,

        mejorables:
            ranking.filter(e => e.nivel === "Mejorable").length,

        criticos:
            ranking.filter(e => e.nivel === "Crítico").length

    };

}
//======================================
// TOP 5 SCORE
//======================================

function obtenerTop5() {

    return obtenerRanking()

        .slice(0, 5);

}

//======================================
// BOTTOM 5 SCORE
//======================================

function obtenerBottom5() {

    return [...obtenerRanking()]

        .reverse()

        .slice(0, 5);

}

//======================================
// TOP 5 CONVERSIÓN
//======================================

function topConversion() {

    return [...obtenerRanking()]

        .sort((a, b) => b.conversion - a.conversion)

        .slice(0, 5);

}

//======================================
// TOP 5 PRODUCTIVIDAD
//======================================

function topProductividad() {

    return [...obtenerRanking()]

        .sort((a, b) => b.productividad - a.productividad)

        .slice(0, 5);

}

//======================================
// TOP 5 ADHERENCIA
//======================================

function topAdherencia() {

    return [...obtenerRanking()]

        .sort((a, b) => b.adherencia - a.adherencia)

        .slice(0, 5);

}

//======================================
// TOP 5 HABILITADAS
//======================================

function topHabilitadas() {

    return [...obtenerRanking()]

        .sort((a, b) => b.habilitadas - a.habilitadas)

        .slice(0, 5);

}
//======================================
// TOP 10 SCORE
//======================================

function obtenerTop10() {

    return obtenerRanking()

        .slice(0, 10);

}

//======================================
// BOTTOM 10 SCORE
//======================================

function obtenerBottom10() {

    return [...obtenerRanking()]

        .reverse()

        .slice(0, 10);

}

//======================================
// CUARTILES
//======================================

function obtenerCuartiles() {

    const ranking = obtenerRanking();

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
// RESUMEN DEL SCORE
//======================================

function obtenerResumenScore() {

    const ranking = obtenerRanking();

    return {

        promedio:
            ranking.length
                ? ranking.reduce((s, e) => s + e.score, 0) / ranking.length
                : 0,

        destacados:
            ranking.filter(e => e.nivel === "Destacado").length,

        buenos:
            ranking.filter(e => e.nivel === "Bueno").length,

        mejorables:
            ranking.filter(e => e.nivel === "Mejorable").length,

        criticos:
            ranking.filter(e => e.nivel === "Crítico").length,

        mejor:
            ranking.length
                ? ranking[0]
                : null,

        peor:
            ranking.length
                ? ranking[ranking.length - 1]
                : null

    };

}
