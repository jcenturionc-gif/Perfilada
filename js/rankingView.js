//======================================
// RANKINGVIEW.JS
// Ranking General del Dashboard —
// Detalle diario de Solicitudes por
// Ejecutivo, ordenado por Productividad,
// con cuartiles fijos por rango de
// productividad alcanzada.
//
// (Esto es independiente del Score
// gerencial; solo aplica a este panel).
//======================================

//======================================
// REFERENCIA PARA EL ANCHO DE LA BARRA
// (la productividad no es un %, así que se
// escala contra un techo visual razonable)
//======================================

const PRODUCTIVIDAD_TECHO_BARRA = 3;

//----------------------------------
// Estado de colapso de semanas
// (independiente para cada una de las 2 tablas)
//----------------------------------

window.semanasColapsadasRanking = window.semanasColapsadasRanking || {};
window.semanasColapsadasHabilitadas = window.semanasColapsadasHabilitadas || {};
window.semanasColapsadasHoras = window.semanasColapsadasHoras || {};

function toggleSemanaRanking(numeroSemana) {

    window.semanasColapsadasRanking[numeroSemana] = !window.semanasColapsadasRanking[numeroSemana];

    construirRankingView();

}

function toggleSemanaHoras(numeroSemana) {

    window.semanasColapsadasHoras[numeroSemana] = !window.semanasColapsadasHoras[numeroSemana];

    construirRankingView();

}

function toggleSemanaHabilitadas(numeroSemana) {

    window.semanasColapsadasHabilitadas[numeroSemana] = !window.semanasColapsadasHabilitadas[numeroSemana];

    construirRankingView();

}

//======================================
// TENDENCIA SEMANAL POR EJECUTIVO
// Compara la productividad de la última
// semana del periodo filtrado contra la
// semana inmediatamente anterior.
//======================================

function obtenerTendenciaSemanalPorEjecutivo() {

    const semanasPresentes = [...new Set(

        dataFiltrada
            .map(f => Number(f["SEMANA"]))
            .filter(s => !isNaN(s))

    )].sort((a, b) => a - b);

    if (semanasPresentes.length < 2) return {};

    const semanaActual = semanasPresentes[semanasPresentes.length - 1];
    const semanaAnterior = semanasPresentes[semanasPresentes.length - 2];

    const productividadPorSemana = (semana) => {

        const mapa = {};

        dataFiltrada
            .filter(f => Number(f["SEMANA"]) === semana)
            .forEach(f => {

                const nombre = (f["EJECUTIVO"] || "").trim();

                if (!nombre) return;

                if (!mapa[nombre]) mapa[nombre] = { solicitudes: 0, dias: 0 };

                mapa[nombre].solicitudes += Number(f["SOLICITUDES"] || 0);
                mapa[nombre].dias += Number(f["TO PROD"] || 0);

            });

        const resultado = {};

        Object.entries(mapa).forEach(([nombre, v]) => {
            resultado[nombre] = v.dias ? v.solicitudes / v.dias : 0;
        });

        return resultado;

    };

    const prodActual = productividadPorSemana(semanaActual);
    const prodAnterior = productividadPorSemana(semanaAnterior);

    const tendencias = {};

    Object.keys(prodActual).forEach(nombre => {

        if (!(nombre in prodAnterior)) {
            tendencias[nombre] = null;
            return;
        }

        const actual = prodActual[nombre];
        const anterior = prodAnterior[nombre];

        if (anterior === 0 && actual === 0) {
            tendencias[nombre] = "flat";
        } else if (actual > anterior) {
            tendencias[nombre] = "up";
        } else if (actual < anterior) {
            tendencias[nombre] = "down";
        } else {
            tendencias[nombre] = "flat";
        }

    });

    return tendencias;

}

