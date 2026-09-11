<img src="images/web-icon.png" alt="Pi Weather">

# π Weather

π Weather és una estació meteorològica intel·ligent amb Raspberry Pi Zero i sensor DHT11 per monitoritzar temperatura, humitat i sensació tèrmica en temps real.

El sistema mesura temperatura i humitat, calcula la sensació tèrmica, guarda un historial de les mesures i publica automàticament les dades a GitHub. Aquestes dades són utilitzades per una pàgina web publicada amb GitHub Pages.

## Funcionament general

El sistema està dividit en dues parts: la Raspberry Pi, que s'encarrega de mesurar i publicar les dades, i la pàgina web, que s'encarrega de mostrar-les.

```text
DHT11
  |
  v
Raspberry Pi Zero W
  |
  +--> temperatura.py
          |
          +--> pi.txt
          |
          +--> historial.csv
          |
          +--> Git commit
          |
          +--> Git push
                  |
                  v
               GitHub
                  |
                  v
             GitHub Pages
                  |
                  v
          index.html + script.js
```

El funcionament és:

1. La Raspberry Pi llegeix el DHT11 durant 60 segons.
2. Es fa una lectura aproximadament cada 2 segons.
3. Es calcula la mitjana de totes les lectures.
4. Es calcula la sensació tèrmica.
5. La dada actual es guarda a `pi.txt`.
6. La nova mesura s'afegeix a `historial.csv`.
7. Cada 5 minuts es fa un commit i un push a GitHub.
8. La pàgina web comprova les dades cada 10 segons.
9. Les gràfiques s'actualitzen automàticament quan apareixen noves dades.

No cal tenir la pàgina web oberta a la Raspberry Pi.

---

# Requisits

## Hardware

* Raspberry Pi Zero W
* Sensor DHT11
* Connexió a Internet
* Cables per connectar el sensor

## Software

* Python 3
* Git
* GitHub
* GitHub Pages
* Un repositori GitHub

En aquest projecte el repositori és:

```text
fustcoma/pi-weather
```

---

# Connexió del DHT11

El DHT11 està connectat de la següent manera:

```text
DHT11 DATA -> GPIO 2
DHT11 VCC  -> 3.3 V
DHT11 GND  -> GND
```

El GPIO 2 correspon al pin físic 3 de la Raspberry Pi.

El programa utilitza:

```python
board.D2
```

Si el mòdul DHT11 no incorpora una resistència pull-up, es pot utilitzar una resistència d'entre 4.7 kΩ i 10 kΩ entre DATA i 3.3 V.

---

# Estructura del projecte

El repositori conté:

```text
pi-weather/
|
+-- index.html
+-- script.js
+-- temperatura.py
+-- pi.txt
+-- historial.csv
```

## `temperatura.py`

És el programa principal que s'executa a la Raspberry Pi.

S'encarrega de:

* Llegir el DHT11.
* Fer lectures durant 60 segons.
* Fer una lectura cada 2 segons.
* Calcular les mitjanes.
* Calcular la sensació tèrmica.
* Actualitzar `pi.txt`.
* Actualitzar `historial.csv`.
* Fer commits a Git.
* Fer push a GitHub.
* Continuar funcionant encara que un `git push` falli.

## `pi.txt`

Conté les dades més recents.

Format:

```text
temperatura
humitat
sensacio
data i hora
```

Exemple:

```text
26.60
53.36
29.00
06/09/2026 22:50:29
```

Aquest fitxer s'utilitza per mostrar les dades actuals a la web.

## `historial.csv`

Conté totes les mesures.

Format:

```text
data,hora,temperatura,humitat,sensacio
```

Exemple:

```text
data,hora,temperatura,humitat,sensacio
06/09/2026,22:50:29,26.60,53.36,29.00
06/09/2026,22:51:32,26.70,53.10,29.10
```

Si el fitxer no existeix, `temperatura.py` el crea automàticament amb la capçalera corresponent.

## `index.html`

És la interfície de la pàgina web.

Mostra:

