"use strict";
const CANVAS_BORDER_COLOUR = 'white';
const CANVAS_BACKGROUND_COLOUR = 'black';
const SNAKE_COLOUR = 'lightgreen';
const SNAKE_BORDER_COLOUR = 'darkgreen';
const FOOD_COLOUR = 'red';
const FOOD_BORDER_COLOUR = 'darkred';
class SnakeGame {
    constructor() {
        this.dx = 10;
        this.dy = 0;
        this.score = 0;
        this.changingDirection = false;
        this.gameInterval = null;
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        // Initial snake position
        this.snake = [
            { x: 150, y: 150 },
            { x: 140, y: 150 },
            { x: 130, y: 150 },
            { x: 120, y: 150 },
            { x: 110, y: 150 }
        ];
        this.food = this.createFood();
        document.addEventListener('keydown', this.changeDirection.bind(this));
        this.startGame();
    }
    startGame() {
        if (this.gameInterval)
            clearInterval(this.gameInterval);
        this.score = 0;
        this.updateScore();
        this.main();
    }
    main() {
        if (this.didGameEnd()) {
            alert('Game Over! Your Score: ' + this.score);
            // Reset game
            this.snake = [
                { x: 150, y: 150 },
                { x: 140, y: 150 },
                { x: 130, y: 150 },
                { x: 120, y: 150 },
                { x: 110, y: 150 }
            ];
            this.dx = 10;
            this.dy = 0;
            this.score = 0;
            this.updateScore();
            this.food = this.createFood();
            this.main();
            return;
        }
        setTimeout(() => {
            this.changingDirection = false;
            this.clearCanvas();
            this.drawFood();
            this.advanceSnake();
            this.drawSnake();
            // Call main again
            this.main();
        }, 100);
    }
    clearCanvas() {
        this.ctx.fillStyle = CANVAS_BACKGROUND_COLOUR;
        this.ctx.strokeStyle = CANVAS_BORDER_COLOUR;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.strokeRect(0, 0, this.canvas.width, this.canvas.height);
    }
    drawSnake() {
        this.snake.forEach(this.drawSnakePart.bind(this));
    }
    drawSnakePart(snakePart) {
        this.ctx.fillStyle = SNAKE_COLOUR;
        this.ctx.strokeStyle = SNAKE_BORDER_COLOUR;
        this.ctx.fillRect(snakePart.x, snakePart.y, 10, 10);
        this.ctx.strokeRect(snakePart.x, snakePart.y, 10, 10);
    }
    advanceSnake() {
        const head = { x: this.snake[0].x + this.dx, y: this.snake[0].y + this.dy };
        this.snake.unshift(head);
        const didEatFood = this.snake[0].x === this.food.x && this.snake[0].y === this.food.y;
        if (didEatFood) {
            this.score += 10;
            this.updateScore();
            this.food = this.createFood();
        }
        else {
            this.snake.pop();
        }
    }
    changeDirection(event) {
        const LEFT_KEY = 37;
        const RIGHT_KEY = 39;
        const UP_KEY = 38;
        const DOWN_KEY = 40;
        if (this.changingDirection)
            return;
        this.changingDirection = true;
        const keyPressed = event.keyCode;
        const goingUp = this.dy === -10;
        const goingDown = this.dy === 10;
        const goingRight = this.dx === 10;
        const goingLeft = this.dx === -10;
        if (keyPressed === LEFT_KEY && !goingRight) {
            this.dx = -10;
            this.dy = 0;
        }
        if (keyPressed === UP_KEY && !goingDown) {
            this.dx = 0;
            this.dy = -10;
        }
        if (keyPressed === RIGHT_KEY && !goingLeft) {
            this.dx = 10;
            this.dy = 0;
        }
        if (keyPressed === DOWN_KEY && !goingUp) {
            this.dx = 0;
            this.dy = 10;
        }
    }
    randomTen(min, max) {
        return Math.round((Math.random() * (max - min) + min) / 10) * 10;
    }
    createFood() {
        const foodX = this.randomTen(0, this.canvas.width - 10);
        const foodY = this.randomTen(0, this.canvas.height - 10);
        // Check if food spawns on snake
        this.snake.forEach(function isFoodOnSnake(part) {
            const foodIsoNsnake = part.x == foodX && part.y == foodY;
            if (foodIsoNsnake) {
                // Recursively generate new food
                // Note: In class context this keyword handling inside forEach needs care or arrow function
            }
        });
        // Simple check to ensure food doesn't spawn on snake, though recursion above was incomplete
        // Better implementation:
        for (let part of this.snake) {
            if (part.x === foodX && part.y === foodY) {
                return this.createFood();
            }
        }
        return { x: foodX, y: foodY };
    }
    didGameEnd() {
        for (let i = 4; i < this.snake.length; i++) {
            const didCollide = this.snake[i].x === this.snake[0].x && this.snake[i].y === this.snake[0].y;
            if (didCollide)
                return true;
        }
        const hitLeftWall = this.snake[0].x < 0;
        const hitRightWall = this.snake[0].x > this.canvas.width - 10;
        const hitToptWall = this.snake[0].y < 0;
        const hitBottomWall = this.snake[0].y > this.canvas.height - 10;
        return hitLeftWall || hitRightWall || hitToptWall || hitBottomWall;
    }
    drawFood() {
        this.ctx.fillStyle = FOOD_COLOUR;
        this.ctx.strokeStyle = FOOD_BORDER_COLOUR;
        this.ctx.fillRect(this.food.x, this.food.y, 10, 10);
        this.ctx.strokeRect(this.food.x, this.food.y, 10, 10);
    }
    updateScore() {
        const scoreElement = document.getElementById('score');
        if (scoreElement) {
            scoreElement.innerHTML = 'Score: ' + this.score;
        }
    }
}
// Start the game when the window loads
window.onload = () => {
    new SnakeGame();
};
