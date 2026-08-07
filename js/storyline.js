//======================================
// STORYLINE.JS
// Resumen Ejecutivo narrativo (storytelling)
// + Evolución semanal completa
//======================================

function construirStoryline() {

    const cont = document.getElementById("storyline");

    if (!cont) return;

    try {

        const sol = totalSolicitudes();
        const hab = totalHabilitadas();
        const conv = conversion();
        const prod = productividad();
        const cumplSol = (typeof cumplimientoSolicitudes === "function") ? cumplimientoSolicitudes() : 0;
        const cumplHab = (typeof cumplimientoHabilitadas === "function") ? cumplimientoHabilitadas() : 0;
        const tmoSegundos = (typeof tmo === "function") ? tmo() : 0;

        const metas = (typeof CONFIG !== "undefined" && CONFIG.METAS) ? CONFIG.METAS : {};
        const metaConversion = metas.CONVERSION || 80;
        const metaProductividad = metas.PRODUCTIVIDAD || 0;

        const brecha = conv - metaConversion;
        const cumple = brecha >= 0;
        const cerca = !cumple && brecha >= -10;

        const tono = cumple ? "positivo" : (cerca ? "alerta" : "critico");

        const titulo = cumple
            ? "Semana en verde: el equipo supera la meta de conversión"
            : cerca
                ? "A un paso de la meta: hay margen para acelerar"
                : "Semana bajo meta: se requieren acciones inmediatas";

        const serie = (typeof obtenerSerieSemanal === "function")
            ? obtenerSerieSemanal()
            : [];

        const total = (typeof obtenerTotalSemanal === "function")
            ? obtenerTotalSemanal()
            : null;

        cont.className = `storyline storyline-${tono} fade-up`;

        cont.innerHTML = `

            <div class="storyline-main storyline-main-full">

                <span class="storyline-tag">📖 Resumen Ejecutivo</span>

                <h2>${titulo}</h2>

                <p>
                    El equipo registró <strong>${sol.toLocaleString("es-PE")}</strong> solicitudes
                    y habilitó <strong>${hab.toLocaleString("es-PE")}</strong>, con un cumplimiento de
                    <strong>${cumplSol.toFixed(0)}%</strong> en la cuota de solicitudes y
                    <strong>${cumplHab.toFixed(0)}%</strong> en la de habilitadas.
                    La conversión llegó a <strong>${conv.toFixed(1)}%</strong> frente a la meta de
                    <strong>${metaConversion}%</strong>
                    (${brecha >= 0 ? "+" : ""}${brecha.toFixed(1)} pts), con una productividad de
                    <strong>${prod.toFixed(2)}</strong> solicitudes/día (meta ${metaProductividad}) y un
                    TMO promedio de <strong>${formatearTiempoStoryline(tmoSegundos)} min</strong> por llamada.
                </p>

                <p class="storyline-detalle">
                    ${construirNarrativaDetallada(serie, metaConversion, metaProductividad)}
                </p>

                <p class="storyline-detalle">
                    ${construirNarrativaOperativa()}
                </p>

                ${construirChipsDestacados()}

            </div>

            ${construirEvolucionSemanal(serie, total, metaConversion, metaProductividad)}

        `;

    } catch (error) {

        console.error("Storyline:", error);

        cont.classList.add("hidden");

    }

}

//======================================
// FORMATEAR SEGUNDOS A mm:ss
//======================================

function formatearTiempoStoryline(segundos) {

    const minutos = Math.floor(segundos / 60);
    const secs = Math.round(segundos % 60);

    return `${minutos}:${secs.toString().padStart(2, "0")}`;

}

//======================================
// NARRATIVA OPERATIVA
// (cumplimiento de cuotas, TMO y mezcla
// completa de métodos de entrega)
//======================================

function construirNarrativaOperativa() {

    const cumplSol = (typeof cumplimientoSolicitudes === "function") ? cumplimientoSolicitudes() : 0;
    const cumplHab = (typeof cumplimientoHabilitadas === "function") ? cumplimientoHabilitadas() : 0;
    const tmoSegundos = (typeof tmo === "function") ? tmo() : 0;

    const canales = [
        { nombre: "ESIM", valor: (typeof representacionEsim === "function") ? representacionEsim() : 0 },
        { nombre: "Express 2H", valor: (typeof representacionE2H === "function") ? representacionE2H() : 0 },
        { nombre: "Express Agendado", valor: (typeof representacionEA === "function") ? representacionEA() : 0 },
        { nombre: "Delivery Regular", valor: (typeof representacionDR === "function") ? representacionDR() : 0 },
        { nombre: "Retiro en Tienda", valor: (typeof representacionRT === "function") ? representacionRT() : 0 }
    ].sort((a, b) => b.valor - a.valor);

    const mezclaTexto = canales
        .map(c => `<strong>${c.nombre}</strong> (${c.valor.toFixed(1)}%)`)
        .join(", ");

    return `

        En cumplimiento de cuotas, el equipo llegó a <strong>${cumplSol.toFixed(0)}%</strong>
        en solicitudes y a <strong>${cumplHab.toFixed(0)}%</strong> en habilitadas.
        El TMO promedio del periodo es de <strong>${formatearTiempoStoryline(tmoSegundos)} min</strong> por llamada.
        La representación de los métodos de entrega se compone de ${mezclaTexto}.

    `;

}

