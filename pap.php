<html>
    <head>
        <title>PAP</title>
        <script src="https://code.createjs.com/easeljs-0.8.1.min.js"></script>
        <script src="pap.js"></script>
        <script src="jquery.js"></script>
    </head>
    <body onload="init();">
        <canvas id="canvas"></canvas>
        <div id="textDiv" style="position:absolute; right:0; top:0; width:500; height: 500; display:none; background-color: 00ffdd;"></div>
        <div id="contextMenu" style="position:absolute; display:none; background-color: 00ffdd;">
            <ul>
                <li>Verbinden</li>
<!-- TODO oe aendern -->
                <li>Loeschen</li>
                <li>Aendern</li>
            </ul>
        </div>
    </body>
</html>
