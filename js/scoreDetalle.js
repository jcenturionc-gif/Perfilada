//======================================
// SCOREDETALLE.JS
// Ficha individual: medidor + tarjetas
// (por qué se puntuó así a cada asesor)
//======================================

let scoreAsesorSeleccionado = null;
let mesScoreSeleccionado = null;

//======================================
// CLASE CSS SEGÚN NIVEL
//======================================

function claseNivel(nivel) {

    if (nivel === "Destacado") return "destacado";
    if (nivel === "Bueno") return "bueno";
    if (nivel === "Mejorable") return "mejorable";

    return "critico";

}

//======================================
// RESUMEN DE EJECUTIVOS DE UN MES
// PUNTUAL (independiente del filtro
// global del Dashboard)
//======================================

function obtenerEjecutivosDeMes(mes) {

    if (!mes || typeof masterData === "undefined") return [];

    const datosMes = masterData.filter(f => String(f["MES"] || "") === mes);

    return obtenerResumenEjecutivos(datosMes);

}

//======================================
// POBLAR EL FILTRO DE MES DE ESTA VISTA
// (por defecto, el último mes disponible)
//======================================

function poblarFiltroMesScore() {

    const select = document.getElementById("filtroMesScore");

    if (!select) return;

    const meses = (typeof obtenerMesesDisponiblesOrdenados === "function")
        ? obtenerMesesDisponiblesOrdenados()
        : [];

    if (!meses.length) {

        select.innerHTML = `<option value="">Sin datos</option>`;

        mesScoreSeleccionado = null;

        return;

    }

    if (!mesScoreSeleccionado || !meses.includes(mesScoreSeleccionado)) {

        mesScoreSeleccionado = (typeof obtenerUltimoMesDisponible === "function")
            ? obtenerUltimoMesDisponible()
            : meses[meses.length - 1];

    }

    select.innerHTML = meses

        .map(m => `<option value="${m}">${m}</option>`)

        .join("");

    select.value = mesScoreSeleccionado;

    select.onchange = () => {

        mesScoreSeleccionado = select.value;

        // Un cambio de mes puede traer otro asesor top,
        // pero se intenta conservar la selección actual.
        construirPanelScoreDetalle();

    };

}

//======================================
// CONSTRUIR SELECTOR + FICHA
//======================================

function construirPanelScoreDetalle() {

    poblarFiltroMesScore();

    const selector = document.getElementById("selectorScoreAsesor");
    const contenedor = document.getElementById("panelScoreDetalle");

    if (!selector || !contenedor) return;

    const ejecutivos = obtenerEjecutivosDeMes(mesScoreSeleccionado);

    if (!ejecutivos.length) {

        selector.innerHTML = `<option value="">Sin datos</option>`;

        contenedor.innerHTML = `<p>No existen datos disponibles para ${mesScoreSeleccionado || "el mes seleccionado"}.</p>`;

        const contComparativo = document.getElementById("panelComparativoDetalle");

        if (contComparativo) contComparativo.innerHTML = "";

        return;

    }

    //----------------------------------
    // Ejecutivos del mes anterior, para
    // el comparativo dentro de las tarjetas
    //----------------------------------

    const mesAnterior = (typeof obtenerMesAnterior === "function")
        ? obtenerMesAnterior(mesScoreSeleccionado)
        : null;

    const ejecutivosMesAnterior = mesAnterior
        ? obtenerEjecutivosDeMes(mesAnterior)
        : [];

    //----------------------------------
    // Conservar selección previa si el
    // asesor sigue existiendo en el filtro
    //----------------------------------

    const nombresDisponibles = ejecutivos.map(e => e.ejecutivo);

    if (!scoreAsesorSeleccionado || !nombresDisponibles.includes(scoreAsesorSeleccionado)) {

        scoreAsesorSeleccionado = ejecutivos[0].ejecutivo;

    }

    selector.innerHTML = ejecutivos

        .map(e => `<option value="${e.ejecutivo}">${e.ejecutivo} · ${e.score.toFixed(1)} pts</option>`)

        .join("");

    selector.value = scoreAsesorSeleccionado;

    const renderizarSeleccionActual = () => {

        const eActual = ejecutivos.find(e => e.ejecutivo === scoreAsesorSeleccionado);

        const eAnterior = ejecutivosMesAnterior.find(e => e.ejecutivo === scoreAsesorSeleccionado) || null;

        renderizarScoreDetalle(eActual, eAnterior, mesAnterior);

        if (typeof renderizarComparativoParaAsesor === "function") {

            renderizarComparativoParaAsesor(scoreAsesorSeleccionado, mesScoreSeleccionado);

        }

    };

    selector.onchange = () => {

        scoreAsesorSeleccionado = selector.value;

        renderizarSeleccionActual();

    };

    renderizarSeleccionActual();

}

//======================================
// RENDER DE LA FICHA
//======================================

