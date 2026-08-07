//======================================
// SEMANAUTILS.JS
// Utilidades compartidas para agrupar
// columnas de "Día" en bloques de "Semana"
// contraíbles (usado por Resumen Gerencial,
// Ranking General y Detalle de Habilitadas)
//======================================

//----------------------------------
// Agrupa un arreglo de días (ya ordenado)
// en bloques según el campo SEMANA de la data
//----------------------------------

function agruparDiasPorSemana(dias) {

    const semanaPorDia = {};

    dias.forEach(d => {

        const fila = dataFiltrada.find(f => Number(f["DIA"]) === d);

        semanaPorDia[d] = fila ? Number(fila["SEMANA"] || 0) : 0;

    });

    const semanas = []; // [{ numero, dias:[...] }]

    dias.forEach(d => {

        const s = semanaPorDia[d];

        let grupo = semanas[semanas.length - 1];

        if (!grupo || grupo.numero !== s) {
            grupo = { numero: s, dias: [] };
            semanas.push(grupo);
        }

        grupo.dias.push(d);

    });

    return semanas;

}

//----------------------------------
// Construye las 2 filas de cabecera
// (fila de botones de semana + fila de días)
// para una tabla que agrupa columnas por semana.
// "toggleFn" es el nombre (string) de la función
// global que se debe llamar en el onclick.
//----------------------------------

function construirCabeceraSemanal(semanas, colapso, toggleFn) {

    let filaSemanas = "";
    let celdasDias  = "";

    semanas.forEach(sem => {

        const colapsada = !!colapso[sem.numero];
        const colspan   = colapsada ? 1 : sem.dias.length;
        const rowspan   = colapsada ? 2 : 1;
        const icono     = colapsada ? "▸" : "▾";

        filaSemanas += `
            <th rowspan="${rowspan}" colspan="${colspan}"
                class="th-semana-toggle"
                onclick="${toggleFn}(${sem.numero})"
                title="Clic para ${colapsada ? "expandir" : "contraer"} la semana ${sem.numero}">
                📅 Semana ${sem.numero}
                <span class="icono-semana">${icono}</span>
            </th>
        `;

        if (!colapsada) {

            sem.dias.forEach(d => {
                celdasDias += `<th>${d}</th>`;
            });

        }

    });

    return { filaSemanas, celdasDias };

}

//----------------------------------
// Construye las celdas <td> de una fila de datos
// para todas las semanas: si la semana está
// contraída, entrega UNA celda con el total de
// esa semana; si está expandida, entrega una
// celda por cada día.
//
// "porDia" es un objeto { diaNumero: valor }
// "formatear" recibe el valor numérico y devuelve el texto de la celda
//----------------------------------

function construirCeldasSemanales(semanas, colapso, porDia, formatear = (v) => v) {

    let html = "";

    semanas.forEach(sem => {

        if (colapso[sem.numero]) {

            const total = sem.dias.reduce((s, d) => s + (porDia[d] || 0), 0);

            html += `<td class="celda-semana">${formatear(total)}</td>`;

        } else {

            sem.dias.forEach(d => {
                html += `<td>${formatear(porDia[d] || 0)}</td>`;
            });

        }

    });

    return html;

}
