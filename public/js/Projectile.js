class Projectile {
    // Tambahkan parameter weaponLevel
    constructor(x, y, weaponLevel = 1, isEnemy = false) {
        this.x = x;
        this.y = y;
        this.isEnemyProjectile = isEnemy;
        this.markedForDeletion = false;

        if (this.isEnemyProjectile) {
            // Konfigurasi peluru musuh (Shooter)
            this.width = 5;
            this.height = 15;
            this.velocity = 200; // Bergerak ke bawah
            this.color = "#FF00FF";
            this.damage = 1; 
        } else {
            // Konfigurasi peluru pemain berevolusi berdasarkan Level
            this.velocity = -400; // Bergerak ke atas
            
            if (weaponLevel >= 1 && weaponLevel <= 3) {
                // Tier 1: Basic Blaster
                this.width = 4;
                this.height = 15;
                this.color = "#FFFF00"; // Kuning
                this.damage = 1;
            } else if (weaponLevel >= 4 && weaponLevel <= 6) {
                // Tier 2: Plasma Cannon
                this.width = 8;
                this.height = 20;
                this.color = "#00FFFF"; // Cyan
                this.damage = 2;
            } else if (weaponLevel >= 7 && weaponLevel <= 9) {
                // Tier 3: Heavy Laser
                this.width = 12;
                this.height = 25;
                this.color = "#FF4500"; // Oranye Merah
                this.damage = 3;
            } else {
                // Tier 4 (Level 10): Death Ray
                this.width = 20;
                this.height = 35;
                this.color = "#9400D3"; // Ungu Gelap
                this.damage = 5;
            }
        }
        
        // Pusatkan peluru agar keluar tepat dari moncong
        this.x -= this.width / 2;
    }

    update(dt) {
        this.y += this.velocity * dt;
        // Hapus peluru pemain jika melewati batas atas layar
        if (this.y < -50) {
            this.markedForDeletion = true;
        }
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Tambahkan efek inti putih (glow) untuk senjata Tier 2 ke atas
        if (!this.isEnemyProjectile && this.damage >= 2) {
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(this.x + 2, this.y + 2, this.width - 4, this.height - 4);
        }
    }
}