//======================================
// PLANACCION.JS
// Seguimiento del Plan de Acción
// Periodo oficial: 10 al 31 de agosto de 2026
//======================================

//----------------------------------
// CONFIGURACIÓN DEL PLAN
//----------------------------------

const PLAN_ACCION_META_PRODUCTIVIDAD = 2;

//----------------------------------
// BASE DEL DIAGNÓSTICO
// - Cuartiles: productividad del MES
//   ANTERIOR al mes en curso (ej. si el
//   mes en curso es Agosto, se clasifica
//   con el desempeño de Julio) → permite
//   ver el evolutivo mes a mes.
// - Universo: solo asesores que estaban
//   activos en el PRIMER día del mes en
//   curso (ej. 01 de Agosto), no todo el
//   histórico del mes.
//----------------------------------

function obtenerBaseDiagnosticoPlanAccion() {

    const base = (typeof masterData !== "undefined") ? masterData : [];

    const mesActual = (typeof obtenerUltimoMesDisponible === "function")
        ? obtenerUltimoMesDisponible()
        : null;

    const mesAnterior = (mesActual && typeof obtenerMesAnterior === "function")
        ? obtenerMesAnterior(mesActual)
        : null;

    //----------------------------------
    // Roster: activos en el primer día
    // disponible del mes en curso
    //----------------------------------

    const datosMesActual = base.filter(f => f["MES"] === mesActual);

    const diasMesActual = datosMesActual
        .map(f => Number(f["DIA"] || 0))
        .filter(n => n > 0);

    const primerDia = diasMesActual.length ? Math.min(...diasMesActual) : null;

    const nombresActivos = [...new Set(

        datosMesActual
            .filter(f => Number(f["DIA"]) === primerDia)
            .map(f => f["EJECUTIVO"])
            .filter(Boolean)

    )];

    //----------------------------------
    // Productividad de referencia:
    // mes anterior completo (línea base)
    //----------------------------------

    const datosMesAnterior = mesAnterior
        ? base.filter(f => f["MES"] === mesAnterior)
        : [];

    const resumenMesAnterior = datosMesAnterior.length
        ? obtenerResumenEjecutivos(datosMesAnterior)
        : [];

    const mapaMesAnterior = {};

    resumenMesAnterior.forEach(e => { mapaMesAnterior[e.ejecutivo] = e; });

    //----------------------------------
    // Productividad ACTUAL: todo lo que
    // llevamos cargado del mes en curso
    // (corte parcial, se actualiza solo
    // a medida que suben más días)
    //----------------------------------

    const resumenMesActual = datosMesActual.length
        ? obtenerResumenEjecutivos(datosMesActual)
        : [];

    const mapaMesActual = {};

    resumenMesActual.forEach(e => { mapaMesActual[e.ejecutivo] = e; });

    const ultimoDiaCargado = diasMesActual.length ? Math.max(...diasMesActual) : null;

    //----------------------------------
    // Cruce: roster del mes actual +
    // línea base (mes anterior) +
    // avance (mes en curso)
    //----------------------------------

    const lista = nombresActivos.map(nombre => {

        const previo = mapaMesAnterior[nombre] || null;
        const actual = mapaMesActual[nombre] || null;

        const productividadBase = previo ? previo.productividad : null;
        const productividadActual = actual ? actual.productividad : null;

        const variacionPct = (previo && actual && productividadBase > 0)
            ? ((productividadActual - productividadBase) / productividadBase) * 100
            : null;

        return {
            ejecutivo: nombre,
            productividadBase,
            tieneBase: !!previo,
            productividadActual,
            tieneActual: !!actual,
            variacionPct
        };

    });

    return { mesActual, mesAnterior, primerDia, ultimoDiaCargado, lista };

}

