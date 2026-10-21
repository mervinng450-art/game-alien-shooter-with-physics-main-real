// --- KELAS PENGURUS SUARA (Diperbarui untuk memutar lagu MP3) ---
class SoundManager {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.isBgmPlaying = false;
        this.bgmAudio = new Audio('audio/bgm.mp3'); 
        this.bgmAudio.loop = true;   
        this.bgmAudio.volume = 0.3;  
    }

    init() {
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    playTone(freq, type, duration, vol=0.1, slideFreq=null) {
        if(!this.ctx) return;
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = type;
            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
            if(slideFreq) osc.frequency.exponentialRampToValueAtTime(slideFreq, this.ctx.currentTime + duration);

            gain.gain.setValueAtTime(vol, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

            osc.start();
            osc.stop(this.ctx.currentTime + duration);
        } catch(e) { console.log("Sound error diabaikan"); }
    }

    playNoise(duration, vol=0.1) {
        if(!this.ctx) return;
        try {
            const bufferSize = this.ctx.sampleRate * duration;
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
            const noise = this.ctx.createBufferSource();
            noise.buffer = buffer;
            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(vol, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
            noise.connect(gain);
            gain.connect(this.ctx.destination);
            noise.start();
        } catch(e) {}
    }

    playShoot() { this.init(); this.playTone(800, 'square', 0.15, 0.05, 300); }
    playExplosion() { this.init(); this.playNoise(0.3, 0.2); this.playTone(100, 'sawtooth', 0.3, 0.1, 10); }
    playStart() { this.init(); this.playTone(400, 'sine', 0.1, 0.1, 600); setTimeout(() => this.playTone(600, 'sine', 0.2, 0.1, 800), 100); }
    playWave() { this.init(); this.playTone(300, 'square', 0.3, 0.05, 500); setTimeout(() => this.playTone(500, 'square', 0.4, 0.05, 800), 150); }
    
    playGameOver() {
        this.init();
        this.playTone(300, 'sawtooth', 0.5, 0.1, 100);
        setTimeout(() => this.playTone(250, 'sawtooth', 0.5, 0.1, 50), 400);
        setTimeout(() => this.playTone(200, 'sawtooth', 1.0, 0.1, 10), 800);
    }

    startBGM() {
        if(this.isBgmPlaying) return;
        this.isBgmPlaying = true;
        this.init(); 
        if(this.bgmAudio) {
            this.bgmAudio.play().catch(e => console.log("BGM Error:", e));
        }
    }

    stopBGM() {
        this.isBgmPlaying = false;
        if (this.bgmAudio) {
            this.bgmAudio.pause();
            this.bgmAudio.currentTime = 0;
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    window.soundManager = new SoundManager();

    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");

    const CANVAS_WIDTH = 800;
    const CANVAS_HEIGHT = 600;

    let currentFps = 0;
    // PERBAIKAN: Ubah spaceKeyPressed menjadi questionKeyPressed
    let questionKeyPressed = false;
    let score = 0;
    let killCount = 0;
    let playerName = "Unknown Pilot";
    let leaderboardData = []; 
    let isGameOverProcessed = false; 

    // Mencegah error definisi GameStates
    if (typeof GameStates === "undefined") {
        window.GameStates = { LOGIN: "LOGIN", MENU: "MENU", PLAYING: "PLAYING", QUESTION: "QUESTION", PAUSED: "PAUSED", GAME_OVER: "GAME_OVER" };
    } else if (!GameStates.GAME_OVER) {
        GameStates.GAME_OVER = "GAME_OVER";
    }

    const inputHandler = new InputHandler();
    const gameStateManager = new GameStateManager();
    const questionManager = new QuestionManager('ui-layer');
    const player = new Player(CANVAS_WIDTH / 2 - 16, CANVAS_HEIGHT - 80);
    window.player = player;
    const enemyManager = new EnemyManager(CANVAS_WIDTH, CANVAS_HEIGHT);

    // Fungsi utilitas untuk mengubah state tanpa crash
    function safeChangeState(newState) {
        try {
            gameStateManager.setState(newState);
        } catch (e) {
            console.warn("setState dibypass:", e);
        }
        // Selalu pastikan currentState berubah walau setState error
        gameStateManager.currentState = newState;
    }

    safeChangeState(GameStates.LOGIN);

    let asteroids = [];

    function spawnAsteroid(startY) {
        let points = 10 + Math.floor(Math.random() * 4); 
        let offsets = [];
        for (let j = 0; j < points; j++) offsets.push(Math.random() * 0.4 - 0.2); 
        
        let craters = [];
        let numCraters = Math.floor(Math.random() * 3) + 1;
        for (let k = 0; k < numCraters; k++) {
            craters.push({ x: (Math.random() - 0.5) * 0.9, y: (Math.random() - 0.5) * 0.9, r: Math.random() * 0.2 + 0.1 });
        }
        return {
            x: Math.random() * CANVAS_WIDTH,
            y: startY !== undefined ? startY : Math.random() * CANVAS_HEIGHT,
            radius: Math.random() * 25 + 15,
            speed: Math.random() * 50 + 30, 
            rotation: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 2, 
            points: points,
            offsets: offsets,
            craters: craters,
            markedForDeletion: false
        };
    }

    for (let i = 0; i < 3; i++) asteroids.push(spawnAsteroid(Math.random() * CANVAS_HEIGHT));

    window.startGameCallback = () => {
        enemyManager.reset();
        player.reset(CANVAS_WIDTH / 2 - 16, CANVAS_HEIGHT - 80);
        score = 0;
        killCount = 0;
        isGameOverProcessed = false;
        asteroids = []; 
        
        if (window.soundManager) {
            window.soundManager.playStart();
            window.soundManager.startBGM();
        }

        safeChangeState(GameStates.PLAYING);
        
        // Sembunyikan UI form jika ada
        let uiLayer = document.getElementById('ui-layer');
        if (uiLayer) {
            uiLayer.style.display = 'none';
            uiLayer.innerHTML = '';
        }
    };

    window.logoutCallback = () => safeChangeState(GameStates.LOGIN);

    function fetchFirebaseLeaderboard() {
        try {
            if (typeof firebase !== 'undefined' && firebase.firestore) {
                const db = firebase.firestore();
                db.collection("leaderboard").orderBy("score", "desc").limit(5).get()
                .then((querySnapshot) => {
                    leaderboardData = [];
                    querySnapshot.forEach((doc) => leaderboardData.push(doc.data()));
                }).catch((e) => console.log("Fetch LB Error: ", e));
            }
        } catch (e) {}
    }

    // --- INISIALISASI BARU AUTHMANAGER ---
    const authManager = new AuthManager('ui-layer', (user) => {
        // Karena hanya guest, set nama pemain secara default
        playerName = user.displayName || "Guest_Pilot";
        fetchFirebaseLeaderboard();
        if (window.soundManager) window.soundManager.init();
        safeChangeState(GameStates.MENU);
        
        try {
            authManager.renderMainMenu(playerName);
        } catch(e) {}
    });

    // Panggil renderGuestForm() secara manual jika tidak dipanggil di constructor AuthManager
    try { authManager.renderGuestForm(); } catch(e) {}
    // ------------------------------------

    const stars = [];
    for (let i = 0; i < 150; i++) {
        stars.push({
            x: Math.random() * CANVAS_WIDTH, y: Math.random() * CANVAS_HEIGHT,
            size: Math.random() * 2 + 0.5, speed: Math.random() * 10 + 2, opacity: Math.random() * 0.8 + 0.2
        });
    }

    function checkCollision(rect1, rect2) {
        return (rect1.x < rect2.x + rect2.width && rect1.x + rect1.width > rect2.x &&
                rect1.y < rect2.y + rect2.height && rect1.y + rect1.height > rect2.y);
    }

    function saveScoreToFirebase() {
        try {
            if (typeof firebase !== 'undefined' && firebase.firestore) {
                const db = firebase.firestore();
                db.collection("leaderboard").add({
                    name: playerName, score: score, kills: killCount,
                    date: new Date().toLocaleDateString(),
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                }).then(() => fetchFirebaseLeaderboard()).catch((e) => console.log("Save Score Error: ", e));
            }
        } catch (e) {}
    }

    function update(dt) {
        if (typeof gameLoop !== "undefined") currentFps = gameLoop.fps;

        stars.forEach(star => {
            star.y += star.speed * dt;
            if (star.y > CANVAS_HEIGHT) { star.y = 0; star.x = Math.random() * CANVAS_WIDTH; }
        });

        try {
            gameStateManager.update(dt, inputHandler);
        } catch (e) { /* Abaikan error update internal */ }

        if (gameStateManager.currentState === GameStates.GAME_OVER) {
            if (inputHandler.isPressed("KeyR")) window.startGameCallback(); 
            if (inputHandler.isPressed("KeyM")) {
                safeChangeState(GameStates.MENU);
                try { authManager.renderMainMenu(playerName); } catch(e) {}
                isGameOverProcessed = false; 
            }
        }

        if (gameStateManager.currentState === GameStates.PLAYING) {
            let maxAsteroids = 2 + (enemyManager.currentLevel || 1); 
            while (asteroids.length < maxAsteroids) asteroids.push(spawnAsteroid(Math.random() * (CANVAS_HEIGHT * 0.7))); 

            player.update(dt, inputHandler, CANVAS_WIDTH, CANVAS_HEIGHT, enemyManager.currentLevel);
            enemyManager.update(dt, player, asteroids);

            asteroids.forEach(a => {
                a.y += a.speed * dt; a.rotation += a.rotSpeed * dt;
                if (a.y - a.radius > CANVAS_HEIGHT) a.markedForDeletion = true;

                let hitboxSize = a.radius * 1.6; 
                let aBox = { x: a.x - (hitboxSize / 2), y: a.y - (hitboxSize / 2), width: hitboxSize, height: hitboxSize };

                if (!a.markedForDeletion && checkCollision(player, aBox)) {
                    a.markedForDeletion = true;
                    player.takeDamage(15); 
                    if (window.soundManager) window.soundManager.playExplosion();
                }

                player.projectiles.forEach(proj => {
                    if (!proj.markedForDeletion && !a.markedForDeletion && checkCollision(proj, aBox)) {
                        proj.markedForDeletion = true; a.markedForDeletion = true; 
                        if (window.soundManager) window.soundManager.playExplosion();
                    }
                });

                enemyManager.enemyProjectiles.forEach(proj => {
                    if (!proj.markedForDeletion && !a.markedForDeletion && checkCollision(proj, aBox)) {
                        proj.markedForDeletion = true; a.markedForDeletion = true; 
                        if (window.soundManager) window.soundManager.playExplosion();
                    }
                });
            });

            player.projectiles.forEach(projectile => {
                enemyManager.enemies.forEach(enemy => {
                    if (!projectile.markedForDeletion && !enemy.markedForDeletion && checkCollision(projectile, enemy)) {
                        projectile.markedForDeletion = true;
                        enemy.health = (enemy.health || 0) - (projectile.damage || 10); 
                        if (enemy.health <= 0) {
                            enemy.markedForDeletion = true;
                            killCount++;
                            score += (enemy.type === 'boomzoner' ? 50 : (enemy.type === 'shooter' ? 25 : 20));
                            if (window.soundManager) window.soundManager.playExplosion();
                            if (enemy.type === 'boomzoner') enemy.explode(player, enemyManager.explosions);
                        }
                    }
                });
            });

            enemyManager.enemies.forEach(enemy => {
                if (!enemy.markedForDeletion && checkCollision(player, enemy)) {
                    if (enemy.type === 'boomzoner') {
                        enemy.explode(player, enemyManager.explosions); 
                        if (window.soundManager) window.soundManager.playExplosion();
                    } else {
                        enemy.markedForDeletion = true; player.takeDamage(20); 
                        if (window.soundManager) window.soundManager.playExplosion();
                    }
                }
            });

            enemyManager.enemyProjectiles.forEach(proj => {
                if (!proj.markedForDeletion && checkCollision(player, proj)) {
                    proj.markedForDeletion = true; player.takeDamage(20); 
                    if (window.soundManager) window.soundManager.playExplosion();
                }
            });

            if (player.health <= 0) {
                if (!isGameOverProcessed) {
                    isGameOverProcessed = true;
                    
                    try {
                        if (window.soundManager) {
                            window.soundManager.stopBGM();
                            window.soundManager.playGameOver();
                        }
                    } catch (e) {}

                    saveScoreToFirebase(); 
                    
                    // Sembunyikan layer UI jika masih tertinggal
                    let uiLayer = document.getElementById('ui-layer');
                    if (uiLayer) {
                        uiLayer.style.display = 'none';
                        uiLayer.innerHTML = '';
                    }
                }
                // Paksa perubahan status langsung
                gameStateManager.currentState = GameStates.GAME_OVER;
            }

            // PERBAIKAN: Menggunakan tombol 'Q' untuk membuka soal Fisika (Reload)
            if (inputHandler.isPressed("KeyQ")) {
                if (!questionKeyPressed) {
                    questionKeyPressed = true;
                    safeChangeState(GameStates.QUESTION);
                    try {
                        questionManager.showQuestion(enemyManager.currentLevel, (isCorrect) => safeChangeState(GameStates.PLAYING));
                    } catch (e) {
                        safeChangeState(GameStates.PLAYING); // Fallback kalau soal error
                    }
                }
            } else {
                questionKeyPressed = false;
            }
            
        } else if ([GameStates.LOGIN, GameStates.MENU, GameStates.GAME_OVER].includes(gameStateManager.currentState)) {
            while (asteroids.length < 3) asteroids.push(spawnAsteroid(-50));
            asteroids.forEach(a => {
                a.y += a.speed * dt; a.rotation += a.rotSpeed * dt;
                if (a.y - a.radius > CANVAS_HEIGHT) a.markedForDeletion = true;
            });
        }

        asteroids = asteroids.filter(a => !a.markedForDeletion);
    }

    function render() {
        const spaceGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
        spaceGrad.addColorStop(0, "#020108"); spaceGrad.addColorStop(0.5, "#0a0514"); spaceGrad.addColorStop(1, "#030205"); 
        ctx.fillStyle = spaceGrad; ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        stars.forEach(star => {
            ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
            ctx.beginPath(); ctx.arc(Math.floor(star.x), Math.floor(star.y), star.size / 2, 0, Math.PI * 2); ctx.fill();
        });

        asteroids.forEach(a => {
            ctx.save(); ctx.translate(a.x, a.y); ctx.rotate(a.rotation);
            ctx.beginPath();
            for(let j = 0; j < a.points; j++) {
                let angle = (j / a.points) * Math.PI * 2;
                let r = a.radius * (1 + a.offsets[j]); 
                let px = Math.cos(angle) * r; let py = Math.sin(angle) * r;
                if (j === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
            }
            ctx.closePath();
            
            let grad = ctx.createRadialGradient(-a.radius/3, -a.radius/3, a.radius * 0.1, 0, 0, a.radius);
            grad.addColorStop(0, "#95a5a6"); grad.addColorStop(0.5, "#546e7a"); grad.addColorStop(1, "#1a2529"); 
            ctx.fillStyle = grad; ctx.fill();
            ctx.strokeStyle = "#11181a"; ctx.lineWidth = 1.5; ctx.stroke();

            a.craters.forEach(c => {
                ctx.beginPath(); ctx.arc(c.x * a.radius, c.y * a.radius, c.r * a.radius, 0, Math.PI * 2);
                ctx.fillStyle = "rgba(0, 0, 0, 0.3)"; ctx.fill();
                ctx.strokeStyle = "rgba(255, 255, 255, 0.1)"; ctx.stroke();
            });
            ctx.restore();
        });

        if ([GameStates.PLAYING, GameStates.QUESTION, GameStates.PAUSED, GameStates.GAME_OVER].includes(gameStateManager.currentState)) {
            try { enemyManager.draw(ctx); } catch (e) {}
            try { player.draw(ctx); } catch (e) {}
        }

        // Render overlay dibatasi hanya saat bukan GAME_OVER untuk mencegah crash
        if (gameStateManager.currentState !== GameStates.GAME_OVER) {
            try { gameStateManager.renderOverlay(ctx, CANVAS_WIDTH, CANVAS_HEIGHT); } catch(e) {}
        }

        if (gameStateManager.currentState === GameStates.PLAYING) {
            ctx.fillStyle = "#FFFF00"; ctx.font = "bold 18px 'Courier New', monospace"; ctx.textAlign = "left";
            ctx.fillText(`SCORE: ${score}`, 10, 40);
            ctx.fillStyle = "#FFFFFF"; ctx.font = "14px 'Courier New', monospace";
            ctx.fillText(`KILLS: ${killCount}`, 10, 60);
        }

        if (gameStateManager.currentState === GameStates.GAME_OVER) {
            ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

            ctx.fillStyle = "#FF3366"; ctx.font = "bold 50px 'Courier New', monospace"; ctx.textAlign = "center";
            ctx.fillText("GAME OVER", CANVAS_WIDTH / 2, 80);

            ctx.fillStyle = "#FFFFFF"; ctx.font = "24px 'Courier New', monospace";
            ctx.fillText(`FINAL SCORE: ${score}`, CANVAS_WIDTH / 2, 120);
            ctx.fillText(`ALIENS KILLED: ${killCount}`, CANVAS_WIDTH / 2, 150);

            ctx.fillStyle = "rgba(0, 255, 204, 0.1)"; ctx.fillRect(CANVAS_WIDTH / 2 - 250, 180, 500, 250);
            ctx.strokeStyle = "#00FFCC"; ctx.lineWidth = 2; ctx.strokeRect(CANVAS_WIDTH / 2 - 250, 180, 500, 250);

            ctx.fillStyle = "#00FFCC"; ctx.font = "bold 28px 'Courier New', monospace";
            ctx.fillText("--- GLOBAL LEADERBOARD ---", CANVAS_WIDTH / 2, 220);

            ctx.fillStyle = "#FFFFFF"; ctx.font = "20px 'Courier New', monospace";
            if (leaderboardData.length === 0) {
                ctx.fillText("Memuat skor...", CANVAS_WIDTH / 2, 300);
            } else {
                leaderboardData.forEach((entry, index) => {
                    ctx.fillText(`${index + 1}. ${entry.name || "Pilot"} - ${entry.score} PTS`, CANVAS_WIDTH / 2, 270 + (index * 35));
                });
            }

            let blink = Math.floor(Date.now() / 500) % 2 === 0;
            ctx.fillStyle = blink ? "#FFFF00" : "#AAAA00"; ctx.fillRect(CANVAS_WIDTH / 2 - 220, 460, 200, 50);
            ctx.fillStyle = "#000000"; ctx.font = "bold 20px 'Courier New', monospace"; ctx.fillText("[R] RETRY", CANVAS_WIDTH / 2 - 120, 492);

            ctx.fillStyle = blink ? "#00FFCC" : "#00AAAA"; ctx.fillRect(CANVAS_WIDTH / 2 + 20, 460, 200, 50);
            ctx.fillStyle = "#000000"; ctx.font = "bold 20px 'Courier New', monospace"; ctx.fillText("[M] MENU", CANVAS_WIDTH / 2 + 120, 492);
        }

        ctx.fillStyle = "#888888"; ctx.font = "12px 'Courier New', monospace"; ctx.textAlign = "left";
        ctx.fillText(`FPS: ${currentFps}`, 10, 20);

        if (gameStateManager.currentState === GameStates.LOGIN || gameStateManager.currentState === GameStates.MENU) {
            ctx.fillStyle = "#00FFCC"; ctx.font = "bold 26px 'Courier New', monospace"; ctx.textAlign = "center";
            ctx.fillText("ALIEN SHOOTER WITH PHYSICS", CANVAS_WIDTH / 2, 60);
    
        }
    }

    canvas.addEventListener('click', (event) => {
        if (gameStateManager.currentState === GameStates.GAME_OVER) {
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width; const scaleY = canvas.height / rect.height;
            const mouseX = (event.clientX - rect.left) * scaleX; const mouseY = (event.clientY - rect.top) * scaleY;

            if (mouseX >= CANVAS_WIDTH / 2 - 220 && mouseX <= CANVAS_WIDTH / 2 - 20 && mouseY >= 460 && mouseY <= 510) {
                window.startGameCallback(); 
            }
            if (mouseX >= CANVAS_WIDTH / 2 + 20 && mouseX <= CANVAS_WIDTH / 2 + 220 && mouseY >= 460 && mouseY <= 510) {
                safeChangeState(GameStates.MENU);
                try { authManager.renderMainMenu(playerName); } catch(e) {}
                isGameOverProcessed = false;                
            }
        }
    });

    const gameLoop = new GameLoop(update, render);
    gameLoop.start();
});