<?php
session_start();
$_SESSION['1000dangersbook_name'] = '1000 Gefahren';
$_SESSION['team_id'] = 1;
$_SESSION['team_name'] = 'rene';

$conn = new PDO('mysql:host=localhost;dbname=1000dangers', 'root', '1234');
$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

if(!isset($_POST['action']))
{
    return;
}

if($_POST['action'] == 'load')
{
    $papElements = loadPapElements();
    echo json_encode($papElements);

}
else if($_POST['action'] == 'save')
{
    savePapElements(json_decode($_POST['papElements'], true));
}


function loadPapElements()
{
    global $conn;
    $statement = $conn->prepare('
        select x, y, paptype.name as type, title, text
        from papelement
        join 1000dangersbook
          on papelement.1000dangersbook_id = 1000dangersbook.id
        join team
           on 1000dangersbook.team_id = :team_id
        join paptype
          on papelement.paptype_id = paptype.id
        where
          team.id = :team_id
          and 1000dangersbook_id =
            (select max(1000dangersbook.id) from 1000dangersbook where 1000dangersbook.name = :1000dangersbook_name)');
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
              (1000dangersbook_id, x, y, paptype_id, title, text)
            values ((select max(1000dangersbook.id) from 1000dangersbook where 1000dangersbook.name = :1000dangersbook_name), :x, :y, (select id from paptype where paptype.name = :type), :title, :text)');

        $statement->bindParam(':1000dangersbook_name', $_SESSION['1000dangersbook_name']);
        $statement->bindParam(':x', $papElement['x']);
        $statement->bindParam(':y', $papElement['y']);
        $statement->bindParam(':type', $papElement['type']);
        $statement->bindParam(':title', $papElement['title']);
        $statement->bindParam(':text', $papElement['text']);
        $result = $statement->execute();
    }
}


?>
