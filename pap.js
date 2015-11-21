var stage = null;

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
            });

        $(window).on('beforeunload', function()
            {
                var papElements = Array();
                for(var i = 0; i < stage.numChildren; ++i)
                {
                    var currentContainer = stage.getChildAt(i);
                    if(currentContainer.type) papElements.push({x:currentContainer.x, y:currentContainer.y, type:currentContainer.type, title:currentContainer.title, text:currentContainer.text});
                }
                $.post("test.php",
                        {
                            action: "save",
                            papElements: JSON.stringify(papElements)
                        },
                        function(data, status){
                        });
            });
}




function createPapElement(elementData)
{
    var dragPosition = {x:0, y:0};
    var text = new createjs.Text(elementData.title, "20px Arial", "#040000");
    var b = text.getBounds();
    var bounds = {};
    var factor = 1;
    if(elementData.type == "Condition") factor = 1.5;
    bounds.width = (b.width+30) * factor;
    bounds.height = (b.height+30) * factor;

    text.x = bounds.width/2 - b.width/2;
    text.y =  bounds.height/2 - b.height/2;
    text.textBaseline = "top";
     
    var shape = new createjs.Shape();


    switch(elementData.type)
    {
        case "Start":
            // fall through
        case "End":
            shape.graphics.beginFill("DeepSkyBlue").drawRoundRect(0, 0, bounds.width, bounds.height, 23);
            break;
        case "Action":
            shape.graphics.beginFill("DeepSkyBlue").drawRect(0, 0, bounds.width, bounds.height);
            break;
        case "Condition":
            shape.graphics.setStrokeStyle(1).beginStroke("Red").beginFill("DeepSkyBlue").moveTo(0, bounds.height/2).lineTo(bounds.width/2, 0).lineTo(bounds.width, bounds.height/2).lineTo(bounds.width/2, bounds.height).lineTo(0, bounds.height/2);
            break;
        default:
            throw "Type not found!";
    }


    var container = new createjs.Container();
    container.x = elementData.x;
    container.y = elementData.y;
    container.setBounds(0, 0, bounds.width, bounds.height);
    container.addChild(shape );
    container.addChild(text);
    container.text = elementData.text;
    container.title = elementData.title;
    container.type = elementData.type;

    container.on("mousedown", function(evt){
        dragPosition.x = evt.stageX - container.x;
        dragPosition.y = evt.stageY - container.y;
    });
    container.on("mousedown", function(){
        return;
            var containerBounds = container.getBounds();
            if(parseFloat(container.x) + containerBounds.width > parseFloat(document.body.style.width))
            {
                canvas.width = containerBounds.width + parseFloat(container.x);
                document.body.style.width = canvas.width;
            }
            stage.update();
            window.scrollBy(canvas.width, 0);
    });
    container.on("pressmove", function(evt) {
            container.x = evt.stageX - dragPosition.x;
            container.y = evt.stageY - dragPosition.y;
            var containerBounds = container.getBounds();
            if(container.x + containerBounds.width > parseInt(document.body.style.width))
            {
                canvas.width = containerBounds.width + container.x;
                document.body.style.width = canvas.width;
                window.scrollBy(canvas.width, 0);
            }
            stage.update();
    });
    stage.addChild(container);

    var line = new createjs.Shape();
    var startX = 500;
    var startY = 140;
    var endX = 500;
    var endY = 40;
    var length = 40;
    var angle = 20;
    var dx = endX - startX;
    var dy = endY - startY;
    var slope = dy/dx;
    alert(dx + ", " + dy + ", " + slope);
    if(endX < startX) angle = 180 - angle;
    var x1 = endX + length * Math.cos(-(180-angle) * (Math.PI/180) + Math.atan(slope));
    var y1 = endY + length * Math.sin(-(180-angle) * (Math.PI/180) + Math.atan(slope));
    var x2 = endX + length * Math.cos((180-angle) * (Math.PI/180) + Math.atan(slope));
    var y2 = endY + length * Math.sin((180-angle) * (Math.PI/180) + Math.atan(slope));
    line.graphics.setStrokeStyle(1).beginStroke("Green").moveTo(startX, startY).lineTo(endX, endY);
    line.graphics.setStrokeStyle(1).beginStroke("Red").moveTo(endX, endY).lineTo(x1, y1);
    line.graphics.setStrokeStyle(1).beginStroke("Blue").moveTo(endX, endY).lineTo(x2, y2);
    stage.addChild(line);
    stage.update();
}


