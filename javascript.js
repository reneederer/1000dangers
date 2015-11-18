var textTypes = 
{
    START: 1,
    END: 2,
    STORY: 3,
    CONDITION: 4
};

var dragCanvas = {canvas: null, x: 0, y: 0};
var dragLine = {startCanvas: null, x:0, y: 0};

$(function()
        {
            $.post("test.php",
                    {
                        action: "load"
                    },
                    function(data,status)
                    {
                        var papElements = JSON.parse(data);
                        for(var el in papElements)
                        {
                            createNewPapElement(papElements[el]);
                        }
                    });

            $(window).on('beforeunload', function()
                    {
                        $.post("test.php",
                                {
                                    action: "save",
                                    //TODO
                                    papElements: ""
                                },
                                function(data, status){
                                });
                    });
        });




function distance(x, y, x1, y1, x2, y2) {

    var A = x - x1;
    var B = y - y1;
    var C = x2 - x1;
    var D = y2 - y1;

    var dotProduct = A * C + B * D;
    var len_sq = C * C + D * D;
    var param = -1;
    if (len_sq != 0) //in case of 0 length line
        param = dotProduct / len_sq;

    var nearest = {x: 0, y: 0}

    if (param < 0) {
        nearest.x = x1;
        nearest.y = y1;
    }
    else if (param > 1) {
        nearest.x = x2;
        nearest.y = y2;
    }
    else {
        nearest.x = x1 + param * C;
        nearest.y = y1 + param * D;
    }

    var dx = x - nearest.x;
    var dy = y - nearest.y;
    return {x: nearest.x, y: nearest.y, d: Math.sqrt(dx * dx + dy * dy)}; 
}




