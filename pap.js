'use strict';

(function(pap)
{
pap.options = {font: "14px Arial"};
pap.stage = null;
pap.selectedSymbol = null;
pap.dragArrow = null;
pap.connections = [];
pap.elements = [];


pap.init = function()
{
    Logger.useDefaults();
    Logger.setLevel(Logger.DEBUG);
    Logger.debug("pap.js:init()");
	var connectionContextMenu = document.getElementById("connectionContextMenu");
    var messageDiv            = document.getElementById("messageDiv");
    var canvasContextMenu     = document.getElementById("canvasContextMenu");
    var elementContextMenu    = document.getElementById("elementContextMenu");
    messageDiv.innerHTML      = "Neue Elemente erstellen mit Rechtsklick.";
    var canvas                = document.getElementById("canvas");
    canvas.width              = parseInt(document.body.style.width);
    canvas.height             = parseInt(document.body.style.height);
    pap.stage                 = new createjs.Stage("canvas");
    pap.stage.mouseEnabled    = true;

    createjs.Touch.enable(pap.stage);
    pap.dragArrow = pap.createArrow();
	pap.stage.addChild(pap.dragArrow.container);
    pap.relocatingArrow = {arrow: null, side: null};
    pap.load();
    pap.stage.addEventListener("stagemousemove",
        function(evt)
        {
            if(pap.relocatingArrow && pap.relocatingArrow.arrow)
            {
                if(pap.relocatingArrow.side === "start")
                {
                    pap.relocatingArrow.arrow.startX = evt.stageX;
                    pap.relocatingArrow.arrow.startY = evt.stageY;
                }
                else if(pap.relocatingArrow.side === "end")
                {
                    pap.relocatingArrow.arrow.endX = evt.stageX;
                    pap.relocatingArrow.arrow.endY = evt.stageY;
                }
                pap.drawArrow(pap.relocatingArrow.arrow);
                console.log("mouse");
                pap.stage.update();
            }
        });
    connectionContextMenu.addEventListener("mouseup", 
    	function(evt)
		{
            var canvasRect   = document.getElementById("canvas").getBoundingClientRect();
            var x            = parseInt(connectionContextMenu.style.left, 10) - canvasRect.left - window.pageXOffset;
            var y            = parseInt(connectionContextMenu.style.top, 10)  - canvasRect.top  - window.pageYOffset;
            var connectionIndex = pap.findConnectionIndex(pap.stage.getObjectUnderPoint(x, y));

			console.log(pap.getArrowShape(connectionContextMenu.triggeringConnection, "title").text);
			var item = pap.getChosenItem(evt);
			console.log(item);
            connectionContextMenu.style.display = "none";

            var item = pap.getChosenItem(evt);
            elementContextMenu.style.display = "None";
            if(item === "Startpunkt verschieben" || item === "Endpunkt verschieben")
            {
                pap.relocatingArrow =
                    {
                        arrow: pap.connections[connectionIndex],
                        previous: {
                            startElement: pap.connections[connectionIndex].startElement,
                            startX: pap.connections[connectionIndex].startX,
                            startY: pap.connections[connectionIndex].startY,
                            endElement: pap.connections[connectionIndex].endElement,
                            endX: pap.connections[connectionIndex].endX,
                            endY: pap.connections[connectionIndex].endY
                        }
                    };
                if(item === "Startpunkt verschieben")
                {
                    pap.relocatingArrow.side = "start";
                    pap.relocatingArrow.arrow.startX      += pap.relocatingArrow.previous.startElement.container.x;
                    pap.relocatingArrow.arrow.startY      += pap.relocatingArrow.previous.startElement.container.y;
                    pap.relocatingArrow.arrow.startElement = pap.stage;
                }
                else if(item === "Endpunkt verschieben")
                {
                    pap.relocatingArrow.side = "end";
                    pap.relocatingArrow.arrow.endX        += pap.relocatingArrow.previous.endElement.container.x;
                    pap.relocatingArrow.arrow.endX        += pap.relocatingArrow.previous.endElement.container.y;
                    pap.relocatingArrow.arrow.endElement   = pap.stage;
                }
            }

            if(escape(item) === "L%F6schen")
            {

                if(connectionIndex === -1)
                {
                    alert("Error: Connection not found");
                    return;
                }
                pap.stage.removeChild(pap.connections[connectionIndex].container);
                pap.connections.splice(connectionIndex, 1);
                pap.stage.update();
            }
		});

    canvasContextMenu.addEventListener("mouseup",
        function(evt)
        {
            var item = pap.getChosenItem(evt);
            var type = null;
            var elementWithLargestId = 
                pap.elements
                    .filter(pap.isAPapElement)
                    .reduce(function(previousChild, currentChild)
                        {
                            return (previousChild.elementId > currentChild.elementId)
                                ? previousChild
                                : currentChild;
                        }, {elementId:0});

            var elementId = elementWithLargestId.elementId + 1;



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
            var canvasX = event.pageX - canvas.offsetLeft + canvas.scrollLeft;
            var canvasY = event.pageY - canvas.offsetTop + canvas.scrollTop;
            elementModule.createPapElement(
                {elementId: elementId ,
                 x:         canvasX,
                 y:         canvasY,
                 title:     type,
                 text:      "Dieser Text wird spter angezeigt",
                 type:      type
                });
            pap.stage.update();
        }
    );

    elementContextMenu.addEventListener("mouseup",
        function(evt)
        {
            var item = pap.getChosenItem(evt);
            elementContextMenu.style.display = "None";
            if(escape(item) === "L%F6schen")
            {
                var canvasRect = document.getElementById("canvas").getBoundingClientRect();
                var x      = parseInt(elementContextMenu.style.left, 10) - canvasRect.left - window.pageXOffset;
                var y      = parseInt(elementContextMenu.style.top, 10) - canvasRect.top - window.pageYOffset;
                var elementIndex = pap.findElementIndex(pap.stage.getObjectUnderPoint(x, y));
                if(elementIndex === -1)
                {
                    console.log("Element not found");
                    return;
                }
                alert(elementIndex);
                pap.stage.removeChild(pap.elements[elementIndex].container);
                pap.elements.splice(elementIndex, 1);
                pap.stage.update();
            }
        }
    );
    pap.stage.on("stagemousedown", function(evt){
        canvasContextMenu.style.display = "none";
        elementContextMenu.style.display = "none";
        connectionContextMenu.style.display = "none";

        // Right click on empty space
        if(evt.nativeEvent.button === 2 && pap.stage.getObjectUnderPoint(evt.stageX, evt.stageY) === null)
        {
            canvasContextMenu.style.left    = evt.nativeEvent.pageX;
            canvasContextMenu.style.top     = evt.nativeEvent.pageY;
            canvasContextMenu.style.display = "inline";
        }
        else
        {
            pap.relocatingArrow = null;
        }

            
    });

    // Save when Ctrl-s is pressed
    window.addEventListener('keydown', function(event) {
        if ((event.ctrlKey || event.metaKey)
            && String.fromCharCode(event.which).toLowerCase() === 's')
        {
            messageDiv.innerHTML = "Speichere...";
            event.preventDefault();
            pap.save();
        }
    });

	window.addEventListener('beforeunload', function(){
		pap.save();
		createjs.Touch.disable(pap.stage);
	});

}

pap.repaint = function()
{
    pap.elements.forEach(function(currentElement){elementModule.paint(currentElement);});
    pap.stage.update();
}

pap.getChosenItem = function(evt)
{
    return evt.target.innerHTML;
}


pap.papTextChanged = function()
{
    if(!pap.selectedSymbol) { return; }
    pap.selectedSymbol.text = document.getElementById("txaPapText").value;
}

pap.papTitleChanged = function()
{
    if(!pap.selectedSymbol) { return; }
    elementModule.getElementShape(pap.selectedSymbol, "title").text = document.getElementById("txtPapTitle").value;
    pap.repaint();
}


pap.optionsChanged = function(evt)
{
    var optionText = document.getElementById("txaOptions").value;

    try{
        document.getElementById("messageDiv").innerHTML = "JSON korrekt"
        pap.options = JSON.parse(optionText);
    }
    catch(e){
        document.getElementById("messageDiv").innerHTML = "JSON fehlerhaft";
    }
    pap.repaint();
}


pap.isAConnection = function(symbol)
{
    return symbol.startElement && symbol.endElement && symbol !== pap.dragArrow;
}

pap.isAPapElement = function(symbol)
{
    return (symbol.elementId) ? true : false;
}

pap.isContainerOfAnElement = function(container)
{
    return pap.elements.some(
        function(currentElement)
        {
            return currentElement.container === container || (container.parent && currentElement.container == container.parent);
        });
}


pap.findElementIndex = function(container)
{
    if(!container)
    {
        return -1;
    }
    return pap.elements.findIndex(
        function(currentElement)
        {
            return currentElement.container === container || (container.parent && currentElement.container === container.parent);
        });
}

pap.findElement = function(container)
{
    if(!container)
    {
        return undefined;
    }
    return pap.elements.find(
        function(currentElement)
        {
            return currentElement.container === container || (container.parent && currentElement.container === container.parent);
        });
}


pap.findConnectionIndex = function(container)
{
    if(!container)
    {
        return -1;
    }
    return pap.connections.findIndex(
        function(currentConnection)
        {
            return currentConnection.container === container || (container.parent && currentConnection.container === container.parent);
        });
}
pap.drawArrow = function(arrow, shouldBeSelected)
{
    var arrowLine      = pap.getArrowShape(arrow, "line");
    var arrowTitle     = pap.getArrowShape(arrow, "title");
    var arrowBorder    = pap.getArrowShape(arrow, "border");
    var arrowEndPoints = elementModule.calculateArrowPoints(arrow);
    var arrowHitArea   = new createjs.Shape();
    elementModule.clearGraphics(arrow);
    arrowHitArea.graphics
        .beginFill("#000000") // the color doesn't matter since arrowHitArea is not displayed
        .moveTo(arrowEndPoints.a.x, arrowEndPoints.a.y)
        .lineTo(arrowEndPoints.b.x, arrowEndPoints.b.y)
        .lineTo(arrowEndPoints.c.x, arrowEndPoints.c.y)
        .lineTo(arrowEndPoints.d.x, arrowEndPoints.d.y)
        .lineTo(arrowEndPoints.a.x, arrowEndPoints.a.y);
    arrowLine.hitArea = arrowHitArea;
    if(shouldBeSelected)
    {
        arrowBorder.graphics
            .setStrokeDash([10, 10], 0)
            .setStrokeStyle(3)
            .beginStroke(pap.options.selectedColor)
            .moveTo(arrowEndPoints.a.x, arrowEndPoints.a.y)
            .lineTo(arrowEndPoints.b.x, arrowEndPoints.b.y)
            .lineTo(arrowEndPoints.c.x, arrowEndPoints.c.y)
            .lineTo(arrowEndPoints.d.x, arrowEndPoints.d.y)
            .lineTo(arrowEndPoints.a.x, arrowEndPoints.a.y);
    }
    arrowLine.graphics
        .setStrokeDash()
        .setStrokeStyle(4)
        .beginStroke("Green")
        .moveTo(arrowEndPoints
        .startX, arrowEndPoints.startY)
        .lineTo(arrowEndPoints.endX, arrowEndPoints.endY);
    arrowLine.graphics
        .setStrokeStyle(4)
        .beginStroke("Red")
        .moveTo(arrowEndPoints.endX, arrowEndPoints.endY)
        .lineTo(arrowEndPoints.x1, arrowEndPoints.y1);
    arrowLine.graphics.setStrokeStyle(4)
    .beginStroke("Blue")
    .moveTo(arrowEndPoints.endX, arrowEndPoints.endY)
    .lineTo(arrowEndPoints.x2, arrowEndPoints.y2);

    var b = arrowTitle.getBounds() || new createjs.Rectangle(0, 0, 0, 0); // this is necessary because otherwise an exception is thrown when arrowTitle.text == ""
    arrowTitle.x = Math.abs(arrowEndPoints.endX + arrowEndPoints.startX)/2;
    arrowTitle.y = Math.abs(arrowEndPoints.endY + arrowEndPoints.startY)/2;
    arrowTitle.regX = b.width / 2;
    arrowTitle.regY = b.height / 2;
    arrowTitle.rotation = arrowEndPoints.degrees;
    pap.stage.update();
}


pap.load = function()
{
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("POST", "dbinteraction.php");
    xmlhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xmlhttp.onreadystatechange = function()
    {
        if(xmlhttp.readyState === XMLHttpRequest.DONE)
        {
            var loaded = new Object(JSON.parse(xmlhttp.responseText));
            var txaPapText = document.getElementById("txaPapText");
            var txtPapTitle = document.getElementById("txtPapTitle");
            var papElements = loaded.papElements;
            var papConnections = loaded.papConnections;

            pap.options = loaded.options;
            var txaOptions = document.getElementById("txaOptions");
            txaOptions.value = JSON.stringify(pap.options, null, 4);
            txaOptions.addEventListener("input", function(evt){pap.optionsChanged(evt);});

            txaPapText.addEventListener("input", function(evt){pap.papTextChanged(evt);});
            txaPapText.style.font = pap.options.font;

            txtPapTitle.addEventListener("input", function(evt){pap.papTitleChanged(evt);});
            txtPapTitle.style.font = pap.options.font;

            papElements.forEach(function(currentPapElement){elementModule.createPapElement(currentPapElement);});
            papConnections.forEach(
                function(currentPapConnection)
                {
                    pap.connections.push(pap.createArrow(currentPapConnection));
                    pap.stage.addChild(pap.connections[pap.connections.length-1].container);
                });
            var startElement = pap.elements.find(function(el){return el.type === "Start";});

            //if(startElement) papbook.nextBookText(startElement.elementId);
            pap.stage.update();
        }
    };
    xmlhttp.send("action=load");

}


pap.save = function()
{
    var papElements = [];
    pap.elements.forEach(function(currentElement)
    {
        papElements.push({id:currentElement.elementId,
                          x:currentElement.container.x,
                          y:currentElement.container.y,
                          type:currentElement.type,
                          title:elementModule.getElementShape(currentElement, "title").text,
                          text:currentElement.text});
    });
    var papConnections = [];
    pap.connections.forEach(function(currentConnection)
    {
        papConnections.push({source_id:currentConnection.startElement.elementId,
                         destination_id: currentConnection.endElement.elementId,
                         source_offset_x: currentConnection.startX,
                         source_offset_y: currentConnection.startY,
                         destination_offset_x: currentConnection.endX,
                         destination_offset_y: currentConnection.endY,
                         title: pap.getArrowShape(currentConnection, "title").text});
    });

    //TODO delete above when this works
    var paps = {"elements" : papElements, "connections" : papConnections};

    var papUpload = "action=save&pap=" + JSON.stringify(paps);
    var xmlhttp   = new XMLHttpRequest();
    xmlhttp.open("POST", "dbinteraction.php");
    xmlhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xmlhttp.onreadystatechange = function()
    {
        if (xmlhttp.readyState === XMLHttpRequest.DONE)
        {
            messageDiv.innerHTML = "Gespeichert!";
        }
    }
    xmlhttp.send(papUpload);
}


pap.getSymbols = function()
{
    return pap.elements.concat(pap.connections);
}


pap.selectSymbol = function(symbolToSelect)
{
    pap.elements
        .concat(pap.connections)
        .forEach(function(currentSymbol)
        {
            currentSymbol.drawBorder(currentSymbol === symbolToSelect);
        });
    pap.selectedSymbol = symbolToSelect;
    pap.stage.update();
}


pap.bringToFront = function(container)
{
    //FIXME
    return;

	console.log("front")
	if(container) pap.stage.setChildIndex(container, pap.stage.numChildren-1);
    pap.stage.children.sort(function(a, b){
		if(pap.isAConnection(a) && pap.isAPapElement(b)) {console.log("tausch");return -1; }
		if(pap.isAPapElement(a) && pap.isAConnection(b)) return 1;
        return 0;
    });
    pap.stage.update();
}


pap.getArrowShape = function(arrow, shapeName)
{
    return arrow.container.children.find(
        function(shape){return shape.name === shapeName;});
}


pap.createArrow = function(connectionData)
{
    var arrow         = {};
    arrow.line        = new createjs.Shape();
    arrow.line.name   = "line";
    arrow.border      = new createjs.Shape();
    arrow.border.name = "border";
    arrow.title       = new createjs.Text(connectionData ? connectionData.title : "", pap.options.font, "#f40000");
    arrow.title.name  = "title";

    arrow.container = new createjs.Container();
    arrow.container.addChild(arrow.border);
    arrow.container.addChild(arrow.line);
    arrow.container.addChild(arrow.title);

    arrow.title.x            = 0;
    arrow.title.y            = 0;
    arrow.title.regX         = 0;
    arrow.title.regY         = 0;
    arrow.title.textBaseline = "middle";
    arrow.line.hitArea       = arrow.border;

    arrow.drawBorder   = function(shouldBeSelected)
    {
        pap.drawArrow(arrow, shouldBeSelected);
    }

    if(connectionData)
    {
        arrow.startElement = pap.elements.find(function(el){return el.elementId === +connectionData.source_id;});
        arrow.startX       = +connectionData.source_offset_x;
        arrow.startY       = +connectionData.source_offset_y;
        arrow.endElement   = pap.elements.find(function(el){return el.elementId === +connectionData.destination_id;});
        arrow.endX         = +connectionData.destination_offset_x;
        arrow.endY         = +connectionData.destination_offset_y;
    }
    else
    {
        // Faking start and end element
        arrow.startElement = {container:{x:0, y:0}};
        arrow.startX       = 0;
        arrow.startY       = 0;
        arrow.endElement   = {container:{x:0, y:0}};
        arrow.endX         = 0;
        arrow.endY         = 0;
    }

    arrow.line.on("mousedown", function(evt){
        //alert("linemousedown");
        pap.selectSymbol(arrow);
        var connectionContextMenu = document.getElementById("connectionContextMenu");
        if(evt.nativeEvent.button === 0) // left down
        {
            //document.getElementById("txaPapText").value = container.text;
            //document.getElementById("papTitle").value = container.title;
            //pap.bringToFront(null);
            //pap.selectSymbol(container);
            //startDrag(container, evt.stageX, evt.stageY);
            connectionContextMenu.style.display = "hidden";
        }
        else
        {
            connectionContextMenu.style.left           = evt.nativeEvent.pageX;
            connectionContextMenu.style.top            = evt.nativeEvent.pageY;
            connectionContextMenu.style.display        = "inline";
            connectionContextMenu.triggeringConnection = pap.dragArrow;
        }
    });

    pap.drawArrow(arrow);
    return arrow;
}


})(window.pap = window.pap || {});



