'use strict';

(function(elementModule)
{
elementModule.containerDragOffset = null;


elementModule.getContainerBounds = function(title, type, innerPadding)
{
    var titleBounds = title.getBounds() || new createjs.Rectangle(0, 0, 0, 0); //this is necessary, otherwise an exception is thrown when title.text == ""

    var bounds =
    {
        width:  titleBounds.width + 2*innerPadding + 2*pap.options.borderSize,
        height: titleBounds.height + 2*innerPadding + 2*pap.options.borderSize
    };

    var outer = 0;
    if(type === "Condition")
    {
        var innerS     = {x:Math.cos(Math.PI/4) * (innerPadding), y:Math.sin(Math.PI/4) * (innerPadding)};
        bounds.width   = titleBounds.width + 2*(innerS.x + innerS.y);
        bounds.height  = bounds.width;
        var outerS     = {x:Math.cos(Math.PI/4) * (pap.options.borderSize) , y:Math.sin(Math.PI/4) * (pap.options.borderSize)};
        outer          = outerS.x + outerS.y;

        bounds.width  += 2*outer;
        bounds.height  = bounds.width;
    }
    return {bounds:bounds, titleBounds:titleBounds, outer:outer};
}


elementModule.getElementShape = function(element, shapeName)
{
    return element.container.children.find(
        function(shape){
            return shape.name === shapeName;
        });
}


elementModule.getContainer = function(shape)
{
    // TODO assert that shape.parent instanceof createjs.Container
    return shape.parent;
}


elementModule.paint = function(element)
{
    var container       = element.container;
    var border          = elementModule.getElementShape(element, "border");
    var inside          = elementModule.getElementShape(element, "inside");
    var title           = elementModule.getElementShape(element, "title");
    title.font          = pap.options.font;
    var containerBounds = elementModule.getContainerBounds(title, element.type, pap.options.innerPadding);
    container.width     = containerBounds.bounds.width;
    container.height    = containerBounds.bounds.height;
    title.x             = containerBounds.bounds.width/2 - containerBounds.titleBounds.width/2;
    title.y             = containerBounds.bounds.height/2 - containerBounds.titleBounds.height/2;
    border.graphics.clear();
    inside.graphics.clear();

    switch(element.type)
    {
        case "Start":
            // fall through
        case "End":
            border.graphics.beginFill(pap.options.borderColor).drawRoundRect(0, 0, containerBounds.bounds.width, containerBounds.bounds.height, 33);
            inside.graphics.beginFill(pap.options.mainColor).drawRoundRect(pap.options.borderSize, pap.options.borderSize, containerBounds.bounds.width-2*pap.options.borderSize, containerBounds.bounds.height-2*pap.options.borderSize, 23);
            element.drawBorder = function(shouldDrawBorder)
            {
                if(shouldDrawBorder)
                {
                    border.graphics.setStrokeStyle(pap.options.borderSize).beginStroke(pap.options.borderColor).setStrokeDash([10, 10], 0).setStrokeStyle(3).beginStroke(pap.options.selectedColor).beginFill(pap.options.borderColor).drawRoundRect(0, 0, container.width, container.height, 33);
                }
                else
                {
                    border.graphics.clear();
                    border.graphics.beginFill(pap.options.borderColor).drawRoundRect(0, 0, containerBounds.bounds.width, containerBounds.bounds.height, 33);
                }
            }
            break;

        case "Action":
            border.graphics.beginFill(pap.options.borderColor).drawRect(0, 0, containerBounds.bounds.width, containerBounds.bounds.height);
            inside.graphics.beginFill(pap.options.mainColor).drawRect(pap.options.borderSize, pap.options.borderSize, containerBounds.bounds.width-2*pap.options.borderSize, containerBounds.bounds.height-2*pap.options.borderSize);
            element.drawBorder = function(shouldDrawBorder)
            {
                if(shouldDrawBorder)
                {
                    border.graphics.setStrokeStyle(pap.options.borderSize).setStrokeDash([10, 10], 0).beginStroke(pap.options.borderColor).setStrokeStyle(3).beginStroke(pap.options.selectedColor).beginFill(pap.options.borderColor).drawRect(0, 0, containerBounds.bounds.width, containerBounds.bounds.height, 23);
                }
                else
                {
                    border.graphics.clear();
                    border.graphics.beginFill(pap.options.borderColor).drawRect(0, 0, containerBounds.bounds.width, containerBounds.bounds.height);
                }
            }
            break;

        case "Condition":
            border.graphics.beginFill(pap.options.borderColor).moveTo(4, containerBounds.bounds.height/2).lineTo(containerBounds.bounds.width/2, 4).lineTo(containerBounds.bounds.width-4, containerBounds.bounds.height/2).lineTo(containerBounds.bounds.width/2, containerBounds.bounds.height-4).lineTo(4, containerBounds.bounds.height/2);
            inside.graphics.beginFill(pap.options.mainColor).moveTo(containerBounds.outer, containerBounds.bounds.height/2).lineTo(containerBounds.bounds.width/2, containerBounds.outer).lineTo(containerBounds.bounds.width-containerBounds.outer, containerBounds.bounds.height/2).lineTo(containerBounds.bounds.width/2, containerBounds.bounds.height-containerBounds.outer).lineTo(containerBounds.outer, containerBounds.bounds.height/2);
            element.drawBorder = function(shouldDrawBorder)
            {
                if(shouldDrawBorder)
                {
                    border.graphics.setStrokeStyle(3).setStrokeDash([10, 10], 0).beginStroke(pap.options.selectedColor).moveTo(0, containerBounds.bounds.height/2).lineTo(containerBounds.bounds.width/2, 0).lineTo(containerBounds.bounds.width-0, containerBounds.bounds.height/2).lineTo(containerBounds.bounds.width/2, containerBounds.bounds.height-0).lineTo(0, containerBounds.bounds.height/2);
                }
                else
                {
                    border.graphics.clear();
                    border.graphics.beginFill(pap.options.borderColor).moveTo(0, containerBounds.bounds.height/2).lineTo(containerBounds.bounds.width/2, 0).lineTo(containerBounds.bounds.width, containerBounds.bounds.height/2).lineTo(containerBounds.bounds.width/2, containerBounds.bounds.height).lineTo(0, containerBounds.bounds.height/2);
                }
            }
            break;

        default:
            console.log("Data type " + elementData.type + " not found!");
    }

}

elementModule.createContainer = function(element, elementData)
{
    var container = new createjs.Container();
    var title     = new createjs.Text(elementData.title, pap.options.font, "#040000");
    var border    = new createjs.Shape();
    var inside    = new createjs.Shape();

    title.name = "title";
    border.name = "border";
    inside.name = "inside";
    title.titleBaseline = "top";
    container.x   = +elementData.x;
    container.y   = +elementData.y;


    /*
        Be careful:
            The order in which the shapes are 
            added to the container matters!
    */
    container.addChild(border);
    container.addChild(inside);
    container.addChild(title);

    element.text      = elementData.text;
    element.type      = elementData.type;
    element.container = container;

    pap.elements.push(element);
    elementModule.paint(element);

    return container;
}


elementModule.redrawAffectedArrows = function(draggedElement)
{
    pap.connections
        .filter(function(currentConnection)
        {
                return (currentConnection.startElement === draggedElement || currentConnection.endElement === draggedElement);
        })
        .forEach(function(currentConnection)
        {
            pap.drawArrow(currentConnection);
        });

    pap.stage.update();
}


elementModule.clearGraphics = function(element)
{
    if(!element.container)
    {
        return;
    }
    element.container.children
        .filter(function(child){return child.graphics;})
        .forEach(function(child){child.graphics.clear();});
}


elementModule.createPapElement = function(elementData)
{
    var element       = {};
    element.elementId = +elementData.elementId;
    element.text      = elementData.text;
    element.type      = elementData.type;
    element.type      = elementData.type;

    var container = elementModule.createContainer(element, elementData);

    var elementInside                 = elementModule.getElementShape(element, "inside");
    var elementBorder                 = elementModule.getElementShape(element, "border");
    var elementTitle                  = elementModule.getElementShape(element, "title");
    elementModule.containerDragOffset = {x:0, y:0};


    container.on("mousedown", function(evt){
        var elementContextMenu = document.getElementById("elementContextMenu");
        if(evt.nativeEvent.button === 0) // left down
        {
            elementModule.containerDragOffset.x          = evt.stageX - container.x;
            elementModule.containerDragOffset.y          = evt.stageY - container.y;
            document.getElementById("txaPapText").value  = element.text;
            document.getElementById("txtPapTitle").value = elementModule.getElementShape(element, "title").text;
            pap.bringToFront(container);
            pap.selectSymbol(element);

            elementContextMenu.style.display     = "hidden";
            pap.dragArrow.startElement           = element
            pap.dragArrow.startX                 = evt.stageX - container.x;
            pap.dragArrow.startY                 = evt.stageY - container.y;
        }
        else
        {
            elementContextMenu.style.left    = evt.nativeEvent.pageX;
            elementContextMenu.style.top     = evt.nativeEvent.pageY;
            elementContextMenu.style.display = "inline";
        }
    });


    var pressMoveInside = function(evt)
    {
        container.x =  evt.stageX - elementModule.containerDragOffset.x;
        container.y =  evt.stageY - elementModule.containerDragOffset.y;
        elementModule.redrawAffectedArrows(pap.findElement(container));
        pap.stage.update();
    }

    elementInside.on("pressmove", function(evt) {
        pressMoveInside(evt);
    });

    elementTitle.on("pressmove", function(evt) {
        pressMoveInside(evt);
    });


    elementBorder.on("pressmove", function(evt) {
		pap.dragArrow.endX = evt.stageX;
		pap.dragArrow.endY = evt.stageY;
        
		pap.drawArrow(pap.dragArrow);
    });


    elementBorder.on("pressup", function(evt){
        var messageDiv = document.getElementById("messageDiv");
        var endElement = 
            (function()
             {
                 var papElementsAtPoint = pap.stage
                                    .getObjectsUnderPoint(evt.stageX, evt.stageY)
                                    .map(pap.findElement);

                 if(papElementsAtPoint.length > 0)
                 {
                     return (papElementsAtPoint[0]);
                 }
                 return undefined;
             })();


        var canConnect = function()
            {
                if(!pap.isAPapElement(pap.dragArrow.startElement))
                {
                    return {connectable:false, message:"" };
                }
                var isAlreadyConnected = pap.connections.some(function(currentConnection)
                {
                    return currentConnection.startElement === pap.dragArrow.startElement && currentConnection.endElement === endElement;
                });

                // prevent multiple pap.connections to and from the same elements
                console.log("isalreadyConnected");
                if(isAlreadyConnected)
                {
                    return {connectable:false, message:"Die Elemente sind bereits verbunden." };
                }



                console.log("endElement exists");
                if(!endElement)
				{
					return { connectable: false,  message:"" };
				}


                // prevent self connection
                console.log("self connection");
                if(pap.dragArrow.startElement === endElement)
                {
                    return {connectable:false, message:"" };
                }


                // end-element cannot be the startElement
                console.log("end-element is startelement");
                if(pap.dragArrow.startElement.type === "End")
                {
                    return {connectable:false, message:"Das \"Ende-Element\" kann kein Verbindungsbeginn sein." };
                }


                // start-element cannot be the endElement
                console.log("start-element is endelement");
                if(endElement.type === "Start")
                {
                    return {connectable:false, message:"Das \"Start-Element\" kann kein Verbindungsende sein." };
                }

                // start-element and action-elements can have 0 or 1 successors
                console.log("more than 1 successor")
                if(pap.dragArrow.startElement.type === "Start" || pap.dragArrow.startElement.type === "Action")
                {
                    var hasSuccessor = pap.connections.some(function(currentConnection)
                        {
                            return currentConnection !== pap.dragArrow&& currentConnection.startElement === pap.dragArrow.startElement;
                        })
                    if(hasSuccessor)
                    {
						return {connectable:false, message:"Start-Element und Aktions-Elemente k&ouml;nnen h&ouml;chstens einen Nachfolger haben." };
                    }
                }
                console.log("ok")
				return {connectable:true, message:"Neue Verbindung erstellt." };
           };

        var connectableStatus = canConnect();
        messageDiv.innerHTML  = connectableStatus.message;

        if(endElement && connectableStatus.connectable)
        {
            pap.dragArrow.endElement = endElement;
            pap.dragArrow.endX       = evt.stageX - endElement.container.x;
            pap.dragArrow.endY       = evt.stageY - endElement.container.y;
            pap.connections.push(pap.dragArrow);

            pap.dragArrow = pap.createArrow();
            pap.stage.addChild(pap.dragArrow.container);
        }
        elementModule.clearGraphics(pap.dragArrow);
        pap.bringToFront(container);
        pap.stage.update();
    });
    pap.stage.addChild(element.container);
    return element;
}


elementModule.calculateArrowPoints = function(arrow)
{
    //TODO This is a little hacky perhaps
    if(!arrow.endElement.container)
    {
        arrow.endElement.container = {x:0, y:0};
    }
    if(!arrow.startElement.container)
    {
        arrow.startElement.container = {x:0, y:0};
    }
    var startX = +arrow.startX + +arrow.startElement.container.x;
    var startY = +arrow.startY + +arrow.startElement.container.y;
    var endX   = +arrow.endX   + +arrow.endElement.container.x;
    var endY   = +arrow.endY   + +arrow.endElement.container.y;


    if(endX === startX && endY === startY)
    {
        endX += 2;
        endY += 2;
    }
    var length               = 40;
    var angle                = 20;
    var dx                   = endX - startX;
    var dy                   = endY - startY;
    var slope                = dy/dx;
    if(endX < startX){ angle = 180 - angle;}
    var x1                   = endX + length * Math.cos(-(180-angle) * (Math.PI/180) + Math.atan(slope));
    var y1                   = endY + length * Math.sin(-(180-angle) * (Math.PI/180) + Math.atan(slope));
    var x2                   = endX + length * Math.cos((180-angle) * (Math.PI/180) + Math.atan(slope));
    var y2                   = endY + length * Math.sin((180-angle) * (Math.PI/180) + Math.atan(slope));

    var distance = 4+length/Math.sin(90*Math.PI/180) * Math.sin(angle*Math.PI/180);
    // a, b, c and d are the edges of
    // the selection rectangle around the arrow
    var a        = {x:startX + distance*Math.cos(Math.atan(slope)+Math.PI/2), y:startY + distance*Math.sin(Math.atan(slope)+Math.PI/2)};
    var b        = {x:startX + distance*Math.cos(Math.atan(slope)-Math.PI/2), y:startY + distance*Math.sin(Math.atan(slope)-Math.PI/2)};
    var c        = {x:endX + distance*Math.cos(Math.atan(slope)-Math.PI/2), y:endY + distance*Math.sin(Math.atan(slope)-Math.PI/2)};
    var d        = {x:endX + distance*Math.cos(Math.atan(slope) + Math.PI/2), y:endY + distance*Math.sin(Math.atan(slope) + Math.PI/2)};

    return {degrees:180/Math.PI * Math.atan(slope), startX:startX, startY:startY, endX:endX, endY:endY, x1:x1, y1:y1, x2:x2, y2:y2, a:a, b:b, c:c, d:d};
}

})(window.elementModule = window.elementModule || {});







