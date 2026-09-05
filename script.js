fetch("pi.txt")
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

        document.getElementById("temperatura").textContent = "Error";
        document.getElementById("humitat").textContent = "Error";
        document.getElementById("sensacio").textContent = "Error";
    });