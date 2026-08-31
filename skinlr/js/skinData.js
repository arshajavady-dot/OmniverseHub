// skinData.js – UV mapping constants for Minecraft skin
export const SKIN_SIZE = 64;

// UV rectangles: [x, y, width, height]
export const STEVE_UV = {
  head: {
    inner: {
      front: [8, 8, 8, 8],
      back: [24, 8, 8, 8],
      left: [16, 8, 8, 8],
      right: [0, 8, 8, 8],
      top: [8, 0, 8, 8],
      bottom: [16, 0, 8, 8]
    },
    outer: {
      front: [40, 8, 8, 8],
      back: [56, 8, 8, 8],
      left: [48, 8, 8, 8],
      right: [32, 8, 8, 8],
      top: [40, 0, 8, 8],
      bottom: [48, 0, 8, 8]
    }
  },
  body: {
    inner: {
      front: [20, 20, 8, 12],
      back: [32, 20, 8, 12],
      left: [16, 20, 4, 12],
      right: [28, 20, 4, 12],
      top: [20, 16, 8, 4],
      bottom: [28, 16, 8, 4]
    },
    outer: {
      front: [20, 36, 8, 12],
      back: [32, 36, 8, 12],
      left: [16, 36, 4, 12],
      right: [28, 36, 4, 12],
      top: [20, 32, 8, 4],
      bottom: [28, 32, 8, 4]
    }
  },
  rightArm: {
    inner: {
      front: [44, 20, 4, 12],
      back: [52, 20, 4, 12],
      left: [40, 20, 4, 12],
      right: [48, 20, 4, 12],
      top: [44, 16, 4, 4],
      bottom: [48, 16, 4, 4]
    },
    outer: {
      front: [44, 36, 4, 12],
      back: [52, 36, 4, 12],
      left: [40, 36, 4, 12],
      right: [48, 36, 4, 12],
      top: [44, 32, 4, 4],
      bottom: [48, 32, 4, 4]
    }
  },
  leftArm: {
    inner: {
      front: [36, 52, 4, 12],
      back: [44, 52, 4, 12],
      left: [32, 52, 4, 12],
      right: [40, 52, 4, 12],
      top: [36, 48, 4, 4],
      bottom: [40, 48, 4, 4]
    },
    outer: {
      front: [36, 68, 4, 12],
      back: [44, 68, 4, 12],
      left: [32, 68, 4, 12],
      right: [40, 68, 4, 12],
      top: [36, 64, 4, 4],
      bottom: [40, 64, 4, 4]
    }
  },
  rightLeg: {
    inner: {
      front: [4, 20, 4, 12],
      back: [12, 20, 4, 12],
      left: [0, 20, 4, 12],
      right: [8, 20, 4, 12],
      top: [4, 16, 4, 4],
      bottom: [8, 16, 4, 4]
    },
    outer: {
      front: [4, 36, 4, 12],
      back: [12, 36, 4, 12],
      left: [0, 36, 4, 12],
      right: [8, 36, 4, 12],
      top: [4, 32, 4, 4],
      bottom: [8, 32, 4, 4]
    }
  },
  leftLeg: {
    inner: {
      front: [20, 52, 4, 12],
      back: [28, 52, 4, 12],
      left: [16, 52, 4, 12],
      right: [24, 52, 4, 12],
      top: [20, 48, 4, 4],
      bottom: [24, 48, 4, 4]
    },
    outer: {
      // legacy mapping – outer leg UVs follow same positions as inner in newer skins
      front: [20, 68, 4, 12],
      back: [28, 68, 4, 12],
      left: [16, 68, 4, 12],
      right: [24, 68, 4, 12],
      top: [20, 64, 4, 4],
      bottom: [24, 64, 4, 4]
    }
  }
};

export const ALEX_UV = { ...STEVE_UV, leftArm: { ...STEVE_UV.leftArm, inner: { ...STEVE_UV.leftArm.inner, front: [36, 52, 3, 12] } } };
