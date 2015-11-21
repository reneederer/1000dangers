var stage = null;

function init()
{stage = new createjs.Stage("canvas");
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
                        $.post("test.php",
                                {
                                    action: "save",
                                    //TODO
                                    papElements: ""
                                },
                                function(data, status){
                                });
                    });
}




function createPapElement(elementData)
{
    var dragPosition = {x:0, y:0};
    var text = new createjs.Text(elementData.title, "16px Arial", "#040000");
    var b = text.getBounds();
    var bounds = {};
    var factor = 1;
    if(elementData.type == "Condition") factor = 1.5;
    bounds.width = (b.width+40) * factor;
    bounds.height = (b.height+40) * factor;

    text.x = bounds.width/2 - b.width/2;
    text.y =  bounds.height/2 - b.height/2;
    text.textBaseline = "top";
     
    var shape = new createjs.Shape();

    shape.text = elementData.text;
    shape.title = elementData.title;
    shape.type = elementData.type;


    switch(shape.type)
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
    container.on("mousedown", function(evt){
        dragPosition.x = evt.stageX - container.x;
        dragPosition.y = evt.stageY - container.y;
    });
    container.on("pressmove", function(evt) {
            container.x = evt.stageX - dragPosition.x;
            container.y = evt.stageY - dragPosition.y;
            stage.update();
    });
    stage.addChild(container);

    //line.graphics.setStrokeStyle(2).beginStroke("Green").moveTo(0, 0).lineTo(250, 250).lineTo(250-15, 250-15).moveTo(250, 250).lineTo(250);



    stage.update();
}


