//======================================
// TABS.JS
// Cambio entre pestañas del sidebar
// (Dashboard / Score por Asesor)
//======================================

document.addEventListener("DOMContentLoaded", () => {

    const enlaces = document.querySelectorAll("nav a[data-vista]");

    enlaces.forEach(enlace => {

        enlace.addEventListener("click", () => {

            const destino = enlace.dataset.vista;

            //----------------------------------
            // Marcar el enlace activo
            //----------------------------------

            enlaces.forEach(a => a.classList.remove("activo"));

            enlace.classList.add("activo");

            //----------------------------------
            // Mostrar solo la vista destino
            //----------------------------------

            document.querySelectorAll(".vista").forEach(vista => {

                vista.classList.toggle("vista-activa", vista.id === destino);

            });

            //----------------------------------
            // Al entrar a la pestaña de Score,
            // refrescar por si cambiaron filtros
            //----------------------------------

            if (destino === "vista-score" && typeof construirPanelScoreDetalle === "function") {

                construirPanelScoreDetalle();

            }

            //----------------------------------
            // Al entrar a la pestaña de
            // Comparativo Mensual, construirla
            // (siempre usa masterData completo)
            //----------------------------------

            if (destino === "vista-comparativo-mensual" && typeof construirComparativoMensual === "function") {

                construirComparativoMensual();

            }

            //----------------------------------
            // Al entrar a la pestaña de
            // Comparativo Mensual, construir
            // también el Cuadro de Rentabilidad
            //----------------------------------

            if (destino === "vista-comparativo-mensual" && typeof construirCuadroRentabilidad === "function") {

                construirCuadroRentabilidad();

            }

            //----------------------------------
            // Al entrar a la pestaña de
            // Comparativo Mensual, construir
            // también el Cuadro de Asesores
            // Activos
            //----------------------------------

            if (destino === "vista-comparativo-mensual" && typeof construirCuadroAsesoresActivos === "function") {

                construirCuadroAsesoresActivos();

            }

        });

    });

});
