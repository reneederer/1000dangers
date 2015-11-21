var dragCanvas = {canvas: null, x: 0, y: 0};
var dragLine = {startCanvas: null, x:0, y: 0, endCanvas: null, endX:0, endY: 0};

$(function()
        {
            var lineDiv = $("#lineDiv")[0];
            lineDiv.style.width = document.body.clientWidth;
            lineDiv.style.height = document.body.clientHeight;
            
            var dragLineCanvas = $("#dragLineCanvas")[0];
            dragLineCanvas.width = parseInt(document.body.clientWidth);
            dragLineCanvas.height = parseInt(document.body.clientHeight);
            dragLineCanvas.style.width = document.body.clientWidth;
            dragLineCanvas.style.height = document.body.clientHeight;

            lineDiv.addLine = function(line)
            {
                var lineCanvas = $("<canvas style='position: absolute;z-index:0;'></canvas>")[0]; 
                $(this).append(lineCanvas);
                lineCanvas.style.left = 0;
                lineCanvas.style.top = 0;
                lineCanvas.width = document.body.clientWidth;
                lineCanvas.height = document.body.clientHeight;
                lineCanvas.style.width = document.body.clientWidth;
                lineCanvas.style.height = document.body.clientHeight;
                lineCanvas.line = line;
            }



            lineDiv.paint = function(affectedCanvas)
            {
                var lineCanvases = $("#lineDiv").children();
                lineCanvases.each(function(index, currentLineCanvas)
                {
                    if(affectedCanvas == currentLineCanvas.line.startCanvas || affectedCanvas == currentLineCanvas.line.endCanvas)
                    {
                        var lineCtx = currentLineCanvas.getContext("2d");
                        lineCtx.strokeStyle = 'rgba(0,0,0, 1)';
                        lineCtx.clearRect(0, 0, currentLineCanvas.width, currentLineCanvas.height);
                        lineCtx.beginPath();
                        lineCtx.moveTo(parseInt(currentLineCanvas.line.startCanvas.style.left), parseInt(currentLineCanvas.line.startCanvas.style.top));
                        lineCtx.lineTo(parseInt(currentLineCanvas.line.endCanvas.style.left), parseInt(currentLineCanvas.line.endCanvas.style.top));
                        lineCtx.closePath();
                        lineCtx.stroke();
                    }
                });
            }

            $.post("test.php",
                    {
                        action: "load"
                    },
                    function(data,status)
                    {
                        var papElements = JSON.parse(data);
                        for(var el in papElements)
                        {
                            createPapElement(papElements[el]);
                        }
                    });

            $(window).on('unload', function()
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

    $("#mytext").mousedown(function(e)
    {
        e.stopPropagation();
    });

    $(document).mouseup(function(){
        if(dragLine.startCanvas != null && dragLine.endCanvas != null)
        {
            $("#lineDiv")[0].addLine(dragLine);
            $("#lineDiv")[0].paint(dragLine.startCanvas);
        }
        dragCanvas = {canvas: null, x: 0, y: 0};
        dragLine = {startCanvas: null, x:0, y: 0, endCanvas: null, endX:0, endY: 0};
                var lineCtx = $("#dragLineCanvas")[0].getContext("2d");
                lineCtx.clearRect(0, 0,$("#dragLineCanvas")[0].width,$("#dragLineCanvas")[0].height);
                lineCtx.beginPath();
                lineCtx.closePath();
                lineCtx.stroke();
    }).mousemove(function(e) {
        if(dragCanvas.canvas != null)
        {
            dragCanvas.canvas.style.left = e.pageX - dragCanvas.x; 
            dragCanvas.canvas.style.top = e.pageY - dragCanvas.y;
            $("#lineDiv")[0].paint(dragCanvas.canvas);
            return;
        }
        if(dragLine.startCanvas != null)
        {
                var lineCtx = $("#dragLineCanvas")[0].getContext("2d");
                lineCtx.clearRect(0, 0,$("#dragLineCanvas")[0].width,$("#dragLineCanvas")[0].height);
                lineCtx.beginPath();
                lineCtx.moveTo(dragLine.x, dragLine.y);
                lineCtx.lineTo(e.pageX, e.pageY);
                lineCtx.closePath();
                lineCtx.stroke();
        }

    }).mousedown(function()
    {
     //   ("#right").animate({width: "toggle" });
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


function createPapElement(elementData)
{
    var textTypes = 
    {
        START: 1,
        END: 2,
        //TODO ACTION is a better name than STORY
        STORY: 3,
        CONDITION: 4
    };
    var closeToEdgeThreshold = 15;

    var canvas = $("<canvas id='canvas" + elementData.id + "' style='position: absolute; z-index: " + elementData.id + ";'></canvas>")[0]; 

    //it is necessary to append the canvas immediately to a div to get the correct font size
    $("#main").append(canvas);

    // canvas size is unknown, set it to client size for measuring the text size
    canvas.width = document.body.clientWidth;
    canvas.height = document.body.clientHeight;

    canvas.font =  "1em arial";
    var ctx = canvas.getContext("2d");
    ctx.font = canvas.font;
    ctx.font = canvas.font;
    var fontSize = parseInt(ctx.font);
    var textWidth = ctx.measureText(elementData.title);
    var lineWidthBuffer = 15;


    canvas.padding = {left:18, bottom:18};
    var rect  = 
    {
        width: textWidth.width + 2*canvas.padding.left,
        height: fontSize + 2*canvas.padding.bottom
    };

    if(elementData.type == textTypes.CONDITION)
    {
        rect.width *=1.4;
        rect.height*=1.4;
    }

    // set final canvas size
    canvas.width = rect.width + 2*lineWidthBuffer;
    canvas.height = rect.height + 2 * lineWidthBuffer;

    canvas.style.width = canvas.width;
    canvas.style.height = canvas.height;
    canvas.style.left = elementData.x;
    canvas.style.top = elementData.y;


    var ctx = canvas.getContext("2d");
    ctx.strokeStyle = 'rgba(0,0,0, 1)';
    ctx.font = canvas.font;
    var paintPolygon = function()
            {
                ctx.beginPath();
                ctx.moveTo(canvas.points[0].x, canvas.points[0].y);
                for(var i = 0; i < canvas.points.length; ++i)
                {
                    ctx.lineTo(canvas.points[i].x, canvas.points[i].y);
                }
                ctx.fillText(canvas.content.title, canvas.content.x, canvas.content.y);
                ctx.closePath();
                ctx.stroke();
            };

    var nearestPointToPolygon = function(x, y)
        {
            var mymin = function(a, b)
            {
                if(Math.min(a.d, b.d) == a.d) return a;
                else return b;
            }

            var di = mymin(distance(x - parseInt(canvas.style.left),
                y - parseInt(canvas.style.top),
                canvas.points[0].x, 
                canvas.points[0].y, 
                canvas.points[1].x, 
                canvas.points[1].y),
                mymin(distance(x - parseInt(canvas.style.left),
                    y - parseInt(canvas.style.top),
                    canvas.points[1].x, 
                    canvas.points[1].y, 
                    canvas.points[2].x, 
                    canvas.points[2].y),
                mymin(distance(x - parseInt(canvas.style.left),
                    y - parseInt(canvas.style.top),
                    canvas.points[2].x, 
                    canvas.points[2].y, 
                    canvas.points[3].x, 
                    canvas.points[3].y),distance(x - parseInt(canvas.style.left),
                    y - parseInt(canvas.style.top),
                    canvas.points[3].x, 
                    canvas.points[3].y, 
                    canvas.points[0].x, 
                    canvas.points[0].y)
                )));
            return di;
        }

    canvas.text = elementData.text;
    if(elementData.type == textTypes.CONDITION)
    {
        canvas.points = Array();
        canvas.points[0] = {x: lineWidthBuffer, y: lineWidthBuffer + rect.height/2};
        canvas.points[1] = {x: lineWidthBuffer + rect.width/2, y: lineWidthBuffer};
        canvas.points[2] = {x: lineWidthBuffer + rect.width, y: lineWidthBuffer + rect.height/2};
        canvas.points[3] = {x: lineWidthBuffer+ rect.width/2, y: lineWidthBuffer + rect.height};
        canvas.content = {text: "", title: elementData.title, x:lineWidthBuffer +rect.width/2 - textWidth.width/2, y:lineWidthBuffer+ rect.height/2 + fontSize/2 - 0.2*fontSize};
        canvas.paint = paintPolygon;
        canvas.nearestPoint = nearestPointToPolygon;
    }
    else if(elementData.type == textTypes.STORY || elementData.type == textTypes.START || elementData.type == textTypes.END)
    {
        canvas.points = Array();
        canvas.points[0] = {x: lineWidthBuffer, y: lineWidthBuffer};
        canvas.points[1] = {x: lineWidthBuffer + rect.width, y: lineWidthBuffer};
        canvas.points[2] = {x: lineWidthBuffer + rect.width, y: lineWidthBuffer + rect.height};
        canvas.points[3] = {x: lineWidthBuffer, y: lineWidthBuffer + rect.height};
        canvas.content = {text: "", title: elementData.title, x:lineWidthBuffer + canvas.padding.left, y:lineWidthBuffer + rect.height - canvas.padding.bottom - 0.2*fontSize}
        canvas.paint = paintPolygon;
        canvas.nearestPoint = nearestPointToPolygon;
    }
    else if(elementData.type == textTypes.START || elementData.type == textTypes.END)
    {
//        var roundedCornerBegin = Math.min(canvas.padding.left, canvas.padding.right);
//        canvas.points = Array();
//        canvas.points[0] = {x: , y: };
//        canvas.points[0] = 
//        canvas.points[0] = 
//        canvas.points[0] = 
//        canvas.points[0] = 
//        canvas.points[0] = 
//        canvas.points[0] = 
//        canvas.points[0] = 
//        
//        var ctx = $("#lineDiv")[0].getContext("2d");
//        ctx.beginPath();
//        ctx.moveTo(x + roundedCornerBegin, y);
//        ctx.lineTo(x + width - roundedCornerBegin, y);
//        ctx.arc(x + width - roundedCornerBegin, y + roundedCornerBegin, roundedCornerBegin, 1.5 * Math.PI, 2*Math.PI);
//
//
//
//        ctx.moveTo(x + width, y + roundedCornerBegin);
//        ctx.lineTo(x + width, y + height - roundedCornerBegin);
//        ctx.arc(x + width - roundedCornerBegin, y + height - roundedCornerBegin, roundedCornerBegin, 0, 0.5*Math.PI);
//        ctx.moveTo(x + width - roundedCornerBegin, y + height);
//        ctx.lineTo(x + roundedCornerBegin, y + height);
//        ctx.arc(x + roundedCornerBegin, y + height - roundedCornerBegin, roundedCornerBegin, 0.5*Math.PI, 1*Math.PI);
//        ctx.moveTo(x, y + height - roundedCornerBegin);
//        ctx.lineTo(x, y + roundedCornerBegin);
//        ctx.arc(x + roundedCornerBegin, y + roundedCornerBegin, roundedCornerBegin, 1*Math.PI, 1.5*Math.PI);
//        ctx.closePath();
//        ctx.stroke();
    }
    $("#canvas" + elementData.id)
        .mousedown(function(e) {
            //TODO make this element the topmost element
            var di = canvas.nearestPoint(e.pageX, e.pageY);

            if(di.d > closeToEdgeThreshold)
            {
                dragCanvas.canvas = $(this)[0];
                dragCanvas.x = e.pageX - parseInt($(this)[0].style.left);
                dragCanvas.y = e.pageY - parseInt($(this)[0].style.top);
            }
            else
            {
                dragLine.startCanvas = $(this)[0];
                dragLine.x = parseInt($(this)[0].style.left) + di.x;
                dragLine.y = parseInt($(this)[0].style.top) + di.y;
                dragLine.endX = parseInt($(this)[0].style.left) + di.x;
                dragLine.endY = parseInt($(this)[0].style.top) + di.y;
            }
        })

    .mouseup(function() {
        dragCanvas.canvas = null;

    }).mousemove(function(e)
        {

                    if(dragCanvas.canvas != null)
                    {
                        dragCanvas.canvas.style.left = e.pageX - dragCanvas.x; 
                        dragCanvas.canvas.style.top = e.pageY - dragCanvas.y;
                        $("#lineDiv")[0].paint();
                    }
            var di = canvas.nearestPoint(e.pageX, e.pageY);
            
            var pointCtx = $("#point")[0].getContext("2d");;
            if(di.d <= closeToEdgeThreshold || dragLine.startCanvas != null)
            {
                pointCtx.beginPath();
                pointCtx.arc(3, 3,3,0,2*Math.PI);
                pointCtx.stroke();
                $("#point")[0].style.left = di.x + parseInt($(this)[0].style.left) - 3;
                $("#point")[0].style.top = di.y + parseInt($(this)[0].style.top) - 3;
                dragLine.endCanvas = $(this)[0];
                dragLine.isEndSet = false;
                if(dragLine.endCanvas != dragLine.startCanvas)
                {
                    dragLine.isEndSet = true;
                    dragLine.endX = parseInt($("#point")[0].style.left);
                    dragLine.endY = parseInt($("#point")[0].style.top);
                }
            }
            else
            {
                dragLine.isEndSet = false;
                pointCtx.clearRect(0, 0, 1001, 1001);
                pointCtx.beginPath();
            }
        }).mouseout(function()
        {
            $("#point")[0].style.left = -$("#point")[0].width;
            dragLine.endCanvas = null;
            dragLine.isEndSet = false;
        }).dblclick(function()
            {
                $("#right")[0].style.display = "inline";
                $("#mytext")[0].focus();
            });


        canvas.paint();


}






