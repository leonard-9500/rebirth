/* Program: script.js
 * Programmer: Leonard Michel
 * Start Date: 30.07.2021
 * Last Change:
 * End Date: /
 * License: /
 * Version: 0.0.0.0
*/

/**** INITIALIZATION ****/

const SCREEN_WIDTH = 1280;
const SCREEN_HEIGHT = 720;

let canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = SCREEN_WIDTH;
canvas.height = SCREEN_HEIGHT;

let spacePressed = false;
// If the user has just moved the player this becomes true and the user may only gain the ability to move the player again by first releasing the move button.
let spacePressedBefore = false;

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

function keyDownHandler(e)
{
    if (e.code == "Space") { spacePressed = true; }
}

function keyUpHandler(e)
{
    if (e.code == "Space") { spacePressed = false; }
}


class Player
{
    constructor()
    {
        this.x = 0;
        this.y = 0;
        this.r = 50;
        this.velX = 0;
        this.velY = -15;
        this.moveInterval = 100;
        this.moveTick = Date.now();
        this.fillColor = "#000000";
    }

    update()
    {
        this.getInput();
        this.collisionDetection();
        this.draw();
    }

    getInput()
    {
        // Only move the player if the wait time has been passed.
        if (tp1 - this.moveTick >= this.moveInterval)
        {
            console.log("Wait time has been passed\n");
            console.log(tp1 - this.moveTick + "\n");

            if (spacePressed)
            {
                // This has the effect that the user must first release one of the move buttons before making another move. He cannot continuously move the player
                // by holding down a move button. This makes the movement easier by eliminating accidental double steps due to holding the move button down too long.
                if (spacePressedBefore == false)
                {
                    this.velY *= -1;
                    spacePressedBefore = true;
                    this.moveTick = Date.now();
                }
            }

            if (spacePressed == false)
            {
                spacePressedBefore = false;
            }
        }

        // Update player position according to inputs
        this.y += this.velY;
    }

    collisionDetection()
    {
        // Left
        if (this.x - this.r < playZoneBorderLeft)
        {
            this.x = playZoneBorderLeft + this.r;
        }
        // Right
        if (this.x + this.r > SCREEN_WIDTH - playZoneBorderRight)
        {
            this.x = SCREEN_WIDTH - playZoneBorderRight - this.r;
        }
        // Top
        if (this.y - this.r < playZoneBorderTop)
        {
            this.y = playZoneBorderTop + this.r;
        }
        // Bottom
        if (this.y + this.r > SCREEN_HEIGHT - playZoneBorderBottom)
        {
            this.y = SCREEN_HEIGHT - playZoneBorderBottom - this.r;
        }
    }

    draw()
    {
        ctx.fillStyle = this.fillColor;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
        ctx.fill();
    }
}

class Enemy
{
    constructor()
    {
        // An array of x/y pairs that correspond to one enemy each.
        this.enemies = [];
        // An array of colors that correspond to one x/y pair in the "enemies" array. So this always has half the length of the "enemies" array.
        this.enemiesColor = [];
        // An array that corresponds to the speed of each enemy in the "enemies" array.
        this.enemiesSpeed = [];
        // An array that corresponds to the size of each enemy in the "enemies" array.
        this.enemiesSize = [];
        this.count = 0;
        this.maxCount = 10;
        this.spawnInterval = 500;
        this.spawnTick = Date.now();
    }

    update()
    {
        if (this.count != 0)
        {
            for (let i = 0; i < this.count; i++)
            {
                this.enemies[i * 2] -= this.enemySpeed * elapsedTime;
            }
        }

        // Spawn new enemy if wait time has been passed.
        if (this.count < this.maxCount)
        {
            if (tp1 - this.spawnTick >= this.spawnInterval)
            {
                console.log("Wait time has been passed\n");
                console.log(tp1 - this.spawnTick + "\n");
                this.spawnTick = Date.now();

                // Let the enemy spawn 10 units away from the origin.
                this.enemiesColor[this.count] = getRandomHexColor;
                this.enemies[this.count * 2] = 0;

                this.count += 1;
                console.log("enemy added\n");
                //console.log(this.enemies);
            }
        }

        this.draw();
    }

    draw()
    {
        for (let i = 0; i < this.enemies.length / 2; i++)
        {
            ctx.fillStyle = this.enemiesColor[i];
            ctx.beginPath();
            ctx.arc(this.enemies[i*2], this.enemies[i*2+1], this.enemiesSize[i*2], 0, 2 * Math.PI);
        }
    }
}

// Function definitions
getRandomHexColor()
{
    let values = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f"];
    let result = "#";

    for (let i = 0; i < 6; i++)
    {
        result += values[getRandomIntInclusive(0, 15)];
    }

    console.log(result);

    return result;
}

getRandomIntInclusive(min, max)
{
    min = Math.ceil(min);
    max = Math.floor(max);
    // The maximum and minimum are inclusive
    return Math.floor(Math.random() * (max - min + 1) + min);
}

let playZoneBorderTop = 50,
    playZoneBorderBottom = 50,
    playZoneBorderLeft = 0,
    playZoneBorderRight = 0;
let playZoneFillColor = "#444444";

function drawPlayZone()
{
    ctx.fillStyle = playZoneFillColor;

    // Draw left border box
    ctx.rect(0, playZoneBorderTop, playZoneBorderLeft, SCREEN_HEIGHT - playZoneBorderTop - playZoneBorderBottom);
    ctx.fill();
    // Draw right border box
    ctx.rect(SCREEN_WIDTH - playZoneBorderRight, playZoneBorderTop, playZoneBorderRight, SCREEN_HEIGHT - playZoneBorderTop - playZoneBorderBottom);
    ctx.fill();
    // Draw top border box
    ctx.rect(0, 0, SCREEN_WIDTH, playZoneBorderTop);
    ctx.fill();
    // Draw bottom border box
    ctx.rect(0, SCREEN_HEIGHT - playZoneBorderBottom, SCREEN_WIDTH, playZoneBorderBottom);
    ctx.fill();
}

// Object definitions
let player = new Player;

// Time variables
let tp1 = Date.now();
let tp2 = Date.now();
let elapsedTime = 0;

// The game loop
window.main = function ()
{
    window.requestAnimationFrame(main);
    // Get elapsed time for last tick.
    tp2 = Date.now();
    elapsedTime = tp2 - tp1;
    //console.log("elapsedTime:" + elapsedTime + "\n");
    tp1 = tp2;

    ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    drawPlayZone();
    player.update();
}

// Start the game loop
main();