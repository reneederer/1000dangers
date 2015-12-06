QUnit.test("createContainer(elementData)", function(assert)
{
    var elementData = {"containerId":"3","x":"180","y":"400","type":"Action","title":"Insel gestrandet","text":"Du hast Schiffbruch erlitten."};
    container = createContainer(elementData);
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
    var container1 = createContainer(elementData1);
    var container2 = createContainer(elementData2);
    var connection = createConnectionLine(connectionData, [container1, container2]);

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
    var container1 = createContainer(elementData1);
    var container2 = createContainer(elementData2);
    var connection = createConnectionLine(connectionData, [container1, container2]);
    assert.ok(isAPapElement(container1) === true, "Passed");
    assert.ok(isAPapElement(connectionData) === false, "Passed");
});
































