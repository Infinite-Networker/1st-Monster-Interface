/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║    1st Monster Interface — Cognitive Adaptive Learning AI    ║
 * ║    Cherry Computer Ltd. — Stardust Augmental                 ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * The Cognitive Adapter observes user behaviour patterns and continuously
 * optimises the interface — suggesting layout changes, shortcut adjustments,
 * and neural calibration updates to maximize efficiency and comfort.
 *
 * @author  Cherry Computer Ltd.
 * @version 1.0.0
 */

import type { MonsterLayout } from '../core/monster';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AdapterConfig {
  learning?: boolean;
  windowSize?: number;        // Actions to consider for pattern analysis
  suggestionThreshold?: number; // Pattern frequency before suggesting (0–1)
}

export interface UserPattern {
  action: string;
  count: number;
  lastSeen: number;
  frequency: number;          // occurrences per minute
}

export interface AdaptiveSuggestion {
  type: 'layout' | 'shortcut' | 'neural_calibration';
  value: string;
  reason: string;
  confidence: number;
}

// ─── Action → Layout affinity map ────────────────────────────────────────────
const ACTION_LAYOUT_AFFINITY: Record<string, MonsterLayout> = {
  'gesture:swipe_right': 'gaming',
  'gesture:fist':        'gaming',
  'gesture:grab':        'gaming',
  'key:F1':              'gaming',
  'key:ESC':             'gaming',
  'ar:interact':         'creative',
  'key:PEN':             'creative',
  'key:BRUSH':           'creative',
  'key:LAYER+':          'creative',
  'select':              'professional',
  'navigate':            'professional',
  'recall':              'professional',
};

// ─── CognitiveAdapter ────────────────────────────────────────────────────────

/**
 * CognitiveAdapter
 * ────────────────
 * Implements a lightweight online learning system that tracks user action
 * frequency, detects dominant usage patterns, and proactively suggests
 * interface adaptations to personalise the 1st Monster experience.
 */
export class CognitiveAdapter {
  private config: Required<AdapterConfig>;
  private _patterns: Map<string, UserPattern> = new Map();
  private _actionHistory: string[] = [];
  private _suggestionHandlers: Array<(layout: MonsterLayout) => void> = [];
  private _sessionStart: number = Date.now();
  private _suggestionsSent: Set<string> = new Set();

  constructor(config: AdapterConfig = {}) {
    this.config = {
      learning:            config.learning            ?? true,
      windowSize:          config.windowSize          ?? 200,
      suggestionThreshold: config.suggestionThreshold ?? 0.35,
    };
  }

  // ─── Recording ───────────────────────────────────────────────────────────────

  /** Record a user action for pattern analysis. */
  record(action: string): void {
    if (!this.config.learning) return;

    // Update history ring buffer
    this._actionHistory.push(action);
    if (this._actionHistory.length > this.config.windowSize) {
      this._actionHistory.shift();
    }

    // Update pattern map
    const elapsed = (Date.now() - this._sessionStart) / 60000; // minutes
    if (!this._patterns.has(action)) {
      this._patterns.set(action, { action, count: 0, lastSeen: 0, frequency: 0 });
    }
    const p = this._patterns.get(action)!;
    p.count++;
    p.lastSeen = Date.now();
    p.frequency = elapsed > 0 ? p.count / elapsed : 0;

    this._analyze();
  }

  // ─── Suggestions ─────────────────────────────────────────────────────────────

  /** Register handler called when the adapter suggests a layout change. */
  onSuggestion(handler: (layout: MonsterLayout) => void): void {
    this._suggestionHandlers.push(handler);
  }

  /** Get the full list of detected patterns, sorted by frequency. */
  getPatterns(): UserPattern[] {
    return Array.from(this._patterns.values())
      .sort((a, b) => b.frequency - a.frequency);
  }

  /** Current personalization score (0–100). */
  personalizationScore(): number {
    const total = this._actionHistory.length;
    if (total === 0) return 0;
    const unique = new Set(this._actionHistory).size;
    const diversity = 1 - (unique / total);
    return Math.min(Math.round(diversity * 100 + (total / this.config.windowSize) * 20), 100);
  }

  // ─── Generate Suggestions ────────────────────────────────────────────────────

  generateSuggestion(): AdaptiveSuggestion | null {
    const patterns = this.getPatterns();
    if (!patterns.length) return null;

    const topAction = patterns[0].action;
    const layout    = ACTION_LAYOUT_AFFINITY[topAction];
    if (!layout) return null;

    return {
      type:       'layout',
      value:      layout,
      reason:     `Dominant action pattern: "${topAction}" (${patterns[0].count}x)`,
      confidence: Math.min(patterns[0].frequency / 10, 1),
    };
  }

  // ─── Internals ───────────────────────────────────────────────────────────────

  private _analyze(): void {
    const window    = this._actionHistory;
    const total     = window.length;
    if (total < 20) return;

    // Count action frequencies in the current window
    const freq: Record<string, number> = {};
    window.forEach(a => { freq[a] = (freq[a] ?? 0) + 1; });

    for (const [action, count] of Object.entries(freq)) {
      const ratio = count / total;
      if (ratio >= this.config.suggestionThreshold) {
        const layout = ACTION_LAYOUT_AFFINITY[action];
        if (layout && !this._suggestionsSent.has(layout)) {
          this._suggestionsSent.add(layout);
          console.log(`[Cognitive] 🧩 Suggesting layout "${layout}" (action "${action}" = ${Math.round(ratio * 100)}% of window)`);
          this._suggestionHandlers.forEach(h => h(layout));
        }
      }
    }
  }
}
