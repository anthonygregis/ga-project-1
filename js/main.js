// Global Variables
let game
let context
let player
let lives = 3
let points = 0
let highscore = 0
let fallingItemsCount = 0
let pointsSpan
let livesSpan
let highscoreSpan
let mainMenu = []
let fallingItems = []
let keysPressed = []
let gfuelTubs = []
let runLeft = []
let runRight = []
let idleAnimation
let trashCan
let spawnInterval
let movementInterval
let animationInterval
let coinCollect
let trashCollision

// Grab highscore from browser, if not set make it 0
if (localStorage.getItem("highscore")) {
    localStorage.setItem("highscore", "0")
    highscore = localStorage.getItem("highscore")
} else {
    localStorage.setItem("highscore", "0")
}

// GFuel / Trash Constructor
function FallingItem(x, y, size, itemType, gfuelImage, pointValue){
    // Current Item Position
    this.x = x
    this.y = y
    this.size = size

    //Trash or Fruit
    this.itemType = itemType

    // Is item on floor or falling?
    this.isFalling = true

    // Item's Value
    this.pointValue = pointValue

    // Render Item
    this.render = function() {
        if (this.itemType === "GFuel") { context.drawImage(gfuelTubs[gfuelImage], this.x, this.y, this.size, this.size) }
        else if (this.itemType === "Trash") { context.drawImage(trashCan, this.x, this.y, this.size, this.size) }
    }
}

// Player Constructor
function PlayerCharacter(x, y, size){
    // Current Location
    this.x = x
    this.y = y

    // Sprite Size & Look
    this.size = size

    this.movementState = "idle"
    this.movementStep = 1

    // Render Player
    this.render = function() {
        if (this.movementState === "idle") { context.drawImage(idleAnimation, this.x, this.y, this.size, this.size) }
        if (this.movementState === "runningLeft") { context.drawImage(runLeft[this.movementStep], this.x, this.y, this.size, this.size) }
        if (this.movementState === "runningRight") { context.drawImage(runRight[this.movementStep], this.x, this.y, this.size, this.size) }
    }
}

// Sound Constructor
// Credit - https://www.w3schools.com/graphics/game_sound.asp
function Sound(src) {
    this.sound = document.createElement("audio")
    this.sound.src = src
    this.sound.setAttribute("preload", "auto")
    this.sound.setAttribute("controls", "none")
    this.sound.style.display = "none"
    document.body.appendChild(this.sound)
    this.play = function(){
        this.sound.play()
    }
}

// Clear board function instead of wordy code each time
const clearBoard = () => {
    context.clearRect(0, 0, game.width, game.height)
    console.log("We cleared the board")
}

// Triggered after all lives lost
// TODO: Add in popup instead of alert and reset game to main menu
const endGame = async () => {
    let gameOverText = "Game Over!"
    let scoreText = `You collected ${points} points`
    let highscoreText = "New Highscore!!"
    let highscorePointsText = `Highscore: ${points}`
    let livesText = ""

    await clearInterval(spawnInterval)
    await clearInterval(movementInterval)
    await clearInterval(animationInterval)

    clearBoard()

    fallingItems = []

    // Change font for GameOver
    context.font = "30px Verdana"
    // Find X coords for centered text
    textWidth = context.measureText(gameOverText).width / 2
    // Draw Text centered
    context.fillText(gameOverText, 400 - textWidth, 275)

    // Change font for keys
    context.font = "20px Verdana"
    // Find X coords for centered text
    textWidth = context.measureText(scoreText).width / 2
    // Draw Text centered
    context.fillText(scoreText, 400 - textWidth, 330)

    if (highscore < points) {
        highscore = points
        localStorage.setItem("highscore", points.toString())

        highscoreSpan.textContent = highscore

        // Change font for GameOver
        context.font = "20px Verdana"
        // Find X coords for centered text
        textWidth = context.measureText(highscoreText).width / 2
        // Draw Text centered
        context.fillText(highscoreText, 400 - textWidth, 400)

        // Change font for keys
        context.font = "15px Verdana"
        // Find X coords for centered text
        textWidth = context.measureText(highscorePointsText).width / 2
        // Draw Text centered
        context.fillText(highscorePointsText, 400 - textWidth, 425)

        $.post("php/submitScore.php", {highscore: highscore}, (res) => {
            console.log(res)
        })
    }

    context.font = "20px Verdana"
    textWidth = context.measureText("Back to Main Menu").width / 2
    context.fillText("Back to Main Menu", 400 - textWidth, 475)

    document.addEventListener("click", gameOverButton = (e) => {
        let mouseX = e.offsetX
        let mouseY = e.offsetY

        console.log(`X: ${mouseX} Y: ${mouseY}`)

        if (mouseX >= 300 && mouseX <= 505 + textWidth && mouseY >= 445 && mouseY <= 480) {
            document.removeEventListener("click", gameOverButton)

            lives = 3

            points = 0

            fallingItemsCount = 0

            for (let i = 0; i < lives; i++) {
                livesText += "❤"
            }

            pointsSpan.textContent = points
            livesSpan.textContent = livesText

            showMainMenu()
        }
    })

}

