import board
import adafruit_dht
import time
import math
import csv
import os
import subprocess
from datetime import datetime


# =========================
# CONFIGURACIÓ
# =========================

DURADA_MESURA = 60
INTERVAL_LECTURA = 2

INTERVAL_PUSH = 300

FITXER_ACTUAL = "pi.txt"
FITXER_HISTORIAL = "historial.csv"

DHT_PIN = board.D2


# =========================
# SENSOR
# =========================

dht = adafruit_dht.DHT11(DHT_PIN)


# =========================
# SENSACIÓ TÈRMICA
# =========================

def calcular_sensacio(temperatura, humitat):
    e = (humitat / 100) * 6.105 * math.exp(
        17.72 * temperatura / (237.7 + temperatura)
    )

    return temperatura + 0.33 * e - 4


# =========================
# HISTORIAL
# =========================

def crear_historial_si_no_existeix():
    if not os.path.exists(FITXER_HISTORIAL):
        with open(
            FITXER_HISTORIAL,
            "w",
            newline="",
            encoding="utf-8"
        ) as fitxer:

            escriptor = csv.writer(fitxer)

            escriptor.writerow([
                "data",
                "hora",
                "temperatura",
                "humitat",
                "sensacio"
            ])


def guardar_historial(
    temperatura,
    humitat,
    sensacio,
    moment
):
    crear_historial_si_no_existeix()

    with open(
        FITXER_HISTORIAL,
        "a",
        newline="",
        encoding="utf-8"
    ) as fitxer:

        escriptor = csv.writer(fitxer)

        escriptor.writerow([
            moment.strftime("%d/%m/%Y"),
            moment.strftime("%H:%M:%S"),
            f"{temperatura:.2f}",
            f"{humitat:.2f}",
            f"{sensacio:.2f}"
        ])


# =========================
# DADA ACTUAL
# =========================

def guardar_actual(
    temperatura,
    humitat,
    sensacio,
    moment
):
    with open(
        FITXER_ACTUAL,
        "w",
        encoding="utf-8"
    ) as fitxer:

        fitxer.write(f"{temperatura:.2f}\n")
        fitxer.write(f"{humitat:.2f}\n")
        fitxer.write(f"{sensacio:.2f}\n")
        fitxer.write(
            moment.strftime("%d/%m/%Y %H:%M:%S")
        )


# =========================
# GITHUB
# =========================

def pujar_github():
    try:
        print("Comprovant GitHub...")

        subprocess.run(
            ["git", "add", FITXER_ACTUAL, FITXER_HISTORIAL],
            check=True
        )

        resultat_commit = subprocess.run(
            [
                "git",
                "commit",
                "-m",
                "Actualització dades meteorològiques"
            ],
            capture_output=True,
            text=True
        )

        if resultat_commit.returncode == 0:
            print("Canvis preparats per pujar.")
        else:
            print("No hi ha canvis nous per crear un commit.")

        resultat_push = subprocess.run(
            ["git", "push"],
            capture_output=True,
            text=True
        )

        if resultat_push.returncode == 0:
            print("Dades pujades a GitHub.")
            return True

        print("Error fent push:")
        print(resultat_push.stderr)

        return False

    except Exception as error:
        print(f"Error amb GitHub: {error}")
        return False


# =========================
# PROGRAMA PRINCIPAL
# =========================

crear_historial_si_no_existeix()

ultim_push = time.time()

print("Estació meteorològica iniciada.")

while True:

    temperatures = []
    humitats = []

    inici = time.time()

    print("Començant una nova mesura.")

    while time.time() - inici < DURADA_MESURA:

        try:
            temperatura = dht.temperature
            humitat = dht.humidity

            if (
                temperatura is not None
                and humitat is not None
            ):
                temperatures.append(temperatura)
                humitats.append(humitat)

                print(
                    f"Lectura: "
                    f"{temperatura:.2f} C, "
                    f"{humitat:.2f} %"
                )

        except RuntimeError as error:
            print(f"Error temporal del sensor: {error}")

        except Exception as error:
            print(f"Error del sensor: {error}")

        time.sleep(INTERVAL_LECTURA)

    if temperatures and humitats:

        temperatura_mitjana = (
            sum(temperatures) / len(temperatures)
        )

        humitat_mitjana = (
            sum(humitats) / len(humitats)
        )

        sensacio = calcular_sensacio(
            temperatura_mitjana,
            humitat_mitjana
        )

        moment = datetime.now()

        print()
        print("Resultat de la mesura:")
        print(
            f"Temperatura: "
            f"{temperatura_mitjana:.2f} C"
        )
        print(
            f"Humitat: "
            f"{humitat_mitjana:.2f} %"
        )
        print(
            f"Sensació: "
            f"{sensacio:.2f} C"
        )
        print(
            f"Hora: "
            f"{moment.strftime('%d/%m/%Y %H:%M:%S')}"
        )

        guardar_actual(
            temperatura_mitjana,
            humitat_mitjana,
            sensacio,
            moment
        )

        guardar_historial(
            temperatura_mitjana,
            humitat_mitjana,
            sensacio,
            moment
        )

        print("Dades guardades.")

    else:
        print("No s'han pogut obtenir dades suficients.")

    if time.time() - ultim_push >= INTERVAL_PUSH:
        pujar_github()
        ultim_push = time.time()

    print("Esperant la següent mesura.")
    print()

    time.sleep(10)