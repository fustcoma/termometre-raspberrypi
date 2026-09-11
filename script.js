let periodeActual = "24h";

let dadesHistorial = [];

let graficaTemperatura = null;
let graficaHumitat = null;
let graficaSensacio = null;

const SALT_MAXIM = 5 * 60 * 1000;

let ultimaActualitzacio = null;


async function carregarDades() {
    try {
        const resposta = await fetch("pi.txt?t=" + Date.now());

        if (!resposta.ok) {
            throw new Error("No s'ha pogut carregar pi.txt");
        }

        const text = await resposta.text();
        const linies = text.trim().split(/\r?\n/);

        if (linies.length < 4) {
            throw new Error("Format de pi.txt incorrecte");
        }

        const temperatura = parseFloat(linies[0]);
        const humitat = parseFloat(linies[1]);
        const sensacio = parseFloat(linies[2]);
        const dataHora = linies[3].trim();

        if (!isNaN(temperatura)) {
            document.getElementById("temperatura").textContent =
                temperatura.toFixed(2);
        }

        if (!isNaN(humitat)) {
            document.getElementById("humitat").textContent =
                humitat.toFixed(2);
        }

        if (!isNaN(sensacio)) {
            document.getElementById("sensacio").textContent =
                sensacio.toFixed(2);
        }

        const dataActualitzacio =
            convertirDataHoraDesDeText(dataHora);

        if (!isNaN(dataActualitzacio.getTime())) {
            ultimaActualitzacio = dataActualitzacio;
            actualitzarTextActualitzacio();
        }

    } catch (error) {
        console.error("Error carregant les dades:", error);
    }
}


async function carregarHistorial() {
    try {
        const resposta =
            await fetch("historial.csv?t=" + Date.now());

        if (!resposta.ok) {
            throw new Error("No s'ha pogut carregar historial.csv");
        }

        const text = await resposta.text();

        if (!text.trim()) {
            return;
        }

        const linies = text.trim().split(/\r?\n/);

        if (linies.length <= 1) {
            return;
        }

        const novesDades = [];

        for (let i = 1; i < linies.length; i++) {
            const linia = linies[i].trim();

            if (!linia) {
                continue;
            }

            const parts = linia.split(",");

            if (parts.length < 5) {
                continue;
            }

            const data = parts[0].trim();
            const hora = parts[1].trim();

            const temperatura = parseFloat(parts[2]);
            const humitat = parseFloat(parts[3]);
            const sensacio = parseFloat(parts[4]);

            if (
                isNaN(temperatura) ||
                isNaN(humitat) ||
                isNaN(sensacio)
            ) {
                continue;
            }

            const dataHora =
                convertirDataHora(data, hora);

            if (isNaN(dataHora.getTime())) {
                continue;
            }

            novesDades.push({
                data: data,
                hora: hora,
                temperatura: temperatura,
                humitat: humitat,
                sensacio: sensacio,
                dataHora: dataHora
            });
        }

        novesDades.sort((a, b) => {
            return a.dataHora.getTime() -
                b.dataHora.getTime();
        });

        const haCanviat =
            novesDades.length !== dadesHistorial.length ||
            (
                novesDades.length > 0 &&
                dadesHistorial.length > 0 &&
                (
                    novesDades[novesDades.length - 1]
                        .dataHora.getTime() !==
                    dadesHistorial[dadesHistorial.length - 1]
                        .dataHora.getTime() ||

                    novesDades[novesDades.length - 1]
                        .temperatura !==
                    dadesHistorial[dadesHistorial.length - 1]
                        .temperatura ||

                    novesDades[novesDades.length - 1]
                        .humitat !==
                    dadesHistorial[dadesHistorial.length - 1]
                        .humitat ||

                    novesDades[novesDades.length - 1]
                        .sensacio !==
                    dadesHistorial[dadesHistorial.length - 1]
                        .sensacio
                )
            );

        dadesHistorial = novesDades;

        if (dadesHistorial.length > 0) {
            const ultimaDada =
                dadesHistorial[dadesHistorial.length - 1];

            ultimaActualitzacio = ultimaDada.dataHora;

            actualitzarTextActualitzacio();
        }

        if (haCanviat || graficaTemperatura === null) {
            actualitzarGrafiques();
        }

    } catch (error) {
        console.error(
            "Error carregant l'historial:",
            error
        );
    }
}