const checkGameBounds = (itemXAxis) => {
    console.log("Checking board position")

    if (itemXAxis + 125 > 800) {
        console.log("Item clipping off board")

        let newAxis = Math.floor(Math.random() * 800)

        checkGameBounds(newAxis)
    } else {
        return itemXAxis
    }
}

// Control spawning of GFuel & Trash
// Can only have 10 falling items on board at a time
const spawnFallingItems = () => {
    console.log("Spawned Items: " + fallingItemsCount)
    // Declare itemType Variable for later usage
    let itemTypeName
    let gfuelImage = 0

    // Do not spawn more items if screen has 10 already
    if (fallingItemsCount === 10) { return }

    // Random chance for GFUEL or trash
    let itemType = Math.floor(Math.random() * 2)
    if (itemType === 0) {
        itemTypeName = "GFuel"
        gfuelImage = Math.floor(Math.random() * 6) + 1
    } else {
        itemTypeName = "Trash"
    }

    // Increase spawned count and define i as the count for shorter code
    // Define new item in array for accessing
    fallingItemsCount++
    let i = fallingItemsCount
    let x = Math.floor(Math.random() * 800)

    // Ensure on board
    x = checkGameBounds(x)

    // Define && Spawn Item with random X
    fallingItems[i] = new FallingItem(x, 0, 50, itemTypeName, gfuelImage, 10)
    fallingItems[i].render()
}

// Control falling of all active items and filter all item on floor
// Rerender board of only falling items
const moveFallingItems = () => {
    clearBoard()

    // Remove any items on the floor
    fallingItems = fallingItems.filter(item => {
        if (item.isFalling === true) {
            return item
        }
    })

    // Declare each item on the floor and move each item down
    fallingItems.forEach((item) => {
        if (item.y + item.size >= 600) {
            item.isFalling = false
            fallingItemsCount--
            console.log("Hit floor")
        } else {
            item.y += 1.5
            item.render()
        }
    })
}

// New controller allows you to move player with more fluid control and less delay
const playerMovementHandler = () => {
    if (keysPressed["KeyA"]){
        if(player.x > 0) {
            player.x -= 5

            // Change movement state if not already
            if (player.movementState !== "runningLeft") { player.movementState = "runningLeft" }
        }
    } else {

    }
    if (keysPressed["KeyD"]){
        if(player.x + player.size < game.width) {
            player.x += 5

            // Change movement state if not already
            if (player.movementState !== "runningRight") { player.movementState = "runningRight" }
        }
    }
    if (!keysPressed["KeyA"] && !keysPressed["KeyD"]) {
        player.movementStep = 1
        player.movementState = "idle"
    }

}

// Detects collision of items with player
// Removes lives or adds points depending on trash or GFuel
// Plays sound on collision
const detectPlayerCollision = () => {
    let playerRight = player.x + player.size
    let playerLeft = player.x
    let playerTop = player.y
    let playerBottom = player.y + player.size

    fallingItems.forEach(item => {
        let itemRight = item.x + item.size
        let itemLeft = item.x
        let itemTop = item.y
        let itemBottom = item.y + item.size

        if(playerRight > itemLeft && playerLeft < itemRight && playerBottom > itemTop && playerTop < itemBottom ) {
            let livesText = ""

            // Remove falling item from count
            fallingItemsCount--

            // Detect if GFUEL or Trash
            if (item.itemType === "GFuel") {
                // Add point for GFUEL
                points += item.pointValue
                coinCollect.play()

                pointsSpan.textContent = points
            } else {
                // Remove life from lives and if out of lives end game
                if (lives > 1) {
                    lives -= 1
                } else {
                    lives -= 1
                    endGame()
                }

                for (let i = 0; i < lives; i++) {
                    livesText += "❤"
                }

                livesSpan.textContent = livesText

                trashCollision.play()
            }

            //Despawn item
            item.isFalling = false
        }
    })
}

