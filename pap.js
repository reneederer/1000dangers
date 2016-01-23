'use strict';

(function(pap)
{
pap.options = {font: "14px Arial"};
pap.stage = null;
pap.selectedContainer = null;
pap.dragArrow = null;
pap.connections = [];
pap.elements = [];


pap.init = function()
{
	var connectionContextMenu = document.getElementById("connectionContextMenu");
    var messageDiv = document.getElementById("messageDiv");
    var canvasContextMenu = document.getElementById("canvasContextMenu");
    var elementContextMenu = document.getElementById("elementContextMenu");
    messageDiv.innerHTML = "Neue Elemente erstellen mit Rechtsklick.";
    var canvas = document.getElementById("canvas");
    canvas.width = parseInt(document.body.style.width);
    canvas.height = parseInt(document.body.style.height);
    pap.stage = new createjs.Stage("canvas");
    pap.stage.mouseEnabled = true;

    createjs.Touch.enable(pap.stage);
    pap.dragArrow = pap.createArrow();
	pap.stage.addChild(pap.dragArrow.container);
    pap.load();
    connectionContextMenu.addEventListener("mouseup", 
    	function(evt)
		{
			element.contextMenuClicked();
			alert(connectionContextMenu.triggeringConnection.title.text);

			var item = pap.getChosenItem(evt);
			alert(item);
		});

    var rect = canvas.getBoundingClientRect();
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
            elementModule.createPapElement({elementId:elementId , x:canvasX, y:canvasY, title:type, text:"Dieser Text wird spter angezeigt", type:type});
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
                var x = event.pageX - canvas.offsetLeft + canvas.scrollLeft;
                var y = event.pageY - canvas.offsetTop + canvas.scrollTop;
                var o = pap.stage.getObjectUnderPoint(x, y);
                while(o && o.parent && !pap.isAPapElement(o))
                {
                    o = o.parent;
                }
                if(o &&pap.isAPapElement(o))
                {
                    pap.stage.removeChild(o);
                    pap.stage.update();
                }
            }
        }
    );
    pap.stage.on("stagemousedown", function(evt){
        if(evt.nativeEvent.button === 2 && pap.stage.getObjectUnderPoint(evt.stageX, evt.stageY) === null)
        {
            canvasContextMenu.style.left = evt.nativeEvent.pageX;
            canvasContextMenu.style.top = evt.nativeEvent.pageY;
            canvasContextMenu.style.display = "inline";
        }

            
    });

    //save when Ctrl-s is pressed
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


