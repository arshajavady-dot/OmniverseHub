/**
 * EmotionDetector - Ultra-responsive dual-engine facial emotion recognition
 * Combines 3D Landmark Geometric Analysis + MediaPipe Facial Blendshapes.
 */

export class EmotionDetector {
  constructor() {
    this.emotions = {
      happy: 0,
      sad: 0,
      angry: 0,
      surprised: 0,
      fearful: 0,
      disgusted: 0,
      neutral: 1.0
    };

    this.sensitivity = 'high';
    this.alpha = 0.50; // Fast smoothing for immediate response

    this.history = [];
    this.maxHistory = 30;

    this.lastTimestamp = 0;
    this.debugData = {};
  }

  setSensitivity(mode) {
    this.sensitivity = mode;
    if (mode === 'high') this.alpha = 0.60;
    else if (mode === 'balanced') this.alpha = 0.40;
    else if (mode === 'low') this.alpha = 0.25;
  }

  /**
   * Process face blendshapes and 3D landmarks.
   */
  process(blendshapes, landmarks) {
    // ----------------------------------------------------
    // 1. BLENDSHAPES EXTRACTOR
    // ----------------------------------------------------
    const bMap = {};
    if (blendshapes && blendshapes.length > 0) {
      for (const item of blendshapes) {
        const name = item.categoryName || item.displayName || '';
        bMap[name] = item.score || 0;
      }
    }
    const getB = (name) => bMap[name] || 0;

    const bSmileL = getB('mouthSmileLeft');
    const bSmileR = getB('mouthSmileRight');
    const bCheekL = getB('cheekSquintLeft');
    const bCheekR = getB('cheekSquintRight');
    const bJawOpen = getB('jawOpen');
    const bEyeWideL = getB('eyeWideLeft');
    const bEyeWideR = getB('eyeWideRight');
    const bBrowDownL = getB('browDownLeft');
    const bBrowDownR = getB('browDownRight');
    const bBrowInnerUp = getB('browInnerUp');
    const bFrownL = getB('mouthFrownLeft');
    const bFrownR = getB('mouthFrownRight');
    const bNoseSneerL = getB('noseSneerLeft');
    const bNoseSneerR = getB('noseSneerRight');
    const bUpperUpL = getB('mouthUpperUpLeft');
    const bUpperUpR = getB('mouthUpperUpRight');

    const maxSmileBlend = Math.max(bSmileL, bSmileR);

    // ----------------------------------------------------
    // 2. GEOMETRIC LANDMARK 3D ANALYSIS
    // ----------------------------------------------------
    let geoHappy = 0;
    let geoSurprised = 0;
    let geoAngry = 0;
    let geoSad = 0;
    let geoDisgusted = 0;
    let geoFearful = 0;

    let eyeOpenness = 0.25;
    let smileRatio = 0.40;
    let browTension = 0.05;
    let smileCurve = 0;

    if (landmarks && landmarks.length >= 468) {
      const dist = (p1, p2) => {
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dz = (p1.z || 0) - (p2.z || 0);
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
      };

      const faceWidth = dist(landmarks[234], landmarks[454]);
      const faceHeight = dist(landmarks[10], landmarks[152]);
      const fScale = faceWidth > 0 ? faceWidth : 1.0;

      // Lip corners: 61 (left corner), 291 (right corner)
      // Lip centers: 0 (upper lip top), 17 (lower lip bottom)
      const mouthWidth = dist(landmarks[61], landmarks[291]);
      smileRatio = mouthWidth / fScale;

      const mouthCornerY = (landmarks[61].y + landmarks[291].y) / 2;
      const mouthCenterY = (landmarks[0].y + landmarks[17].y) / 2;
      smileCurve = (mouthCenterY - mouthCornerY) / fScale;

      // A. HAPPY GEOMETRY
      // Normal relaxed mouth ratio is ~0.38 - 0.40.
      // Smiling widens mouth (> 0.41) or lifts mouth corners up (smileCurve > 0.001)
      const smileWidthDelta = Math.max(0, smileRatio - 0.39);
      const smileLiftDelta = Math.max(0, smileCurve + 0.002);

      if (smileWidthDelta > 0.01 || smileLiftDelta > 0.002) {
        geoHappy = Math.min(1.0, (smileWidthDelta * 12.0) + (smileLiftDelta * 35.0));
      }

      // B. SURPRISE & FEAR GEOMETRY
      const mouthOpenness = dist(landmarks[13], landmarks[14]) / faceHeight;
      const leftEyeH = dist(landmarks[159], landmarks[145]);
      const leftEyeW = dist(landmarks[33], landmarks[133]);
      const rightEyeH = dist(landmarks[386], landmarks[374]);
      const rightEyeW = dist(landmarks[362], landmarks[263]);

      const leftEyeRatio = leftEyeW > 0 ? leftEyeH / leftEyeW : 0.25;
      const rightEyeRatio = rightEyeW > 0 ? rightEyeH / rightEyeW : 0.25;
      eyeOpenness = Number(((leftEyeRatio + rightEyeRatio) / 2).toFixed(3));

      if (mouthOpenness > 0.04 || eyeOpenness > 0.29) {
        const jawScore = Math.max(0, (mouthOpenness - 0.035) * 8.0);
        const eyeScore = Math.max(0, (eyeOpenness - 0.28) * 6.0);
        geoSurprised = Math.min(1.0, jawScore + eyeScore);
      }

      // C. ANGER GEOMETRY
      const innerBrowDist = dist(landmarks[55], landmarks[285]) / fScale;
      const browCompression = Math.max(0, (0.25 - innerBrowDist) * 10.0);

      const leftEyeBrowDist = dist(landmarks[55], landmarks[159]) / fScale;
      const rightEyeBrowDist = dist(landmarks[285], landmarks[386]) / fScale;
      const eyeBrowDist = (leftEyeBrowDist + rightEyeBrowDist) / 2;
      const browLowering = Math.max(0, (0.11 - eyeBrowDist) * 12.0);

      browTension = Number((browCompression * 0.5 + browLowering * 0.5).toFixed(3));
      geoAngry = Math.min(1.0, browCompression + browLowering);

      // D. SAD GEOMETRY
      const mouthFrown = Math.max(0, (-0.002 - smileCurve) * 35.0);
      const innerBrowLift = Math.max(0, (eyeBrowDist - 0.11) * 10.0);
      geoSad = Math.min(1.0, mouthFrown + innerBrowLift);

      // E. DISGUST GEOMETRY
      const upperLipLift = Math.max(0, (mouthCenterY - landmarks[0].y) / fScale);
      geoDisgusted = Math.min(1.0, upperLipLift * 25.0);

      geoFearful = Math.min(1.0, geoSurprised * 0.5 + innerBrowLift * 0.5);
    }

    // ----------------------------------------------------
    // 3. FUSE SCORES & BOOST SENSITIVITY
    // ----------------------------------------------------
    let rawHappy = Math.max(maxSmileBlend * 2.0, geoHappy * 1.6);
    let rawSurprised = Math.max(bJawOpen * 2.0, geoSurprised * 1.5);
    let rawAngry = Math.max((bBrowDownL + bBrowDownR) * 1.5, geoAngry * 1.5);
    let rawSad = Math.max((bFrownL + bFrownR) * 1.5, geoSad * 1.5);
    let rawDisgusted = Math.max((bNoseSneerL + bNoseSneerR) * 1.5, geoDisgusted * 1.5);
    let rawFearful = Math.max((bEyeWideL + bEyeWideR) * 1.2, geoFearful * 1.2);

    // Save debug info
    this.debugData = {
      smileRatio: Number(smileRatio.toFixed(3)),
      smileCurve: Number(smileCurve.toFixed(4)),
      eyeOpenness,
      browTension,
      rawHappy: Number(rawHappy.toFixed(2)),
      maxSmileBlend: Number(maxSmileBlend.toFixed(2))
    };

    // Calculate max active non-neutral score
    const maxActive = Math.max(rawHappy, rawSurprised, rawAngry, rawSad, rawDisgusted, rawFearful);

    // Neutral Score
    let rawNeutral = 0;
    if (maxActive < 0.10) {
      rawNeutral = 1.0;
    } else if (maxActive < 0.30) {
      rawNeutral = (0.30 - maxActive) * 3.3;
    } else {
      rawNeutral = 0;
    }

    // Normalization
    const total = rawHappy + rawSurprised + rawAngry + rawSad + rawDisgusted + rawFearful + rawNeutral;
    const norm = total > 0 ? total : 1.0;

    const currentScores = {
      happy: Math.min(1.0, rawHappy / norm),
      surprised: Math.min(1.0, rawSurprised / norm),
      angry: Math.min(1.0, rawAngry / norm),
      sad: Math.min(1.0, rawSad / norm),
      disgusted: Math.min(1.0, rawDisgusted / norm),
      fearful: Math.min(1.0, rawFearful / norm),
      neutral: Math.min(1.0, rawNeutral / norm)
    };

    // EMA smoothing
    for (const key in this.emotions) {
      this.emotions[key] = (this.alpha * currentScores[key]) + ((1 - this.alpha) * this.emotions[key]);
    }

    // Find Dominant Emotion
    let dominantKey = 'neutral';
    let maxVal = -1;
    for (const [key, val] of Object.entries(this.emotions)) {
      if (val > maxVal) {
        maxVal = val;
        dominantKey = key;
      }
    }

    // History logging
    const now = Date.now();
    if (now - this.lastTimestamp > 500) {
      this.history.push({
        time: new Date().toLocaleTimeString(),
        dominant: dominantKey,
        confidence: Math.round(maxVal * 100),
        scores: { ...this.emotions }
      });
      if (this.history.length > this.maxHistory) {
        this.history.shift();
      }
      this.lastTimestamp = now;
    }

    return {
      scores: this.emotions,
      dominant: dominantKey,
      confidence: maxVal,
      metrics: {
        eyeOpenness,
        smileRatio: Number(smileRatio.toFixed(3)),
        browTension
      },
      debug: this.debugData
    };
  }
}
