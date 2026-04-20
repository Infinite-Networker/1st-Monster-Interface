/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║     1st Monster Interface — Projection Keyboard Engine       ║
 * ║     Cherry Computer Ltd. — Stardust Augmental                ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * The Projection Keyboard generates a holographic, air-based keyboard
 * that can be viewed and typed from any angle. Supports customizable
 * layouts, haptic feedback simulation, and adaptive key spacing.
 *
 * @author  Cherry Computer Ltd.
 * @version 1.0.0
 */

import type { MonsterLayout } from './monster';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Vec3 { x: number; y: number; z: number; }

export interface ProjectionConfig {
  layout?: MonsterLayout;
  hapticFeedback?: boolean;
  adaptiveAngle?: boolean;
  glowColor?: string;
  opacity?: number;         // 0.0–1.0
}

export interface KeyEvent {
  key: string;
  position: Vec3;
  pressure: number;         // 0.0–1.0 (simulated)
  timestamp: number;
}

// ─── Layout Definitions ───────────────────────────────────────────────────────

const LAYOUTS: Record<MonsterLayout, string[][]> = {
  professional: [
    ['`','1','2','3','4','5','6','7','8','9','0','-','='],
    ['Q','W','E','R','T','Y','U','I','O','P','[',']','\\'],
    ['A','S','D','F','G','H','J','K','L',';','\''],
    ['Z','X','C','V','B','N','M',',','.','/'],
    ['SPACE'],
  ],
  gaming: [
    ['ESC','F1','F2','F3','F4','F5','F6'],
    ['TAB','Q','W','E','R','T'],
    ['CAPS','A','S','D','F','G'],
    ['SHIFT','Z','X','C','V'],
    ['CTRL','ALT','SPACE'],
  ],
  casual: [
    ['Q','W','E','R','T','Y','U','I','O','P'],
    ['A','S','D','F','G','H','J','K','L'],
    ['Z','X','C','V','B','N','M'],
    ['123','SPACE','↵'],
  ],
  creative: [
    ['PEN','BRUSH','ERASER','FILL','SELECT','CROP'],
    ['UNDO','REDO','LAYER+','LAYER-','BLEND','MASK'],
    ['ZOOM+','ZOOM-','FIT','ROTATE','FLIP','EXPORT'],
    ['COLOR','GRADIENT','OPACITY','SPACE'],
  ],
};

// ─── ProjectionKeyboard ───────────────────────────────────────────────────────

/**
 * ProjectionKeyboard
 * ──────────────────
 * Renders and manages the holographic projection keyboard for the
 * 1st Monster Interface. Handles projection plane positioning,
 * key-hit detection, haptic pulse triggers, and layout switching.
 */
export class ProjectionKeyboard {
  private config: Required<ProjectionConfig>;
  private _projected: boolean = false;
  private _position: Vec3 = { x: 0, y: 0, z: 0 };
  private _keyListeners: Array<(key: string) => void> = [];
  private _activeLayout: MonsterLayout;

  constructor(config: ProjectionConfig = {}) {
    this.config = {
      layout:         config.layout         ?? 'professional',
      hapticFeedback: config.hapticFeedback ?? true,
      adaptiveAngle:  config.adaptiveAngle  ?? true,
      glowColor:      config.glowColor      ?? '#00e5ff',
      opacity:        config.opacity        ?? 0.85,
    };
    this._activeLayout = this.config.layout;
  }

  // ─── Projection Control ─────────────────────────────────────────────────────

  /** Project the holographic keyboard at the given 3D position. */
  async project(position: Vec3 = { x: 0, y: 1.2, z: -0.5 }): Promise<void> {
    this._position = position;
    this._projected = true;
    console.log(`[Projection] ⌨️  Keyboard projected at (${position.x}, ${position.y}, ${position.z}) | Layout: ${this._activeLayout}`);
    await this._simulate_calibration();
  }

  /** Retract / hide the holographic keyboard. */
  retract(): void {
    this._projected = false;
    console.log('[Projection] ⌨️  Keyboard retracted.');
  }

  isProjected(): boolean { return this._projected; }

  // ─── Layout ─────────────────────────────────────────────────────────────────

  setLayout(layout: MonsterLayout): void {
    this._activeLayout = layout;
    this.config.layout = layout;
    if (this._projected) {
      console.log(`[Projection] 🔄 Layout switched to: ${layout}`);
    }
  }

  getLayout(): string[][] { return LAYOUTS[this._activeLayout]; }

  // ─── Key Events ─────────────────────────────────────────────────────────────

  onKeyPress(handler: (key: string) => void): void {
    this._keyListeners.push(handler);
  }

  /** Simulate a key press (for testing / demo). */
  simulateKeyPress(key: string): KeyEvent {
    const event: KeyEvent = {
      key,
      position:  this._position,
      pressure:  +(Math.random() * 0.5 + 0.5).toFixed(2),
      timestamp: Date.now(),
    };
    this._keyListeners.forEach(h => h(key));
    return event;
  }

  // ─── Render State (for UI renderers) ────────────────────────────────────────

  renderState() {
    return {
      projected:  this._projected,
      position:   this._position,
      layout:     this.getLayout(),
      glowColor:  this.config.glowColor,
      opacity:    this.config.opacity,
    };
  }

  // ─── Internals ───────────────────────────────────────────────────────────────

  private _simulate_calibration(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 80));
  }
}
