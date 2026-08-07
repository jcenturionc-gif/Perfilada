//======================================
// ACTIVOSKPIS.JS
// Cuadro de Asesores Activos
// (solo asesores presentes en el último
// día registrado en masterData)
//
// Columnas agrupadas por mes (últimos 2
// o 3 meses), cada mes con 3 sub-columnas:
// % Cumplimiento Solicitudes,
// % Cumplimiento Habilitadas,
// % Productividad (vs. meta).
// Al final, grupo "Variación" con la
// diferencia en puntos % entre el
// primer y el último mes de la ventana.
//======================================

window.mesesVentanaActivos = window.mesesVentanaActivos || 2;
window.soloActivosActivos = (window.soloActivosActivos === undefined) ? true : window.soloActivosActivos;

//----------------------------------
// Devuelve los asesores activos según
// el último día de gestión: se ubica
// el último mes cronológico presente
// en masterData y, dentro de ese mes,
// el día más alto (ej. 5-ago si agosto
// solo tiene datos hasta el día 5).
// Evita mezclar "DIA" de distintos
// meses (que reinicia 1-31 cada mes).
//----------------------------------

function nombresAsesoresActivosGlobal() {

    const base = (typeof masterData !== "undefined") ? masterData : [];

    if (!base.length) return [];

    const orden = (typeof ORDEN_MESES !== "undefined") ? ORDEN_MESES : [];

    const nombresMeses = [...new Set(base.map(f => f["MES"]).filter(Boolean))]
        .sort((a, b) => orden.indexOf(a) - orden.indexOf(b));

    const ultimoMes = nombresMeses[nombresMeses.length - 1];

    const registrosUltimoMes = base.filter(f => f["MES"] === ultimoMes);

    const ultimoDia = Math.max(
        ...registrosUltimoMes.map(f => Number(f["DIA"] || 0))
    );

    return [...new Set(
        registrosUltimoMes
            .filter(f => Number(f["DIA"]) === ultimoDia)
            .map(f => f["EJECUTIVO"])
            .filter(Boolean)
    )].sort((a, b) => a.localeCompare(b));

}

//----------------------------------
// Devuelve TODOS los asesores que
// aparecen en los meses de la ventana
// (incluye a los que causaron baja
// respecto al último mes)
//----------------------------------

function nombresAsesoresTodosVentana(meses) {

    const base = (typeof masterData !== "undefined") ? masterData : [];

    return [...new Set(
        base
            .filter(f => meses.includes(f["MES"]))
            .map(f => f["EJECUTIVO"])
            .filter(Boolean)
    )].sort((a, b) => a.localeCompare(b));

}

//----------------------------------
// Últimos N meses presentes en
// masterData, en orden cronológico
//----------------------------------

function ultimosMesesActivos(n) {

    const base = (typeof masterData !== "undefined") ? masterData : [];

    const orden = (typeof ORDEN_MESES !== "undefined") ? ORDEN_MESES : [];

    const nombresMeses = [...new Set(base.map(f => f["MES"]).filter(Boolean))]
        .sort((a, b) => orden.indexOf(a) - orden.indexOf(b));

    return nombresMeses.slice(-n);

}

//----------------------------------
// Calcula los 3 % de cumplimiento de
// un asesor, para UN solo mes
//----------------------------------

function calcularPctAsesorMes(asesor, mes) {

    const base = (typeof masterData !== "undefined") ? masterData : [];

    const registros = base.filter(f =>
        f["EJECUTIVO"] === asesor && f["MES"] === mes
    );

    const solicitudes = registros.reduce((s, f) => s + Number(f["SOLICITUDES"] || 0), 0);
    const habilitadas = registros.reduce((s, f) => s + Number(f["HABILITADAS"] || 0), 0);
    const cuotaSol    = registros.reduce((s, f) => s + Number(f["CUOTA SOL"]   || 0), 0);
    const cuotaHab    = registros.reduce((s, f) => s + Number(f["CUOTA HAB"]   || 0), 0);
    const diasProd    = registros.reduce((s, f) => s + Number(f["TO PROD"]    || 0), 0);

    const cumplSolicitudes = cuotaSol ? (solicitudes / cuotaSol) * 100 : 0;
    const cumplHabilitadas = cuotaHab ? (habilitadas / cuotaHab) * 100 : 0;

    const productividad = diasProd ? (solicitudes / diasProd) : 0;

    const metaProductividad = (typeof CONFIG !== "undefined")
        ? CONFIG.METAS.PRODUCTIVIDAD
        : 1.5;

    const cumplProductividad = metaProductividad ? (productividad / metaProductividad) * 100 : 0;

    return { cumplSolicitudes, cumplHabilitadas, productividad, cumplProductividad };

}

//----------------------------------
// Igual que calcularPctAsesorMes pero
// agregando varios asesores juntos
// (para la fila de TOTAL)
//----------------------------------

