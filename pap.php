<html>
    <head>
        <title>PAP</title>
        <style>
            #main {
                float: left;
                width: 70%;
                height: 100%;
                border:3px solid #132221;
                padding: 10px;
            }
            #papitems {
                float: left;
                width: 20%;
                height: 100%;
                border:3px solid #73AD21;
                padding: 10px;
            }
        </style>
    </head>
    <body>
        <div id="main" style="background-color: yellow;"></div>
        <div id="papitems">
        </div>
        <form id="book">
            <input type="hidden" name="elements[]" />
        </form>
        <canvas id="throbble"></canvas>
        <script src="jquery.js"></script>
        <script src="javascript.js"></script>

    </body>
</html>
