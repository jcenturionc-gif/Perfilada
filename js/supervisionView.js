//======================================
// SUPERVISIONVIEW.JS
// Panel de Supervisión
//======================================

function construirPanelSupervision() {

    const panel = document.getElementById("panelSupervision");

    if (!panel) return;

    const prioridades = obtenerPrioridades();

    if (!prioridades.length) {

        panel.innerHTML = `
            <div class="alerta ok">
                ✅ No existen prioridades críticas.
            </div>
        `;

        return;

    }

    panel.innerHTML = prioridades.map(e => {

        const estadoSeguimiento = obtenerEstadoSeguimiento(e.ejecutivo);

        return `

        <div class="card-supervision">

            <div class="card-supervision-header">

                <h3>${e.ejecutivo}</h3>

                <select
                    class="selector-seguimiento"
                    onchange="actualizarEstadoSeguimiento('${e.ejecutivo.replace(/'/g, "\\'")}', this.value)">
                    <option value="pendiente" ${estadoSeguimiento === "pendiente" ? "selected" : ""}>⏳ Pendiente</option>
                    <option value="seguimiento" ${estadoSeguimiento === "seguimiento" ? "selected" : ""}>👀 En seguimiento</option>
                    <option value="resuelto" ${estadoSeguimiento === "resuelto" ? "selected" : ""}>✅ Resuelto</option>
                </select>

            </div>

            <table>
                <tr>
                    <td>Estado</td>
                    <td>
                        <span class="estado ${e.estado.includes('🟢') ? 'verde' : e.estado.includes('🟡') ? 'amarillo' : 'rojo'}">
                            ${e.estado}
                        </span>
                    </td>
                </tr>
                <tr>
                    <td>Score</td>
                    <td><b>${e.score.toFixed(1)}</b></td>
                </tr>
                <tr>
                    <td>Motivo</td>
                    <td>${e.motivo}</td>
                </tr>
                <tr>
                    <td>Conversión</td>
                    <td>${e.conversion.toFixed(1)}%</td>
                </tr>
                <tr>
                    <td>Productividad</td>
                    <td>${e.productividad.toFixed(2)}</td>
                </tr>
                <tr>
                    <td>Adherencia</td>
                    <td>${e.adherencia.toFixed(1)}%</td>
                </tr>
            </table>

        </div>

    `;

    }).join("");

}

//======================================
// ESTADO DE SEGUIMIENTO (localStorage)
// Permite marcar cada prioridad como
// Pendiente / En seguimiento / Resuelto
//======================================

const SEGUIMIENTO_PRIORIDADES_KEY = "entel_seguimiento_prioridades";

function obtenerMapaSeguimiento() {

    try {

        return JSON.parse(localStorage.getItem(SEGUIMIENTO_PRIORIDADES_KEY) || "{}");

    } catch (err) {

        return {};

    }

}

function obtenerEstadoSeguimiento(ejecutivo) {

    const mapa = obtenerMapaSeguimiento();

    return mapa[ejecutivo] || "pendiente";

}

function actualizarEstadoSeguimiento(ejecutivo, estado) {

    const mapa = obtenerMapaSeguimiento();

    mapa[ejecutivo] = estado;

    try {

        localStorage.setItem(SEGUIMIENTO_PRIORIDADES_KEY, JSON.stringify(mapa));

    } catch (err) {

        // localStorage no disponible: el cambio no persiste
    }

}
