// CANVAS
const canvas = document.querySelector('canvas');
canvas.width = innerWidth;
canvas.height = innerHeight;

const ctx = canvas.getContext('2d');

// PLAYER
class Player {
    constructor(x, y, radius, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
    }

    getPlayer() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}

// CENTERING PLAYER OBJECT / DEFINE THE X AND Y COORDINATE TO THE CENTER OF SCREEN
const xCoordinate = canvas.width / 2;
const yCoordinate = canvas.height / 2;

let player;
let projectiles;
let enemies;
let splashes;
let score = 0;

// RESTART OR START THE GAME
function init() {
    player = new Player(xCoordinate, yCoordinate, 10, '#fafafa');
    projectiles = [];
    enemies = [];
    splashes = [];
    score = 0;
    scoreElement.innerHTML = score;
}


// PROJECTILE
class Projectile {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }

    getProjectile() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    updateProjectile() {
        this.getProjectile();
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }
}

// ENEMY
class Enemy {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }

    getEnemy() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    updateEnemies() {
        this.getEnemy();
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }
}

function spawnEnemies() {
    setInterval(() => {
        const radiusEnemies = Math.random() * (30 - 4) + 4;
        let xEnemies;
        let yEnemies;

        if (Math.random() < 0.5) {
            xEnemies = 0 - radiusEnemies;
            yEnemies = Math.random() * canvas.height;
        } else {
            xEnemies = Math.random() * canvas.width;
            yEnemies = 0 - radiusEnemies;
        }

        const colorEnemies = `hsl(${Math.random() * 360}, 50%, 50%)`;

        const angle = Math.atan2(yCoordinate - yEnemies, xCoordinate - xEnemies);

        const velocityEnemies = {
            x: Math.cos(angle),
            y: Math.sin(angle)
        }

        enemies.push(
            new Enemy(xEnemies, yEnemies, radiusEnemies, colorEnemies, velocityEnemies)
        )
    }, 1000)

}

// SPLASH
class Splash {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
        this.alpha = 1;
    }

    getSplash() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.restore();
    }

    updateSplash() {
        this.getSplash();
        this.velocity.x *= 0.99;
        this.velocity.y *= 0.99;
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
        this.alpha -= 0.01;
    }
}

let animation;
const scoreElement = document.querySelector('#scoreElement');
const modalElement = document.querySelector('#modalElement');
const modalScoreElement = document.querySelector('#modalScoreElement');
const startButton = document.querySelector('#startButton');

function animate() {
    // LOOP ANIMATION
    animation = requestAnimationFrame(animate);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';

    // REMOVE PROJECTILE PATH
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    player.getPlayer();
    splashes.forEach((splash, splashIndex) => {
        if (splash.alpha <= 0) {
            splashes.splice(splashIndex, 1);
        } else {
            splash.updateSplash();
        }
    });

    // UPDATE PROJECTILE
    projectiles.forEach((projectile, projectileIndex) => {
        projectile.updateProjectile();

        if (
            projectile.x + projectile.radius < 0 ||
            projectile.x - projectile.radius > canvas.width ||
            projectile.y + projectile.radius < 0 ||
            projectile.y - projectile.radius > canvas.height
        ) {
            setTimeout(() => {
                projectiles.splice(projectileIndex, 1);
            }, 0);
        }
    })

    // UPDATE ENEMIES
    enemies.forEach((enemy, enemyIndex) => {
        enemy.updateEnemies();

        const playerDistance = Math.hypot(player.x - enemy.x, player.y - enemy.y);

        // ENEMY HIT PLAYER
        if (playerDistance - enemy.radius - player.radius < 1) {
            cancelAnimationFrame(animation);
            modalElement.style.display = 'flex';
            modalScoreElement.innerHTML = score;
        }

        // PROJECTILE COLLIDE
        projectiles.forEach((projectile, projectileIndex) => {
            const projectileDistance = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)

            // PROJECTILE HIT THE ENEMY GO SPLASHING THE ENEMY
            if (projectileDistance - enemy.radius - projectile.radius < 1) {
                for (let i = 0; i < enemy.radius * 2; i++) {
                    splashes.push(
                        new Splash(
                            projectile.x,
                            projectile.y,
                            Math.random() * 2,
                            enemy.color,
                            {
                                x: (Math.random() - 0.5) * (Math.random() * 6),
                                y: (Math.random() - 0.5) * (Math.random() * 6)
                            }
                        )
                    );
                }
                if (enemy.radius - 10 > 5) {
                    // INCREASE THE SCORE
                    score += 100;
                    scoreElement.innerHTML = score;

                    gsap.to(enemy, {
                        radius: enemy.radius - 10
                    });
                    setTimeout(() => {
                        projectiles.splice(projectileIndex, 1);
                    }, 0);
                } else {
                    // INCREASE BONUS SCORE WHEN ENEMY SPLASHING OR DIE
                    score += 250;
                    scoreElement.innerHTML = score;

                    setTimeout(() => {
                        enemies.splice(enemyIndex, 1);
                        projectiles.splice(projectileIndex, 1);
                    }, 0);
                }

            }
        })
    })
}

// CLICK PROJECTILE
addEventListener('click', (evt) => {
    const angle = Math.atan2(evt.clientY - yCoordinate, evt.clientX - xCoordinate);
    const velocity = {
        x: Math.cos(angle) * 5,
        y: Math.sin(angle) * 5
    }

    projectiles.push(
        new Projectile(xCoordinate, yCoordinate, 5, '#fafafa', velocity)
    );
});

startButton.addEventListener('click', function () {
    init();
    animate();
    spawnEnemies();
    modalElement.style.display = 'none';
});

