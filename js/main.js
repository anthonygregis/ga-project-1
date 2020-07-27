let game
let context
let points = 0
let fallingItemsCount = 0
let pointsSpan
let fallingItems = []

function FallingItem(x, y, size, itemType, pointValue){
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
        context.fillStyle = 'red'
        context.fillRect(this.x, this.y, 10, 10)
    }
}

function PlayerCharacter(x, y, size, characterLook){
    this.x = x
    this.y = y
    this.size = size
    this.characterLook = characterLook
    this.render = function() {
        context.fillStyle = 'green'
        context.fillRect(this.x, this.y, this.size, this.size)
    }
}

// Spawn player character
// middle of the board is 400 X but if my char is 100 wide I would need to spawn on the 350 X
let player = new PlayerCharacter(375, 550, 50, "boyChar")

const spawnFallingItems = () => {
    // Do not spawn more items if screen has 10 already
    if (fallingItemsCount === 10) { return }

    // Random chance for GFUEL or trash
    let itemType = Math.floor(Math.random() * 2)

    console.log("Item Type: " + itemType)

    // Increase spawned count and define i as the count for shorter code
    // Define new item in array for accessing
    fallingItemsCount++
    let i = fallingItemsCount
    let x = Math.floor(Math.random() * 800)

    // Define && Spawn Item with random X
    fallingItems[i] = new FallingItem(x, 0, 10, 'fruit', 100)
    fallingItems[i].render()
}

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
        if (item.y + 10 === 600) {
            item.isFalling = false
            fallingItemsCount--
        } else {
            item.y += 10
            item.render()
        }
    })
}

const playerMovementHandler = (e) => {
    switch(e.code) {
        case "KeyA":
            if(player.x > 0) {
                player.x -= 5;
            }
            break
        case "KeyD":
            if(player.x + player.size < game.width) {
                player.x += 5
            }
            break
        default:
            console.log("Nope, just no.")
    }
}

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
            if (item.itemType === "GFUEL") {
                // Add point for GFUEL
                points += item.pointValue
            } else {
                // Remove point for Trash
                points -= item.pointValue
            }

            // Update points display
            pointsSpan.textContent = points

            //Despawn item
            item.isFalling = false
        }
    })


}

const quickFrameLoop = () => {
    detectPlayerCollision()
    moveFallingItems()
    player.render()
}

// Define all DOM elements, canvas settings, and startup items
document.addEventListener('DOMContentLoaded', () => {
    // Select Canvas
    game = document.querySelector('#game')
    pointsSpan = document.querySelector('span')

    // Canvas Configs
    game.setAttribute('height', 600)
    game.setAttribute('width', 800)

    // Context (Where I place all my items on canvas
    context = game.getContext('2d')

    // Player Movement Listener
    document.addEventListener('keydown', playerMovementHandler)

    // Game Loops
    let quickFrameInterval = setInterval(quickFrameLoop, 60)
    let spawnInterval = setInterval(spawnFallingItems, 1000)
})
