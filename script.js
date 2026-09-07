let periodeActual = "24h";

let dadesHistorial = [];

let graficaTemperatura = null;
let graficaHumitat = null;
let graficaSensacio = null;

const SALT_MAXIM = 5 * 60 * 1000;


// =========================
// DADES ACTUALS
// =========================

async function carregarDades() {
    try {
        const resposta = await fetch(
            "pi.txt?t=" + Date.now()
        );

        if (!resposta.ok) {
            throw new Error(
                "No s'ha pogut carregar pi.txt"
            );
        }

        const text = await resposta.text();

        const linies = text
            .trim()
            .split("\n")
            .map(linia => linia.trim());

        if (linies.length < 4) {
            throw new Error(
                "pi.txt no té el format esperat"
            );
        }

        const temperatura = linies[0];
        const humitat = linies[1];
        const sensacio = linies[2];
        const actualitzacio = linies[3];

        document.getElementById(
            "temperatura"
        ).textContent = temperatura;

        document.getElementById(
            "humitat"
        ).textContent = humitat;

        document.getElementById(
            "sensacio"
        ).textContent = sensacio;

        document.getElementById(
            "actualitzacio"
        ).textContent =
            "Última actualització: " +
            actualitzacio;

    } catch (error) {
        console.error(
            "Error carregant les dades:",
            error
        );
    }
}


// =========================
// HISTORIAL
// =========================

async function carregarHistorial() {
    try {
        const resposta = await fetch(
            "historial.csv?t=" + Date.now()
        );

        if (!resposta.ok) {
            console.log(
                "historial.csv encara no existeix."
            );

            dadesHistorial = [];
            actualitzarGrafiques();

            return;
        }

        const text = await resposta.text();

        if (!text.trim()) {
            dadesHistorial = [];
            actualitzarGrafiques();

            return;
        }

        const linies = text
            .trim()
            .split("\n");

        const novesDades = [];

        for (let i = 1; i < linies.length; i++) {

            const camps = linies[i]
                .split(",");

            if (camps.length < 5) {
                continue;
            }

            const data = camps[0].trim();
            const hora = camps[1].trim();

            const temperatura =
                parseFloat(camps[2]);

            const humitat =
                parseFloat(camps[3]);

            const sensacio =
                parseFloat(camps[4]);

            if (
                Number.isNaN(temperatura) ||
                Number.isNaN(humitat) ||
                Number.isNaN(sensacio)
            ) {
                continue;
            }

            const partsData = data.split("/");
            const partsHora = hora.split(":");

            if (
                partsData.length !== 3 ||
                partsHora.length < 2
            ) {
                continue;
            }

            const dia = parseInt(partsData[0]);
            const mes = parseInt(partsData[1]) - 1;
            const any = parseInt(partsData[2]);

            const hores = parseInt(partsHora[0]);
            const minuts = parseInt(partsHora[1]);
            const segons =
                partsHora.length >= 3
                    ? parseInt(partsHora[2])
                    : 0;

            const dataHora = new Date(
                any,
                mes,
                dia,
                hores,
                minuts,
                segons
            );

            novesDades.push({
                data: data,
                hora: hora,
                temperatura: temperatura,
                humitat: humitat,
                sensacio: sensacio,
                dataHora: dataHora
            });
        }

        const haviaCanviat =
            novesDades.length !== dadesHistorial.length;

        dadesHistorial = novesDades;

        if (haviaCanviat) {
            actualitzarGrafiques();
        }

    } catch (error) {
        console.error(
            "Error carregant l'historial:",
            error
        );
    }
}


// =========================
// CANVIAR PERÍODE
// =========================

function canviarPeriode(periode) {

    periodeActual = periode;

    const botons =
        document.querySelectorAll(".periode");

    botons.forEach(boto => {

        boto.classList.remove("actiu");

        if (
            boto.dataset.periode === periode
        ) {
            boto.classList.add("actiu");
        }
    });

    actualitzarGrafiques();
}


// =========================
// OBTENIR DADES DEL PERÍODE
// =========================

function obtenirDadesPeriode() {

    if (dadesHistorial.length === 0) {
        return [];
    }

    const ara =
        dadesHistorial[
            dadesHistorial.length - 1
        ].dataHora;

    let inici;

    switch (periodeActual) {

        case "1h":
            inici =
                new Date(
                    ara.getTime()
                    - 60 * 60 * 1000
                );
            break;

        case "6h":
            inici =
                new Date(
                    ara.getTime()
                    - 6 * 60 * 60 * 1000
                );
            break;

        case "24h":
            inici =
                new Date(
                    ara.getTime()
                    - 24 * 60 * 60 * 1000
                );
            break;

        case "7d":
            inici =
                new Date(
                    ara.getTime()
                    - 7 * 24 * 60 * 60 * 1000
                );
            break;

        case "tot":
            return dadesHistorial;

        default:
            return dadesHistorial;
    }

    return dadesHistorial.filter(
        dada => dada.dataHora >= inici
    );
}


