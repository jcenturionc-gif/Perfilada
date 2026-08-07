//======================================
// DASHBOARD.JS
// Dashboard Gerencial ENTEL
//======================================

function inicializarDashboard() {

    actualizarFecha();

    actualizarKPIs();

    poblarTablaEjecutivos();

    //----------------------------------
    // Storytelling ejecutivo
    //----------------------------------

    if (typeof construirStoryline === "function") {
        construirStoryline();
    }

    //----------------------------------
    // Gráficos
    //----------------------------------

    if (typeof renderGraficos === "function") {
        renderGraficos();
    }

    //----------------------------------
    // Executive 360
    //----------------------------------

    if (typeof construirPanelEjecutivo === "function") {
        construirPanelEjecutivo();
    }

    //----------------------------------
    // Coach IA
    //----------------------------------

    if (typeof generarCoach === "function") {
        generarCoach();
    }

    //----------------------------------
    // Ranking
    //----------------------------------

    if (typeof construirRankingView === "function") {
        construirRankingView();
    }

    //----------------------------------
    // Supervisión
    //----------------------------------

    if (typeof construirPanelSupervision === "function") {
        construirPanelSupervision();
    }

    //----------------------------------
    // Embudo Comercial
    //----------------------------------

    if (typeof construirEmbudoComercial === "function") {
        construirEmbudoComercial();
    }

    //----------------------------------
    // Métodos de entrega
    //----------------------------------

    if (typeof construirTablaMetodosEntrega === "function") {
        construirTablaMetodosEntrega();
    }

    //----------------------------------
    // Resumen Gerencial
    //----------------------------------

    if (typeof construirResumenGerencial === "function") {
        construirResumenGerencial();
    }

    //----------------------------------
    // Score Detallado por Asesor
    //----------------------------------

    if (typeof construirPanelScoreDetalle === "function") {
        construirPanelScoreDetalle();
    }

    //----------------------------------
    // Mejoras: comparativo de periodos,
    // semáforos/deltas de KPIs, badge de
    // alertas, buscador de ejecutivos
    //----------------------------------

    if (typeof aplicarMejorasDashboard === "function") {
        aplicarMejorasDashboard();
    }

}
//======================================
// FECHA DE ACTUALIZACIÓN
//======================================

function actualizarFecha() {

    const ahora = new Date();

    const fecha = ahora.toLocaleDateString("es-PE");
    const hora = ahora.toLocaleTimeString("es-PE");

    const lbl = document.getElementById("fechaActualizacion");

    if (lbl) {
        lbl.textContent = `Actualizado: ${fecha} ${hora}`;
    }

}

//======================================
// ACTUALIZAR KPIs
//======================================

function actualizarKPIs() {

    const asignar = (id, valor) => {

        const el = document.getElementById(id);

        if (el) {
            el.textContent = valor;
        }

    };

    asignar(
        "kpiSolicitudes",
        totalSolicitudes().toLocaleString("es-PE")
    );

    asignar(
        "kpiHabilitadas",
        totalHabilitadas().toLocaleString("es-PE")
    );

    asignar(
        "kpiConversion",
        conversion().toFixed(2) + "%"
    );

    asignar(
        "kpiProductividad",
        productividad().toFixed(2)
    );

    asignar(
        "kpiAdherencia",
        adherencia().toFixed(2) + "%"
    );

    asignar(
        "kpiEjecutivos",
        ejecutivosActivos()
    );

    asignar(
        "kpiLlamadasIN",
        llamadasIN().toLocaleString("es-PE")
    );

    asignar(
        "kpiLlamadasOUT",
        llamadasOUT().toLocaleString("es-PE")
    );

    asignar(
        "kpiRegistros",
        registros().toLocaleString("es-PE")
    );

    asignar(
        "kpiProgramado",
        horasProgramadas().toFixed(1)
    );

    asignar(
        "kpiConexion",
        horasConexion().toFixed(1)
    );

    asignar(
        "kpiCuotaSol",
        cumplimientoSolicitudes().toFixed(1) + "%"
    );

    asignar(
        "kpiCuotaHab",
        cumplimientoHabilitadas().toFixed(1) + "%"
    );

}
//======================================
// TABLA DETALLE POR EJECUTIVO
//======================================

