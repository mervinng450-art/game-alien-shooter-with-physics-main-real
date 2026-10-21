class AuthManager {
    constructor(uiContainerId, onAuthSuccess) {
        this.uiContainer = document.getElementById(uiContainerId);
        this.onAuthSuccess = onAuthSuccess;
        this.currentUser = null;

        this.renderGuestForm();
    }

    clearUI() {
        if (this.uiContainer) {
            this.uiContainer.innerHTML = '';
            this.uiContainer.style.display = 'none';
        }
    }

    renderGuestForm() {
        if (!this.uiContainer) return;

        this.uiContainer.style.display = 'block';
        this.uiContainer.innerHTML = `
            <div class="auth-card">
                <h2>WELCOME PILOT</h2>
                <div class="auth-subtitle">Join the mission immediately</div>
                <br>
                <button type="button" id="guest-btn" class="auth-btn-guest" style="width: 100%; padding: 15px; font-size: 16px;">Play as Guest</button>
            </div>
        `;

        document.getElementById('guest-btn')?.addEventListener('click', () => this.handleGuestLogin());
    }

    handleGuestLogin() {
        console.log("Entering mission as Guest Pilot...");
        const guestUser = { email: 'guest@pilot.local', displayName: 'Guest_Pilot' };
        this.currentUser = guestUser;
        
        this.renderMainMenu(guestUser.displayName);
        
        if (this.onAuthSuccess) {
            this.onAuthSuccess(guestUser);
        }
    }

    renderMainMenu(username = "PILOT") {
        if (!this.uiContainer) return;

        this.uiContainer.style.display = 'block';
        this.uiContainer.innerHTML = `
            <div class="main-menu-card">
                <div class="menu-title">WELCOME, ${username.toUpperCase()}</div>
                <div class="menu-btn-group">
                    <button type="button" id="start-game-btn" class="menu-btn">Start Game</button>
                    <button type="button" id="leaderboard-btn" class="menu-btn menu-btn-secondary">Leaderboard</button>
                    <button type="button" id="settings-btn" class="menu-btn menu-btn-secondary">Settings</button>
                    <button type="button" id="logout-btn" class="menu-btn menu-btn-logout">Back</button>
                </div>
            </div>
        `;

        const startBtn = document.getElementById('start-game-btn');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                console.log("Start Game clicked!");
                this.clearUI();
                if (window.startGameCallback) {
                    window.startGameCallback();
                } else {
                    console.error("window.startGameCallback is not defined in main.js!");
                }
            });
        }

        document.getElementById('leaderboard-btn')?.addEventListener('click', () => {
            alert("Leaderboard feature coming soon!");
        });

        document.getElementById('settings-btn')?.addEventListener('click', () => {
            alert("Settings feature coming soon!");
        });

        document.getElementById('logout-btn')?.addEventListener('click', () => {
            this.currentUser = null;
            this.renderGuestForm();
            if (window.logoutCallback) window.logoutCallback();
        });
    }
}