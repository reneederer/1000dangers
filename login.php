<?php
session_start();

require('dbconnection.php');


if(isset($_SESSION['team_name']) && $_SESSION['team_name'] === 'rene')
{
}

if(isset($_POST['loginForm']))
{
    if(isset($_POST['name']) && login($_POST['name'], $_POST['password'])  === true)
    {
        $_SESSION['1000dangersbook_name'] = '1000 Gefahren';
        $_SESSION['team_name'] = $_POST['name'];
        $_SESSION['team_id'] = 1;
        header('Location: pap.php');
    }
    else
    {
        echo "Falsch";
    }
}


function login($name, $password)
{
    global $conn;
    $statement = $conn->prepare('
        select id from team where name = :name and password = :password');
    $statement->bindParam(':name', $name);
    $statement->bindParam(':password', $password);
    $result = $statement->execute();
    $result = $statement->setFetchMode(PDO::FETCH_ASSOC); 
    $rows = $statement->fetchAll();
    foreach($rows as $row)
    {
        $_SESSION['1000dangersbook_name'] = '1000 Gefahren';
        $_SESSION['team_id'] = 1;
        $_SESSION['team_name'] = 'rene';
        return true;
    }
    return false;
}

    
?>
<html>
    <head>
        <title>Login</title>
    </head>
    <body>
        <form action="login.php" method="post">
            <table>
                <tr>
                    <td>Name:</td>
                    <td><input type="text" name="name" value="" /></td>
                </tr>
                <tr>
                    <td>Passwort:</td>
                    <td><input type="password" name="password" value="" /></td>
                </tr>
                <tr>
                    <td></td>
                    <td><input type="submit" name="loginForm" value="Abschicken" /></td>
                </tr>
            </table>
        </form>
        <?php if(isset($_POST['name'])) echo 'Abgeschickt!'; ?>
    </body>
</html>
