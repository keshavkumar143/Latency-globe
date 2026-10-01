import { MeshPhongMaterial } from 'three';
import { GLOBE_COLORS, STARFIELD } from '@/constants/globe';

/** Dark surface shown under the map tiles while they load, instead of a white flash. */
export function createBaseMaterial() {
  return new MeshPhongMaterial({ color: GLOBE_COLORS.baseSurface });
}

/**
 * Paints a random star field and returns it as a data URL for the globe's sky sphere.
 * Generated at runtime, so no image asset needs to be shipped.
 */
export function createStarfieldTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = STARFIELD.WIDTH;
  canvas.height = STARFIELD.HEIGHT;

  const context = canvas.getContext('2d');
  context.fillStyle = STARFIELD.BACKGROUND;
  context.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < STARFIELD.STAR_COUNT; i += 1) {
    // Cubing a random number skews towards small values: mostly faint stars, a few bright ones.
    const radius = STARFIELD.MIN_RADIUS + Math.random() ** 3 * STARFIELD.MAX_EXTRA_RADIUS;
    const opacity = STARFIELD.MIN_OPACITY + Math.random() * (1 - STARFIELD.MIN_OPACITY);
    const tint = STARFIELD.TINTS[Math.floor(Math.random() * STARFIELD.TINTS.length)];

    context.fillStyle = `rgba(${tint}, ${opacity})`;
    context.beginPath();
    context.arc(Math.random() * canvas.width, Math.random() * canvas.height, radius, 0, Math.PI * 2);
    context.fill();
  }

  return canvas.toDataURL('image/png');
}
