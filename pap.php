<?php
    session_start();
    if(!isset($_SESSION['team_id']))
    {
        header('Location: login.php');
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
    <body onload="init();">
        <div id="qunit"></div>
        <div id="qunit-fixture"></div>
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