function iconoTendencia(tendencia) {

    if (tendencia === "up") return `<span class="tendencia-up">▲</span>`;
    if (tendencia === "down") return `<span class="tendencia-down">▼</span>`;
    if (tendencia === "flat") return `<span class="tendencia-flat">■</span>`;

    return `<span class="tendencia-na">–</span>`;

}

//======================================
// FILTRO RÁPIDO: TOP 3 / BOTTOM 3
//======================================

window.filtroRapidoRanking = window.filtroRapidoRanking || "todos";

function aplicarFiltroRapidoRanking(modo) {

    window.filtroRapidoRanking = modo;

    construirRankingView();

}

function construirRankingView() {

    const panel = document.getElementById("panelRanking");

    if (!panel) return;

    if (!dataFiltrada.length) {

        panel.innerHTML = `
            <div class="alerta warning">
                No existen datos para mostrar.
            </div>
        `;

        return;

    }

    //----------------------------------
    // Días presentes en el periodo filtrado
    //----------------------------------

    const dias = [...new Set(

        dataFiltrada
            .map(f => Number(f["DIA"]))
            .filter(d => !isNaN(d))

    )].sort((a, b) => a - b);

    //----------------------------------
    // Agrupar solicitudes por ejecutivo y día
    //----------------------------------

    const porEjecutivo = {};

    dataFiltrada.forEach(f => {

        const nombre = (f["EJECUTIVO"] || "").trim();

        if (!nombre) return;

        const dia = Number(f["DIA"]);

        if (!porEjecutivo[nombre]) {

            porEjecutivo[nombre] = {

                ejecutivo: nombre,
                antiguedad: f["ANTIGÜEDAD"] || "",
                porDia: {},
                diasConexion: 0

            };

        }

        porEjecutivo[nombre].porDia[dia] =
            (porEjecutivo[nombre].porDia[dia] || 0) + Number(f["SOLICITUDES"] || 0);

        // Días de conexión = suma del campo TO PROD (no el conteo de
        // filas/días con datos), acumulado sobre todos los días del
        // periodo filtrado (p.ej. día 1 y día 3 de agosto).
        porEjecutivo[nombre].diasConexion += Number(f["TO PROD"] || 0);

    });

    //----------------------------------
    // Cruzar con productividad real
    // (misma que usa el resto del dashboard)
    //----------------------------------

    const resumen = obtenerResumenEjecutivos();

    const resumenPorNombre = {};

    resumen.forEach(e => { resumenPorNombre[e.ejecutivo] = e; });

    let filas = Object.values(porEjecutivo).map(e => {

        const r = resumenPorNombre[e.ejecutivo] || { productividad: 0, solicitudes: 0 };

        return {

            ejecutivo: e.ejecutivo,
            antiguedad: e.antiguedad,
            porDia: e.porDia,
            diasConexion: e.diasConexion,
            totalSolicitudes: r.solicitudes || 0,
            productividad: r.productividad || 0,
            cuartil: cuartilProductividad(r.productividad || 0),
            colorCuartil: colorCuartilProductividad(r.productividad || 0)

        };

    });

    //----------------------------------
    // Ordenar por Productividad (desc.)
    //----------------------------------

    filas.sort((a, b) => b.productividad - a.productividad);

    //----------------------------------
    // Tendencia semanal (última semana
    // vs. semana anterior)
    //----------------------------------

    const tendencias = obtenerTendenciaSemanalPorEjecutivo();

    filas.forEach(f => {
        f.tendencia = tendencias[f.ejecutivo] !== undefined ? tendencias[f.ejecutivo] : null;
    });

    //----------------------------------
    // Filtro rápido Top3 / Bottom3
    //----------------------------------

    const modoFiltro = window.filtroRapidoRanking || "todos";

    let filasVisibles = filas;

    if (modoFiltro === "top3") {
        filasVisibles = filas.slice(0, 3);
    } else if (modoFiltro === "bottom3") {
        filasVisibles = filas.slice(-3);
    }

    const botonesRapidos = `

        <div class="ranking-filtro-rapido">

            <button
                class="btn-filtro-rapido ${modoFiltro === "todos" ? "activo" : ""}"
                onclick="aplicarFiltroRapidoRanking('todos')">
                Todos
            </button>

            <button
                class="btn-filtro-rapido ${modoFiltro === "top3" ? "activo" : ""}"
                onclick="aplicarFiltroRapidoRanking('top3')">
                🏆 Top 3
            </button>

            <button
                class="btn-filtro-rapido ${modoFiltro === "bottom3" ? "activo" : ""}"
                onclick="aplicarFiltroRapidoRanking('bottom3')">
                ⚠️ Bottom 3
            </button>

        </div>

    `;

    //----------------------------------
    // Construir cabecera
    // (columnas de días agrupadas por semana,
    // con botón para contraer/expandir cada semana)
    //----------------------------------

    const semanas = agruparDiasPorSemana(dias);
    const colapsoRanking = window.semanasColapsadasRanking;

    // La primera vez que se arma esta tabla, arrancan todas las
    // semanas contraídas (así entra sin scroll horizontal); el
    // usuario puede expandir la que necesite con un clic.
    if (!window.semanasRankingInicializado) {

        semanas.forEach(sem => { colapsoRanking[sem.numero] = true; });

        window.semanasRankingInicializado = true;

    }

    const cab = construirCabeceraSemanal(semanas, colapsoRanking, "toggleSemanaRanking");

    let html = `

        ${botonesRapidos}

        <div class="tablaResumenWrapper">

        <table class="tabla-ranking-diario">

            <thead>
                <tr>
                    <th class="col-ejecutivo" rowspan="2">Ejecutivo</th>
                    ${cab.filaSemanas}
                    <th rowspan="2">Total</th>
                    <th rowspan="2">Días Conexión</th>
                    <th rowspan="2">Productividad</th>
                    <th rowspan="2">Tendencia</th>
                    <th rowspan="2">Cuartil</th>
                    <th rowspan="2">Antigüedad</th>
                </tr>
                ${cab.celdasDias ? `<tr>${cab.celdasDias}</tr>` : ""}
            </thead>

            <tbody>

    `;

    filasVisibles.forEach(f => {

        html += `

            <tr style="background:${f.colorCuartil}22;">

                <td class="col-ejecutivo">${f.ejecutivo}</td>

                ${construirCeldasSemanales(semanas, colapsoRanking, f.porDia)}

                <td><strong>${f.totalSolicitudes.toLocaleString("es-PE")}</strong></td>

                <td>${f.diasConexion}</td>

                <td style="color:${f.colorCuartil};font-weight:800;">${f.productividad.toFixed(2)}</td>

                <td title="vs. semana anterior">${iconoTendencia(f.tendencia)}</td>

                <td>
                    <span class="storyline-badge" style="
                        background:${f.colorCuartil}22;
                        color:${f.colorCuartil};
                        border:1px solid ${f.colorCuartil}55;
                    ">${f.cuartil}</span>
                </td>

                <td>${f.antiguedad}</td>

            </tr>

        `;

    });

    //----------------------------------
    // Fila de TOTAL
    //----------------------------------

    const totalPorDia = {};

    dias.forEach(d => {

        totalPorDia[d] = filas.reduce((s, f) => s + (f.porDia[d] || 0), 0);

    });

    const totalGeneral = filas.reduce((s, f) => s + f.totalSolicitudes, 0);

    const productividadPromedio = filas.length

        ? filas.reduce((s, f) => s + f.productividad, 0) / filas.length

        : 0;

    html += `

            <tr class="fila-total-ejecutivos">

                <td><strong>Total</strong></td>

                ${construirCeldasSemanales(semanas, colapsoRanking, totalPorDia, v => `<strong>${v}</strong>`)}

                <td><strong>${totalGeneral.toLocaleString("es-PE")}</strong></td>

                <td></td>

                <td><strong>${productividadPromedio.toFixed(2)}</strong></td>

                <td></td>

                <td></td>

                <td></td>

            </tr>

    `;

    html += `

            </tbody>

        </table>

        </div>

    `;

    //----------------------------------
    // SEGUNDA TABLA: DETALLE DIARIO
    // DE HABILITADAS (ordenado por total)
    //----------------------------------

    html += construirTablaDiariaHabilitadas(dias, semanas);

    //----------------------------------
    // TERCERA TABLA: HORAS CONECTADAS
    // Y % DE CUMPLIMIENTO
    //----------------------------------

    html += construirTablaHorasConectadas(dias, semanas);

    panel.innerHTML = html;

}

