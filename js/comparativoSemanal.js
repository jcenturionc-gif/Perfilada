//======================================
// COMPARATIVOSEMANAL.JS
// Comparativo semanal por asesor (último mes)
// Tarjetas + patrones + variaciones % + storytelling
//======================================

//======================================
// UTILIDAD: % DE VARIACIÓN
//======================================

function variacionPctAsesor(actual, anterior) {

    if (anterior === null || anterior === undefined || anterior === 0) return null;

    return ((actual - anterior) / anterior) * 100;

}

//======================================
// ÚLTIMO MES DISPONIBLE EN LA DATA
// (independiente de los filtros activos,
// siempre trabaja sobre masterData)
//======================================

function obtenerUltimoMesDisponible() {

    const base = (typeof masterData !== "undefined") ? masterData : [];

    const meses = [...new Set(base.map(f => f["MES"]).filter(Boolean))];

    if (!meses.length) return null;

    const orden = (typeof ORDEN_MESES !== "undefined") ? ORDEN_MESES : [];

    meses.sort((a, b) => orden.indexOf(a) - orden.indexOf(b));

    return meses[meses.length - 1];

}

//======================================
// SERIE SEMANAL DE UN ASESOR
// DENTRO DE UN CONJUNTO DE REGISTROS
//======================================

function obtenerSerieSemanalAsesor(registrosAsesor) {

    const semanas = [...new Set(
        registrosAsesor.map(f => Number(f["SEMANA"] || 0))
    )].sort((a, b) => a - b);

    return semanas.map(s =>
        totalizarConjunto(
            registrosAsesor.filter(f => Number(f["SEMANA"] || 0) === s),
            s
        )
    );

}

//======================================
// COMPARATIVO SEMANAL POR ASESOR
// (último mes disponible, todos los asesores)
//======================================

function obtenerComparativoSemanalPorAsesor(mesSeleccionado) {

    const base = (typeof masterData !== "undefined") ? masterData : [];

    const mes = mesSeleccionado || obtenerUltimoMesDisponible();

    if (!mes) return { mes: null, asesores: [] };

    const registrosMes = base.filter(f => f["MES"] === mes);

    const nombres = [...new Set(
        registrosMes.map(f => (f["EJECUTIVO"] || "").trim()).filter(Boolean)
    )].sort();

    const metas = (typeof CONFIG !== "undefined" && CONFIG.METAS) ? CONFIG.METAS : {};
    const metaConversion = metas.CONVERSION || 80;
    const metaAdherencia = metas.ADHERENCIA || 95;
    const metaProductividad = metas.PRODUCTIVIDAD || 0;

    const asesores = nombres.map(nombre => {

        const registrosAsesor = registrosMes.filter(
            f => (f["EJECUTIVO"] || "").trim() === nombre
        );

        const serie = obtenerSerieSemanalAsesor(registrosAsesor);

        const totalMes = totalizarConjunto(registrosAsesor, "Total");

        return {

            ejecutivo: nombre,

            serie,

            totalMes,

            metaConversion,

            metaAdherencia,

            metaProductividad

        };

    });

    return { mes, asesores };

}

//======================================
// ESTADO SEGÚN CONVERSIÓN (para la pill
// de la tarjeta, comparado con la meta)
//======================================

function estadoConversionAsesor(conv, metaConversion) {

    const brecha = conv - metaConversion;

    if (brecha >= 0) return { texto: "En meta", clase: "destacado" };

    if (brecha >= -10) return { texto: "Cerca de meta", clase: "mejorable" };

    return { texto: "Bajo meta", clase: "critico" };

}

//======================================
// PATRÓN INDIVIDUAL DETECTADO
// (racha de conversión + mayor variación
// + riesgo de adherencia)
//======================================

