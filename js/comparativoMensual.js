//======================================
// COMPARATIVOMENSUAL.JS
// Comparativo Mes vs Mes, con desglose
// por semana dentro de cada mes y
// variación % contra el mes anterior.
// Mismos indicadores que el Resumen
// Gerencial Diario (tabla de referencia).
// Siempre trabaja sobre masterData
// (independiente de los filtros activos).
//======================================

window.mesesColapsadosComparativo = window.mesesColapsadosComparativo || {};

//----------------------------------
// Alternar (colapsar / expandir) un mes
//----------------------------------

function toggleMesComparativo(nombreMes) {

    window.mesesColapsadosComparativo[nombreMes] = !window.mesesColapsadosComparativo[nombreMes];

    construirComparativoMensual();

}

//----------------------------------
// Totaliza un conjunto de registros y
// devuelve TODOS los campos crudos +
// calculados usados por el Resumen
// Gerencial Diario (misma lógica).
//----------------------------------

function totalizarMensualCompleto(registros) {

    const r = {

        metaSol: 0, metaHab: 0,
        agentes: 0, horas: 0, dias: 0, conexion: 0,

        solicitudes: 0, habilitadas: 0,
        registros: 0,
        llamadasIN: 0, llamadasOUT: 0,

        solESIM: 0, solE2H: 0, solEA: 0, solDR: 0, solRT: 0,
        habESIM: 0, habE2H: 0, habEA: 0, habDR: 0, habRT: 0

    };

    registros.forEach(f => {

        r.metaSol += Number(f["CUOTA SOL"] || 0);
        r.metaHab += Number(f["CUOTA HAB"] || 0);

        r.agentes += 1;
        r.horas   += Number(f["PROGRAMADO"] || 0);
        r.dias    += Number(f["TO PROD"] || 0);
        r.conexion += Number(f["CONEXIÓN"] || 0);

        r.solicitudes += Number(f["SOLICITUDES"] || 0);
        r.habilitadas += Number(f["HABILITADAS"] || 0);

        r.registros += Number(f["REGISTROS"] || 0);

        r.llamadasIN  += Number(f["LLAMADAS IN"] || 0);
        r.llamadasOUT += Number(f["LLAMADAS OU"] || 0);

        r.solESIM += Number(f["S. ESIM"] || 0);
        r.solE2H  += Number(f["S. E2H"] || 0);
        r.solEA   += Number(f["S. EA"] || 0);
        r.solDR   += Number(f["S. DR"] || 0);
        r.solRT   += Number(f["S. RT"] || 0);

        r.habESIM += Number(f["H. ESIM"] || 0);
        r.habE2H  += Number(f["H. E2H"] || 0);
        r.habEA   += Number(f["H. EA"] || 0);
        r.habDR   += Number(f["H. DR"] || 0);
        r.habRT   += Number(f["H. RT"] || 0);

    });

    //----------------------------------
    // Calculados (misma fórmula que
    // Resumen Gerencial Diario)
    //----------------------------------

    r.conversion = r.solicitudes > 0 ? (r.habilitadas / r.solicitudes) * 100 : 0;
    r.productividad = r.dias > 0 ? r.solicitudes / r.dias : 0;
    r.adherencia = r.horas > 0 ? (r.conexion / r.horas) * 100 : 0;

    r.vueltasPorRegistro = r.registros > 0 ? (r.llamadasIN + r.llamadasOUT) / r.registros : 0;
    r.efectividadRegistros = r.registros > 0 ? (r.solicitudes / r.registros) * 100 : 0;

    r.cumplimientoSolicitudes = r.metaSol > 0 ? (r.solicitudes / r.metaSol) * 100 : 0;
    r.cumplimientoHabilitadas = r.metaHab > 0 ? (r.habilitadas / r.metaHab) * 100 : 0;

    r.conversionESIM = r.solESIM > 0 ? (r.habESIM / r.solESIM) * 100 : 0;
    r.conversionE2H  = r.solE2H  > 0 ? (r.habE2H  / r.solE2H)  * 100 : 0;
    r.conversionEA   = r.solEA   > 0 ? (r.habEA   / r.solEA)   * 100 : 0;
    r.conversionDR   = r.solDR   > 0 ? (r.habDR   / r.solDR)   * 100 : 0;
    r.conversionRT   = r.solRT   > 0 ? (r.habRT   / r.solRT)   * 100 : 0;

    r.participacionESIM = r.solicitudes > 0 ? (r.solESIM / r.solicitudes) * 100 : 0;
    r.participacionE2H  = r.solicitudes > 0 ? (r.solE2H  / r.solicitudes) * 100 : 0;
    r.participacionEA   = r.solicitudes > 0 ? (r.solEA   / r.solicitudes) * 100 : 0;
    r.participacionDR   = r.solicitudes > 0 ? (r.solDR   / r.solicitudes) * 100 : 0;
    r.participacionRT   = r.solicitudes > 0 ? (r.solRT   / r.solicitudes) * 100 : 0;

    return r;

}

