class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 32;
        this.height = 32;
        this.speed = 260;
        
        this.maxAmmo = 20;
        this.ammo = 20; 
        
        this.maxHealth = 100;
        this.health = 100;
        
        this.projectiles = [];
        this.shootTimer = 0;
        this.shootCooldown = 0.25; 
    }

    update(dt, inputHandler, canvasWidth, canvasHeight, currentLevel = 1) {
        let dx = 0;
        let dy = 0;

        if (inputHandler.isPressed("ArrowLeft") || inputHandler.isPressed("KeyA")) dx -= 1;
        if (inputHandler.isPressed("ArrowRight") || inputHandler.isPressed("KeyD")) dx += 1;
        if (inputHandler.isPressed("ArrowUp") || inputHandler.isPressed("KeyW")) dy -= 1;
        if (inputHandler.isPressed("ArrowDown") || inputHandler.isPressed("KeyS")) dy += 1;

        if (dx !== 0 && dy !== 0) {
            const length = Math.SQRT2;
            dx /= length;
            dy /= length;
        }

        this.x += dx * this.speed * dt;
        this.y += dy * this.speed * dt;

        this.x = Math.max(0, Math.min(canvasWidth - this.width, this.x));
        this.y = Math.max(0, Math.min(canvasHeight - this.height, this.y));

        this.shootTimer += dt;

        if (inputHandler.isPressed("KeyK")) {
            this.shoot(currentLevel); 
        }

        this.projectiles.forEach(proj => proj.update(dt));
        this.projectiles = this.projectiles.filter(proj => !proj.markedForDeletion);
    }

    shoot(weaponLevel) {
        if (this.shootTimer >= this.shootCooldown) {
            if (this.ammo > 0) {
                const spawnX = this.x + this.width / 2;
                const spawnY = this.y - 10;
                
                this.projectiles.push(new Projectile(spawnX, spawnY, weaponLevel));
                
                // --- MAINKAN SFX TEMBAKAN ---
                if (window.soundManager) window.soundManager.playShoot();

                this.ammo -= 1; 
                this.shootTimer = 0;

                let ammoDisplay = document.getElementById('ammo-count');
                if (ammoDisplay) ammoDisplay.innerText = this.ammo;
            } else {
                console.log("Peluru habis! Jawab soal untuk mengisi peluru.");
            }
        }
    }

    reloadAmmo(amount) {
        this.ammo += amount;
        if (this.ammo > this.maxAmmo) {
            this.ammo = this.maxAmmo;
        }
        let ammoDisplay = document.getElementById('ammo-count');
        if (ammoDisplay) ammoDisplay.innerText = this.ammo;
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this.health = 0;
            console.log("GAME OVER! Pesawat Hancur!");
        }
    }

    draw(ctx) {
        this.projectiles.forEach(proj => proj.draw(ctx));

        const healthBarWidth = this.width;
        const healthRatio = Math.max(0, this.health / this.maxHealth);
        ctx.fillStyle = "rgba(255, 0, 0, 0.8)";
        ctx.fillRect(this.x, this.y - 18, healthBarWidth, 5); 
        ctx.fillStyle = "#00FF66";
        ctx.fillRect(this.x, this.y - 18, healthBarWidth * healthRatio, 5); 

        ctx.save();
        ctx.translate(Math.floor(this.x), Math.floor(this.y));

        const w = this.width;
        const h = this.height;
        const cx = w / 2;

        ctx.fillStyle = "#95a5a6"; 
        ctx.fillRect(-4, h * 0.4, w + 8, h * 0.2); 
        
        ctx.fillStyle = "#7f8c8d";
        ctx.fillRect(-6, h * 0.1, 4, h * 0.6); 
        ctx.fillRect(w + 2, h * 0.1, 4, h * 0.6); 

        ctx.fillStyle = "#e74c3c";
        ctx.fillRect(-6, h * 0.1, 4, 3);
        ctx.fillRect(w + 2, h * 0.1, 4, 3);

        ctx.fillStyle = "#ecf0f1"; 
        ctx.beginPath();
        ctx.moveTo(cx, -h * 0.3); 
        ctx.lineTo(cx + 6, h * 0.2);
        ctx.lineTo(cx + 6, h);
        ctx.lineTo(cx - 6, h);
        ctx.lineTo(cx - 6, h * 0.2);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = "#c0392b";
        ctx.fillRect(cx - 2, 0, 4, h * 0.4);

        ctx.fillStyle = "#3498db"; 
        ctx.beginPath();
        ctx.moveTo(cx, h * 0.3);
        ctx.lineTo(cx + 4, h * 0.5);
        ctx.lineTo(cx - 4, h * 0.5);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = "#2c3e50";
        ctx.fillRect(cx - 8, h, 6, 4); 
        ctx.fillRect(cx + 2, h, 6, 4); 

        ctx.fillStyle = "#f39c12"; 
        ctx.fillRect(cx - 7, h + 4, 4, Math.random() * 6 + 2); 
        ctx.fillRect(cx + 3, h + 4, 4, Math.random() * 6 + 2); 

        ctx.restore();
    }

    reset(startX, startY) {
        this.x = startX;
        this.y = startY;
        this.ammo = this.maxAmmo; 
        this.health = this.maxHealth;
        this.projectiles = [];
        this.shootTimer = 0;
        let ammoDisplay = document.getElementById('ammo-count');
        if (ammoDisplay) ammoDisplay.innerText = this.ammo;
    }
}