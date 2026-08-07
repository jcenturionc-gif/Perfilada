function construirEmbudoComercial() {

  const panel = document.getElementById("panelEmbudo");

  if (!panel) return;

  const datos = obtenerEmbudoComercial();

  const pasos = [
      {
          nombre: "LLAMADAS",
          valor: datos.llamadas,
          color: "#198754"
      },
      {
          nombre: "REGISTROS",
          valor: datos.registros,
          color: "#0b5ed7"
      },
      {
          nombre: "SOLICITUDES",
          valor: datos.solicitudes,
          color: "#fd7e14"
      },
      {
          nombre: "HABILITADAS",
          valor: datos.habilitadas,
          color: "#20c997"
      }
  ];

  const mayor = Math.max(...pasos.map(p => p.valor));

  //----------------------------------
  // STORYTELLING DEL EMBUDO
  // (identifica en qué etapa se pierde
  // más volumen, para leer el embudo
  // de un vistazo)
  //----------------------------------

  const pLlamadasARegistros = datos.llamadas > 0
      ? (datos.registros / datos.llamadas) * 100
      : 0;

  const pRegistrosASolicitudes = datos.registros > 0
      ? (datos.solicitudes / datos.registros) * 100
      : 0;

  const pSolicitudesAHabilitadas = datos.solicitudes > 0
      ? (datos.habilitadas / datos.solicitudes) * 100
      : 0;

  const etapas = [
      { nombre: "Llamadas → Registros", valor: pLlamadasARegistros },
      { nombre: "Registros → Solicitudes", valor: pRegistrosASolicitudes },
      { nombre: "Solicitudes → Habilitadas", valor: pSolicitudesAHabilitadas }
  ];

  const etapaCritica = etapas.reduce(
      (peor, actual) => actual.valor < peor.valor ? actual : peor,
      etapas[0]
  );

  const metaConversionFinal = (typeof CONFIG !== "undefined" && CONFIG.METAS && CONFIG.METAS.CONVERSION)
      ? CONFIG.METAS.CONVERSION
      : 80;

  const cumpleFinal = pSolicitudesAHabilitadas >= metaConversionFinal;
  const cerca = !cumpleFinal && pSolicitudesAHabilitadas >= metaConversionFinal - 15;

  const tono = cumpleFinal ? "positivo" : (cerca ? "alerta" : "critico");

  const titulo = cumpleFinal
      ? "El embudo cierra bien: la conversión final está en línea con la meta"
      : "Hay una fuga que le está costando resultado al equipo";

  const storyHtml = `

      <div class="funnel-story tono-${tono}">

          <span class="funnel-story-tag">📈 Lectura del Embudo</span>

          <p><strong>${titulo}.</strong></p>

          <p>
              De <strong>${datos.llamadas.toLocaleString("es-PE")}</strong> llamadas realizadas, el
              <strong>${pLlamadasARegistros.toFixed(1)}%</strong> terminó en un registro. De esos registros,
              solo el <strong>${pRegistrosASolicitudes.toFixed(1)}%</strong> avanzó a una solicitud, y de las
              solicitudes, el <strong>${pSolicitudesAHabilitadas.toFixed(1)}%</strong> se logró habilitar.
          </p>

          <p>
              La mayor fuga está en <strong>${etapaCritica.nombre}</strong>, con apenas
              <strong>${etapaCritica.valor.toFixed(1)}%</strong> de paso — ahí es donde una mejora
              tendría más impacto en el resultado final.
          </p>

          ${(() => {

              const anterior = (typeof obtenerEmbudoMesAnterior === "function")
                  ? obtenerEmbudoMesAnterior()
                  : null;

              if (!anterior) return "";

              const diferencia = pSolicitudesAHabilitadas - anterior.pSolHab;
              const mejora = diferencia >= 0;

              return `
                  <p class="funnel-comparativo-mes">
                      🗓️ Vs. <strong>${anterior.mes}</strong>: la conversión final de Solicitudes → Habilitadas
                      pasó de <strong>${anterior.pSolHab.toFixed(1)}%</strong> a
                      <strong>${pSolicitudesAHabilitadas.toFixed(1)}%</strong>
                      (<span class="${mejora ? "kpi-delta-up" : "kpi-delta-down"}">
                          ${mejora ? "▲" : "▼"} ${Math.abs(diferencia).toFixed(1)} pp
                      </span>).
                  </p>
              `;

          })()}

      </div>

  `;

  let html = `

      <div class="funnel-grid">

          <div class="funnel-story-col">

              ${storyHtml}

          </div>

          <div class="funnel-cards-col">

  `;

  pasos.forEach((p, i) => {

      // Ancho relativo a la etapa más grande, con un mínimo del 8% para que
      // ninguna barra quede invisible cuando las unidades son muy distintas
      // entre etapas (ej. marcaciones vs. solicitudes).
      const ancho = Math.max((p.valor / mayor) * 100, 8);

      html += `

      <div class="funnel-card">

          <div class="funnel-header">

              <span>${p.nombre}</span>

              <strong>${p.valor.toLocaleString()}</strong>

          </div>

          <div class="funnel-bar">

              <div
                  class="funnel-fill"
                  style="
                      width:${ancho}%;
                      background:${p.color};
                  ">
              </div>

          </div>

      </div>

      `;

      if (i < pasos.length - 1) {

          const siguiente = pasos[i + 1].valor;

          const porcentaje = p.valor
              ? (siguiente / p.valor * 100)
              : 0;

          html += `

          <div class="funnel-arrow">

              ↓ ${porcentaje.toFixed(2)}%

          </div>

          `;

      }

  });

  html += `

          </div>

      </div>

  `;

  panel.innerHTML = html;

}