function detectarPatronAsesor(item) {

    const { serie, metaConversion, metaAdherencia } = item;

    if (!serie.length) {

        return { texto: "Sin gestión registrada en el mes.", riesgo: false };

    }

    if (serie.length === 1) {

        return {
            texto: `Solo tiene una semana de gestión registrada este mes (Semana ${serie[0].semana}), aún no hay comparativo semana a semana.`,
            riesgo: serie[0].conversion < metaConversion - 15 || serie[0].adherencia < metaAdherencia
        };

    }

    const actual = serie[serie.length - 1];
    const anterior = serie[serie.length - 2];
    const primera = serie[0];

    //----------------------------------
    // Racha de conversión
    //----------------------------------

    let racha = 1;
    let direccion = actual.conversion >= anterior.conversion ? "al alza" : "a la baja";

    for (let i = serie.length - 1; i > 0; i--) {

        const sube = serie[i].conversion >= serie[i - 1].conversion;

        if ((direccion === "al alza" && sube) || (direccion === "a la baja" && !sube)) {
            racha++;
        } else {
            break;
        }

    }

    //----------------------------------
    // Mayor variación (positiva o negativa)
    // entre solicitudes, habilitadas,
    // conversión y productividad
    //----------------------------------

    const variaciones = [
        { nombre: "solicitudes", valor: variacionPctAsesor(actual.solicitudes, anterior.solicitudes) },
        { nombre: "habilitadas", valor: variacionPctAsesor(actual.habilitadas, anterior.habilitadas) },
        { nombre: "conversión", valor: variacionPctAsesor(actual.conversion, anterior.conversion) },
        { nombre: "productividad", valor: variacionPctAsesor(actual.productividad, anterior.productividad) }
    ].filter(v => v.valor !== null);

    let textoVariacionDestacada = "";

    if (variaciones.length) {

        const destacada = variaciones.reduce((a, b) =>
            Math.abs(b.valor) > Math.abs(a.valor) ? b : a
        );

        textoVariacionDestacada = ` El mayor movimiento semana a semana fue en <strong>${destacada.nombre}</strong>,
            con ${destacada.valor >= 0 ? "un alza" : "una caída"} de <strong>${Math.abs(destacada.valor).toFixed(1)}%</strong>.`;

    }

    //----------------------------------
    // Riesgo de adherencia
    //----------------------------------

    const riesgoAdherencia = actual.adherencia < metaAdherencia;

    const deltaTotal = actual.conversion - primera.conversion;

    const veredicto = deltaTotal >= 5
        ? "En franca mejora."
        : deltaTotal <= -5
            ? "En caída, requiere atención."
            : "Estable, sin cambios relevantes.";

    const textoAdherencia = riesgoAdherencia
        ? ` Adherencia en <strong>${actual.adherencia.toFixed(1)}%</strong>, por debajo de la meta (${metaAdherencia}%).`
        : "";

    const recomendacion = patronRecomendacion(riesgoAdherencia, direccion, racha, actual, metaConversion);

    const texto = `
        <strong>${veredicto}</strong> Conversión: <strong>${primera.conversion.toFixed(1)}%</strong> →
        <strong>${actual.conversion.toFixed(1)}%</strong> en ${serie.length} semanas
        (${deltaTotal >= 0 ? "+" : ""}${deltaTotal.toFixed(1)} pts), con
        <strong>${racha} semana${racha > 1 ? "s" : ""} ${direccion}</strong> seguidas.
        ${textoVariacionDestacada}
        ${textoAdherencia}
        ${recomendacion}
    `;

    const riesgo = riesgoAdherencia
        || actual.conversion < metaConversion - 15
        || (direccion === "a la baja" && racha >= 2);

    return { texto, riesgo };

}

//======================================
// RECOMENDACIÓN ACCIONABLE (una línea)
//======================================

function patronRecomendacion(riesgoAdherencia, direccion, racha, actual, metaConversion) {

    if (actual.conversion < metaConversion - 15) {
        return ` <strong>Recomendación:</strong> revisar en la próxima 1:1, conversión muy por debajo de meta.`;
    }

    if (direccion === "a la baja" && racha >= 2) {
        return ` <strong>Recomendación:</strong> frenar la racha de caída antes del cierre de mes.`;
    }

    if (riesgoAdherencia) {
        return ` <strong>Recomendación:</strong> reforzar el cumplimiento de horario esta semana.`;
    }

    if (direccion === "al alza" && racha >= 2) {
        return ` <strong>Recomendación:</strong> sostener el ritmo, va camino a superar su mejor semana.`;
    }

    return "";

}

//======================================
// FILAS DE LA TABLA SEMANAL (mini tabla
// dentro de cada tarjeta)
//======================================

function filasSemanaAsesor(serie) {

    return serie.map((s, i) => `

        <tr class="${i === serie.length - 1 ? "acc-fila-actual" : ""}">
            <td>Sem. ${s.semana}</td>
            <td>${s.solicitudes.toLocaleString("es-PE")}</td>
            <td>${s.habilitadas.toLocaleString("es-PE")}</td>
            <td>${s.conversion.toFixed(1)}%</td>
            <td>${s.productividad.toFixed(2)}</td>
            <td>${s.adherencia.toFixed(1)}%</td>
        </tr>

    `).join("");

}