const PLAN_ACCION_FASES = [

    {
        numero: 1,
        nombre: "Diagnóstico y Priorización",
        inicio: new Date(2026, 7, 10),
        fin: new Date(2026, 7, 12),
        objetivo: "Identificar rápidamente las principales brechas de productividad y determinar dónde debe concentrarse la intervención.",
        entregable: "Matriz de diagnóstico individual por asesor.",
        hito: "12 de agosto · Diagnóstico cerrado (clasificación Q1-Q4, brecha individual, priorización, causa raíz preliminar, acción asignada)."
    },
    {
        numero: 2,
        nombre: "Intervención y Corrección",
        inicio: new Date(2026, 7, 13),
        fin: new Date(2026, 7, 19),
        objetivo: "Ejecutar acciones específicas según el cuartil y la causa raíz identificada.",
        entregable: "Primer corte de evolución de productividad y efectividad de las acciones.",
        hito: "19 de agosto · Primer control de impacto (quién mejoró, qué acción funcionó, dónde intervenir nuevamente)."
    },
    {
        numero: 3,
        nombre: "Medición y Ajuste",
        inicio: new Date(2026, 7, 20),
        fin: new Date(2026, 7, 25),
        objetivo: "Determinar si las acciones ejecutadas están generando resultados.",
        entregable: "Segundo corte de resultados y ajuste del plan.",
        hito: "25 de agosto · Segundo control de impacto (recalcular productividad, brecha, cuartil, tendencia y efectividad de las acciones)."
    },
    {
        numero: 4,
        nombre: "Cierre y Sostenibilidad",
        inicio: new Date(2026, 7, 26),
        fin: new Date(2026, 7, 31),
        objetivo: "Cerrar el período demostrando el impacto generado por el plan.",
        entregable: "Informe ejecutivo de cierre (situación inicial vs. resultado final, impacto por cuartil, aprendizajes, riesgos y recomendaciones).",
        hito: "31 de agosto · Cierre del Plan de Acción."
    }

];

const PLAN_ACCION_PLAYBOOK = {

    "Cuartil 1": {
        etiqueta: "POTENCIAR",
        color: "#16a34a",
        acciones: [
            "Identificar mejores prácticas",
            "Replicar comportamientos exitosos",
            "Mantener productividad",
            "Evitar caída de desempeño",
            "Identificar asesores referentes"
        ]
    },

    "Cuartil 2": {
        etiqueta: "DESBLOQUEAR",
        color: "#0ea5e9",
        acciones: [
            "Trabajar cierre",
            "Mejorar conversión",
            "Recuperar oportunidades",
            "Mejorar seguimiento",
            "Identificar la última brecha necesaria para alcanzar 2 portas"
        ]
    },

    "Cuartil 3": {
        etiqueta: "RECUPERAR",
        color: "#f59e0b",
        acciones: [
            "Coaching individual",
            "Escucha de llamadas",
            "Role play",
            "Corrección de sondeo",
            "Argumentación",
            "Manejo de objeciones",
            "Técnicas de cierre",
            "Seguimiento diario"
        ]
    },

    "Cuartil 4": {
        etiqueta: "INTERVENIR",
        color: "#dc2626",
        acciones: [
            "Diagnóstico individual",
            "Control de actividad",
            "Control de marcaciones",
            "Coaching intensivo",
            "Escucha de llamadas",
            "Role play",
            "Seguimiento intradía",
            "Compromisos diarios",
            "Medición de recuperación"
        ]
    }

};

const PLAN_ACCION_PRIORIDAD = {
    "Cuartil 1": "Baja",
    "Cuartil 2": "Media",
    "Cuartil 3": "Alta",
    "Cuartil 4": "Crítica"
};

//----------------------------------
// ORQUESTADOR
//----------------------------------

function construirPlanAccion() {

    construirLineaTiempoPlanAccion();
    construirKpisPlanAccion();
    construirPlaybookPlanAccion();
    construirMatrizDiagnosticoPlanAccion();

}

//----------------------------------
// FASE ACTUAL SEGÚN LA FECHA DE HOY
//----------------------------------

function obtenerEstadoFasePlanAccion(fase, hoy) {

    if (hoy < fase.inicio) return "pendiente";

    if (hoy > fase.fin) return "completada";

    return "actual";

}

//----------------------------------
// LÍNEA DE TIEMPO DE FASES
//----------------------------------

