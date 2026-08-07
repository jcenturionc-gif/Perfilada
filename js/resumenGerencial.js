//======================================
// RESUMEN GERENCIAL DIARIO
// (con botón para contraer/expandir cada semana)
//======================================

// Estado de colapso de semanas (persiste mientras la página siga abierta)
window.semanasColapsadasResumenGerencial = window.semanasColapsadasResumenGerencial || {};

//----------------------------------
// Alternar (colapsar / expandir) una semana
//----------------------------------
function toggleSemanaResumenGerencial(numeroSemana) {

  const estado = window.semanasColapsadasResumenGerencial;

  estado[numeroSemana] = !estado[numeroSemana];

  construirResumenGerencial();

}

function construirResumenGerencial() {

  const tabla = document.getElementById("tablaResumenGerencial");

  if (!tabla) return;

  const thead = tabla.querySelector("thead");
  const tbody = tabla.querySelector("tbody");

  thead.innerHTML = "";
  tbody.innerHTML = "";

  const colapso = window.semanasColapsadasResumenGerencial;

  //----------------------------------
  // Detectar días existentes
  //----------------------------------

  const dias = [...new Set(

      dataFiltrada
          .map(f => Number(f["DIA"]))
          .filter(d => !isNaN(d))

  )].sort((a,b)=>a-b);

  //----------------------------------
  // Detectar a qué semana pertenece cada día
  // (se usa el campo SEMANA que ya viene en la data)
  //----------------------------------

  const semanaPorDia = {};

  dias.forEach(d => {

      const fila = dataFiltrada.find(f => Number(f["DIA"]) === d);

      semanaPorDia[d] = fila ? Number(fila["SEMANA"] || 0) : 0;

  });

  //----------------------------------
  // Agrupar los días en bloques por semana
  // manteniendo el orden cronológico
  //----------------------------------

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

  //----------------------------------
  // CABECERA
  //----------------------------------

  let filaSemanas = "<tr>";
  let celdasDias  = "";

  filaSemanas += `<th rowspan="2">Indicador</th>`;

  semanas.forEach(sem => {

      const colapsada = !!colapso[sem.numero];
      const colspan   = colapsada ? 1 : sem.dias.length;
      const rowspan   = colapsada ? 2 : 1;
      const icono     = colapsada ? "▸" : "▾";

      filaSemanas += `
          <th rowspan="${rowspan}" colspan="${colspan}"
              class="th-semana-toggle"
              onclick="toggleSemanaResumenGerencial(${sem.numero})"
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

  filaSemanas += `<th rowspan="2">Total</th>`;
  filaSemanas += "</tr>";

  thead.innerHTML = filaSemanas + (celdasDias ? `<tr>${celdasDias}</tr>` : "");

  //----------------------------------
  // Cantidad de columnas visibles
  // (para las filas separadoras)
  //----------------------------------

  const columnasVisibles = semanas.reduce(

      (s, sem) => s + (colapso[sem.numero] ? 1 : sem.dias.length),
      0

  ) + 2; // + Indicador + Total

  //----------------------------------
  // Agrupar información por día
  //----------------------------------

  const resumen = {};

  dias.forEach(d=>{

      resumen[d]={

          metaSol:0,
          metaHab:0,

          agentes:0,

          horas:0,

          solicitudes:0,
          habilitadas:0,

          registros:0,

          llamadasIN:0,
          llamadasOUT:0,

          solESIM:0,
          solE2H:0,
          solEA:0,
          solDR:0,
          solRT:0,

          habESIM:0,
          habE2H:0,
          habEA:0,
          habDR:0,
          habRT:0

      };

  });

  dataFiltrada.forEach(f=>{

      const dia = Number(f["DIA"]);

      if(!resumen[dia]) return;

      resumen[dia].metaSol += Number(f["CUOTA SOL"]||0);

      resumen[dia].metaHab += Number(f["CUOTA HAB"]||0);

      resumen[dia].agentes += 1;

      resumen[dia].horas += Number(f["PROGRAMADO"]||0);

      resumen[dia].solicitudes += Number(f["SOLICITUDES"]||0);

      resumen[dia].habilitadas += Number(f["HABILITADAS"]||0);

      resumen[dia].registros += Number(f["REGISTROS"]||0);

      resumen[dia].llamadasIN += Number(f["LLAMADAS IN"]||0);

      resumen[dia].llamadasOUT += Number(f["LLAMADAS OU"]||0);

      resumen[dia].solESIM += Number(f["S. ESIM"]||0);

      resumen[dia].solE2H += Number(f["S. E2H"]||0);

      resumen[dia].solEA += Number(f["S. EA"]||0);

      resumen[dia].solDR += Number(f["S. DR"]||0);

      resumen[dia].solRT += Number(f["S. RT"]||0);

      resumen[dia].habESIM += Number(f["H. ESIM"]||0);

      resumen[dia].habE2H += Number(f["H. E2H"]||0);

      resumen[dia].habEA += Number(f["H. EA"]||0);

      resumen[dia].habDR += Number(f["H. DR"]||0);

      resumen[dia].habRT += Number(f["H. RT"]||0);

  });

  //----------------------------------
  // Agregado por semana
  // (mismos campos que "resumen", pero sumados
  // sobre los días que componen cada semana)
  //----------------------------------

  const camposResumen = [
      "metaSol","metaHab","agentes","horas",
      "solicitudes","habilitadas","registros",
      "llamadasIN","llamadasOUT",
      "solESIM","solE2H","solEA","solDR","solRT",
      "habESIM","habE2H","habEA","habDR","habRT"
  ];

  const resumenSemana = {};

  semanas.forEach(sem => {

      const agregado = {};

      camposResumen.forEach(c => agregado[c] = 0);

      sem.dias.forEach(d => {
          camposResumen.forEach(c => agregado[c] += resumen[d][c]);
      });

      resumenSemana[sem.numero] = agregado;

  });

  //----------------------------------
  // Funciones auxiliares de formato / color
  //----------------------------------

  function formatearValor(valor, formato) {

      switch(formato){

          case "decimal":
              return valor.toFixed(1);

          case "porcentaje":
              return valor.toFixed(0) + "%";

          default:
              return Number(valor).toLocaleString("es-PE");

      }

  }

  function colorPorValor(valor) {

      if (valor >= 100) return "#2e7d32";  // verde
      if (valor >= 80)  return "#ef6c00";  // naranja

      return "#d32f2f";                    // rojo

  }

  //----------------------------------
  // Fila con dato simple (suma directa de un campo)
  //----------------------------------

  function agregarFila(nombre, campo, formato = "numero") {

      let fila = `<tr><td>${nombre}</td>`;

      let total = 0;

      semanas.forEach(sem => {

          if (colapso[sem.numero]) {

              const valor = resumenSemana[sem.numero][campo];

              total += valor;

              fila += `<td class="celda-semana">${formatearValor(valor, formato)}</td>`;

          } else {

              sem.dias.forEach(d => {

                  const valor = resumen[d][campo];

                  total += valor;

                  fila += `<td>${formatearValor(valor, formato)}</td>`;

              });

          }

      });

      fila += `<td><strong>${formatearValor(total, formato)}</strong></td></tr>`;

      tbody.innerHTML += fila;

  }

  //----------------------------------
  // Fila calculada, sin semáforo de
  // meta (para ratios informativos)
  //----------------------------------

  function agregarFilaCalculada(nombre, calcular, formato = "decimal") {

      let fila = `<tr><td>${nombre}</td>`;

      semanas.forEach(sem => {

          if (colapso[sem.numero]) {

              const valor = calcular(resumenSemana[sem.numero]);

              const texto = formato === "porcentaje"
                  ? valor.toFixed(1) + "%"
                  : valor.toFixed(2);

              fila += `<td class="celda-semana">${texto}</td>`;

          } else {

              sem.dias.forEach(d => {

                  const valor = calcular(resumen[d]);

                  const texto = formato === "porcentaje"
                      ? valor.toFixed(1) + "%"
                      : valor.toFixed(2);

                  fila += `<td>${texto}</td>`;

              });

          }

      });

      const totalRegistros = dias.reduce((s, d) => s + resumen[d].registros, 0);
      const totalLlamadasIN = dias.reduce((s, d) => s + resumen[d].llamadasIN, 0);
      const totalLlamadasOUT = dias.reduce((s, d) => s + resumen[d].llamadasOUT, 0);

      const totalValor = calcular({
          registros: totalRegistros,
          llamadasIN: totalLlamadasIN,
          llamadasOUT: totalLlamadasOUT
      });

      const totalTexto = formato === "porcentaje"
          ? totalValor.toFixed(1) + "%"
          : totalValor.toFixed(2);

      fila += `<td><strong>${totalTexto}</strong></td></tr>`;

      tbody.innerHTML += fila;

  }

  //----------------------------------
  // Fila de porcentaje (con semáforo de color)
  //----------------------------------

  function agregarFilaPorcentaje(nombre, calcular) {

      let fila = `<tr><td>${nombre}</td>`;

      semanas.forEach(sem => {

          if (colapso[sem.numero]) {

              const valor = calcular(resumenSemana[sem.numero]);
              const color = colorPorValor(valor);

              fila += `
                  <td class="celda-semana" style="
                      color:${color};
                      font-weight:bold;
                      text-align:center;
                  ">
                      ${valor.toFixed(0)}%
                  </td>
              `;

          } else {

              sem.dias.forEach(d => {

                  const r = resumen[d];
                  const valor = calcular(r);
                  const color = colorPorValor(valor);

                  fila += `
                      <td style="
                          color:${color};
                          font-weight:bold;
                          text-align:center;
                      ">
                          ${valor.toFixed(0)}%
                      </td>
                  `;

              });

          }

      });

      //----------------------------------
      // TOTAL
      //----------------------------------

      let total = calcular({

          solicitudes: totalSolicitudes(),

          habilitadas: totalHabilitadas(),

          registros: registros(),

          metaSol: sumar("CUOTA SOL"),

          metaHab: sumar("CUOTA HAB"),

          solE2H: dias.reduce((s,d)=>s+resumen[d].solE2H,0),
          habE2H: dias.reduce((s,d)=>s+resumen[d].habE2H,0),

          solEA: dias.reduce((s,d)=>s+resumen[d].solEA,0),
          habEA: dias.reduce((s,d)=>s+resumen[d].habEA,0),

          solDR: dias.reduce((s,d)=>s+resumen[d].solDR,0),
          habDR: dias.reduce((s,d)=>s+resumen[d].habDR,0),

          solRT: dias.reduce((s,d)=>s+resumen[d].solRT,0),
          habRT: dias.reduce((s,d)=>s+resumen[d].habRT,0),

          solESIM: dias.reduce((s,d)=>s+resumen[d].solESIM,0),
          habESIM: dias.reduce((s,d)=>s+resumen[d].habESIM,0)

      });

      const color = colorPorValor(total);

      fila += `
          <td style="
              color:${color};
              font-weight:bold;
              background:#f7f9fc;
          ">
              ${total.toFixed(0)}%
          </td>
      `;

      fila += "</tr>";

      tbody.innerHTML += fila;

  }

  //----------------------------------
  // Fila de participación (informativa,
  // sin semáforo de meta)
  //----------------------------------

  function agregarFilaParticipacion(nombre, campo) {

      let fila = `<tr><td>${nombre}</td>`;

      semanas.forEach(sem => {

          if (colapso[sem.numero]) {

              const r = resumenSemana[sem.numero];

              const valor = r.solicitudes === 0 ? 0 : (r[campo] / r.solicitudes) * 100;

              fila += `<td class="celda-semana">${valor.toFixed(1)}%</td>`;

          } else {

              sem.dias.forEach(d => {

                  const r = resumen[d];

                  const valor = r.solicitudes === 0 ? 0 : (r[campo] / r.solicitudes) * 100;

                  fila += `<td>${valor.toFixed(1)}%</td>`;

              });

          }

      });

      const totalSol = totalSolicitudes();

      const totalCampo = dias.reduce((s, d) => s + resumen[d][campo], 0);

      const totalPct = totalSol === 0 ? 0 : (totalCampo / totalSol) * 100;

      fila += `<td><strong>${totalPct.toFixed(1)}%</strong></td></tr>`;

      tbody.innerHTML += fila;

  }

  //----------------------------------
  // Fila separadora
  //----------------------------------

  function agregarSeparador() {

      tbody.innerHTML += `
          <tr class="filaSeparador">
              <td colspan="${columnasVisibles}"></td>
          </tr>
      `;

  }

  //======================================
  // METAS
  //======================================

  agregarFila(
    "Meta Solicitudes",
    "metaSol"
  );

  agregarFila(
    "Meta Habilitadas",
    "metaHab"
  );

  //======================================
  // OPERACIÓN
  //======================================

  agregarFila(
    "Agentes Programados",
    "agentes"
  );

  agregarFila(
    "Horas Programadas",
    "horas",
    "decimal"
  );

  agregarSeparador();

  //======================================
  // RESULTADOS
  //======================================

  agregarFila(
    "Solicitudes",
    "solicitudes"
  );

  agregarFila(
    "Habilitadas",
    "habilitadas"
  );

  agregarFila(
    "Registros",
    "registros"
  );

  agregarFila(
    "Llamadas IN",
    "llamadasIN"
  );

  agregarFila(
    "Llamadas OUT",
    "llamadasOUT"
  );

  //======================================
  // VUELTAS POR REGISTRO
  // (Llamadas IN + Llamadas OUT) / Registros
  //======================================

  agregarFilaCalculada(

      "Vueltas por Registro",

      r => r.registros === 0
          ? 0
          : (r.llamadasIN + r.llamadasOUT) / r.registros,

      "decimal"

  );

  //======================================
  // EFECTIVIDAD SOBRE REGISTROS
  //======================================

  agregarFilaPorcentaje(

      "Efectividad sobre Registros",

      r => r.registros==0
          ?0
          :(r.solicitudes/r.registros)*100

  );

  agregarSeparador();

  //======================================
  // CUMPLIMIENTO
  //======================================

  agregarFilaPorcentaje(

      "Cumplimiento Solicitudes",

      r => r.metaSol==0
          ?0
          :(r.solicitudes/r.metaSol)*100

  );

  agregarFilaPorcentaje(

      "Cumplimiento Habilitadas",

      r => r.metaHab==0
          ?0
          :(r.habilitadas/r.metaHab)*100

  );

  //======================================
  // CONVERSIÓN
  //======================================

  agregarFilaPorcentaje(

      "Conversión",

      r => r.solicitudes==0
          ?0
          :(r.habilitadas/r.solicitudes)*100

  );

  //======================================
  // CONVERSIÓN POR MÉTODO DE ENTREGA
  //======================================

  agregarFilaPorcentaje(
      "Conversión ESIM",
      r => r.solESIM == 0 ? 0 : (r.habESIM / r.solESIM) * 100
  );

  agregarFilaPorcentaje(
      "Conversión E2H",
      r => r.solE2H == 0 ? 0 : (r.habE2H / r.solE2H) * 100
  );

  agregarFilaPorcentaje(
      "Conversión EA",
      r => r.solEA == 0 ? 0 : (r.habEA / r.solEA) * 100
  );

  agregarFilaPorcentaje(
      "Conversión DR",
      r => r.solDR == 0 ? 0 : (r.habDR / r.solDR) * 100
  );

  agregarFilaPorcentaje(
      "Conversión RT",
      r => r.solRT == 0 ? 0 : (r.habRT / r.solRT) * 100
  );

  agregarSeparador();

  //======================================
  // PARTICIPACIÓN POR MÉTODO DE ENTREGA
  //======================================

  agregarFilaParticipacion("% Participación ESIM", "solESIM");
  agregarFilaParticipacion("% Participación E2H", "solE2H");
  agregarFilaParticipacion("% Participación EA", "solEA");
  agregarFilaParticipacion("% Participación DR", "solDR");
  agregarFilaParticipacion("% Participación RT", "solRT");

  //======================================
  // FIN DEL RESUMEN GERENCIAL
  //======================================

}