* Temperatura actual.
* Humitat actual.
* Sensació tèrmica actual.
* Data i hora de l'última actualització.
* Gràfica de temperatura.
* Gràfica d'humitat.
* Gràfica de sensació tèrmica.

La pàgina utilitza un disseny fosc.

Els períodes disponibles són:

```text
1 hora
6 hores
24 hores
7 dies
Tot
```

## `script.js`

S'encarrega de:

* Carregar `pi.txt`.
* Carregar `historial.csv`.
* Actualitzar les dades actuals.
* Crear les gràfiques.
* Canviar el període de les gràfiques.
* Actualitzar automàticament les dades cada 10 segons.
* Detectar períodes sense dades.

Utilitza Chart.js per generar les gràfiques.

---

# Instal·lació

## 1. Clonar el repositori

Des de la Raspberry Pi:

```bash
cd ~
git clone https://github.com/fustcoma/pi-weather.git
```

Entrar al projecte:

```bash
cd ~/pi-weather
```

---

# 2. Crear l'entorn virtual de Python

Crear l'entorn virtual:

```bash
python3 -m venv ~/dht-env
```

Activar-lo:

```bash
source ~/dht-env/bin/activate
```

Quan estigui activat, normalment apareixerà `(dht-env)` al principi de la terminal.

Per sortir de l'entorn virtual:

```bash
deactivate
```

---

# 3. Instal·lar les llibreries

Amb l'entorn virtual activat:

```bash
pip install adafruit-blinka
pip install adafruit-circuitpython-dht
```

El programa actual no necessita NumPy.

---

# 4. Configurar Git

Git necessita saber quin usuari farà els commits.

Configurar el nom:

```bash
git config --global user.name "EL_TEU_USERNAME"
```

Configurar el correu:

```bash
git config --global user.email "EL_TEU_EMAIL"
```

Comprovar-ho:

```bash
git config --global --list
```

---

# 5. Crear un Personal Access Token de GitHub

Per poder fer `git push` des de la Raspberry Pi mitjançant HTTPS, GitHub necessita una credencial.

La contrasenya normal del compte de GitHub no s'utilitza per a aquest procés.

Cal crear un Personal Access Token.

## 5.1 Entrar a la configuració

A GitHub:

1. Obre `Settings`.
2. Entra a `Developer settings`.
3. Entra a `Personal access tokens`.
4. Selecciona `Fine-grained tokens`.
5. Selecciona `Generate new token`.

## 5.2 Configurar el token

Posa un nom identificatiu, per exemple:

```text
Raspberry Pi Estació Meteorològica
```

Selecciona una data d'expiració.

A `Repository access`, selecciona:

```text
Only select repositories
```

I selecciona:

```text
usuari/nom-del-repositori
```

A `Repository permissions`, busca:

```text
Contents
```

I posa:

```text
Read and write
```

Finalment, crea el token.

## 5.3 Guardar el token

GitHub només mostra el token complet una vegada.

Cal copiar-lo quan aparegui.

El token no s'ha d'introduir mai dins de:

```text
temperatura.py
index.html
script.js
```

Tampoc s'ha de pujar a GitHub.

---

# 6. Fer que Git recordi el token

Perquè Git no demani el token en cada `git push`, configurar:

```bash
git config --global credential.helper store
```

Després fer un primer push:

```bash
cd ~/pi-weather
git push
```

Git demanarà:

```text
Username:
Password:
```

A `Username`, utilitza el teu nom d'usuari de GitHub:

A `Password`, enganxa el Personal Access Token.

No utilitzis la contrasenya normal del compte de GitHub.

Després d'això, Git guardarà la credencial localment i els futurs `git push` no haurien de tornar a demanar el token.

La credencial quedarà guardada a:

```text
~/.git-credentials
```

Aquest fitxer conté informació sensible.

No s'ha de compartir ni pujar al repositori.

---

# 7. Provar GitHub abans de continuar

Abans de configurar l'automatització, és recomanable comprovar que la Raspberry pot fer push.

Executar:

```bash
cd ~/pi-weather
git status
```

