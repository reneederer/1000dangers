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
                alert(data);
                var papElements = JSON.parse(data);
                for(var el in papElements)
                {
                    createPapElement(papElements[el]);
                }
            });

    $(window).on('resize', function()
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
                            alert(data);
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
            //fallthrough
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
    line.graphics.setStrokeStyle(2).beginStroke("Green").moveTo(0, 0).lineTo(250, 250).lineTo(250-15, 250-15).moveTo(250, 250).lineTo(250);
    stage.addChild(line);



    stage.update();
}