const showMainMenu = () => {
    //Main Menu Listener
    document.addEventListener("click", mainMenuClickCheck)

    // Clear canvas even if cleared (Reason: For game over and from returning from instructions)
    clearBoard()

    // Main Menu Logo
    mainMenu[1].onload = () => {
        console.log("Loaded")
    }
    context.drawImage(mainMenu[1], 150, 100, 500, 250)
    // Start Game Menu
    mainMenu[2].onload = () => {
        console.log("Loaded")
    }
    context.drawImage(mainMenu[2], 350, 350, 100, 50)

    mainMenu[3].onload = () => {
        console.log("Loaded")
    }
    context.drawImage(mainMenu[3], 350, 400, 100, 50)

    context.font = "20px Verdana"

    let menu4Text = "Global Highscores"
    let textWidth = context.measureText(menu4Text).width / 2

    context.fillText(menu4Text, 400 - textWidth, 475)
}

const mainMenuClickCheck = (e) => {
    let mouseX = e.offsetX
    let mouseY = e.offsetY

    if (mouseX >= 350 && mouseX <= 450 && mouseY >= 350 && mouseY <= 400) {
        document.removeEventListener("click", mainMenuClickCheck)
        startGame()
    } else if (mouseX >= 350 && mouseX <= 450 && mouseY >= 400 && mouseY <= 445) {
        document.removeEventListener("click", mainMenuClickCheck)
        showInstructions()
    } else if (mouseX >= 305 && mouseX <= 500 && mouseY >= 448 && mouseY <= 491) {
        document.removeEventListener("click", mainMenuClickCheck)
        showHighScores()
    }
}

const startGame = () => {
    // Spawn player character
    // middle of the board is 400 X but if my char is 100 wide I would need to spawn on the 350 X
    player = new PlayerCharacter(325, 500, 100)

    spawnInterval = setInterval(spawnFallingItems, 500)
    movementInterval = setInterval(boardMovementInterval, 10)
    animationInterval = setInterval(playerAnimationInterval, 80)
}

const showInstructions = () => {
    // Clear Main Menu
    clearBoard()

    // Define Instructions variables
    let gameplayInstructions = "The goal of the game is to collect as much GFuel as you can without hitting the trash bags."
    let controlsText = "Controls:"
    let controlMovingLeft = "A: Moves your character to the left"
    let controlMovingRight = "D: Moves your character to the right"
    let backButton = "Return to Menu"

    // Change font and font size
    context.font = "13px Verdana"
    // Find X coords for centered text
    let textWidth = context.measureText(gameplayInstructions).width / 2
    // Draw Text centered
    context.fillText(gameplayInstructions, 400 - textWidth, 200)

    // Change font for controls
    context.font = "40px Verdana"
    // Find X coords for centered text
    textWidth = context.measureText(controlsText).width / 2
    // Draw Text centered
    context.fillText(controlsText, 400 - textWidth, 275)

    // Change font for keys
    context.font = "30px Verdana"
    // Find X coords for centered text
    textWidth = context.measureText(controlMovingLeft).width / 2
    // Draw Text centered
    context.fillText(controlMovingLeft, 400 - textWidth, 330)

    // Find X coords for centered text
    textWidth = context.measureText(controlMovingRight).width / 2
    // Draw Text centered
    context.fillText(controlMovingRight, 400 - textWidth, 370)

    //Back Button
    // Find X Coords for centered text
    textWidth = context.measureText(backButton).width
    // Draw Text
    context.fillText(backButton, 400 - textWidth / 2, 475)

    document.addEventListener("click", returnMenu = (e) => {
        let mouseX = e.offsetX
        let mouseY = e.offsetY

        if (mouseX >= 400 - textWidth && mouseX <= 400 + textWidth && mouseY >= 445 && mouseY <= 485) {
            document.removeEventListener("click", returnMenu)
            showMainMenu()
        }
    })
}