//======================================
// CHIPS DE HALLAZGOS CLAVE
// (cumplimientos, TMO y canal líder de
// entrega — foco del storytelling)
//======================================

function construirChipsDestacados() {

    const cumplSol = (typeof cumplimientoSolicitudes === "function") ? cumplimientoSolicitudes() : 0;
    const cumplHab = (typeof cumplimientoHabilitadas === "function") ? cumplimientoHabilitadas() : 0;
    const tmoSegundos = (typeof tmo === "function") ? tmo() : 0;

    const canales = [
        { nombre: "ESIM", valor: (typeof representacionEsim === "function") ? representacionEsim() : 0 },
        { nombre: "Express 2H", valor: (typeof representacionE2H === "function") ? representacionE2H() : 0 },
        { nombre: "Express Agendado", valor: (typeof representacionEA === "function") ? representacionEA() : 0 },
        { nombre: "Delivery Regular", valor: (typeof representacionDR === "function") ? representacionDR() : 0 },
        { nombre: "Retiro en Tienda", valor: (typeof representacionRT === "function") ? representacionRT() : 0 }
    ];

    const canalTop = canales.reduce((a, b) => (b.valor > a.valor ? b : a));

    const chipCumplSol = `
        <div class="storyline-chip ${cumplSol >= 100 ? "chip-verde" : "chip-rojo"}">
            <span>📋 Cumpl. Solicitudes</span>
            <strong>${cumplSol.toFixed(0)}%</strong>
            <span>${cumplSol >= 100 ? "Meta alcanzada" : "Por debajo de la meta"}</span>
        </div>
    `;

    const chipCumplHab = `
        <div class="storyline-chip ${cumplHab >= 100 ? "chip-verde" : "chip-rojo"}">
            <span>✅ Cumpl. Habilitadas</span>
            <strong>${cumplHab.toFixed(0)}%</strong>
            <span>${cumplHab >= 100 ? "Meta alcanzada" : "Por debajo de la meta"}</span>
        </div>
    `;

    const chipTMO = `
        <div class="storyline-chip chip-azul">
            <span>⏱ TMO Promedio</span>
            <strong>${formatearTiempoStoryline(tmoSegundos)} min</strong>
            <span>Por llamada</span>
        </div>
    `;

    const chipCanal = `
        <div class="storyline-chip chip-azul">
            <span>📦 Canal líder de entrega</span>
            <strong>${canalTop.nombre}</strong>
            <span>${canalTop.valor.toFixed(1)}% de las solicitudes</span>
        </div>
    `;

    return `
        <div class="storyline-chips-row">
            ${chipCumplSol}
            ${chipCumplHab}
            ${chipTMO}
            ${chipCanal}
        </div>
    `;

}

//======================================
// TEXTO NARRATIVO CON MÁS DETALLE
// (analiza toda la serie semanal)
//======================================

function construirNarrativaDetallada(serie, metaConversion, metaProductividad) {

    if (!serie || serie.length < 2) {

        return "Aún no hay suficientes semanas registradas para analizar una tendencia.";

    }

    const actual = serie[serie.length - 1];
    const anterior = serie[serie.length - 2];
    const primera = serie[0];

    //----------------------------------
    // Tendencia de conversión (racha)
    //----------------------------------

    let racha = 1;
    let direccion = actual.conversion >= anterior.conversion ? "subiendo" : "bajando";

    for (let i = serie.length - 1; i > 0; i--) {

        const sube = serie[i].conversion >= serie[i - 1].conversion;

        if ((direccion === "subiendo" && sube) || (direccion === "bajando" && !sube)) {
            racha++;
        } else {
            break;
        }

    }

    //----------------------------------
    // Mejor y peor semana (por conversión)
    //----------------------------------

    const mejorSemana = serie.reduce((a, b) => (b.conversion > a.conversion ? b : a));
    const peorSemana = serie.reduce((a, b) => (b.conversion < a.conversion ? b : a));

    //----------------------------------
    // Canal con mayor participación actual
    //----------------------------------

    const canales = [
        { nombre: "ESIM", valor: actual.participacionEsim },
        { nombre: "Express 2H", valor: actual.participacionE2H },
        { nombre: "Express Agendado", valor: actual.participacionEA }
    ];

    const canalTop = canales.reduce((a, b) => (b.valor > a.valor ? b : a));

    //----------------------------------
    // Variación de productividad
    //----------------------------------

    const deltaProd = actual.productividad - anterior.productividad;

    return `

        Analizando las <strong>${serie.length} semanas</strong> registradas (Semana ${primera.semana} a Semana ${actual.semana}),
        la conversión lleva <strong>${racha} semana${racha > 1 ? "s" : ""} ${direccion}</strong>
        de forma consecutiva. La mejor semana fue la <strong>Semana ${mejorSemana.semana}</strong>
        con <strong>${mejorSemana.conversion.toFixed(1)}%</strong> de conversión, mientras que la
        <strong>Semana ${peorSemana.semana}</strong> fue la más floja, con
        <strong>${peorSemana.conversion.toFixed(1)}%</strong>.
        La productividad ${deltaProd >= 0 ? "mejoró" : "cayó"}
        ${Math.abs(deltaProd).toFixed(2)} pts frente a la semana anterior
        (meta: ${metaProductividad}).
        El canal con mayor participación esta semana es
        <strong>${canalTop.nombre}</strong> con <strong>${canalTop.valor.toFixed(1)}%</strong>
        de las solicitudes.

    `;

}

