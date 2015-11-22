var stage = null;
var connectionLine = null;

function init()
{
    var canvas = document.getElementById("canvas");
    canvas.width = document.body.clientWidth;
    canvas.height = document.body.clientHeight;
    document.body.style.width = document.body.clientWidth;
    document.body.style.height= document.body.clientHeight;
    stage = new createjs.Stage("canvas");
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
            connectionLine = new createjs.Shape();
            connectionLine.startContainer = null;
            connectionLine.startX = 0;
            connectionLine.startY = 0;
            stage.addChild(connectionLine);
        });

$(window).on('beforeunload', function()
    {
        var papElements = Array();
        for(var i = 0; i < stage.numChildren; ++i)
        {
            var currentContainer = stage.getChildAt(i);
            if(currentContainer.type) papElements.push({x:currentContainer.x, y:currentContainer.y, type:currentContainer.type, title:currentContainer.title, text:currentContainer.text});
        }
        if(papElements.length == 0)
        {
            return;
        }
        $.post("test.php",
            {
                action: "save",
                papElements: JSON.stringify(papElements)
            },
            function(data, status){
                if(data != ""){ alert(data);}
            });
    });
}




function createPapElement(elementData)
{
    var innerPadding = 15; 
    var dragPosition = {x:0, y:0};
    var text = new createjs.Text(elementData.title, "20px Arial", "#040000");
    var b = text.getBounds();
    var bounds = {};
    var borderSize = 30;
    bounds.width = b.width + 2*innerPadding + 2*borderSize;
    bounds.height = b.height + 2*innerPadding + 2*borderSize;

    var outer = 0;
    if(elementData.type == "Condition")
    {
        var innerS = {x:Math.cos(Math.PI/4) * (innerPadding), y:Math.sin(Math.PI/4) * (innerPadding)};
        var innerX = innerS.x + innerS.y;
        var innerY = innerS.x+innerS.y; 
        var t = innerS.x + innerS.y;
        bounds.width = b.width + 2*innerX;
        bounds.height = bounds.width;
        var outerS = {x:Math.cos(Math.PI/4) * (borderSize) , y:Math.sin(Math.PI/4) * (borderSize)};
        var outerX = outerS.x + outerS.y;
        var outerY = outerS.x + outerS.y;
        outer = outerX;
        bounds.width += 2*outerX;
        bounds.height = bounds.width;
    }

    text.x = bounds.width/2 - b.width/2;
    text.y =  bounds.height/2 - b.height/2;
    text.textBaseline = "top";

    var border = new createjs.Shape();
    var shape = new createjs.Shape();


    switch(elementData.type)
    {
        case "Start":
            // fall through
        case "End":
            border.graphics.setStrokeStyle(borderSize).beginStroke("#FFBBBB").beginFill("#FFBBBB").drawRoundRect(0, 0, bounds.width, bounds.height, 23);  
            shape.graphics.beginFill("#FF7777").drawRoundRect(borderSize/2, borderSize/2, bounds.width-borderSize, bounds.height-borderSize, 23);
            break;
        case "Action":
            border.graphics.setStrokeStyle(borderSize).beginStroke("#FFBBBB").beginFill("#FFBBBB").drawRect(0, 0, bounds.width, bounds.height, 23);  
            shape.graphics.beginFill("#FF7777").drawRect(borderSize/2, borderSize/2, bounds.width-borderSize, bounds.height-borderSize);
            break;
        case "Condition":
            border.graphics.beginFill("#FFBBBB").moveTo(0, bounds.height/2).lineTo(bounds.width/2, 0).lineTo(bounds.width, bounds.height/2).lineTo(bounds.width/2, bounds.height).lineTo(0, bounds.height/2);
            shape.graphics.beginFill("#FF7777").moveTo(outer, bounds.height/2).lineTo(bounds.width/2, outer).lineTo(bounds.width-outer, bounds.height/2).lineTo(bounds.width/2, bounds.height-outer).lineTo(outer, bounds.height/2);
      //      shape.graphics.beginFill("Brown").drawRect(bounds.width/2-b.width/2, bounds.height/2-b.height/2, b.width, b.height);
            break;
        default:
            throw "Type not found!";
    }


    var drawConnectionLine = function(endX, endY)
    {
        if(endX == connectionLine.startX && endY == connectionLine.startY)
        {
            endX += 2;
            endY += 2;
        }
        var length = 40;
        var angle = 20;
        var dx = endX - connectionLine.startX;
        var dy = endY - connectionLine.startY;
        var slope = dy/dx;
        if(endX < connectionLine.startX) angle = 180 - angle;
        var x1 = endX + length * Math.cos(-(180-angle) * (Math.PI/180) + Math.atan(slope));
        var y1 = endY + length * Math.sin(-(180-angle) * (Math.PI/180) + Math.atan(slope));
        var x2 = endX + length * Math.cos((180-angle) * (Math.PI/180) + Math.atan(slope));
        var y2 = endY + length * Math.sin((180-angle) * (Math.PI/180) + Math.atan(slope));
        connectionLine.graphics.clear();
        connectionLine.graphics.setStrokeStyle(4).beginStroke("Green").moveTo(connectionLine.startX, connectionLine.startY).lineTo(endX, endY);
        connectionLine.graphics.setStrokeStyle(4).beginStroke("Red").moveTo(endX, endY).lineTo(x1, y1);
        connectionLine.graphics.setStrokeStyle(4).beginStroke("Blue").moveTo(endX, endY).lineTo(x2, y2);
        stage.update();
    }


    var drawArrow = function(line)
    {
        var startX = parseFloat(line.startX) + parseFloat(line.startContainer.x);
        var startY = parseFloat(line.startY) + parseFloat(line.startContainer.y);
        var endX = parseFloat(line.endX) + parseFloat(line.endContainer.x);
        var endY = parseFloat(line.endY) + parseFloat(line.endContainer.y);
        var length = 40;
        var angle = 20;
        var dx = endX - startX;
        var dy = endY - startY;
        var slope = dy/dx;
        if(endX < startX) angle = 180 - angle;
        var x1 = endX + length * Math.cos(-(180-angle) * (Math.PI/180) + Math.atan(slope));
        var y1 = endY + length * Math.sin(-(180-angle) * (Math.PI/180) + Math.atan(slope));
        var x2 = endX + length * Math.cos((180-angle) * (Math.PI/180) + Math.atan(slope));
        var y2 = endY + length * Math.sin((180-angle) * (Math.PI/180) + Math.atan(slope));
        line.graphics.clear();
        line.graphics.setStrokeStyle(4).beginStroke("Green").moveTo(startX, startY).lineTo(endX, endY);
        line.graphics.setStrokeStyle(4).beginStroke("Red").moveTo(endX, endY).lineTo(x1, y1);
        line.graphics.setStrokeStyle(4).beginStroke("Blue").moveTo(endX, endY).lineTo(x2, y2);
        stage.update();
    }


    var container = new createjs.Container();
    container.x = elementData.x;
    container.y = elementData.y;
    container.setBounds(0, 0, bounds.width, bounds.height);
    container.addChild(border);
    container.addChild(shape);
    container.addChild(text);
    container.text = elementData.text;
    container.title = elementData.title;
    container.type = elementData.type;

    border.on("mousedown", function(evt){
        connectionLine.startContainer = border.parent;
        connectionLine.startX = evt.stageX;
        connectionLine.startY = evt.stageY;
        drawConnectionLine(evt.stageX, evt.stageY);
    });

    container.on("mousedown", function(evt){
        if(connectionLine.startContainer != null)
        {
            return;
        }
        if(evt.nativeEvent.button == 2) //right mouse button down
        {
            alert(container.getBounds().width);
            return;

            var contextMenu = document.getElementById("contextMenu");
            contextMenu.style.left = evt.stageX;;
            contextMenu.style.top = evt.stageY;
            contextMenu.style.display = "block";
        }
        else
        {
            dragPosition.x = evt.stageX - container.x;
            dragPosition.y = evt.stageY - container.y;
        }
    });
    document.addEventListener('contextmenu', function(evt){evt.preventDefault();});
    container.on("pressmove", function(evt) {
        if(connectionLine.startContainer != null)
        {
            drawConnectionLine(evt.stageX, evt.stageY);
            return;
        }
        if(evt.nativeEvent.button != 0) return;
        container.x = evt.stageX - dragPosition.x;
        container.y = evt.stageY - dragPosition.y;

        for(var i = 0; i < stage.numChildren; ++i)
        {
            var currentLine = stage.getChildAt(i);
            if(!currentLine.endContainer)
            {
                continue;
            }
            if(container == currentLine.startContainer || container == currentLine.endContainer)
            {
                currentLine.graphics.clear();
                drawArrow(currentLine);
            }
        }









        var containerBounds = container.getBounds();
        if(container.x + containerBounds.width > parseInt(document.body.style.width))
        {
            canvas.width = containerBounds.width + container.x;
            document.body.style.width = canvas.width;
            window.scrollBy(canvas.width, 0);
        }
        stage.update();
    });

    container.on("pressup", function(evt) {
        for(var i = stage.numChildren - 1; i >= 0; --i)
        {
            var currentContainer = stage.getChildAt(i);
            if(currentContainer == container)
            {
                continue;
            }
            var bounds = currentContainer.getBounds();
            if(currentContainer.title && bounds.width && bounds.height && evt.stageX >= currentContainer.x && evt.stageX <= parseFloat(currentContainer.x) + parseFloat(bounds.width) && evt.stageY >= currentContainer.y && evt.stageY <= parseFloat(currentContainer.y) + parseFloat(bounds.height))
            {
                console.log(currentContainer.title);
                connectionLine.endContainer = currentContainer;
                connectionLine.startX -= connectionLine.startContainer.x;
                connectionLine.startY -= connectionLine.startContainer.y;
                connectionLine.endX = parseFloat(evt.stageX) - parseFloat(connectionLine.endContainer.x);
                connectionLine.endY = parseFloat(evt.stageY) - parseFloat(connectionLine.endContainer.y);
                var endX = parseFloat(connectionLine.endContainer.x) + parseFloat(connectionLine.endX);
                var endY = parseFloat(connectionLine.endContainer.y) + parseFloat(connectionLine.endY);
                var startX = parseFloat(connectionLine.startContainer.x) + parseFloat(connectionLine.startX);
                var startY = parseFloat(connectionLine.startContainer.y) + parseFloat(connectionLine.startY);
                connectionLine.graphics.clear();
                connectionLine.graphics.setStrokeStyle(4).beginStroke("Green").moveTo(startX, startY).lineTo(endX, endY);
                stage.update();

                connectionLine = new createjs.Shape();
                connectionLine.startContainer = null;
                connectionLine.startX = 0;
                connectionLine.startY = 0;
                stage.addChild(connectionLine);
                break;
            }
        }

        connectionLine.graphics.clear();
        connectionLine.startContainer = null;
        stage.update();
    });
    stage.addChild(container);

    stage.update();
}



