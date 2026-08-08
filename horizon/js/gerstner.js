/**
 * High-frequency Gerstner detail layered on top of FFT swell.
 * Swell-dominant spectrum: energy concentrated in long wavelengths.
 */

export const DETAIL_WAVES = [
  // Mid chop
  { dx: 0.72, dz: 0.69, a: 0.55, lambda: 22, steep: 0.32, phase: 0.4, speed: 1.05 },
  { dx: -0.55, dz: 0.83, a: 0.42, lambda: 14, steep: 0.3, phase: 1.7, speed: 1.1 },
  { dx: 0.9, dz: -0.44, a: 0.32, lambda: 9.5, steep: 0.28, phase: 2.2, speed: 1.15 },
  // Ripples
  { dx: -0.3, dz: 0.95, a: 0.18, lambda: 5.5, steep: 0.24, phase: 0.9, speed: 1.25 },
  { dx: 0.65, dz: 0.76, a: 0.12, lambda: 3.4, steep: 0.22, phase: 3.0, speed: 1.3 },
  { dx: -0.88, dz: -0.47, a: 0.08, lambda: 2.1, steep: 0.2, phase: 1.4, speed: 1.4 },
];

export const WAVE_COUNT = DETAIL_WAVES.length;

export function packDetailWaves(scale = 1) {
  const dirs = [];
  const amp = [];
  const lambda = [];
  const steep = [];
  const phase = [];
  const speed = [];
  for (const w of DETAIL_WAVES) {
    const len = Math.hypot(w.dx, w.dz) || 1;
    dirs.push(w.dx / len, w.dz / len);
    amp.push(w.a * scale);
    lambda.push(w.lambda);
    steep.push(w.steep);
    phase.push(w.phase);
    speed.push(w.speed);
  }
  return { dirs, amp, lambda, steep, phase, speed };
}

/** Sample detail Gerstner only (FFT sampled separately). */
export function sampleDetail(x, z, t, scale = 1) {
  let py = 0, px = 0, pz = 0;
  let dPx_dx = 1, dPy_dx = 0, dPz_dx = 0;
  let dPx_dz = 0, dPy_dz = 0, dPz_dz = 1;
  const n = DETAIL_WAVES.length;
  for (const w of DETAIL_WAVES) {
    const len = Math.hypot(w.dx, w.dz) || 1;
    const dx = w.dx / len, dz = w.dz / len;
    const k = (Math.PI * 2) / w.lambda;
    const wSpeed = Math.sqrt(9.81 * k) * w.speed;
    const a = w.a * scale;
    const Q = w.steep / (k * a * n * 0.5 + 1e-5);
    const theta = k * (dx * x + dz * z) - wSpeed * t + w.phase;
    const s = Math.sin(theta), c = Math.cos(theta);
    px += Q * a * dx * c;
    py += a * s;
    pz += Q * a * dz * c;
    const dth_dx = k * dx, dth_dz = k * dz;
    dPx_dx -= Q * a * dx * s * dth_dx;
    dPy_dx += a * c * dth_dx;
    dPz_dx -= Q * a * dz * s * dth_dx;
    dPx_dz -= Q * a * dx * s * dth_dz;
    dPy_dz += a * c * dth_dz;
    dPz_dz -= Q * a * dz * s * dth_dz;
  }
  let nx = dPy_dz * dPz_dx - dPz_dz * dPy_dx;
  let ny = dPz_dz * dPx_dx - dPx_dz * dPz_dx;
  let nz = dPx_dz * dPy_dx - dPy_dz * dPx_dx;
  const inv = 1 / (Math.hypot(nx, ny, nz) || 1);
  return { x: px, y: py, z: pz, nx: nx * inv, ny: ny * inv, nz: nz * inv };
}
