<?php
if($_SERVER['REQUEST_METHOD'] == "POST" and isset($_POST['highscore']))
{
    addNewHighScore();
}

function addNewHighScore() {

    require_once "config.php";

    /* Attempt to connect to MySQL database */
    $link = mysqli_connect(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);

    // Check connection
    if($link === false){
        die("ERROR: Could not connect. " . mysqli_connect_error());
    }

    // Prepare an insert statement
    $sql = "INSERT INTO highscores (highscore) VALUES (?)";

    if($stmt = mysqli_prepare($link, $sql)) {

        // Bind variables to the prepared statement as parameters
        mysqli_stmt_bind_param($stmt, "i", $param_highscore);

        // Set parameters
        $param_highscore = $_POST["highscore"];

        // Attempt to execute the prepared statement
        mysqli_stmt_execute($stmt);

        // Close statement
        mysqli_stmt_close($stmt);

    }

    // Close connection
    mysqli_close($link);
}

?>