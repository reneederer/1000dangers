<?php
session_start();
$_SESSION['1000dangersbook_name'] = '1000 Gefahren';
$_SESSION['team_id'] = 1;
$_SESSION['team_name'] = 'rene';

//$conn = new PDO('mysql:host=fdb6.biz.nf;dbname=1998294_db', '1998294_db', 'Nuernberg12');
$conn = new PDO('mysql:host=localhost;dbname=1998294_db', '1998294_db', 'Nuernberg12');
$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

if(!isset($_POST['action']))
{
    return;
}

if($_POST['action'] == 'loadPapElements')
{
    $papElements = loadPapElements();
    echo json_encode($papElements);

}
else if($_POST['action'] == 'loadConnections')
{
    $papConnections = loadPapConnections();
    echo json_encode($papConnections);
}
else if($_POST['action'] == 'savePapElements')
{
    savePapElements(json_decode($_POST['papElements'], true));
}
else if($_POST['action'] == 'saveConnections')
{
    savePapConnections(json_decode($_POST['papConnections'], true));
}


function loadPapElements()
{
    global $conn;
    $statement = $conn->prepare('
        select papelement.id as containerId, x, y, paptype.name as type, title, text
        from papelement
        join 1000dangersbook
          on papelement.1000dangersbook_id = 1000dangersbook.id
        join team
           on 1000dangersbook.team_id = :team_id
        join paptype
          on papelement.paptype_id = paptype.id
        where
          1000dangersbook_id = (select max(1000dangersbook.id) from 1000dangersbook where 1000dangersbook.name = :1000dangersbook_name)');
    $statement->bindParam(':team_id', $_SESSION['team_id']);
    $statement->bindParam(':1000dangersbook_name', $_SESSION['1000dangersbook_name']);
    $result = $statement->execute();
    $result = $statement->setFetchMode(PDO::FETCH_ASSOC); 
    $rows = $statement->fetchAll();
    return $rows;
}


function loadPapConnections()
{
    global $conn;
    $statement = $conn->prepare('
        select papconnection.source_id, papconnection.destination_id, papconnection.source_offset_x, papconnection.source_offset_y, papconnection.destination_offset_x, papconnection.destination_offset_y, papconnection.title
        from papconnection
        join 1000dangersbook
          on papconnection.1000dangersbook_id = 1000dangersbook.id
        join team
          on 1000dangersbook.team_id = :team_id
        where
          papconnection.1000dangersbook_id = (select max(1000dangersbook.id) from 1000dangersbook) 
          and 1000dangersbook.name = :1000dangersbook_name');
    $statement->bindParam(':team_id', $_SESSION['team_id']);
    $statement->bindParam(':1000dangersbook_name', $_SESSION['1000dangersbook_name']);
    $result = $statement->execute();
    $result = $statement->setFetchMode(PDO::FETCH_ASSOC); 
    $rows = $statement->fetchAll();
    return $rows;
}





function savePapElements($papElements)
{
    global $conn;
    $statement = $conn->prepare('
        insert into 1000dangersbook(team_id, name, creationdate) values(:team_id, :1000dangersbook_name, now())');
    $statement->bindParam(':1000dangersbook_name', $_SESSION['1000dangersbook_name']);
    $statement->bindParam(':team_id', $_SESSION['team_id']);
    $statement->execute();

    foreach($papElements as $papElement)
    {
        $statement = $conn->prepare('
            insert into papelement
              (id, 1000dangersbook_id, x, y, paptype_id, title, text)
            values (:id, (select max(1000dangersbook.id) from 1000dangersbook where 1000dangersbook.name = :1000dangersbook_name), :x, :y, (select id from paptype where paptype.name = :type), :title, :text)');

        $statement->bindParam(':id', $papElement['id']);
        $statement->bindParam(':1000dangersbook_name', $_SESSION['1000dangersbook_name']);
        $statement->bindParam(':x', $papElement['x']);
        $statement->bindParam(':y', $papElement['y']);
        $statement->bindParam(':type', $papElement['type']);
        $statement->bindParam(':title', $papElement['title']);
        $statement->bindParam(':text', $papElement['text']);
        $result = $statement->execute();
    }
}

function savePapConnections($papConnections)
{
    //TODO  savePapElements() muss immer vorher aufgerufen werden!!
    global $conn;
    foreach($papConnections as $papConnection)
    {
        $statement = $conn->prepare('
            insert into papconnection
              (source_id, destination_id, 1000dangersbook_id, source_offset_x, source_offset_y, destination_offset_x, destination_offset_y, title)
            values (:source_id, :destination_id, (select max(1000dangersbook.id) from 1000dangersbook where 1000dangersbook.name = :1000dangersbook_name), :source_offset_x, :source_offset_y, :destination_offset_x, :destination_offset_y, :title)');

        $statement->bindParam(':source_id', $papConnection['source_id']);
        $statement->bindParam(':destination_id', $papConnection['destination_id']);
        $statement->bindParam(':1000dangersbook_name', $_SESSION['1000dangersbook_name']);
        $statement->bindParam(':source_offset_x', $papConnection['source_offset_x']);
        $statement->bindParam(':source_offset_y', $papConnection['source_offset_y']);
        $statement->bindParam(':destination_offset_x', $papConnection['destination_offset_x']);
        $statement->bindParam(':destination_offset_y', $papConnection['destination_offset_y']);
        $statement->bindParam(':title', $papConnection['title']);
        $result = $statement->execute();
    }
}

?>