//======================================
// TABLA: DETALLE DIARIO DE HABILITADAS
// (Ejecutivo x Día, ordenado por Total
// de Habilitadas, de mayor a menor)
//======================================

function construirTablaDiariaHabilitadas(dias, semanas) {

    const porEjecutivo = {};

    dataFiltrada.forEach(f => {

        const nombre = (f["EJECUTIVO"] || "").trim();

        if (!nombre) return;

        const dia = Number(f["DIA"]);

        if (!porEjecutivo[nombre]) {

            porEjecutivo[nombre] = {

                ejecutivo: nombre,
                porDia: {},
                total: 0

            };

        }

        const habilitadasDia = Number(f["HABILITADAS"] || 0);

        porEjecutivo[nombre].porDia[dia] =
            (porEjecutivo[nombre].porDia[dia] || 0) + habilitadasDia;

        porEjecutivo[nombre].total += habilitadasDia;

    });

    const filas = Object.values(porEjecutivo)

        .sort((a, b) => b.total - a.total);

    const totalPorDia = {};

    dias.forEach(d => {

        totalPorDia[d] = filas.reduce((s, f) => s + (f.porDia[d] || 0), 0);

    });

    const totalGeneral = filas.reduce((s, f) => s + f.total, 0);

    //----------------------------------
    // Cabecera con semanas colapsables
    // (estado propio de esta tabla)
    //----------------------------------

    semanas = semanas || agruparDiasPorSemana(dias);

    const colapsoHabilitadas = window.semanasColapsadasHabilitadas;

    if (!window.semanasHabilitadasInicializado) {

        semanas.forEach(sem => { colapsoHabilitadas[sem.numero] = true; });

        window.semanasHabilitadasInicializado = true;

    }

    const cab = construirCabeceraSemanal(semanas, colapsoHabilitadas, "toggleSemanaHabilitadas");

    let html = `

        <h3 class="subtitulo-tabla">✅ Detalle diario de Habilitadas</h3>

        <div class="tablaResumenWrapper">

        <table class="tabla-ranking-diario">

            <thead>
                <tr>
                    <th class="col-ejecutivo" rowspan="2">Ejecutivo</th>
                    ${cab.filaSemanas}
                    <th rowspan="2">Total</th>
                </tr>
                ${cab.celdasDias ? `<tr>${cab.celdasDias}</tr>` : ""}
            </thead>

            <tbody>

    `;

    filas.forEach(f => {

        html += `

            <tr>

                <td class="col-ejecutivo">${f.ejecutivo}</td>

                ${construirCeldasSemanales(semanas, colapsoHabilitadas, f.porDia)}

                <td><strong>${f.total.toLocaleString("es-PE")}</strong></td>

            </tr>

        `;

    });

    html += `

            <tr class="fila-total-ejecutivos">

                <td><strong>Total</strong></td>

                ${construirCeldasSemanales(semanas, colapsoHabilitadas, totalPorDia, v => `<strong>${v}</strong>`)}

                <td><strong>${totalGeneral.toLocaleString("es-PE")}</strong></td>

            </tr>

            </tbody>

        </table>

        </div>

    `;

    return html;

}

