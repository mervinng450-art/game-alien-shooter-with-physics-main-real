class InputHandler {
    constructor() {
        this.keys = {};

        window.addEventListener("keydown", (e) => {
            // Prevent page scrolling on navigation keys
            if (["KeyW", "KeyA", "KeyS", "KeyD", "Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code)) {
                e.preventDefault();
            }
            this.keys[e.code] = true;
        });

        window.addEventListener("keyup", (e) => {
            this.keys[e.code] = false;
        });
    }

    isPressed(code) {
        return !!this.keys[code];
    }
}