function convertirDataHora(data, hora) {
    const partsData = data.split("/");
    const partsHora = hora.split(":");

    if (
        partsData.length !== 3 ||
        partsHora.length < 2
    ) {
        return new Date(NaN);
    }

    const dia = parseInt(partsData[0], 10);
    const mes = parseInt(partsData[1], 10) - 1;
    const any = parseInt(partsData[2], 10);

    const hores = parseInt(partsHora[0], 10);
    const minuts = parseInt(partsHora[1], 10);

    const segons =
        partsHora.length >= 3
            ? parseInt(partsHora[2], 10)
            : 0;

    return new Date(
        any,
        mes,
        dia,
        hores,
        minuts,
        segons
    );
}


function convertirDataHoraDesDeText(text) {
    const parts = text.trim().split(" ");

    if (parts.length < 2) {
        return new Date(NaN);
    }

    return convertirDataHora(
        parts[0],
        parts[1]
    );
}


function actualitzarTextActualitzacio() {
    const element =
        document.getElementById("actualitzacio");

    if (!element || !ultimaActualitzacio) {
        return;
    }

    const dia = String(
        ultimaActualitzacio.getDate()
    ).padStart(2, "0");

    const mes = String(
        ultimaActualitzacio.getMonth() + 1
    ).padStart(2, "0");

    const any =
        ultimaActualitzacio.getFullYear();

    const hores = String(
        ultimaActualitzacio.getHours()
    ).padStart(2, "0");

    const minuts = String(
        ultimaActualitzacio.getMinutes()
    ).padStart(2, "0");

    const segons = String(
        ultimaActualitzacio.getSeconds()
    ).padStart(2, "0");

    const ara = new Date();

    const diferencia = Math.max(
        0,
        Math.floor(
            (ara.getTime() -
                ultimaActualitzacio.getTime()) /
            1000
        )
    );

    let fa;

    if (diferencia < 10) {
        fa = "ara mateix";
    } else if (diferencia < 60) {
        fa = `fa ${diferencia} segons`;
    } else if (diferencia < 3600) {
        const minutsFa =
            Math.floor(diferencia / 60);

        fa =
            `fa ${minutsFa} ${
                minutsFa === 1
                    ? "minut"
                    : "minuts"
            }`;
    } else if (diferencia < 86400) {
        const horesFa =
            Math.floor(diferencia / 3600);

        fa =
            `fa ${horesFa} ${
                horesFa === 1
                    ? "hora"
                    : "hores"
            }`;
    } else {
        const diesFa =
            Math.floor(diferencia / 86400);

        fa =
            `fa ${diesFa} ${
                diesFa === 1
                    ? "dia"
                    : "dies"
            }`;
    }

    element.textContent =
        `Última actualització: ${dia}/${mes}/${any} ` +
        `${hores}:${minuts}:${segons} · ${fa}`;
}


function canviarPeriode(periode) {
    periodeActual = periode;

    document.querySelectorAll(".periode")
        .forEach((boto) => {
            boto.classList.remove("actiu");
        });

    const botoActiu =
        document.querySelector(
            `.periode[data-periode="${periode}"]`
        );

    if (botoActiu) {
        botoActiu.classList.add("actiu");
    }

    actualitzarGrafiques();
}


function obtenirDadesPeriode() {
    if (dadesHistorial.length === 0) {
        return [];
    }

    const ara =
        dadesHistorial[
            dadesHistorial.length - 1
        ].dataHora.getTime();

    let inici;

    switch (periodeActual) {
        case "1h":
            inici =
                ara - 60 * 60 * 1000;
            break;

        case "6h":
            inici =
                ara - 6 * 60 * 60 * 1000;
            break;

        case "24h":
            inici =
                ara - 24 * 60 * 60 * 1000;
            break;

        case "7d":
            inici =
                ara - 7 * 24 * 60 * 60 * 1000;
            break;

        case "tot":
            inici = -Infinity;
            break;

        default:
            inici =
                ara - 24 * 60 * 60 * 1000;
    }

    return dadesHistorial.filter((dada) => {
        return dada.dataHora.getTime() >= inici;
    });
}


