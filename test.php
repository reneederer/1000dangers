<?php
$servername = "localhost";
$username = "root";
$password = "1234";


$conn = new PDO("mysql:host=localhost;dbname=1000dangers", "root", "1234");
$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);



$statement = $conn->prepare('
    select id, paptype_id as type, x, y, title, text
    from papelement
    where 1000dangersbook_id = :1000dangersbook_id');
        

if($_POST['action'] == 'load')
{
    $book_id = 1;
    $statement->bindParam(':1000dangersbook_id', $book_id);
    $result = $statement->execute();
    $result = $statement->setFetchMode(PDO::FETCH_ASSOC); 
    $rows = $statement->fetchAll();
    echo json_encode($rows);
    foreach($rows as $row)
    {
  //      echo json_encode($row);
    }
    /*
    echo '{
    "id":0,
    "x" : "0",
    "y" : 210,
    "type" : "2",
    "name": "sd"}';
     */
}
?>
