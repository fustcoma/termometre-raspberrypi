import time
import math
import subprocess
from pathlib import Path

import board
import adafruit_dht


# DHT11 connectat al GPIO2 (pin físic 3)
dht = adafruit_dht.DHT11(board.D2)

# Carpeta on està aquest script i pi.txt
repo = Path(__file__).resolve().parent
fitxer = repo / "pi.txt"


while True:

    print("\n=== Començant nova mesura ===")

    temperatures = []
    humiditats = []
    sensacions = []

    # Mesurar durant 1 minut
    inici = time.time()

    while time.time() - inici < 60:

        try:
            temperatura = dht.temperature
            humitat = dht.humidity

            if temperatura is not None and humitat is not None:

                # Càlcul de la sensació tèrmica
                e = (humitat / 100) * 6.105 * math.exp(
                    17.72 * temperatura / (237.7 + temperatura)
                )

                sensacio = temperatura + 0.33 * e - 4

                temperatures.append(temperatura)
                humiditats.append(humitat)
                sensacions.append(sensacio)

                print(
                    f"Temperatura: {temperatura:.2f} °C | "
                    f"Humitat: {humitat:.2f} % | "
                    f"Sensació: {sensacio:.2f} °C"
                )

        except RuntimeError as error:
            print("Error de lectura:", error)

        time.sleep(2)

    # Comprovar que tenim dades
    if len(temperatures) == 0:
        print("No s'han pogut obtenir dades.")
        continue

    # Calcular mitjanes
    mitjana_temp = sum(temperatures) / len(temperatures)
    mitjana_hum = sum(humiditats) / len(humiditats)
    mitjana_sensacio = sum(sensacions) / len(sensacions)

    print("\n=== RESULTAT ===")
    print(f"Temperatura mitjana: {mitjana_temp:.2f} °C")
    print(f"Humitat mitjana: {mitjana_hum:.2f} %")
    print(f"Sensació mitjana: {mitjana_sensacio:.2f} °C")

    # Escriure pi.txt
    with open(fitxer, "w") as f:
        f.write(f"{mitjana_temp:.2f}\n")
        f.write(f"{mitjana_hum:.2f}\n")
        f.write(f"{mitjana_sensacio:.2f}\n")

    print("\npi.txt actualitzat.")

    # Pujar a GitHub
    try:
        subprocess.run(
            ["git", "add", "pi.txt"],
            cwd=repo,
            check=True
        )

        subprocess.run(
            ["git", "commit", "-m", "Actualitzar dades del sensor"],
            cwd=repo,
            check=False
        )

        subprocess.run(
            ["git", "push"],
            cwd=repo,
            check=True
        )

        print("✅ Dades pujades a GitHub!")

    except subprocess.CalledProcessError as error:
        print("❌ Error fent el push:", error)

    print("\nEsperant 10 segons abans de començar una nova mesura...")

    time.sleep(10)
