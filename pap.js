'use strict';
var dragConnectionLine = null;
var borderSize = 15;
var selectedColor = "#FF00FF";
var borderColor = "#FFBBBB";
var mainColor = "#FF7777";

function init()
{
    setCanvasSize();
    var stage = new createjs.Stage("canvas");
    load(stage);
    $(window).on('beforeunload', function(){save(stage);});
    dragConnectionLine = createDragConnectionLine(stage);
    stage.addChild(dragConnectionLine);
}


function setCanvasSize()
{
    var canvas = document.getElementById("canvas");
    canvas.width = document.body.clientWidth;
    canvas.height = document.body.clientHeight;
}


function load(stage)
{
    $.post("test.php",
        {action: "loadPapElements"},
        function(data, status)
        {
            var papElements = JSON.parse(data);
            console.log(papElements[0]);
            papElements.forEach(function(currentPapElement){createPapElement(stage, currentPapElement);});
        });

    $.post("test.php",
        {action: "loadConnections"},
        function(data, status)
        {
            var papConnections = JSON.parse(data);
            papConnections.forEach(function(currentPapConnection){createPapConnection(stage, currentPapConnection);});
        });
}


function save(stage)
{
    var papElements = [];
    stage.children.filter(isAPapElement).forEach(function(currentContainer)
    {
        papElements.push({id: currentContainer.containerId,
                          x:currentContainer.x,
                          y:currentContainer.y,
                          type:currentContainer.type,
                          title:currentContainer.title,
                          text:currentContainer.text});
    });
    $.post("test.php",
        { action: "savePapElements",
          papElements: JSON.stringify(papElements) },
        function(data, status){});

    var papConnections = [];
    stage.children.filter(isAConnection).forEach(function(currentConnection)
    {
        papConnections.push({source_id:currentConnection.startContainer.containerId,
                             destination_id: currentConnection.endContainer.containerId,
                             source_offset_x: currentConnection.startX,
                             source_offset_y: currentConnection.startY,
                             destination_offset_x: currentConnection.endX,
                             destination_offset_y: currentConnection.endY,
                             title: ""});
    });
    $.post("test.php",
        { action: "saveConnections",
          papConnections: JSON.stringify(papConnections) },
        function(data, status){;});
}


function isAConnection(element)
{
    return element.startContainer && element.endContainer && element != dragConnectionLine;
}


function isAPapElement(element)
{
    return element.containerId || false;
}


function createDragConnectionLine(stage)
{
    var line = new createjs.Shape();
    line.startContainer = stage;
    line.startX = 0;
    line.startY = 0;
    line.endContainer = stage;
    line.endX = 0;
    line.endY = 0;
    return line;
}


function calculateArrowEndPoints(line)
{
    var startX = parseFloat(line.startX) + parseFloat(line.startContainer.x);
    var startY = parseFloat(line.startY) + parseFloat(line.startContainer.y);
    var endX = parseFloat(line.endX) + parseFloat(line.endContainer.x);
    var endY = parseFloat(line.endY) + parseFloat(line.endContainer.y);
    if(endX == startX && endY == startY)
    {
        endX += 2;
        endY += 2;
    }
    var length = 40;
    var angle = 20;
    var dx = endX - startX;
    var dy = endY - startY;
    var slope = dy/dx;
    if(endX < startX){ angle = 180 - angle;}
    var x1 = endX + length * Math.cos(-(180-angle) * (Math.PI/180) + Math.atan(slope));
    var y1 = endY + length * Math.sin(-(180-angle) * (Math.PI/180) + Math.atan(slope));
    var x2 = endX + length * Math.cos((180-angle) * (Math.PI/180) + Math.atan(slope));
    var y2 = endY + length * Math.sin((180-angle) * (Math.PI/180) + Math.atan(slope));
    return {startX:startX, startY:startY, endX:endX, endY:endY, x1:x1, y1:y1, x2:x2, y2:y2};
}


function drawArrow(stage, line)
{
    var arrowEndPoints = calculateArrowEndPoints(line);
    line.graphics.clear();
    line.graphics.setStrokeStyle(4).beginStroke("Green").moveTo(arrowEndPoints.startX, arrowEndPoints.startY).lineTo(arrowEndPoints.endX, arrowEndPoints.endY);
    line.graphics.setStrokeStyle(4).beginStroke("Red").moveTo(arrowEndPoints.endX, arrowEndPoints.endY).lineTo(arrowEndPoints.x1, arrowEndPoints.y1);
    line.graphics.setStrokeStyle(4).beginStroke("Blue").moveTo(arrowEndPoints.endX, arrowEndPoints.endY).lineTo(arrowEndPoints.x2, arrowEndPoints.y2);
    stage.update();
}


