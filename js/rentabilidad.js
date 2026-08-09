//======================================
// RENTABILIDAD.JS
// Cuadro de Rentabilidad por Asesor
// Filas: Asesor (+ Total equipo)
// Columnas: Mes (desglosable por semana)
// Pago: 29.9 USD por móvil habilitada,
//       35 USD por hogar habilitada.
// Punto de equilibrio: 1200 USD / asesor.
//======================================

const PAGO_HABILITADA_MOVIL = 29.9;
const PAGO_HABILITADA_HOGAR = 35;
const PUNTO_EQUILIBRIO_RENTABILIDAD = 1200;

window.mesesColapsadosRentabilidad = window.mesesColapsadosRentabilidad || {};

//----------------------------------
// Alternar (colapsar / expandir) un mes
//----------------------------------

function toggleMesRentabilidad(nombreMes) {

    window.mesesColapsadosRentabilidad[nombreMes] = !window.mesesColapsadosRentabilidad[nombreMes];

    construirCuadroRentabilidad();

}

//----------------------------------
// Calcula habilitadas móvil / hogar
// e ingreso generado por un set de registros
//----------------------------------

function calcularIngresoRentabilidad(registros) {

    let habMovil = 0;
    let habHogar = 0;

    registros.forEach(f => {

        habMovil += Number(f["H. E2H"]  || 0)
                  +  Number(f["H. EA"]   || 0)
                  +  Number(f["H. DR"]   || 0)
                  +  Number(f["H. RT"]   || 0)
                  +  Number(f["H. ESIM"] || 0);

        habHogar += Number(f["H. HOGAR"] || 0);

    });

    const ingreso = (habMovil * PAGO_HABILITADA_MOVIL) + (habHogar * PAGO_HABILITADA_HOGAR);

    return { habMovil, habHogar, ingreso };

}

//----------------------------------
// Formatea un valor USD
//----------------------------------

