class Enemy {
    constructor(x, y, level = 1) {
        this.x = x;
        this.y = y;
        this.width = 36;
        this.height = 36; 
        this.speed = 40 + (level * 15); 
        this.maxHealth = 100;
        this.health = this.maxHealth;
        this.color = "#FF3366"; 
        this.markedForDeletion = false;
        
        this.sineOffset = Math.random() * Math.PI * 2;
        this.startX = x;
    }
    
    keepInBounds(canvasWidth, canvasHeight) {
        if (canvasWidth && canvasHeight) {
            this.x = Math.max(0, Math.min(canvasWidth - this.width, this.x));
            if (this.y > canvasHeight) {
                this.y = -this.height; 
            }
        }
    }

    // --- FUNGSI AI MENGHINDAR ASTEROID ---
    getAsteroidRepulsion(asteroids) {
        let repX = 0;
        let repY = 0;
        if (!asteroids) return { x: 0, y: 0 };
        
        asteroids.forEach(a => {
            const centerX = this.x + this.width / 2;
            const centerY = this.y + this.height / 2;
            const dx = centerX - a.x;
            const dy = centerY - a.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Radius aman = jejari batu + separuh lebar alien + sedikit ruang ekstra
            const safeDistance = a.radius + (this.width / 2) + 25;

            if (distance < safeDistance && distance > 0) {
                const force = (safeDistance - distance) / safeDistance;
                repX += (dx / distance) * force * 350; // Kekuatan dorongan menjauh
                repY += (dy / distance) * force * 350;
            }
        });
        
        return { x: repX, y: repY };
    }

    update(dt, player, canvasWidth, canvasHeight, enemyProjectiles, asteroids) {
        let moveX = 0;
        let moveY = this.speed;

        const repulsion = this.getAsteroidRepulsion(asteroids);
        moveX += repulsion.x;
        moveY += repulsion.y;

        this.x += moveX * dt;
        this.y += moveY * dt;
        
        this.keepInBounds(canvasWidth, canvasHeight);
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(Math.floor(this.x), Math.floor(this.y));

        this.drawShape(ctx);

        const healthBarWidth = this.width;
        const healthBarHeight = 4;
        const healthRatio = Math.max(0, this.health / this.maxHealth);

        ctx.fillStyle = "rgba(255, 0, 0, 0.6)";
        ctx.fillRect(0, -10, healthBarWidth, healthBarHeight);

        ctx.fillStyle = "#00FF66";
        ctx.fillRect(0, -10, healthBarWidth * healthRatio, healthBarHeight);

        ctx.restore();
    }

    drawShape(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.ellipse(this.width / 2, this.height / 2, this.width / 2, this.height / 3, 0, 0, Math.PI * 2);
        ctx.fill();
    }
}

// 1. Tipe Attacker
class Attacker extends Enemy {
    constructor(x, y) {
        super(x, y);
        this.color = "#FF0000"; 
        this.type = 'attacker';
        this.speed = 150;
        this.health = 1;
        this.maxHealth = 1;

        this.punchTimer = 0;
        this.isPunching = false;
        this.leftPunch = 0;
        this.rightPunch = 0;
    }

    update(dt, player, canvasWidth, canvasHeight, enemyProjectiles, asteroids) {
        let moveX = 0;
        let moveY = 0;

        if (player) {
            const dx = player.x - this.x;
            const dy = player.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0) {
                moveX = (dx / distance) * this.speed;
                moveY = (dy / distance) * this.speed;
            }

            if (distance < 100) {
                this.isPunching = true;
            } else {
                this.isPunching = false;
            }
        }

        // Tambahkan tolakan dari asteroid
        const repulsion = this.getAsteroidRepulsion(asteroids);
        moveX += repulsion.x;
        moveY += repulsion.y;

        this.x += moveX * dt;
        this.y += moveY * dt;

        this.punchTimer += dt * 15;
        
        if (this.isPunching) {
            this.leftPunch = Math.max(0, Math.sin(this.punchTimer) * 15);
            this.rightPunch = Math.max(0, Math.cos(this.punchTimer) * 15);
        } else {
            this.leftPunch = Math.max(0, this.leftPunch - dt * 50);
            this.rightPunch = Math.max(0, this.rightPunch - dt * 50);
        }

        this.keepInBounds(canvasWidth, canvasHeight);
    }

    drawShape(ctx) {
        const w = this.width;
        const h = this.height;
        const cx = w/2;
        const cy = h/2;
        
        ctx.fillStyle = "#bdc3c7"; 
        ctx.beginPath(); ctx.arc(cx - 16, cy + this.leftPunch, 6, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(cx + 16, cy + this.rightPunch, 6, 0, Math.PI*2); ctx.fill();

        ctx.strokeStyle = this.color;
        ctx.lineWidth = 4;
        ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(cx - 10, cy); ctx.lineTo(cx - 16, cy + this.leftPunch); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx + 10, cy); ctx.lineTo(cx + 16, cy + this.rightPunch); ctx.stroke();

        ctx.fillStyle = this.color;
        ctx.beginPath(); ctx.arc(cx, cy, 14, 0, Math.PI*2); ctx.fill();

        ctx.fillStyle = "#FFFF00";
        ctx.beginPath(); ctx.moveTo(cx - 10, cy - 4); ctx.lineTo(cx - 2, cy + 2); ctx.lineTo(cx - 10, cy + 2); ctx.fill();
        ctx.beginPath(); ctx.moveTo(cx + 10, cy - 4); ctx.lineTo(cx + 2, cy + 2); ctx.lineTo(cx + 10, cy + 2); ctx.fill();
    }
}

