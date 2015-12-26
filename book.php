<?php
    session_start();
    if(!isset($_SESSION['team_id']))
    {
//        header('Location: login.php');
    }

?>
<html>
    <head>
        <title>PAP</title>
        <link rel="stylesheet" href="qunit.css"></link>
        <script src="https://code.createjs.com/easeljs-0.8.1.min.js"></script>
        <script src="pap.js"></script>
        <script src="jquery.js"></script>
    </head>
    <body onload="init();" style="width:10000px; height:10000px">
        <canvas id="canvas"></canvas>
        <div id="textDiv" style="position:fixed; right:0; top:0; width:500; height: 500; background-color: 00ffdd;">
            <input type="text" id="papTitle"></input>
            <textarea id="papText" rows="5" cols="6" style="width:100%; height:100%; vertical-align:top; display:block;"></textarea>
        </div>
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









