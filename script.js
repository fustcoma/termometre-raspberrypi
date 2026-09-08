let periodeActual = "24h";
let dadesHistorial = [];

let graficaTemperatura = null;
let graficaHumitat = null;
let graficaSensacio = null;

const SALT_MAXIM = 5 * 60 * 1000;

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
    const dataHora = linies[3];

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

    const elementData = document.getElementById("dataHora");

    if (elementData) {
        elementData.textContent = dataHora;
    }

} catch (error) {
    console.error("Error carregant les dades:", error);
}


}

async function carregarHistorial() {
try {
const resposta = await fetch("historial.csv?t=" + Date.now());


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

        const dataHora = convertirDataHora(data, hora);

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

    const haCanviat =
        novesDades.length !== dadesHistorial.length ||
        (novesDades.length > 0 &&
            dadesHistorial.length > 0 &&
            (
                novesDades[novesDades.length - 1].dataHora.getTime() !==
                dadesHistorial[dadesHistorial.length - 1].dataHora.getTime() ||
                novesDades[novesDades.length - 1].temperatura !==
                dadesHistorial[dadesHistorial.length - 1].temperatura ||
                novesDades[novesDades.length - 1].humitat !==
                dadesHistorial[dadesHistorial.length - 1].humitat ||
                novesDades[novesDades.length - 1].sensacio !==
                dadesHistorial[dadesHistorial.length - 1].sensacio
            )
        );

    dadesHistorial = novesDades;

    if (haCanviat) {
        actualitzarGrafiques();
    }

} catch (error) {
    console.error("Error carregant l'historial:", error);
}


}

function convertirDataHora(data, hora) {
const partsData = data.split("/");
const partsHora = hora.split(":");


if (partsData.length !== 3 || partsHora.length < 2) {
    return new Date(NaN);
}

const dia = parseInt(partsData[0], 10);
const mes = parseInt(partsData[1], 10) - 1;
const any = parseInt(partsData[2], 10);

const hores = parseInt(partsHora[0], 10);
const minuts = parseInt(partsHora[1], 10);
const segons = partsHora.length >= 3
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

function canviarPeriode(periode) {
periodeActual = periode;


document.querySelectorAll(".periode").forEach((boto) => {
    boto.classList.remove("actiu");
});

const botoActiu = document.querySelector(
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


const ara = dadesHistorial[dadesHistorial.length - 1].dataHora.getTime();

let inici;

switch (periodeActual) {
    case "1h":
        inici = ara - 60 * 60 * 1000;
        break;

    case "6h":
        inici = ara - 6 * 60 * 60 * 1000;
        break;

    case "24h":
        inici = ara - 24 * 60 * 60 * 1000;
        break;

    case "7d":
        inici = ara - 7 * 24 * 60 * 60 * 1000;
        break;

    case "tot":
        inici = -Infinity;
        break;

    default:
        inici = ara - 24 * 60 * 60 * 1000;
}

return dadesHistorial.filter((dada) => {
    return dada.dataHora.getTime() >= inici;
});


}

function crearPunts(dades, propietat) {
const punts = [];


for (let i = 0; i < dades.length; i++) {
    const dada = dades[i];

    punts.push({
        x: dada.dataHora.getTime(),
        y: dada[propietat]
    });
}

return punts;

}

function obtenirUnitatTemps() {
switch (periodeActual) {
case "1h":
return "minute";


    case "6h":
        return "hour";

    case "24h":
        return "hour";

    case "7d":
        return "day";

    case "tot":
        return "day";

    default:
        return "hour";
}


}

function obtenirFormatTooltip(timestamp) {
const data = new Date(timestamp);


const dia = String(data.getDate()).padStart(2, "0");
const mes = String(data.getMonth() + 1).padStart(2, "0");
const any = data.getFullYear();

const hores = String(data.getHours()).padStart(2, "0");
const minuts = String(data.getMinutes()).padStart(2, "0");

if (periodeActual === "1h" || periodeActual === "6h") {
    return `${hores}:${minuts}`;
}

if (periodeActual === "24h") {
    return `${dia}/${mes} ${hores}:${minuts}`;
}

return `${dia}/${mes}/${any} ${hores}:${minuts}`;


}

function obtenirFormatEix(timestamp) {
const data = new Date(timestamp);

const dia = String(data.getDate()).padStart(2, "0");
const mes = String(data.getMonth() + 1).padStart(2, "0");

const hores = String(data.getHours()).padStart(2, "0");
const minuts = String(data.getMinutes()).padStart(2, "0");

if (periodeActual === "1h") {
    return `${hores}:${minuts}`;
}

if (periodeActual === "6h") {
    return `${hores}:${minuts}`;
}

if (periodeActual === "24h") {
    return `${dia}/${mes} ${hores}:00`;
}

if (periodeActual === "7d") {
    return `${dia}/${mes}`;
}

return `${dia}/${mes}`;


}

function crearConfiguracioGrafica(
etiqueta,
dades,
propietat,
unitat
) {
return {
type: "line",

    data: {
        datasets: [
            {
                label: etiqueta,
                data: crearPunts(dades, propietat),

                borderWidth: 2,
                pointRadius: 2,
                pointHoverRadius: 5,

                tension: 0.25,

                spanGaps: false
            }
        ]
    },

    options: {
        responsive: true,
        maintainAspectRatio: false,

        interaction: {
            mode: "nearest",
            intersect: false
        },

        plugins: {
            legend: {
                display: false
            },

            tooltip: {
                callbacks: {
                    title: function(context) {
                        if (!context.length) {
                            return "";
                        }

                        return obtenirFormatTooltip(
                            context[0].parsed.x
                        );
                    },

                    label: function(context) {
                        return `${context.parsed.y.toFixed(2)} ${unitat}`;
                    }
                }
            }
        },

        scales: {
            x: {
                type: "linear",

                ticks: {
                    callback: function(value) {
                        return obtenirFormatEix(value);
                    },

                    maxTicksLimit:
                        periodeActual === "1h"
                            ? 8
                            : periodeActual === "6h"
                                ? 8
                                : periodeActual === "24h"
                                    ? 8
                                    : 10
                },

                grid: {
                    display: true
                }
            },

            y: {
                beginAtZero: false,

                ticks: {
                    callback: function(value) {
                        return `${value} ${unitat}`;
                    }
                }
            }
        }
    }
};


}

function actualitzarGrafiques() {
const dades = obtenirDadesPeriode();


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
    document.getElementById("graficaTemperatura");

const canvasHumitat =
    document.getElementById("graficaHumitat");

const canvasSensacio =
    document.getElementById("graficaSensacio");

if (!canvasTemperatura || !canvasHumitat || !canvasSensacio) {
    return;
}

const contextTemperatura =
    canvasTemperatura.getContext("2d");

const contextHumitat =
    canvasHumitat.getContext("2d");

const contextSensacio =
    canvasSensacio.getContext("2d");

graficaTemperatura = new Chart(
    contextTemperatura,
    crearConfiguracioGrafica(
        "Temperatura",
        dades,
        "temperatura",
        "ºC"
    )
);

graficaHumitat = new Chart(
    contextHumitat,
    crearConfiguracioGrafica(
        "Humitat",
        dades,
        "humitat",
        "%"
    )
);

graficaSensacio = new Chart(
    contextSensacio,
    crearConfiguracioGrafica(
        "Sensació tèrmica",
        dades,
        "sensacio",
        "ºC"
    )
);

}

carregarDades();
carregarHistorial();

setInterval(() => {
carregarDades();
carregarHistorial();
}, 10000);