// 2. Tipe Shooter
class Shooter extends Enemy {
    constructor(x, y) {
        super(x, y);
        this.color = "#FF00FF"; 
        this.type = 'shooter';
        this.speed = 80;
        this.health = 2;
        this.maxHealth = 2;
        
        this.shootTimer = 0;
        this.shootInterval = 2; 
        this.distanceToKeep = 250; 
    }

    update(dt, player, canvasWidth, canvasHeight, enemyProjectiles, asteroids) {
        let moveX = 0;
        let moveY = 0;

        if (player) {
            const dx = player.x - this.x;
            const dy = player.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > this.distanceToKeep) {
                moveX = (dx / distance) * this.speed;
                moveY = (dy / distance) * this.speed;
            } else if (distance < this.distanceToKeep - 50) {
                moveX = -(dx / distance) * this.speed; 
                moveY = -(dy / distance) * this.speed;
            }
        }

        // Tambahkan tolakan dari asteroid
        const repulsion = this.getAsteroidRepulsion(asteroids);
        moveX += repulsion.x;
        moveY += repulsion.y;

        this.x += moveX * dt;
        this.y += moveY * dt;

        this.keepInBounds(canvasWidth, canvasHeight);

        this.shootTimer += dt;
        if (this.shootTimer >= this.shootInterval) {
            this.shootTimer = 0;
            let proj = new Projectile(this.x + this.width/2, this.y + this.height, 1, true);
            enemyProjectiles.push(proj);
        }
    }

    drawShape(ctx) {
        const w = this.width;
        const h = this.height;
        const cx = w/2;
        
        ctx.fillStyle = "#2c3e50"; 
        ctx.fillRect(cx - 8, h*0.4, 16, h*0.6); 
        ctx.fillStyle = "#1a2529";
        ctx.fillRect(cx - 10, h - 4, 20, 4);

        ctx.fillStyle = this.color; 
        ctx.fillRect(cx - 3, h*0.4, 6, h*0.6);

        ctx.fillStyle = "#2c003e"; 
        ctx.beginPath(); 
        ctx.moveTo(cx, 0); 
        ctx.lineTo(0, h*0.6); 
        ctx.lineTo(cx, h*0.4); 
        ctx.lineTo(w, h*0.6); 
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = "#4a235a"; 
        ctx.beginPath();
        ctx.arc(cx, h*0.3, 12, 0, Math.PI*2);
        ctx.fill();

        ctx.fillStyle = "#FF0000"; 
        ctx.fillRect(cx - 10, h*0.25, 20, 4);
        ctx.fillStyle = "#FFFFFF"; 
        ctx.fillRect(cx - 4, h*0.25, 8, 2);

        ctx.strokeStyle = "#900C3F"; 
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(cx - 12, h*0.4); ctx.lineTo(cx - 8, h*0.8); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx + 12, h*0.4); ctx.lineTo(cx + 8, h*0.8); ctx.stroke();
    }
}

// 3. Tipe Boomzoner
class Boomzoner extends Enemy {
    constructor(x, y) {
        super(x, y); 
        this.color = "#FF4500"; 
        this.type = 'boomzoner';
        this.speed = 35;
        this.health = 5;
        this.maxHealth = 5;
        this.explosionRadius = 180;

        this.width = 54;
        this.height = 54;
    }

    update(dt, player, canvasWidth, canvasHeight, enemyProjectiles, asteroids) {
        let moveX = 0;
        let moveY = this.speed; // Default turun ke bawah

        // Tambahkan tolakan dari asteroid
        const repulsion = this.getAsteroidRepulsion(asteroids);
        moveX += repulsion.x;
        moveY += repulsion.y;

        this.x += moveX * dt;
        this.y += moveY * dt;

        this.keepInBounds(canvasWidth, canvasHeight);
    }

    explode(player, explosionsArray) {
        if (explosionsArray) {
            explosionsArray.push(new Explosion(this.x + this.width/2, this.y + this.height/2, this.explosionRadius));
        }

        if (!player) return;
        const dx = (this.x + this.width/2) - (player.x + player.width/2);
        const dy = (this.y + this.height/2) - (player.y + player.height/2);
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance <= this.explosionRadius) {
            player.takeDamage(35); 
        }
        this.markedForDeletion = true;
    }

    drawShape(ctx) {
        const w = this.width;
        const h = this.height;
        const cx = w/2;
        const cy = h/2;
        
        const pulse = Math.sin(Date.now() / 120) * 5; 
        
        ctx.strokeStyle = "#8B0000"; 
        ctx.lineWidth = 4;
        for(let i = 0; i < 12; i++) {
            let angle = (i * Math.PI) / 6 + (Date.now() / 800); 
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + Math.cos(angle)*(24 + pulse), cy + Math.sin(angle)*(24 + pulse));
            ctx.stroke();
        }

        ctx.fillStyle = "#1c2833";
        ctx.beginPath();
        ctx.arc(cx, cy, 20 + pulse/2, 0, Math.PI*2);
        ctx.fill();

        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.beginPath(); 
        ctx.arc(cx, cy, 14 + pulse/1.5, 0, Math.PI*2); 
        ctx.stroke();

        ctx.fillStyle = "#FF0000";
        ctx.beginPath(); 
        ctx.ellipse(cx, cy, 6, 14 + pulse/2, 0, 0, Math.PI*2); 
        ctx.fill();
        
        ctx.fillStyle = "#FFFF00";
        ctx.beginPath(); 
        ctx.arc(cx, cy, 4, 0, Math.PI*2); 
        ctx.fill();
    }
}