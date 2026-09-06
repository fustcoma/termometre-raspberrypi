let dadesHistorial = [];

let graficaTemperatura = null;
let graficaHumitat = null;
let graficaSensacio = null;

let periodeActual = "24h";


// =========================
// DADES ACTUALS
// =========================

function carregarDades() {

    fetch("pi.txt?t=" + Date.now())

        .then(response => {

            if (!response.ok) {
                throw new Error("No s'ha pogut trobar pi.txt");
            }

            return response.text();
        })

        .then(data => {

            const valors = data.trim().split("\n");

            const temperatura = valors[0];
            const humitat = valors[1];
            const sensacio = valors[2];
            const actualitzacio = valors[3];


            document.getElementById("temperatura").textContent =
                temperatura + " °C";

            document.getElementById("humitat").textContent =
                humitat + " %";

            document.getElementById("sensacio").textContent =
                sensacio + " °C";


            if (actualitzacio) {

                document.getElementById("actualitzacio").textContent =
                    "🟢 Última actualització: " + actualitzacio;
            }

        })

        .catch(error => {

            console.error("❌ Error:", error);

            document.getElementById("actualitzacio").textContent =
                "🔴 No s'han pogut actualitzar les dades";
        });
}


// =========================
// HISTORIAL
// =========================

function carregarHistorial() {

    fetch("historial.csv?t=" + Date.now())

        .then(response => {

            if (!response.ok) {
                throw new Error("No s'ha trobat historial.csv");
            }

            return response.text();
        })

        .then(data => {

            const linies = data.trim().split("\n");

            // Eliminar capçalera
            linies.shift();


            dadesHistorial = [];


            linies.forEach(linia => {

                const valors = linia.split(",");

                if (valors.length < 5) {
                    return;
                }


                const data = valors[0];
                const hora = valors[1];

                const temperatura = parseFloat(valors[2]);
                const humitat = parseFloat(valors[3]);
                const sensacio = parseFloat(valors[4]);


                // Convertir data + hora en una data JavaScript
                const partsData = data.split("/");
                const partsHora = hora.split(":");


                const moment = new Date(
                    parseInt(partsData[2]),
                    parseInt(partsData[1]) - 1,
                    parseInt(partsData[0]),
                    parseInt(partsHora[0]),
                    parseInt(partsHora[1]),
                    parseInt(partsHora[2])
                );


                dadesHistorial.push({

                    moment: moment,

                    etiqueta: hora,

                    temperatura: temperatura,

                    humitat: humitat,

                    sensacio: sensacio
                });

            });


            actualitzarGrafiques();

        })

        .catch(error => {

            console.error(
                "❌ Error carregant historial:",
                error
            );

        });
}


// =========================
// CANVIAR PERÍODE
// =========================

function canviarPeriode(periode) {

    periodeActual = periode;

    // Treure classe activa de tots els botons
    document.querySelectorAll(".periode").forEach(botó => {

        botó.classList.remove("actiu");

    });


    // Activar el botó actual
    document
        .querySelector(`[data-periode="${periode}"]`)
        .classList.add("actiu");


    actualitzarGrafiques();
}


// =========================
// OBTENIR DADES DEL PERÍODE
// =========================

function obtenirDadesPeriode() {

    if (dadesHistorial.length === 0) {
        return [];
    }


    if (periodeActual === "tot") {

        return dadesHistorial;
    }


    const ara = new Date();

    let temps;

    switch (periodeActual) {

        case "1h":
            temps = 60 * 60 * 1000;
            break;

        case "6h":
            temps = 6 * 60 * 60 * 1000;
            break;

        case "24h":
            temps = 24 * 60 * 60 * 1000;
            break;

        case "7d":
            temps = 7 * 24 * 60 * 60 * 1000;
            break;
    }


    const inici = new Date(
        ara.getTime() - temps
    );


    return dadesHistorial.filter(
        dada => dada.moment >= inici
    );
}


// =========================
// ACTUALITZAR GRÀFIQUES
// =========================

function actualitzarGrafiques() {

    const dades = obterDadesSegures();

    if (dades.length === 0) {
        return;
    }


    const labels = dades.map(
        dada => dada.etiqueta
    );


    const temperatures = dades.map(
        dada => dada.temperatura
    );


    const humiditats = dades.map(
        dada => dada.humitat
    );


    const sensacions = dades.map(
        dada => dada.sensacio
    );


    crearGraficaTemperatura(
        labels,
        temperatures
    );


    crearGraficaHumitat(
        labels,
        humiditats
    );


    crearGraficaSensacio(
        labels,
        sensacions
    );
}


// Evitar errors si encara no hi ha dades
function obterDadesSegures() {

    return obtenirDadesPeriode();
}


// =========================
// GRÀFICA TEMPERATURA
// =========================

function crearGraficaTemperatura(labels, dades) {

    const canvas =
        document.getElementById("graficaTemperatura");


    if (graficaTemperatura) {
        graficaTemperatura.destroy();
    }


    graficaTemperatura = new Chart(canvas, {

        type: "line",

        data: {

            labels: labels,

            datasets: [{

                label: "Temperatura (°C)",

                data: dades,

                tension: 0.3,

                pointRadius: 2
            }]
        },

        options: {

            responsive: true,

            interaction: {

                mode: "index",

                intersect: false
            },

            scales: {

                y: {

                    title: {

                        display: true,

                        text: "°C"
                    }
                }
            }
        }
    });
}


// =========================
// GRÀFICA HUMITAT
// =========================

function crearGraficaHumitat(labels, dades) {

    const canvas =
        document.getElementById("graficaHumitat");


    if (graficaHumitat) {
        graficaHumitat.destroy();
    }


    graficaHumitat = new Chart(canvas, {

        type: "line",

        data: {

            labels: labels,

            datasets: [{

                label: "Humitat (%)",

                data: dades,

                tension: 0.3,

                pointRadius: 2
            }]
        },

        options: {

            responsive: true,

            interaction: {

                mode: "index",

                intersect: false
            },

            scales: {

                y: {

                    title: {

                        display: true,

                        text: "%"
                    }
                }
            }
        }
    });
}


// =========================
// GRÀFICA SENSACIÓ
// =========================

function crearGraficaSensacio(labels, dades) {

    const canvas =
        document.getElementById("graficaSensacio");


    if (graficaSensacio) {
        graficaSensacio.destroy();
    }


    graficaSensacio = new Chart(canvas, {

        type: "line",

        data: {

            labels: labels,

            datasets: [{

                label: "Sensació tèrmica (°C)",

                data: dades,

                tension: 0.3,

                pointRadius: 2
            }]
        },

        options: {

            responsive: true,

            interaction: {

                mode: "index",

                intersect: false
            },

            scales: {

                y: {

                    title: {

                        display: true,

                        text: "°C"
                    }
                }
            }
        }
    });
}


// =========================
// INICI
// =========================

carregarDades();

carregarHistorial();


// Dades actuals cada 10 segons
setInterval(carregarDades, 10000);


// Historial cada 5 minuts
setInterval(carregarHistorial, 300000);