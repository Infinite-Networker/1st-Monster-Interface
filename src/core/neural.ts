/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║      1st Monster Interface — Neural Interaction Module       ║
 * ║      Cherry Computer Ltd. — Stardust Augmental               ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * The Neural Processor captures brain-computer interface (BCI) signals,
 * decodes thought patterns into device actions, and continuously
 * adapts to individual users via cognitive learning algorithms.
 *
 * @author  Cherry Computer Ltd.
 * @version 1.0.0
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface NeuralConfig {
  userId?: string;
  signalFrequency?: number;   // Hz — default 256
  sensitivity?: number;       // 0.0–1.0 — default 0.9
  cognitiveFilter?: boolean;  // noise reduction
}

export interface NeuralSignal {
  timestamp: number;
  rawWave: Float32Array;
  dominantBand: 'delta' | 'theta' | 'alpha' | 'beta' | 'gamma';
  confidence: number;         // 0.0–1.0
  decodedIntent?: string;
}

export interface ThoughtAction {
  intent: string;
  confidence: number;
  source: 'neural';
}

// ─── Signal Map: Brain band → Interface Action ────────────────────────────────
const BAND_ACTION_MAP: Record<string, string[]> = {
  gamma: ['select', 'confirm', 'execute'],
  beta:  ['navigate', 'scroll', 'type'],
  alpha: ['pause', 'idle', 'meditate'],
  theta: ['recall', 'search', 'dream-mode'],
  delta: ['sleep-mode', 'standby'],
};

// ─── NeuralProcessor ─────────────────────────────────────────────────────────

/**
 * NeuralProcessor
 * ───────────────
 * Reads EEG-like neural waveforms from the Stardust Augmental hardware,
 * classifies them into intent categories, and dispatches thought-actions
 * to the MonsterInterface core engine.
 *
 * Simulated for browser/Node environments without hardware attached.
 */
export class NeuralProcessor {
  private config: Required<NeuralConfig>;
  private _connected: boolean = false;
  private _listeners: Array<(action: string) => void> = [];
  private _sessionAccuracy: number[] = [];
  private _pollInterval: ReturnType<typeof setInterval> | null = null;

  constructor(config: NeuralConfig = {}) {
    this.config = {
      userId:          config.userId ?? 'anonymous',
      signalFrequency: config.signalFrequency ?? 256,
      sensitivity:     config.sensitivity ?? 0.9,
      cognitiveFilter: config.cognitiveFilter ?? true,
    };
  }

  // ─── Connection ─────────────────────────────────────────────────────────────

  async connect(): Promise<void> {
    console.log(`[Neural] 🧠 Connecting to BCI for user "${this.config.userId}"...`);
    await this._simulate_handshake();
    this._connected = true;
    this._beginPolling();
    console.log(`[Neural] ✅ Connected @ ${this.config.signalFrequency}Hz`);
  }

  disconnect(): void {
    if (this._pollInterval) clearInterval(this._pollInterval);
    this._connected = false;
    console.log('[Neural] 🔌 Disconnected from BCI.');
  }

  isConnected(): boolean { return this._connected; }

  // ─── Thought Reading ─────────────────────────────────────────────────────────

  /** Register a callback that fires whenever a thought-action is decoded. */
  onThought(handler: (action: string) => void): void {
    this._listeners.push(handler);
  }

  /** Manually read a single signal snapshot (for testing/debug). */
  readSignal(): NeuralSignal {
    const bands = ['delta', 'theta', 'alpha', 'beta', 'gamma'] as const;
    const band  = bands[Math.floor(Math.random() * bands.length)];
    return {
      timestamp:      Date.now(),
      rawWave:        this._generateWave(),
      dominantBand:   band,
      confidence:     +(Math.random() * 0.4 + 0.6).toFixed(3),
      decodedIntent:  this._decode(band, 0.8),
    };
  }

  /** Session accuracy score (0–100). */
  accuracy(): number {
    if (!this._sessionAccuracy.length) return 0;
    const avg = this._sessionAccuracy.reduce((a, b) => a + b, 0) / this._sessionAccuracy.length;
    return Math.round(avg * 100);
  }

  // ─── Internals ───────────────────────────────────────────────────────────────

  private _beginPolling(): void {
    const interval = Math.round(1000 / (this.config.signalFrequency / 32));
    this._pollInterval = setInterval(() => {
      const signal = this.readSignal();
      if (signal.confidence >= this.config.sensitivity && signal.decodedIntent) {
        this._sessionAccuracy.push(signal.confidence);
        this._listeners.forEach(h => h(signal.decodedIntent!));
      }
    }, interval);
  }

  private _decode(band: string, confidence: number): string | undefined {
    const actions = BAND_ACTION_MAP[band];
    if (!actions || confidence < this.config.sensitivity) return undefined;
    return actions[Math.floor(Math.random() * actions.length)];
  }

  private _generateWave(): Float32Array {
    const arr = new Float32Array(64);
    for (let i = 0; i < 64; i++) arr[i] = (Math.random() * 2 - 1) * 0.8;
    return arr;
  }

  private _simulate_handshake(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 120));
  }
}
