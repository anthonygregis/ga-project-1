// Global variables
let ctx;
let pontiff;
let artorius;
let p1Image;
let p2Image;

// Define Pontiff Character Animations
let pontAnimations = {
    column: [0, 300, 600, 900, 1200],
    idle: [0],
    walking: [0],
    attacking: [0, 300, 600, 900]
}

// Define Artorius Character Animations
let artorAnimations = {
    column: [0, 300, 600, 900, 1200],
    idle: [0],
    walking: [0],
    attacking: [0, 300, 600, 900]
}


function Player(x, y, width, height, playerCharacter, playerNumber) {

    // Current Location where player lands
    this.x = x;
    this.y = y;

    // Size of the player
    this.width = width;
    this.height = height;

    // Chooses character
    this.playerCharacter = playerCharacter;
    this.playerNumber = playerNumber;

    // Sets health and Damage
    this.health = 50;
    this.damage = 10;

    // Sets player to alive, to be changed after taking 50 damage
    this.alive = true;

    // Player Animation System
    this.actionState = 'idle';
    this.movementStep = 0;
    this.actionRow = 0;

    // Player Renderer
    this.render = function () {
        // Define Character Animation Info
        let charImage;
        let charAnimations;

        // Choose Character Information based on player choice
        if (playerCharacter === 'Artorius') {charImage = artorius; charAnimations = artorAnimations}
        else {charImage = pontiff; charAnimations = pontAnimations}

        // Idle render
        if(this.movementState === 'idle')  {
            ctx.drawImage(
                charImage, // Character Image
                charAnimations['column'][this.movementStep],
                charAnimations[this.actionState][this.actionRow],
                300,
                300,
                this.x, this.y, this.width, this.height)
        }
    }
}

// Loads Dom, has game variable, as well as sets game attributes and trying to render my characters
document.addEventListener('DOMContentLoaded', () => {

    // Grabs canvas
    let game = document.getElementById('game');

    // Sets canvas attributes for size and type
    game.setAttribute('height', 550);
    game.setAttribute('width', 1000);
    ctx = game.getContext('2d');

    // create images for characters
    pontiff = new Image();
    artorius = new Image();

    // Load Spritesheets
    pontiff.src = './images/PontiffSprite.png';
    artorius.src = './images/Artorius.gif';

    // Create player models
    player1 = new Player(50, 200, 300, 300, 'Pontiff', 1);
    player2 = new Player(600, 200, 300, 300, 'Artorius', 2);

    // Listen for Keys tied to moveList
    document.addEventListener('keydown', play1Move);
    document.addEventListener('keydown', play2Move);


    let runGame = setInterval(gamePlay, 10);



})