const showHighScores = () => {
    $.ajax({
        url: "php/getScores.php",
        type: "GET",
        success: (res) => {
            renderHighScores(res)
        },
        dataType:"json"
    })
}

const renderHighScores = (highScores) => {
    let backButton = "Return to Menu"

    clearBoard()

    let i = 1
    let textY = 300

    context.font = "40px Verdana"
    let textWidth = context.measureText("Global Highscores").width / 2
    context.fillText("Global Highscores", 400 - textWidth, 250 )

    context.font = "15px Verdana"
    highScores.forEach(scoreObject => {
        let highScore = scoreObject.highscore
        let highScoreText = `${i}: ${highScore}`
        let textWidth = context.measureText(highScoreText).width / 2

        context.fillText(highScoreText, 350 - textWidth, textY)
        textY += 25
        i++
    })

    //Back Button
    // Find X Coords for centered text
    textWidth = context.measureText(backButton).width
    // Draw Text
    context.fillText(backButton, 400 - textWidth / 2, 475)

    document.addEventListener("click", returnMenu = (e) => {
        let mouseX = e.offsetX
        let mouseY = e.offsetY

        if (mouseX >= 400 - textWidth && mouseX <= 400 + textWidth && mouseY >= 445 && mouseY <= 485) {
            document.removeEventListener("click", returnMenu)
            showMainMenu()
        }
    })
}

// Holds all looping functions (Speed: 10ms)
const boardMovementInterval = () => {
    playerMovementHandler()
    detectPlayerCollision()
    moveFallingItems()

    player.render()
}

const playerAnimationInterval = () => {
    if (player.movementState === "runningLeft") {
        // Change movement image
        if (player.movementStep < 10) {
            player.movementStep++
        } else {
            player.movementStep = 1
        }
    } else if (player.movementState === "runningRight") {
        // Change movement image
        if (player.movementStep < 10) {
            player.movementStep++
        } else {
            player.movementStep = 1
        }
    }
}

// Define all DOM elements, canvas settings, and startup items
// Contains setIntervals
// boardMovementInterval - Speed: 10ms
// spawnInterval - Speed: 700ms
document.addEventListener('DOMContentLoaded', () => {
    // Select Canvas
    game = document.querySelector('#game')
    pointsSpan = document.querySelector('#points')
    livesSpan = document.querySelector('#lives')
    highscoreSpan = document.querySelector('#highscore')

    // Canvas Configs
    game.setAttribute('height', 600)
    game.setAttribute('width', 800)

    // Context (Where I place all my items on canvas
    context = game.getContext('2d')

    // Player Movement Listener
    document.addEventListener('keydown', (e) => {
        keysPressed[e.code] = true
    })
    document.addEventListener('keyup', (e) => {
        console.log(`Key Turned Off: ${e.code}`)
        keysPressed[e.code] = false
    })

    // Create all GFuel tub images
    for (let i = 1; i < 7; i++) {
        gfuelTubs[i] = new Image()
        gfuelTubs[i].src = `./img/GFuelTub${i}.png`
    }

    // Create all left / right running images
    for (let i = 1; i < 11; i++) {
        runLeft[i] = new Image()
        runLeft[i].src = `./img/running/runLeft${i}.png`

        runRight[i] = new Image()
        runRight[i].src = `./img/running/runRight${i}.png`
    }

    // Create idle image
    idleAnimation = new Image()
    idleAnimation.src = './img/idle.png'
    idleAnimation.style.width = "50px"

    // Create Main Menu Images
    for (let i = 1; i < 4; i++) {
        mainMenu[i] = new Image()
        mainMenu[i].src = `img/mainMenu/menuOption${i}.png`
    }

    // Create Trash Can
    trashCan = new Image()
    trashCan.src = './img/trash.png'

    // Create Coin Noise
    coinCollect = new Sound('./sound/coinCollect.mp3')

    // Create Trash Noise
    trashCollision = new Sound('./sound/trashCollision.mp3')

    // Set Saved Highscore
    highscoreSpan.textContent = highscore

    showMainMenu()
})
