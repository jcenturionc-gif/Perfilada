//======================================
// EMBUDO COMERCIAL
//======================================

function obtenerEmbudoComercial() {

  const registros = sumar("REGISTROS");

  const llamadas =
      sumar("LLAMADAS IN") +
      sumar("LLAMADAS OU");

  const solicitudes = sumar("SOLICITUDES");

  const habilitadas = sumar("HABILITADAS");

  return {

      registros,

      llamadas,

      solicitudes,

      habilitadas,

      pRegLlam:
          registros > 0
              ? (llamadas / registros) * 100
              : 0,

      pLlamSol:
          llamadas > 0
              ? (solicitudes / llamadas) * 100
              : 0,

      pSolHab:
          solicitudes > 0
              ? (habilitadas / solicitudes) * 100
              : 0

  };

}

//======================================
// EMBUDO DEL MES ANTERIOR (comparativo)
//======================================

function obtenerEmbudoMesAnterior() {

  if (typeof masterData === "undefined" || !masterData.length) return null;

  if (typeof ORDEN_MESES === "undefined") return null;

  //----------------------------------
  // Mes de referencia: el filtro activo,
  // o el más frecuente en dataFiltrada
  //----------------------------------

  let mesActual = document.getElementById("filtroMes")?.value || "";

  if (!mesActual) {

      const conteo = {};

      dataFiltrada.forEach(f => {
          const m = f["MES"];
          if (m) conteo[m] = (conteo[m] || 0) + 1;
      });

      mesActual = Object.keys(conteo).sort((a, b) => conteo[b] - conteo[a])[0] || "";

  }

  if (!mesActual) return null;

  const idxActual = ORDEN_MESES.indexOf(mesActual);

  if (idxActual <= 0) return null;

  //----------------------------------
  // Busca, hacia atrás, el mes anterior
  // más cercano que exista en la data
  //----------------------------------

  let mesAnterior = null;

  for (let i = idxActual - 1; i >= 0; i--) {

      const candidato = ORDEN_MESES[i];

      if (masterData.some(f => f["MES"] === candidato)) {
          mesAnterior = candidato;
          break;
      }

  }

  if (!mesAnterior) return null;

  const ejecutivo = document.getElementById("filtroEjecutivo")?.value || "";
  const antiguedad = document.getElementById("filtroAntiguedad")?.value || "";

  const subset = masterData.filter(f => {

      if (f["MES"] !== mesAnterior) return false;
      if (ejecutivo && String(f["EJECUTIVO"] || "") !== ejecutivo) return false;
      if (antiguedad && String(f["ANTIGÜEDAD"] || "") !== antiguedad) return false;

      return true;

  });

  if (!subset.length) return null;

  const registros = sumarEn(subset, "REGISTROS");
  const llamadas = sumarEn(subset, "LLAMADAS IN") + sumarEn(subset, "LLAMADAS OU");
  const solicitudes = sumarEn(subset, "SOLICITUDES");
  const habilitadas = sumarEn(subset, "HABILITADAS");

  return {

      mes: mesAnterior,
      registros,
      llamadas,
      solicitudes,
      habilitadas,

      pSolHab: solicitudes > 0 ? (habilitadas / solicitudes) * 100 : 0

  };

}