//======================================
// EVOLUCIÓN SEMANAL COMPLETA (todas las semanas + total)
//======================================

function construirEvolucionSemanal(serie, total, metaConversion, metaProductividad) {

    if (!serie || !serie.length) return "";

    const claseCumplimiento = (valor, meta) => {

        if (!meta) return "";

        const ratio = (valor / meta) * 100;

        if (ratio >= 100) return "celda-cumple";
        if (ratio >= 90) return "celda-alerta";

        return "celda-riesgo";

    };

    const formatearTiempo = (segundos) => {

        const minutos = Math.floor(segundos / 60);
        const secs = Math.round(segundos % 60);

        return `${minutos}:${secs.toString().padStart(2, "0")}`;

    };

    const filaHTML = (s, opciones = {}) => {

        const { esActual = false, esTotal = false } = opciones;

        const claseSol = claseCumplimiento(s.cumplimientoSolicitudes, 100);
        const claseHab = claseCumplimiento(s.cumplimientoHabilitadas, 100);
        const claseConv = claseCumplimiento(s.conversion, metaConversion);
        const claseProd = claseCumplimiento(s.productividad, metaProductividad);

        const etiqueta = esTotal ? "Total" : `Semana ${s.semana}`;

        return `

            <tr class="${esActual ? "fila-actual" : ""} ${esTotal ? "fila-total" : ""}">

                <td class="col-indicador">
                    ${etiqueta} ${esActual ? '<span class="storyline-badge badge-info">Actual</span>' : ""}
                </td>

                <td class="${claseSol}">
                    ${s.solicitudes.toLocaleString("es-PE")}
                    <span class="celda-sub">${s.cumplimientoSolicitudes.toFixed(0)}% cuota</span>
                </td>

                <td class="${claseHab}">
                    ${s.habilitadas.toLocaleString("es-PE")}
                    <span class="celda-sub">${s.cumplimientoHabilitadas.toFixed(0)}% cuota</span>
                </td>

                <td class="${claseConv}">${s.conversion.toFixed(1)}%</td>

                <td class="${claseProd}">${s.productividad.toFixed(2)}</td>

                <td>${formatearTiempo(s.tmo)} min</td>

                <td>${s.participacionEsim.toFixed(1)}%</td>

                <td>${s.participacionE2H.toFixed(1)}%</td>

                <td>${s.participacionEA.toFixed(1)}%</td>

                <td>${s.participacionDR.toFixed(1)}%</td>

                <td>${s.participacionRT.toFixed(1)}%</td>

            </tr>

        `;

    };

    const filas = serie

        .map((s, i) => filaHTML(s, { esActual: i === serie.length - 1 }))

        .join("") + (total ? filaHTML(total, { esTotal: true }) : "");

    return `

        <div class="storyline-semanal">

            <div class="storyline-semanal-titulo">
                📊 Evolución Semanal Completa
                <span>Semana ${serie[0].semana} a Semana ${serie[serie.length - 1].semana} · verde = cumple meta, ámbar = cerca, rojo = en riesgo</span>
            </div>

            <div class="storyline-tabla-scroll">

                <table class="storyline-tabla">

                    <thead>
                        <tr>
                            <th>Semana</th>
                            <th>Solicitudes</th>
                            <th>Activas</th>
                            <th>Conversión<br><small>meta ${metaConversion}%</small></th>
                            <th>Productividad<br><small>meta ${metaProductividad}</small></th>
                            <th>TMO</th>
                            <th>% ESIM</th>
                            <th>% Expr. 2H</th>
                            <th>% Expr. Agendado</th>
                            <th>% Delivery Regular</th>
                            <th>% Retiro en Tienda</th>
                        </tr>
                    </thead>

                    <tbody>
                        ${filas}
                    </tbody>

                </table>

            </div>

        </div>

    `;

}
