<html>
    <head>
        <title>PAP</title>
        <style>
            .right {
                position: absolute;
                right: 0px;
                width: 43%;
                height: 100%;
                border:3px solid #73AD21;
                background-color: #234244;
            }
.twrap
{
    overflow: hidden;
}
textarea {
    width: 100%;
    height: 100%;
    z-index: 0;
}

        </style>
    </head>
    <body>
        <div id="papitems"></div>
        <div id="main"></div>
        <div id="right" class="right" style="display: none;">
            <div class="twrap">
            <textarea id="mytext" name="mytext" cols="50" rows="10"></textarea>
            </div>
        </div>
        <canvas id="point" width="100" height="100" style="position:absolute; top:10; left:60; width:60, height:60;"></canvas>
        <canvas id="line" width="1001" height="1001" style="position:absolute; top:0; left:0; width:1001, height:1001;"></canvas>
        <script src="jquery.js"></script>
        <script src="javascript.js"></script>
    </body>
</html>
