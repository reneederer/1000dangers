/*jslint todo: true */
'use strict';
var stage = null;
var dragConnectionLine = null;

function setCanvasSize()
{
    var canvas = document.getElementById("canvas");
    canvas.width = document.body.clientWidth;
    canvas.height = document.body.clientHeight;
}


function init()
{
    setCanvasSize();
    stage = new createjs.Stage("canvas");
    load();
    $(window).on('beforeunload', save);
    dragConnectionLine = createDragConnectionLine();
    stage.addChild(dragConnectionLine);
}


function load()
{
    $.post("test.php",
        {
            action: "loadPapElements"
        },
        function(data, status)
        {
            var papElements = JSON.parse(data);
            papElements.forEach(createPapElement);
        });

    $.post("test.php",
        {
            action: "loadConnections"
        },
        function(data, status)
        {
            var papConnections = JSON.parse(data);
            papConnections.forEach(createPapConnection);
        });
}


function isAConnection(element)
{
    return element.startContainer && element.endContainer && element != dragConnectionLine;
}


function isAPapElement(element)
{
    return element.containerId || false;
}


function save()
{
    var papElements = new Array();
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
        {
            action: "savePapElements",
            papElements: JSON.stringify(papElements)
        },
        function(data, status){
        });

    var papConnections = new Array();
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
        {
            action: "saveConnections",
            papConnections: JSON.stringify(papConnections)
        },
        function(data, status){
        });
}


function createDragConnectionLine()
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


function drawArrow(line)
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


function createContainer(elementData)
{
    var innerPadding = 15;
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
            break;
        default:
            console.log("Data type " + elementData.type + " not found!");
    }

    var container = new createjs.Container();
    container.containerId = elementData.containerId;
    container.x = elementData.x;
    container.y = elementData.y;
    container.addChild(border);
    container.addChild(shape);
    container.addChild(text);
    container.text = elementData.text;
    container.title = elementData.title;
    container.type = elementData.type;
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


function createPapElement(elementData)
{
    var containerDragPosition = {x:0, y:0};
    var container = createContainer(elementData);
    container.getChildAt(0).on("mousedown", function(evt){
        dragConnectionLine.startContainer = container;
        dragConnectionLine.startX = evt.stageX - container.x;
        dragConnectionLine.startY = evt.stageY - container.y;
        dragConnectionLine.endContainer = stage;
        dragConnectionLine.endX = evt.stageX;
        dragConnectionLine.endY = evt.stageY;
        drawArrow(dragConnectionLine);
    });

    container.on("mousedown", function(evt){
        hideTextDiv();
        containerDragPosition.x = evt.stageX - container.x;
        containerDragPosition.y = evt.stageY - container.y;
    });

    container.on("pressmove", function(evt) {
        if(isConnectionLineDragging())
        {
            dragConnectionLine.endX = evt.stageX;
            dragConnectionLine.endY = evt.stageY;
            drawArrow(dragConnectionLine);
            return;
        }
        if(evt.nativeEvent.button != 0) return;
        container.x = evt.stageX - containerDragPosition.x;
        container.y = evt.stageY - containerDragPosition.y;

        stage.children.filter(function(currentConnection)
                {
                    return isAConnection(currentConnection) && 
                        (currentConnection.startContainer == container || currentConnection.endContainer == container);
                }).forEach(function(currentConnection)
                {
                    currentConnection.graphics.clear();
                    drawArrow(currentConnection);
                });


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
            dragConnectionLine.endX = parseFloat(evt.stageX) - parseFloat(dragConnectionLine.endContainer.x);
            dragConnectionLine.endY = parseFloat(evt.stageY) - parseFloat(dragConnectionLine.endContainer.y);
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


function isConnectionLineDragging()
{
    return dragConnectionLine.startContainer != stage;
}


function stopConnectionLineDragging()
{
    dragConnectionLine.startContainer = stage;
}


function startConnectionLineDragging(startContainer)
{
    dragConnectionLine.startContainer = startContainer;
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


function createPapConnection(connectionData)
{
    var connectionLine = new createjs.Shape();
    connectionLine.startContainer = stage.children.find(function(currentContainer){return currentContainer.containerId == connectionData.source_id;});
    connectionLine.startX = connectionData.source_offset_x;
    connectionLine.startY = connectionData.source_offset_y;
    connectionLine.endContainer = stage.children.find(function(currentContainer){return currentContainer.containerId == connectionData.destination_id;});
    connectionLine.endX = connectionData.destination_offset_x;
    connectionLine.endY = connectionData.destination_offset_y;
    stage.addChild(connectionLine);
    drawArrow(connectionLine);
    stage.update();
}



