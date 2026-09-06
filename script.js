
// ==========================================
// ESTACIÓ METEOROLÒGICA - script.js
// ==========================================

// Període seleccionat actualment
let periodeActual = "24h";

// Dades de l'historial
let dadesHistorial = [];

// Gràfics
let graficaTemperatura = null;
let graficaHumitat = null;
let graficaSensacio = null;


// ==========================================
// CARREGAR DADES ACTUALS
// ==========================================

async function carregarDades() {

    try {

        // El ?t= evita que el navegador faci servir la versió antiga
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

        // Actualitzar HTML
        document.getElementById("temperatura").textContent = temperatura;
        document.getElementById("humitat").textContent = humitat;
        document.getElementById("sensacio").textContent = sensacio;

        document.getElementById("actualitzacio").textContent =
            "🟢 Última actualització: " + actualitzacio;

    } catch (error) {

        console.error("Error carregant les dades:", error);

        document.getElementById("actualitzacio").textContent =
            "🔴 No s'han pogut carregar les dades";
    }
}


// ==========================================
// CARREGAR HISTORIAL CSV
// ==========================================

async function carregarHistorial() {

    try {

        const resposta = await fetch("historial.csv?t=" + Date.now());

        // Si el CSV encara no existeix, no passa res
        if (!resposta.ok) {

            console.log("ℹ️ historial.csv encara no existeix.");

            dadesHistorial = [];

            actualitzarGrafiques();

            return;
        }

        const text = await resposta.text();

        const linies = text
            .trim()
            .split("\n")
            .map(linia => linia.trim())
            .filter(linia => linia.length > 0);

        // Si només hi ha la capçalera
        if (linies.length <= 1) {

            dadesHistorial = [];

            actualitzarGrafiques();

            return;
        }

        // Saltar la capçalera
        dadesHistorial = [];

        for (let i = 1; i < linies.length; i++) {

            const parts = linies[i].split(",");

            if (parts.length < 5) {
                continue;
            }

            const data = parts[0];
            const hora = parts[1];
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

            dadesHistorial.push({
                data: data,
                hora: hora,
                temperatura: temperatura,
                humitat: humitat,
                sensacio: sensacio,
                dataHora: convertirData(data, hora)
            });
        }

        console.log(
            "📊 Dades de l'historial carregades:",
            dadesHistorial.length
        );

        actualitzarGrafiques();

    } catch (error) {

        console.error("Error carregant historial.csv:", error);

        dadesHistorial = [];

        actualitzarGrafiques();
    }
}


// ==========================================
// CONVERTIR DATA DEL CSV
// DD/MM/YYYY + HH:MM:SS
// ==========================================

