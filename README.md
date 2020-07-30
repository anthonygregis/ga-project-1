<h1 align="center">
    GA Unit 1 Project
</h1>

## Objective

The objective of the game is to try and collect as much GFuel as possible while avoiding trash and not running out of lives.

## Features

- Player Movement
- Progressive Difficulty
- Local Highscores
- Global Highscores
- Dynamic Location Spawning
- Sound effects on collection
- Player Animations

## Code Snippets

##### Player Animations

Player animations are controlled via 2 functions. Player movement function changing the player's movement state from different states on key change.
The player animation function stepping through all frames for each animation depending on player movement state.

```javascript
const playerMovementHandler = () => {
    if (keysPressed["KeyA"]){
        if(player.x > 0) {
            player.x -= 5

            // Change movement state if not already
            if (player.movementState !== "runningLeft") { player.movementState = "runningLeft" }
        }
    } else if (keysPressed["KeyD"]){
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
```
```javascript
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
```

##### Falling Items

Both GFuel and trash are spawned at a 50 / 50 chance and moved down the canvas using two functions. One controlling the spawning and the other controlling the movement speed.
The spawningFallingItems function runs a math random to decide if the spawned item will be trash or gfuel and then ensure we aren't outside the canvas. Once that is done it renders the image on the board and adds it to an array of fallingItems.
The second function (moveFallingItems) filters through the array of fallingItems and removes any that have hit the floor, despawns them and moves all the remaining items down the board.

```javascript
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
```
```javascript
const moveFallingItems = () => {
    clearBoard()

    if (points - lastPointsChange == 100) {
        fallSpeed += .5
        lastPointsChange = points
    }

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
            item.y += fallSpeed
            item.render()
        }
    })
}
```