Després:

```bash
git push
```

Si el push funciona sense errors i no torna a demanar el token en les següents ocasions, Git està configurat correctament.

---

# 8. Provar el sensor manualment

Activar l'entorn virtual:

```bash
source ~/dht-env/bin/activate
```

Entrar al projecte:

```bash
cd ~/pi-weather
```

Executar:

```bash
python temperatura.py
```

El programa començarà a fer lectures.

Es poden veure dades semblants a:

```text
Lectura: 26.00 C, 53.00 %
Lectura: 26.00 C, 54.00 %
Lectura: 26.00 C, 53.00 %
```

Després de completar els 60 segons de mesura, calcularà:

```text
Temperatura mitjana
Humitat mitjana
Sensació tèrmica
```

I actualitzarà:

```text
pi.txt
historial.csv
```

Per aturar-lo manualment:

```text
Ctrl + C
```

---

# 9. Crear el servei automàtic

Perquè el programa no s'hagi d'executar manualment cada vegada que s'encén la Raspberry Pi, s'utilitza `systemd`.

Es crea un servei anomenat:

```text
estacio.service
```

Crear-lo:

```bash
sudo nano /etc/systemd/system/estacio.service
```

Posar-hi:

```ini
[Unit]
Description=Estacio meteorologica DHT11
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/pi-weather
ExecStart=/home/pi/dht-env/bin/python /home/pi/pi-weather/temperatura.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Guardar i sortir.

Aquest fitxer indica a systemd:

* Quin programa executar.
* Quin usuari utilitzar.
* En quina carpeta executar-lo.
* Quin Python utilitzar.
* Que s'ha de reiniciar si el programa falla.
* Que s'ha d'iniciar durant l'arrencada de la Raspberry Pi.

Els camins han de coincidir amb la ubicació real del projecte i de l'entorn virtual.

---

# 10. Activar el servei

Després de crear el fitxer:

```bash
sudo systemctl daemon-reload
```

Iniciar el servei:

```bash
sudo systemctl start estacio.service
```

Comprovar l'estat:

```bash
sudo systemctl status estacio.service
```

Hauria d'aparèixer:

```text
Active: active (running)
```

---

# 11. Activar l'inici automàtic

Perquè el programa s'executi automàticament cada vegada que la Raspberry Pi s'encén:

```bash
sudo systemctl enable estacio.service
```

A partir d'aquest moment no cal executar manualment:

```bash
python temperatura.py
```

ni:

```bash
source ~/dht-env/bin/activate
```

durant l'arrencada.

Systemd utilitza directament:

```text
/home/pi/dht-env/bin/python
```

---

# 12. Comprovar l'arrencada automàtica

Es pot comprovar reiniciant la Raspberry:

```bash
sudo reboot
```

Quan torni a estar disponible:

```bash
sudo systemctl status estacio.service
```

Si apareix:

```text
Active: active (running)
```

el programa s'ha iniciat automàticament.

També es poden veure els logs:

```bash
journalctl -u estacio.service -f
```

---

# Control del servei

## Iniciar

```bash
sudo systemctl start estacio.service
```

## Aturar

```bash
sudo systemctl stop estacio.service
```

## Reiniciar

```bash
sudo systemctl restart estacio.service
```

## Veure l'estat

```bash
sudo systemctl status estacio.service
```

## Veure els logs en temps real

```bash
journalctl -u estacio.service -f
```

## Veure les últimes 100 línies

```bash
journalctl -u estacio.service -n 100
```

## Desactivar l'inici automàtic

```bash
sudo systemctl disable estacio.service
```

Això no elimina el servei.

Només evita que s'iniciï automàticament.

Per tornar-lo a activar:

```bash
sudo systemctl enable estacio.service
```

---

# Actualització de les dades

Cada cicle de `temperatura.py` dura aproximadament:

```text
60 segons de mesura
+
10 segons d'espera
```

Durant els 60 segons es fa una lectura cada 2 segons.

Les lectures obtingudes es fan servir per calcular una mitjana.

Després es guarden les dades a:

```text
pi.txt
historial.csv
```

El programa no fa un `git push` després de cada mesura.

El push es fa aproximadament cada 5 minuts.

El procés és:

```text
Dada nova
   |
   v
