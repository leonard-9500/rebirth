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

let enterPressed = false,
    enterPressedBefore = false;

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

function keyDownHandler(e)
{
    if (e.code == "Space") { spacePressed = true; }
    if (e.code == "Enter") { enterPressed = true; }
}

function keyUpHandler(e)
{
    if (e.code == "Space") { spacePressed = false; }
    if (e.code == "Enter") { enterPressed = false; }
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
        this.velXParallax = 15;
        // How often can the player move. So he can switch direction 10 times a second.
        this.moveInterval = 100;
        this.moveTick = Date.now();
        // Light, partially transparent blue
        this.colorOnHit = "#87C5E688";
        // Dark blue
        this.colorNormal = "#3E9EEDff";
        this.colorOnCollect = "#C6E6FF";
        this.fillColor = this.colorNormal;
        this.lives = 3;
        this.score = 0;
        // The number of life orbs the player has collected.
        this.lifeOrbs = 0;
        // How many orbs does the player need to gain the ability to revive upon death.
        this.numOrbsForRevive = 10;
        this.numOrbsForBomb = 5;
        // This becomes true if the player dies and has enough orbs for revival.
        this.temporaryDeath = false;
        this.lifeOrbBombX = 0;
        this.lifeOrbBombY = 0;
        this.lifeOrbBombR = 25;
        this.lifeOrbBombActive = false;
        this.gameMenu = true;
        this.gameOver = false;
        this.animationActive = false;
        this.animationLength = 500;
        this.animationStartTick = 0;
        this.lastHitTick = Date.now();
        // The time after a collision with an enemy in which the player cannot collide again. So he is "invincible" for one second after a collision.
        this.collisionCooldown = 1000;
        this.hit = false;
    }

    update()
    {
        this.getInput();
        if (this.animationActive)
        {
            if (Date.now() - this.animationStartTick <= this.animationLength)
            {
                this.velY += 10;
                this.velX = this.velXParallax;
            }
            else if (Date.now() - this.animationStartTick > this.animationLength)
            {
                this.animationActive = false;
                this.velY = -15;
                this.velX = 0;
            }
        }
        if (this.lifeOrbBombActive)
        {
        }
        this.collisionDetection();
        if (this.gameOver == false) { this.score = enemySpawner.countDead; }
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

                    if (this.gameMenu)
                    {
                        this.gameMenu = false;
                    }
                    else if (this.gameOver)
                    {
                        this.reset();
                        enemySpawner.reset();
                        lifeOrbSpawner.reset();
                    }
                    // If player is in revival state
                    else if (this.temporaryDeath)
                    {
                        this.lifeOrbs -= 10;
                        this.lives = 3;
                        this.temporaryDeath = false;

                        this.x = 0;
                        this.y = 0;
                        this.velX = 0;
                        this.velY = -15;
                    }
                    // Invert move direction. The else if avoids the player moving at the start of a new round.
                    else if (this.gameOver == false && this.gameMenu == false)
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

            if (enterPressed)
            {
                if (enterPressedBefore == false)
                {
                    if (!this.gameOver && !this.gameMenu && !this.temporaryDeath)
                    {
                        if (this.orbs >= this.numOrbsForBomb)
                        {
                            this.orbs -= 5;
                            this.lifeOrbBombActive = true;
                            this.lifeOrbBombX = this.x;
                            this.lifeOrbBombY = this.y;
                        }
                    }
                    enterPressedBefore = true;
                }
            }

            if (enterPressed == false)
            {
                enterPressedBefore = false;
            }
        }

        // Update player position according to inputs
        this.y += this.velY;
        this.x += this.velX;
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
        for (let i = 0; i < enemySpawner.enemies.length / 2; i++)
        {
            let difX = enemySpawner.enemies[i*2] - this.x;
            let difY = enemySpawner.enemies[i*2+1] - this.y;
            let dist = Math.sqrt((difX*difX) + (difY*difY));
            //if(i == 0){console.log(dist);}

            // If the wait time for collisions has been passed
            if (Date.now() - this.lastHitTick >= this.collisionCooldown)
            {
                // If the enemy is touching the player
                if (dist <= this.r + enemySpawner.enemiesSize[i])
                {
                    console.log("Enemy has touched player.\n");
                    if (this.lives > 0)
                    {
                        this.lives -= 1;
                    }
                    if (this.lives == 0)
                    {
                        // Let the player revive if he has enough life orbs.
                        if (this.lifeOrbs >= this.numOrbsForRevive)
                        {
                            this.temporaryDeath = true;
                            if (this.animationActive == false)
                            {
                                this.animationStartTick = Date.now();
                                this.animationActive = true;
                            }
                        }
                        else
                        {
                            this.gameOver = true;
                            // This avoids accidental skipping of the game over screen, as the player must wait longer to press again.
                            this.moveInterval = 1000;
                            // Upon game over, the player should fly to the right and hit the ground.
                            this.velY = 8;
                            this.velX = this.velXParallax;
                        }
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

        /* Life orb collisions */
        for (let i = 0; i < lifeOrbSpawner.orbs.length / 2; i++)
        {
            let difX = lifeOrbSpawner.orbs[i * 2] - this.x;
            let difY = lifeOrbSpawner.orbs[i * 2 + 1] - this.y;
            let dist = Math.sqrt((difX * difX) + (difY * difY));
            //if(i == 0){console.log(dist);}

            // If the orb is touching the player. The player can even collect the orbs while "invincible" from a previous enemy collision.
            if (dist <= this.r + lifeOrbSpawner.orbsSize[i])
            {
                lifeOrbSpawner.orbs.splice(i * 2, 2);
                lifeOrbSpawner.orbsColor.splice(i, 1);
                lifeOrbSpawner.orbsSpeed.splice(i * 2, 2);
                lifeOrbSpawner.orbsSize.splice(i, 1);
                lifeOrbSpawner.count -= 1;
                this.lifeOrbs += 1;

                this.fillColor = this.colorOnCollect;

                console.log("Orb has touched player.\n");
            }
        }
    }

    draw()
    {
        if (this.gameMenu)
        {
            // Draw game title
            this.drawTextShaded("R E B I R T H", SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2, 72, "#FF8B1F", "#000000");

            // Draw prompt
            this.drawTextShaded("Press 'Space' to start", SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 + 150, 24, "#87C5E6", "#000000");
        }
        else if (this.gameOver)
        {
            // Draw game over title
            this.drawTextShaded("Game Over", SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2, 64, "#ffffff", "#000000");

            // Draw score
            this.drawTextShaded("You survived " + this.score + " enemies.", SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 + 50, 24, "#ffffff", "#000000");

            // Draw prompt
            this.drawTextShaded("Press 'Space' to try again", SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 + 150, 24, "#ffffff", "#000000");
        }
        else
        {
            // Draw player
            ctx.fillStyle = this.fillColor;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
            ctx.fill();

            // Draw score
            this.drawTextShaded(this.score, SCREEN_WIDTH / 2, 35, 32, "#ffffff", "#000000");

            // Draw number of lives
            ctx.fillStyle = this.fillColor;
            ctx.beginPath();
            ctx.arc(150, 25, 15, 0, 2 * Math.PI);
            ctx.fill();

            this.drawTextShaded(this.lives, 212, 35, 32, "#ffffff", "#000000");

            // Draw number of life orbs collected
            lifeOrbSpawner.drawLifeOrb(25, 25, 15);

            this.drawTextShaded(this.lifeOrbs, 85, 35, 32, "#ffffff", "#000000");

            if (this.temporaryDeath)
            {
                this.drawTextShaded("Press 'Space' to revive for 10 life orbs.", SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2, 32, "#ffffff", "#000000");
            }
        }
    }

    drawTextShaded(text, x, y, size, color, shadowColor)
    {
        // Text shadow
        ctx.textAlign = "center";
        ctx.font = size + "px sans-serif";
        ctx.fillStyle = shadowColor;
        ctx.fillText(text, x + size/16, y + size/16);

        // Actual text
        ctx.fillStyle = color;
        ctx.fillText(text, x, y);
    }

    reset()
    {
        this.x = 0;
        this.y = 0;
        this.r = 50;
        this.velX = 0;
        this.velY = -15;
        // How often can the player move.
        this.moveInterval = 100;
        this.moveTick = Date.now();
        // Light, partially transparent blue
        this.colorOnHit = "#87C5E688";
        // Dark blue
        this.colorNormal = "#3E9EEDff";
        this.colorOnCollect = "#ff8800";
        this.fillColor = this.colorNormal;
        this.lives = 3;
        this.score = 0;
        // The number of life orbs the player has collected.
        this.lifeOrbs = 0;
        this.gameOver = false;
        this.lastHitTick = Date.now();
        // The time after a collision with an enemy in which the player cannot collide again. So he is "invincible" for one second after a collision.
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
        this.maxCount = 5;
        this.countDead = 0;
        this.spawnInterval = 500;
        this.spawnTick = Date.now();
    }

    update()
    {
        if (player.gameMenu == false)
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
        this.maxCount = 5;
        this.countDead = 0;
        this.spawnInterval = 500;
        this.spawnTick = Date.now();
    }
}

class LifeOrbSpawner
{
    constructor()
    {
        // An array of x/y pairs that correspond to one orb each.
        this.orbs = [];
        // An array of colors that correspond to one x/y pair in the "orbs" array. So this always has half the length of the "orbs" array.
        this.orbsColor = [];
        // An array of x/y pairs that correspond to the speed of each orb in the "orbs" array.
        this.orbsSpeed = [];
        // An array that corresponds to the size of each orb in the "orbs" array. The radius.
        this.orbsSize = [];
        this.orbsR = 25;
        // An array of predefined colors for the orbs.
        this.orbsColorPalette = ["#03a5fc"];
        this.count = 0;
        this.maxCount = 1;
        this.countDead = 0;
        this.spawnInterval = 500;
        this.spawnTick = Date.now();
    }

    update()
    {
        if (player.gameMenu == false)
        {
            // Apply movement to orbs
            if (this.count != 0)
            {
                for (let i = 0; i < this.count; i++)
                {
                    this.orbs[i * 2] += this.orbsSpeed[i * 2] * elapsedTime;
                    this.orbs[i * 2 + 1] += this.orbsSpeed[i * 2 + 1] * elapsedTime;
                }
            }

            // Only spawn orbs if maximum number hasn't been reached.
            if (this.count < this.maxCount)
            {
                // Spawn new orbs if wait time has been passed.
                if (tp1 - this.spawnTick >= this.spawnInterval) {
                    //console.log("Wait time has been passed\n");
                    //console.log(tp1 - this.spawnTick + "\n");
                    this.spawnTick = Date.now();

                    // Assign random color to current orb being spawned
                    this.orbsColor[this.count] = this.orbsColorPalette[getRandomIntInclusive(0, this.orbsColorPalette.length - 1)];//getRandomHexColor();
                    // Assign random x speed
                    this.orbsSpeed[this.count * 2] = -0.2;//getRandomNumInclusive(0.0044, 0.0045);
                    // Assign random y speed
                    this.orbsSpeed[this.count * 2 + 1] = 0;//getRandomNumInclusive(0.01, 0.05);
                    // Assign random size, radius that is.
                    this.orbsSize[this.count] = 25;//getRandomIntInclusive(30, 35);
                    // Let the orb spawn to the right of the play zone
                    this.orbs[this.count * 2] = SCREEN_WIDTH - playZoneBorderRight + this.orbsSize[this.count];
                    // Assign random y-value to the orb within the play zone height.
                    this.orbs[this.count * 2 + 1] = getRandomIntInclusive(playZoneBorderTop + this.orbsSize[this.count], SCREEN_HEIGHT - playZoneBorderBottom - this.orbsSize[this.count]);

                    this.count += 1;
                    //console.log("orb added\n");
                    //console.log(this.orbs);
                }
            }

            this.collisionDetection();
            this.draw();
        }
    }

    collisionDetection()
    {
        for (let i = 0; i < this.orbs.length / 2; i++)
        {
            // If an orb is behind the player, delete it
            if (this.orbs[i * 2] + this.orbsSize[i] < playZoneBorderLeft)
            {
                this.orbs.splice(i * 2, 2);
                this.orbsColor.splice(i, 1);
                this.orbsSpeed.splice(i * 2, 2);
                this.orbsSize.splice(i, 1);
                this.count -= 1;
                this.countDead += 1;
                console.log("Enemy deleted.\n");
            }
            // If orb is above play zone
            if (this.orbs[i * 2 + 1] < playZoneBorderTop + this.orbsSize[i])
            {
                this.orbs[i * 2 + 1] = playZoneBorderTop + this.orbsSize[i];
                // Invert y speed
                this.orbsSpeed[i * 2 + 1] *= -1;
            }
            // If orb is below play zone
            if (this.orbs[i * 2 + 1] > SCREEN_HEIGHT - playZoneBorderBottom - this.orbsSize[i])
            {
                this.orbs[i * 2 + 1] = SCREEN_HEIGHT - playZoneBorderBottom - this.orbsSize[i];
                // Invert y speed
                this.orbsSpeed[i * 2 + 1] *= -1;
            }
        }
    }

    draw()
    {
        for (let i = 0; i < this.orbs.length / 2; i++)
        {
            this.drawLifeOrb(this.orbs[i * 2], this.orbs[i * 2 + 1], this.orbsR);
        }
    }

    drawLifeOrb(x, y, r)
    {
        // Outside
        ctx.strokeStyle = "#C6E6FF";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, 2 * Math.PI);
        ctx.stroke();

        // Inner Highlight
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(x, y, r/3, 0, 2 * Math.PI);
        ctx.fill();

        // Inner Fill
        ctx.fillStyle = "#A8D7FA88";
        ctx.beginPath();
        ctx.arc(x, y, r, 0, 2 * Math.PI);
        ctx.fill();
    }

    reset()
    {
        // An array of x/y pairs that correspond to one orb each.
        this.orbs = [];
        // An array of colors that correspond to one x/y pair in the "orbs" array. So this always has half the length of the "orbs" array.
        this.orbsColor = [];
        // An array of x/y pairs that correspond to the speed of each orb in the "orbs" array.
        this.orbsSpeed = [];
        // An array that corresponds to the size of each orb in the "orbs" array. The radius.
        this.orbsSize = [];
        this.orbsR = 25;
        // An array of predefined colors for the orbs.
        this.orbsColorPalette = ["#03a5fc"];
        this.count = 0;
        this.maxCount = 1;
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
    if (!player.gameMenu)
    {
        ctx.fillStyle = playZoneFillColor;

        // If you remove this call to beginPath, the player will be drawn even if it's call to fill() is commented out.
        ctx.beginPath();
        // Draw left border box
        ctx.rect(0, playZoneBorderTop, playZoneBorderLeft, SCREEN_HEIGHT - playZoneBorderTop - playZoneBorderBottom);

        // Draw right border box
        ctx.rect(SCREEN_WIDTH - playZoneBorderRight, playZoneBorderTop, playZoneBorderRight, SCREEN_HEIGHT - playZoneBorderTop - playZoneBorderBottom);

        // Draw top border box
        ctx.rect(0, 0, SCREEN_WIDTH, playZoneBorderTop);

        // Draw bottom border box
        ctx.rect(0, SCREEN_HEIGHT - playZoneBorderBottom, SCREEN_WIDTH, playZoneBorderBottom);
        ctx.fill();
    }
}

// Object definitions
let player = new Player;
let enemySpawner = new EnemySpawner;
let lifeOrbSpawner = new LifeOrbSpawner;

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
    // Draw experimental background
    ctx.fillStyle = "#222222";
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    drawPlayZone();
    enemySpawner.update();
    lifeOrbSpawner.update();
    player.update();
}

// Start the game loop
main();