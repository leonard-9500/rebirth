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
        // Light, partially transparent blue
        this.colorOnHit = "#87C5E688";
        // Dark blue
        this.colorNormal = "#3E9EEDff";
        this.fillColor = this.colorNormal;
        this.lives = 3;
        this.score = 0;
        this.gameOver = false;
        this.lastHitTick = Date.now();
        this.collisionCooldown = 1000;
        this.hit = false;
    }

    update()
    {
        this.getInput();
        this.collisionDetection();
        if (this.gameOver == false) { this.score = spawner.countDead; }
        this.draw();
    }

    getInput()
    {
        // Only move the player if the wait time has been passed.
        if (tp1 - this.moveTick >= this.moveInterval)
        {
            //console.log("Wait time has been passed\n");
            //console.log(tp1 - this.moveTick + "\n");

            if (spacePressed)
            {
                // This has the effect that the user must first release one of the move buttons before making another move. He cannot continuously move the player
                // by holding down a move button. This makes the movement easier by eliminating accidental double steps due to holding the move button down too long.
                if (spacePressedBefore == false)
                {

                    if (this.gameOver)
                    {
                        this.reset();
                        spawner.reset();
                    }
                    if (this.gameOver == false)
                    {
                        this.velY *= -1;
                    }
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
        /* Play zone collisions */
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

        /* Enemy collisions */
        for (let i = 0; i < spawner.enemies.length / 2; i++)
        {
            let difX = spawner.enemies[i*2] - this.x;
            let difY = spawner.enemies[i*2+1] - this.y;
            let dist = Math.sqrt((difX*difX) + (difY*difY));
            //if(i == 0){console.log(dist);}

            // If the wait time for collisions has been passed
            if (Date.now() - this.lastHitTick >= this.collisionCooldown)
            {
                // If the enemy is touching the player
                if (dist <= this.r+spawner.enemiesSize[i])
                {
                    console.log("Enemy has touched player.\n");
                    if (this.lives > 0)
                    {
                        this.lives -= 1;
                    }
                    if (this.lives == 0)
                    {
                        this.gameOver = true;
                    }

                    this.hit = true;
                    this.lastHitTick = Date.now();
                    console.log("Lives reduced.\n");
                }
                // If the enemy is not touching the player
                else
                {
                    this.hit = false;
                }
            }
            if (this.hit)
            {
                // Make player slightly transparent to indicate that he cannot be hit within the specified time frame.
                this.fillColor = this.colorOnHit;
            }
            if (this.hit == false)
            {
                this.fillColor = this.colorNormal;
            }
        }
    }

    draw()
    {
        // Draw player
        ctx.fillStyle = this.fillColor;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
        ctx.fill();

        if (this.gameOver)
        {
            // Draw game over title
            ctx.font = "64px sans-serif";
            ctx.textAlign = "center";

            // Shadow
            ctx.fillStyle = "#000000";
            ctx.fillText("Game Over", SCREEN_WIDTH / 2+4, SCREEN_HEIGHT / 2+4);

            // Actual text
            ctx.fillStyle = "#ffffff";
            ctx.fillText("Game Over", SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2);

            // Draw score
            ctx.fillStyle = "#000000";
            ctx.fillText("You survived " + this.score + " enemies.", SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 + 50);
        }
        else
        {
            // Draw score
            ctx.fillStyle = "#ffffff";
            ctx.font = "32px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(this.score, SCREEN_WIDTH/2, 35);

            // Draw lives
            ctx.fillStyle = "#ffffff";
            ctx.font = "32px sans-serif";
            ctx.fillText(this.lives, 150, 25);
        }
    }

    reset()
    {
        this.x = 0;
        this.y = 0;
        this.r = 50;
        this.velX = 0;
        this.velY = -15;
        this.moveInterval = 100;
        this.moveTick = Date.now();
        this.colorOnHit = "#87C5E688";
        this.colorNormal = "#3E9EEDff";
        this.fillColor = this.colorNormal;
        this.lives = 3;
        this.score = 0;
        this.gameOver = false;
        this.lastHitTick = Date.now();
        this.collisionCooldown = 1000;
        this.hit = false;
    }
}

class EnemySpawner
{
    constructor()
    {
        // An array of x/y pairs that correspond to one enemy each.
        this.enemies = [];
        // An array of colors that correspond to one x/y pair in the "enemies" array. So this always has half the length of the "enemies" array.
        this.enemiesColor = [];
        // An array of x/y pairs that correspond to the speed of each enemy in the "enemies" array.
        this.enemiesSpeed = [];
        // An array that corresponds to the size of each enemy in the "enemies" array. The radius.
        this.enemiesSize = [];
        // An array of predefined colors for the enemies. Different kinds of orange
        this.enemiesColorPalette = ["#FF9E1F", "#FF8B1F", "#F0C014", "#FE7519"];
        this.count = 0;
        this.maxCount = 10;
        this.countDead = 0;
        this.spawnInterval = 500;
        this.spawnTick = Date.now();
    }

    update()
    {
        // Apply movement to enemies
        if (this.count != 0)
        {
            for (let i = 0; i < this.count; i++)
            {
                this.enemies[i * 2] += this.enemiesSpeed[i*2]  * elapsedTime;
                this.enemies[i*2+1] += this.enemiesSpeed[i*2+1] * elapsedTime;
            }
        }

        // Only spawn enemy if maximum number hasn't been reached.
        if (this.count < this.maxCount)
        {
            // Spawn new enemy if wait time has been passed.
            if (tp1 - this.spawnTick >= this.spawnInterval)
            {
                //console.log("Wait time has been passed\n");
                //console.log(tp1 - this.spawnTick + "\n");
                this.spawnTick = Date.now();

                // Assign random color to current enemy being spawned
                this.enemiesColor[this.count] = this.enemiesColorPalette[getRandomIntInclusive(0, this.enemiesColorPalette.length-1)];//getRandomHexColor();
                // Assign random x speed
                this.enemiesSpeed[this.count * 2] = -getRandomNumInclusive(0.004, 0.0045);
                // Assign random y speed
                this.enemiesSpeed[this.count * 2 + 1] = 0;//getRandomNumInclusive(0.01, 0.05);
                // Assign random size, radius that is.
                this.enemiesSize[this.count] = getRandomIntInclusive(30, 35);
                // Let the enemy spawn to the right of the play zone
                this.enemies[this.count * 2] = SCREEN_WIDTH - playZoneBorderRight + this.enemiesSize[this.count];
                // Assign random y-value to the enemy within the play zone height.
                this.enemies[this.count * 2 + 1] = getRandomIntInclusive(playZoneBorderTop+this.enemiesSize[this.count], SCREEN_HEIGHT-playZoneBorderBottom-this.enemiesSize[this.count]);

                this.count += 1;
                //console.log("enemy added\n");
                //console.log(this.enemies);
            }
        }

        this.collisionDetection();
        this.draw();
    }

    collisionDetection()
    {
        for (let i = 0; i < this.enemies.length / 2; i++)
        {
            // If an enemy is behind the player, delete it
            if (this.enemies[i*2]+this.enemiesSize[i] < playZoneBorderLeft)
            {
                this.enemies.splice(i*2, 2);
                this.enemiesColor.splice(i, 1);
                this.enemiesSpeed.splice(i*2, 2);
                this.enemiesSize.splice(i, 1);
                this.count -= 1;
                this.countDead += 1;
                console.log("Enemy deleted.\n");
            }
            // If enemy is above play zone
            if (this.enemies[i*2+1] < playZoneBorderTop+this.enemiesSize[i])
            {
                this.enemies[i*2+1] = playZoneBorderTop + this.enemiesSize[i];
                // Invert y speed
                this.enemiesSpeed[i*2+1] *= -1;
            }
            // If enemy is below play zone
            if (this.enemies[i*2+1] > SCREEN_HEIGHT - playZoneBorderBottom - this.enemiesSize[i])
            {
                this.enemies[i*2+1] = SCREEN_HEIGHT - playZoneBorderBottom - this.enemiesSize[i];
                // Invert y speed
                this.enemiesSpeed[i * 2 + 1] *= -1;
            }
        }
    }

    draw()
    {
        for (let i = 0; i < this.enemies.length / 2; i++)
        {
            ctx.fillStyle = this.enemiesColor[i];
            ctx.beginPath();
            ctx.arc(this.enemies[i*2], this.enemies[i*2+1], this.enemiesSize[i], 0, 2 * Math.PI);
            ctx.fill();
        }
    }

    reset()
    {
        // An array of x/y pairs that correspond to one enemy each.
        this.enemies = [];
        // An array of colors that correspond to one x/y pair in the "enemies" array. So this always has half the length of the "enemies" array.
        this.enemiesColor = [];
        // An array of x/y pairs that correspond to the speed of each enemy in the "enemies" array.
        this.enemiesSpeed = [];
        // An array that corresponds to the size of each enemy in the "enemies" array. The radius.
        this.enemiesSize = [];
        // An array of predefined colors for the enemies. Different kinds of orange
        this.enemiesColorPalette = ["#FF9E1F", "#FF8B1F", "#F0C014", "#FE7519"];
        this.count = 0;
        this.maxCount = 10;
        this.countDead = 0;
        this.spawnInterval = 500;
        this.spawnTick = Date.now();
    }
}

// Function definitions
function getRandomHexColor()
{
    let values = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f"];
    let result = "#";

    for (let i = 0; i < 6; i++)
    {
        result += values[getRandomIntInclusive(0, 15)];
    }

    //console.log(result);

    return result;
}

function getRandomIntInclusive(min, max)
{
    min = Math.ceil(min);
    max = Math.floor(max);
    // The maximum and minimum are inclusive
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function getRandomNumInclusive(min, max)
{
    //min = Math.ceil(min);
    //max = Math.floor(max);
    // The maximum and minimum are inclusive
    return Math.random() * (max - min + 1) + min;
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
let spawner = new EnemySpawner;

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
    spawner.update();
    player.update();
}

// Start the game loop
main();