function poblarTablaEjecutivos() {

    const tbody = document.querySelector("#tablaEjecutivos tbody");

    if (!tbody) return;

    //----------------------------------
    // Utilizar el resumen ya calculado
    //----------------------------------

    const ejecutivos = obtenerResumenEjecutivos();

    if (!ejecutivos.length) {

        tbody.innerHTML = `
            <tr>
                <td colspan="13" style="text-align:center;">
                    No existen datos disponibles.
                </td>
            </tr>
        `;

        return;

    }

    //----------------------------------
    // Construcción HTML
    //----------------------------------

    let html = "";

    ejecutivos.forEach(e => {

        html += `

        <tr>

            <td>${e.ejecutivo}</td>

            <td>${e.solicitudes.toLocaleString("es-PE")}</td>

            <td>${e.habilitadas.toLocaleString("es-PE")}</td>

            <td>${e.conversion.toFixed(1)}%</td>

            <td>${e.productividad.toFixed(2)}</td>

            <td>${e.adherencia.toFixed(1)}%</td>

            <td>${e.repESIM.toFixed(1)}%</td>

            <td>${e.repE2H.toFixed(1)}%</td>

            <td>${e.repEA.toFixed(1)}%</td>

            <td>${e.repDR.toFixed(1)}%</td>

            <td>${e.repRT.toFixed(1)}%</td>

            <td>${e.cumplimientoSol.toFixed(0)}%</td>

            <td>${e.cumplimientoHab.toFixed(0)}%</td>

        </tr>

        `;

    });

    //----------------------------------
    // Fila de TOTAL
    //----------------------------------

    const totalSol = totalSolicitudes();
    const totalHab = totalHabilitadas();
    const totalConv = totalSol > 0 ? (totalHab / totalSol) * 100 : 0;

    html += `

    <tr class="fila-total-ejecutivos">

        <td><strong>Total</strong></td>

        <td><strong>${totalSol.toLocaleString("es-PE")}</strong></td>

        <td><strong>${totalHab.toLocaleString("es-PE")}</strong></td>

        <td><strong>${totalConv.toFixed(1)}%</strong></td>

        <td><strong>${productividad().toFixed(2)}</strong></td>

        <td><strong>${adherencia().toFixed(1)}%</strong></td>

        <td><strong>${representacionEsim().toFixed(1)}%</strong></td>

        <td><strong>${representacionE2H().toFixed(1)}%</strong></td>

        <td><strong>${representacionEA().toFixed(1)}%</strong></td>

        <td><strong>${representacionDR().toFixed(1)}%</strong></td>

        <td><strong>${representacionRT().toFixed(1)}%</strong></td>

        <td><strong>${cumplimientoSolicitudes().toFixed(0)}%</strong></td>

        <td><strong>${cumplimientoHabilitadas().toFixed(0)}%</strong></td>

    </tr>

    `;

    tbody.innerHTML = html;

}
//======================================
// REFRESCAR DASHBOARD
//======================================

function refrescarDashboard() {

    actualizarFecha();

    actualizarKPIs();

    poblarTablaEjecutivos();

    if (typeof construirStoryline === "function")
        construirStoryline();

    if (typeof renderGraficos === "function")
        renderGraficos();

    if (typeof construirPanelEjecutivo === "function")
        construirPanelEjecutivo();

    if (typeof generarCoach === "function")
        generarCoach();

    if (typeof construirRankingView === "function")
        construirRankingView();

    if (typeof construirPanelSupervision === "function")
        construirPanelSupervision();

    if (typeof construirEmbudoComercial === "function")
        construirEmbudoComercial();

    if (typeof construirTablaMetodosEntrega === "function")
        construirTablaMetodosEntrega();

    if (typeof construirResumenGerencial === "function")
        construirResumenGerencial();

    if (typeof construirPanelScoreDetalle === "function")
        construirPanelScoreDetalle();

    if (typeof aplicarMejorasDashboard === "function")
        aplicarMejorasDashboard();

}

//======================================
// ACTUALIZAR DESPUÉS DE FILTRAR
//======================================

function actualizarDashboard() {
    refrescarDashboard();
}

//======================================
// AUTO REFRESH (si está configurado)
//======================================

if (
    typeof CONFIG !== "undefined" &&
    CONFIG.AUTO_REFRESH &&
    CONFIG.AUTO_REFRESH > 0
) {

    setInterval(() => {

        if (typeof cargarDatos === "function") {
            cargarDatos();
        }

    }, CONFIG.AUTO_REFRESH);

}