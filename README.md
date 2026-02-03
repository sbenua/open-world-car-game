# Open World Car Game

A 2D open-world car game optimized for mobile browsers, built with vanilla JavaScript and HTML5 Canvas.

![Game Check](https://github.com/user-attachments/assets/placeholder-screenshot)
*(Note: Screenshot available in local walkthrough artifact)*

## Features
- **Procedural World**: Randomly generated map with trees, houses, and stones.
- **Arcade Physics**:
    - **Drift**: Slide around corners with smoke effects.
    - **Boost**: Temporary speed burst.
- **Mobile Controls**: On-screen D-Pad and action buttons.

## Documentation
- **[Implementation Plan](implementation_plan.md)**: Details the architecture and file structure.
- **[Troubleshooting Log](troubleshoot.md)**: Notes on bugs encountered (e.g., asset loading issues) and their fixes.

## How to Run
1. Clone the repo.
2. Serve the directory with a simple HTTP server (to handle image loading security policies).
   ```bash
   python3 -m http.server
   ```
3. Open `http://localhost:8000` in your browser.

## Controls
| Action | Keyboard | Mobile |
|--------|----------|--------|
| Steer  | Arrows / WASD | D-Pad |
| Drift  | Shift / Space | Drift Button |
| Boost  | Enter / B | Boost Button |
