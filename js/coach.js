//======================================
// COACH.JS
// Coach IA Gerencial v2
//======================================

function generarCoach() {

    const panel = document.getElementById("coachIA");

    if (!panel) return;

    const ranking = obtenerRanking();

    if (!ranking.length) {

        panel.innerHTML = `
            <div class="alerta warning">
                No existen datos para analizar.
            </div>
        `;

        return;

    }

    //--------------------------------------
    // Datos generales
    //--------------------------------------

    const resumen = obtenerResumenRanking();

    const promedio = resumen.promedio;

    const mejor = ranking[0];

    const criticos = ranking
        .filter(e => e.score < 70)
        .slice(0,3);

    //--------------------------------------
    // Estado del equipo
    //--------------------------------------

    let estado = "🟢 Excelente";

    if(promedio < 80)
        estado = "🟡 Atención";

    if(promedio < 65)
        estado = "🔴 Riesgo";

    //--------------------------------------

    let html = "";

    //--------------------------------------
    // Estado general
    //--------------------------------------

    html += `

    <div class="coach-card coach-info">

        <h3>🤖 Resumen Ejecutivo IA</h3>

        <p>

            Estado del equipo:
            <strong>${estado}</strong>

        </p>

        <ul>

            <li>Score promedio: <b>${promedio.toFixed(1)}</b></li>

            <li>Destacados: <b>${resumen.destacados}</b></li>

            <li>Críticos: <b>${resumen.criticos}</b></li>

        </ul>

    </div>

    `;

    //--------------------------------------
    // Prioridades
    //--------------------------------------

    html += `

    <div class="coach-card coach-warning">

        <h3>🚨 Prioridades del Día</h3>

        <ul>

    `;

    criticos.forEach(e=>{

        html+=`

            <li>

                <b>${e.ejecutivo}</b><br>

                Score ${e.score.toFixed(1)}<br>

                <span class="coach-accion">👉 ${sugerirAccionEjecutivo(e)}</span>

            </li>

        `;

    });

    html+=`

        </ul>

    </div>

    `;

    //--------------------------------------
    // Recomendaciones IA
    //--------------------------------------

    html+=`

    <div class="coach-card coach-danger">

        <h3>💡 Recomendaciones IA</h3>

        <ul>

    `;

    if(resumen.criticos>0){

        html+=`

            <li>Realizar coaching individual a ejecutivos críticos.</li>

        `;

    }

    if(promedio<80){

        html+=`

            <li>Reforzar técnicas de cierre comercial.</li>

        `;

    }

    if(topConversion()[0].conversion<40){

        html+=`

            <li>Revisar el discurso comercial del equipo.</li>

        `;

    }

    html+=`

        <li>Dar seguimiento diario a productividad.</li>

        <li>Compartir mejores prácticas del mejor ejecutivo.</li>

        </ul>

    </div>

    `;

    //--------------------------------------
    // Reconocimiento
    //--------------------------------------

    html+=`

    <div class="coach-card coach-ok">

        <h3>🏆 Reconocimiento</h3>

        <p>

            El mejor ejecutivo del día es

            <strong>${mejor.ejecutivo}</strong>

        </p>

        <ul>

            <li>Score: ${mejor.score.toFixed(1)}</li>

            <li>Conversión: ${mejor.conversion.toFixed(1)}%</li>

            <li>Productividad: ${mejor.productividad.toFixed(2)}</li>

        </ul>

    </div>

    `;

    //--------------------------------------
    // Historial de Alertas
    //--------------------------------------

    const historial = registrarYObtenerHistorialAlertas(resumen.criticos);

    if (historial.length > 1) {

        html += `

        <div class="coach-card coach-historial">

            <h3>📜 Historial de Alertas</h3>

            <ul class="coach-historial-lista">

                ${historial.map(h => `
                    <li>
                        <span>${h.fecha}</span>
                        <span class="${h.criticos > 0 ? 'kpi-delta-down' : 'kpi-delta-up'}">
                            ${h.criticos} crítico(s)
                        </span>
                    </li>
                `).join("")}

            </ul>

        </div>

        `;

    }

    panel.innerHTML = html;

}

//======================================
// PRÓXIMA ACCIÓN SUGERIDA POR EJECUTIVO
//======================================

function sugerirAccionEjecutivo(e) {

    if (e.productividad < 1) {

        return `Agendar coaching 1:1 enfocado en productividad (actual ${e.productividad.toFixed(2)}).`;

    }

    if (e.conversion < 40) {

        return `Reforzar guion/técnica de cierre — conversión en ${e.conversion.toFixed(1)}%.`;

    }

    if (e.adherencia < 90) {

        return `Revisar cumplimiento de horario conectado — adherencia en ${e.adherencia.toFixed(1)}%.`;

    }

    return `Dar seguimiento diario cercano hasta recuperar el score.`;

}

//======================================
// HISTORIAL DE ALERTAS (localStorage)
// Guarda un snapshot por día del número
// de ejecutivos críticos, para ver si las
// acciones tomadas están funcionando.
//======================================

const HISTORIAL_ALERTAS_KEY = "entel_historial_alertas_ia";
const HISTORIAL_ALERTAS_MAX = 10;

function registrarYObtenerHistorialAlertas(criticosHoy) {

    let historial = [];

    try {

        historial = JSON.parse(localStorage.getItem(HISTORIAL_ALERTAS_KEY) || "[]");

    } catch (err) {

        historial = [];

    }

    const hoy = new Date().toLocaleDateString("es-PE");

    const existente = historial.find(h => h.fecha === hoy);

    if (existente) {

        existente.criticos = criticosHoy;

    } else {

        historial.push({ fecha: hoy, criticos: criticosHoy });

    }

    if (historial.length > HISTORIAL_ALERTAS_MAX) {

        historial = historial.slice(historial.length - HISTORIAL_ALERTAS_MAX);

    }

    try {

        localStorage.setItem(HISTORIAL_ALERTAS_KEY, JSON.stringify(historial));

    } catch (err) {

        // localStorage no disponible: se omite el historial persistente
    }

    return historial;

}