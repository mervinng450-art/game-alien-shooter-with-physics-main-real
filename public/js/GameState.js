const GameStates = {
    LOGIN: 'LOGIN',
    MENU: 'MENU',
    PLAYING: 'PLAYING',
    QUESTION: 'QUESTION',
    PAUSED: 'PAUSED',
    LEVEL_COMPLETE: 'LEVEL_COMPLETE',
    WIN: 'WIN',
    GAME_OVER: 'GAME_OVER'
};

class GameStateManager {
    constructor() {
        this.currentState = GameStates.MENU; // Start at MENU for now until Auth is wired
        this.previousState = null;
        this.escKeyPressed = false;
    }

    setState(newState) {
        if (Object.values(GameStates).includes(newState)) {
            this.previousState = this.currentState;
            this.currentState = newState;
            console.log(`Game State Changed: ${this.previousState} -> ${this.currentState}`);
        } else {
            console.error(`Invalid Game State: ${newState}`);
        }
    }

    update(dt, inputHandler) {
        // Toggle PAUSED with Escape key when in PLAYING state
        if (inputHandler.isPressed("Escape")) {
            if (!this.escKeyPressed) {
                if (this.currentState === GameStates.PLAYING) {
                    this.setState(GameStates.PAUSED);
                } else if (this.currentState === GameStates.PAUSED) {
                    this.setState(GameStates.PLAYING);
                }
                this.escKeyPressed = true;
            }
        } else {
            this.escKeyPressed = false;
        }

        // Tambahan: Jika berada di menu PAUSED, tekan "KeyM" untuk kembali ke MENU utama
        if (this.currentState === GameStates.PAUSED) {
            if (inputHandler.isPressed("KeyM")) {
                this.setState(GameStates.MENU);
                if (window.authManager) {
                    try { window.authManager.renderGuestForm(); } catch(e) {}
                }
            }
        }

        // If we are on the MENU screen, ignore all keyboard inputs completely!
        if (this.currentState === GameStates.MENU) {
            return;
        }

        // Allow Space/Enter only to return to menu from GAME OVER or WIN
        if (this.currentState === GameStates.GAME_OVER || this.currentState === GameStates.WIN) {
            if (inputHandler.isPressed("Space") || inputHandler.isPressed("Enter")) {
                this.setState(GameStates.MENU);
            }
        }
    }

    renderOverlay(ctx, width, height) {
        ctx.save();
        ctx.textAlign = "center";

        if (this.currentState === GameStates.MENU) {
            ctx.fillStyle = "rgba(5, 5, 10, 0.85)";
            ctx.fillRect(0, 0, width, height);
        } 
        else if (this.currentState === GameStates.PAUSED) {
            ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
            ctx.fillRect(0, 0, width, height);

            ctx.fillStyle = "#FFCC00";
            ctx.font = "32px 'Courier New', monospace";
            ctx.fillText("GAME PAUSED", width / 2, height / 2 - 20);

            ctx.fillStyle = "#FFFFFF";
            ctx.font = "14px 'Courier New', monospace";
            ctx.fillText("Press ESC to Resume", width / 2, height / 2 + 20);

            // Tambahan teks petunjuk tombol kembali ke menu
            ctx.fillStyle = "#00FFCC";
            ctx.font = "14px 'Courier New', monospace";
            ctx.fillText("Press [M] to Return to Menu", width / 2, height / 2 + 50);
        } 
        else if (this.currentState === GameStates.GAME_OVER) {
            ctx.fillStyle = "rgba(20, 0, 0, 0.85)";
            ctx.fillRect(0, 0, width, height);

            ctx.fillStyle = "#FF3333";
            ctx.font = "32px 'Courier New', monospace";
            ctx.fillText("MISSION FAILED", width / 2, height / 2 - 20);
        } 
        else if (this.currentState === GameStates.WIN) {
            ctx.fillStyle = "rgba(0, 20, 10, 0.85)";
            ctx.fillRect(0, 0, width, height);

            ctx.fillStyle = "#00FF66";
            ctx.font = "32px 'Courier New', monospace";
            ctx.fillText("VICTORY!", width / 2, height / 2 - 20);

            ctx.fillStyle = "#FFFFFF";
            ctx.font = "14px 'Courier New', monospace";
        }

        ctx.restore();
    }
}