//======================================
// EXECUTIVE.JS
// PANEL EJECUTIVO
//======================================

function construirPanelEjecutivo() {

    const panel = document.getElementById("panelEjecutivo");

    if (!panel) return;

    const ejecutivos = obtenerResumenEjecutivos();

    if (ejecutivos.length === 0) {

        panel.innerHTML = "<p>Sin información disponible.</p>";

        return;

    }

    const mejorConversion =
        [...ejecutivos].sort((a,b)=>b.conversion-a.conversion)[0];

    const peorConversion =
        [...ejecutivos].sort((a,b)=>a.conversion-b.conversion)[0];

    const mejorProductividad =
        [...ejecutivos].sort((a,b)=>b.productividad-a.productividad)[0];

    const peorProductividad =
        [...ejecutivos].sort((a,b)=>a.productividad-b.productividad)[0];

    const mejorCumplimiento =
        [...ejecutivos].sort((a,b)=>b.cumplimientoHab-a.cumplimientoHab)[0];

    const peorCumplimiento =
        [...ejecutivos].sort((a,b)=>a.cumplimientoHab-b.cumplimientoHab)[0];

    panel.innerHTML = `

        <div class="alerta ok">
            🟢 <strong>Mejor Conversión</strong><br>
            ${mejorConversion.ejecutivo}<br>
            ${mejorConversion.conversion.toFixed(2)}%
        </div>

        <div class="alerta danger">
            🔴 <strong>Menor Conversión</strong><br>
            ${peorConversion.ejecutivo}<br>
            ${peorConversion.conversion.toFixed(2)}%
        </div>

        <div class="alerta ok">
            🚀 <strong>Mayor Productividad</strong><br>
            ${mejorProductividad.ejecutivo}<br>
            ${mejorProductividad.productividad.toFixed(2)}
        </div>

        <div class="alerta warning">
            ⚠ <strong>Menor Productividad</strong><br>
            ${peorProductividad.ejecutivo}<br>
            ${peorProductividad.productividad.toFixed(2)}
        </div>

        <div class="alerta ok">
            🎯 <strong>Mejor Cumpl. de Cuota</strong><br>
            ${mejorCumplimiento.ejecutivo}<br>
            ${mejorCumplimiento.cumplimientoHab.toFixed(0)}%
        </div>

        <div class="alerta danger">
            📉 <strong>Menor Cumpl. de Cuota</strong><br>
            ${peorCumplimiento.ejecutivo}<br>
            ${peorCumplimiento.cumplimientoHab.toFixed(0)}%
        </div>

    `;

}