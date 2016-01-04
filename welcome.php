<?php
session_start();

require('dbconnection.php');
if(!isset($_SESSION['user_id']))
{
    header('Location: login.php');
    die();
}

if(isset($_POST['btnChooseBook']))
{
    $_SESSION['1000dangersbook_name'] = $_POST['book'];
    header('Location: pap.php');
    die();
}

if(isset($_POST['btnCreateNewBook']))
{
    if(!doesBookExist($_SESSION['user_id'], $_POST['txtNewBookName']))
    {
        createNewBook($_SESSION['user_id'], $_POST['txtNewBookName']);
        $_SESSION['1000dangersbook_name'] = $_POST['txtNewBookName'];
        header('Location: pap.php');
        die();
    }
    else
    {
        echo "Schon vorhanden!<br><br>";
    }
}

if(isset($_POST['btnLogout']))
{
    session_destroy();
    header('Location: login.php');
    die();
}





?>
<html>
    <head>
    <title>Hallo <?php echo getTeamName($_SESSION['user_id']); ?></title>
    </head>
    <body>
<?php 
    echo getTeamName($_SESSION['user_id']);
    $books = getBooks($_SESSION['user_id']);
?>
    <form method="post" action="welcome.php">
    <table>
    <tr><td>
    <select name="book">
<?php
    foreach($books as $book)
    {
?>
    <option>
<?php echo $book['name']; ?>
    </option>
<?php
    }
?>
    </td><td>
    <input type="submit" name="btnChooseBook" value="Ausw&auml;hlen" />
    </td>
    </select>
    </tr>
    <tr>
    <td>
    <input type="text" name="txtNewBookName" />
    </td><td>
    <input type="submit" name="btnCreateNewBook" value="Neues Buch erstellen" />
    </td>
    <td>
    <input type="submit" name="btnLogout" value="Ausloggen" />
    </td>
    </form>
    </body>
</html>
















