'use strict';
var dragConnectionLine = null;
var selectedContainer = null;
var stage = null;
var options = null;
var choices = [];


function init()
{
    setCanvasSize();
    stage = new createjs.Stage("canvas");

    load(stage);
}

function papTextChanged(evt)
{
    if(!selectedContainer) { return; }
    selectedContainer.text = document.getElementById("papText").value;
}


function setCanvasSize()
{
    var canvas = document.getElementById("canvas");
    canvas.width = parseInt(document.body.style.width);
    canvas.height = parseInt(document.body.style.height);
}

function load(stage)
{
    $.post("test.php",
        {action: "load"},
        function(data, status)
        {
            var loaded = new Object(JSON.parse(data));
            options = loaded.options;
            var papText = document.getElementById("papText");
            papText.addEventListener("input", function(evt){papTextChanged(evt);});
            papText.style.font = options.font;

            var papElements = loaded.papElements;
            papElements.forEach(function(currentPapElement){createPapElement(stage, currentPapElement);});

            var papConnections = loaded.papConnections;
            papConnections.forEach(function(currentPapConnection){createPapConnection(stage, currentPapConnection);});
            $(window).on('beforeunload', function(){save(stage);});
            dragConnectionLine = createDragConnectionLine(stage);
            stage.addChild(dragConnectionLine);
            stage.addChild(dragConnectionLine.title);
            stage.addChild(dragConnectionLine.border);
            var startElement = stage.children.find(function(el){return el.type == "Start";});
            if(startElement) nextBookText(startElement.containerId);
            $(window).bind('keydown', function(event) {
                    if (event.ctrlKey || event.metaKey
                            && String.fromCharCode(event.which).toLowerCase() == 's')
                    {
                            event.preventDefault();
                            save(stage);
                    }
            });
            stage.update();
        });
}


function nextBookText(elementId, nextElementId)
{
    choices.push(elementId);
    //alert(choices.join(", "));
    var bookDiv = document.getElementById("book");
    var el = nextElementId ? stage.children.find(function(e){return e.containerId === nextElementId;})
        : getElement(stage, elementId);
    var counter = 0;
    
    for(var i = 0; i < 1000 && el; ++i)
    {
        bookDiv.innerHTML = bookDiv.innerHTML + el.text + "<br><br>";
        if(el.type == "Condition")
        {
            stage.children.filter(isAConnection).filter(function(currentElement){ return currentElement.startContainer.containerId === el.containerId;}).forEach(function(currentElement){bookDiv.innerHTML += "<a href='javascript:nextBookText(" + el.containerId + ", " + currentElement.endContainer.containerId + ");'>" + currentElement.title.text + "</a><br><br>";});
            return;
        }
        el = getElement(stage, el.containerId);
    }
}



function getElement(stage, elementId)
{
    var element = stage.children.find(function(el){return el.startContainer && el.startContainer.containerId == elementId;});
    return element ? element.endContainer : undefined;

}


function save(stage)
{
    //console.log("not saving");
    //return;
    var papElements = [];
    stage.children.filter(isAPapElement).forEach(function(currentContainer)
    {
        papElements.push({id:currentContainer.containerId,
                          x:currentContainer.x,
                          y:currentContainer.y,
                          type:currentContainer.type,
                          title:currentContainer.title,
                          text:currentContainer.text});
    });
    var papConnections = [];
    stage.children.filter(isAConnection).forEach(function(currentConnection)
    {
        papConnections.push({source_id:currentConnection.startContainer.containerId,
                             destination_id: currentConnection.endContainer.containerId,
                             source_offset_x: currentConnection.startX,
                             source_offset_y: currentConnection.startY,
                             destination_offset_x: currentConnection.endX,
                             destination_offset_y: currentConnection.endY,
                             title: currentConnection.title.text});
    });
    var paps = {"elements" : papElements, "connections" : papConnections};
    $.post("test.php",
        { action: "save",
          pap: JSON.stringify(paps) },
        function(data, status){;});

}


function isAConnection(element)
{
    return element.startContainer && element.endContainer && element != dragConnectionLine;
}


