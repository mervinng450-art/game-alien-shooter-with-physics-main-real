class GameLoop {
    constructor(updateCallback, renderCallback) {
        this.update = updateCallback;
        this.render = renderCallback;
        
        this.lastTime = 0;
        this.accumulatedTime = 0;
        this.fps = 0;
        this.frameCount = 0;
        this.fpsTimer = 0;
        this.isRunning = false;

        this.loop = this.loop.bind(this);
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.lastTime = performance.now();
        requestAnimationFrame(this.loop);
    }

    stop() {
        this.isRunning = false;
    }

    loop(currentTime) {
        if (!this.isRunning) return;

        // Calculate delta time in seconds
        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        // Calculate FPS
        this.fpsTimer += deltaTime;
        this.frameCount++;
        if (this.fpsTimer >= 1.0) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.fpsTimer -= 1.0;
        }

        // Cap large delta times (e.g., tab switched away) to prevent clipping bugs
        const safeDeltaTime = Math.min(deltaTime, 0.1);

        this.update(safeDeltaTime);
        this.render();

        requestAnimationFrame(this.loop);
    }
}