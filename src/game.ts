const CANVAS_BORDER_COLOUR = 'white';
const CANVAS_BACKGROUND_COLOUR = 'black';
let SNAKE_COLOUR = '#90EE90';
let SNAKE_BORDER_COLOUR = 'darkgreen';
let FOOD_COLOUR = '#FF0000';
let FOOD_BORDER_COLOUR = 'darkred';

interface Point {
    x: number;
    y: number;
}

class SnakeGame {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private snake: Point[];
    private food: Point;
    private dx: number = 10;
    private dy: number = 0;
    private score: number = 0;
    private changingDirection: boolean = false;
    private gameInterval: number | null = null;
    private gameStarted: boolean = false;
    private stars: {x: number, y: number, size: number, opacity: number, speed: number}[] = [];

    constructor() {
        this.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;

        // Initialize stars for background
        this.initStars();

        // Initial snake position
        this.snake = [
            {x: 150, y: 150},
            {x: 140, y: 150},
            {x: 130, y: 150},
            {x: 120, y: 150},
            {x: 110, y: 150}
        ];

        this.food = this.createFood();

        document.addEventListener('keydown', this.changeDirection.bind(this));

        // Add start button listener
        const startButton = document.getElementById('startButton') as HTMLButtonElement;
        startButton.addEventListener('click', () => {
            this.startGame();
        });

        // Add color picker listeners
        const snakeColorPicker = document.getElementById('snakeColor') as HTMLInputElement;
        const foodColorPicker = document.getElementById('foodColor') as HTMLInputElement;

        snakeColorPicker.addEventListener('input', (e) => {
            SNAKE_COLOUR = (e.target as HTMLInputElement).value;
            SNAKE_BORDER_COLOUR = this.darkenColor(SNAKE_COLOUR);
        });

        foodColorPicker.addEventListener('input', (e) => {
            FOOD_COLOUR = (e.target as HTMLInputElement).value;
            FOOD_BORDER_COLOUR = this.darkenColor(FOOD_COLOUR);
        });

        // Draw initial screen with stars
        this.drawBackground();
    }

    private startGame(): void {
        // Hide start screen and show game elements
        document.getElementById('start-screen')!.style.display = 'none';
        document.getElementById('gameCanvas')!.style.display = 'block';
        document.getElementById('score')!.style.display = 'block';
        document.getElementById('controls')!.style.display = 'block';
        
        this.gameStarted = true;
        if (this.gameInterval) clearInterval(this.gameInterval);
        this.score = 0;
        this.updateScore();
        this.main();
    }

    private gameOver(): void {
        this.gameStarted = false;
        alert('Game Over! Your Score: ' + this.score);
        
        // Show start screen again
        document.getElementById('start-screen')!.style.display = 'block';
        document.getElementById('gameCanvas')!.style.display = 'none';
        document.getElementById('score')!.style.display = 'none';
        document.getElementById('controls')!.style.display = 'none';
        
        // Reset game state
        this.snake = [
            {x: 150, y: 150},
            {x: 140, y: 150},
            {x: 130, y: 150},
            {x: 120, y: 150},
            {x: 110, y: 150}
        ];
        this.dx = 10;
        this.dy = 0;
        this.score = 0;
        this.food = this.createFood();
    }

    private gameLoop(): void {
        if (!this.gameStarted) return;

        if (this.didGameEnd()) {
            this.gameOver();
            return;
        }

        setTimeout(() => {
            this.changingDirection = false;
            this.clearCanvas();
            this.drawFood();
            this.advanceSnake();
            this.drawSnake();
            
            // Continue game loop
            this.gameLoop();
        }, 100);
    }

    private clearCanvas(): void {
        this.ctx.fillStyle = CANVAS_BACKGROUND_COLOUR;
        this.ctx.strokeStyle = CANVAS_BORDER_COLOUR;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.strokeRect(0, 0, this.canvas.width, this.canvas.height);
    }

    private drawSnake(): void {
        this.snake.forEach(this.drawSnakePart.bind(this));
    }

    private drawSnakePart(snakePart: Point): void {
        this.ctx.fillStyle = SNAKE_COLOUR;
        this.ctx.strokeStyle = SNAKE_BORDER_COLOUR;
        this.ctx.fillRect(snakePart.x, snakePart.y, 10, 10);
        this.ctx.strokeRect(snakePart.x, snakePart.y, 10, 10);
    }

    private advanceSnake(): void {
        const head = {x: this.snake[0].x + this.dx, y: this.snake[0].y + this.dy};
        this.snake.unshift(head);

        const didEatFood = this.snake[0].x === this.food.x && this.snake[0].y === this.food.y;
        if (didEatFood) {
            this.score += 10;
            this.updateScore();
            this.food = this.createFood();
        } else {
            this.snake.pop();
        }
    }

    private changeDirection(event: KeyboardEvent): void {
        const LEFT_KEY = 37;
        const RIGHT_KEY = 39;
        const UP_KEY = 38;
        const DOWN_KEY = 40;

        if (this.changingDirection) return;
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

    private randomTen(min: number, max: number): number {
        return Math.round((Math.random() * (max - min) + min) / 10) * 10;
    }

    private createFood(): Point {
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
        for(let part of this.snake) {
            if (part.x === foodX && part.y === foodY) {
                return this.createFood();
            }
        }

        return {x: foodX, y: foodY};
    }

    private didGameEnd(): boolean {
        for (let i = 4; i < this.snake.length; i++) {
            const didCollide = this.snake[i].x === this.snake[0].x && this.snake[i].y === this.snake[0].y;
            if (didCollide) return true;
        }

        const hitLeftWall = this.snake[0].x < 0;
        const hitRightWall = this.snake[0].x > this.canvas.width - 10;
        const hitToptWall = this.snake[0].y < 0;
        const hitBottomWall = this.snake[0].y > this.canvas.height - 10;

        return hitLeftWall || hitRightWall || hitToptWall || hitBottomWall;
    }

    private drawFood(): void {
        this.ctx.fillStyle = FOOD_COLOUR;
        this.ctx.strokeStyle = FOOD_BORDER_COLOUR;
        this.ctx.fillRect(this.food.x, this.food.y, 10, 10);
        this.ctx.strokeRect(this.food.x, this.food.y, 10, 10);
    }

    private updateScore(): void {
        const scoreElement = document.getElementById('score');
        if (scoreElement) {
            scoreElement.innerHTML = 'Score: ' + this.score;
        }
    }

    private initStars(): void {
        for (let i = 0; i < 50; i++) {
            this.stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 2 + 1,
                opacity: Math.random(),
                speed: Math.random() * 0.02 + 0.01
            });
        }
    }

    private drawBackground(): void {
        this.ctx.fillStyle = CANVAS_BACKGROUND_COLOUR;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw flashing stars
        this.stars.forEach(star => {
            const alpha = (Math.sin(Date.now() * star.speed) + 1) / 2;
            this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.5})`;
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        this.ctx.strokeStyle = CANVAS_BORDER_COLOUR;
        this.ctx.strokeRect(0, 0, this.canvas.width, this.canvas.height);
    }

    private darkenColor(color: string): string {
        // Convert hex to RGB, darken, and convert back
        const hex = color.replace('#', '');
        const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - 50);
        const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - 50);
        const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - 50);
        return `rgb(${r}, ${g}, ${b})`;
    }
}

// Start the game when the window loads
window.onload = () => {
    new SnakeGame();
};