function isAPapElement(element)
{
    return (element.containerId) ? true : false;
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
    line.title = new createjs.Text(" ", options.font, "#040000");
    line.title.x = 0;
    line.title.y = 0;
    line.title.regX = 0;
    line.title.regY = 0;
    line.border = new createjs.Shape();
    line.title.textBaseline = "middle";
    return line;
}


function calculateArrowPoints(line)
{
    var startX = +line.startX + +line.startContainer.x;
    var startY = +line.startY + +line.startContainer.y;
    var endX = +line.endX + +line.endContainer.x;
    var endY = +line.endY + +line.endContainer.y;
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
    return {degrees:180/Math.PI * Math.atan(slope), startX:startX, startY:startY, endX:endX, endY:endY, x1:x1, y1:y1, x2:x2, y2:y2};
}


function drawArrow(stage, line)
{
    var arrowEndPoints = calculateArrowPoints(line);
    line.graphics.clear();
    line.graphics.setStrokeDash().setStrokeStyle(4).beginStroke("Green").moveTo(arrowEndPoints.startX, arrowEndPoints.startY).lineTo(arrowEndPoints.endX, arrowEndPoints.endY);
    line.graphics.setStrokeStyle(4).beginStroke("Red").moveTo(arrowEndPoints.endX, arrowEndPoints.endY).lineTo(arrowEndPoints.x1, arrowEndPoints.y1);
    line.graphics.setStrokeStyle(4).beginStroke("Blue").moveTo(arrowEndPoints.endX, arrowEndPoints.endY).lineTo(arrowEndPoints.x2, arrowEndPoints.y2);

    var b = line.title.getBounds();
    if(!b){
        stage.update();
        return;
    }
    line.title.x = Math.abs(arrowEndPoints.endX+arrowEndPoints.startX)/2;
    line.title.y = Math.abs(arrowEndPoints.endY+arrowEndPoints.startY)/2;
    line.title.regX = b.width/2;
    line.title.regY = b.height/2;
    line.title.rotation = arrowEndPoints.degrees;
    stage.update();
}


function getContainerBounds(text, type, innerPadding)
{
    var textBounds  = text.getBounds();
    var bounds = {};
    bounds.width = textBounds.width + 2*innerPadding + 2*options.borderSize;
    bounds.height = textBounds.height + 2*innerPadding + 2*options.borderSize;

    var outer = 0;
    if(type == "Condition")
    {
        var innerS = {x:Math.cos(Math.PI/4) * (innerPadding), y:Math.sin(Math.PI/4) * (innerPadding)};
        bounds.width = textBounds.width + 2*(innerS.x + innerS.y);
        bounds.height = bounds.width;
        var outerS = {x:Math.cos(Math.PI/4) * (options.borderSize) , y:Math.sin(Math.PI/4) * (options.borderSize)};
        outer = outerS.x + outerS.y;
        bounds.width += 2*outer;
        bounds.height = bounds.width;
    }
    return {bounds:bounds, textBounds:textBounds, outer:outer};
}


