<!DOCTYPE html>
<html lang="ca">

<head>

    <meta charset="UTF-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >

    <title>Estació meteorològica</title>


    <!-- Chart.js -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>


    <style>

        body {

            font-family: Arial, sans-serif;

            text-align: center;

            padding: 40px 20px;

            margin: 0;

            background: #f5f5f5;
        }


        h1 {

            font-size: 40px;

            margin-bottom: 10px;
        }


        #actualitzacio {

            margin-bottom: 40px;

            color: #555;
        }


        .dades {

            display: flex;

            justify-content: center;

            gap: 30px;

            flex-wrap: wrap;

            margin-bottom: 50px;
        }


        .dada {

            width: 200px;

            padding: 25px;

            border-radius: 15px;

            background: white;

            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }


        .dada h2 {

            margin-bottom: 15px;

            font-size: 20px;
        }


        .valor {

            font-size: 35px;

            font-weight: bold;
        }


        .grafic-container {

            max-width: 1000px;

            margin: 30px auto;

            padding: 25px;

            background: white;

            border-radius: 15px;

            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }


        .grafic-container h2 {

            margin-top: 0;
        }

    </style>

</head>


<body>


    <h1>🌡️ Estació meteorològica</h1>

    <p id="actualitzacio">
        Carregant última actualització...
    </p>


    <!-- DADES ACTUALS -->

    <div class="dades">


        <div class="dada">

            <h2>🌡️ Temperatura</h2>

            <div
                class="valor"
                id="temperatura"
            >
                Carregant...
            </div>

        </div>


        <div class="dada">

            <h2>💧 Humitat</h2>

            <div
                class="valor"
                id="humitat"
            >
                Carregant...
            </div>

        </div>


        <div class="dada">

            <h2>🥵 Sensació tèrmica</h2>

            <div
                class="valor"
                id="sensacio"
            >
                Carregant...
            </div>

        </div>


    </div>


    <!-- TEMPERATURA -->

    <div class="grafic-container">

        <h2>🌡️ Historial de temperatura</h2>

        <canvas id="graficaTemperatura"></canvas>

    </div>


    <!-- HUMITAT -->

    <div class="grafic-container">

        <h2>💧 Historial d'humitat</h2>

        <canvas id="graficaHumitat"></canvas>

    </div>


    <!-- SENSACIÓ -->

    <div class="grafic-container">

        <h2>🥵 Historial de sensació tèrmica</h2>

        <canvas id="graficaSensacio"></canvas>

    </div>


    <script src="script.js"></script>

</body>

</html>