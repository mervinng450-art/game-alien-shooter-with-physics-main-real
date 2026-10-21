class Explosion {
    constructor(x, y, maxRadius) {
        this.x = x;
        this.y = y;
        this.maxRadius = maxRadius;
        this.radius = 10;
        this.opacity = 1.0;
        this.markedForDeletion = false;
    }

    update(dt) {
        this.radius += 500 * dt; 
        this.opacity -= 1.8 * dt; 

        if (this.opacity <= 0 || this.radius > this.maxRadius) {
            this.opacity = 0;
            this.markedForDeletion = true;
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2);
        ctx.fillStyle = "rgba(255, 69, 0, 0.4)"; 
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2);
        ctx.strokeStyle = "rgba(255, 255, 0, 0.9)"; 
        ctx.lineWidth = 5;
        ctx.stroke();

        ctx.restore();
    }
}

class EnemyManager {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.enemies = [];
        this.enemyProjectiles = []; 
        this.explosions = []; 
        
        this.currentLevel = 1;
        this.maxLevel = 10;
        this.spawnTimer = 0;
        this.spawnInterval = 2; 
        this.enemiesToSpawn = []; 
        this.levelCompleted = false;
        
        this.isTransitioning = false;
        this.transitionTimer = 0;

        this.waveConfig = {
            1:  { attacker: 5,  shooter: 0,  boomzoner: 0,  interval: 2.0 },
            2:  { attacker: 10, shooter: 0,  boomzoner: 0,  interval: 1.8 },
            3:  { attacker: 13, shooter: 2,  boomzoner: 0,  interval: 1.6 },
            4:  { attacker: 18, shooter: 4,  boomzoner: 1,  interval: 1.5 },
            5:  { attacker: 22, shooter: 6,  boomzoner: 3,  interval: 1.3 },
            6:  { attacker: 27, shooter: 8,  boomzoner: 5,  interval: 1.1 },
            7:  { attacker: 33, shooter: 10, boomzoner: 7,  interval: 0.9 },
            8:  { attacker: 38, shooter: 12, boomzoner: 10, interval: 0.8 },
            9:  { attacker: 45, shooter: 15, boomzoner: 12, interval: 0.7 },
            10: { attacker: 55, shooter: 20, boomzoner: 15, interval: 0.5 } 
        };
        
        this.loadLevel(this.currentLevel);
    }

    loadLevel(level) {
        this.currentLevel = level;
        this.enemies = [];
        this.enemiesToSpawn = [];
        this.levelCompleted = false;
        
        const config = this.waveConfig[level];
        this.spawnInterval = config.interval;

        for(let i=0; i<config.attacker; i++) this.enemiesToSpawn.push('attacker');
        for(let i=0; i<config.shooter; i++) this.enemiesToSpawn.push('shooter');
        for(let i=0; i<config.boomzoner; i++) this.enemiesToSpawn.push('boomzoner');

        this.enemiesToSpawn.sort(() => Math.random() - 0.5);
        
        this.isTransitioning = true;
        this.transitionTimer = 3; 
        
        // --- MAINKAN SFX WAVE BARU (Jika bukan level 1) ---
        if (window.soundManager && level > 1) {
            window.soundManager.playWave();
        }
        
        let levelUI = document.getElementById('level-display');
        if(levelUI) levelUI.innerText = `LEVEL: ${this.currentLevel}`;
    }

    spawnEnemy() {
        if (this.enemiesToSpawn.length === 0) return;

        const type = this.enemiesToSpawn.pop();
        const x = Math.random() * (this.canvasWidth - 50);
        const y = -50; 

        if (type === 'attacker') this.enemies.push(new Attacker(x, y));
        else if (type === 'shooter') this.enemies.push(new Shooter(x, y));
        else if (type === 'boomzoner') this.enemies.push(new Boomzoner(x, y));
    }

    update(dt, player, asteroids) {
        if (this.isTransitioning) {
            this.transitionTimer -= dt;
            if (this.transitionTimer <= 0) {
                this.isTransitioning = false; 
            }
        }

        if (!this.isTransitioning && this.enemiesToSpawn.length > 0) {
            this.spawnTimer += dt;
            if (this.spawnTimer >= this.spawnInterval) {
                this.spawnEnemy();
                this.spawnTimer = 0;
            }
        }

        this.enemies.forEach(enemy => {
            enemy.update(dt, player, this.canvasWidth, this.canvasHeight, this.enemyProjectiles, asteroids);
        });

        this.enemyProjectiles.forEach(p => {
            p.y += p.velocity * dt; 
            if (p.y > this.canvasHeight) p.markedForDeletion = true; 
        });

        this.explosions.forEach(exp => exp.update(dt));

        this.enemies = this.enemies.filter(e => !e.markedForDeletion);
        this.enemyProjectiles = this.enemyProjectiles.filter(p => !p.markedForDeletion);
        this.explosions = this.explosions.filter(exp => !exp.markedForDeletion);

        if (!this.isTransitioning && this.enemiesToSpawn.length === 0 && this.enemies.length === 0 && !this.levelCompleted) {
            this.levelCompleted = true;
            if (this.currentLevel < this.maxLevel) {
                this.loadLevel(this.currentLevel + 1); 
            } else {
                console.log("YOU WIN! Semua 10 Wave selesai.");
            }
        }
    }

    draw(ctx) {
        this.enemies.forEach(e => e.draw(ctx));
        this.enemyProjectiles.forEach(p => p.draw(ctx));
        this.explosions.forEach(exp => exp.draw(ctx)); 

        if (this.isTransitioning) {
            ctx.save();
            ctx.fillStyle = "rgba(0, 0, 0, 0.6)"; 
            ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight); 

            ctx.fillStyle = "#00FFCC";
            ctx.font = "bold 50px 'Courier New', monospace";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            
            let levelText = `WAVE ${this.currentLevel}`;
            if (this.currentLevel === 10) levelText = "FINAL WAVE!";

            ctx.fillText(levelText, this.canvasWidth / 2, this.canvasHeight / 2 - 20);

            ctx.fillStyle = "white";
            ctx.font = "20px 'Courier New', monospace";
            ctx.fillText(`Alien menyerang dalam ${Math.ceil(this.transitionTimer)}...`, this.canvasWidth / 2, this.canvasHeight / 2 + 30);
            
            ctx.restore();
        }
    }

    reset() {
        this.enemyProjectiles = [];
        this.explosions = [];
        this.loadLevel(1);
    }
}