/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║     1st Monster Interface — Haptic Feedback Simulator        ║
 * ║     Cherry Computer Ltd. — Stardust Augmental                ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * The Haptic Simulator generates tactile feedback sensations through
 * ultrasonic mid-air haptics, simulating physical key presses, object
 * collisions, and textures without any physical contact surface.
 *
 * @author  Cherry Computer Ltd.
 * @version 1.0.0
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface HapticConfig {
  enabled?: boolean;
  intensity?: number;       // Global multiplier 0.0–1.0
  mode?: 'ultrasonic' | 'electrostatic' | 'simulated';
}

export interface HapticPulse {
  intensity: number;        // 0.0–1.0
  duration: number;         // milliseconds
  pattern?: 'single' | 'double' | 'long' | 'wave';
  frequency?: number;       // Hz (ultrasonic emitter frequency)
}

export interface HapticTexture {
  name: string;
  roughness: number;        // 0.0 (smooth) – 1.0 (rough)
  resistance: number;       // 0.0–1.0
  temperature?: 'cold' | 'neutral' | 'warm';
}

// ─── Preset Textures ─────────────────────────────────────────────────────────

export const HAPTIC_TEXTURES: Record<string, HapticTexture> = {
  glass:    { name: 'glass',    roughness: 0.05, resistance: 0.1,  temperature: 'cold'    },
  metal:    { name: 'metal',    roughness: 0.2,  resistance: 0.4,  temperature: 'cold'    },
  wood:     { name: 'wood',     roughness: 0.55, resistance: 0.6,  temperature: 'neutral' },
  fabric:   { name: 'fabric',   roughness: 0.7,  resistance: 0.3,  temperature: 'warm'    },
  keypress: { name: 'keypress', roughness: 0.15, resistance: 0.5,  temperature: 'neutral' },
  water:    { name: 'water',    roughness: 0.02, resistance: 0.05, temperature: 'cold'    },
};

// ─── HapticSimulator ─────────────────────────────────────────────────────────

/**
 * HapticSimulator
 * ───────────────
 * Drives the mid-air haptic feedback array of the Stardust Augmental,
 * enabling users to "feel" virtual objects, key presses, and surfaces
 * through precisely focused ultrasonic pressure waves.
 */
export class HapticSimulator {
  private config: Required<HapticConfig>;
  private _online: boolean = false;
  private _log: HapticPulse[] = [];
  private _currentTexture: HapticTexture | null = null;

  constructor(config: HapticConfig = {}) {
    this.config = {
      enabled:   config.enabled   ?? true,
      intensity: config.intensity ?? 1.0,
      mode:      config.mode      ?? 'ultrasonic',
    };
  }

  // ─── Lifecycle ──────────────────────────────────────────────────────────────

  calibrate(): void {
    if (!this.config.enabled) return;
    this._online = true;
    console.log(`[Haptic] 🤲 Haptic emitter calibrated | mode: ${this.config.mode}`);
  }

  disable(): void {
    this._online = false;
    console.log('[Haptic] 🤲 Haptic emitter offline.');
  }

  isOnline(): boolean { return this._online && this.config.enabled; }

  // ─── Pulse ───────────────────────────────────────────────────────────────────

  /** Emit a haptic pulse — used on key presses, button clicks, and collisions. */
  pulse(pulse: HapticPulse): void {
    if (!this.isOnline()) return;
    const adjusted: HapticPulse = {
      ...pulse,
      intensity: Math.min(pulse.intensity * this.config.intensity, 1.0),
      pattern: pulse.pattern ?? 'single',
      frequency: pulse.frequency ?? 40000, // 40kHz default ultrasonic
    };
    this._log.push(adjusted);
    // Trim log to last 100 entries
    if (this._log.length > 100) this._log.shift();
  }

  /** Emit a double-click style haptic. */
  doubleClick(): void {
    this.pulse({ intensity: 0.6, duration: 15, pattern: 'double' });
  }

  /** Emit a long-press / hold haptic. */
  hold(duration = 500): void {
    this.pulse({ intensity: 0.3, duration, pattern: 'long' });
  }

  /** Emit a wave pattern haptic (e.g., for notifications). */
  wave(): void {
    this.pulse({ intensity: 0.5, duration: 200, pattern: 'wave' });
  }

  // ─── Textures ────────────────────────────────────────────────────────────────

  /** Apply a texture profile so virtual surface feels realistic. */
  applyTexture(texture: HapticTexture | string): void {
    this._currentTexture = typeof texture === 'string'
      ? (HAPTIC_TEXTURES[texture] ?? null)
      : texture;
    if (this._currentTexture) {
      console.log(`[Haptic] 🌊 Texture applied: "${this._currentTexture.name}" roughness=${this._currentTexture.roughness}`);
    }
  }

  clearTexture(): void { this._currentTexture = null; }

  // ─── Diagnostics ─────────────────────────────────────────────────────────────

  diagnostics() {
    return {
      online:         this._online,
      mode:           this.config.mode,
      intensity:      this.config.intensity,
      pulseCount:     this._log.length,
      currentTexture: this._currentTexture?.name ?? 'none',
    };
  }
}
