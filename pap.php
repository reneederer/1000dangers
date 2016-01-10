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
        <!--script src="papelement.js"></script>
        <script src="papconnection.js"></script-->
        <script src="qunit.js"></script>
        <script src="pap.js"></script>
        <style>
            .contextMenu { position:absolute;}
            .contextMenu .field {
                width:300px; background:#EC6603; color:#fff; padding:5px; border:none; cursor:pointer;
                font-family:'lucida sans unicode',sans-serif; font-size:1em;
                border:solid 1px #EC6603;
                -webkit-transition: all .4s ease-in-out;
                transition: all .4s ease-in-out;
            }
            .contextMenu .field:hover {
                border:solid 1px #fff;
                -moz-box-shadow:0 0 5px #999; -webkit-box-shadow:0 0 5px #999; box-shadow:0 0 5px #999
            }
            .contextMenu>ul.list {
                position:absolute; left:30px; top:-30px; z-index:999;
                width:300px;
                margin:0; padding:10px; list-style:none;
                background:#fff; color:#333;
                -moz-border-radius:5px; -webkit-border-radius:5px; border-radius:5px;
                -moz-box-shadow:0 0 5px #999; -webkit-box-shadow:0 0 5px #999; box-shadow:0 0 5px #999
            }
            .contextMenu>ul.list li {
                padding:10px;
                border-bottom: solid 1px #ccc;
                font-size:25px;
            }
            .contextMenu>ul.list li:hover {
                background:#EC6603; color:#fff;
            }
            .contextMenu>ul.list li:last-child { border:none }
        </style>
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

        <div id="canvasContextMenu" class="contextMenu">
            <ul class="list">
                <li>Start</li>
                <li>Aktion</li>
                <li>Bedingung</li>
                <li>Ende</li>
            </ul>
        </div>
        <div id="elementContextMenu" class="contextMenu">
            <ul class="list">
                <li>L&ouml;schen</li>
                <li>Text &auml;ndern</li>
            </ul>
        </div>
        <div id="messageDiv" style="position:fixed; left:0; bottom:0; background-color:white;"></div>
    </body>
</html>

