//======================================
// TABLA: HORAS CONECTADAS Y
// % DE CUMPLIMIENTO (Ejecutivo x Día,
// ordenado por Horas Conectadas totales,
// de mayor a menor)
//======================================

function construirTablaHorasConectadas(dias, semanas) {

    const porEjecutivo = {};

    dataFiltrada.forEach(f => {

        const nombre = (f["EJECUTIVO"] || "").trim();

        if (!nombre) return;

        const dia = Number(f["DIA"]);

        if (!porEjecutivo[nombre]) {

            porEjecutivo[nombre] = {

                ejecutivo: nombre,
                conexionPorDia: {},
                programadoPorDia: {},
                totalConexion: 0,
                totalProgramado: 0

            };

        }

        const conexionDia   = Number(f["CONEXIÓN"] || 0);
        const programadoDia = Number(f["PROGRAMADO"] || 0);

        porEjecutivo[nombre].conexionPorDia[dia] =
            (porEjecutivo[nombre].conexionPorDia[dia] || 0) + conexionDia;

        porEjecutivo[nombre].programadoPorDia[dia] =
            (porEjecutivo[nombre].programadoPorDia[dia] || 0) + programadoDia;

        porEjecutivo[nombre].totalConexion   += conexionDia;
        porEjecutivo[nombre].totalProgramado += programadoDia;

    });

    const filas = Object.values(porEjecutivo)

        .sort((a, b) => b.totalConexion - a.totalConexion);

    const totalConexionPorDia   = {};
    const totalProgramadoPorDia = {};

    dias.forEach(d => {

        totalConexionPorDia[d]   = filas.reduce((s, f) => s + (f.conexionPorDia[d] || 0), 0);
        totalProgramadoPorDia[d] = filas.reduce((s, f) => s + (f.programadoPorDia[d] || 0), 0);

    });

    const totalConexionGeneral   = filas.reduce((s, f) => s + f.totalConexion, 0);
    const totalProgramadoGeneral = filas.reduce((s, f) => s + f.totalProgramado, 0);

    //----------------------------------
    // Cabecera con semanas colapsables
    // (estado propio de esta tabla)
    //----------------------------------

    semanas = semanas || agruparDiasPorSemana(dias);

    const colapsoHoras = window.semanasColapsadasHoras;

    if (!window.semanasHorasInicializado) {

        semanas.forEach(sem => { colapsoHoras[sem.numero] = true; });

        window.semanasHorasInicializado = true;

    }

    const cab = construirCabeceraSemanal(semanas, colapsoHoras, "toggleSemanaHoras");

    //----------------------------------
    // Celdas de % de cumplimiento:
    // se calcula como Conexión / Programado,
    // agregando ambos valores antes de dividir
    // (nunca promediando porcentajes ya calculados)
    //----------------------------------

    function celdasCumplimiento(semanas, colapso, conexionPorDia, programadoPorDia) {

        let html = "";

        semanas.forEach(sem => {

            if (colapso[sem.numero]) {

                const conexionSemana   = sem.dias.reduce((s, d) => s + (conexionPorDia[d] || 0), 0);
                const programadoSemana = sem.dias.reduce((s, d) => s + (programadoPorDia[d] || 0), 0);

                html += `<td class="celda-semana">${celdaCumplimientoHTML(conexionSemana, programadoSemana)}</td>`;

            } else {

                sem.dias.forEach(d => {

                    html += `<td>${celdaCumplimientoHTML(conexionPorDia[d] || 0, programadoPorDia[d] || 0)}</td>`;

                });

            }

        });

        return html;

    }

    function celdaCumplimientoHTML(conexion, programado) {

        if (!programado) return "—";

        const pct = (conexion / programado) * 100;

        return `<span style="color:${colorCumplimientoHoras(pct)};font-weight:600;">${pct.toFixed(1)}%</span>`;

    }

    let html = `

        <h3 class="subtitulo-tabla">⏱️ Horas Conectadas y % de Cumplimiento</h3>

        <div class="tablaResumenWrapper">

        <table class="tabla-ranking-diario">

            <thead>
                <tr>
                    <th class="col-ejecutivo" rowspan="2">Ejecutivo</th>
                    <th rowspan="2">Indicador</th>
                    ${cab.filaSemanas}
                    <th rowspan="2">Total</th>
                </tr>
                ${cab.celdasDias ? `<tr>${cab.celdasDias}</tr>` : ""}
            </thead>

            <tbody>

    `;

    filas.forEach(f => {

        const pctTotal = f.totalProgramado
            ? (f.totalConexion / f.totalProgramado) * 100
            : 0;

        html += `

            <tr>

                <td class="col-ejecutivo" rowspan="2">${f.ejecutivo}</td>
                <td>Horas conectadas</td>

                ${construirCeldasSemanales(semanas, colapsoHoras, f.conexionPorDia, v => v.toFixed(1))}

                <td><strong>${f.totalConexion.toFixed(1)}</strong></td>

            </tr>

            <tr>

                <td>% Cumplimiento</td>

                ${celdasCumplimiento(semanas, colapsoHoras, f.conexionPorDia, f.programadoPorDia)}

                <td><strong style="color:${colorCumplimientoHoras(pctTotal)};">${pctTotal.toFixed(1)}%</strong></td>

            </tr>

        `;

    });

    const pctTotalGeneral = totalProgramadoGeneral
        ? (totalConexionGeneral / totalProgramadoGeneral) * 100
        : 0;

    html += `

            <tr class="fila-total-ejecutivos">

                <td rowspan="2"><strong>Total</strong></td>
                <td>Horas conectadas</td>

                ${construirCeldasSemanales(semanas, colapsoHoras, totalConexionPorDia, v => `<strong>${v.toFixed(1)}</strong>`)}

                <td><strong>${totalConexionGeneral.toFixed(1)}</strong></td>

            </tr>

            <tr class="fila-total-ejecutivos">

                <td>% Cumplimiento</td>

                ${celdasCumplimiento(semanas, colapsoHoras, totalConexionPorDia, totalProgramadoPorDia)}

                <td><strong style="color:${colorCumplimientoHoras(pctTotalGeneral)};">${pctTotalGeneral.toFixed(1)}%</strong></td>

            </tr>

            </tbody>

        </table>

        </div>

    `;

    return html;

}