function construirLineaTiempoPlanAccion() {

    const cont = document.getElementById("planAccionLineaTiempo");

    if (!cont) return;

    const hoy = new Date();

    const opcionesFecha = { day: "2-digit", month: "short" };

    cont.innerHTML = PLAN_ACCION_FASES.map(fase => {

        const estado = obtenerEstadoFasePlanAccion(fase, hoy);

        const etiquetaEstado = estado === "actual"
            ? "🟢 En curso"
            : estado === "completada"
                ? "✔️ Completada"
                : "⏳ Próxima";

        return `

        <div class="fase-plan-accion fase-${estado}">

            <div class="fase-plan-accion-header">
                <span class="fase-plan-accion-numero">Fase ${fase.numero}</span>
                <span class="fase-plan-accion-estado">${etiquetaEstado}</span>
            </div>

            <h3>${fase.nombre}</h3>

            <span class="fase-plan-accion-fechas">
                ${fase.inicio.toLocaleDateString("es-PE", opcionesFecha)} — ${fase.fin.toLocaleDateString("es-PE", opcionesFecha)}
            </span>

            <p>${fase.objetivo}</p>

            <div class="fase-plan-accion-entregable">
                <strong>Entregable:</strong> ${fase.entregable}
            </div>

            <div class="fase-plan-accion-hito">
                🚩 ${fase.hito}
            </div>

        </div>

        `;

    }).join("");

}

//----------------------------------
// KPIs DEL PLAN (DISTRIBUCIÓN POR CUARTIL)
//----------------------------------

function construirKpisPlanAccion() {

    const cont = document.getElementById("planAccionKpis");

    if (!cont) return;

    const { lista } = obtenerBaseDiagnosticoPlanAccion();

    const conBase = lista.filter(e => e.tieneBase);
    const conAvance = lista.filter(e => e.tieneActual);
    const sinBase = lista.filter(e => !e.tieneBase);

    //----------------------------------
    // Distribución por cuartil: se usa
    // el estado ACTUAL (avance); si un
    // asesor todavía no tiene data del
    // mes en curso, se ubica con su
    // cuartil de línea base (julio)
    // como referencia provisional.
    //----------------------------------

    const totales = { "Cuartil 1": 0, "Cuartil 2": 0, "Cuartil 3": 0, "Cuartil 4": 0 };

    lista.forEach(e => {

        const productividadRef = e.tieneActual ? e.productividadActual : e.productividadBase;

        if (productividadRef === null || productividadRef === undefined) return;

        totales[cuartilProductividad(productividadRef)]++;

    });

    const totalEvaluado = conBase.length + sinBase.filter(e => e.tieneActual).length || 1;

    const promedioBase = conBase.length
        ? conBase.reduce((s, e) => s + e.productividadBase, 0) / conBase.length
        : 0;

    const promedioActual = conAvance.length
        ? conAvance.reduce((s, e) => s + e.productividadActual, 0) / conAvance.length
        : 0;

    const brechaActual = promedioActual - PLAN_ACCION_META_PRODUCTIVIDAD;

    const variacionEquipo = (promedioBase > 0 && conAvance.length)
        ? ((promedioActual - promedioBase) / promedioBase) * 100
        : null;

    const pct = n => ((n / totalEvaluado) * 100).toFixed(0);

    cont.innerHTML = `

        <div class="card card-kpi">
            <span>👥 Asesores Activos (Roster)</span>
            <h2>${lista.length}</h2>
            ${sinBase.length ? `<div class="kpi-delta">${sinBase.length} sin histórico previo</div>` : ""}
        </div>

        <div class="card card-kpi">
            <span>🏁 Productividad Julio (línea base)</span>
            <h2>${promedioBase.toFixed(2)}</h2>
            <div class="kpi-delta">Punto de partida del plan</div>
        </div>

        <div class="card card-kpi">
            <span>📈 Productividad Agosto (avance)</span>
            <h2>${conAvance.length ? promedioActual.toFixed(2) : "—"}</h2>
            <div class="kpi-delta" style="color:${brechaActual >= 0 ? '#16a34a' : '#dc2626'};">
                ${conAvance.length ? `Meta ${PLAN_ACCION_META_PRODUCTIVIDAD.toFixed(2)} (${brechaActual >= 0 ? "+" : ""}${brechaActual.toFixed(2)})` : "Aún sin datos de Agosto"}
            </div>
        </div>

        <div class="card card-kpi">
            <span>🔁 Variación vs. línea base</span>
            <h2 style="color:${variacionEquipo === null ? 'inherit' : (variacionEquipo >= 0 ? '#16a34a' : '#dc2626')};">
                ${variacionEquipo === null ? "—" : `${variacionEquipo >= 0 ? "+" : ""}${variacionEquipo.toFixed(1)}%`}
            </h2>
            <div class="kpi-delta">Julio → Agosto</div>
        </div>

        <div class="card card-kpi" style="border-left:4px solid #16a34a;">
            <span>🟢 Cuartil 1 · Potenciar</span>
            <h2>${totales["Cuartil 1"]}</h2>
            <div class="kpi-delta">${pct(totales["Cuartil 1"])}% del equipo evaluado</div>
        </div>

        <div class="card card-kpi" style="border-left:4px solid #0ea5e9;">
            <span>🔵 Cuartil 2 · Desbloquear</span>
            <h2>${totales["Cuartil 2"]}</h2>
            <div class="kpi-delta">${pct(totales["Cuartil 2"])}% del equipo evaluado</div>
        </div>

        <div class="card card-kpi" style="border-left:4px solid #f59e0b;">
            <span>🟠 Cuartil 3 · Recuperar</span>
            <h2>${totales["Cuartil 3"]}</h2>
            <div class="kpi-delta">${pct(totales["Cuartil 3"])}% del equipo evaluado</div>
        </div>

        <div class="card card-kpi" style="border-left:4px solid #dc2626;">
            <span>🔴 Cuartil 4 · Intervenir</span>
            <h2>${totales["Cuartil 4"]}</h2>
            <div class="kpi-delta">${pct(totales["Cuartil 4"])}% del equipo evaluado</div>
        </div>

    `;

}

