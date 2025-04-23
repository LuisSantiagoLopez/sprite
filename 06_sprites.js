/*
 * Coin Collection Game using Sprites and Animation
 *
 * Gilberto Echeverria
 * 2025-02-25 (Updated)
 */

"use strict";

// Game parameters
const canvasWidth = 800;
const canvasHeight = 600;
const coinSize = 32;
const numCoins = 10;
const playerSpeed = 0.3;
const animationDelay = 150;

let ctx, game, oldTime;

class Coin extends AnimatedObject {
    constructor(position, size, sheetCols) {
        super(position, size, size, "gold", "coin", sheetCols);
        this.collected = false;
    }

    update(deltaTime) {
        if (!this.collected) this.updateFrame(deltaTime);
    }
}

class Player extends AnimatedObject {
    constructor(position, width, height, color, sheetCols) {
        super(position, width, height, color, "player", sheetCols);
        this.velocity = new Vec(0, 0);
        this.currentDirection = null;
        this.keysPressed = new Set();
    }

    update(deltaTime) {
        this.position = this.position.plus(this.velocity.times(deltaTime));
        this.position.y = Math.max(0, Math.min(this.position.y, canvasHeight - this.height));
        this.position.x = Math.max(0, Math.min(this.position.x, canvasWidth - this.width));
        this.updateFrame(deltaTime);
    }
}

function boxOverlap(obj1, obj2) {
    return obj1.position.x + obj1.width > obj2.position.x &&
           obj1.position.x < obj2.position.x + obj2.width &&
           obj1.position.y + obj1.height > obj2.position.y &&
           obj1.position.y < obj2.position.y + obj2.height;
}

function randomRange(size) {
    return Math.floor(Math.random() * size);
}

class CoinGame {
    constructor() {
        this.score = 0;
        this.scoreLabel = new TextLabel(20, 40, "24px Arial", "black");
        this.allCoinsCollected = false;
        this.initObjects();
        this.createEventListeners();
    }

    initObjects() {
        this.player = new Player(new Vec(canvasWidth / 2, canvasHeight / 2), 60, 60, "red", 3);
        this.player.setSprite('blordrough_quartermaster-NESW.png', new Rect(0, 0, 48, 64));
        this.player.setAnimation(7, 7, false, animationDelay);

        this.coins = Array.from({ length: numCoins }, () => {
            const pos = new Vec(randomRange(canvasWidth - coinSize), randomRange(canvasHeight - coinSize));
            const coin = new Coin(pos, coinSize, 8);
            coin.setSprite('coin_gold.png', new Rect(0, 0, 32, 32));
            coin.setAnimation(0, 7, true, 80);
            return coin;
        });
    }

    draw(ctx) {
        ctx.fillStyle = "#87ceeb";
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        this.coins.filter(c => !c.collected).forEach(coin => coin.draw(ctx));
        this.player.draw(ctx);
        this.scoreLabel.draw(ctx, `Coins: ${this.score}/${numCoins}`);

        if (this.allCoinsCollected) {
            ctx.font = "36px Arial";
            ctx.fillStyle = "green";
            ctx.textAlign = "center";
            ctx.fillText("All Coins Collected!", canvasWidth / 2, canvasHeight / 2);
            ctx.font = "24px Arial";
            ctx.fillText("Press 'R' to play again", canvasWidth / 2, canvasHeight / 2 + 40);
        }
    }

    update(deltaTime) {
        this.player.update(deltaTime);

        this.coins.forEach(coin => {
            coin.update(deltaTime);
            if (!coin.collected && boxOverlap(this.player, coin)) {
                coin.collected = true;
                this.score++;
                if (this.score === numCoins) this.allCoinsCollected = true;
            }
        });
    }

    createEventListeners() {
        window.addEventListener('keydown', e => {
            if (this.player.keysPressed.has(e.key)) return;
            this.player.keysPressed.add(e.key);
            const moves = {
                'w': { v: [0, -playerSpeed], anim: [0, 2] },
                'a': { v: [-playerSpeed, 0], anim: [9, 11] },
                's': { v: [0, playerSpeed], anim: [6, 8] },
                'd': { v: [playerSpeed, 0], anim: [3, 5] },
                'ArrowUp': { v: [0, -playerSpeed], anim: [0, 2] },
                'ArrowLeft': { v: [-playerSpeed, 0], anim: [9, 11] },
                'ArrowDown': { v: [0, playerSpeed], anim: [6, 8] },
                'ArrowRight': { v: [playerSpeed, 0], anim: [3, 5] },
            };
            const move = moves[e.key];
            if (move) {
                this.player.velocity = new Vec(...move.v);
                this.player.setAnimation(...move.anim, true, animationDelay);
                this.player.currentDirection = e.key;
            }
            if (e.key === 'r' && this.allCoinsCollected) this.reset();
        });

        window.addEventListener('keyup', e => {
            this.player.keysPressed.delete(e.key);
            if (e.key === this.player.currentDirection) {
                this.player.velocity = new Vec(0, 0);
                const idleFrame = { 'w': 1, 'a': 10, 's': 7, 'd': 4, 'ArrowUp': 1, 'ArrowLeft': 10, 'ArrowDown': 7, 'ArrowRight': 4 };
                this.player.setAnimation(idleFrame[e.key], idleFrame[e.key], false, animationDelay);
                this.player.currentDirection = null;
            }
        });
    }

    reset() {
        this.score = 0;
        this.allCoinsCollected = false;
        this.initObjects();
    }
}

function main() {
    const canvas = document.getElementById('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    ctx = canvas.getContext('2d');
    game = new CoinGame();
    requestAnimationFrame(drawScene);
}

function drawScene(newTime) {
    if (!oldTime) oldTime = newTime;
    const deltaTime = newTime - oldTime;
    game.draw(ctx);
    game.update(deltaTime);
    oldTime = newTime;
    requestAnimationFrame(drawScene);
}

window.onload = main;
