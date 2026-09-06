import time
import math
import subprocess
from pathlib import Path
from datetime import datetime

import board
import adafruit_dht


# =========================
# CONFIGURACIÓ
# =========================

DURADA_MESURA = 60
INTERVAL_LECTURA = 2

ESPERA_ENTRE_MESURES = 10

# Fer push cada 5 minuts
INTERVAL_PUSH = 5 * 60


# =========================
# FITXERS
# =========================

repo = Path(__file__).resolve().parent

fitxer_dades = repo / "pi.txt"
fitxer_historial = repo / "historial.csv"


# =========================
# DHT11
# =========================

dht = adafruit_dht.DHT11(board.D2)


# =========================
# CREAR HISTORIAL SI NO EXISTEIX
# =========================

if not fitxer_historial.exists():

    with open(fitxer_historial, "w", encoding="utf-8") as f:

        f.write(
            "data,hora,temperatura,humitat,sensacio\n"
        )


# =========================
# GIT PUSH
# =========================

def pujar_github():

    try:

        print("📤 Pujant dades a GitHub...")

        subprocess.run(
            ["git", "add", "pi.txt", "historial.csv"],
            cwd=repo,
            check=True
        )

        resultat = subprocess.run(
            [
                "git",
                "commit",
                "-m",
                "Actualitzar dades meteorologiques"
            ],
            cwd=repo,
            check=False
        )

        # Si no hi havia canvis, no passa res
        if resultat.returncode != 0:
            print("ℹ️ No hi havia canvis per fer commit.")
            return True

        subprocess.run(
            ["git", "push"],
            cwd=repo,
            check=True
        )

        print("✅ Dades pujades a GitHub!")

        return True

    except Exception as error:

        print(f"❌ Error fent git push: {error}")
        print("🔄 Continuarem mesurant.")

        return False


# =========================
# TEMPS DEL PRIMER PUSH
# =========================

ultima_push = time.time()


# =========================
# PROGRAMA PRINCIPAL
# =========================

print("🌡️ Estació meteorològica iniciada")
print("📊 Historial activat")
print("📤 GitHub s'actualitzarà cada 5 minuts")
print("🔄 Programa infinit\n")


while True:

    try:

        print("=" * 45)
        print("📊 COMENÇANT NOVA MESURA")
        print("=" * 45)

        temperatures = []
        humiditats = []
        sensacions = []

        inici = time.time()

        # -------------------------
        # MESURAR DURANT 1 MINUT
        # -------------------------

        while time.time() - inici < DURADA_MESURA:

            try:

                temperatura = dht.temperature
                humitat = dht.humidity

                if temperatura is not None and humitat is not None:

                    # Sensació tèrmica
                    e = (
                        (humitat / 100)
                        * 6.105
                        * math.exp(
                            17.72 * temperatura
                            / (237.7 + temperatura)
                        )
                    )

                    sensacio = temperatura + 0.33 * e - 4

                    temperatures.append(temperatura)
                    humiditats.append(humitat)
                    sensacions.append(sensacio)

                    print(
                        f"🌡️ {temperatura:.2f} °C | "
                        f"💧 {humitat:.2f} % | "
                        f"🥵 {sensacio:.2f} °C"
                    )

            except RuntimeError as error:

                print(f"⚠️ Error DHT11: {error}")

            except Exception as error:

                print(f"⚠️ Error inesperat DHT11: {error}")

            time.sleep(INTERVAL_LECTURA)


        # -------------------------
        # COMPROVAR DADES
        # -------------------------

        if len(temperatures) == 0:

            print("❌ No s'han obtingut dades.")
            print("🔄 Tornant a intentar...\n")

            time.sleep(5)
            continue


        # -------------------------
        # MITJANES
        # -------------------------

        mitjana_temp = sum(temperatures) / len(temperatures)
        mitjana_hum = sum(humiditats) / len(humiditats)
        mitjana_sensacio = sum(sensacions) / len(sensacions)


        # -------------------------
        # DATA I HORA
        # -------------------------

        ara = datetime.now()

        data = ara.strftime("%d/%m/%Y")
        hora = ara.strftime("%H:%M:%S")


        # -------------------------
        # MOSTRAR RESULTAT
        # -------------------------

        print("\n" + "=" * 45)
        print("📈 RESULTAT")
        print("=" * 45)

        print(f"🌡️ Temperatura: {mitjana_temp:.2f} °C")
        print(f"💧 Humitat: {mitjana_hum:.2f} %")
        print(f"🥵 Sensació: {mitjana_sensacio:.2f} °C")
        print(f"🕐 Hora: {hora}")
        print(f"📊 Lectures: {len(temperatures)}")


        # -------------------------
        # ACTUALITZAR PI.TXT
        # -------------------------

        with open(fitxer_dades, "w", encoding="utf-8") as f:

            f.write(f"{mitjana_temp:.2f}\n")
            f.write(f"{mitjana_hum:.2f}\n")
            f.write(f"{mitjana_sensacio:.2f}\n")
            f.write(f"{data} {hora}\n")


        # -------------------------
        # AFEGIR A HISTORIAL.CSV
        # -------------------------

        with open(
            fitxer_historial,
            "a",
            encoding="utf-8"
        ) as f:

            f.write(
                f"{data},"
                f"{hora},"
                f"{mitjana_temp:.2f},"
                f"{mitjana_hum:.2f},"
                f"{mitjana_sensacio:.2f}\n"
            )


        print("📝 pi.txt actualitzat.")
        print("📚 historial.csv actualitzat.")


        # -------------------------
        # COMPROVAR SI TOCA PUSH
        # -------------------------

        temps_des_de_push = time.time() - ultima_push


        if temps_des_de_push >= INTERVAL_PUSH:

            if pujar_github():

                ultima_push = time.time()

        else:

            minuts = int(
                (INTERVAL_PUSH - temps_des_de_push) / 60
            )

            segons = int(
                (INTERVAL_PUSH - temps_des_de_push) % 60
            )

            print(
                f"⏳ Següent push en "
                f"{minuts}m {segons}s"
            )


        # -------------------------
        # ESPERAR
        # -------------------------

        print(
            f"⏳ Esperant {ESPERA_ENTRE_MESURES} segons...\n"
        )

        time.sleep(ESPERA_ENTRE_MESURES)


    except KeyboardInterrupt:

        print("\n🛑 Programa aturat manualment.")

        try:
            dht.exit()
        except:
            pass

        break


    except Exception as error:

        print("\n🚨 ERROR GENERAL:")
        print(error)

        print("🔄 Continuant en 10 segons...\n")

        time.sleep(10)