function calcularPctGrupoMes(asesoresGrupo, mes) {

    const base = (typeof masterData !== "undefined") ? masterData : [];

    const registros = base.filter(f =>
        asesoresGrupo.includes(f["EJECUTIVO"]) && f["MES"] === mes
    );

    const solicitudes = registros.reduce((s, f) => s + Number(f["SOLICITUDES"] || 0), 0);
    const habilitadas = registros.reduce((s, f) => s + Number(f["HABILITADAS"] || 0), 0);
    const cuotaSol    = registros.reduce((s, f) => s + Number(f["CUOTA SOL"]   || 0), 0);
    const cuotaHab    = registros.reduce((s, f) => s + Number(f["CUOTA HAB"]   || 0), 0);
    const diasProd    = registros.reduce((s, f) => s + Number(f["TO PROD"]    || 0), 0);

    const cumplSolicitudes = cuotaSol ? (solicitudes / cuotaSol) * 100 : 0;
    const cumplHabilitadas = cuotaHab ? (habilitadas / cuotaHab) * 100 : 0;

    const productividad = diasProd ? (solicitudes / diasProd) : 0;

    const metaProductividad = (typeof CONFIG !== "undefined")
        ? CONFIG.METAS.PRODUCTIVIDAD
        : 1.5;

    const cumplProductividad = metaProductividad ? (productividad / metaProductividad) * 100 : 0;

    return { cumplSolicitudes, cumplHabilitadas, productividad, cumplProductividad };

}

//----------------------------------
// Clase de color según % cumplimiento
//----------------------------------

function claseCumplimientoActivos(pct) {

    if (pct >= 100) return "rentab-ok";

    if (pct >= 80) return "rentab-medio";

    return "rentab-bajo";

}

//----------------------------------
// Clase de color para la variación
// (positiva = verde, negativa = rojo)
//----------------------------------

function claseVariacionActivos(delta) {

    if (delta > 0) return "rentab-ok";

    if (delta < 0) return "rentab-bajo";

    return "";

}

