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

            document.getElementById("temperatura").textContent =
                temperatura + " °C";

            document.getElementById("humitat").textContent =
                humitat + " %";

            document.getElementById("sensacio").textContent =
                sensacio + " °C";
        })
        .catch(error => {
            console.error(error);
        });
}

// Carregar les dades en obrir la pàgina
carregarDades();

// Actualitzar cada 10 segons
setInterval(carregarDades, 10000);