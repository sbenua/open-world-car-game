class World {
    constructor(game) {
        this.game = game;
        this.tileSize = 256; // High res tiles
        this.mapSize = 100; // 100x100 tiles
        this.objects = [];

        // Map bounds in pixels
        this.width = this.tileSize * this.mapSize;
        this.height = this.tileSize * this.mapSize;

        // Set car start position to center of world
        this.game.car.x = this.width / 2;
        this.game.car.y = this.height / 2;
    }

    generate() {
        console.log("Generating world...");
        // Randomly place objects
        // Avoid the center where the car spawns
        const cx = this.width / 2;
        const cy = this.height / 2;
        const safeRadius = 500;

        const count = 2000; // Number of objects

        for (let i = 0; i < count; i++) {
            const x = Math.random() * this.width;
            const y = Math.random() * this.height;

            // Check safe zone
            const dx = x - cx;
            const dy = y - cy;
            if (dx * dx + dy * dy < safeRadius * safeRadius) continue;

            const type = Math.random();
            let objType = 'tree';
            if (type > 0.7) objType = 'stone';
            if (type > 0.9) objType = 'house';

            this.objects.push({
                x: x,
                y: y,
                type: objType,
                angle: Math.random() * Math.PI * 2,
                scale: 0.5 + Math.random() * 0.5
            });
        }
    }

    draw(ctx, camX, camY) {
        // 1. Draw Ground (Tiled)
        // Optimization: Only draw tiles visible on screen
        const startCol = Math.floor((camX - this.game.width / 2) / this.tileSize);
        const endCol = startCol + Math.ceil(this.game.width / this.tileSize) + 1;
        const startRow = Math.floor((camY - this.game.height / 2) / this.tileSize);
        const endRow = startRow + Math.ceil(this.game.height / this.tileSize) + 1;

        const ground = this.game.assets.ground;
        // Re-use road as ground if needed or mix them. 
        // For open world car game, usually "ground" is grass and we have roads.
        // For this simple version, let's just tile grass everywhere for now, 
        // effectively "offroad" everywhere.

        if (ground) {
            for (let c = startCol; c <= endCol; c++) {
                for (let r = startRow; r <= endRow; r++) {
                    ctx.drawImage(ground, c * this.tileSize, r * this.tileSize, this.tileSize, this.tileSize);
                }
            }
        }

        // 2. Draw Objects
        // Optimization: Only draw objects near the camera
        // Simple distance check or grid partition. For 2000 objects, simple traversal is okay-ish on modern JS,
        // but let's check basic bounds.

        const viewL = camX - this.game.width / 2 - 200;
        const viewR = camX + this.game.width / 2 + 200;
        const viewT = camY - this.game.height / 2 - 200;
        const viewB = camY + this.game.height / 2 + 200;

        this.objects.forEach(obj => {
            if (obj.x > viewL && obj.x < viewR && obj.y > viewT && obj.y < viewB) {
                const img = this.game.assets[obj.type];
                if (img) {
                    ctx.save();
                    ctx.translate(obj.x, obj.y);
                    // Trees/Stones might rotate, Houses usually don't or do?
                    // Let's rotate stones and trees. Houses fixed? 
                    // Let's rotate everything for variety except houses maybe?
                    if (obj.type !== 'house') ctx.rotate(obj.angle);

                    const w = img.width * obj.scale;
                    const h = img.height * obj.scale;
                    ctx.drawImage(img, -w / 2, -h / 2, w, h);
                    ctx.restore();
                }
            }
        });
    }
}
