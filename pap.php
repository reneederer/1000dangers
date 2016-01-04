<?php
    session_start();
    if(!isset($_SESSION['user_id']))
    {
        header('Location: login.php');
    }
    if(!isset($_SESSION['1000dangersbook_name']))
    {
        header('Location: welcome.php');
    }

?>
<html>
    <head>
        <title>PAP</title>
        <link rel="stylesheet" href="qunit.css"></link>
        <script src="https://code.createjs.com/easeljs-0.8.1.min.js"></script>
        <script src="pap.js"></script>
        <!--script src="papelement.js"></script>
        <script src="papconnection.js"></script-->
        <script src="jquery.js"></script>
        <script src="qunit.js"></script>
    </head>
    <body onload="dangerbook.init();" oncontextmenu="return false;" style="width:10000px; height:10000px">
        <div id="qunit"></div>
        <div id="qunit-fixture"></div>
        <div id="book" style="width:500; height:500; overflow-x:scroll; overflow-y:scroll;"></div>
        <canvas id="canvas"></canvas>
        <div id="textDiv" style="position:fixed; right:0; top:0; width:500; height: 500; background-color: 00ffdd;">
            <input type="text" id="papTitle"></input>
            <textarea id="papText" rows="5" cols="6" style="width:100%; height:100%; vertical-align:top; display:block;"></textarea>
        </div>
        <div id="contextMenu" style="position:absolute; display:none; background-color: 00ffdd;">
            <ul>
                <li>Neu</li>
            </ul>
        </div>
        <div id="elementContextMenu" style="position:absolute; display:none; background-color: 00ffdd;">
            <ul>
                <li>L&ouml;schen</li>
                <li>Text &auml;ndern</li>
            </ul>
        </div>
    </body>
</html>

















