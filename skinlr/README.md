# Skinlr

A web‑based **Minecraft skin creator** with **2‑D pixel editor** and **3‑D preview/painting**.  The UI follows the dark glass‑morphic style used in your "Gamble" games.

## Project structure
```
skinlr/
├─ index.html                # entry point
├─ install_skin.bat          # Windows installer script
├─ package.json
├─ vite.config.js
├─ css/
│   └─ style.css            # Gamble‑style theme
└─ js/
    ├─ main.js              # UI coordination (to be implemented)
    ├─ textureEditor.js     # 2‑D canvas editor
    ├─ model3d.js            # Three.js 3‑D preview & painting
    ├─ skinData.js           # UV mapping constants
    └─ presets.js            # starter skins (optional)
```

## Getting started
1. **Install Node.js** (if you don’t have it).  Download from https://nodejs.org/ and ensure `node` and `npm` are on your `PATH`.
2. Open a terminal in the project folder:
   ```powershell
   cd C:\Users\arsha\.gemini\antigravity\scratch\skinlr
   ```
3. Install dependencies:
   ```powershell
   npm install
   ```
4. Start the development server:
   ```powershell
   npm run dev
   ```
   The app will open in your default browser at `http://localhost:5173`.
5. Use the **Download PNG** button to export a skin, then run the generated `install_skin.bat` with the exported file path to copy it into your Minecraft resource‑packs folder.

## Next steps (to be implemented in `js/main.js`)
- Wire UI controls (tool selection, color picker, brush size, undo/redo, grid/region toggles).
- Switch between the 2‑D editor and the 3‑D preview tabs.
- Load preset skins and support PNG upload.
- Hook the installer button to trigger the `install_skin.bat` script (download the script if not present).

## License & credits
- Built with **Three.js**, **Vite**, and vanilla JavaScript.
- UI styling inspired by your "Gamble" games.

---

Feel free to open the folder in your editor, run the commands above, and start extending the app. Let me know if you need help implementing the remaining UI glue or adding extra features.
