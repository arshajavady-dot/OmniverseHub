// textureEditor.js – 2D canvas skin editor with tools and undo/redo
import { SKIN_SIZE, STEVE_UV } from './skinData.js';

export class TextureEditor {
  constructor(canvas, onChange) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { willReadFrequently: true });
    this.onChange = onChange;

    // Off-screen 64x64 master canvas
    this.master = document.createElement('canvas');
    this.master.width = SKIN_SIZE;
    this.master.height = SKIN_SIZE;
    this.masterCtx = this.master.getContext('2d');

    // History for undo/redo
    this.history = [];
    this.historyIdx = -1;
    this.maxHistory = 30;

    // Settings
    this.tool = 'brush'; // brush, eraser, fill, eyedropper, shading, line
    this.color = '#00a8a8';
    this.brushSize = 1;
    this.showGrid = true;
    this.zoom = 10; // pixel size on screen
    this.pan = { x: 0, y: 0 };
    this.isDrawing = false;
    this.lineStart = null;

    this._initCanvas();
    this._bindEvents();
  }

  _initCanvas() {
    this.canvas.width = SKIN_SIZE * this.zoom;
    this.canvas.height = SKIN_SIZE * this.zoom;
    this.ctx.imageSmoothingEnabled = false;
    this.render();
  }

  setTool(tool) { this.tool = tool; }
  setColor(c) { this.color = c; }
  setBrushSize(sz) { this.brushSize = sz; }
  toggleGrid(v) { this.showGrid = v; this.render(); }

  _bindEvents() {
    const getPixel = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const cx = e.clientX ?? e.touches?.[0]?.clientX;
      const cy = e.clientY ?? e.touches?.[0]?.clientY;
      const x = Math.floor((cx - rect.left - this.pan.x) / this.zoom);
      const y = Math.floor((cy - rect.top - this.pan.y) / this.zoom);
      return { x, y };
    };

    const down = (e) => {
      const { x, y } = getPixel(e);
      if (x < 0 || y < 0 || x >= SKIN_SIZE || y >= SKIN_SIZE) return;
      this.isDrawing = true;
      if (this.tool === 'fill') {
        this._fill(x, y, this.color);
        this._pushHistory();
        this._notify();
        this.isDrawing = false;
        return;
      }
      if (this.tool === 'eyedropper') {
        const col = this._getPixelColor(x, y);
        if (col) this.setColor(col);
        this.isDrawing = false;
        return;
      }
      if (this.tool === 'line') this.lineStart = { x, y };
      else this._applyTool(x, y);
      this.render();
    };

    const move = (e) => {
      if (!this.isDrawing) return;
      const { x, y } = getPixel(e);
      if (x < 0 || y < 0 || x >= SKIN_SIZE || y >= SKIN_SIZE) return;
      if (this.tool === 'line') return; // line drawn on mouseup
      this._applyTool(x, y);
      this.render();
    };

    const up = (e) => {
      if (!this.isDrawing) return;
      if (this.tool === 'line' && this.lineStart) {
        const { x, y } = getPixel(e);
        this._drawLine(this.lineStart.x, this.lineStart.y, x, y);
        this.lineStart = null;
        this.render();
      }
      this.isDrawing = false;
      this._pushHistory();
      this._notify();
    };

    this.canvas.addEventListener('mousedown', down);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    // touch support
    this.canvas.addEventListener('touchstart', (e) => { e.preventDefault(); down(e); });
    this.canvas.addEventListener('touchmove', (e) => { e.preventDefault(); move(e); });
    this.canvas.addEventListener('touchend', (e) => { e.preventDefault(); up(e); });

    // wheel zoom
    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 1 : -1;
      const newZoom = Math.min(24, Math.max(4, this.zoom + delta));
      if (newZoom !== this.zoom) {
        this.zoom = newZoom;
        this._initCanvas();
      }
    });
  }

  _applyTool(px, py) {
    const half = Math.floor(this.brushSize / 2);
    for (let dx = -half; dx <= half; dx++) {
      for (let dy = -half; dy <= half; dy++) {
        const x = px + dx;
        const y = py + dy;
        if (x < 0 || y < 0 || x >= SKIN_SIZE || y >= SKIN_SIZE) continue;
        if (this.tool === 'brush') this._setPixel(x, y, this.color, 1);
        else if (this.tool === 'eraser') this._setPixel(x, y, '#000000', 0);
        else if (this.tool === 'shading') this._shadePixel(x, y);
      }
    }
  }

  _setPixel(x, y, hex, alpha) {
    if (alpha === 0) {
      this.masterCtx.clearRect(x, y, 1, 1);
      return;
    }
    this.masterCtx.fillStyle = hex;
    this.masterCtx.globalAlpha = alpha;
    this.masterCtx.fillRect(x, y, 1, 1);
    this.masterCtx.globalAlpha = 1;
  }

  _getPixelColor(x, y) {
    const data = this.masterCtx.getImageData(x, y, 1, 1).data;
    if (data[3] === 0) return '#000000';
    const hex = `#${((1 << 24) + (data[0] << 16) + (data[1] << 8) + data[2]).toString(16).slice(1)}`;
    return hex;
  }

  _shadePixel(x, y) {
    const data = this.masterCtx.getImageData(x, y, 1, 1).data;
    if (data[3] === 0) return;
    const factor = (Math.random() * 0.3) - 0.15; // +/-15%
    const r = Math.min(255, Math.max(0, Math.round(data[0] * (1 + factor))));
    const g = Math.min(255, Math.max(0, Math.round(data[1] * (1 + factor))));
    const b = Math.min(255, Math.max(0, Math.round(data[2] * (1 + factor))));
    const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
    this._setPixel(x, y, hex, data[3] / 255);
  }

  _fill(startX, startY, fillHex) {
    const target = this._getPixelColor(startX, startY);
    if (target === fillHex) return;
    const stack = [{ x: startX, y: startY }];
    const visited = new Set();
    while (stack.length) {
      const { x, y } = stack.pop();
      const key = `${x},${y}`;
      if (visited.has(key)) continue;
      visited.add(key);
      const cur = this._getPixelColor(x, y);
      if (cur !== target) continue;
      this._setPixel(x, y, fillHex, 1);
      if (x > 0) stack.push({ x: x - 1, y });
      if (x < SKIN_SIZE - 1) stack.push({ x: x + 1, y });
      if (y > 0) stack.push({ x, y: y - 1 });
      if (y < SKIN_SIZE - 1) stack.push({ x, y: y + 1 });
    }
  }

  _drawLine(x0, y0, x1, y1) {
    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;
    let x = x0;
    let y = y0;
    while (true) {
      this._applyTool(x, y);
      if (x === x1 && y === y1) break;
      const e2 = 2 * err;
      if (e2 > -dy) { err -= dy; x += sx; }
      if (e2 < dx) { err += dx; y += sy; }
    }
  }

  _pushHistory() {
    const data = this.masterCtx.getImageData(0, 0, SKIN_SIZE, SKIN_SIZE);
    if (this.historyIdx < this.history.length - 1) this.history = this.history.slice(0, this.historyIdx + 1);
    this.history.push(data);
    if (this.history.length > this.maxHistory) this.history.shift();
    else this.historyIdx++;
  }

  undo() { if (this.historyIdx > 0) { this.historyIdx--; this.masterCtx.putImageData(this.history[this.historyIdx], 0, 0); this.render(); this._notify(); } }
  redo() { if (this.historyIdx < this.history.length - 1) { this.historyIdx++; this.masterCtx.putImageData(this.history[this.historyIdx], 0, 0); this.render(); this._notify(); } }

  loadImage(img) {
    this.masterCtx.clearRect(0, 0, SKIN_SIZE, SKIN_SIZE);
    this.masterCtx.drawImage(img, 0, 0, SKIN_SIZE, SKIN_SIZE);
    this.history = [];
    this.historyIdx = -1;
    this._pushHistory();
    this.render();
    this._notify();
  }

  exportPNG() {
    return this.master.toDataURL('image/png');
  }

  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    // draw checkerboard
    const size = this.zoom;
    for (let y = 0; y < SKIN_SIZE; y++) {
      for (let x = 0; x < SKIN_SIZE; x++) {
        ctx.fillStyle = ((x + y) % 2 === 0) ? '#1e293b' : '#0f172a';
        ctx.fillRect(x * size + this.pan.x, y * size + this.pan.y, size, size);
      }
    }
    // draw texture
    ctx.drawImage(this.master, 0, 0, SKIN_SIZE, SKIN_SIZE, this.pan.x, this.pan.y, SKIN_SIZE * this.zoom, SKIN_SIZE * this.zoom);
    // grid
    if (this.showGrid && this.zoom >= 6) {
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i <= SKIN_SIZE; i++) {
        ctx.moveTo(i * this.zoom + this.pan.x, this.pan.y);
        ctx.lineTo(i * this.zoom + this.pan.x, SKIN_SIZE * this.zoom + this.pan.y);
        ctx.moveTo(this.pan.x, i * this.zoom + this.pan.y);
        ctx.lineTo(SKIN_SIZE * this.zoom + this.pan.x, i * this.zoom + this.pan.y);
      }
      ctx.stroke();
    }
  }

  _notify() { if (this.onChange) this.onChange(this.master); }
}