function formatearPctActivos(valor) {

    return valor.toLocaleString("es-PE", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + "%";

}

function formatearVariacionActivos(valor) {

    const signo = valor > 0 ? "+" : "";

    return signo + valor.toLocaleString("es-PE", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + "%";

}

function formatearNumActivos(valor) {

    return valor.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

}

function formatearVariacionNumActivos(valor) {

    const signo = valor > 0 ? "+" : "";

    return signo + valor.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

}

//----------------------------------
// Cambia la ventana de meses (2 o 3)
//----------------------------------

function cambiarVentanaActivos(n) {

    window.mesesVentanaActivos = n;

    construirCuadroAsesoresActivos();

}

//----------------------------------
// Alterna ON (solo activos) / OFF
// (todos, incluye bajas del mes previo)
//----------------------------------

function toggleSoloActivos() {

    window.soloActivosActivos = !window.soloActivosActivos;

    construirCuadroAsesoresActivos();

}

//======================================
// CONSTRUCCIÓN PRINCIPAL DEL PANEL
//======================================

function construirCuadroAsesoresActivos() {

    const panel = document.getElementById("panelAsesoresActivos");

    if (!panel) return;

    const base = (typeof masterData !== "undefined") ? masterData : [];

    if (!base.length) {

        panel.innerHTML = `<p class="acc-sin-comparativo">Aún no hay datos suficientes para el cuadro de asesores activos.</p>`;

        return;

    }

    const ventana = window.mesesVentanaActivos;
    const meses = ultimosMesesActivos(ventana);

    if (meses.length < 2) {

        panel.innerHTML = `<p class="acc-sin-comparativo">Se necesitan al menos 2 meses de datos para este cuadro.</p>`;

        return;

    }

    const soloActivos = window.soloActivosActivos;

    const asesoresActivos = nombresAsesoresActivosGlobal();

    const asesores = soloActivos
        ? asesoresActivos
        : nombresAsesoresTodosVentana(meses);

    if (!asesores.length) {

        panel.innerHTML = `<p class="acc-sin-comparativo">No se encontraron asesores para este cuadro.</p>`;

        return;

    }

    const mesInicial = meses[0];
    const mesFinal    = meses[meses.length - 1];

    //----------------------------------
    // CABECERA: un grupo de 3 columnas
    // por cada mes + grupo "Variación"
    //----------------------------------

    let filaGrupos = `<th class="col-ejecutivo" rowspan="2">Ejecutivo</th>`;

    meses.forEach(mes => {
        filaGrupos += `<th colspan="3">${mes}</th>`;
    });

    filaGrupos += `<th colspan="3">Variación (${mesInicial} → ${mesFinal})</th>`;

    let filaSub = "";

    meses.forEach(() => {
        filaSub += `<th>Cumpl. Sol.</th><th>Cumpl. Hab.</th><th>Productividad</th>`;
    });

    filaSub += `<th>Cumpl. Sol.</th><th>Cumpl. Hab.</th><th>Productividad</th>`;

    //----------------------------------
    // FILAS: una por asesor
    //----------------------------------

    let filas = "";

    asesores.forEach(asesor => {

        const esBaja = soloActivos ? false : !asesoresActivos.includes(asesor);

        const porMes = meses.map(mes => calcularPctAsesorMes(asesor, mes));

        const inicial = porMes[0];
        const final   = porMes[porMes.length - 1];

        const deltaSol  = final.cumplSolicitudes   - inicial.cumplSolicitudes;
        const deltaHab  = final.cumplHabilitadas   - inicial.cumplHabilitadas;
        const deltaProd = final.cumplProductividad - inicial.cumplProductividad;

        let celdasMeses = "";

        porMes.forEach(k => {
            celdasMeses += `
                <td class="${claseCumplimientoActivos(k.cumplSolicitudes)}">${formatearPctActivos(k.cumplSolicitudes)}</td>
                <td class="${claseCumplimientoActivos(k.cumplHabilitadas)}">${formatearPctActivos(k.cumplHabilitadas)}</td>
                <td class="${claseCumplimientoActivos(k.cumplProductividad)}">${formatearNumActivos(k.productividad)}</td>
            `;
        });

        filas += `
            <tr>
                <td class="col-ejecutivo">${asesor}${esBaja ? ' <span class="chip-baja">baja</span>' : ""}</td>
                ${celdasMeses}
                <td class="${claseVariacionActivos(deltaSol)}"><strong>${formatearVariacionActivos(deltaSol)}</strong></td>
                <td class="${claseVariacionActivos(deltaHab)}"><strong>${formatearVariacionActivos(deltaHab)}</strong></td>
                <td class="${claseVariacionActivos(deltaProd)}"><strong>${formatearVariacionActivos(deltaProd)}</strong></td>
            </tr>
        `;

    });

    //----------------------------------
    // FILA TOTAL: agrega a los asesores
    // que se están mostrando (activos o
    // todos, según el toggle), para ver
    // si el equipo activo mejoró
    //----------------------------------

    const porMesTotal = meses.map(mes => calcularPctGrupoMes(asesores, mes));

    const inicialTotal = porMesTotal[0];
    const finalTotal   = porMesTotal[porMesTotal.length - 1];

    const deltaSolTotal  = finalTotal.cumplSolicitudes   - inicialTotal.cumplSolicitudes;
    const deltaHabTotal  = finalTotal.cumplHabilitadas   - inicialTotal.cumplHabilitadas;
    const deltaProdTotal = finalTotal.cumplProductividad - inicialTotal.cumplProductividad;

    let celdasMesesTotal = "";

    porMesTotal.forEach(k => {
        celdasMesesTotal += `
            <td class="${claseCumplimientoActivos(k.cumplSolicitudes)}"><strong>${formatearPctActivos(k.cumplSolicitudes)}</strong></td>
            <td class="${claseCumplimientoActivos(k.cumplHabilitadas)}"><strong>${formatearPctActivos(k.cumplHabilitadas)}</strong></td>
            <td class="${claseCumplimientoActivos(k.cumplProductividad)}"><strong>${formatearNumActivos(k.productividad)}</strong></td>
        `;
    });

    const filaTotal = `
        <tr class="fila-total-activos">
            <td class="col-ejecutivo">TOTAL (${asesores.length} asesores)</td>
            ${celdasMesesTotal}
            <td class="${claseVariacionActivos(deltaSolTotal)}"><strong>${formatearVariacionActivos(deltaSolTotal)}</strong></td>
            <td class="${claseVariacionActivos(deltaHabTotal)}"><strong>${formatearVariacionActivos(deltaHabTotal)}</strong></td>
            <td class="${claseVariacionActivos(deltaProdTotal)}"><strong>${formatearVariacionActivos(deltaProdTotal)}</strong></td>
        </tr>
    `;

    panel.innerHTML = `

        <div class="rentab-leyenda">
            <span class="rentab-chip">👥 ${soloActivos ? "Asesores activos" : "Todos (activos + bajas)"}: ${asesores.length}</span>
            <span class="rentab-chip">📅 Meses incluidos: ${meses.join(", ")}</span>
            <span class="rentab-chip rentab-ok">■ Cumple (≥100%) / Variación positiva</span>
            <span class="rentab-chip rentab-medio">■ Cerca (80-99%)</span>
            <span class="rentab-chip rentab-bajo">■ Bajo (&lt;80%) / Variación negativa</span>
        </div>

        <div class="activos-toggle">

            <button class="${ventana === 2 ? "activo" : ""}" onclick="cambiarVentanaActivos(2)">Últimos 2 meses</button>
            <button class="${ventana === 3 ? "activo" : ""}" onclick="cambiarVentanaActivos(3)">Últimos 3 meses</button>

            <span class="switch-solo-activos" onclick="toggleSoloActivos()">
                <span class="switch-track ${soloActivos ? "on" : "off"}">
                    <span class="switch-thumb"></span>
                </span>
                <span class="switch-label">${soloActivos ? "Solo asesores activos" : "Incluir bajas del mes anterior"}</span>
            </span>

        </div>

        <div class="tablaResumenWrapper">

        <table class="tabla-ranking-diario tabla-rentabilidad tabla-activos">

            <thead>
                <tr>${filaGrupos}</tr>
                <tr>${filaSub}</tr>
            </thead>

            <tbody>${filas}${filaTotal}</tbody>

        </table>

        </div>

    `;

}

//======================================
// FIN ACTIVOSKPIS
//======================================