pi.txt
   |
   v
historial.csv
   |
   v
git add
   |
   v
git commit
   |
   v
git push
   |
   v
GitHub
```

Si un `git push` falla, el programa no s'atura. Continuarà fent mesures i tornarà a intentar publicar-les en el següent interval.

---

# Actualització automàtica de la web

La pàgina web comprova `pi.txt` i `historial.csv` cada 10 segons.

Això significa que no cal recarregar manualment la pàgina perquè apareguin noves dades.

El flux és:

```text
Raspberry Pi
     |
     | nova dada
     v
Fitxers locals
     |
     | cada 5 minuts
     v
GitHub
     |
     | comprovació cada 10 segons
     v
Web
```

Per tant, el temps màxim aproximat entre un `git push` i la detecció de la nova dada per la web és d'uns 10 segons.

Si el navegador està mostrant dades antigues després de modificar el codi de la web, es pot fer una recàrrega completa amb:

```text
Ctrl + Shift + R
```

---

# Gràfiques

Les gràfiques utilitzen les dades de:

```text
historial.csv
```

Hi ha tres gràfiques:

```text
Temperatura
Humitat
Sensació tèrmica
```

Els períodes disponibles són:

```text
1 hora
6 hores
24 hores
7 dies
Tot
```

---

# Separació de dades sense mesures

La web detecta automàticament quan hi ha un període llarg sense dades.

Actualment el límit és de:

```text
5 minuts
```

Per exemple:

```text
10:01  30 C
10:02  30 C
10:03  30 C
10:04  30 C
13:04  34 C
```

Entre `10:04` i `13:04` han passat més de 5 minuts.

La gràfica no connectarà aquests dos punts.

Es mostrarà aproximadament:

```text
30 ──────────        ───── 34
```

en lloc de:

```text
30 ─────────────────────── 34
```

Això evita crear línies incorrectes quan la Raspberry està apagada, perd connexió, el sensor deixa de funcionar o simplement no hi ha dades durant un període.


---

# Càlcul de la sensació tèrmica

La sensació tèrmica es calcula utilitzant temperatura i humitat relativa.

La fórmula utilitzada pel programa és:

```python
e = (humitat / 100) * 6.105 * math.exp(
    17.72 * temperatura / (237.7 + temperatura)
)