function dividirEnSegments(dades, propietat) {
    const segments = [];

    if (dades.length === 0) {
        return segments;
    }

    let segmentActual = [];

    for (let i = 0; i < dades.length; i++) {
        const dada = dades[i];

        const punt = {
            x: dada.dataHora.getTime(),
            y: dada[propietat]
        };

        if (segmentActual.length > 0) {
            const anterior =
                dades[i - 1].dataHora.getTime();

            const actual =
                dada.dataHora.getTime();

            const diferencia =
                actual - anterior;

            if (diferencia > SALT_MAXIM) {
                segments.push(segmentActual);
                segmentActual = [];
            }
        }

        segmentActual.push(punt);
    }

    if (segmentActual.length > 0) {
        segments.push(segmentActual);
    }

    return segments;
}


function obtenirFormatTooltip(timestamp) {
    const data = new Date(timestamp);

    const dia = String(
        data.getDate()
    ).padStart(2, "0");

    const mes = String(
        data.getMonth() + 1
    ).padStart(2, "0");

    const any =
        data.getFullYear();

    const hores = String(
        data.getHours()
    ).padStart(2, "0");

    const minuts = String(
        data.getMinutes()
    ).padStart(2, "0");

    const segons = String(
        data.getSeconds()
    ).padStart(2, "0");

    if (
        periodeActual === "1h" ||
        periodeActual === "6h"
    ) {
        return `${hores}:${minuts}:${segons}`;
    }

    if (periodeActual === "24h") {
        return `${dia}/${mes} ${hores}:${minuts}:${segons}`;
    }

    return `${dia}/${mes}/${any} ${hores}:${minuts}:${segons}`;
}


function obtenirFormatEix(timestamp) {
    const data = new Date(timestamp);

    const dia = String(
        data.getDate()
    ).padStart(2, "0");

    const mes = String(
        data.getMonth() + 1
    ).padStart(2, "0");

    const hores = String(
        data.getHours()
    ).padStart(2, "0");

    const minuts = String(
        data.getMinutes()
    ).padStart(2, "0");

    if (
        periodeActual === "1h" ||
        periodeActual === "6h"
    ) {
        return `${hores}:${minuts}`;
    }

    if (periodeActual === "24h") {
        return `${dia}/${mes} ${hores}:${minuts}`;
    }

    return `${dia}/${mes}`;
}


function obtenirEscalaTemperatura(dades) {
    if (dades.length === 0) {
        return {
            min: 0,
            max: 35
        };
    }

    let minim = Infinity;
    let maxim = -Infinity;

    dades.forEach((dada) => {
        minim = Math.min(
            minim,
            dada.temperatura
        );

        maxim = Math.max(
            maxim,
            dada.temperatura
        );
    });

    let min = 0;
    let max = 35;

    if (minim < 0) {
        min = Math.floor(
            minim / 5
        ) * 5;

        max = 35;
    }

    if (maxim > 30) {
        max =
            Math.ceil(
                (maxim + 5) / 5
            ) * 5;
    }

    if (maxim >= 35) {
        max =
            Math.ceil(
                (maxim + 5) / 5
            ) * 5;
    }

    if (minim < 0) {
        min =
            Math.floor(
                (minim - 5) / 5
            ) * 5;
    }

    return {
        min: min,
        max: max
    };
}