function createContainer(elementData)
{
    //TODO add test, that this function return a container of the right size
    //this is a pure function
    var text = new createjs.Text(elementData.title, options.font, "#040000");
    var containerBounds = getContainerBounds(text, elementData.type, 17);

    text.x = containerBounds.bounds.width/2 - containerBounds.textBounds.width/2;
    text.y =  containerBounds.bounds.height/2 - containerBounds.textBounds.height/2;
    text.textBaseline = "top";
    text.on("dblclick", function(){changeTitle(text)});

    var border = new createjs.Shape();
    var shape = new createjs.Shape();


    var container = new createjs.Container();
    switch(elementData.type)
    {
        case "Start":
            // fall through
        case "End":
            border.graphics.beginFill(options.borderColor).drawRoundRect(0, 0, containerBounds.bounds.width, containerBounds.bounds.height, 33);
            shape.graphics.beginFill(options.mainColor).drawRoundRect(options.borderSize, options.borderSize, containerBounds.bounds.width-2*options.borderSize, containerBounds.bounds.height-2*options.borderSize, 23);
            container.drawBorder = function(containerToSelect)
            {
                if(container == containerToSelect)
                {
                    border.graphics.setStrokeStyle(options.borderSize).beginStroke(options.borderColor).setStrokeDash([10, 10], 0).setStrokeStyle(3).beginStroke(options.selectedColor).beginFill(options.borderColor).drawRoundRect(0, 0, container.width, container.height, 33);
                }
                else
                {
                    border.graphics.clear();
                    border.graphics.beginFill(options.borderColor).drawRoundRect(0, 0, containerBounds.bounds.width, containerBounds.bounds.height, 33);
                }
            }
            break;

        case "Action":
            border.graphics.beginFill(options.borderColor).drawRect(0, 0, containerBounds.bounds.width, containerBounds.bounds.height);
            shape.graphics.beginFill(options.mainColor).drawRect(options.borderSize, options.borderSize, containerBounds.bounds.width-2*options.borderSize, containerBounds.bounds.height-2*options.borderSize);
            container.drawBorder = function(containerToSelect)
            {
                if(container == containerToSelect)
                {
                    border.graphics.setStrokeStyle(options.borderSize).setStrokeDash([10, 10], 0).beginStroke(options.borderColor).setStrokeStyle(3).beginStroke(options.selectedColor).beginFill(options.borderColor).drawRect(0, 0, containerBounds.bounds.width, containerBounds.bounds.height, 23);
                }
                else
                {
                    border.graphics.clear();
                    border.graphics.beginFill(options.borderColor).drawRect(0, 0, containerBounds.bounds.width, containerBounds.bounds.height);
                }
            }
            break;

        case "Condition":
            border.graphics.beginFill(options.borderColor).moveTo(4, containerBounds.bounds.height/2).lineTo(containerBounds.bounds.width/2, 4).lineTo(containerBounds.bounds.width-4, containerBounds.bounds.height/2).lineTo(containerBounds.bounds.width/2, containerBounds.bounds.height-4).lineTo(4, containerBounds.bounds.height/2);
            shape.graphics.beginFill(options.mainColor).moveTo(containerBounds.outer, containerBounds.bounds.height/2).lineTo(containerBounds.bounds.width/2, containerBounds.outer).lineTo(containerBounds.bounds.width-containerBounds.outer, containerBounds.bounds.height/2).lineTo(containerBounds.bounds.width/2, containerBounds.bounds.height-containerBounds.outer).lineTo(containerBounds.outer, containerBounds.bounds.height/2);
            container.drawBorder = function(containerToSelect)
            {
                if(container == containerToSelect)
                {
                    border.graphics.setStrokeStyle(3).setStrokeDash([10, 10], 0).beginStroke(options.selectedColor).moveTo(0, containerBounds.bounds.height/2).lineTo(containerBounds.bounds.width/2, 0).lineTo(containerBounds.bounds.width-0, containerBounds.bounds.height/2).lineTo(containerBounds.bounds.width/2, containerBounds.bounds.height-0).lineTo(0, containerBounds.bounds.height/2);
                }
                else
                {
                    border.graphics.clear();
                    border.graphics.beginFill(options.borderColor).moveTo(0, containerBounds.bounds.height/2).lineTo(containerBounds.bounds.width/2, 0).lineTo(containerBounds.bounds.width, containerBounds.bounds.height/2).lineTo(containerBounds.bounds.width/2, containerBounds.bounds.height).lineTo(0, containerBounds.bounds.height/2);
                }
            }
            break;

        default:
            console.log("Data type " + elementData.type + " not found!");
    }

    container.containerId = +elementData.containerId;
    container.x = +elementData.x;
    container.y = +elementData.y;
    container.width = containerBounds.bounds.width;
    container.height = containerBounds.bounds.height;
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


function selectContainer(stage, containerToSelect)
{
    stage.children.forEach(function(currentContainer){if(isAPapElement(currentContainer)) currentContainer.drawBorder(containerToSelect);});
    selectedContainer = containerToSelect;
}


function bringToFront(stage, container)
{
    stage.children.sort(function(a, b){
        if(isAConnection(a) && isAPapElement(b)) return 1;
        if(isAPapElement(a) && isAConnection(b)) return -1;
        return 0;
    });
    stage.setChildIndex(container, stage.numChildren-1);
}


function createPapElement(stage, elementData)
{
    var container = createContainer(elementData);
    var containerDragOffset = {x:0, y:0};
    var isContainerDragging = false;
    var startDrag = function(container, posX, posY)
    {
        console.log("Dragging started");
        var isContainer = function(container, posX, posY)
        {
            var pt = container.getChildAt(1).globalToLocal(posX, posY);
            return container.getChildAt(1).hitTest(pt.x, pt.y);
        }
        if(isContainer(container, posX, posY))
        {
            containerDragOffset.x = posX - container.x;
            containerDragOffset.y = posY - container.y;
            isContainerDragging = true;
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
        console.log("drag");
        if(isConnectionLineDragging())
        {
            dragConnectionLine.endX = posX;
            dragConnectionLine.endY = posY;
            console.log("Arrow drawn" + dragConnectionLine.startContainer);
            drawArrow(stage, dragConnectionLine);
        }
        else if(isContainerDragging)
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
        return !isContainerDragging && dragConnectionLine && dragConnectionLine.startContainer && dragConnectionLine.startContainer != stage;
    };
    var stopConnectionLineDragging = function()
    {
        dragConnectionLine.startContainer = stage;
    }

    container.on("mousedown", function(evt){
        document.getElementById("papText").value = container.text;
        document.getElementById("papTitle").value = container.title;
        bringToFront(stage, container);
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
        if(container.x + containerBounds.width > +document.body.style.width)
        {
            alert("Vergroessern!");
            canvas.width = containerBounds.width + container.x;
            document.body.style.width = canvas.width;
            window.scrollBy(canvas.width, 0);
        }
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
        if(!isAlreadyConnected && endContainer)
        {
            var d = dragConnectionLine;
            dragConnectionLine.endContainer = endContainer;
            dragConnectionLine.endX = evt.stageX - dragConnectionLine.endContainer.x;
            dragConnectionLine.endY = evt.stageY - dragConnectionLine.endContainer.y;
            dragConnectionLine.on("dblclick", function(){changeTitle(dragConnectionLine)});
            dragConnectionLine.title.on("dblclick", function(){changeTitle(dragConnectionLine)});
            dragConnectionLine = createDragConnectionLine();
            stage.addChild(dragConnectionLine);
            stage.addChild(dragConnectionLine.title);
            stage.addChild(dragConnectionLine.border);
            stage.update();
            changeTitle(d);
        }
        stopConnectionLineDragging(endContainer, evt.stageX, evt.stageY);
        dragConnectionLine.graphics.clear();
        isContainerDragging = false;
        stage.update();
    });
    stage.addChild(container);
}



function changeTitle(element){
    //TODO the size of a papElement should adapt to the content
    var it = element;
    if(element.title && element.title.text)
    {
        it = element.title;
    }
    var newText = prompt("Bitte gib den Titel fuer diese Verbindungslinie ein:", it.text);
    if(newText != null ){ it.text = newText; }
    stage.update();
}


function createConnectionLine(connectionData, children)
{
    var connectionLine = new createjs.Shape();
    connectionLine.title = new createjs.Text(connectionData.title, options.font, "#040000");
    connectionLine.on("mousedown", function(){changeTitle(connectionLine)});
    connectionLine.title.on("mousedown", function(){changeTitle(connectionLine)});
    connectionLine.border = new createjs.Shape();
    connectionLine.title.textBaseline = "middle";
    connectionLine.startContainer = children.find(function(currentContainer){ return currentContainer.containerId === +connectionData.source_id;});
    connectionLine.startX = +connectionData.source_offset_x;
    connectionLine.startY = +connectionData.source_offset_y;
    connectionLine.endContainer = children.find(function(currentContainer){return currentContainer.containerId === +connectionData.destination_id;});
    connectionLine.endX = +connectionData.destination_offset_x;
    connectionLine.endY = +connectionData.destination_offset_y;
    return connectionLine;
}


function createPapConnection(stage, connectionData)
{
    var connectionLine = createConnectionLine(connectionData, stage.children);
    stage.addChild(connectionLine);
    stage.addChild(connectionLine.title);
    stage.addChild(connectionLine.border);
    drawArrow(stage, connectionLine);
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


