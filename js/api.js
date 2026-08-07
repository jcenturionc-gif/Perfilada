//======================================
// API
//======================================

let masterData = [];
let dataFiltrada = [];

//======================================
// CAMPOS NUMÉRICOS
//======================================

const CAMPOS_NUMERICOS = [

    "DIA",
    "SEMANA",

    "SOLICITUDES",
    "HABILITADAS",

    "S. E2H",
    "S. EA",
    "S. DR",
    "S. RT",
    "S. ESIM",
    "S. HOGAR",

    "H. E2H",
    "H. EA",
    "H. DR",
    "H. RT",
    "H. ESIM",
    "H. HOGAR",

    "PROGRAMADO",
    "CONEXIÓN",

    "CUOTA SOL",
    "CUOTA HAB",

    "TO PROD",

    "REGISTROS",

    "LLAMADAS IN",
    "LLAMADAS OU",

    "TIEMPO HABLADO"

];

//======================================
// INICIO
//======================================

document.addEventListener("DOMContentLoaded", () => {

    cargarDatos(true);

    setInterval(() => {

        cargarDatos(false);

    }, CONFIG.AUTO_REFRESH || 60000);

});

//======================================
// CARGAR DATOS
//======================================

function mostrarCargando(mostrar) {

    const loader = document.getElementById("appLoader");

    if (!loader) return;

    loader.classList.toggle("hidden", !mostrar);

}

function mostrarError(mensaje) {

    const toast = document.getElementById("appToast");

    if (!toast) {
        alert(mensaje);
        return;
    }

    toast.textContent = "⚠️ " + mensaje;
    toast.classList.add("visible");

    clearTimeout(toast._timeout);

    toast._timeout = setTimeout(() => {
        toast.classList.remove("visible");
    }, 6000);

}

//----------------------------------
// Hace un único intento de fetch
// contra la API, con su propio
// AbortController/timeout.
//----------------------------------

async function intentarFetchAPI(timeoutMs) {

    const controlador = new AbortController();

    const timeoutId = setTimeout(() => controlador.abort(), timeoutMs);

    try {

        const respuesta = await fetch(CONFIG.API_URL, {
            signal: controlador.signal
        });

        clearTimeout(timeoutId);

        if (!respuesta.ok) {

            throw new Error("No fue posible consultar la API");

        }

        return await respuesta.json();

    } catch (error) {

        clearTimeout(timeoutId);

        throw error;

    }

}

async function cargarDatos(esPrimeraCarga = true) {

    if (esPrimeraCarga) mostrarCargando(true);

    try {

        let datosNuevos;

        //----------------------------------
        // 1er intento (20s). Si falla por
        // timeout o por conexión, se hace
        // UN reintento automático inmediato
        // antes de mostrar el error al usuario.
        //----------------------------------

        try {

            datosNuevos = await intentarFetchAPI(20000);

        } catch (primerError) {

            console.warn("API: primer intento falló, reintentando…", primerError);

            datosNuevos = await intentarFetchAPI(20000);

        }

        //----------------------------------
        // Conversión de campos numéricos
        //----------------------------------

        datosNuevos = datosNuevos.map(fila => {

            const registro = { ...fila };

            CAMPOS_NUMERICOS.forEach(campo => {

                registro[campo] = Number(registro[campo] || 0);

            });

            return registro;

        });

        //----------------------------------
        // Guardar datos maestros
        //----------------------------------

        masterData = datosNuevos;

        //----------------------------------
        // Primera carga
        //----------------------------------

        if (esPrimeraCarga) {

            if (typeof poblarFiltros === "function") {

                poblarFiltros();

            }

            //----------------------------------
            // Por defecto, el dashboard muestra
            // solo el último mes registrado en la
            // data (ej. si el último ingreso es del
            // 1 de agosto, se filtra a "Agosto").
            //----------------------------------

            const selectMes = document.getElementById("filtroMes");

            const ultimoMes = (typeof obtenerUltimoMesDisponible === "function")
                ? obtenerUltimoMesDisponible()
                : null;

            if (selectMes && ultimoMes) {

                selectMes.value = ultimoMes;

                if (typeof actualizarCascada === "function") {
                    actualizarCascada();
                }

            }

            if (typeof aplicarFiltros === "function") {

                aplicarFiltros();

            } else {

                dataFiltrada = masterData.slice();

                if (typeof inicializarDashboard === "function") {
                    inicializarDashboard();
                }

            }

            mostrarCargando(false);

            return;

        }

        //----------------------------------
        // Refresco automático
        //----------------------------------

        if (typeof aplicarFiltros === "function") {

            aplicarFiltros();

        } else {

            dataFiltrada = masterData.slice();

            if (typeof inicializarDashboard === "function") {

                inicializarDashboard();

            }

        }

    } catch (error) {

        console.error("API:", error);

        const motivo = (error && error.name === "AbortError")
            ? "La fuente de datos tardó demasiado en responder."
            : "No se pudo conectar con la fuente de datos.";

        mostrarError(motivo + " Se reintentará automáticamente.");

        //----------------------------------
        // No dejar la pantalla bloqueada:
        // mostrar el dashboard con lo que
        // haya disponible (o vacío) mientras
        // se reintenta en segundo plano.
        //----------------------------------

        if (esPrimeraCarga && !masterData.length) {

            dataFiltrada = [];

            if (typeof poblarFiltros === "function") {
                poblarFiltros();
            }

            if (typeof inicializarDashboard === "function") {
                inicializarDashboard();
            }

        }

    } finally {

        if (esPrimeraCarga) mostrarCargando(false);

    }

}