//----------------------------------
// Indicadores a mostrar, agrupados igual
// que el Resumen Gerencial Diario
// (mismo orden, con separadores)
//----------------------------------

const INDICADORES_COMPARATIVO_MENSUAL = [

    // METAS
    { nombre: "Meta Solicitudes",   campo: "metaSol",  formato: "numero" },
    { nombre: "Meta Habilitadas",   campo: "metaHab",  formato: "numero" },

    { separador: true },

    // OPERACIÓN
    { nombre: "Agentes Programados", campo: "agentes", formato: "numero"  },
    { nombre: "Horas Programadas",   campo: "horas",   formato: "decimal" },

    { separador: true },

    // RESULTADOS
    { nombre: "Solicitudes",  campo: "solicitudes", formato: "numero" },
    { nombre: "Habilitadas",  campo: "habilitadas", formato: "numero" },
    { nombre: "Registros",    campo: "registros",   formato: "numero" },
    { nombre: "Llamadas IN",  campo: "llamadasIN",  formato: "numero" },
    { nombre: "Llamadas OUT", campo: "llamadasOUT", formato: "numero" },

    { nombre: "Vueltas por Registro",        campo: "vueltasPorRegistro",   formato: "decimal"    },
    { nombre: "Efectividad sobre Registros", campo: "efectividadRegistros", formato: "porcentaje" },

    { separador: true },

    // CUMPLIMIENTO
    { nombre: "Cumplimiento Solicitudes", campo: "cumplimientoSolicitudes", formato: "porcentaje" },
    { nombre: "Cumplimiento Habilitadas", campo: "cumplimientoHabilitadas", formato: "porcentaje" },

    // PRODUCTIVIDAD Y ADHERENCIA
    { nombre: "Productividad", campo: "productividad", formato: "decimal"    },
    { nombre: "Adherencia",    campo: "adherencia",    formato: "porcentaje" },

    // CONVERSIÓN
    { nombre: "Conversión",      campo: "conversion",     formato: "porcentaje" },
    { nombre: "Conversión ESIM", campo: "conversionESIM", formato: "porcentaje" },
    { nombre: "Conversión E2H",  campo: "conversionE2H",  formato: "porcentaje" },
    { nombre: "Conversión EA",   campo: "conversionEA",   formato: "porcentaje" },
    { nombre: "Conversión DR",   campo: "conversionDR",   formato: "porcentaje" },
    { nombre: "Conversión RT",   campo: "conversionRT",   formato: "porcentaje" },

    { separador: true },

    // PARTICIPACIÓN POR MÉTODO DE ENTREGA
    { nombre: "% Participación ESIM", campo: "participacionESIM", formato: "porcentaje" },
    { nombre: "% Participación E2H",  campo: "participacionE2H",  formato: "porcentaje" },
    { nombre: "% Participación EA",   campo: "participacionEA",   formato: "porcentaje" },
    { nombre: "% Participación DR",   campo: "participacionDR",   formato: "porcentaje" },
    { nombre: "% Participación RT",   campo: "participacionRT",   formato: "porcentaje" }

];

//----------------------------------
// Formato de celda según el indicador
//----------------------------------

function formatearValorComparativoMensual(valor, formato) {

    if (formato === "porcentaje") return valor.toFixed(1) + "%";

    if (formato === "decimal") return valor.toFixed(2);

    return Math.round(valor).toLocaleString("es-PE");

}

//----------------------------------
// Meses disponibles en toda la data
// (orden cronológico, no solo el mes filtrado)
//----------------------------------

function obtenerMesesOrdenadosComparativo() {

    const base = (typeof masterData !== "undefined") ? masterData : [];

    const orden = (typeof ORDEN_MESES !== "undefined") ? ORDEN_MESES : [];

    const meses = [...new Set(base.map(f => f["MES"]).filter(Boolean))];

    meses.sort((a, b) => orden.indexOf(a) - orden.indexOf(b));

    return meses;

}

//======================================
// CONSTRUCCIÓN PRINCIPAL DEL PANEL
//======================================

