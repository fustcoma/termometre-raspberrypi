
// ==========================================
// ESTACIÓ METEOROLÒGICA - script.js
// ==========================================

let periodeActual = "24h";

let dadesHistorial = [];

let graficaTemperatura = null;
let graficaHumitat = null;
let graficaSensacio = null;


// ==========================================
// CARREGAR DADES ACTUALS
// ==========================================

async function carregarDades() {

    try {

        const resposta = await fetch("pi.txt?t=" + Date.now());

        if (!resposta.ok) {
            throw new Error("No s'ha pogut carregar pi.txt");
        }

        const text = await resposta.text();

        const linies = text
            .trim()
            .split("\n")
            .map(linia => linia.trim());

        if (linies.length < 4) {
            throw new Error("pi.txt no té el format esperat");
        }

        const temperatura = linies[0];
        const humitat = linies[1];
        const sensacio = linies[2];
        const actualitzacio = linies[3];

        document.getElementById("temperatura").textContent =
            temperatura;

        document.getElementById("humitat").textContent =
            humitat;

        document.getElementById("sensacio").textContent =
            sensacio;

        document.getElementById("actualitzacio").textContent =
            "🟢 Última actualització: " + actualitzacio;

    } catch (error) {

        console.error(
            "❌ Error carregant les dades:",
            error
        );

        document.getElementById("actualitzacio").textContent =
            "🔴 No s'han pogut carregar les dades";
    }
}


// ==========================================
// CARREGAR HISTORIAL CSV
// ==========================================

async function carregarHistorial() {

    try {

        const resposta = await fetch(
            "historial.csv?t=" + Date.now()
        );

        // Si el fitxer encara no existeix
        if (!resposta.ok) {

            console.log(
                "ℹ️ historial.csv encara no existeix."
            );

            if (dadesHistorial.length !== 0) {

                dadesHistorial = [];

                actualitzarGrafiques();
            }

            return;
        }

        const text = await resposta.text();

        const linies = text
            .trim()
            .split("\n")
            .map(linia => linia.trim())
            .filter(linia => linia.length > 0);


        // CSV buit o només amb capçalera
        if (linies.length <= 1) {

            if (dadesHistorial.length !== 0) {

                dadesHistorial = [];

                actualitzarGrafiques();
            }

            return;
        }


        const novesDades = [];


        // Saltar la capçalera
        for (let i = 1; i < linies.length; i++) {

            const parts = linies[i].split(",");

            if (parts.length < 5) {
                continue;
            }

            const data = parts[0].trim();
            const hora = parts[1].trim();

            const temperatura =
                parseFloat(parts[2]);

            const humitat =
                parseFloat(parts[3]);

            const sensacio =
                parseFloat(parts[4]);


            if (
                isNaN(temperatura) ||
                isNaN(humitat) ||
                isNaN(sensacio)
            ) {
                continue;
            }


            const dataHora =
                convertirData(data, hora);


            novesDades.push({

                data: data,

                hora: hora,

                temperatura: temperatura,

                humitat: humitat,

                sensacio: sensacio,

                dataHora: dataHora
            });
        }


        // ==========================================
        // COMPROVAR SI HI HA DADES NOVES
        // ==========================================

        const dadesHanCanviat =
            novesDades.length !== dadesHistorial.length;


        dadesHistorial = novesDades;


        // Només reconstruïm els gràfics si hi ha
        // dades noves o si és la primera càrrega
        if (
            dadesHanCanviat ||
            graficaTemperatura === null
        ) {

            console.log(
                "📈 Historial actualitzat:",
                dadesHistorial.length,
                "dades"
            );

            actualitzarGrafiques();
        }

    } catch (error) {

        console.error(
            "❌ Error carregant historial.csv:",
            error
        );
    }
}


// ==========================================
// CONVERTIR DATA
// ==========================================
// Format:
// DD/MM/YYYY
// HH:MM:SS
// ==========================================

function convertirData(data, hora) {

    try {

        const partsData =
            data.split("/");

        const partsHora =
            hora.split(":");


        if (
            partsData.length !== 3 ||
            partsHora.length < 2
        ) {

            return null;
        }


        const dia =
            parseInt(partsData[0]);

        const mes =
            parseInt(partsData[1]) - 1;

        const any =
            parseInt(partsData[2]);


        const h =
            parseInt(partsHora[0]);

        const m =
            parseInt(partsHora[1]);

        const s =
            partsHora.length >= 3
                ? parseInt(partsHora[2])
                : 0;


        return new Date(
            any,
            mes,
            dia,
            h,
            m,
            s
        );

    } catch (error) {

        return null;
    }
}


// ==========================================
// CANVIAR PERÍODE
// ==========================================

function canviarPeriode(periode) {

    periodeActual = periode;

    console.log(
        "📅 Període seleccionat:",
        periode
    );


    // Treure "actiu" de tots els botons

    const botons =
        document.querySelectorAll(".periode");


    botons.forEach(boto => {

        boto.classList.remove("actiu");

    });


    // Activar el botó seleccionat

    const botoSeleccionat =
        document.querySelector(
            `.periode[data-periode="${periode}"]`
        );


    if (botoSeleccionat) {

        botoSeleccionat.classList.add("actiu");

    }


    // Actualitzar gràfics

    actualitzarGrafiques();
}


// ==========================================
// FILTRAR DADES SEGONS PERÍODE
// ==========================================

