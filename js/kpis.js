//======================================
// KPIS.JS
// Dashboard Gerencial ENTEL
//======================================

//======================================
// SUMADOR UNIVERSAL
//======================================

function sumar(columna) {

  return dataFiltrada.reduce((total, fila) => {

      return total + Number(fila[columna] || 0);

  }, 0);

}

//======================================
// KPIs COMERCIALES
//======================================

function totalSolicitudes() {

  return sumar("SOLICITUDES");

}

function totalHabilitadas() {

  return sumar("HABILITADAS");

}

function conversion() {

  const solicitudes = totalSolicitudes();

  return solicitudes
      ? (totalHabilitadas() / solicitudes) * 100
      : 0;

}

function productividad() {

  const dias = sumar("TO PROD");

  return dias
      ? totalSolicitudes() / dias
      : 0;

}

function adherencia() {

  const programado = sumar("PROGRAMADO");

  return programado
      ? (sumar("CONEXIÓN") / programado) * 100
      : 0;

}

//======================================
// KPIs OPERACIÓN
//======================================

function llamadasIN() {

  return sumar("LLAMADAS IN");

}

function llamadasOUT() {

  return sumar("LLAMADAS OU");

}

function tiempoHablado() {

  return sumar("TIEMPO HABLADO");

}

function tmo() {

  const llamadas = llamadasIN() + llamadasOUT();

  return llamadas
      ? tiempoHablado() / llamadas
      : 0;

}

function registros() {

  return sumar("REGISTROS");

}

function horasProgramadas() {

  return sumar("PROGRAMADO");

}

function horasConexion() {

  return sumar("CONEXIÓN");

}

function diasTrabajados() {

  return sumar("TO PROD");

}
//======================================
// CUMPLIMIENTO DE METAS
//======================================

function cumplimientoSolicitudes() {

  const cuota = sumar("CUOTA SOL");

  return cuota
      ? (totalSolicitudes() / cuota) * 100
      : 0;

}

function cumplimientoHabilitadas() {

  const cuota = sumar("CUOTA HAB");

  return cuota
      ? (totalHabilitadas() / cuota) * 100
      : 0;

}

//======================================
// EJECUTIVOS ACTIVOS
//======================================

function nombresEjecutivosActivos() {

  if (!dataFiltrada.length) return new Set();

  //----------------------------------
  // Se toma el último día presente en
  // los datos filtrados (no todo el
  // histórico), así el conteo refleja
  // la dotación real vigente.
  // Ej: día 1 = 17 asesores, día 25 = 14.
  //----------------------------------

  const ultimoDia = Math.max(
      ...dataFiltrada.map(f => Number(f["DIA"] || 0))
  );

  return new Set(

      dataFiltrada
          .filter(f => Number(f["DIA"]) === ultimoDia)
          .map(f => f["EJECUTIVO"])
          .filter(Boolean)

  );

}

function ejecutivosActivos() {

  return nombresEjecutivosActivos().size;

}

//======================================
// MÉTODOS DE ENTREGA
//======================================

function e2h() {

  return sumar("S. E2H");

}

function ea() {

  return sumar("S. EA");

}

function dr() {

  return sumar("S. DR");

}

function rt() {

  return sumar("S. RT");

}

function esim() {

  return sumar("S. ESIM");

}

function hogar() {

  return sumar("S. HOGAR");

}
//======================================
// REPRESENTACIÓN
//======================================

function representacionEsim() {

  const solicitudes = totalSolicitudes();

  return solicitudes
      ? (esim() / solicitudes) * 100
      : 0;

}

function representacionE2H() {

  const solicitudes = totalSolicitudes();

  return solicitudes
      ? (e2h() / solicitudes) * 100
      : 0;

}

function representacionEA() {

  const solicitudes = totalSolicitudes();

  return solicitudes
      ? (ea() / solicitudes) * 100
      : 0;

}

function representacionDR() {

  const solicitudes = totalSolicitudes();

  return solicitudes
      ? (dr() / solicitudes) * 100
      : 0;

}

function representacionRT() {

  const solicitudes = totalSolicitudes();

  return solicitudes
      ? (rt() / solicitudes) * 100
      : 0;

}

function representacionHogar() {

  const solicitudes = totalSolicitudes();

  return solicitudes
      ? (hogar() / solicitudes) * 100
      : 0;

}

//======================================
// RESUMEN GENERAL KPIs
//======================================

function obtenerKPIs() {

  return {

      solicitudes: totalSolicitudes(),

      habilitadas: totalHabilitadas(),

      conversion: conversion(),

      productividad: productividad(),

      adherencia: adherencia(),

      llamadasIN: llamadasIN(),

      llamadasOUT: llamadasOUT(),

      tmo: tmo(),

      registros: registros(),

      horasProgramadas: horasProgramadas(),

      horasConexion: horasConexion(),

      diasTrabajados: diasTrabajados(),

      cumplimientoSolicitudes: cumplimientoSolicitudes(),

      cumplimientoHabilitadas: cumplimientoHabilitadas(),

      ejecutivos: ejecutivosActivos(),

      e2h: e2h(),

      ea: ea(),

      dr: dr(),

      rt: rt(),

      esim: esim(),

      hogar: hogar(),

      representacionEsim: representacionEsim(),

      representacionE2H: representacionE2H(),

      representacionEA: representacionEA(),

      representacionDR: representacionDR(),

      representacionRT: representacionRT(),

      representacionHogar: representacionHogar()

  };

}

//======================================
// FIN KPIS
//======================================
