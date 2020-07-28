// Global Variables
let game
let context
let lives = 3
let points = 0
let fallingItemsCount = 0
let pointsSpan
let livesSpan
let fallingItems = []
let keysPressed = []
let gfuelTubs = []
let runLeft = []
let runRight = []
let idleAnimation
let trashCan
let spawnInterval
let movementInterval
let coinCollect
let trashCollision

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
function PlayerCharacter(x, y, size, characterLook){
    // Current Location
    this.x = x
    this.y = y

    // Sprite Size & Look
    this.size = size
    this.characterLook = characterLook

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
function sound(src) {
    this.sound = document.createElement("audio");
    this.sound.src = src;
    this.sound.setAttribute("preload", "auto");
    this.sound.setAttribute("controls", "none");
    this.sound.style.display = "none";
    document.body.appendChild(this.sound);
    this.play = function(){
        this.sound.play();
    }
    this.stop = function(){
        this.sound.pause();
    }
}

// Spawn player character
// middle of the board is 400 X but if my char is 100 wide I would need to spawn on the 350 X
let player = new PlayerCharacter(325, 525, 100, "boyChar")

// Triggered after all lives lost
// TODO: Add in popup instead of alert and reset game to main menu
const endGame = () => {
    clearInterval(spawnInterval)
    clearInterval(movementInterval)

    alert(`Game Over... You had ${points} points! Good job.`)
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
    // Clear Board
    context.clearRect(0, 0, game.width, game.height)

    // Remove any items on the floor
    fallingItems = fallingItems.filter(item => {
        if (item.isFalling === true) {
            return item
        }
    })

    // Declare each item on the floor and move each item down
    fallingItems.forEach((item, index) => {
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
// TODO: [BUG] Currently the sprite can get stuck looking one direction but moving the other.
// TODO: Cause is most likely the array of buttons in activate state
const playerMovementHandler = (e) => {
    if (keysPressed["KeyA"]){
        if(player.x > 0) {
            player.x -= 5;

            // Change movement state if not already
            if (player.movementState === "idle") { player.movementState = "runningLeft" }

            // Change movement image
            if (player.movementStep < 10) {
                player.movementStep++
            } else {
                player.movementStep = 1
            }
        }
    } else if (keysPressed["KeyD"]){
        if(player.x + player.size < game.width) {
            player.x += 5

            // Change movement state if not already
            if (player.movementState === "idle") { player.movementState = "runningRight" }

            // Change movement image
            if (player.movementStep < 10) {
                player.movementStep++
            } else {
                player.movementStep = 1
            }
        }
    } else {
        player.movementStep = 0
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
            // Remove falling item from count
            fallingItemsCount--

            // Detect if GFUEL or Trash
            if (item.itemType === "GFuel") {
                // Add point for GFUEL
                points += item.pointValue
                coinCollect.play()
            } else {
                // Remove life from lives and if out of lives end game
                if (lives > 1) {
                    lives -= 1
                } else {
                    endGame()
                }
                trashCollision.play()
            }

            // Update points display
            pointsSpan.textContent = points
            livesSpan.textContent = lives

            //Despawn item
            item.isFalling = false
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

// Define all DOM elements, canvas settings, and startup items
// Contains setIntervals
// boardMovementInterval - Speed: 10ms
// spawnInterval - Speed: 700ms
document.addEventListener('DOMContentLoaded', () => {
    // Select Canvas
    game = document.querySelector('#game')
    pointsSpan = document.querySelector('#points')
    livesSpan = document.querySelector('#lives')

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
        keysPressed[e.code] = false
    })

    // Create all GFuel tub images
    for (let i = 1; i < 7; i++) {
        gfuelTubs[i] = document.createElement('img')
        gfuelTubs[i].src = `./img/GFuelTub${i}.png`
    }

    // Create all left / right running images
    for (let i = 1; i < 11; i++) {
        runLeft[i] = document.createElement('img')
        runLeft[i].src = `./img/running/runLeft${i}.png`

        runRight[i] = document.createElement('img')
        runRight[i].src = `./img/running/runRight${i}.png`
    }

    // Create idle image
    idleAnimation = document.createElement('img')
    idleAnimation.src = './img/idle.png'
    idleAnimation.style.width = "50px"

    // Create Main Menu Images

    // Create Trash Can
    trashCan = document.createElement('img')
    trashCan.src = './img/trash.png'

    // Create Coin Noise
    coinCollect = new sound('./sound/coinCollect.mp3')

    // Create Trash Noise
    trashCollision = new sound('./sound/trashCollision.mp3')

    // Game Loops
    movementInterval = setInterval(boardMovementInterval, 10)
    spawnInterval = setInterval(spawnFallingItems, 700)
})
