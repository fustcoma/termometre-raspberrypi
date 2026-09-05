import board
import adafruit_dht
import time
import numpy as np
import subprocess

dht = adafruit_dht.DHT11(board.D2)

temperatures = []
humiditats = []
sensacions = []

inici = time.time()

print("Començant lectura durant 1 minut...")

while time.time() - inici < 60:
    try:
        temperatura = dht.temperature
        humitat = dht.humidity

        if temperatura is not None and humitat is not None:

            # Sensació tèrmica
            e = (humitat / 100) * 6.105 * np.exp(
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


# =========================
# CALCULAR MITJANES
# =========================

if temperatures:

    mitjana_temp = sum(temperatures) / len(temperatures)
    mitjana_hum = sum(humiditats) / len(humiditats)
    mitjana_sensacio = sum(sensacions) / len(sensacions)

    print()
    print("===== RESULTAT =====")
    print(f"Lectures: {len(temperatures)}")
    print(f"Temperatura mitjana: {mitjana_temp:.2f} °C")
    print(f"Humitat mitjana: {mitjana_hum:.2f} %")
    print(f"Sensació tèrmica mitjana: {mitjana_sensacio:.2f} °C")

    # =========================
    # ESCRIURE pi.txt
    # =========================

    with open("pi.txt", "w") as fitxer:
        fitxer.write(f"{mitjana_temp:.2f}\n")
        fitxer.write(f"{mitjana_hum:.2f}\n")
        fitxer.write(f"{mitjana_sensacio:.2f}\n")

    print("pi.txt actualitzat.")

    # =========================
    # GIT
    # =========================

    subprocess.run(["git", "add", "pi.txt"])

    subprocess.run([
        "git",
        "commit",
        "-m",
        "Actualitzar dades del sensor"
    ])

    subprocess.run(["git", "push"])

    print("Dades pujades a GitHub!")

else:
    print("No s'ha obtingut cap lectura.")

print("Programa finalitzat.")
