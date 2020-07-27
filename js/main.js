let game
let context
let fallingItemsCount
let fallingItems = []

function FallingItem(x, y, itemType, pointValue){
    this.x = x
    this.y = y
    this.itemType = itemType
    this.isFalling = true
    this.pointValue = pointValue
    this.render = function() {
        context.fillStyle = 'red'
        context.fillRect(this.x, this.y, 10, 10)
    }
}

function spawnFallingItems() {
    //Do not spawn more items if screen has 10 already
    if (fallingItemsCount === 10) { return }

    //Increase spawned count and define i as the count for shorter code
    //Define new item in array for accessing
    fallingItemsCount++
    let i = fallingItemsCount
    let x = Math.floor(Math.random() * 800)
    fallingItems[i] = new FallingItem(x, 0, 'fruit', 100)
    fallingItems[i].render()
}

const gameLoop = () => {
    console.log("We be looping")
}

//Define all DOM elements, canvas settings, and startup items
document.addEventListener('DOMContentLoaded', () => {
    //Select Canvas
    game = document.querySelector('#game')

    // Canvas Configs
    game.setAttribute('height', 600)
    game.setAttribute('width', 800)

    // Context (Where I place all my items on canvas
    context = game.getContext('2d')

    let runGameLoop = setInterval(gameLoop, 60)
})
