<?php
require_once "config.php";

/* Attempt to connect to MySQL database */
$link = mysqli_connect(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);

// Check connection
if($link === false){
    die("ERROR: Could not connect. " . mysqli_connect_error());
}

$query = "SELECT * FROM highscores ORDER BY highscore DESC LIMIT 10";
$result = mysqli_query($link, $query) or die(mysqli_error($link));
$tableArray = array();
$counter = 0;
while ($row = mysqli_fetch_array($result))
{
    $tableArray[$counter]['highscore'] = $row['highscore'];
    $counter++;
}

//Close Connection
mysqli_close($link);

return $tableArray;
?>