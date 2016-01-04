<?php
session_start();

require('dbconnection.php');

if(!isset($_POST['action']))
{
    die();
}

if($_POST['action'] == 'load')
{
    $options = file_get_contents('options.json');    
    $papElements = loadPapElements();
    $papConnections = loadPapConnections();
    $re = array('options' => json_decode($options), 'papElements' => $papElements, 'papConnections' => $papConnections);
    echo json_encode($re);
}
else if($_POST['action'] == 'save')
{
    $pap = json_decode($_POST['pap'], true);
    savePapElements($pap['elements']);
    savePapConnections($pap['connections']);
}



?>














