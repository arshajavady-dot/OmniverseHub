/* ==========================================================================
   CYBER INVADERS - APPLICATION ENTRY POINT
   ========================================================================== */

let gameEngine = null;

window.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Initializing CYBER INVADERS Neon Arcade Engine...');

  // Instantiate Game Engine
  gameEngine = new GameEngine();

  // Apply initial audio & visual options
  soundEngine.setSFXVolume(gameState.settings.sfxVolume);
  soundEngine.setMusicVolume(gameState.settings.musicVolume);
  uiManager.updateCRTEffect();

  // Start the main engine rendering loop
  gameEngine.startLoop();
});