function convertirData(data, hora) {

    try {

        const partsData = data.split("/");

        const partsHora = hora.split(":");

        if (partsData.length !== 3 || partsHora.length < 2) {
            return null;
        }

        const dia = parseInt(partsData[0]);
        const mes = parseInt(partsData[1]) - 1;
        const any = parseInt(partsData[2]);

        const h = parseInt(partsHora[0]);
        const m = parseInt(partsHora[1]);
        const s = partsHora.length >= 3
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

    console.log("📅 Període seleccionat:", periode);

    // Treure classe activa de tots els botons
    const botons = document.querySelectorAll(".periode");

    botons.forEach(boto => {
        boto.classList.remove("actiu");
    });

    // Activar el botó seleccionat
    const botoSeleccionat = document.querySelector(
        `.periode[data-periode="${periode}"]`
    );

    if (botoSeleccionat) {
        botoSeleccionat.classList.add("actiu");
    }

    // Actualitzar gràfics
    actualitzarGrafiques();
}


// ==========================================
// OBTENIR DADES DEL PERÍODE
// ==========================================

function obtenirDadesPeriode() {

    // Si no hi ha dades
    if (dadesHistorial.length === 0) {
        return [];
    }

    // "Tot"
    if (periodeActual === "tot") {
        return [...dadesHistorial];
    }

    let milisegons = 0;

    switch (periodeActual) {

        case "1h":
            milisegons = 60 * 60 * 1000;
            break;

        case "6h":
            milisegons = 6 * 60 * 60 * 1000;
            break;

        case "24h":
            milisegons = 24 * 60 * 60 * 1000;
            break;

        case "7d":
            milisegons = 7 * 24 * 60 * 60 * 1000;
            break;

        default:
            return [...dadesHistorial];
    }

    const ara = new Date();

    const inici = new Date(
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
// CREAR ETIQUETA DE L'EIX X
// ==========================================

function obtenirEtiqueta(dada) {

    if (periodeActual === "7d" || periodeActual === "tot") {

        return `${dada.data} ${dada.hora.substring(0, 5)}`;

    }

    return dada.hora.substring(0, 5);
}


// ==========================================
// ACTUALITZAR ELS GRÀFICS
// ==========================================

function actualitzarGrafiques() {

    const dades = obtenirDadesPeriode();

    console.log(
        `📈 Actualitzant gràfics: ${dades.length} dades`
    );


    // ------------------------------------------
    // PREPARAR ETIQUETES
    // ------------------------------------------

    const etiquetes = dades.map(dada =>
        obtenirEtiqueta(dada)
    );


    // ------------------------------------------
    // TEMPERATURA
    // ------------------------------------------

    const temperatures = dades.map(dada =>
        dada.temperatura
    );


    // ------------------------------------------
    // HUMITAT
    // ------------------------------------------

    const humiditats = dades.map(dada =>
        dada.humitat
    );


    // ------------------------------------------
    // SENSACIÓ TÈRMICA
    // ------------------------------------------

    const sensacions = dades.map(dada =>
        dada.sensacio
    );


    // ==========================================
    // ELIMINAR GRÀFICS ANTICS
    // ==========================================

    if (graficaTemperatura) {
        graficaTemperatura.destroy();
    }

    if (graficaHumitat) {
        graficaHumitat.destroy();
    }

    if (graficaSensacio) {
        graficaSensacio.destroy();
    }


    // ==========================================
    // GRÀFIC TEMPERATURA
    // ==========================================

    const ctxTemperatura = document
        .getElementById("graficaTemperatura")
        .getContext("2d");

    graficaTemperatura = new Chart(
        ctxTemperatura,
        {
            type: "line",

            data: {
                labels: etiquetes,

                datasets: [
                    {
                        label: "Temperatura (°C)",

                        data: temperatures,

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
                            text: "Temperatura (°C)"
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


    // ==========================================
    // GRÀFIC HUMITAT
    // ==========================================

    const ctxHumitat = document
        .getElementById("graficaHumitat")
        .getContext("2d");

    graficaHumitat = new Chart(
        ctxHumitat,
        {
            type: "line",

            data: {
                labels: etiquetes,

                datasets: [
                    {
                        label: "Humitat (%)",

                        data: humiditats,

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
                            text: "Humitat (%)"
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


    // ==========================================
    // GRÀFIC SENSACIÓ
    // ==========================================

    const ctxSensacio = document
        .getElementById("graficaSensacio")
        .getContext("2d");

    graficaSensacio = new Chart(
        ctxSensacio,
        {
            type: "line",

            data: {
                labels: etiquetes,

                datasets: [
                    {
                        label: "Sensació tèrmica (°C)",

                        data: sensacions,

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
                            text: "Sensació tèrmica (°C)"
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
// INICIAR
// ==========================================

console.log("🌤️ Estació meteorològica iniciada.");

// Carregar dades immediatament
carregarDades();
carregarHistorial();


// ==========================================
// ACTUALITZACIÓ AUTOMÀTICA
// ==========================================

// Dades actuals cada 10 segons
setInterval(() => {

    console.log("🔄 Actualitzant dades actuals...");

    carregarDades();

}, 10000);


// Historial cada 5 minuts
setInterval(() => {

    console.log("📊 Actualitzant historial...");

    carregarHistorial();

}, 5 * 60 * 1000);