function construirComparativoMensual() {

    const panel = document.getElementById("panelComparativoMensual");

    if (!panel) return;

    const base = (typeof masterData !== "undefined") ? masterData : [];

    const nombresMeses = obtenerMesesOrdenadosComparativo();

    if (!nombresMeses.length) {

        panel.innerHTML = `<p class="acc-sin-comparativo">Aún no hay datos suficientes para el comparativo mensual.</p>`;

        return;

    }

    const colapso = window.mesesColapsadosComparativo;

    if (!window.mesesComparativoInicializado) {

        nombresMeses.forEach(m => { colapso[m] = true; });

        window.mesesComparativoInicializado = true;

    }

    //----------------------------------
    // Estructura por mes: semanas que lo
    // componen + totalizado de cada semana
    // + totalizado del mes completo
    //----------------------------------

    const meses = nombresMeses.map(nombreMes => {

        const registrosMes = base.filter(f => f["MES"] === nombreMes);

        const semanas = [...new Set(
            registrosMes.map(f => Number(f["SEMANA"] || 0))
        )].sort((a, b) => a - b);

        const porSemana = {};

        semanas.forEach(s => {

            porSemana[s] = totalizarMensualCompleto(
                registrosMes.filter(f => Number(f["SEMANA"] || 0) === s)
            );

        });

        const total = totalizarMensualCompleto(registrosMes);

        return { nombre: nombreMes, semanas, porSemana, total };

    });

    //----------------------------------
    // CABECERA (mes colapsable + semanas + Var.%)
    //----------------------------------

    let filaMeses   = `<tr><th class="col-ejecutivo" rowspan="2">Indicador</th>`;
    let filaSemanas = "";

    meses.forEach(mes => {

        const colapsado = !!colapso[mes.nombre];
        const colspan   = colapsado ? 1 : (mes.semanas.length + 1);
        const rowspan   = colapsado ? 2 : 1;
        const icono     = colapsado ? "▸" : "▾";

        filaMeses += `
            <th colspan="${colspan}" rowspan="${rowspan}"
                class="th-semana-toggle"
                onclick="toggleMesComparativo('${mes.nombre}')"
                title="Clic para ${colapsado ? "expandir" : "contraer"} ${mes.nombre}">
                📆 ${mes.nombre}
                <span class="icono-semana">${icono}</span>
            </th>
            <th rowspan="2">Var. % vs mes ant.</th>
        `;

        if (!colapsado) {

            mes.semanas.forEach(s => {
                filaSemanas += `<th>Sem. ${s}</th>`;
            });

            filaSemanas += `<th>Total</th>`;

        }

    });

    filaMeses += `</tr>`;

    const cabecera = filaMeses + (filaSemanas ? `<tr>${filaSemanas}</tr>` : "");

    //----------------------------------
    // Cantidad de columnas visibles
    // (para las filas separadoras)
    //----------------------------------

    const columnasVisibles = meses.reduce(

        (s, mes) => s + (colapso[mes.nombre] ? 1 : mes.semanas.length + 1) + 1,
        1 // + columna "Indicador"

    );

    //----------------------------------
    // FILAS (una por indicador, + separadores)
    //----------------------------------

    let filas = "";

    INDICADORES_COMPARATIVO_MENSUAL.forEach(ind => {

        if (ind.separador) {

            filas += `<tr class="filaSeparador"><td colspan="${columnasVisibles}"></td></tr>`;

            return;

        }

        filas += `<tr><td class="col-ejecutivo">${ind.nombre}</td>`;

        meses.forEach((mes, i) => {

            const colapsado = !!colapso[mes.nombre];

            if (!colapsado) {

                mes.semanas.forEach(s => {

                    const valor = mes.porSemana[s][ind.campo];

                    filas += `<td>${formatearValorComparativoMensual(valor, ind.formato)}</td>`;

                });

            }

            const valorTotal = mes.total[ind.campo];

            filas += `<td class="${colapsado ? "celda-semana" : ""}"><strong>${formatearValorComparativoMensual(valorTotal, ind.formato)}</strong></td>`;

            //----------------------------------
            // Variación % vs el mes anterior
            // (siempre contra el TOTAL del mes,
            // sin importar si está colapsado)
            //----------------------------------

            const mesAnterior = meses[i - 1];

            if (!mesAnterior) {

                filas += `<td><span class="acc-var-badge neutro">▪ s/d</span></td>`;

            } else {

                const valorAnterior = mesAnterior.total[ind.campo];

                if (!valorAnterior) {

                    filas += `<td><span class="acc-var-badge neutro">▪ s/d</span></td>`;

                } else {

                    const variacion = ((valorTotal - valorAnterior) / valorAnterior) * 100;
                    const sube      = variacion >= 0;
                    const clase     = sube ? "positivo" : "negativo";
                    const flecha    = sube ? "▲" : "▼";

                    filas += `
                        <td>
                            <span class="acc-var-badge ${clase}">
                                ${flecha} ${Math.abs(variacion).toFixed(1)}%
                            </span>
                        </td>
                    `;

                }

            }

        });

        filas += `</tr>`;

    });

    panel.innerHTML = `

        <div class="tablaResumenWrapper">

        <table class="tabla-ranking-diario">

            <thead>${cabecera}</thead>

            <tbody>${filas}</tbody>

        </table>

        </div>

    `;

}