sensacio = temperatura + 0.33 * e - 4
```

El resultat es guarda amb dues xifres decimals.

---

# GitHub Pages

La pàgina web està pensada per funcionar amb GitHub Pages.

El repositori és:

```text
https://github.com/fustcoma/pi-weather
```

GitHub Pages utilitza:

```text
index.html
script.js
pi.txt
historial.csv
```

La pàgina web no necessita Python ni cap servidor propi.

Només necessita poder llegir els fitxers del repositori.

---

# Actualitzar el codi del projecte

Si es modifica `temperatura.py`, `script.js` o `index.html`, cal pujar els canvis a GitHub.

Des de l'ordinador:

```bash
git add .
git commit -m "Actualització del projecte"
git push
```

Després, si s'ha modificat `temperatura.py`, cal actualitzar també la còpia de la Raspberry Pi.

A la Raspberry:

```bash
cd ~/pi-weather
git pull
```

Després reiniciar el servei:

```bash
sudo systemctl restart estacio.service
```

Això és important perquè el servei que ja està funcionant continuarà utilitzant el programa anterior fins que es reiniciï.

---

# Actualitzar només el programa de la Raspberry

Si només s'ha modificat `temperatura.py`:

```bash
cd ~/tpi-weather
git pull
sudo systemctl restart estacio.service
```

Comprovar:

```bash
sudo systemctl status estacio.service
```

---

# Actualitzar el servei de systemd

Si es modifica:

```text
/etc/systemd/system/estacio.service
```

cal executar:

```bash
sudo systemctl daemon-reload
```

I després:

```bash
sudo systemctl restart estacio.service
```

Si també es vol assegurar que continua iniciant-se automàticament:

```bash
sudo systemctl enable estacio.service
```

---

# Historial de dades

`historial.csv` no s'ha de crear manualment.

Si no existeix, `temperatura.py` el crea automàticament.

A partir d'aquí, cada mesura s'afegeix al final del fitxer.

Per consultar-lo des de la Raspberry:

```bash
cat historial.csv
```

Per consultar només les últimes línies:

```bash
tail historial.csv
```

Per exemple:

```bash
tail -20 historial.csv
```

---

# Comprovar les dades actuals

Per veure el contingut de `pi.txt`:

```bash
cat pi.txt
```

Exemple:

```text
26.60
53.36
29.00
06/09/2026 22:50:29
```

---

# Logs del servei

El servei utilitza el sistema de logs de systemd.

Per veure els logs:

```bash
journalctl -u estacio.service
```

Per veure'ls en temps real:

```bash
journalctl -u estacio.service -f
```

Per veure les últimes 100 línies:

```bash
journalctl -u estacio.service -n 100
```

Per veure els logs des de l'últim arrencament:

```bash
journalctl -u estacio.service -b
```

---

# Guardar els logs després d'un reinici

Per poder investigar errors encara que la Raspberry Pi es reiniciï, es pot activar l'emmagatzematge persistent dels logs de systemd.

Crear la carpeta:

```bash
sudo mkdir -p /var/log/journal
```

Editar:

```bash
sudo nano /etc/systemd/journald.conf
```

Buscar:

```text
#Storage=auto
```

I canviar-ho per:

```text
Storage=persistent
```

Després reiniciar el servei de journald:

```bash
sudo systemctl restart systemd-journald
```

A partir d'aquest moment, els logs es conservaran entre reinicis.

---

# Investigar un reinici inesperat

Si la Raspberry Pi es reinicia inesperadament, primer es pot consultar l'arrencada anterior.

Veure els últims missatges de l'arrencada anterior:

```bash
journalctl -b -1 -e
```

Veure només avisos:

```bash
journalctl -b -1 -p warning
```

Buscar problemes d'alimentació o voltatge:

```bash
journalctl -b -1 | grep -i -E "under-voltage|voltage|throttl|power"
```

Buscar problemes de temperatura:

```bash
journalctl -b -1 | grep -i -E "thermal|temperature|overheat"
```

Veure avisos del kernel:

```bash
journalctl -b -1 -k -p warning
```

Veure les últimes 100 línies del kernel:

```bash
journalctl -b -1 -k | tail -100
```

També es pot comprovar l'estat de throttling:

```bash
vcgencmd get_throttled
```

I la temperatura actual:

```bash
vcgencmd measure_temp
```

La informació de l'arrencada anterior només estarà disponible si els logs persistents estaven activats abans del reinici.

---

# Apagar la Raspberry Pi

Si s'està connectat per SSH, la Raspberry Pi es pot apagar de manera segura amb:

```bash
sudo poweroff
```

També es pot utilitzar:

```bash
sudo shutdown -h now
```

És preferible apagar-la així abans de desconnectar l'alimentació físicament.

---

# Solució de problemes

## El DHT11 no funciona

Comprovar:

* DATA està connectat al GPIO 2.
* GPIO 2 correspon al pin físic 3.
* VCC està connectat a 3.3 V.
* GND està connectat correctament.
* Hi ha una resistència pull-up si el mòdul no la incorpora.

També comprovar que les llibreries estiguin instal·lades:

```bash
source ~/dht-env/bin/activate
pip list
```

---

## El servei no funciona

Executar:

```bash
sudo systemctl status estacio.service
```

Després:

```bash
journalctl -u estacio.service -n 100
```

Això normalment mostrarà l'error que impedeix iniciar `temperatura.py`.

---

## El programa funciona manualment però no amb systemd

Comprovar els camins del servei:

```ini
User=pi
WorkingDirectory=/home/pi/pi-weather
ExecStart=/home/pi/dht-env/bin/python /home/pi/pi-weather/temperatura.py
```

També comprovar que el fitxer existeixi:

```bash
ls ~/pi-weather/temperatura.py
```

I que existeixi el Python de l'entorn virtual:

```bash
ls ~/dht-env/bin/python
```

---

## Git no fa push

Comprovar:

```bash
cd ~/pi-weather
git status
```

Provar:

```bash
git push
```

Comprovar que Git recorda les credencials:

```bash
git config --global --get credential.helper
```

Hauria de mostrar:

```text
store
```

Si torna a demanar el token, cal tornar a autenticar Git amb el Personal Access Token.

---

## La web no mostra dades

Comprovar des de la Raspberry:

```bash
cat pi.txt
```

I:

```bash
cat historial.csv
```

Comprovar també que els canvis hagin arribat a GitHub:

```bash
git status
```

Si s'han fet canvis però encara no s'han publicat:

```bash
git add .
git commit -m "Actualització de dades"
git push
```

Si el problema és només la memòria cau del navegador:

```text
Ctrl + Shift + R
```

---

## La gràfica no s'actualitza

La Raspberry actualitza les dades aproximadament cada minut, però només les publica a GitHub cada 5 minuts.

Per tant, una dada nova pot tardar fins a uns 5 minuts a arribar a GitHub.

Una vegada publicada, `script.js` la comprova cada 10 segons.

Comprovar també que `historial.csv` contingui una nova línia:

```bash
tail historial.csv
```

---

# Seguretat

No s'han de pujar mai al repositori:

* Personal Access Tokens.
* Contrasenyes.
* Claus privades.
* Credencials SSH.
* Altres secrets.

El token de GitHub està guardat localment a:

```text
~/.git-credentials
```

No s'ha de compartir aquest fitxer.

El token tampoc s'ha d'escriure dins de:

```text
temperatura.py
```

---

# Resum de la instal·lació

En una instal·lació nova, els passos principals són:

```bash
cd ~
git clone https://github.com/fustcoma/pi-weather.git
cd ~/pi-weather

