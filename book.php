<?php
    session_start();
    require('dbconnection.php');
    $_SESSION['team_id'] = 1;
    $_SESSION['1000dangersbook_name'] = '1000 Gefahren';
    $elements = array();

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
    while(is_null($rows) || (count($rows) > 0 && $rows[0]['type'] !== 'Condition'))
    {
        $statement = $conn->prepare('select papelement.id as containerId, paptype.name as type, papelement.title, papelement.text, p1.title as connectiontitle, p1.destination_id as nextId, p1.text as connectiontext
            from papelement
            join 1000dangersbook
              on papelement.1000dangersbook_id = 1000dangersbook.id
            join team
               on 1000dangersbook.team_id = :team_id
            join paptype
              on papelement.paptype_id = paptype.id
            left join papconnection p1
              on papelement.id = p1.source_id
              and :currentId = p1.source_id
              and papelement.1000dangersbook_id = p1.1000dangersbook_id
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
            var_dump($text);
            return array('containerId' => -1, 'text' => $text);
            die('No successor!');
        }
        $text .= '<p>' . $rows[0]['text'] . '</p>';
        var_dump($text);
        if($rows[0]['type'] === 'Condition')
        {
            $text .= '<br /><br /><p><strong>Jetzt musst du dich Entscheiden:</strong></p>';
            foreach($rows as $currentRow)
            {
                $text .= '<p><a href="book.php?id=' . $currentRow['nextId'] . '">' . $currentRow['connectiontitle'] . '</a></p>';
            }
            return array('nextId' => $rows[0]['nextId'], 'text' => $text);
        }
        if(is_null($rows[0]['nextId']))
        {
            var_dump($text);
            break;
        }
        if(in_array($rows[0]['nextId'], $elements))
        {
            var_dump($rows[0]['nextId']);
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
        <style>
            body
{
background-color: #ffffff;
}
            h1
            {
                text-align: center;
                padding: 0px;
            }
            #main
            {
                padding: 30px;
                margin: auto;
                background-color: #ffffff;
                color: #000000;
                width: 70%;
                height: 100%;
            }
            p
            {
                font-size: 1.2em;
                margin-left: 40px;
                margin-right: 40px;
            }
            a:link{
font-weight: bold;
color:#9d890a;
text-decoration:none;
}
            a:active{color:inherit}
            a:visited{
color:#3d39da;
}
            a:hover{color:#0d09fa}
        </style>
    </head>
    <body>
    <div id="main">
    <h1>Tausend-Gefahren-Buch</h1>
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
    </div>

    </body>
</html>