function crearConfiguracioGrafica(
    titol,
    dades,
    propietat,
    unitat,
    tipusGrafica,
    configuracioColor
) {
    const segments =
        dividirEnSegments(
            dades,
            propietat
        );

    const datasets =
        segments.map((segment) => {
            return {
                label: titol,
                data: segment,

                borderColor: configuracioColor,
                backgroundColor: configuracioColor,

                borderWidth: 2,

                pointRadius: 0,
                pointHoverRadius: 0,

                tension: 0.25,

                fill: false,
                showLine: true,
                spanGaps: false
            };
        });

    let minX = undefined;
    let maxX = undefined;

    if (dades.length > 0) {
        minX =
            dades[0].dataHora.getTime();

        maxX =
            dades[
                dades.length - 1
            ].dataHora.getTime();
    }

    let escalaY;

    if (tipusGrafica === "temperatura") {
        escalaY =
            obterirEscalaTemperaturaSeguro(
                dades
            );
    } else if (tipusGrafica === "humitat") {
        escalaY = {
            min: 0,
            max: 100
        };
    } else {
        escalaY = {
            beginAtZero: false
        };
    }

    return {
        type: "line",

        data: {
            datasets: datasets
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,

            animation: false,

            interaction: {
                mode: "nearest",
                intersect: false
            },

            plugins: {
                title: {
                    display: true,
                    text: titol,
                    font: {
                        size: 18,
                        weight: "bold"
                    },
                    padding: {
                        bottom: 10
                    }
                },

                legend: {
                    display: false
                },

                tooltip: {
                    callbacks: {
                        title: function(context) {
                            if (!context.length) {
                                return "";
                            }

                            return obterFormatTooltipSeguro(
                                context[0].parsed.x
                            );
                        },

                        label: function(context) {
                            return (
                                context.parsed.y
                                    .toFixed(2) +
                                " " +
                                unitat
                            );
                        }
                    }
                }
            },

            scales: {
                x: {
                    type: "linear",

                    min: minX,
                    max: maxX,

                    offset: false,

                    ticks: {
                        maxTicksLimit:
                            periodeActual === "1h"
                                ? 8
                                : periodeActual === "6h"
                                    ? 8
                                    : periodeActual === "24h"
                                        ? 8
                                        : 10,

                        callback: function(value) {
                            return obterFormatEixSeguro(
                                value
                            );
                        }
                    }
                },

                y: {
                    min:
                        escalaY.min !== undefined
                            ? escalaY.min
                            : undefined,

                    max:
                        escalaY.max !== undefined
                            ? escalaY.max
                            : undefined,

                    beginAtZero:
                        escalaY.beginAtZero !== undefined
                            ? escalaY.beginAtZero
                            : false,

                    ticks: {
                        callback: function(value) {
                            return Number(value)
                                .toFixed(2)
                                .replace(
                                    /\.00$/,
                                    ""
                                ) +
                                " " +
                                unitat;
                        }
                    }
                }
            }
        }
    };
}


function obterirEscalaTemperaturaSeguro(dades) {
    return obtenirEscalaTemperatura(dades);
}


function obterFormatTooltipSeguro(timestamp) {
    return obtenirFormatTooltip(timestamp);
}


function obterFormatEixSeguro(timestamp) {
    return obtenirFormatEix(timestamp);
}


function actualitzarGrafiques() {
    const dades =
        obtenirDadesPeriode();

    if (graficaTemperatura) {
        graficaTemperatura.destroy();
    }

    if (graficaHumitat) {
        graficaHumitat.destroy();
    }

    if (graficaSensacio) {
        graficaSensacio.destroy();
    }

    const canvasTemperatura =
        document.getElementById(
            "graficaTemperatura"
        );

    const canvasHumitat =
        document.getElementById(
            "graficaHumitat"
        );

    const canvasSensacio =
        document.getElementById(
            "graficaSensacio"
        );

    if (
        !canvasTemperatura ||
        !canvasHumitat ||
        !canvasSensacio
    ) {
        return;
    }

    const contextTemperatura =
        canvasTemperatura.getContext("2d");

    const contextHumitat =
        canvasHumitat.getContext("2d");

    const contextSensacio =
        canvasSensacio.getContext("2d");

    graficaTemperatura =
        new Chart(
            contextTemperatura,
            crearConfiguracioGrafica(
                "Temperatura",
                dades,
                "temperatura",
                "ºC",
                "temperatura",
                "#ff6384"
            )
        );

    graficaHumitat =
        new Chart(
            contextHumitat,
            crearConfiguracioGrafica(
                "Humitat",
                dades,
                "humitat",
                "%",
                "humitat",
                "#36a2eb"
            )
        );

    graficaSensacio =
        new Chart(
            contextSensacio,
            crearConfiguracioGrafica(
                "Sensació tèrmica",
                dades,
                "sensacio",
                "ºC",
                "sensacio",
                "#ff9f40"
            )
        );
}


carregarDades();
carregarHistorial();


setInterval(() => {
    carregarDades();
    carregarHistorial();
}, 10000);


setInterval(() => {
    actualitzarTextActualitzacio();
}, 1000);