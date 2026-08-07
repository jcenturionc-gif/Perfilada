//======================================
// METODOS DE ENTREGA
// % Representación, Conversión real y Detalle por Asesor
//======================================

const METODOS_ENTREGA = [
    { campo: "S. E2H",  habilitadas: "H. E2H",  nombre: "E2H",  metaKey: "express2H" },
    { campo: "S. EA",   habilitadas: "H. EA",   nombre: "EA",   metaKey: "expressAgendado" },
    { campo: "S. DR",   habilitadas: "H. DR",   nombre: "DR",   metaKey: null },
    { campo: "S. RT",   habilitadas: "H. RT",   nombre: "RT",   metaKey: null },
    { campo: "S. ESIM", habilitadas: "H. ESIM", nombre: "eSIM", metaKey: "esim" }
];

function construirTablaMetodosEntrega() {

    const panel = document.getElementById("panelMetodosEntrega");

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
    // 1. RESUMEN GENERAL POR MÉTODO
    //----------------------------------

    const totalSolicitudes = METODOS_ENTREGA.reduce(
        (acc, m) => acc + sumar(m.campo), 0
    );

    const resumenMetodos = METODOS_ENTREGA.map(m => {

        const solicitudes = sumar(m.campo);
        const habilitadas = sumar(m.habilitadas);

        const representacion = totalSolicitudes > 0
            ? (solicitudes / totalSolicitudes) * 100
            : 0;

        const conversion = solicitudes > 0
            ? (habilitadas / solicitudes) * 100
            : 0;

        return {
            nombre: m.nombre,
            solicitudes,
            habilitadas,
            representacion,
            conversion
        };
    });

    //----------------------------------
    // 2. RENDER HTML
    //----------------------------------

    let html = "";

    // --- Tabla resumen ---

    html += `
        <div class="metodos-resumen">
            <h3>Resumen General por Método de Entrega</h3>
            <table class="tabla-metodos">
                <thead>
                    <tr>
                        <th>Método</th>
                        <th>Solicitudes</th>
                        <th>% Representación</th>
                        <th>Habilitadas</th>
                        <th>Conversión</th>
                    </tr>
                </thead>
                <tbody>
    `;

    resumenMetodos.forEach((m, i) => {

        const claseBarra = i % 2 === 0 ? "metodo-barra-a" : "metodo-barra-b";

        const meta = m.metaKey && typeof METAS !== "undefined" ? METAS[m.metaKey] : null;

        const cumpleMeta = meta !== null ? m.representacion >= meta : null;

        html += `
                    <tr>
                        <td><strong>${m.nombre}</strong></td>
                        <td>${m.solicitudes.toLocaleString("es-PE")}</td>
                        <td>
                            <div class="metodo-rep-cell">
                                <span>
                                    ${m.representacion.toFixed(1)}%
                                    ${meta !== null ? `
                                        <small class="metodo-meta-badge ${cumpleMeta ? 'cumple' : 'no-cumple'}">
                                            meta ${meta}% ${cumpleMeta ? '✓' : '✗'}
                                        </small>
                                    ` : ""}
                                </span>
                                <div class="progress metodo-progress">
                                    <div class="${claseBarra}" style="width:${m.representacion}%"></div>
                                    ${meta !== null ? `<div class="metodo-meta-marcador" style="left:${Math.min(meta,100)}%;" title="Meta: ${meta}%"></div>` : ""}
                                </div>
                            </div>
                        </td>
                        <td>${m.habilitadas.toLocaleString("es-PE")}</td>
                        <td><span class="badge ${m.conversion >= 70 ? 'success' : m.conversion >= 50 ? 'warning' : 'danger'}">${m.conversion.toFixed(1)}%</span></td>
                    </tr>
        `;
    });

    html += `
                </tbody>
            </table>
        </div>
    `;

    panel.innerHTML = html;
}