function createContainer(elementData)
{
    //TODO add test, that this function return a container of the right size
    //this is a pure function
    var innerPadding = 17;
    var text = new createjs.Text(elementData.title, "20px Arial", "#040000");
    var textBounds  = text.getBounds();
    var bounds = {};
    bounds.width = textBounds.width + 2*innerPadding + 2*borderSize;
    bounds.height = textBounds.height + 2*innerPadding + 2*borderSize;

    var outer = 0;
    if(elementData.type == "Condition")
    {
        var innerS = {x:Math.cos(Math.PI/4) * (innerPadding), y:Math.sin(Math.PI/4) * (innerPadding)};
        bounds.width = textBounds .width + 2*(innerS.x + innerS.y);
        bounds.height = bounds.width;
        var outerS = {x:Math.cos(Math.PI/4) * (borderSize) , y:Math.sin(Math.PI/4) * (borderSize)};
        outer = outerS.x + outerS.y;
        bounds.width += 2*outer;
        bounds.height = bounds.width;
    }

    text.x = bounds.width/2 - textBounds .width/2;
    text.y =  bounds.height/2 - textBounds .height/2;
    text.textBaseline = "top";

    var border = new createjs.Shape();
    var shape = new createjs.Shape();


    var container = new createjs.Container();
    switch(elementData.type)
    {
        case "Start":
            // fall through
        case "End":
            border.graphics.beginFill(borderColor).drawRoundRect(0, 0, bounds.width, bounds.height, 33);
            shape.graphics.beginFill(mainColor).drawRoundRect(borderSize, borderSize, bounds.width-2*borderSize, bounds.height-2*borderSize, 23);
            container.drawBorder = function(selectContainer)
            {
                if(container == selectContainer)
                {
                    border.graphics.setStrokeStyle(borderSize).beginStroke(borderColor).setStrokeDash([10, 10], 0).setStrokeStyle(3).beginStroke(selectedColor).beginFill(borderColor).drawRoundRect(0, 0, container.width, container.height, 33);
                }
                else
                {
                    border.graphics.clear();
                    border.graphics.beginFill(borderColor).drawRoundRect(0, 0, bounds.width, bounds.height, 33);
                }
            }
            break;
        case "Action":
            border.graphics.beginFill(borderColor).drawRect(0, 0, bounds.width, bounds.height);
            shape.graphics.beginFill(mainColor).drawRect(borderSize, borderSize, bounds.width-2*borderSize, bounds.height-2*borderSize);
            container.drawBorder = function(selectContainer)
            {
                if(container == selectContainer)
                {
                    border.graphics.setStrokeStyle(borderSize).setStrokeDash([10, 10], 0).beginStroke(borderColor).setStrokeStyle(3).beginStroke(selectedColor).beginFill(borderColor).drawRect(0, 0, bounds.width, bounds.height, 23);
                }
                else
                {
                    border.graphics.clear();
                    border.graphics.beginFill(borderColor).drawRect(0, 0, bounds.width, bounds.height);
                }
            }
            break;
        case "Condition":
            border.graphics.beginFill(borderColor).moveTo(4, bounds.height/2).lineTo(bounds.width/2, 4).lineTo(bounds.width-4, bounds.height/2).lineTo(bounds.width/2, bounds.height-4).lineTo(4, bounds.height/2);
            shape.graphics.beginFill(mainColor).moveTo(outer, bounds.height/2).lineTo(bounds.width/2, outer).lineTo(bounds.width-outer, bounds.height/2).lineTo(bounds.width/2, bounds.height-outer).lineTo(outer, bounds.height/2);
            container.drawBorder = function(selectContainer)
            {
                if(container == selectContainer)
                {
                    border.graphics.setStrokeStyle(4).setStrokeDash([10, 10], 0).beginStroke(selectedColor).moveTo(0, bounds.height/2).lineTo(bounds.width/2, 0).lineTo(bounds.width-0, bounds.height/2).lineTo(bounds.width/2, bounds.height-0).lineTo(0, bounds.height/2);
                }
                else
                {
                    border.graphics.clear();
                    border.graphics.beginFill(borderColor).moveTo(0, bounds.height/2).lineTo(bounds.width/2, 0).lineTo(bounds.width, bounds.height/2).lineTo(bounds.width/2, bounds.height).lineTo(0, bounds.height/2);
                }
            }
            break;
        default:
            console.log("Data type " + elementData.type + " not found!");
    }

    container.containerId = elementData.containerId;
    container.x = elementData.x;
    container.y = elementData.y;
    container.width = bounds.width;
    container.height = bounds.height;
    container.addChild(border);
    container.addChild(shape);
    container.addChild(text);
    container.text = elementData.text;
    container.title = elementData.title;
    container.type = elementData.type;
    console.log("border: " + container.getChildAt(0).graphics);
    return container;

}


function hasStartOrEndContainer(line, container)
{
    return line.startContainer == container || line.endContainer == container;
}


function hasStartAndEndContainer(line, startContainer, endContainer)
{
    return line.startContainer == startContainer && line.endContainer == endContainer;
}


