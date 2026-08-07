//====================================================
// CHARTS.JS
// Dashboard Gerencial ENTEL
//====================================================

//--------------------------------------
// Variables globales
//--------------------------------------

let chartTendencia = null;
let graficoGestion = null;

//--------------------------------------
// Registrar DataLabels si existe
//--------------------------------------

if (typeof ChartDataLabels !== "undefined") {
    Chart.register(ChartDataLabels);
}

//====================================================
// RENDER GENERAL
//====================================================

function renderGraficos() {

    renderGraficoTendencia();

    renderGraficoGestion();

}

//====================================================
// FORMATEADOR
//====================================================

function formatoCorto(valor) {

    valor = Number(valor);

    if (valor >= 1000000)
        return (valor / 1000000).toFixed(1) + "M";

    if (valor >= 1000)
        return (valor / 1000).toFixed(1) + "K";

    return valor.toLocaleString("es-PE");

}
//====================================================
// TENDENCIA COMERCIAL
//====================================================

function renderGraficoTendencia() {

    const resumen = {};

    dataFiltrada.forEach(f => {

        const dia = Number(f["DIA"]);

        if (!resumen[dia]) {

            resumen[dia] = {
                solicitudes: 0,
                habilitadas: 0,
                metaSol: 0,
                metaHab: 0
            };

        }

        resumen[dia].solicitudes += Number(f["SOLICITUDES"] || 0);
        resumen[dia].habilitadas += Number(f["HABILITADAS"] || 0);
        resumen[dia].metaSol += Number(f["CUOTA SOL"] || 0);
        resumen[dia].metaHab += Number(f["CUOTA HAB"] || 0);

    });

    const diasBase = Object.keys(resumen)
        .map(Number)
        .sort((a, b) => a - b);

    let dias = diasBase.slice();
    let solicitudes = diasBase.map(d => resumen[d].solicitudes);
    let habilitadas = diasBase.map(d => resumen[d].habilitadas);
    let metaSol = diasBase.map(d => resumen[d].metaSol);
    let metaHab = diasBase.map(d => resumen[d].metaHab);

    //--------------------------------------
    // PROYECCIÓN SIMPLE (Solicitudes)
    // Usa la variación promedio de los
    // últimos 3 días reales para proyectar
    // los próximos puntos del periodo — sin
    // pasarse nunca del último día real del
    // mes (ej. Julio no puede proyectar al
    // día 32, 33 o 34).
    //--------------------------------------

    let forecastSol = diasBase.map(() => null);

    const mesActivoTendencia = document.getElementById("filtroMes")?.value || "";

    const topeDiasMes = (typeof obtenerDiasEnMes === "function")
        ? obtenerDiasEnMes(mesActivoTendencia || undefined)
        : 31;

    if (solicitudes.length >= 3) {

        const ultimoDiaReal = diasBase[diasBase.length - 1] || 0;
        const diasRestantesEnMes = Math.max(0, topeDiasMes - ultimoDiaReal);
        const nPuntos = Math.min(3, diasRestantesEnMes);

        if (nPuntos > 0) {

            const ultimos = solicitudes.slice(-3);
            const deltaProm = (ultimos[2] - ultimos[0]) / 2;

            for (let i = 1; i <= nPuntos; i++) {
                dias.push(ultimoDiaReal + i);
            }

            solicitudes = solicitudes.concat(Array(nPuntos).fill(null));
            habilitadas = habilitadas.concat(Array(nPuntos).fill(null));
            metaSol = metaSol.concat(Array(nPuntos).fill(null));
            metaHab = metaHab.concat(Array(nPuntos).fill(null));
            forecastSol = forecastSol.concat(Array(nPuntos).fill(null));

            // Conecta visualmente desde el último punto real
            forecastSol[diasBase.length - 1] = ultimos[2];

            let base = ultimos[2];

            for (let i = 1; i <= nPuntos; i++) {
                base = Math.max(0, base + deltaProm);
                forecastSol[diasBase.length - 1 + i] = Math.round(base);
            }

        }

    }

    //--------------------------------------
    // COMPARATIVO VS. PERIODO ANTERIOR
    // (solo si el modo comparación está activo)
    //--------------------------------------

    let anteriorSolicitudes = null;
    let anteriorHabilitadas = null;

    if (window.modoComparacionActivo && typeof obtenerDataPeriodoAnterior === "function") {

        const dsAnterior = obtenerDataPeriodoAnterior();
        const resumenAnterior = {};

        dsAnterior.forEach(f => {

            const dia = Number(f["DIA"]);

            if (!resumenAnterior[dia]) {
                resumenAnterior[dia] = { solicitudes: 0, habilitadas: 0 };
            }

            resumenAnterior[dia].solicitudes += Number(f["SOLICITUDES"] || 0);
            resumenAnterior[dia].habilitadas += Number(f["HABILITADAS"] || 0);

        });

        const diasAnterior = Object.keys(resumenAnterior)
            .map(Number)
            .sort((a, b) => a - b);

        // Se alinean por posición relativa dentro del periodo
        // (día 1 del periodo actual vs. día 1 del periodo anterior),
        // ya que corresponden a fechas distintas.
        anteriorSolicitudes = dias.map((_, i) => {
            const d = diasAnterior[i];
            return d !== undefined ? resumenAnterior[d].solicitudes : null;
        });

        anteriorHabilitadas = dias.map((_, i) => {
            const d = diasAnterior[i];
            return d !== undefined ? resumenAnterior[d].habilitadas : null;
        });

    }

    const canvas = document.getElementById("graficoTendencia");

    if (!canvas) return;

    if (chartTendencia)
        chartTendencia.destroy();

    const ctx = canvas.getContext("2d");

    const azul = ctx.createLinearGradient(0, 0, 0, 350);

    azul.addColorStop(0, "rgba(0,87,184,.35)");
    azul.addColorStop(1, "rgba(0,87,184,.02)");

    const verde = ctx.createLinearGradient(0, 0, 0, 350);

    verde.addColorStop(0, "rgba(0,168,89,.35)");
    verde.addColorStop(1, "rgba(0,168,89,.02)");

    chartTendencia = new Chart(ctx, {

        type: "line",

        data: {

            labels: dias,

            datasets: [

                {

                    label: "Solicitudes",

                    data: solicitudes,

                    borderColor: "#0057B8",

                    backgroundColor: azul,

                    fill: true,

                    borderWidth: 3,

                    pointRadius: 5,

                    pointHoverRadius: 7,

                    tension: .35,

                    datalabels: {

                        color: "#0057B8",

                        anchor: "end",

                        align: "top",

                        font: {

                            weight: "bold",

                            size: 11

                        },

                        formatter: v => v

                    }

                },

                {

                    label: "Habilitadas",

                    data: habilitadas,

                    borderColor: "#00A859",

                    backgroundColor: verde,

                    fill: true,

                    borderWidth: 3,

                    pointRadius: 5,

                    pointHoverRadius: 7,

                    tension: .35,

                    datalabels: {

                        color: "#00A859",

                        anchor: "end",

                        align: "top",

                        font: {

                            weight: "bold",

                            size: 11

                        },

                        formatter: v => v

                    }

                },

                {

                    label: "Meta Solicitudes",

                    data: metaSol,

                    borderColor: "#0057B8",

                    backgroundColor: "transparent",

                    fill: false,

                    borderWidth: 2,

                    borderDash: [6, 5],

                    pointRadius: 0,

                    pointHoverRadius: 0,

                    tension: .35,

                    datalabels: { display: false }

                },

                {

                    label: "Meta Habilitadas",

                    data: metaHab,

                    borderColor: "#00A859",

                    backgroundColor: "transparent",

                    fill: false,

                    borderWidth: 2,

                    borderDash: [6, 5],

                    pointRadius: 0,

                    pointHoverRadius: 0,

                    tension: .35,

                    datalabels: { display: false }

                },

                {

                    label: "Proyección Solicitudes",

                    data: forecastSol,

                    borderColor: "#94a3b8",

                    backgroundColor: "transparent",

                    fill: false,

                    borderWidth: 2,

                    borderDash: [3, 3],

                    pointRadius: 4,

                    pointStyle: "rectRot",

                    pointBackgroundColor: "#94a3b8",

                    tension: .2,

                    datalabels: { display: false }

                },

                ...(anteriorSolicitudes ? [{

                    label: "Solicitudes (periodo anterior)",

                    data: anteriorSolicitudes,

                    borderColor: "#0057B8",

                    backgroundColor: "transparent",

                    fill: false,

                    borderWidth: 2,

                    borderDash: [2, 4],

                    pointRadius: 2,

                    tension: .35,

                    datalabels: { display: false }

                }] : []),

                ...(anteriorHabilitadas ? [{

                    label: "Habilitadas (periodo anterior)",

                    data: anteriorHabilitadas,

                    borderColor: "#00A859",

                    backgroundColor: "transparent",

                    fill: false,

                    borderWidth: 2,

                    borderDash: [2, 4],

                    pointRadius: 2,

                    tension: .35,

                    datalabels: { display: false }

                }] : [])

            ]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            animation: {

                duration: 1200,

                easing: "easeOutQuart"

            },

            interaction: {

                mode: "index",

                intersect: false

            },

            plugins: {

                legend: {

                    position: "bottom",

                    labels: {

                        usePointStyle: true,

                        padding: 20,

                        font: {

                            size: 12,

                            weight: "bold"

                        }

                    }

                },

                tooltip: {

                    backgroundColor: "#1F2937",

                    titleColor: "#FFF",

                    bodyColor: "#FFF",

                    padding: 12,

                    cornerRadius: 8

                }

            },

            scales: {

                x: {

                    grid: {

                        display: false

                    },

                    title: {

                        display: true,

                        text: "Día"

                    }

                },

                y: {

                    beginAtZero: true,

                    grace: "15%",

                    ticks: {

                        callback: value => formatoCorto(value)

                    },

                    title: {

                        display: true,

                        text: "Solicitudes / Habilitadas"

                    }

                }

            }

        }

    });

}
//====================================================
// GESTIÓN COMERCIAL POR SEMANA
//====================================================

