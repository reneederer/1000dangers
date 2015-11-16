var textTypes = 
{
    START: 1,
    END: 2,
    STORY: 3,
    CONDITION: 4
};

var dragCanvas = {canvas: null, x: 0, y: 0};

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

    var dot = A * C + B * D;
    var len_sq = C * C + D * D;
    var param = -1;
    if (len_sq != 0) //in case of 0 length line
        param = dot / len_sq;

    var xx, yy;

    if (param < 0) {
        xx = x1;
        yy = y1;
    }
    else if (param > 1) {
        xx = x2;
        yy = y2;
    }
    else {
        xx = x1 + param * C;
        yy = y1 + param * D;
    }

    var dx = x - xx;
    var dy = y - yy;
    return Math.sqrt(dx * dx + dy * dy);
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
    }).mousemove(function(e) {
        if(dragCanvas.canvas != null)
        {
            dragCanvas.canvas.style.left = e.pageX - dragCanvas.x; 
            dragCanvas.canvas.style.top = e.pageY - dragCanvas.y;
        }

    })
    $("#canvas" + elementData.id)
        .mousedown(function(e) {
            //TODO make this element the topmost element
            dragCanvas.canvas = $(this)[0];
            dragCanvas.x = e.pageX - parseInt($(this)[0].style.left);
            dragCanvas.y = e.pageY - parseInt($(this)[0].style.top);
        })

    .mouseup(function() {
        dragCanvas.canvas = null;
    }).mouseover(function(e)
        {
            x = e.pageX - parseInt($(this)[0].style.left);
            y = e.pageY - parseInt($(this)[0].style.top);
            if(x < 2*lineWidthBuffer ||
               x - parseInt($(this)[0].style.width) < 2*lineWidthBuffer ||
               y < 2*lineWidthBuffer || 
               y - parseInt($(this)[0].style.height) < 2*lineWidthBuffer)

            {
                var ctx = $(this)[0].getContext("2d");
                ctx.rect(x, y, 3, 3);
                ctx.stroke();
            }


        }).mouseout(function()
            {

                //$(this)[0].style.backgroundColor = "yellow";


            }).dblclick(function(e)
        {
            var d = Math.min(distance(e.pageX - parseInt($(this)[0].style.left),
                    e.pageY - parseInt($(this)[0].style.top),
                    $(this)[0].rect.a.x, 
                    $(this)[0].rect.a.y, 
                    $(this)[0].rect.b.x, 
                    $(this)[0].rect.b.y),
                    distance(e.pageX - parseInt($(this)[0].style.left),
                        e.pageY - parseInt($(this)[0].style.top),
                        $(this)[0].rect.b.x, 
                        $(this)[0].rect.b.y, 
                        $(this)[0].rect.c.x, 
                        $(this)[0].rect.c.y),distance(e.pageX - parseInt($(this)[0].style.left),
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
                            );
            alert(d);
                //alert(e.pageX + ", " + $(this)[0].style.left);
            
















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


