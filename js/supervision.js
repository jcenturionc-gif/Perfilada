//======================================
// SUPERVISION.JS
// Supervisión Inteligente v2
//======================================

function obtenerSupervision() {

    const ranking = obtenerRanking();

    //----------------------------------
    // Solo personal activo según el
    // último día de gestión disponible.
    //----------------------------------

    const activos = (typeof nombresEjecutivosActivos === "function")
        ? nombresEjecutivosActivos()
        : null;

    const rankingActivo = activos
        ? ranking.filter(e => activos.has(e.ejecutivo))
        : ranking;

    return rankingActivo.map(e => {

        let estado = "🟢 Excelente";
        let color = "#16a34a";
        let prioridad = 3;
        let motivo = "Sin observaciones";

        if (e.score < 85) {
            estado = "🟡 Seguimiento";
            color = "#f59e0b";
            prioridad = 2;
            motivo = "Seguimiento preventivo";
        }

        if (e.score < 70) {
            estado = "🔴 Crítico";
            color = "#dc2626";
            prioridad = 1;
            motivo = "Score bajo";
        }

        if (e.productividad < 1) {
            prioridad = 1;
            motivo = "Baja productividad";
        }

        if (e.conversion < 20) {
            prioridad = 1;
            motivo = "Baja conversión";
        }

        if (e.adherencia < 90) {
            prioridad = Math.min(prioridad, 2);
            if (motivo === "Sin observaciones")
                motivo = "Baja adherencia";
        }

        return {

            ejecutivo: e.ejecutivo,

            estado,

            color,

            prioridad,

            motivo,

            score: e.score,

            conversion: e.conversion,

            productividad: e.productividad,

            adherencia: e.adherencia,

            solicitudes: e.solicitudes,

            habilitadas: e.habilitadas,

            registros: e.registros,

            llamadas: e.totalLlamadas

        };

    })

    .sort((a,b)=>a.prioridad-b.prioridad || a.score-b.score);

}

//======================================
// Prioridades
//======================================

function obtenerPrioridades(){

    return obtenerSupervision()

        .filter(e=>e.prioridad<=2)

        .slice(0,4);

}

//======================================
// Ejecutivos críticos
//======================================

function obtenerCriticos(){

    return obtenerSupervision()

        .filter(e=>e.estado.includes("🔴"));

}

//======================================
// Resumen Supervisión
//======================================

function obtenerResumenSupervision(){

    const lista = obtenerSupervision();

    return{

        excelentes: lista.filter(e=>e.estado.includes("🟢")).length,

        seguimiento: lista.filter(e=>e.estado.includes("🟡")).length,

        criticos: lista.filter(e=>e.estado.includes("🔴")).length

    };

}