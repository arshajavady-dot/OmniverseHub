// model3d.js – Three.js 3D preview and painting via raycasting
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { SKIN_SIZE, STEVE_UV } from './skinData.js';

export class Model3D {
  constructor(canvas, getTextureCanvas) {
    this.canvas = canvas;
    this.getTextureCanvas = getTextureCanvas; // function returning the master canvas (64x64)
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, this.canvas.clientWidth / this.canvas.clientHeight, 0.1, 1000);
    this.camera.position.set(0, 1.6, 3);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.1;
    this.controls.minDistance = 2;
    this.controls.maxDistance = 6;

    // Light
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(5, 10, 7);
    this.scene.add(ambient, dir);

    this.texture = new THREE.CanvasTexture(this.getTextureCanvas());
    this.texture.magFilter = THREE.NearestFilter;
    this.texture.minFilter = THREE.NearestFilter;
    this.texture.needsUpdate = true;

    this.model = this._createSteveModel();
    this.scene.add(this.model);

    this._animate = this._animate.bind(this);
    requestAnimationFrame(this._animate);

    // Raycaster for painting
    this.raycaster = new THREE.Raycaster();
    this.isPainting = false;
    this.brushColor = '#ff0000';
    this.brushSize = 1; // in texture pixels
    this._bindEvents();
  }

  _createSteveModel() {
    const group = new THREE.Group();
    const material = new THREE.MeshStandardMaterial({ map: this.texture, transparent: true });
    // Helper to create a box with proper UV mapping
    const createBox = (size, uvMap) => {
      const geometry = new THREE.BoxGeometry(...size);
      // Apply UVs per face
      const uvAttr = geometry.attributes.uv;
      const faceUVs = [];
      // order: +X, -X, +Y, -Y, +Z, -Z (Three.js)
      const faces = ['right', 'left', 'top', 'bottom', 'front', 'back'];
      faces.forEach((face) => {
        const [x, y, w, h] = uvMap[face];
        // Convert pixel coords to 0-1 UVs
        const u0 = x / SKIN_SIZE;
        const v0 = 1 - (y + h) / SKIN_SIZE; // flip Y
        const u1 = (x + w) / SKIN_SIZE;
        const v1 = 1 - y / SKIN_SIZE;
        // each face has two triangles => 4 vertices
        faceUVs.push(u0, v1, u1, v1, u1, v0, u0, v0);
      });
      // overwrite uv attribute
      const newUV = new Float32Array(faceUVs);
      uvAttr.array.set(newUV);
      uvAttr.needsUpdate = true;
      return new THREE.Mesh(geometry, material);
    };

    // Head
    const head = createBox([0.8, 0.8, 0.8], STEVE_UV.head.inner);
    head.position.set(0, 1.6, 0);
    group.add(head);

    // Body
    const body = createBox([0.8, 1.2, 0.4], STEVE_UV.body.inner);
    body.position.set(0, 0.8, 0);
    group.add(body);

    // Right Arm (Steve 4px)
    const rArm = createBox([0.4, 1.2, 0.4], STEVE_UV.rightArm.inner);
    rArm.position.set(-0.6, 0.8, 0);
    group.add(rArm);

    // Left Arm
    const lArm = createBox([0.4, 1.2, 0.4], STEVE_UV.leftArm.inner);
    lArm.position.set(0.6, 0.8, 0);
    group.add(lArm);

    // Right Leg
    const rLeg = createBox([0.4, 1.2, 0.4], STEVE_UV.rightLeg.inner);
    rLeg.position.set(-0.2, -0.6, 0);
    group.add(rLeg);

    // Left Leg
    const lLeg = createBox([0.4, 1.2, 0.4], STEVE_UV.leftLeg.inner);
    lLeg.position.set(0.2, -0.6, 0);
    group.add(lLeg);

    return group;
  }

  _bindEvents() {
    const rect = this.canvas.getBoundingClientRect();
    const toCanvasCoords = (e) => {
      const cx = e.clientX ?? e.touches?.[0]?.clientX;
      const cy = e.clientY ?? e.touches?.[0]?.clientY;
      return { x: cx - rect.left, y: cy - rect.top };
    };

    const down = (e) => {
      e.preventDefault();
      this.isPainting = true;
      this._paintAt(toCanvasCoords(e));
    };
    const move = (e) => {
      if (!this.isPainting) return;
      e.preventDefault();
      this._paintAt(toCanvasCoords(e));
    };
    const up = (e) => {
      if (this.isPainting) {
        this.isPainting = false;
        // after paint, update texture
        this.texture.needsUpdate = true;
        // notify external listeners if needed
        if (this.onTextureUpdated) this.onTextureUpdated();
      }
    };

    this.renderer.domElement.addEventListener('mousedown', down);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    // touch support
    this.renderer.domElement.addEventListener('touchstart', down);
    window.addEventListener('touchmove', move);
    window.addEventListener('touchend', up);
  }

  setBrushColor(hex) { this.brushColor = hex; }
  setBrushSize(size) { this.brushSize = size; }

  _paintAt({ x, y }) {
    // Convert screen point to normalized device coordinates
    const ndc = new THREE.Vector2((x / this.canvas.clientWidth) * 2 - 1, -(y / this.canvas.clientHeight) * 2 + 1);
    this.raycaster.setFromCamera(ndc, this.camera);
    const intersects = this.raycaster.intersectObject(this.model, true);
    if (intersects.length === 0) return;
    const intersect = intersects[0];
    const uv = intersect.uv; // THREE.Vector2
    if (!uv) return;
    // uv coordinates are 0-1 relative to the texture
    const texX = Math.floor(uv.x * SKIN_SIZE);
    const texY = Math.floor((1 - uv.y) * SKIN_SIZE); // flip Y
    // Paint a square of brushSize around texX,Y on the master canvas
    const texCanvas = this.getTextureCanvas();
    const ctx = texCanvas.getContext('2d');
    ctx.fillStyle = this.brushColor;
    const half = Math.floor(this.brushSize / 2);
    for (let dx = -half; dx <= half; dx++) {
      for (let dy = -half; dy <= half; dy++) {
        const px = texX + dx;
        const py = texY + dy;
        if (px >= 0 && py >= 0 && px < SKIN_SIZE && py < SKIN_SIZE) {
          ctx.fillRect(px, py, 1, 1);
        }
      }
    }
  }

  _animate() {
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this._animate);
  }

  resize() {
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }
}