python3 -m venv ~/dht-env
source ~/dht-env/bin/activate

pip install adafruit-blinka
pip install adafruit-circuitpython-dht

git config --global user.name "EL_TEU_USUARI"
git config --global user.email "EL_TEU_EMAIL"

git config --global credential.helper store

git push
```

Després crear:

```text
/etc/systemd/system/estacio.service
```

Amb:

```ini
[Unit]
Description=Estacio meteorologica DHT11
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/pi-weather
ExecStart=/home/pi/dht-env/bin/python /home/pi/pi-weather/temperatura.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

I activar-lo:

```bash
sudo systemctl daemon-reload
sudo systemctl start estacio.service
sudo systemctl enable estacio.service
```

Comprovar:

```bash
sudo systemctl status estacio.service
```

A partir d'aquí, la Raspberry Pi pot funcionar de manera autònoma.

---

# Arquitectura final

```text
                    DHT11
                      |
                      v
              Raspberry Pi Zero W
                      |
                      v
               temperatura.py
                      |
             +--------+--------+
             |                 |
             v                 v
          pi.txt        historial.csv
             |                 |
             +--------+--------+
                      |
                      v
                     Git
                      |
                 cada 5 minuts
                      |
                      v
                   GitHub
                      |
                      v
                GitHub Pages
                      |
             +--------+--------+
             |                 |
             v                 v
         index.html       script.js
                               |
                               v
                         Chart.js
                               |
                    +----------+----------+
                    |          |          |
                    v          v          v
              Temperatura   Humitat   Sensació
```

El servei `estacio.service` fa que tot el sistema de mesura s'iniciï automàticament quan la Raspberry Pi s'encén, mentre que GitHub Pages permet consultar les dades des de qualsevol dispositiu amb accés a Internet.

## Llicència

Aquest projecte està publicat sota la **llicència MIT**.

## Autor

Creat per **fustcoma**.