//----------------------------------
// PLAYBOOK POR CUARTIL (REFERENCIA)
//----------------------------------

function construirPlaybookPlanAccion() {

    const cont = document.getElementById("planAccionPlaybook");

    if (!cont) return;

    cont.innerHTML = Object.keys(PLAN_ACCION_PLAYBOOK).map(cuartil => {

        const p = PLAN_ACCION_PLAYBOOK[cuartil];

        return `

        <div class="playbook-plan-accion" style="border-top:4px solid ${p.color};">

            <div class="playbook-plan-accion-header">
                <span class="playbook-plan-accion-cuartil" style="color:${p.color};">${cuartil}</span>
                <span class="playbook-plan-accion-etiqueta" style="background:${p.color}22;color:${p.color};">${p.etiqueta}</span>
            </div>

            <ul>
                ${p.acciones.map(a => `<li>${a}</li>`).join("")}
            </ul>

        </div>

        `;

    }).join("");

}

//----------------------------------
// MATRIZ DE DIAGNÓSTICO INDIVIDUAL
// (entregable de la Fase 1)
//----------------------------------

//----------------------------------
// CRUCE CON DIAGNÓSTICO CUALITATIVO
// (informes de Coach A365 / IA sobre
// llamadas, cargados en
// diagnosticoCualitativo.js)
//----------------------------------

function normalizarNombrePlanAccion(str) {

    return (str || "")
        .toString()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toUpperCase()
        .replace(/\s+/g, " ")
        .trim();

}

function obtenerDiagnosticoCualitativo(ejecutivo) {

    if (typeof DIAGNOSTICO_CUALITATIVO === "undefined") return null;

    if (DIAGNOSTICO_CUALITATIVO[ejecutivo]) return DIAGNOSTICO_CUALITATIVO[ejecutivo];

    const objetivo = normalizarNombrePlanAccion(ejecutivo);

    const clave = Object.keys(DIAGNOSTICO_CUALITATIVO)
        .find(k => normalizarNombrePlanAccion(k) === objetivo);

    return clave ? DIAGNOSTICO_CUALITATIVO[clave] : null;

}

const TENDENCIA_ICONO = {
    mejora: "📈 mejora",
    retrocede: "📉 retrocede",
    estable: "➖ estable"
};

function celdaCausaRaizPlanAccion(ejecutivo) {

    const d = obtenerDiagnosticoCualitativo(ejecutivo);

    if (!d) {
        return `<td style="color:var(--gris);font-size:0.85em;">Sin coaching analizado</td>`;
    }

    const tendenciaTxt = d.tendencia ? (TENDENCIA_ICONO[d.tendencia] || "") : "";

    const tooltip = `${d.nLlamadas} llamada(s) analizada(s) · ${d.noLogradas} no logradas · Fortaleza: ${d.criterioFuerte}. Foco: ${(d.focoDesarrollo || "").replace(/"/g, "&quot;")}`;

    return `
        <td title="${tooltip}">
            <span class="badge" style="background:#dc262622;color:#dc2626;border:1px solid #dc262655;">
                ${d.criterioDebil}
            </span>
            <div style="font-size:0.75em;color:var(--gris);margin-top:2px;">
                ${d.nLlamadas} audio(s) ${tendenciaTxt ? "· " + tendenciaTxt : ""}
            </div>
        </td>
    `;

}

