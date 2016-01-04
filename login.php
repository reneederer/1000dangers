<?php
session_start();

require('dbconnection.php');
if(isset($_POST['btnLogin']))
{
    $id = getUserId($_POST['name'], $_POST['password']);
    if($id != -1)
    {
        $_SESSION['user_id'] = $id;
        header('Location: welcome.php');
        die();
    }
}


function getUserId($name, $password)
{
    global $conn;
    $statement = $conn->prepare('
        select id from user where name = :name and password = :password limit 1');
    $statement->bindParam(':name', $name);
    $statement->bindParam(':password', $password);
    $result = $statement->execute();
    $result = $statement->setFetchMode(PDO::FETCH_ASSOC); 
    $rows = $statement->fetchAll();
    if(count($rows) == 0)
    {
        return -1;
    }
    return (int)$rows[0]['id'];
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
                    <td><input type="submit" name="btnLogin" value="Abschicken" /></td>
                </tr>
            </table>
        </form>
    </body>
</html>
















