class Input {
    constructor() {
        this.keys = {
            up: false,
            down: false,
            left: false,
            right: false,
            drift: false,
            boost: false
        };

        this.setupKeyboard();
        this.setupTouch();
    }

    setupKeyboard() {
        window.addEventListener('keydown', (e) => {
            switch (e.key) {
                case 'ArrowUp': case 'w': this.keys.up = true; break;
                case 'ArrowDown': case 's': this.keys.down = true; break;
                case 'ArrowLeft': case 'a': this.keys.left = true; break;
                case 'ArrowRight': case 'd': this.keys.right = true; break;
                case 'Shift': case ' ': this.keys.drift = true; break;
                case 'b': case 'Enter': this.keys.boost = true; break;
            }
        });

        window.addEventListener('keyup', (e) => {
            switch (e.key) {
                case 'ArrowUp': case 'w': this.keys.up = false; break;
                case 'ArrowDown': case 's': this.keys.down = false; break;
                case 'ArrowLeft': case 'a': this.keys.left = false; break;
                case 'ArrowRight': case 'd': this.keys.right = false; break;
                case 'Shift': case ' ': this.keys.drift = false; break;
                case 'b': case 'Enter': this.keys.boost = false; break;
            }
        });
    }

    setupTouch() {
        const buttons = document.querySelectorAll('.control-btn');

        buttons.forEach(btn => {
            // Prevent context menu on long press
            btn.addEventListener('contextmenu', e => e.preventDefault());

            const action = btn.dataset.action;

            const startHandler = (e) => {
                e.preventDefault();
                this.keys[action] = true;
                btn.classList.add('active');
            };

            const endHandler = (e) => {
                e.preventDefault();
                this.keys[action] = false;
                btn.classList.remove('active');
            };

            btn.addEventListener('touchstart', startHandler, { passive: false });
            btn.addEventListener('touchend', endHandler, { passive: false });
            btn.addEventListener('mousedown', startHandler);
            btn.addEventListener('mouseup', endHandler);
            btn.addEventListener('mouseleave', endHandler);
        });
    }
}
