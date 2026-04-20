/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║          1st Monster Interface — Core Engine                 ║
 * ║          Cherry Computer Ltd. — Stardust Augmental           ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * The 1st Monster Interface is the flagship interaction system
 * of the Cherry Computer Stardust Augmental platform, replacing
 * all physical input methods with AR/VR, neural, and projection technology.
 *
 * @author     Cherry Computer Ltd.
 * @version    1.0.0
 * @license    MIT
 */

import { NeuralProcessor } from './neural';
import { ProjectionKeyboard } from './projection';
import { ARLayer } from '../ar/ar-layer';
import { VREngine } from '../ar/vr-engine';
import { GestureEngine } from '../gesture/gesture-engine';
import { HapticSimulator } from '../haptic/haptic-sim';
import { CognitiveAdapter } from '../adaptive/cognitive-adapter';

// ─── Types ────────────────────────────────────────────────────────────────────

export type MonsterMode = 'ar' | 'vr' | 'hybrid' | 'neural-only';
export type MonsterLayout = 'professional' | 'gaming' | 'casual' | 'creative';

export interface MonsterConfig {
  mode: MonsterMode;
  layout: MonsterLayout;
  neuralEnabled: boolean;
  hapticEnabled: boolean;
  gestureFullBody: boolean;
  adaptiveLearning: boolean;
  userId?: string;
}

export interface MonsterStatus {
  active: boolean;
  mode: MonsterMode;
  neuralConnected: boolean;
  gestureTracking: boolean;
  arLayerActive: boolean;
  vrEngineActive: boolean;
  hapticOnline: boolean;
  cognitiveScore: number;         // 0–100 personalization level
  uptime: number;                 // ms
}

// ─── Default Configuration ────────────────────────────────────────────────────

const DEFAULT_CONFIG: MonsterConfig = {
  mode: 'hybrid',
  layout: 'professional',
  neuralEnabled: true,
  hapticEnabled: true,
  gestureFullBody: true,
  adaptiveLearning: true,
};

// ─── Monster Interface Class ──────────────────────────────────────────────────

/**
 * MonsterInterface
 * ────────────────
 * The top-level orchestrator for the 1st Monster Interface system.
 * Coordinates all subsystems: Neural, Projection, AR, VR, Gesture, Haptic,
 * and Cognitive Adapter into a unified, seamless experience.
 */
export class MonsterInterface {
  private config: MonsterConfig;
  private neural: NeuralProcessor;
  private keyboard: ProjectionKeyboard;
  private ar: ARLayer;
  private vr: VREngine;
  private gesture: GestureEngine;
  private haptic: HapticSimulator;
  private cognitive: CognitiveAdapter;

  private _active: boolean = false;
  private _startTime: number = 0;
  private _eventHandlers: Map<string, Function[]> = new Map();

  constructor(config: Partial<MonsterConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };

    // Initialise all subsystems
    this.neural   = new NeuralProcessor({ userId: this.config.userId });
    this.keyboard = new ProjectionKeyboard({ layout: this.config.layout, hapticFeedback: this.config.hapticEnabled });
    this.ar       = new ARLayer();
    this.vr       = new VREngine();
    this.gesture  = new GestureEngine({ fullBody: this.config.gestureFullBody });
    this.haptic   = new HapticSimulator({ enabled: this.config.hapticEnabled });
    this.cognitive = new CognitiveAdapter({ learning: this.config.adaptiveLearning });

    this._bindSubsystems();
  }

  // ─── Lifecycle ──────────────────────────────────────────────────────────────

  /** Boot the 1st Monster Interface and all subsystems. */
  async boot(): Promise<void> {
    console.log('[1st Monster] 🌌 Booting Cherry Computer Stardust Augmental...');

    if (this.config.neuralEnabled) await this.neural.connect();
    if (this.config.mode !== 'vr') await this.ar.enable();
    if (this.config.mode !== 'ar') await this.vr.enable();

    this.gesture.start();
    this.haptic.calibrate();
    await this.keyboard.project();

    this._active = true;
    this._startTime = Date.now();

    this._emit('boot', this.status());
    console.log('[1st Monster] ✅ Interface active. Physical inputs are now obsolete.');
  }

  /** Gracefully shut down all subsystems. */
  async shutdown(): Promise<void> {
    console.log('[1st Monster] 🔴 Shutting down...');
    this.neural.disconnect();
    this.ar.disable();
    this.vr.disable();
    this.gesture.stop();
    this.haptic.disable();
    this.keyboard.retract();
    this._active = false;
    this._emit('shutdown', this.status());
  }

  // ─── Core Actions ───────────────────────────────────────────────────────────

  /** Execute a decoded action from any input source. */
  execute(action: string, payload?: unknown): void {
    if (!this._active) throw new Error('[1st Monster] Interface not active. Call boot() first.');
    this._emit('action', { action, payload });
    this.cognitive.record(action);
  }

  /** Switch interface mode dynamically. */
  setMode(mode: MonsterMode): void {
    this.config.mode = mode;
    if (mode === 'vr') { this.ar.disable(); this.vr.enable(); }
    if (mode === 'ar') { this.vr.disable(); this.ar.enable(); }
    if (mode === 'hybrid') { this.ar.enable(); this.vr.enable(); }
    this._emit('modeChange', mode);
  }

  /** Switch the projection keyboard layout. */
  setLayout(layout: MonsterLayout): void {
    this.config.layout = layout;
    this.keyboard.setLayout(layout);
    this._emit('layoutChange', layout);
  }

  // ─── Status ─────────────────────────────────────────────────────────────────

  /** Get a real-time status snapshot of all subsystems. */
  status(): MonsterStatus {
    return {
      active:          this._active,
      mode:            this.config.mode,
      neuralConnected: this.neural.isConnected(),
      gestureTracking: this.gesture.isTracking(),
      arLayerActive:   this.ar.isActive(),
      vrEngineActive:  this.vr.isActive(),
      hapticOnline:    this.haptic.isOnline(),
      cognitiveScore:  this.cognitive.personalizationScore(),
      uptime:          this._active ? Date.now() - this._startTime : 0,
    };
  }

  // ─── Event System ───────────────────────────────────────────────────────────

  on(event: string, handler: Function): this {
    if (!this._eventHandlers.has(event)) this._eventHandlers.set(event, []);
    this._eventHandlers.get(event)!.push(handler);
    return this;
  }

  private _emit(event: string, data?: unknown): void {
    (this._eventHandlers.get(event) || []).forEach(h => h(data));
  }

  // ─── Internal Binding ───────────────────────────────────────────────────────

  private _bindSubsystems(): void {
    // Neural → execute
    this.neural.onThought((decoded: string) => this.execute(decoded));

    // Gesture → execute
    this.gesture.onGesture((type: string) => this.execute(`gesture:${type}`));

    // Keyboard keypress → execute + haptic
    this.keyboard.onKeyPress((key: string) => {
      this.execute(`key:${key}`);
      this.haptic.pulse({ intensity: 0.4, duration: 20 });
    });

    // AR object interaction → execute
    this.ar.onInteract((obj: unknown) => this.execute('ar:interact', obj));

    // Cognitive adapter → update keyboard layout
    this.cognitive.onSuggestion((layout: MonsterLayout) => this.setLayout(layout));
  }
}

export default MonsterInterface;