function construirMatrizDiagnosticoPlanAccion() {

    const tbody = document.querySelector("#tablaPlanAccion tbody");

    if (!tbody) return;

    const { mesActual, mesAnterior, primerDia, ultimoDiaCargado, lista } = obtenerBaseDiagnosticoPlanAccion();

    //----------------------------------
    // Nota de contexto sobre las fuentes
    // usadas (mes de cuartiles / roster)
    //----------------------------------

    const nota = document.getElementById("planAccionNotaFuente");

    if (nota) {

        nota.textContent = mesActual
            ? `Línea base: productividad de ${mesAnterior || "—"} · Roster: activos el día ${primerDia || "—"} de ${mesActual} · Avance: acumulado de ${mesActual} hasta el día ${ultimoDiaCargado || "—"}`
            : "Aún no hay datos cargados.";

    }

    if (!lista.length) {

        tbody.innerHTML = `
            <tr>
                <td colspan="10" style="text-align:center;">No existen datos disponibles.</td>
            </tr>
        `;

        return;

    }

    const ordenada = [...lista].sort((a, b) => {

        if (a.tieneBase && !b.tieneBase) return -1;
        if (!a.tieneBase && b.tieneBase) return 1;

        const refA = a.tieneActual ? a.productividadActual : (a.productividadBase || 0);
        const refB = b.tieneActual ? b.productividadActual : (b.productividadBase || 0);

        return refA - refB;

    });

    tbody.innerHTML = ordenada.map(e => {

        const decisionActual = obtenerDecisionPlanAccion(e.ejecutivo);

        const selectorHTML = `
            <select
                class="selector-seguimiento"
                onchange="actualizarDecisionPlanAccion('${e.ejecutivo.replace(/'/g, "\\'")}', this.value)">
                <option value="en_diagnostico" ${decisionActual === "en_diagnostico" ? "selected" : ""}>🔎 En diagnóstico</option>
                <option value="mantener" ${decisionActual === "mantener" ? "selected" : ""}>➡️ Mantener plan</option>
                <option value="escalar" ${decisionActual === "escalar" ? "selected" : ""}>⏫ Escalar intervención</option>
                <option value="cambiar" ${decisionActual === "cambiar" ? "selected" : ""}>🔄 Cambiar estrategia</option>
                <option value="salir" ${decisionActual === "salir" ? "selected" : ""}>✅ Salir del plan</option>
            </select>
        `;

        //----------------------------------
        // Sin línea base (asesor nuevo,
        // sin data del mes anterior)
        //----------------------------------

        if (!e.tieneBase) {

            const tieneAvanceSolo = e.tieneActual;

            const cuartilSolo = tieneAvanceSolo ? cuartilProductividad(e.productividadActual) : null;
            const colorSolo = tieneAvanceSolo ? colorCuartilProductividad(e.productividadActual) : "#94a3b8";

            return `

            <tr style="background:${colorSolo}11;">

                <td>${e.ejecutivo}</td>

                <td style="color:var(--gris);">—</td>

                <td>
                    <span class="badge" style="background:#94a3b822;color:#64748b;border:1px solid #94a3b855;">
                        Sin línea base
                    </span>
                </td>

                <td style="font-weight:700;">${tieneAvanceSolo ? e.productividadActual.toFixed(2) : "—"}</td>

                <td style="color:var(--gris);">—</td>

                <td>
                    ${tieneAvanceSolo
                        ? `<span class="badge" style="background:${colorSolo}22;color:${colorSolo};border:1px solid ${colorSolo}55;">${cuartilSolo}</span>`
                        : "—"}
                </td>

                <td style="color:var(--gris);">—</td>

                <td>Evaluar</td>

                ${celdaCausaRaizPlanAccion(e.ejecutivo)}

                <td>${selectorHTML}</td>

            </tr>

            `;

        }

        const cuartilBase = cuartilProductividad(e.productividadBase);
        const colorBase = colorCuartilProductividad(e.productividadBase);

        //----------------------------------
        // Aún sin avance cargado del mes
        // en curso (solo línea base)
        //----------------------------------

        if (!e.tieneActual) {

            return `

            <tr style="background:${colorBase}0a;">

                <td>${e.ejecutivo}</td>

                <td style="font-weight:700;">${e.productividadBase.toFixed(2)}</td>

                <td>
                    <span class="badge" style="background:${colorBase}22;color:${colorBase};border:1px solid ${colorBase}55;">
                        ${cuartilBase}
                    </span>
                </td>

                <td style="color:var(--gris);">Sin datos aún</td>

                <td style="color:var(--gris);">—</td>

                <td style="color:var(--gris);">—</td>

                <td style="color:var(--gris);">—</td>

                <td>${PLAN_ACCION_PRIORIDAD[cuartilBase]}</td>

                ${celdaCausaRaizPlanAccion(e.ejecutivo)}

                <td>${selectorHTML}</td>

            </tr>

            `;

        }

        //----------------------------------
        // Caso completo: línea base +
        // avance del mes en curso
        //----------------------------------

        const cuartilActual = cuartilProductividad(e.productividadActual);
        const colorActual = colorCuartilProductividad(e.productividadActual);
        const brecha = e.productividadActual - PLAN_ACCION_META_PRODUCTIVIDAD;
        const prioridad = PLAN_ACCION_PRIORIDAD[cuartilActual];

        const subioCuartil = cuartilActual < cuartilBase; // "Cuartil 1" < "Cuartil 2" alfabéticamente en el número
        const cambioCuartil = cuartilActual !== cuartilBase;

        const variacionHTML = e.variacionPct === null
            ? "—"
            : `<span style="color:${e.variacionPct >= 0 ? '#16a34a' : '#dc2626'};font-weight:700;">
                   ${e.variacionPct >= 0 ? "▲" : "▼"} ${Math.abs(e.variacionPct).toFixed(1)}%
               </span>`;

        return `

        <tr style="background:${colorActual}11;">

            <td>${e.ejecutivo}</td>

            <td style="font-weight:700;">${e.productividadBase.toFixed(2)}</td>

            <td>
                <span class="badge" style="background:${colorBase}22;color:${colorBase};border:1px solid ${colorBase}55;">
                    ${cuartilBase}
                </span>
            </td>

            <td style="font-weight:700;">${e.productividadActual.toFixed(2)}</td>

            <td>${variacionHTML}</td>

            <td>
                <span class="badge" style="background:${colorActual}22;color:${colorActual};border:1px solid ${colorActual}55;">
                    ${cuartilActual}${cambioCuartil ? (subioCuartil ? " ↑" : " ↓") : ""}
                </span>
            </td>

            <td style="color:${brecha >= 0 ? '#16a34a' : '#dc2626'};font-weight:700;">
                ${brecha >= 0 ? "+" : ""}${brecha.toFixed(2)}
            </td>

            <td>${prioridad}</td>

            ${celdaCausaRaizPlanAccion(e.ejecutivo)}

            <td>${selectorHTML}</td>

        </tr>

        `;

    }).join("");

}

//----------------------------------
// DECISIÓN POR ASESOR (localStorage)
// Mantener plan / Escalar / Cambiar
// estrategia / Salir del plan
//----------------------------------

const PLAN_ACCION_DECISION_KEY = "entel_plan_accion_decision";

function obtenerMapaDecisionPlanAccion() {

    try {

        return JSON.parse(localStorage.getItem(PLAN_ACCION_DECISION_KEY) || "{}");

    } catch (err) {

        return {};

    }

}

function obtenerDecisionPlanAccion(ejecutivo) {

    const mapa = obtenerMapaDecisionPlanAccion();

    return mapa[ejecutivo] || "en_diagnostico";

}

function actualizarDecisionPlanAccion(ejecutivo, decision) {

    const mapa = obtenerMapaDecisionPlanAccion();

    mapa[ejecutivo] = decision;

    try {

        localStorage.setItem(PLAN_ACCION_DECISION_KEY, JSON.stringify(mapa));

    } catch (err) {
        // localStorage no disponible: el cambio no persiste
    }

}
