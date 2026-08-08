import * as THREE from "three";
import { sampleDetail } from "./gerstner.js";

/**
 * Multi-point buoyancy + torque, horizontal wave drift, quadratic drag, planing lift.
 * Sample points in local boat space → world → FFT+Gerstner surface.
 */

const SAMPLE_POINTS = [
  { x: 0, z: -1.6, w: 1.1 }, // bow
  { x: 0, z: 1.5, w: 1.0 }, // stern
  { x: -0.55, z: 0.1, w: 0.85 }, // port
  { x: 0.55, z: 0.1, w: 0.85 }, // starboard
  { x: 0, z: 0, w: 1.0 }, // center
];

export class Boat {
  constructor(scene) {
    this.x = 0;
    this.y = 1;
    this.z = 0;
    this.yaw = 0;
    this.pitch = 0;
    this.roll = 0;
    this.speed = 0; // m/s along heading
    this.vy = 0;
    this.vpitch = 0;
    this.vroll = 0;

    this.group = new THREE.Group();
    scene.add(this.group);
    this._buildMesh();
  }

  _buildMesh() {
    const hull = new THREE.MeshStandardMaterial({
      color: 0xeef2f6,
      roughness: 0.32,
      metalness: 0.18,
    });
    const accent = new THREE.MeshStandardMaterial({
      color: 0x163848,
      roughness: 0.42,
      metalness: 0.22,
    });
    const glass = new THREE.MeshStandardMaterial({
      color: 0x9ed0e8,
      roughness: 0.08,
      metalness: 0.45,
      transparent: true,
      opacity: 0.55,
    });

    const body = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.42, 3.6), hull);
    body.position.set(0, 0.12, 0.15);
    body.castShadow = true;
    this.group.add(body);

    const bow = new THREE.Mesh(new THREE.ConeGeometry(0.82, 1.5, 4), hull);
    bow.rotation.x = -Math.PI / 2;
    bow.position.set(0, 0.14, -1.85);
    bow.scale.set(0.95, 1.1, 0.7);
    bow.castShadow = true;
    this.group.add(bow);

    const deck = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.07, 2.9), accent);
    deck.position.set(0, 0.36, 0.25);
    this.group.add(deck);

    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.65, 1.25), accent);
    cabin.position.set(0, 0.72, 0.65);
    cabin.castShadow = true;
    this.group.add(cabin);

    const wind = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.4, 0.1), glass);
    wind.position.set(0, 0.82, -0.02);
    this.group.add(wind);

    const motor = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.5, 0.32), accent);
    motor.position.set(0, 0.1, 2.05);
    this.group.add(motor);

    const light = new THREE.PointLight(0xc5e0f0, 0.55, 10);
    light.position.set(0, 0.9, 0);
    this.group.add(light);
  }

  /**
   * @param {object} sea - { sample(x,z) => {y,dx,dz,jacobian}, detailScale }
   * @param {number} t
   * @param {{steer:number, throttle:number}} input
   * @param {boolean} active
   * @param {number} dt
   */
  update(sea, t, input, active, dt) {
    dt = Math.min(dt, 0.05);
    const fx = -Math.sin(this.yaw);
    const fz = -Math.cos(this.yaw);
    const rx = Math.cos(this.yaw);
    const rz = -Math.sin(this.yaw);

    // --- Propulsion ---
    if (active) {
      const maxSpeed = 28;
      const accel = 15;
      const drag = 0.04; // quadratic coeff
      if (input.throttle > 0) this.speed += input.throttle * accel * dt;
      else if (input.throttle < 0) this.speed += input.throttle * accel * 0.65 * dt;
      // Quadratic water drag
      const dragForce = drag * this.speed * Math.abs(this.speed);
      this.speed -= dragForce * Math.sign(this.speed || 1) * dt * 18;
      this.speed = THREE.MathUtils.clamp(this.speed, -maxSpeed * 0.35, maxSpeed);

      const speedFactor = THREE.MathUtils.clamp(Math.abs(this.speed) / maxSpeed, 0.12, 1);
      const reverse = this.speed >= 0 ? 1 : -1;
      this.yaw += input.steer * 1.35 * speedFactor * reverse * dt;
    } else {
      this.speed *= Math.exp(-1.5 * dt);
    }

    // Integrate planar motion
    this.x += fx * this.speed * dt;
    this.z += fz * this.speed * dt;

    // --- Multi-point sea samples (world) ---
    let sumY = 0,
      sumW = 0,
      sumDx = 0,
      sumDz = 0;
    const heights = [];
    for (const sp of SAMPLE_POINTS) {
      // local → world (yaw only for sampling horizontal)
      const wx = this.x + rx * sp.x + fx * sp.z;
      const wz = this.z + rz * sp.x + fz * sp.z;
      const fft = sea.sampleFFT(wx, wz);
      const det = sampleDetail(wx, wz, t, sea.detailScale);
      const y = fft.y * sea.fftScale + det.y;
      const dx = fft.dx * sea.fftScale * 0.35 + det.x;
      const dz = fft.dz * sea.fftScale * 0.35 + det.z;
      heights.push({ y, dx, dz, w: sp.w, lx: sp.x, lz: sp.z });
      sumY += y * sp.w;
      sumW += sp.w;
      sumDx += dx * sp.w;
      sumDz += dz * sp.w;
    }
    const meanY = sumY / sumW;
    const meanDx = sumDx / sumW;
    const meanDz = sumDz / sumW;

    // Horizontal wave drift (Stokes-ish)
    this.x += meanDx * 0.15 * dt;
    this.z += meanDz * 0.15 * dt;

    // Pitch/roll targets from height differences
    const bow = heights[0].y;
    const stern = heights[1].y;
    const port = heights[2].y;
    const star = heights[3].y;
    const targetPitch = Math.atan2(stern - bow, 3.1) * 0.85;
    const targetRoll = Math.atan2(star - port, 1.1) * 0.85;

    // Spring-damper vertical
    const waterline = 0.38;
    const targetY = meanY + waterline + Math.abs(this.speed) * 0.012; // planing lift
    const kSpring = 18;
    const kDamp = 7;
    const ay = (targetY - this.y) * kSpring - this.vy * kDamp;
    this.vy += ay * dt;
    this.y += this.vy * dt;

    // Angular spring-dampers
    const kAng = 12;
    const kAngD = 5;
    this.vpitch += ((targetPitch - this.pitch) * kAng - this.vpitch * kAngD) * dt;
    this.vroll += ((targetRoll - this.roll) * kAng - this.vroll * kAngD) * dt;
    // Steer lean
    if (active) this.vroll += -input.steer * 0.8 * Math.min(1, Math.abs(this.speed) / 20) * dt;
    this.pitch += this.vpitch * dt;
    this.roll += this.vroll * dt;
    this.pitch = THREE.MathUtils.clamp(this.pitch, -0.55, 0.55);
    this.roll = THREE.MathUtils.clamp(this.roll, -0.55, 0.55);

    this.group.position.set(this.x, this.y, this.z);
    this.group.rotation.order = "YXZ";
    this.group.rotation.y = this.yaw;
    this.group.rotation.x = this.pitch;
    this.group.rotation.z = this.roll;

    // Foam stamp intensity for wake
    return {
      foam: Math.min(1, Math.abs(this.speed) / 18),
      x: this.x,
      z: this.z,
      yaw: this.yaw,
    };
  }
}