pap.papTextChanged = function(evt)
{
    if(!pap.selectedContainer) { return; }
    pap.selectedContainer.text = document.getElementById("papText").value;
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


pap.findElement = function(container)
{
    return pap.elements.find(
        function(currentElement)
        {
            return currentElement.container === container || (container.parent && currentElement.container === container.parent);
        });
}


pap.drawArrow = function(arrow)
{
    var arrowLine = pap.getArrowLine(arrow);
    var arrowTitle = pap.getArrowTitle(arrow);
    var arrowEndPoints = elementModule.calculateArrowPoints(arrow);
    elementModule.clearGraphics(arrow);
    arrowLine.graphics.setStrokeDash().setStrokeStyle(4).beginStroke("Green").moveTo(arrowEndPoints.startX, arrowEndPoints.startY).lineTo(arrowEndPoints.endX, arrowEndPoints.endY);
    arrowLine.graphics.setStrokeStyle(4).beginStroke("Red").moveTo(arrowEndPoints.endX, arrowEndPoints.endY).lineTo(arrowEndPoints.x1, arrowEndPoints.y1);
    arrowLine.graphics.setStrokeStyle(4).beginStroke("Blue").moveTo(arrowEndPoints.endX, arrowEndPoints.endY).lineTo(arrowEndPoints.x2, arrowEndPoints.y2);

    var b = arrowTitle.getBounds();
    arrowTitle.x = Math.abs(arrowEndPoints.endX+arrowEndPoints.startX)/2;
    arrowTitle.y = Math.abs(arrowEndPoints.endY+arrowEndPoints.startY)/2;
    arrowTitle.regX = b.width/2;
    arrowTitle.regY = b.height/2;
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
            var papText = document.getElementById("papText");
            var papElements = loaded.papElements;
            var papConnections = loaded.papConnections;

            pap.options = loaded.options;
            var txaOptions = document.getElementById("txaOptions");
            txaOptions.value = JSON.stringify(pap.options, null, 4);
            txaOptions.addEventListener("input", function(evt){pap.optionsChanged(evt);});

            papText.addEventListener("input", function(evt){pap.papTextChanged(evt);});
            papText.style.font = pap.options.font;

            papElements.forEach(function(currentPapElement){pap.elements.push(elementModule.createPapElement(currentPapElement));});
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

    //TODO remove to save
    //return;

    var papElements = [];
    pap.elements.forEach(function(currentElement)
    {
        papElements.push({id:currentElement.elementId,
                          x:currentElement.container.x,
                          y:currentElement.container.y,
                          type:currentElement.type,
                          title:elementModule.getTitle(currentElement.container).text,
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
                         title: pap.getArrowTitle(currentConnection).text});
    });

    //TODO delete above when this works
    var paps = {"elements" : papElements, "connections" : papConnections};

    var papUpload = "action=save&pap=" + JSON.stringify(paps);
    var xmlhttp = new XMLHttpRequest();
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
    console.log(symbolToSelect)
    //TODO
   // pap.getSymbols().
    pap.elements.
    forEach(function(currentSymbol)
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



pap.changeTitle = function(element){
/*    //TODO the size of a papElement should adapt to the content
    var it = element;
    if(element.title && element.title.text)
    {
        it = element.title;
    }
    var newText = prompt("Bitte gib den Titel fuer diese Verbindungslinie ein:", it.text);
    if(newText !== null ){ it.text = newText; }
    pap.stage.update();
*/
}

pap.getArrowBorder = function(arrow)
{
    return arrow.container.getChildAt(0);
}

pap.getArrowLine = function(arrow)
{
    return arrow.container.getChildAt(1);
}

pap.getArrowTitle = function(arrow)
{
    return arrow.container.getChildAt(2);
}

pap.createArrow = function(connectionData)
{
    var container = new createjs.Container();
    var arrow = {};
    var line = new createjs.Shape();
    var border = new createjs.Shape();
    var title = new createjs.Text(connectionData ? connectionData.title : " ", pap.options.font, "#040000");
    container.addChild(border);
    container.addChild(line);
    container.addChild(title);
    title.x =           0;
    title.y =           0;
    title.regX =        0;
    title.regY =        0;
    title.textBaseline = "middle";
    line.hitArea =           arrow.border;
    arrow.container =       container;

    if(connectionData)
    {
        arrow.startElement =    pap.elements.find(function(el){return el.elementId === +connectionData.source_id;});
        arrow.startX =            +connectionData.source_offset_x;
        arrow.startY =            +connectionData.source_offset_y;
        arrow.endElement =      pap.elements.find(function(el){return el.elementId === +connectionData.destination_id;});
        arrow.endX =              +connectionData.destination_offset_x;
        arrow.endY =              +connectionData.destination_offset_y;
    }
    else
    {
        // Faking start and end element
        arrow.startElement =      {container:{x:0, y:0}};
        arrow.startX =            0;
        arrow.startY =            0;
        arrow.endElement =        {container:{x:0, y:0}};
        arrow.endX =              0;
        arrow.endY =              0;
    }

    line.on("mousedown", function(evt){
        alert("linemousedown");
        pap.selectSymbol(arrow);
        var connectionContextMenu = document.getElementById("connectionContextMenu");
        if(evt.nativeEvent.button === 0) // left down
        {
            //document.getElementById("papText").value = container.text;
            //document.getElementById("papTitle").value = container.title;
            //pap.bringToFront(null);
            //pap.selectSymbol(container);
            //startDrag(container, evt.stageX, evt.stageY);
            connectionContextMenu.style.display = "hidden";
        }
        else
        {
            connectionContextMenu.style.left = evt.nativeEvent.pageX; 
            connectionContextMenu.style.top = evt.nativeEvent.pageY; 
            connectionContextMenu.style.display = "inline";
            connectionContextMenu.triggeringConnection = pap.dragArrow;
        }
    });

    pap.drawArrow(arrow);

    return arrow;
}


})(window.pap = window.pap || {});



