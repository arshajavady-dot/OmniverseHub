// main.js – UI orchestration for Skinlr
import { TextureEditor } from './textureEditor.js';
import { Model3D } from './model3d.js';
import { PRESETS } from './presets.js';

// Helper to trigger a download of a data URL (PNG)
function downloadDataURL(dataURL, filename) {
  const a = document.createElement('a');
  a.href = dataURL;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// Get DOM elements
const textureCanvas = document.getElementById('texture-canvas');
const modelCanvas = document.getElementById('model-canvas');
const toolSelect = document.getElementById('tool-select');
const colorPicker = document.getElementById('color-picker');
const brushSize = document.getElementById('brush-size');
const undoBtn = document.getElementById('undo-btn');
const redoBtn = document.getElementById('redo-btn');
const gridToggle = document.getElementById('grid-toggle');
const regionToggle = document.getElementById('region-toggle');
const downloadBtn = document.getElementById('download-btn');
const installBtn = document.getElementById('install-btn');
const uploadBtn = document.getElementById('upload-btn');
const uploadInput = document.getElementById('upload-input');
const tab2dBtn = document.getElementById('tab-2d');
const tab3dBtn = document.getElementById('tab-3d');
const editor2dPanel = document.getElementById('editor-2d');
const preview3dPanel = document.getElementById('preview-3d');
const presetBar = document.querySelector('.preset-bar');

// Initialize editors
const textureEditor = new TextureEditor(textureCanvas, (masterCanvas) => {
  // Called each time the texture changes – update 3D model texture
  if (model3d) model3d.texture.needsUpdate = true;
});

let model3d = new Model3D(modelCanvas, () => textureEditor.master);

// UI bindings
toolSelect.addEventListener('change', (e) => {
  textureEditor.setTool(e.target.value);
});
colorPicker.addEventListener('input', (e) => {
  textureEditor.setColor(e.target.value);
  if (model3d) model3d.setBrushColor(e.target.value);
});
brushSize.addEventListener('input', (e) => {
  const sz = parseInt(e.target.value, 10);
  textureEditor.setBrushSize(sz);
  if (model3d) model3d.setBrushSize(sz);
});
undoBtn.addEventListener('click', () => textureEditor.undo());
redoBtn.addEventListener('click', () => textureEditor.redo());

gridToggle.addEventListener('click', () => {
  const enabled = !textureEditor.showGrid;
  textureEditor.toggleGrid(enabled);
  gridToggle.classList.toggle('toggle-active', enabled);
});
regionToggle.addEventListener('click', () => {
  // Region overlay is always on for now – placeholder for future toggle
  // Just toggle button visual state
  regionToggle.classList.toggle('toggle-active');
});

downloadBtn.addEventListener('click', () => {
  const dataURL = textureEditor.exportPNG();
  downloadDataURL(dataURL, 'skin.png');
});

installBtn.addEventListener('click', () => {
  // Provide instructions to run install_skin.bat – we cannot execute .bat from the browser.
  alert('To install your skin, copy the exported "skin.png" to a convenient location and then run the "install_skin.bat" script that resides in the project folder.\n\nCommand example:\ninstall_skin.bat "C:\\path\\to\\skin.png"');
});

uploadBtn.addEventListener('click', () => uploadInput.click());
uploadInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const img = new Image();
  img.onload = () => {
    textureEditor.loadImage(img);
  };
  img.src = URL.createObjectURL(file);
});

// Tab switching
function activateTab(tab) {
  if (tab === '2d') {
    editor2dPanel.classList.remove('hidden');
    preview3dPanel.classList.add('hidden');
    tab2dBtn.classList.add('active');
    tab3dBtn.classList.remove('active');
  } else {
    editor2dPanel.classList.add('hidden');
    preview3dPanel.classList.remove('hidden');
    tab2dBtn.classList.remove('active');
    tab3dBtn.classList.add('active');
    // Ensure 3D canvas resizes (in case container size changed)
    model3d.resize();
  }
}

tab2dBtn.addEventListener('click', () => activateTab('2d'));
tab3dBtn.addEventListener('click', () => activateTab('3d'));

// Preset buttons – generated dynamically from PRESETS object
Object.entries(PRESETS).forEach(([key, preset]) => {
  const btn = document.createElement('button');
  btn.className = 'preset-btn';
  btn.dataset.preset = key;
  btn.textContent = preset.name;
  btn.addEventListener('click', () => {
    const ctx = textureEditor.masterCtx;
    preset.generate(ctx);
    textureEditor._pushHistory(); // capture state
    textureEditor.render();
    if (model3d) model3d.texture.needsUpdate = true;
  });
  presetBar.appendChild(btn);
});

// Initial activation
activateTab('2d');

// Resize handling for 3D canvas
window.addEventListener('resize', () => {
  if (model3d) model3d.resize();
});
