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
        <script src="qunit.js"></script>
        <script>
            function smallerThan7(x)
            {
                return x < 7;
            }
        </script>
        <script>
QUnit.test("Testet smallerThanSeven!!", function(assert)
{
    assert.ok(smallerThan7(3) == true, "Passed");
    assert.ok(smallerThan7(8) == false, "Passed");
    assert.ok(smallerThan7(6) == true, "Passed");
    assert.ok(smallerThan7(5) == true, "Passed");
});
        </script>
    </head>
    <body onload="init();" oncontextmenu="return false;" style="width:10000px; height:10000px">
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
                <li>Verbinden</li>
                <li>L&ouml;schen</li>
                <li>&Auml;ndern</li>
            </ul>
        </div>
    </body>
</html>