function colorCumplimientoHoras(pct) {

    const meta = (typeof CONFIG !== "undefined" && CONFIG.METAS && CONFIG.METAS.ADHERENCIA) || 95;

    if (pct >= meta) return "#16a34a";   // verde  · cumple meta
    if (pct >= meta - 10) return "#f59e0b"; // naranja · cerca de la meta

    return "#dc2626";                    // rojo   · lejos de la meta

}

//======================================
// CUARTIL SEGÚN PRODUCTIVIDAD
// Cuartil 1: 2.00 a más
// Cuartil 2: 1.50 a 1.9999
// Cuartil 3: 1.00 a 1.4999
// Cuartil 4: menor a 1.00
//======================================

function cuartilProductividad(valor) {

    const v = Number(valor || 0);

    if (v >= 2) return "Cuartil 1";

    if (v >= 1.5) return "Cuartil 2";

    if (v >= 1) return "Cuartil 3";

    return "Cuartil 4";

}

function colorCuartilProductividad(valor) {

    const v = Number(valor || 0);

    if (v >= 2) return "#16a34a";     // verde   · Cuartil 1

    if (v >= 1.5) return "#0ea5e9";   // celeste · Cuartil 2

    if (v >= 1) return "#f59e0b";     // naranja · Cuartil 3

    return "#dc2626";                 // rojo    · Cuartil 4

}
