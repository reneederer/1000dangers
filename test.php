<?php
session_start();
$_SESSION['1000dangersbook_id'] = 1;
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
    savePapElements();
}


function loadPapElements()
{
    global $conn;
    $statement = $conn->prepare('
        select papelement.id as id, paptype_id as type, x, y, title, text
        from papelement
        join 1000dangersbook
          on papelement.1000dangersbook_id = 1000dangersbook.id
        join team
           on 1000dangersbook.team_id = :team_id
        where team.id = :team_id
          and 1000dangersbook_id = :1000dangersbook_id');
    $statement->bindParam(':1000dangersbook_id', $_SESSION['1000dangersbook_id']);
    $statement->bindParam(':team_id', $_SESSION['team_id']);
    $result = $statement->execute();
    $result = $statement->setFetchMode(PDO::FETCH_ASSOC); 
    $rows = $statement->fetchAll();
    return $rows;
}


function savePapElements()
{
    global $conn;
    $statement = $conn->prepare('
        insert into 1000dangersbook(team_id, name, creationdate) values(:team_id, :1000dangersbook_name, now())');
    $statement->bindParam(':1000dangersbook_name', $_SESSION['1000dangersbook_name']);
    $statement->bindParam(':team_id', $_SESSION['team_id']);
    $statement->execute();




    $statement = $conn->prepare('select max(id) as max_id from 1000dangersbook where team_id = :team_id');
    $statement->bindParam(':team_id', $_SESSION['team_id']);
    $statement->execute();
    $statement->setFetchMode(PDO::FETCH_ASSOC);
    $rows = $statement->fetchAll();
    $_SESSION['1000dangersbook_id'] = $rows[0]['max_id'];

    $statement = $conn->prepare('
        insert into papelement
          (1000dangersbook_id, paptype_id, x, y, title, text)
        values (:1000dangersbook_id, 4, 50, 60, "test", "mein text")');
    $statement->bindParam(':1000dangersbook_id', $_SESSION['1000dangersbook_id']);
    $result = $statement->execute();
}


?>
