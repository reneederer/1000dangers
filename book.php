<?php
    session_start();
    require('dbconnection.php');
    $_SESSION['team_id'] = 1;
    $_SESSION['1000dangersbook_name'] = '1000 Gefahren';
    $elements = array();
    if(!isset($_SESSION['team_id']))
    {
//        header('Location: login.php');
    }

function getFirstElement()
{
    global $conn;
    $statement = $conn->prepare('
        select papelement.id as containerId
        from papelement
        join 1000dangersbook
          on papelement.1000dangersbook_id = 1000dangersbook.id
        join team
           on 1000dangersbook.team_id = :team_id
        join paptype
          on papelement.paptype_id = paptype.id
        where
          1000dangersbook_id = (select max(1000dangersbook.id) from 1000dangersbook where 1000dangersbook.name = :1000dangersbook_name)
        and paptype.name = "Start"');
    $statement->bindParam(':team_id', $_SESSION['team_id']);
    $statement->bindParam(':1000dangersbook_name', $_SESSION['1000dangersbook_name']);
    $result = $statement->execute();
    $result = $statement->setFetchMode(PDO::FETCH_ASSOC); 
    $rows = $statement->fetchAll();
    return $rows[0]['containerId'];
}

function getNextElement($currentId)
{
    global $elements;
    global $conn;
    $text = "";
    $rows = null;
    while(is_null($rows) || count($rows) > 0 && $rows[0]['type'] !== 'Condition')
    {
        $statement = $conn->prepare(' select papelement.id as containerId, paptype.name as type, papelement.title, papelement.text, p1.title as connectiontitle, p1.destination_id as nextId, p1.text as connectiontext
            from papelement
            join papconnection p1
              on papelement.id = p1.source_id
              and :currentId = p1.source_id
              and papelement.1000dangersbook_id = p1.1000dangersbook_id
            join 1000dangersbook
              on papelement.1000dangersbook_id = 1000dangersbook.id
            join team
               on 1000dangersbook.team_id = :team_id
            join paptype
              on papelement.paptype_id = paptype.id
            where
              papelement.1000dangersbook_id = (select max(1000dangersbook.id) from 1000dangersbook where 1000dangersbook.name = :1000dangersbook_name)');
        $statement->bindParam(':team_id', $_SESSION['team_id']);
        $statement->bindParam(':currentId', $currentId);
        $statement->bindParam(':1000dangersbook_name', $_SESSION['1000dangersbook_name']);
        $result = $statement->execute();
        $result = $statement->setFetchMode(PDO::FETCH_ASSOC); 
        $rows = $statement->fetchAll();
        if(count($rows) === 0)
        { 
            return array('text' => $text);
            //die('No successor!');
        }
        $text .= '<p>' . $rows[0]['text'] . '</p>';
        if($rows[0]['type'] === 'Condition')
        {
            foreach($rows as $currentRow)
            {
                $text .= '<a href="book.php?id=' . $currentRow['nextId'] . '">' . $currentRow['connectiontitle'] . '</a><br />';
            }
            return array('nextId' => $rows[0]['nextId'], 'text' => $text);
        }
        if(in_array($rows[0]['nextId'], $elements))
        {
            die('Infiniter Regress!');
        }
        $elements[] = $rows[0]['nextId'];
        $currentId = $rows[0]['nextId']; 

    }
    return array('containerId' => $rows[0]['containerId'], 'text' => $text);
}

?>
<html>
    <head>
        <title>Tausend-Gefahren-Buch</title>
    </head>
    <body>
<?php
    if(isset($_GET['id']))
    {
        echo getNextElement($_GET['id'])['text'];
    }
    else
    {
        $startId = getFirstElement();
        $x = getNextElement($startId)['text'];
        echo $x;
    }

?> 
    </body>
</html>