function obtenirDadesPeriode() {

    if (dadesHistorial.length === 0) {

        return [];
    }


    // TOT

    if (periodeActual === "tot") {

        return [...dadesHistorial];
    }


    let milisegons;


    switch (periodeActual) {

        case "1h":

            milisegons =
                60 * 60 * 1000;

            break;


        case "6h":

            milisegons =
                6 * 60 * 60 * 1000;

            break;


        case "24h":

            milisegons =
                24 * 60 * 60 * 1000;

            break;


        case "7d":

            milisegons =
                7 * 24 * 60 * 60 * 1000;

            break;


        default:

            return [...dadesHistorial];
    }


    const ara =
        new Date();


    const inici =
        new Date(
            ara.getTime() - milisegons
        );


    return dadesHistorial.filter(dada => {

        if (!dada.dataHora) {

            return false;
        }

        return dada.dataHora >= inici;
    });
}


// ==========================================
// ETIQUETA DEL GRÀFIC
// ==========================================

function obtenirEtiqueta(dada) {

    // En períodes llargs mostrem també la data

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


    // En períodes curts només l'hora

    return dada.hora.substring(0, 5);
}


// ==========================================
// ACTUALITZAR GRÀFICS
// ==========================================

function actualitzarGrafiques() {

    const dades =
        obtenirDadesPeriode();


    console.log(
        "📊 Actualitzant gràfics amb",
        dades.length,
        "dades"
    );


    const etiquetes =
        dades.map(dada =>
            obtenirEtiqueta(dada)
        );


    const temperatures =
        dades.map(dada =>
            dada.temperatura
        );


    const humiditats =
        dades.map(dada =>
            dada.humitat
        );


    const sensacions =
        dades.map(dada =>
            dada.sensacio
        );


    // ==========================================
    // ELIMINAR GRÀFICS ANTICS
    // ==========================================

    if (graficaTemperatura) {

        graficaTemperatura.destroy();

        graficaTemperatura = null;
    }


    if (graficaHumitat) {

        graficaHumitat.destroy();

        graficaHumitat = null;
    }


    if (graficaSensacio) {

        graficaSensacio.destroy();

        graficaSensacio = null;
    }


    // ==========================================
    // GRÀFIC TEMPERATURA
    // ==========================================

    const canvasTemperatura =
        document.getElementById(
            "graficaTemperatura"
        );


    if (canvasTemperatura) {

        graficaTemperatura =
            new Chart(
                canvasTemperatura.getContext("2d"),
                {

                    type: "line",

                    data: {

                        labels: etiquetes,

                        datasets: [
                            {

                                label:
                                    "Temperatura (°C)",

                                data:
                                    temperatures,

                                borderWidth: 2,

                                tension: 0.3,

                                pointRadius: 2,

                                spanGaps: true
                            }
                        ]
                    },


                    options: {

                        responsive: true,

                        maintainAspectRatio: false,


                        interaction: {

                            intersect: false,

                            mode: "index"
                        },


                        scales: {

                            y: {

                                title: {

                                    display: true,

                                    text:
                                        "Temperatura (°C)"
                                }
                            },


                            x: {

                                title: {

                                    display: true,

                                    text: "Hora"
                                },


                                ticks: {

                                    maxTicksLimit: 12
                                }
                            }
                        }
                    }
                }
            );
    }


    // ==========================================
    // GRÀFIC HUMITAT
    // ==========================================

    const canvasHumitat =
        document.getElementById(
            "graficaHumitat"
        );


    if (canvasHumitat) {

        graficaHumitat =
            new Chart(
                canvasHumitat.getContext("2d"),
                {

                    type: "line",

                    data: {

                        labels: etiquetes,

                        datasets: [
                            {

                                label:
                                    "Humitat (%)",

                                data:
                                    humiditats,

                                borderWidth: 2,

                                tension: 0.3,

                                pointRadius: 2,

                                spanGaps: true
                            }
                        ]
                    },


                    options: {

                        responsive: true,

                        maintainAspectRatio: false,


                        interaction: {

                            intersect: false,

                            mode: "index"
                        },


                        scales: {

                            y: {

                                title: {

                                    display: true,

                                    text:
                                        "Humitat (%)"
                                }
                            },


                            x: {

                                title: {

                                    display: true,

                                    text: "Hora"
                                },


                                ticks: {

                                    maxTicksLimit: 12
                                }
                            }
                        }
                    }
                }
            );
    }


    // ==========================================
    // GRÀFIC SENSACIÓ TÈRMICA
    // ==========================================

    const canvasSensacio =
        document.getElementById(
            "graficaSensacio"
        );


    if (canvasSensacio) {

        graficaSensacio =
            new Chart(
                canvasSensacio.getContext("2d"),
                {

                    type: "line",

                    data: {

                        labels: etiquetes,

                        datasets: [
                            {

                                label:
                                    "Sensació tèrmica (°C)",

                                data:
                                    sensacions,

                                borderWidth: 2,

                                tension: 0.3,

                                pointRadius: 2,

                                spanGaps: true
                            }
                        ]
                    },


                    options: {

                        responsive: true,

                        maintainAspectRatio: false,


                        interaction: {

                            intersect: false,

                            mode: "index"
                        },


                        scales: {

                            y: {

                                title: {

                                    display: true,

                                    text:
                                        "Sensació tèrmica (°C)"
                                }
                            },


                            x: {

                                title: {

                                    display: true,

                                    text: "Hora"
                                },


                                ticks: {

                                    maxTicksLimit: 12
                                }
                            }
                        }
                    }
                }
            );
    }
}


// ==========================================
// INICI
// ==========================================

console.log(
    "🌤️ Estació meteorològica iniciada."
);


// Carregar immediatament

carregarDades();

carregarHistorial();


// ==========================================
// ACTUALITZACIÓ AUTOMÀTICA
// ==========================================

// Cada 10 segons:
// - temperatura
// - humitat
// - sensació
// - última actualització
// - historial
// - gràfics

setInterval(() => {

    console.log(
        "🔄 Comprovant noves dades..."
    );

    carregarDades();

    carregarHistorial();

}, 10000);