function renderGraficoGestion() {

    const resumen = {};

    dataFiltrada.forEach(f => {

        const semana = Number(f["SEMANA"]);

        if (!resumen[semana]) {

            resumen[semana] = {

                registros: 0,
                solicitudes: 0,
                llamadas: 0

            };

        }

        resumen[semana].registros += Number(f["REGISTROS"] || 0);

        resumen[semana].solicitudes += Number(f["SOLICITUDES"] || 0);

        resumen[semana].llamadas += Number(f["LLAMADAS IN"] || 0) + Number(f["LLAMADAS OU"] || 0);

    });

    const semanas = Object.keys(resumen)
        .map(Number)
        .sort((a,b)=>a-b);

    const registros = [];
    const solicitudes = [];
    const llamadas = [];
    const efectividad = [];

    semanas.forEach(s=>{

        registros.push(resumen[s].registros);

        solicitudes.push(resumen[s].solicitudes);

        llamadas.push(resumen[s].llamadas);

        efectividad.push(

            resumen[s].registros === 0
            ? 0
            : (resumen[s].solicitudes / resumen[s].registros) * 100

        );

    });

    //--------------------------------------
    // PROMEDIO MÓVIL DE SOLICITUDES
    // (últimas hasta-4 semanas anteriores
    // a cada semana, como referencia)
    //--------------------------------------

    const promedio4Semanas = semanas.map((s, i) => {

        const ventana = solicitudes.slice(Math.max(0, i - 4), i);

        if (!ventana.length) return null;

        return ventana.reduce((a, b) => a + b, 0) / ventana.length;

    });

    const canvas = document.getElementById("graficoGestion");

    if(!canvas) return;

    if(graficoGestion)
        graficoGestion.destroy();

    graficoGestion = new Chart(canvas,{

        data:{

            labels: semanas,

            datasets:[

                {

                    type:"bar",

                    label:"Registros",

                    data: registros,

                    yAxisID:"y",

                    backgroundColor:"#0B74DE",

                    borderRadius:8,

                    barPercentage:.60,

                    categoryPercentage:.60,

                    order:2,

                    datalabels:{

                        color:"#0B74DE",

                        anchor:"end",

                        align:"top",

                        font:{

                            weight:"bold",

                            size:11

                        },

                        formatter:(v)=>formatoCorto(v)

                    }

                },

                {

                    type:"bar",

                    label:"Q. Llamadas",

                    data: llamadas,

                    yAxisID:"y",

                    backgroundColor:"#7C3AED",

                    borderRadius:8,

                    barPercentage:.60,

                    categoryPercentage:.60,

                    order:2,

                    datalabels:{

                        color:"#7C3AED",

                        anchor:"end",

                        align:"top",

                        font:{

                            weight:"bold",

                            size:11

                        },

                        formatter:(v)=>formatoCorto(v)

                    }

                },

                {

                    type:"bar",

                    label:"Solicitudes",

                    data: solicitudes,

                    yAxisID:"y2",

                    backgroundColor:"#2BB673",

                    borderRadius:8,

                    barPercentage:.35,

                    categoryPercentage:.60,

                    order:2,

                    datalabels:{

                        color:"#2BB673",

                        anchor:"end",

                        align:"top",

                        font:{

                            weight:"bold",

                            size:11

                        },

                        formatter:(v)=>v

                    }

                },

                {

                    type:"line",

                    label:"Efectividad",

                    data: efectividad,

                    yAxisID:"y1",

                    borderColor:"#FF7A00",

                    backgroundColor:"#FF7A00",

                    borderWidth:4,

                    tension:.35,

                    pointRadius:7,

                    pointHoverRadius:9,

                    fill:false,

                    order:1,

                    datalabels:{

                        color:"#FF7A00",

                        anchor:"end",

                        align:"top",

                        offset:8,

                        font:{

                            weight:"bold",

                            size:12

                        },

                        formatter:(v)=>v.toFixed(1)+"%"

                    }

                },

                {

                    type:"line",

                    label:"Promedio 4 semanas (Solicitudes)",

                    data: promedio4Semanas,

                    yAxisID:"y2",

                    borderColor:"#94a3b8",

                    backgroundColor:"transparent",

                    borderWidth:2,

                    borderDash:[6,4],

                    pointRadius:0,

                    fill:false,

                    order:3,

                    datalabels:{ display:false }

                }

            ]

        },
        options: {

            responsive: true,

            maintainAspectRatio: false,

            interaction: {

                mode: "index",

                intersect: false

            },

            animation: {

                duration: 1400,

                easing: "easeOutQuart"

            },

            plugins: {

                legend: {

                    position: "bottom",

                    labels: {

                        usePointStyle: true,

                        padding: 20,

                        font: {

                            size: 12,

                            weight: "bold"

                        }

                    }

                },

                tooltip: {

                    backgroundColor: "#1F2937",

                    titleColor: "#FFFFFF",

                    bodyColor: "#FFFFFF",

                    padding: 12,

                    cornerRadius: 8,

                    callbacks: {

                        label: function(context) {

                            if (context.dataset.label === "Efectividad") {

                                return "Efectividad: " +
                                    context.raw.toFixed(2) + "%";

                            }

                            return context.dataset.label + ": " +
                                Number(context.raw).toLocaleString("es-PE");

                        }

                    }

                }

            },

            scales: {

                x: {

                    title: {

                        display: true,

                        text: "Semana"

                    },

                    grid: {

                        display: false

                    }

                },

                y: {

                    position: "left",

                    beginAtZero: true,

                    grace: "10%",

                    title: {

                        display: true,

                        text: "Registros / Llamadas"

                    },

                    ticks: {

                        callback: value => formatoCorto(value)

                    }

                },

                y2: {

                    position: "right",

                    beginAtZero: true,

                    suggestedMax: Math.max(...solicitudes) * 1.35,

                    grid: {

                        drawOnChartArea: false

                    },

                    title: {

                        display: true,

                        text: "Solicitudes"

                    }

                },

                y1: {

                    position: "right",

                    offset: true,

                    beginAtZero: true,

                    suggestedMax: Math.max(...efectividad) + 5,

                    grid: {

                        drawOnChartArea: false

                    },

                    ticks: {

                        callback: value => value + "%"

                    },

                    title: {

                        display: true,

                        text: "Efectividad"

                    }

                }

            }

        }
    });

}
