//======================================
// FILTROS
//======================================

const CAMPOS_FILTRO = {

  filtroMes: "MES",

  filtroSemana: "SEMANA",

  filtroNumeroDia: "DIA",

  filtroDia: "DIA SEMANA",

  filtroEjecutivo: "EJECUTIVO",

  filtroAntiguedad: "ANTIGÜEDAD"

};

//======================================
// FILTROS EN CASCADA
// (Mes -> Semana -> Día -> Día Semana)
//======================================

const CAMPOS_CASCADA = {

  filtroMes: "MES",

  filtroSemana: "SEMANA",

  filtroNumeroDia: "DIA",

  filtroDia: "DIA SEMANA"

};

const ORDEN_MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Setiembre", "Octubre", "Noviembre", "Diciembre"
];

function ordenarValoresFiltro(campo, valores) {

  if (campo === "SEMANA" || campo === "DIA") {

      return valores.sort((a, b) => a - b);

  }

  if (campo === "MES") {

      return valores.sort(
          (a, b) => ORDEN_MESES.indexOf(a) - ORDEN_MESES.indexOf(b)
      );

  }

  return valores.sort();

}

//======================================
// MESES DISPONIBLES (ORDENADOS)
// Se basa siempre en masterData completo,
// sin importar los filtros activos.
//======================================

function obtenerMesesDisponiblesOrdenados() {

  const meses = [...new Set(
      (masterData || []).map(f => f["MES"]).filter(Boolean)
  )];

  return ordenarValoresFiltro("MES", meses);

}

//======================================
// MES ANTERIOR AL INDICADO
// (según el orden cronológico real de los
// meses presentes en la data, no el
// calendario completo)
//======================================

function obtenerMesAnterior(mesActual) {

  if (!mesActual) return null;

  const meses = obtenerMesesDisponiblesOrdenados();

  const idx = meses.indexOf(mesActual);

  return idx > 0 ? meses[idx - 1] : null;

}

//======================================
// DÍAS QUE TIENE UN MES (calendario)
// Se usa para no proyectar la Tendencia
// Comercial más allá del fin de mes real
// (ej. Julio no puede proyectar al día 32).
//======================================

function obtenerDiasEnMes(nombreMes) {

  if (nombreMes === "Febrero") {

      const anio = new Date().getFullYear();
      const bisiesto = (anio % 4 === 0 && anio % 100 !== 0) || (anio % 400 === 0);

      return bisiesto ? 29 : 28;

  }

  const dias = {
      "Enero": 31, "Marzo": 31, "Abril": 30, "Mayo": 31, "Junio": 30,
      "Julio": 31, "Agosto": 31, "Septiembre": 30, "Setiembre": 30,
      "Octubre": 31, "Noviembre": 30, "Diciembre": 31
  };

  return dias[nombreMes] || 31;

}

//======================================
// ACTUALIZAR OPCIONES EN CASCADA
//======================================

function actualizarCascada() {

  Object.entries(CAMPOS_CASCADA).forEach(([id, campo]) => {

      const select = document.getElementById(id);

      if (!select) return;

      const valorActual = select.value;

      //----------------------------------
      // Universo de datos según los OTROS
      // filtros en cascada (no el propio)
      //----------------------------------

      const subset = masterData.filter(fila => {

          return Object.entries(CAMPOS_CASCADA).every(([id2, campo2]) => {

              if (id2 === id) return true;

              const val2 = document.getElementById(id2)?.value || "";

              return val2 === "" || String(fila[campo2]) === val2;

          });

      });

      const valores = ordenarValoresFiltro(campo, [

          ...new Set(

              subset
                  .map(f => f[campo])
                  .filter(v => v !== "" && v !== null && v !== undefined)

          )

      ]);

      const primeraOpcion = select.options[0].outerHTML;

      select.innerHTML = primeraOpcion;

      valores.forEach(valor => {
          select.add(new Option(valor, valor));
      });

      //----------------------------------
      // Conservar la selección previa si
      // sigue siendo válida con el nuevo
      // contexto; si no, se limpia.
      //----------------------------------

      select.value = valores.map(String).includes(valorActual) ? valorActual : "";

  });

}

//======================================
// POBLAR FILTROS
//======================================

function poblarFiltros() {

  //----------------------------------
  // Filtros simples (no cascada)
  //----------------------------------

  ["filtroEjecutivo", "filtroAntiguedad"].forEach(id => {

      const campo = CAMPOS_FILTRO[id];
      const select = document.getElementById(id);

      if (!select) return;

      const primeraOpcion = select.options[0].outerHTML;

      select.innerHTML = primeraOpcion;

      const valores = ordenarValoresFiltro(campo, [

          ...new Set(

              masterData
                  .map(f => f[campo])
                  .filter(v => v !== "" && v !== null && v !== undefined)

          )

      ]);

      valores.forEach(valor => {
          select.add(new Option(valor, valor));
      });

      select.onchange = aplicarFiltros;

  });

  //----------------------------------
  // Filtros en cascada
  // (Mes, Semana, Día, Día Semana)
  //----------------------------------

  actualizarCascada();

  Object.keys(CAMPOS_CASCADA).forEach(id => {

      const select = document.getElementById(id);

      if (!select) return;

      select.onchange = () => {
          actualizarCascada();
          aplicarFiltros();
      };

  });

}

//======================================
// APLICAR FILTROS
//======================================

function aplicarFiltros() {

  dataFiltrada = masterData.filter(fila => {

      return Object.entries(CAMPOS_FILTRO).every(([id, campo]) => {

          const valor = document.getElementById(id)?.value || "";

          return valor === "" || String(fila[campo]) === valor;

      });

  });

  if (typeof inicializarDashboard === "function") {

      inicializarDashboard();

  }

}
//======================================
// LIMPIAR FILTROS
//======================================

function limpiarFiltros() {

  Object.keys(CAMPOS_FILTRO).forEach(id => {

      const select = document.getElementById(id);

      if (select) {

          select.selectedIndex = 0;

      }

  });

  actualizarCascada();

  dataFiltrada = masterData.slice();

  if (typeof inicializarDashboard === "function") {

      inicializarDashboard();

  }

}

//======================================
// OBTENER VALORES ACTUALES
//======================================

function obtenerFiltrosActivos() {

  const filtros = {};

  Object.entries(CAMPOS_FILTRO).forEach(([id, campo]) => {

      const valor = document.getElementById(id)?.value || "";

      if (valor !== "") {

          filtros[campo] = valor;

      }

  });

  return filtros;

}

//======================================
// EXISTEN FILTROS ACTIVOS
//======================================

function existenFiltrosActivos() {

  return Object.keys(obtenerFiltrosActivos()).length > 0;

}

//======================================
// FIN
//======================================
