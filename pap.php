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
    <body onresize='draw(20, 20, 1, "adfsjkasld;f")"'>
        <canvas id="main"></canvas>
        <div id="papitems">
        </div>
<script type="text/javascript">
var textTypes = 
{
    CONDITION: 1,
    STORY: 2
};
var c = document.getElementById("main");
c.width = document.body.clientWidth;
c.height = document.body.clientHeight;
var ctx = c.getContext("2d");
var d = document.getElementById("papitems");

draw(480, 20, textTypes.STORY, "dfkasld;gggg;");
draw(480, 130, textTypes.CONDITION, "Was essen?");
ctx.stroke();
function draw(x, y, type, name)
{
    var padding = 
    {
        LEFT:  28,
        RIGHT: 28,
        TOP:   28,
        BOTTOM:28
    }
    
    ctx.font = d.style.font;
    ctx.font = "1em arial";
    fontSize = parseInt(ctx.font);
    var metrics = ctx.measureText(name);
    var width = metrics.width*2 + padding.LEFT + padding.RIGHT;
    var height = fontSize + padding.TOP + padding.BOTTOM;
    if(type == textTypes.CONDITION)
    {
        height *= 1.20;
        ctx.moveTo(x, y + height/2);
        ctx.lineTo(x + width/2, y);
        ctx.lineTo(x + width, y + height/2);
        ctx.lineTo(x + width/2, y + height);
        ctx.lineTo(x, y + height/2);
        ctx.fillText(name, x + metrics.width / 2 + padding.LEFT, y + height/2 + fontSize/2 - 0.2*fontSize);
    }
    else if(type == textTypes.STORY)
    {
        ctx.rect(x, y, width, height);
        ctx.fillText(name, x + metrics.width/2 + padding.LEFT, y + height - 0.20*fontSize - padding.BOTTOM);
    }
}
</script>
    </body>
</html>