function formatearUSDRentabilidad(valor) {

    return "$" + valor.toLocaleString("es-PE", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

}

//----------------------------------
// Clase de color según punto de equilibrio
//----------------------------------

function claseRentabilidad(valor) {

    return valor >= PUNTO_EQUILIBRIO_RENTABILIDAD ? "rentab-ok" : "rentab-bajo";

}

//======================================
// CONSTRUCCIÓN PRINCIPAL DEL PANEL
//======================================

function construirCuadroRentabilidad() {

    const panel = document.getElementById("panelRentabilidad");

    if (!panel) return;

    const base = (typeof masterData !== "undefined") ? masterData : [];

    if (!base.length) {

        panel.innerHTML = `<p class="acc-sin-comparativo">Aún no hay datos suficientes para el cuadro de rentabilidad.</p>`;

        return;

    }

    const orden = (typeof ORDEN_MESES !== "undefined") ? ORDEN_MESES : [];

    const nombresMeses = [...new Set(base.map(f => f["MES"]).filter(Boolean))]
        .sort((a, b) => orden.indexOf(a) - orden.indexOf(b));

    //----------------------------------
    // Asesores (filas), orden alfabético
    //----------------------------------

    const asesores = [...new Set(base.map(f => f["EJECUTIVO"]).filter(Boolean))]
        .sort((a, b) => a.localeCompare(b));

    if (!asesores.length) {

        panel.innerHTML = `<p class="acc-sin-comparativo">Aún no hay datos suficientes para el cuadro de rentabilidad.</p>`;

        return;

    }

    const colapso = window.mesesColapsadosRentabilidad;

    if (!window.mesesRentabilidadInicializado) {

        nombresMeses.forEach(m => { colapso[m] = true; });

        window.mesesRentabilidadInicializado = true;

    }

    //----------------------------------
    // Estructura: por mes -> semanas y,
    // dentro de cada semana/mes, ingreso
    // de cada asesor
    //----------------------------------

    const meses = nombresMeses.map(nombreMes => {

        const registrosMes = base.filter(f => f["MES"] === nombreMes);

        const semanas = [...new Set(
            registrosMes.map(f => Number(f["SEMANA"] || 0))
        )].sort((a, b) => a - b);

        const porAsesorSemana = {}; // { semana: { asesor: ingreso } }

        semanas.forEach(s => {

            const registrosSemana = registrosMes.filter(f => Number(f["SEMANA"] || 0) === s);

            porAsesorSemana[s] = {};

            asesores.forEach(asesor => {

                const registrosAsesor = registrosSemana.filter(f => f["EJECUTIVO"] === asesor);

                porAsesorSemana[s][asesor] = calcularIngresoRentabilidad(registrosAsesor).ingreso;

            });

        });

        const porAsesorMes = {};

        asesores.forEach(asesor => {

            const registrosAsesor = registrosMes.filter(f => f["EJECUTIVO"] === asesor);

            porAsesorMes[asesor] = calcularIngresoRentabilidad(registrosAsesor).ingreso;

        });

        const totalEquipoMes = asesores.reduce((s, a) => s + porAsesorMes[a], 0);

        return { nombre: nombreMes, semanas, porAsesorSemana, porAsesorMes, totalEquipoMes };

    });

    //----------------------------------
    // CABECERA: Asesor + una(s) columna(s)
    // por cada mes (y sus semanas si el
    // mes está expandido)
    //----------------------------------

    let colsPorMes = "";
    let subCabecera = "";

    meses.forEach(mes => {

        const colapsado = !!colapso[mes.nombre];
        const icono     = colapsado ? "▸" : "▾";

        const nCols = colapsado ? 1 : (1 + mes.semanas.length);

        colsPorMes += `
            <th colspan="${nCols}"
                class="th-semana-toggle"
                onclick="toggleMesRentabilidad('${mes.nombre}')"
                title="Clic para ${colapsado ? "expandir" : "contraer"} ${mes.nombre}">
                📆 ${mes.nombre} <span class="icono-semana">${icono}</span>
            </th>
        `;

        subCabecera += `<th>Total mes</th>`;

        if (!colapsado) {

            mes.semanas.forEach(s => {
                subCabecera += `<th class="celda-semana">Sem. ${s}</th>`;
            });

        }

    });

    const cabecera = `
        <tr>
            <th class="col-ejecutivo" rowspan="2">Asesor</th>
            ${colsPorMes}
        </tr>
        <tr>
            ${subCabecera}
        </tr>
    `;

    //----------------------------------
    // FILAS: una por asesor + fila TOTAL
    //----------------------------------

    let filas = "";

    asesores.forEach(asesor => {

        let celdas = "";

        meses.forEach(mes => {

            const colapsado = !!colapso[mes.nombre];
            const valorMes  = mes.porAsesorMes[asesor];

            celdas += `<td class="${claseRentabilidad(valorMes)}"><strong>${formatearUSDRentabilidad(valorMes)}</strong></td>`;

            if (!colapsado) {

                mes.semanas.forEach(s => {
                    const valorSemana = mes.porAsesorSemana[s][asesor];
                    celdas += `<td class="celda-semana ${claseRentabilidad(valorSemana)}">${formatearUSDRentabilidad(valorSemana)}</td>`;
                });

            }

        });

        filas += `
            <tr>
                <td class="col-ejecutivo">${asesor}</td>
                ${celdas}
            </tr>
        `;

    });

    //----------------------------------
    // FILA TOTAL EQUIPO
    //----------------------------------

    let celdasTotal = "";

    meses.forEach(mes => {

        const colapsado = !!colapso[mes.nombre];

        celdasTotal += `<td class="col-total-rentab"><strong>${formatearUSDRentabilidad(mes.totalEquipoMes)}</strong></td>`;

        if (!colapsado) {

            mes.semanas.forEach(s => {
                const totalSemana = asesores.reduce((sum, a) => sum + mes.porAsesorSemana[s][a], 0);
                celdasTotal += `<td class="celda-semana col-total-rentab">${formatearUSDRentabilidad(totalSemana)}</td>`;
            });

        }

    });

    const filaTotal = `
        <tr class="fila-total-activos">
            <td class="col-ejecutivo">Total Equipo</td>
            ${celdasTotal}
        </tr>
    `;

    panel.innerHTML = `

        <div class="rentab-leyenda">
            <span class="rentab-chip">💵 Móvil habilitada: $${PAGO_HABILITADA_MOVIL.toFixed(1)}</span>
            <span class="rentab-chip">🏠 Hogar habilitada: $${PAGO_HABILITADA_HOGAR.toFixed(1)}</span>
            <span class="rentab-chip">⚖️ Punto de equilibrio: ${formatearUSDRentabilidad(PUNTO_EQUILIBRIO_RENTABILIDAD)} / asesor</span>
            <span class="rentab-chip rentab-ok">■ Sobre equilibrio</span>
            <span class="rentab-chip rentab-bajo">■ Bajo equilibrio</span>
        </div>

        <div class="tablaResumenWrapper">

        <table class="tabla-ranking-diario tabla-rentabilidad">

            <thead>${cabecera}</thead>

            <tbody>${filas}${filaTotal}</tbody>

        </table>

        </div>

    `;

}
