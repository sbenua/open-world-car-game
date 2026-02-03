class World {
    constructor(game) {
        this.game = game;
        this.tileSize = 256; // High res tiles
        this.mapSize = 100; // 100x100 tiles
        this.objects = [];

        // Map bounds in pixels
        this.width = this.tileSize * this.mapSize;
        this.height = this.tileSize * this.mapSize;
    }

    generate() {
        console.log("Generating world...");

        // Set car start position to center of world
        const cx = this.width / 2;
        const cy = this.height / 2;
        this.game.car.x = cx;
        this.game.car.y = cy;

        // 1. Generate Roads (Straight paths)
        // We'll create a grid of roads or random straight segments
        this.roads = [];
        const roadWidth = 200;
        this.totalRoads = 10;

        // Always have one road passing near start
        this.roads.push({
            x: cx - 1000, y: cy, w: 2000, h: roadWidth, type: 'horizontal'
        });
        this.roads.push({
            x: cx, y: cy - 1000, w: roadWidth, h: 2000, type: 'vertical'
        });

        // Add random roads
        for (let i = 0; i < this.totalRoads; i++) {
            // Random horizontal or vertical
            if (Math.random() > 0.5) {
                // Horizontal
                const rx = Math.random() * (this.width - 2000);
                const ry = Math.random() * (this.height - roadWidth);
                this.roads.push({ x: rx, y: ry, w: 2000 + Math.random() * 2000, h: roadWidth, type: 'horizontal' });
            } else {
                // Vertical
                const rx = Math.random() * (this.width - roadWidth);
                const ry = Math.random() * (this.height - 2000);
                this.roads.push({ x: rx, y: ry, w: roadWidth, h: 2000 + Math.random() * 2000, type: 'vertical' });
            }
        }

        // 2. Place Objects
        const count = 3000;
        const safeRadius = 300;

        // Simple radius check function
        const checkOverlap = (x, y, radius) => {
            // Check against roads
            for (let r of this.roads) {
                if (x + radius > r.x && x - radius < r.x + r.w &&
                    y + radius > r.y && y - radius < r.y + r.h) {
                    return true; // Overlaps road
                }
            }

            // Check against other objects
            // Note: Trees can overlap stones (as per prompt "tree on top of stone is fine")
            // But let's keep it simple: Objects shouldn't overlap if possible to look nice
            // Prompt says: "dont make each of them on top of each other... but tree on top of stone is fine"
            // Let's implement general avoidance but allow small overlap or just strict avoidance for simplicity first.
            // "Tree on top of stone is fine" -> We can ignore collision check if (new=tree and old=stone)

            for (let obj of this.objects) {
                const dx = obj.x - x;
                const dy = obj.y - y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const minDist = obj.radius + radius;

                // If overlap
                if (dist < minDist) {
                    // Check exception: Tree on Stone
                    if (this.currentType === 'tree' && obj.type === 'stone') return false;
                    return true;
                }
            }
            return false;
        };

        for (let i = 0; i < count; i++) {
            const x = Math.random() * this.width;
            const y = Math.random() * this.height;

            // Check start safe zone
            const dx = x - cx;
            const dy = y - cy;
            if (dx * dx + dy * dy < safeRadius * safeRadius) continue;

            const rand = Math.random();
            let type = 'tree';
            let scale = 0.3 + Math.random() * 0.3; // Smaller scale (0.3 to 0.6)
            let radius = 30 * scale; // Approximate collision radius

            if (rand > 0.7) {
                type = 'stone';
                scale = 0.3 + Math.random() * 0.3;
                radius = 35 * scale;
            } else if (rand > 0.95) {
                type = 'house';
                scale = 0.6 + Math.random() * 0.4;
                radius = 100 * scale;
            }

            this.currentType = type; // Hack for overlap check closure

            if (!checkOverlap(x, y, radius)) {
                this.objects.push({
                    x: x,
                    y: y,
                    type: type,
                    angle: type === 'house' ? 0 : Math.random() * Math.PI * 2,
                    scale: scale,
                    radius: radius
                });
            }
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

        // 1.5 Draw Roads
        const roadImg = this.game.assets.road;
        if (roadImg && this.roads) {
            this.roads.forEach(road => {
                // Optimization: Check road bounds with camera
                if (road.x + road.w < camX - this.game.width / 2 || road.x > camX + this.game.width / 2 ||
                    road.y + road.h < camY - this.game.height / 2 || road.y > camY + this.game.height / 2) return;

                // Tile the road texture along the segment
                ctx.save();
                ctx.beginPath();
                ctx.rect(road.x, road.y, road.w, road.h);
                ctx.clip(); // Clip to road rect

                // Draw tiles covering the rect
                const rStartCol = Math.floor(road.x / 256);
                const rEndCol = Math.floor((road.x + road.w) / 256) + 1;
                const rStartRow = Math.floor(road.y / 256);
                const rEndRow = Math.floor((road.y + road.h) / 256) + 1;

                for (let c = rStartCol; c < rEndCol; c++) {
                    for (let r = rStartRow; r < rEndRow; r++) {
                        ctx.drawImage(roadImg, c * 256, r * 256, 256, 256);
                    }
                }
                ctx.restore();

                // Optional: Draw borders
                ctx.strokeStyle = '#555';
                ctx.lineWidth = 5;
                ctx.strokeRect(road.x, road.y, road.w, road.h);
            });
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
