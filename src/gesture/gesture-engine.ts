/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║      1st Monster Interface — Gesture Recognition Engine      ║
 * ║      Cherry Computer Ltd. — Stardust Augmental               ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * The Gesture Engine captures and classifies full-body motion patterns
 * to enable fluid, intuitive device control without any physical contact.
 * Supports hand gestures, body posture, eye tracking, and micro-expressions.
 *
 * @author  Cherry Computer Ltd.
 * @version 1.0.0
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type GestureType =
  | 'swipe_right' | 'swipe_left' | 'swipe_up' | 'swipe_down'
  | 'pinch' | 'expand' | 'grab' | 'release'
  | 'wave' | 'point' | 'fist' | 'open_palm'
  | 'nod' | 'head_shake' | 'look_left' | 'look_right'
  | 'blink_left' | 'blink_right' | 'wink';

export interface GestureConfig {
  fullBody?: boolean;
  sensitivity?: number;     // 0.0–1.0
  debounce?: number;        // ms between gestures
  eyeTracking?: boolean;
  microExpressions?: boolean;
}

export interface GestureEvent {
  type: GestureType;
  confidence: number;
  timestamp: number;
  bodyPart: 'hand' | 'head' | 'eye' | 'body';
  velocity?: number;
}

// ─── Gesture → Action Default Bindings ───────────────────────────────────────

export const DEFAULT_BINDINGS: Record<GestureType, string> = {
  swipe_right:  'next_page',
  swipe_left:   'prev_page',
  swipe_up:     'scroll_up',
  swipe_down:   'scroll_down',
  pinch:        'zoom_in',
  expand:       'zoom_out',
  grab:         'select',
  release:      'deselect',
  wave:         'open_menu',
  point:        'cursor_move',
  fist:         'close_app',
  open_palm:    'pause',
  nod:          'confirm',
  head_shake:   'cancel',
  look_left:    'focus_left_panel',
  look_right:   'focus_right_panel',
  blink_left:   'toggle_left_action',
  blink_right:  'toggle_right_action',
  wink:         'quick_action',
};

// ─── GestureEngine ───────────────────────────────────────────────────────────

/**
 * GestureEngine
 * ─────────────
 * Polls the Stardust Augmental sensor array at high frequency to detect
 * hand, head, eye, and full-body gesture inputs. Maps gesture events to
 * interface actions using a fully customizable binding system.
 */
export class GestureEngine {
  private config: Required<GestureConfig>;
  private _tracking: boolean = false;
  private _bindings: Map<GestureType, string>;
  private _handlers: Map<string, Array<(event: GestureEvent) => void>>;
  private _globalHandlers: Array<(type: string) => void> = [];
  private _pollInterval: ReturnType<typeof setInterval> | null = null;
  private _lastGestureAt: number = 0;

  constructor(config: GestureConfig = {}) {
    this.config = {
      fullBody:         config.fullBody         ?? true,
      sensitivity:      config.sensitivity      ?? 0.85,
      debounce:         config.debounce         ?? 300,
      eyeTracking:      config.eyeTracking      ?? true,
      microExpressions: config.microExpressions ?? false,
    };
    this._bindings = new Map(Object.entries(DEFAULT_BINDINGS) as [GestureType, string][]);
    this._handlers = new Map();
  }

  // ─── Lifecycle ──────────────────────────────────────────────────────────────

  start(): void {
    this._tracking = true;
    this._pollInterval = setInterval(() => this._detectGesture(), 100);
    console.log(`[Gesture] ✋ Tracking started | fullBody=${this.config.fullBody} eye=${this.config.eyeTracking}`);
  }

  stop(): void {
    if (this._pollInterval) clearInterval(this._pollInterval);
    this._tracking = false;
    console.log('[Gesture] ✋ Tracking stopped.');
  }

  isTracking(): boolean { return this._tracking; }

  // ─── Bindings ────────────────────────────────────────────────────────────────

  /** Bind a gesture type to a named action. */
  bind(gesture: GestureType, action: string): void {
    this._bindings.set(gesture, action);
  }

  /** Register a handler for a specific gesture type. */
  onGesture(gesture: GestureType, handler: (event: GestureEvent) => void): void {
    if (!this._handlers.has(gesture)) this._handlers.set(gesture, []);
    this._handlers.get(gesture)!.push(handler);
  }

  /** Register a global handler called for any gesture (used by MonsterInterface core). */
  onGesture(handler: (type: string) => void): void;
  onGesture(gestureOrHandler: GestureType | ((type: string) => void), handler?: (event: GestureEvent) => void): void {
    if (typeof gestureOrHandler === 'function') {
      this._globalHandlers.push(gestureOrHandler);
    } else {
      if (!this._handlers.has(gestureOrHandler)) this._handlers.set(gestureOrHandler, []);
      this._handlers.get(gestureOrHandler)!.push(handler!);
    }
  }

  // ─── Simulate ────────────────────────────────────────────────────────────────

  /** Manually trigger a gesture event (for testing / demo). */
  triggerGesture(type: GestureType): GestureEvent {
    const event: GestureEvent = {
      type,
      confidence: +(Math.random() * 0.2 + 0.8).toFixed(3),
      timestamp:  Date.now(),
      bodyPart:   this._bodyPartForGesture(type),
      velocity:   +(Math.random() * 2).toFixed(2),
    };
    this._dispatch(event);
    return event;
  }

  // ─── Internals ───────────────────────────────────────────────────────────────

  private _detectGesture(): void {
    const now = Date.now();
    if (now - this._lastGestureAt < this.config.debounce) return;
    // Simulate occasional gesture detection
    if (Math.random() > 0.97) {
      const types = Array.from(this._bindings.keys());
      const type = types[Math.floor(Math.random() * types.length)];
      const confidence = Math.random() * 0.3 + 0.7;
      if (confidence >= this.config.sensitivity) {
        this._lastGestureAt = now;
        this._dispatch({ type, confidence, timestamp: now, bodyPart: this._bodyPartForGesture(type) });
      }
    }
  }

  private _dispatch(event: GestureEvent): void {
    (this._handlers.get(event.type) || []).forEach(h => h(event));
    this._globalHandlers.forEach(h => h(event.type));
  }

  private _bodyPartForGesture(type: GestureType): GestureEvent['bodyPart'] {
    if (type.startsWith('blink') || type === 'wink' || type.startsWith('look')) return 'eye';
    if (type === 'nod' || type === 'head_shake') return 'head';
    if (['swipe_up', 'swipe_down'].includes(type)) return 'body';
    return 'hand';
  }
}
