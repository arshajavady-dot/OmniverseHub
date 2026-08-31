// presets.js – simple starter skin generators

import { SKIN_SIZE } from './skinData.js';

/**
 * Helper to fill a rectangular region on a canvas context.
 */
function fillRect(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

export const PRESETS = {
  steve: {
    name: 'Classic Steve',
    generate(ctx) {
      // Clear background
      ctx.clearRect(0, 0, SKIN_SIZE, SKIN_SIZE);
      const skin = '#c68642';
      const hair = '#422814';
      const shirt = '#00a8a8';
      const pants = '#3b3b98';
      const shoes = '#666666';

      // Head (inner)
      fillRect(ctx, 8, 8, 8, 8, skin); // front
      fillRect(ctx, 0, 8, 8, 8, hair); // right
      fillRect(ctx, 16, 8, 8, 8, hair); // left
      fillRect(ctx, 8, 0, 8, 8, hair); // top
      fillRect(ctx, 24, 8, 8, 8, hair); // back

      // Torso
      fillRect(ctx, 20, 20, 8, 12, shirt);

      // Arms (inner)
      fillRect(ctx, 44, 20, 4, 12, shirt); // right arm front
      fillRect(ctx, 36, 52, 4, 12, shirt); // left arm front

      // Legs (inner)
      fillRect(ctx, 4, 20, 4, 12, pants); // right leg front
      fillRect(ctx, 20, 52, 4, 12, pants); // left leg front

      // Shoes (outer layer)
      fillRect(ctx, 0, 32, 4, 4, shoes);
      fillRect(ctx, 4, 32, 4, 4, shoes);
      fillRect(ctx, 8, 32, 4, 4, shoes);
      fillRect(ctx, 12, 32, 4, 4, shoes);
    }
  },
  blank: {
    name: 'Blank Canvas',
    generate(ctx) {
      ctx.clearRect(0, 0, SKIN_SIZE, SKIN_SIZE);
    }
  }
};
