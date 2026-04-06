# Phaser Game Collection

A collection of 2D games built with Phaser 3, featuring a Platform Runner and a Space Battle game. This project demonstrates various Phaser capabilities including physics, animations, input handling, and scene management.

## 🎮 Games Included

### Platform Runner
- Classic side-scrolling platformer
- Player character with running animations
- Enemy AI and collision detection
- Orientation scene for mobile devices
- Win and game over conditions

### Space Battle
- Top-down space shooter
- Player ship with bullet firing
- Multiple enemy types and boss battles
- Power-ups and bullet pickups
- Explosive effects and particle systems

## 🚀 Live Demo

Play the games online: [https://parbeen27.github.io/Phaser/](https://parbeen27.github.io/Phaser/)

## 🛠️ Technologies Used

- **Phaser 3** - Game framework
- **Vite** - Build tool and development server
- **Phaser3 Rex Plugins** - Additional Phaser utilities
- **JavaScript ES6+** - Programming language

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## 🔧 Installation & Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/parbeen27/Phaser.git
   cd Phaser/Frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## 📜 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run serve` - Preview production build locally
- `npm run deploy` - Deploy to GitHub Pages

## 📁 Project Structure

```
Frontend/
├── src/
│   ├── main.js                 # Game entry point and configuration
│   └── scenes/
│       ├── BootScene.js        # Initial loading scene
│       ├── menu.js             # Main menu scene
│       ├── Platfromrunner/     # Platform Runner game scenes
│       │   ├── game.js         # Main gameplay
│       │   ├── gameover.js     # Game over screen
│       │   ├── win.js          # Victory screen
│       │   └── Orientaion.js   # Mobile orientation warning
│       └── SpaceBattle/        # Space Battle game scenes
│           ├── gamescene.js    # Main gameplay
│           └── gameover.js     # Game over screen
├── public/
│   └── assets/                 # Game assets (sprites, sounds, etc.)
├── index.html                  # HTML entry point
├── vite.config.js              # Vite configuration
└── package.json                # Dependencies and scripts
```

## 🎯 Features

- **Responsive Design** - Adapts to different screen sizes and mobile devices
- **Touch & Keyboard Input** - Support for both desktop and mobile controls
- **Physics Engine** - Arcade physics for realistic movement and collisions
- **Scene Management** - Multiple scenes for different game states
- **Asset Management** - Organized asset loading and caching
- **Performance Optimized** - Efficient rendering and memory management

## 🎨 Game Configuration

- **Resolution**: 800x600 (scaled to fit screen)
- **Physics**: Arcade physics with gravity
- **Input**: Multi-touch support (up to 3 pointers)
- **Scaling**: FIT mode for desktop, RESIZE for mobile

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and test thoroughly
4. Commit your changes: `git commit -am 'Add new feature'`
5. Push to the branch: `git push origin feature-name`
6. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🙏 Acknowledgments

- Built with [Phaser 3](https://phaser.io/phaser3)
- Additional plugins from [Phaser3 Rex Plugins](https://rexrainbow.github.io/phaser3-rex-notes/docs/site/)
- Deployed using [GitHub Pages](https://pages.github.com/)
