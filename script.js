fetch("pi.txt")
    .then(response => {
        if (!response.ok) {
            throw new Error("No s'ha pogut trobar pi.txt");
        }

        return response.text();
    })
    .then(temperatura => {
        document.getElementById("temperatura").textContent =
            temperatura.trim() + " °C";
    })
    .catch(error => {
        console.error(error);

        document.getElementById("temperatura").textContent =
            "Error";
    });