'use strict';
(function(dangerbook)
{
var dragConnectionLine = null;
var selectedContainer = null;
var options = {font: "14px Arial"};
var choices = [];
var stage = null;


dangerbook.init = function()
{
    var messageDiv = document.getElementById("messageDiv");
    var canvasContextMenu = document.getElementById("canvasContextMenu");
    messageDiv.innerHTML = "Neue Elemente erstellen mit Rechtsklick.";
    dangerbook.setCanvasSize();
    stage = new createjs.Stage("canvas");
    stage.mouseEnabled = true;
    dangerbook.load(stage);
    canvasContextMenu.addEventListener("mouseup",
        function(evt)
        {
            var item = dangerbook.getChosenItem(evt);
            var type = null;
            var containerWithLargestId = stage.children
                .filter(dangerbook.isAPapElement)
                .reduce(function(previousChild, currentChild)
                        {
                            return (previousChild.containerId > currentChild.containerId)
                                ? previousChild
                                : currentChild;
                        }, {containerId:0});
            var containerId = containerWithLargestId.containerId + 1;
            var rect = canvas.getBoundingClientRect();
            alert(containerId);
            switch(item)
            {
                case "Aktion":
                   type = "Action";
                   break;
                case "Bedingung":
                   type = "Condition";
                   break;
                case "Start":
                    type = "Start";
                    break;
                case "Ende":
                    type = "End";
                    break;
            }
            canvasContextMenu.style.display = "None";
            dangerbook.createPapElement(stage, {containerId:containerId, x:evt.pageX-rect.left, y:evt.pageY-(rect.top+window.scrollY), title:type, text:"Dieser Text wird spter angezeigt", type:type});
            stage.update();
        }
    );
    stage.on("stagemousedown", function(evt){
        if(evt.nativeEvent.button == 2 && stage.getObjectUnderPoint(evt.stageX, evt.stageY) == null)
        {
            canvasContextMenu.style.left = evt.nativeEvent.pageX;
            canvasContextMenu.style.top = evt.nativeEvent.pageY;
            canvasContextMenu.style.display = "inline";
        }

            
    });

    //save when Ctrl-s is pressed
    window.addEventListener('keydown', function(event) {
        if ((event.ctrlKey || event.metaKey)
            && String.fromCharCode(event.which).toLowerCase() == 's')
        {
            messageDiv.innerHTML = "Speichere...";
            event.preventDefault();
            dangerbook.save(stage);
        }
    });
}


dangerbook.getChosenItem = function(evt)
{
    return evt.target.innerHTML;
}

dangerbook.papTextChanged = function(evt)
{
    if(!selectedContainer) { return; }
    selectedContainer.text = document.getElementById("papText").value;
}







dangerbook.setCanvasSize = function()
{
    var canvas = document.getElementById("canvas");
    canvas.width = parseInt(document.body.style.width);
    canvas.height = parseInt(document.body.style.height);
}

dangerbook.load = function(stage)
{
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("POST", "test.php");
    xmlhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xmlhttp.onreadystatechange = function()
    {
        if(xmlhttp.readyState === XMLHttpRequest.DONE)
        {
            alert(xmlhttp.responseText);
            var loaded = new Object(JSON.parse(xmlhttp.responseText));
            var papText = document.getElementById("papText");
            var papElements = loaded.papElements;
            var papConnections = loaded.papConnections;

            options = loaded.options;
            papText.addEventListener("input", function(evt){dangerbook.papTextChanged(evt);});
            papText.style.font = options.font;

            papElements.forEach(function(currentPapElement){dangerbook.createPapElement(stage, currentPapElement);});

            papConnections.forEach(function(currentPapConnection){dangerbook.createPapConnection(stage, currentPapConnection);});
            //TODO uncomment
            window.addEventListener('beforeunload', function(){dangerbook.save(stage);});
            dragConnectionLine = dangerbook.createDragConnectionLine(stage);
            stage.addChild(dragConnectionLine);
            stage.addChild(dragConnectionLine.title);
            stage.addChild(dragConnectionLine.border);
            var startElement = stage.children.find(function(el){return el.type == "Start";});
            if(startElement) dangerbook.nextBookText(startElement.containerId);
            stage.update();
        }
    };
    xmlhttp.send("action=load");

}


dangerbook.nextBookText = function(elementId, nextElementId)
{
    choices.push(elementId);
    //alert(choices.join(", "));
    var bookDiv = document.getElementById("book");
    var el = nextElementId
        ? stage.children.find(function(e){return e.containerId === nextElementId;})
        : dangerbook.getElement(stage, elementId);
    var counter = 0;

    
    for(var i = 0; i < 1000 && el; ++i)
    {
        bookDiv.innerHTML = bookDiv.innerHTML + el.text + "<br><br>";
        if(el.type == "Condition")
        {
            stage.children.filter(dangerbook.isAConnection).filter(function(currentElement){ return currentElement.startContainer.containerId === el.containerId;}).forEach(function(currentElement){bookDiv.innerHTML += "<a href='javascript:nextBookText(" + el.containerId + ", " + currentElement.endContainer.containerId + ");'>" + currentElement.title.text + "</a><br><br>";});
            return;
        }
        el = dangerbook.getElement(stage, el.containerId);
    }
}



dangerbook.getElement = function(stage, elementId)
{
    var element = stage.children.find(function(el){return el.startContainer && el.startContainer.containerId == elementId;});
    return element ? element.endContainer : undefined;

}


dangerbook.save = function(stage)
{
    var papElements = [];
    stage.children.filter(dangerbook.isAPapElement).forEach(function(currentContainer)
    {
        papElements.push({id:currentContainer.containerId,
                          x:currentContainer.x,
                          y:currentContainer.y,
                          type:currentContainer.type,
                          title:currentContainer.title,
                          text:currentContainer.text});
    });
    var papConnections = [];
    stage.children.filter(dangerbook.isAConnection).forEach(function(currentConnection)
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

    var pap_upload = "action=save&pap=" + JSON.stringify(paps);
    var xmlhttp = new XMLHttpRequest();   // new HttpRequest instance 
    xmlhttp.open("POST", "test.php");
    xmlhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xmlhttp.onreadystatechange = function()
    {
        if (xmlhttp.readyState === XMLHttpRequest.DONE)
        {
            alert(xmlhttp.responseText);
            messageDiv.innerHTML = "Gespeichert!";
        }
    }
    xmlhttp.send(pap_upload);
}


dangerbook.isAConnection = function(element)
{
    return element.startContainer && element.endContainer && element !== dragConnectionLine;
}


dangerbook.isAPapElement = function(element)
{
    return (element.containerId) ? true : false;
}



dangerbook.createDragConnectionLine = function(stage)
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


dangerbook.calculateArrowPoints = function(line)
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

    var distance = 4+length/Math.sin(90*Math.PI/180) * Math.sin(angle*Math.PI/180);
    var a = {x:startX + distance*Math.cos(Math.atan(slope)+Math.PI/2), y:startY + distance*Math.sin(Math.atan(slope)+Math.PI/2)}; 
    var b = {x:startX + distance*Math.cos(Math.atan(slope)-Math.PI/2), y:startY + distance*Math.sin(Math.atan(slope)-Math.PI/2)}; 
    var c = {x:endX + distance*Math.cos(Math.atan(slope)-Math.PI/2), y:endY + distance*Math.sin(Math.atan(slope)-Math.PI/2)}; 
    var d = {x:endX + distance*Math.cos(Math.atan(slope) + Math.PI/2), y:endY + distance*Math.sin(Math.atan(slope) + Math.PI/2)}; 

    return {degrees:180/Math.PI * Math.atan(slope), startX:startX, startY:startY, endX:endX, endY:endY, x1:x1, y1:y1, x2:x2, y2:y2, a:a, b:b, c:c, d:d};
}


dangerbook.drawArrow = function(stage, line)
{
    var arrowEndPoints = dangerbook.calculateArrowPoints(line);
    line.graphics.clear();
    line.graphics.setStrokeDash().setStrokeStyle(4).beginStroke("Green").moveTo(arrowEndPoints.startX, arrowEndPoints.startY).lineTo(arrowEndPoints.endX, arrowEndPoints.endY);
    line.graphics.setStrokeStyle(4).beginStroke("Red").moveTo(arrowEndPoints.endX, arrowEndPoints.endY).lineTo(arrowEndPoints.x1, arrowEndPoints.y1);
    line.graphics.setStrokeStyle(4).beginStroke("Blue").moveTo(arrowEndPoints.endX, arrowEndPoints.endY).lineTo(arrowEndPoints.x2, arrowEndPoints.y2);
    line.graphics.setStrokeDash([10, 10], 0);
    line.graphics.setStrokeStyle(4).beginStroke("Brown").moveTo(arrowEndPoints.a.x, arrowEndPoints.a.y).lineTo(arrowEndPoints.b.x, arrowEndPoints.b.y).lineTo(arrowEndPoints.c.x, arrowEndPoints.c.y).lineTo(arrowEndPoints.d.x, arrowEndPoints.d.y).lineTo(arrowEndPoints.a.x, arrowEndPoints.a.y);

    var b = line.title.getBounds();
    if(!b){
        alert("!b");
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


dangerbook.getContainerBounds = function(text, type, innerPadding)
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


dangerbook.createContainer = function(elementData)
{
    //TODO add test, that this function return a container of the right size
    //this is a pure function 
    var text = new createjs.Text(elementData.title, options.font, "#040000");
    var containerBounds = dangerbook.getContainerBounds(text, elementData.type, 17);

    text.x = containerBounds.bounds.width/2 - containerBounds.textBounds.width/2;
    text.y =  containerBounds.bounds.height/2 - containerBounds.textBounds.height/2;
    text.textBaseline = "top";
    text.on("dblclick", function(){dangerbook.changeTitle(text)});

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


dangerbook.hasStartOrEndContainer = function(line, container)
{
    return line.startContainer == container || line.endContainer == container;
}


dangerbook.hasStartAndEndContainer = function(line, startContainer, endContainer)
{
    return line.startContainer == startContainer && line.endContainer == endContainer;
}


dangerbook.selectContainer = function(stage, containerToSelect)
{
    stage.children.forEach(function(currentContainer){if(dangerbook.isAPapElement(currentContainer)) currentContainer.drawBorder(containerToSelect);});
    selectedContainer = containerToSelect;
}


dangerbook.bringToFront = function(stage, container)
{
    stage.children.sort(function(a, b){
        if(dangerbook.isAConnection(a) && dangerbook.isAPapElement(b)) return 1;
        if(dangerbook.isAPapElement(a) && dangerbook.isAConnection(b)) return -1;
        return 0;
    });
    stage.setChildIndex(container, stage.numChildren-1);
}


dangerbook.createPapElement = function(stage, elementData)
{
    var container = dangerbook.createContainer(elementData);
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
            dangerbook.drawArrow(stage, dragConnectionLine);
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
            return dangerbook.isAConnection(currentConnection) &&
                (currentConnection.startContainer == draggedContainer || currentConnection.endContainer == draggedContainer);
        }).forEach(function(currentConnection)
        {
            currentConnection.graphics.clear();
            dangerbook.drawArrow(stage, currentConnection);
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
        var elementContextMenu = document.getElementById("elementContextMenu");
        if(evt.nativeEvent.button == 0) // left down
        {
            document.getElementById("papText").value = container.text;
            document.getElementById("papTitle").value = container.title;
            dangerbook.bringToFront(stage, container);
            dangerbook.selectContainer(stage, container);
            startDrag(container, evt.stageX, evt.stageY);
            elementContextMenu.style.display = "hidden";
        }
        else
        {
            elementContextMenu.style.left = evt.nativeEvent.pageX; 
            elementContextMenu.style.top = evt.nativeEvent.pageY; 
            elementContextMenu.style.display = "inline";
        }
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

    container.on("pressup", function(evt){
        var endContainer = stage.children.find(function(currentContainer)
                {
                    var pt = currentContainer.globalToLocal(evt.stageX, evt.stageY);
                    return currentContainer != container && dangerbook.isAPapElement(currentContainer)
                        && currentContainer.hitTest(pt.x, pt.y);
                });

        var canConnect = function()
            {
                if(!dangerbook.isAPapElement(dragConnectionLine.startContainer))
                {
                    return false;
                }
                var messageDiv = document.getElementById("messageDiv");
                var connections = stage.children.filter(dangerbook.isAConnection);
                var isAlreadyConnected = connections.some(function(currentConnection)
                {
                    return currentConnection.startContainer === dragConnectionLine.startContainer && currentConnection.endContainer === endContainer;
                });

                // prevent multiple connections to and from the same elements
                if(isAlreadyConnected)
                {
                    console.log("Die Elemente sind bereits verbunden.");
                    messageDiv.innerHTML = "Die Elemente sind bereits verbunden.";
                    return false;
                }

                // prevent self connection
                if(dragConnectionLine.startContainer === endContainer)
                {
                    console.log("Verbindung mit sich selbst ist nicht erlaubt");
                    messageDiv.innerHTML = "Verbindung mit sich selbst ist nicht erlaubt.";
                    return false;
                }


                // end-element cannot be the startContainer
                if(dragConnectionLine.startContainer.type === "End")
                {
                    console.log("Das \"Ende-Element\" kann kein Verbindungsbeginn sein.");
                    messageDiv.innerHTML = "Das \"Ende-Element\" kann kein Verbindungsbeginn sein.";
                    return false;
                }

                //start-element cannot be the endContainer
                if(endContainer.type === "Start")
                {
                    console.log("Das \"Start-Element\" kann kein Verbindungsende sein.");
                    messageDiv.innerHTML = "Das \"Start-Element\" kann kein Verbindungsende sein.";
                    return false;
                }

                //start-element and action-elements can have 0 or 1 successors
                if(dragConnectionLine.startContainer.type === "Start" || dragConnectionLine.startContainer.type === "Action")
                {
                    var hasSuccessor = connections.some(function(currentConnection)
                        {
                            return currentConnection !== dragConnectionLine && currentConnection.startContainer === dragConnectionLine.startContainer;
                        })
                    if(hasSuccessor)
                    {
                        console.log("Start-Element und Aktions-Elemente k&ouml;nnen h&ouml;chstens einen Nachfolger haben.");
                        messageDiv.innerHTML = "Start-Element und Aktions-Elemente k&ouml;nnen h&ouml;chstens einen Nachfolger haben.";
                        return false;
                    }
                }
                messageDiv.innerHTML = "Neue Verbindung erstellt.";
                return true;
           };
        if(endContainer && canConnect())
        {
            var d = dragConnectionLine;
            dragConnectionLine.endContainer = endContainer;
            dragConnectionLine.endX = evt.stageX - dragConnectionLine.endContainer.x;
            dragConnectionLine.endY = evt.stageY - dragConnectionLine.endContainer.y;
            dragConnectionLine.on("dblclick", function(){dangerbook.changeTitle(dragConnectionLine)});
            dragConnectionLine.title.on("dblclick", function(){dangerbook.changeTitle(dragConnectionLine)});
            dragConnectionLine = dangerbook.createDragConnectionLine();
            stage.addChild(dragConnectionLine);
            stage.addChild(dragConnectionLine.title);
            stage.addChild(dragConnectionLine.border);
            stage.update();
            dangerbook.changeTitle(d);
        }
        stopConnectionLineDragging(endContainer, evt.stageX, evt.stageY);
        dragConnectionLine.graphics.clear();
        isContainerDragging = false;
        stage.update();
    });
    stage.addChild(container);
}



dangerbook.changeTitle = function(element){
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


dangerbook.createConnectionLine = function(connectionData, children)
{
    var connectionLine = new createjs.Shape();
    connectionLine.title = new createjs.Text(connectionData.title, options.font, "#040000");
    connectionLine.on("mousedown", function(){dangerbook.changeTitle(connectionLine)});
    connectionLine.title.on("mousedown", function(){dangerbook.changeTitle(connectionLine)});
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


dangerbook.createPapConnection = function(stage, connectionData)
{
    var connectionLine = dangerbook.createConnectionLine(connectionData, stage.children);
    stage.addChild(connectionLine);
    stage.addChild(connectionLine.title);
    stage.addChild(connectionLine.border);
    dangerbook.drawArrow(stage, connectionLine);
}


dangerbook.hideTextDiv = function()
{
    textDiv.style.display = "none";
}


dangerbook.showTextDiv = function()
{
    var textDiv = document.getElementById("textDiv");
    textDiv.style.display = "block";
}
return dangerbook;
})(window.dangerbook = window.dangerbook || {});


QUnit.test("createContainer(elementData)", function(assert)
{
    var elementData = {"containerId":"3","x":"180","y":"400","type":"Action","title":"Insel gestrandet","text":"Du hast Schiffbruch erlitten."};
    var container = dangerbook.createContainer(elementData);
    assert.ok(container.containerId === 3, "Passed");
    assert.ok(container.y === 400, "Passed");
    assert.ok(container.x === 180, "Passed");
    assert.ok(container.type === "Action", "Passed");
    assert.ok(container.title === "Insel gestrandet", "Passed");
    assert.ok(container.text === "Du hast Schiffbruch erlitten.", "Passed");
});


QUnit.test("createConnectionLine(connectionData)", function(assert)
{
    var elementData1 = {"containerId":"3","x":"180","y":"400","type":"Action","title":"Insel gestrandet","text":"Du hast Schiffbruch erlitten."};
    var elementData2 = {"containerId":"2","x":"20","y":"10","type":"Action","title":"Kannibalen treffen","text":"Du triffst auf 5 Kannibalen."};
    var connectionData = {"source_id":"3","destination_id":"2","source_offset_x":"1","source_offset_y":"2","destination_offset_x":"3","destination_offset_y":"4","title":"Eine Verbindung"}
    var container1 = dangerbook.createContainer(elementData1);
    var container2 = dangerbook.createContainer(elementData2);
    var connection = dangerbook.createConnectionLine(connectionData, [container1, container2]);

    assert.ok(connection.startContainer.containerId === 3, "Passed");
    assert.ok(connection.endContainer.containerId === 2, "Passed");
    assert.ok(connection.startX === 1, "Passed");
    assert.ok(connection.startY === 2, "Passed");
    assert.ok(connection.endX === 3, "Passed");
    assert.ok(connection.endY === 4, "Passed");
    assert.ok(connection.title.text == "Eine Verbindung", "Passed");
});


QUnit.test("isAPapElement(element)", function(assert)
{
    var elementData1 = {"containerId":"3","x":"180","y":"400","type":"Action","title":"Insel gestrandet","text":"Du hast Schiffbruch erlitten."};
    var elementData2 = {"containerId":"2","x":"20","y":"10","type":"Action","title":"Kannibalen treffen","text":"Du triffst auf 5 Kannibalen."};
    var connectionData = {"source_id":"3","destination_id":"2","source_offset_x":"1","source_offset_y":"2","destination_offset_x":"3","destination_offset_y":"4","title":"Eine Verbindung"}
    var container1 = dangerbook.createContainer(elementData1);
    var container2 = dangerbook.createContainer(elementData2);
    var connection = dangerbook.createConnectionLine(connectionData, [container1, container2]);
    assert.ok(dangerbook.isAPapElement(container1) === true, "Passed");
    assert.ok(dangerbook.isAPapElement(connectionData) === false, "Passed");
});