function renderizarScoreDetalle(e, anterior, mesAnterior) {

    const contenedor = document.getElementById("panelScoreDetalle");

    if (!contenedor || !e) return;

    const desglose = obtenerDesgloseScore(e);

    const desgloseAnterior = anterior ? obtenerDesgloseScore(anterior) : null;

    //----------------------------------
    // Comparativo del score total vs.
    // el mismo asesor en el mes anterior
    //----------------------------------

    const comparativoScoreHTML = (() => {

        if (!mesAnterior) {

            return `<div class="score-comparativo-mes kpi-delta-sin">Sin mes anterior disponible para comparar</div>`;

        }

        if (!anterior) {

            return `<div class="score-comparativo-mes kpi-delta-sin">Sin gestión registrada en ${mesAnterior}</div>`;

        }

        const delta = e.score - anterior.score;
        const sube = delta >= 0;

        return `
            <div class="score-comparativo-mes ${sube ? "kpi-delta-up" : "kpi-delta-down"}">
                ${sube ? "▲" : "▼"} ${Math.abs(delta).toFixed(1)} pts vs. ${mesAnterior}
                <span class="score-comparativo-mes-anterior">(${anterior.score.toFixed(1)} pts)</span>
            </div>
        `;

    })();

    //----------------------------------
    // Geometría del medidor circular
    //----------------------------------

    const radio = 60;
    const circunferencia = 2 * Math.PI * radio;
    const offset = circunferencia * (1 - Math.min(e.score, 100) / 100);

    const colorGauge = e.color || colorScore(e.score);

    //----------------------------------
    // Mayor oportunidad de mejora
    //----------------------------------

    const pendientes = desglose

        .filter(d => !d.cumple)

        .sort((a, b) => b.faltantePts - a.faltantePts);

    const top2 = pendientes.slice(0, 2);

    const scoreProyectado = Math.min(

        100,

        e.score + top2.reduce((s, d) => s + d.faltantePts, 0)

    );

    const notaOportunidad = top2.length

        ? `Tu mayor oportunidad está en <strong>${top2.map(d => d.nombre).join("</strong> y <strong>")}</strong>.
           Si las cierras, tu score subiría a un estimado de <strong>${scoreProyectado.toFixed(1)}</strong>.`

        : `Estás cumpliendo todas las metas que componen tu score. ¡Sigue así!`;

    //----------------------------------
    // Tarjetas por indicador
    //----------------------------------

    const cardsHTML = desglose.map(d => {

        const clase = d.cumple ? "ok" : (d.progresoCapado >= 80 ? "warn" : "bad");

        const barraColor = d.cumple ? "#16a34a" : (d.progresoCapado >= 80 ? "#f59e0b" : "#dc2626");

        const nota = d.cumple

            ? `✅ Superaste la meta · <span class="puntos-tag">${d.puntos.toFixed(1)} pts aportados</span>`

            : `${d.progresoCapado >= 80 ? "⚠" : "🚨"} Te faltan ${d.faltantePts.toFixed(1)} pts para la meta ·
               <span class="puntos-tag">${d.puntos.toFixed(1)} pts aportados</span>`;

        //----------------------------------
        // Comparativo de este indicador vs.
        // el mismo asesor en el mes anterior
        //----------------------------------

        const dAnterior = desgloseAnterior
            ? desgloseAnterior.find(x => x.clave === d.clave)
            : null;

        const comparativoIndicadorHTML = (() => {

            if (!mesAnterior) return "";

            if (!dAnterior) {
                return `<div class="indicador-comparativo-mes kpi-delta-sin">Sin dato de ${mesAnterior}</div>`;
            }

            const deltaInd = d.valorNum - dAnterior.valorNum;
            const subeInd = deltaInd >= 0;

            return `
                <div class="indicador-comparativo-mes ${subeInd ? "kpi-delta-up" : "kpi-delta-down"}">
                    ${subeInd ? "▲" : "▼"} ${Math.abs(deltaInd).toFixed(1)}${d.unidad} vs. ${mesAnterior}
                </div>
            `;

        })();

        return `

            <div class="indicador-card ${clase}">

                <div class="indicador-top">
                    <span class="indicador-nombre">${d.icono} ${d.nombre}</span>
                    <span class="indicador-peso">Peso ${d.pesoPct.toFixed(0)}%</span>
                </div>

                <div class="indicador-valores">
                    <span>Meta: ${d.meta}${d.unidad}</span>
                    <strong>${d.valorNum.toFixed(1)}${d.unidad}</strong>
                </div>

                <div class="barra"><div style="width:${d.progresoCapado}%;background:${barraColor};"></div></div>

                <div class="indicador-nota">${nota}</div>

                ${comparativoIndicadorHTML}

            </div>

        `;

    }).join("");

    //----------------------------------
    // Render final
    //----------------------------------

    contenedor.innerHTML = `

        <div class="score-top">

            <div class="gauge">

                <svg width="140" height="140" viewBox="0 0 140 140">
                    <circle cx="70" cy="70" r="${radio}" fill="none" stroke="#eef2f7" stroke-width="14"/>
                    <circle cx="70" cy="70" r="${radio}" fill="none" stroke="${colorGauge}" stroke-width="14"
                        stroke-dasharray="${circunferencia}" stroke-dashoffset="${offset}" stroke-linecap="round"/>
                </svg>

                <div class="gauge-texto">
                    <strong>${e.score.toFixed(1)}</strong>
                    <span>de 100 pts</span>
                </div>

            </div>

            <div class="info-asesor">

                <h2>${e.ejecutivo}</h2>

                <div class="nivel-pill ${claseNivel(e.nivel)}">${e.nivel}</div>

                ${comparativoScoreHTML}

                <p>
                    Tu score combina 7 indicadores, cada uno con un peso distinto.
                    ${notaOportunidad}
                </p>

            </div>

        </div>

        <div class="grid-indicadores">
            ${cardsHTML}
        </div>

    `;

}
