//======================================
// RESUMENEJECUTIVOS.JS
// Motor Analítico Central
//======================================

function obtenerResumenEjecutivos(datos) {

    const registros = datos || dataFiltrada;

    const resumen = {};

    //----------------------------------
    // Agrupar información por ejecutivo
    //----------------------------------

    registros.forEach(f => {

        const nombre = (f["EJECUTIVO"] || "").trim();

        if (!nombre) return;

        if (!resumen[nombre]) {

            resumen[nombre] = {

                ejecutivo: nombre,

                //----------------------------------
                // Comerciales
                //----------------------------------

                solicitudes: 0,
                habilitadas: 0,

                //----------------------------------
                // Gestión
                //----------------------------------

                llamadasIN: 0,
                llamadasOUT: 0,
                registros: 0,

                //----------------------------------
                // Operación
                //----------------------------------

                dias: 0,
                programado: 0,
                conexion: 0,

                //----------------------------------
                // Cuotas
                //----------------------------------

                cuotaSol: 0,
                cuotaHab: 0,

                //----------------------------------
                // Métodos de entrega
                //----------------------------------

                solE2H: 0,
                habE2H: 0,

                solEA: 0,
                habEA: 0,

                solDR: 0,
                habDR: 0,

                solRT: 0,
                habRT: 0,

                solESIM: 0,
                habESIM: 0

            };

        }

        const r = resumen[nombre];
                //----------------------------------
        // COMERCIAL
        //----------------------------------

        r.solicitudes += Number(f["SOLICITUDES"] || 0);
        r.habilitadas += Number(f["HABILITADAS"] || 0);

        //----------------------------------
        // GESTIÓN
        //----------------------------------

        r.llamadasIN += Number(f["LLAMADAS IN"] || 0);
        r.llamadasOUT += Number(f["LLAMADAS OU"] || 0);
        r.registros += Number(f["REGISTROS"] || 0);

        //----------------------------------
        // OPERACIÓN
        //----------------------------------

        r.dias += Number(f["TO PROD"] || 0);
        r.programado += Number(f["PROGRAMADO"] || 0);
        r.conexion += Number(f["CONEXIÓN"] || 0);

        //----------------------------------
        // CUOTAS
        //----------------------------------

        r.cuotaSol += Number(f["CUOTA SOL"] || 0);
        r.cuotaHab += Number(f["CUOTA HAB"] || 0);

        //----------------------------------
        // MÉTODOS DE ENTREGA
        //----------------------------------

        r.solE2H += Number(f["S. E2H"] || 0);
        r.habE2H += Number(f["H. E2H"] || 0);

        r.solEA += Number(f["S. EA"] || 0);
        r.habEA += Number(f["H. EA"] || 0);

        r.solDR += Number(f["S. DR"] || 0);
        r.habDR += Number(f["H. DR"] || 0);

        r.solRT += Number(f["S. RT"] || 0);
        r.habRT += Number(f["H. RT"] || 0);

        r.solESIM += Number(f["S. ESIM"] || 0);
        r.habESIM += Number(f["H. ESIM"] || 0);

    });

    //----------------------------------
    // Convertir a arreglo
    //----------------------------------

    const lista = Object.values(resumen);

    //----------------------------------
    // Calcular indicadores
    //----------------------------------

    lista.forEach(r => {

            //----------------------------------
        // CONVERSIÓN
        //----------------------------------

        r.conversion =
            r.solicitudes > 0
                ? (r.habilitadas / r.solicitudes) * 100
                : 0;

        //----------------------------------
        // PRODUCTIVIDAD
        //----------------------------------

        r.productividad =
            r.dias > 0
                ? r.solicitudes / r.dias
                : 0;

        //----------------------------------
        // ADHERENCIA
        //----------------------------------

        r.adherencia =
            r.programado > 0
                ? (r.conexion / r.programado) * 100
                : 0;

        //----------------------------------
        // CUMPLIMIENTO
        //----------------------------------

        r.cumplimientoSol =
            r.cuotaSol > 0
                ? (r.solicitudes / r.cuotaSol) * 100
                : 0;

        r.cumplimientoHab =
            r.cuotaHab > 0
                ? (r.habilitadas / r.cuotaHab) * 100
                : 0;

        //----------------------------------
        // ACTIVIDAD
        //----------------------------------

        r.totalLlamadas =
            r.llamadasIN + r.llamadasOUT;

        //----------------------------------
        // EFECTIVIDAD
        //----------------------------------

        r.efectividadRegistros =
            r.registros > 0
                ? (r.habilitadas / r.registros) * 100
                : 0;

        //----------------------------------
        // MÉTODOS DE ENTREGA
        //----------------------------------

        r.conversionE2H =
            r.solE2H > 0
                ? (r.habE2H / r.solE2H) * 100
                : 0;

        r.conversionEA =
            r.solEA > 0
                ? (r.habEA / r.solEA) * 100
                : 0;

        r.conversionDR =
            r.solDR > 0
                ? (r.habDR / r.solDR) * 100
                : 0;

        r.conversionRT =
            r.solRT > 0
                ? (r.habRT / r.solRT) * 100
                : 0;

        r.conversionESIM =
            r.solESIM > 0
                ? (r.habESIM / r.solESIM) * 100
                : 0;

        //----------------------------------
        // REPRESENTACIÓN POR MÉTODO
        //----------------------------------

        r.repE2H =
            r.solicitudes > 0
                ? (r.solE2H / r.solicitudes) * 100
                : 0;

        r.repEA =
            r.solicitudes > 0
                ? (r.solEA / r.solicitudes) * 100
                : 0;

        r.repDR =
            r.solicitudes > 0
                ? (r.solDR / r.solicitudes) * 100
                : 0;

        r.repRT =
            r.solicitudes > 0
                ? (r.solRT / r.solicitudes) * 100
                : 0;

        r.repESIM =
            r.solicitudes > 0
                ? (r.solESIM / r.solicitudes) * 100
                : 0;
                        //----------------------------------
        // SCORE GERENCIAL
        //----------------------------------

        r.score = calcularScore(r);

        //----------------------------------
        // COLOR DEL SCORE
        //----------------------------------

        r.color = colorScore(r.score);

        //----------------------------------
        // NIVEL
        //----------------------------------

        r.nivel = nivelScore(r.score);

    });

    //----------------------------------
    // ORDENAR POR SCORE
    //----------------------------------

    lista.sort((a, b) => b.score - a.score);

    //----------------------------------
    // POSICIÓN EN EL RANKING
    //----------------------------------

    lista.forEach((e, i) => {

        e.posicion = i + 1;

    });

    //----------------------------------
    // RESUMEN GENERAL DEL EQUIPO
    //----------------------------------

    lista.totalSolicitudes = lista.reduce(
        (s, e) => s + e.solicitudes,
        0
    );

    lista.totalHabilitadas = lista.reduce(
        (s, e) => s + e.habilitadas,
        0
    );

    lista.totalRegistros = lista.reduce(
        (s, e) => s + e.registros,
        0
    );

    lista.totalLlamadas = lista.reduce(
        (s, e) => s + e.totalLlamadas,
        0
    );

    lista.promedioConversion = lista.length
        ? lista.reduce((s, e) => s + e.conversion, 0) / lista.length
        : 0;

    lista.promedioProductividad = lista.length
        ? lista.reduce((s, e) => s + e.productividad, 0) / lista.length
        : 0;

    lista.promedioAdherencia = lista.length
        ? lista.reduce((s, e) => s + e.adherencia, 0) / lista.length
        : 0;

    lista.promedioScore = lista.length
        ? lista.reduce((s, e) => s + e.score, 0) / lista.length
        : 0;

    lista.mejor = lista.length
        ? lista[0]
        : null;

    lista.peor = lista.length
        ? lista[lista.length - 1]
        : null;

    return lista;

}