// =========================
// ETIQUETES
// =========================

function obtenirEtiqueta(dada) {

    if (
        periodeActual === "7d" ||
        periodeActual === "tot"
    ) {
        return (
            dada.data +
            " " +
            dada.hora.substring(0, 5)
        );
    }

    return dada.hora.substring(0, 5);
}


// =========================
// PREPARAR DADES DEL GRÀFIC
// =========================

function prepararDadesGrafica(
    dades,
    propietat
) {

    const resultat = [];

    let anterior = null;

    for (const dada of dades) {

        if (
            anterior !== null &&
            dada.dataHora - anterior.dataHora >
                SALT_MAXIM
        ) {

            resultat.push(null);
        }

        resultat.push(
            dada[propietat]
        );

        anterior = dada;
    }

    return resultat;
}


// =========================
// PREPARAR ETIQUETES
// =========================

function prepararEtiquetesGrafica(
    dades
) {

    const resultat = [];

    let anterior = null;

    for (const dada of dades) {

        if (
            anterior !== null &&
            dada.dataHora - anterior.dataHora >
                SALT_MAXIM
        ) {

            resultat.push("");
        }

        resultat.push(
            obtenirEtiqueta(dada)
        );

        anterior = dada;
    }

    return resultat;
}


// =========================
// OPCIONS DEL GRÀFIC
// =========================

function opcionsGrafica(titol) {

    return {
        responsive: true,

        maintainAspectRatio: false,

        interaction: {
            mode: "index",
            intersect: false
        },

        plugins: {
            legend: {
                display: true
            },

            title: {
                display: true,
                text: titol
            }
        },

        scales: {
            x: {
                ticks: {
                    maxTicksLimit: 12
                }
            },

            y: {
                beginAtZero: false
            }
        },

        spanGaps: false
    };
}


// =========================
// ACTUALITZAR GRÀFIQUES
// =========================

function actualitzarGrafiques() {

    const dades =
        obtenirDadesPeriode();

    const etiquetes =
        prepararEtiquetesGrafica(dades);

    const temperatures =
        prepararDadesGrafica(
            dades,
            "temperatura"
        );

    const humitats =
        prepararDadesGrafica(
            dades,
            "humitat"
        );

    const sensacions =
        prepararDadesGrafica(
            dades,
            "sensacio"
        );


    // Temperatura

    if (graficaTemperatura !== null) {
        graficaTemperatura.destroy();
    }

    const canvasTemperatura =
        document.getElementById(
            "graficaTemperatura"
        );

    if (canvasTemperatura) {

        graficaTemperatura =
            new Chart(
                canvasTemperatura,
                {
                    type: "line",

                    data: {
                        labels: etiquetes,

                        datasets: [
                            {
                                label: "Temperatura (C)",

                                data: temperatures,

                                tension: 0.2,

                                pointRadius: 2,

                                spanGaps: false
                            }
                        ]
                    },

                    options:
                        opcionsGrafica(
                            "Temperatura"
                        )
                }
            );
    }


    // Humitat

    if (graficaHumitat !== null) {
        graficaHumitat.destroy();
    }

    const canvasHumitat =
        document.getElementById(
            "graficaHumitat"
        );

    if (canvasHumitat) {

        graficaHumitat =
            new Chart(
                canvasHumitat,
                {
                    type: "line",

                    data: {
                        labels: etiquetes,

                        datasets: [
                            {
                                label: "Humitat (%)",

                                data: humitats,

                                tension: 0.2,

                                pointRadius: 2,

                                spanGaps: false
                            }
                        ]
                    },

                    options:
                        opcionsGrafica(
                            "Humitat"
                        )
                }
            );
    }


    // Sensació

    if (graficaSensacio !== null) {
        graficaSensacio.destroy();
    }

    const canvasSensacio =
        document.getElementById(
            "graficaSensacio"
        );

    if (canvasSensacio) {

        graficaSensacio =
            new Chart(
                canvasSensacio,
                {
                    type: "line",

                    data: {
                        labels: etiquetes,

                        datasets: [
                            {
                                label: "Sensació tèrmica (C)",

                                data: sensacions,

                                tension: 0.2,

                                pointRadius: 2,

                                spanGaps: false
                            }
                        ]
                    },

                    options:
                        opcionsGrafica(
                            "Sensació tèrmica"
                        )
                }
            );
    }
}


// =========================
// ACTUALITZACIÓ AUTOMÀTICA
// =========================

carregarDades();

carregarHistorial();

setInterval(() => {

    carregarDades();

    carregarHistorial();

}, 10000);