//======================================
// BADGES DE VARIACIÓN (última semana
// vs. semana anterior)
//======================================

function badgesVariacionAsesor(serie) {

    if (serie.length < 2) {

        return `<div class="acc-sin-comparativo">Aún no hay dos semanas para comparar variación.</div>`;

    }

    const actual = serie[serie.length - 1];
    const anterior = serie[serie.length - 2];

    const indicadores = [
        { nombre: "Solicitudes", actual: actual.solicitudes, anterior: anterior.solicitudes, unidad: "" },
        { nombre: "Habilitadas", actual: actual.habilitadas, anterior: anterior.habilitadas, unidad: "" },
        { nombre: "Conversión", actual: actual.conversion, anterior: anterior.conversion, unidad: "%" },
        { nombre: "Productividad", actual: actual.productividad, anterior: anterior.productividad, unidad: "" },
        { nombre: "Adherencia", actual: actual.adherencia, anterior: anterior.adherencia, unidad: "%" }
    ];

    return `
        <div class="acc-variaciones">
            ${indicadores.map(ind => {

                const variacion = variacionPctAsesor(ind.actual, ind.anterior);

                const sube = variacion !== null && variacion >= 0;

                const clase = variacion === null ? "neutro" : (sube ? "positivo" : "negativo");

                const flecha = variacion === null ? "▪" : (sube ? "▲" : "▼");

                return `
                    <div class="acc-var">
                        <span>${ind.nombre}</span>
                        <strong>${ind.actual.toFixed(ind.unidad ? 1 : 0)}${ind.unidad}</strong>
                        <span class="acc-var-badge ${clase}">
                            ${flecha} ${variacion === null ? "s/d" : Math.abs(variacion).toFixed(1) + "%"}
                        </span>
                    </div>
                `;

            }).join("")}
        </div>
    `;

}

//======================================
// BLOQUE COMPARATIVO DE UN ASESOR
// (sin cabecera propia: se inserta debajo
// de la ficha de Score del mismo asesor)
//======================================

function construirBloqueComparativoAsesor(item, mes) {

    const { serie } = item;

    const patron = detectarPatronAsesor(item);

    if (!serie.length) {

        return `
            <div class="comparativo-subtitulo">📆 Comparativo Semanal · ${mes || "sin datos"}</div>
            <p class="acc-story">${patron.texto}</p>
        `;

    }

    return `

        <div class="comparativo-subtitulo">📆 Comparativo Semanal · ${mes || "sin datos"}</div>

        <div class="asesor-comparativo-card ${patron.riesgo ? "acc-riesgo" : ""}">

            <p class="acc-story">${patron.texto}</p>

            ${badgesVariacionAsesor(serie)}

            <div class="acc-tabla-scroll">

                <table class="acc-tabla-semanal">

                    <thead>
                        <tr>
                            <th>Semana</th>
                            <th>Sol.</th>
                            <th>Hab.</th>
                            <th>Conv.</th>
                            <th>Prod.</th>
                            <th>Adh.</th>
                        </tr>
                    </thead>

                    <tbody>
                        ${filasSemanaAsesor(serie)}
                    </tbody>

                </table>

            </div>

        </div>

    `;

}

//======================================
// RENDER DEL COMPARATIVO PARA UN ASESOR
// (se inserta debajo de su ficha de Score,
// controlado por el mismo selector)
//======================================

function renderizarComparativoParaAsesor(nombre, mesSeleccionado) {

    const contDetalle = document.getElementById("panelComparativoDetalle");

    if (!contDetalle) return;

    try {

        const { mes, asesores } = obtenerComparativoSemanalPorAsesor(mesSeleccionado);

        const item = asesores.find(a => a.ejecutivo === nombre);

        if (!item) {

            contDetalle.innerHTML = `
                <div class="comparativo-subtitulo">📆 Comparativo Semanal · ${mes || "sin datos"}</div>
                <p class="acc-story">Este asesor no tiene gestión registrada en ${mes || "el último mes"}.</p>
            `;

            return;

        }

        contDetalle.innerHTML = construirBloqueComparativoAsesor(item, mes);

    } catch (error) {

        console.error("Comparativo semanal (ficha de asesor):", error);

    }

}
