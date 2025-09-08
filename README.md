# sweepem  
*Minesweeper meets RPG – defeat monsters, gain experience and conquer the boss.*

## ✨ Features
- ⚔️ **Four playable classes** with unique abilities: Warrior, Mage, Assassin & Paladin  
- 🌱 **Monsters scale** with your level and become increasingly dangerous  
- 🛠️ **Multiple difficulty levels & board sizes** for variety  
- 💾 **Auto-save** and integrated leaderboard  

## 🛠 Installation

```bash
git clone https://github.com/ViatorisBaculum/sweepem.git
cd sweepem
npm install
npm run dev     # development mode
npm run build   # production build

# For Android (Capacitor):
npx cap sync android && npx cap open android
```

Play the web version directly at:  
👉 [viatorisbaculum.github.io/sweepem](https://viatorisbaculum.github.io/sweepem)

## 🎮 How to Play

### 🎯 Goal
Open tiles, gain experience, and defeat the boss without losing all hearts.  
Numbers on revealed tiles show the **total strength of adjacent monsters**.  

### 🕹 Controls
- 🖱️ **Left click / tap** – reveal tile  
- 🚩 **Right click / long press** – place a flag  
- ✨ **Special ability** – tap the button in the lower right corner  

### 📈 Progression
- Defeat monsters to gain experience and level up  
- Higher-level monsters deal more damage  
- Score decreases over time – act quickly  

### 🧙 Classes & Abilities
- ⚔️ **Warrior** – gains an extra heart each level  
- 🔥 **Mage** – casts a 3×3 fireball, recharges on level-up  
- 🗡️ **Assassin** – executes monsters of its level without taking damage  
- 🛡️ **Paladin** – starts with the most hearts  

## 🔒 Privacy
This app does **not collect, store, or process any personal data**.

## 📜 License & Libraries
© 2025 Waldemar Stab. All rights reserved.  

Released under the **MIT License**.  

Used libraries (selection) – please note their respective licenses:  
- [Capacitor](https://capacitorjs.com/) – MIT  
- [TypeScript](https://www.typescriptlang.org/) – Apache-2.0  
- [Webpack](https://webpack.js.org/) – MIT  
- Additional dependencies and their licenses can be found in the `package.json`.  

## 📨 Feedback
Found a bug or have a feature request?  
➡️ Create an [Issue on GitHub](https://github.com/ViatorisBaculum/sweepem/issues)
