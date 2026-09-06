function carregarDades() {

    // Date.now() evita que el navegador utilitzi una còpia antiga
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
            const ultimaActualitzacio = valors[3];

            // Actualitzar dades
            document.getElementById("temperatura").textContent =
                temperatura + " °C";

            document.getElementById("humitat").textContent =
                humitat + " %";

            document.getElementById("sensacio").textContent =
                sensacio + " °C";


            // Mostrar quan es van actualitzar les dades
            if (ultimaActualitzacio) {

                document.getElementById("actualitzacio").textContent =
                    "🟢 Última actualització: " + ultimaActualitzacio;

            }

            console.log(
                "✅ Fetch correcte:",
                new Date().toLocaleTimeString()
            );
        })

        .catch(error => {

            console.error("❌ Error fent fetch:", error);

            document.getElementById("actualitzacio").textContent =
                "🔴 No s'han pogut actualitzar les dades";
        });
}


// Fer un fetch immediatament en obrir la pàgina
carregarDades();


// Actualitzar cada 10 segons
setInterval(carregarDades, 10000);