function createNewPapElement(elementData)
{
    $("#main").append("<canvas id='canvas" + elementData.id + "' style='position: absolute; z-index: " + elementData.id + ";'></canvas>"); 
    var canvas = $("#canvas" + elementData.id)[0];

    // canvas.width is unknown, set it to clientWidth for measuring the text size
    canvas.width = document.body.clientWidth;
    canvas.height = document.body.clientHeight;

    var ctx = canvas.getContext("2d");
    ctx.font = "1em arial";
    fontSize = parseInt(ctx.font);

    var textWidth = ctx.measureText(elementData.title);

    var padding = 
    {
        LEFT:  38,
        BOTTOM: 38
    }

    var lineWidthBuffer = 10;


    var rect =
    {
        width: textWidth.width + 2*padding.LEFT,
        height: fontSize + 2*padding.BOTTOM
    }

    // set final canvas resolution
    canvas.width = rect.width + 2*lineWidthBuffer;
    canvas.height = rect.height + 2 * lineWidthBuffer;
    canvas.style.width = canvas.width;
    canvas.style.height = canvas.height;
    canvas.style.left = elementData.x;
    canvas.style.top = elementData.y;

    ctx = canvas.getContext("2d");
    ctx.font = "1em arial";

    $(document).mouseup(function(){
        dragCanvas.canvas = null;
        var lineCtx = $("#line")[0].getContext("2d");
        lineCtx.clearRect(0, 0, 1001, 1001);
        lineCtx.beginPath();
        dragLine.startCanvas = null;
    }).mousemove(function(e) {
        if(dragCanvas.canvas != null)
        {
            dragCanvas.canvas.style.left = e.pageX - dragCanvas.x; 
            dragCanvas.canvas.style.top = e.pageY - dragCanvas.y;
        }
        if(dragLine.startCanvas != null)
        {
                var lineCtx = $("#line")[0].getContext("2d");
                lineCtx.clearRect(0, 0,$("#line")[0].width,$("#line")[0].height);
                lineCtx.beginPath();
                lineCtx.moveTo(dragLine.x, dragLine.y);
                lineCtx.lineTo(e.pageX, e.pageY);
                lineCtx.stroke();
        }

    }).mousedown(function()
    {
        $("#right")[0].style.display = "none";
    });
    $("#mytext").mousedown(function(evt)
    {
        evt.stopPropagation();
    });
    $("#canvas" + elementData.id)
        .mousedown(function(e) {
            //TODO make this element the topmost element
            var mymin = function(a, b)
            {
                if(Math.min(a.d, b.d) == a.d) return a;
                else return b;
            }

            var di = mymin(distance(e.pageX - parseInt($(this)[0].style.left),
                e.pageY - parseInt($(this)[0].style.top),
                $(this)[0].rect.a.x, 
                $(this)[0].rect.a.y, 
                $(this)[0].rect.b.x, 
                $(this)[0].rect.b.y),
                mymin(distance(e.pageX - parseInt($(this)[0].style.left),
                    e.pageY - parseInt($(this)[0].style.top),
                    $(this)[0].rect.b.x, 
                    $(this)[0].rect.b.y, 
                    $(this)[0].rect.c.x, 
                    $(this)[0].rect.c.y),
                mymin(distance(e.pageX - parseInt($(this)[0].style.left),
                    e.pageY - parseInt($(this)[0].style.top),
                    $(this)[0].rect.c.x, 
                    $(this)[0].rect.c.y, 
                    $(this)[0].rect.d.x, 
                    $(this)[0].rect.d.y),distance(e.pageX - parseInt($(this)[0].style.left),
                    e.pageY - parseInt($(this)[0].style.top),
                    $(this)[0].rect.d.x, 
                    $(this)[0].rect.d.y, 
                    $(this)[0].rect.a.x, 
                    $(this)[0].rect.a.y)
                )));
            if(di.d > 32)
            {
            dragCanvas.canvas = $(this)[0];
            dragCanvas.x = e.pageX - parseInt($(this)[0].style.left);
            dragCanvas.y = e.pageY - parseInt($(this)[0].style.top);
            }
            else{

            dragLine.startCanvas = $(this)[0];
            dragLine.x = parseInt($(this)[0].style.left) + di.x;
            dragLine.y = parseInt($(this)[0].style.top) + di.y;
            }
        })

    .mouseup(function() {
        $(this)[0].style.cursor = "default";
        $('[data-toggle="dfsajkl;"]').tooltip(); 
        dragCanvas.canvas = null;

    }).mousemove(function(e)
        {
            var mymin = function(a, b)
            {
                if(Math.min(a.d, b.d) == a.d) return a;
                else return b;
            }

            var di = mymin(distance(e.pageX - parseInt($(this)[0].style.left),
                e.pageY - parseInt($(this)[0].style.top),
                $(this)[0].rect.a.x, 
                $(this)[0].rect.a.y, 
                $(this)[0].rect.b.x, 
                $(this)[0].rect.b.y),
                mymin(distance(e.pageX - parseInt($(this)[0].style.left),
                    e.pageY - parseInt($(this)[0].style.top),
                    $(this)[0].rect.b.x, 
                    $(this)[0].rect.b.y, 
                    $(this)[0].rect.c.x, 
                    $(this)[0].rect.c.y),
                mymin(distance(e.pageX - parseInt($(this)[0].style.left),
                    e.pageY - parseInt($(this)[0].style.top),
                    $(this)[0].rect.c.x, 
                    $(this)[0].rect.c.y, 
                    $(this)[0].rect.d.x, 
                    $(this)[0].rect.d.y),distance(e.pageX - parseInt($(this)[0].style.left),
                    e.pageY - parseInt($(this)[0].style.top),
                    $(this)[0].rect.d.x, 
                    $(this)[0].rect.d.y, 
                    $(this)[0].rect.a.x, 
                    $(this)[0].rect.a.y)
                )));

            
            var pointCtx = $("#point")[0].getContext("2d");;
            if(di.d <= 32)
            {
                $(this)[0].style.cursor = "default";
                pointCtx.beginPath();
                pointCtx.arc(3, 3,3,0,2*Math.PI);
                pointCtx.stroke();
                $("#point")[0].style.left = di.x + parseInt($(this)[0].style.left) - 3;
                $("#point")[0].style.top = di.y + parseInt($(this)[0].style.top) - 3;
            }
            else
            {
                $(this)[0].style.cursor = "all-scroll";
                pointCtx.clearRect(0, 0, 1001, 1001);
                pointCtx.beginPath();
            }
        }).mouseout(function()
        {
            $(this)[0].style.cursor = "default";
            $("#point")[0].style.left = -$("#point")[0].width;
        }).dblclick(function()
            {
                $("#right")[0].style.display = "inline";
                $("#mytext")[0].focus();
            });

    ctx.fillStyle="rgba(0, 0, 200, 0)";
    ctx.fill();

    ctx.strokeStyle = 'rgba(0,0,0, 1)';
    ctx.fillStyle="rgba(0, 0, 0, 1)";

    if(elementData.type == textTypes.CONDITION)
    {
        canvas.rect = {
            a: {x: lineWidthBuffer, y: lineWidthBuffer + rect.height/2},
            b: {x: lineWidthBuffer + rect.width/2, y: lineWidthBuffer},
            c: {x: lineWidthBuffer + rect.width, y: lineWidthBuffer + rect.height/2},
            d: {x: lineWidthBuffer+ rect.width/2, y: lineWidthBuffer + rect.height}
        }
        ctx.moveTo(canvas.rect.a.x, canvas.rect.a.y);
        ctx.lineTo(canvas.rect.b.x, canvas.rect.b.y);
        ctx.lineTo(canvas.rect.c.x, canvas.rect.c.y);
        ctx.lineTo(canvas.rect.d.x, canvas.rect.d.y);
        ctx.lineTo(canvas.rect.a.x, canvas.rect.a.y);
        ctx.fillText(elementData.title, lineWidthBuffer + padding.LEFT, lineWidthBuffer+ rect.height/2 + fontSize/2 - 0.2*fontSize);
    }
    else if(elementData.type == textTypes.STORY || elementData.type == textTypes.END || elementData.type == textTypes.START)
    {
        canvas.rect = {
            a: {x: lineWidthBuffer, y: lineWidthBuffer},
            b: {x: lineWidthBuffer + rect.width, y: lineWidthBuffer},
            c: {x: lineWidthBuffer + rect.width, y: lineWidthBuffer + rect.height},
            d: {x: lineWidthBuffer, y: lineWidthBuffer + rect.height}
        }
        ctx.rect(lineWidthBuffer,lineWidthBuffer, rect.width, rect.height);
        ctx.fillText(elementData.title, lineWidthBuffer + padding.LEFT, lineWidthBuffer+ rect.height - 0.20*fontSize - padding.BOTTOM);
    }
    ctx.stroke();
}