function selectContainer(stage, selectContainer)
{
    stage.children.forEach(function(currentContainer){if(isAPapElement(currentContainer)) currentContainer.drawBorder(selectContainer);});
    return;
    stage.children.forEach(function(container)
            {
                if(container.type == "Start" || container.type == "End")
                    container.getChildAt(0).graphics.setStrokeStyle(borderSize).beginStroke(borderColor).setStrokeStyle(3).beginStroke(borderColor).beginFill(borderColor).drawRoundRect(0, 0, container.width, container.height, 33);
            });
    if(container.type == "Start" || container.type == "End")
        container.getChildAt(0).graphics.setStrokeStyle(borderSize).beginStroke(borderColor).setStrokeStyle(3).beginStroke(selectedColor).beginFill(borderColor).drawRoundRect(0, 0, container.width, container.height, 33);
}

function createPapElement(stage, elementData)
{
    var container = createContainer(elementData);
    var containerDragOffset = {x:0, y:0};
    var startDrag = function(container, posX, posY)
    {
        var isContainer = function(container, posX, posY)
        {
            var pt = container.getChildAt(1).globalToLocal(posX, posY);
            return container.getChildAt(1).hitTest(pt.x, pt.y);
        }
        if(isContainer(container, posX, posY))
        {
            containerDragOffset.x = posX - container.x;
            containerDragOffset.y = posY - container.y;
        }
        else
        {
            dragConnectionLine.startContainer = container;
            dragConnectionLine.startX = posX - container.x;
            dragConnectionLine.startY = posY - container.y;
            dragConnectionLine.endContainer = stage;
            dragConnectionLine.endX = posX;
            dragConnectionLine.endY = posY;
        }
    }
    var dragTo = function(draggingContainer, posX, posY)
    {
        if(isConnectionLineDragging())
        {
            dragConnectionLine.endX = posX;
            dragConnectionLine.endY = posY;
            drawArrow(stage, dragConnectionLine);
        }
        else
        {
            draggingContainer.x = posX - containerDragOffset.x;
            draggingContainer.y = posY - containerDragOffset.y;
            redrawAffectedArrows(draggingContainer);
        }
    }
    var redrawAffectedArrows = function(draggedContainer)
    {
        stage.children.filter(function(currentConnection)
        {
            return isAConnection(currentConnection) &&
                (currentConnection.startContainer == draggedContainer || currentConnection.endContainer == draggedContainer);
        }).forEach(function(currentConnection)
        {
            currentConnection.graphics.clear();
            drawArrow(stage, currentConnection);
        });
    }

    var isConnectionLineDragging = function()
    {
        return dragConnectionLine.startContainer != stage;
    };
    var stopConnectionLineDragging = function()
    {
        dragConnectionLine.startContainer = stage;
    }

    container.on("mousedown", function(evt){
        console.log(evt.stageX + ", " + evt.stageY);
        selectContainer(stage, container);
        startDrag(container, evt.stageX, evt.stageY);
    });

    container.on("pressmove", function(evt) {
        dragTo(container, evt.stageX, evt.stageY);
        stage.update();
        return;
        dragConnectionLineTo(evt.stageX, evt.stageY);
        dragContainerTo(container, evt.stageX, evt.stageY);
        redrawAffectedArrows(container);

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
        var endContainer = stage.children.find(function(currentContainer)
                {
                    var pt = currentContainer.globalToLocal(evt.stageX, evt.stageY);
                    return currentContainer != container && isAPapElement(currentContainer)
                        && currentContainer.hitTest(pt.x, pt.y);
                });

        var isAlreadyConnected = stage.children.some(function(currentConnection)
                {
                    return isAConnection(currentConnection) && hasStartAndEndContainer(currentConnection, dragConnectionLine.startContainer, endContainer);
                });
        if(!isAlreadyConnected && endContainer != undefined)
        {
            dragConnectionLine.endContainer = endContainer;
            dragConnectionLine.endX = evt.stageX - dragConnectionLine.endContainer.x;
            dragConnectionLine.endY = evt.stageY - dragConnectionLine.endContainer.y;
            dragConnectionLine = createDragConnectionLine();
            stage.addChild(dragConnectionLine);
        }
        stopConnectionLineDragging(endContainer, evt.stageX, evt.stageY);


        dragConnectionLine.graphics.clear();
        stage.update();
    });
    stage.addChild(container);
    stage.update();
}







function createPapConnection(stage, connectionData)
{
    var connectionLine = new createjs.Shape();
    connectionLine.startContainer = stage.children.find(function(currentContainer){return currentContainer.containerId == connectionData.source_id;});
    connectionLine.startX = connectionData.source_offset_x;
    connectionLine.startY = connectionData.source_offset_y;
    connectionLine.endContainer = stage.children.find(function(currentContainer){return currentContainer.containerId == connectionData.destination_id;});
    connectionLine.endX = connectionData.destination_offset_x;
    connectionLine.endY = connectionData.destination_offset_y;
    stage.addChild(connectionLine);
    drawArrow(stage, connectionLine);
    stage.update();
}


function hideTextDiv()
{
    textDiv.style.display = "none";
}


function showTextDiv()
{
    var textDiv = document.getElementById("textDiv");
    textDiv.style.display = "block";
}



