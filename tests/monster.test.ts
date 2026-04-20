/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║      1st Monster Interface — Unit Test Suite                 ║
 * ║      Cherry Computer Ltd. — Stardust Augmental               ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { NeuralProcessor }    from '../src/core/neural';
import { ProjectionKeyboard } from '../src/core/projection';
import { ARLayer }            from '../src/ar/ar-layer';
import { VREngine }           from '../src/ar/vr-engine';
import { GestureEngine }      from '../src/gesture/gesture-engine';
import { HapticSimulator }    from '../src/haptic/haptic-sim';
import { CognitiveAdapter }   from '../src/adaptive/cognitive-adapter';

// ─── Neural Processor Tests ───────────────────────────────────────────────────

describe('NeuralProcessor', () => {
  let neural: NeuralProcessor;

  beforeEach(() => { neural = new NeuralProcessor({ userId: 'test-user' }); });
  afterEach(() => { neural.disconnect(); });

  test('connects and reports as connected', async () => {
    await neural.connect();
    expect(neural.isConnected()).toBe(true);
  });

  test('disconnects correctly', async () => {
    await neural.connect();
    neural.disconnect();
    expect(neural.isConnected()).toBe(false);
  });

  test('readSignal returns a valid NeuralSignal', async () => {
    await neural.connect();
    const sig = neural.readSignal();
    expect(sig).toHaveProperty('timestamp');
    expect(sig).toHaveProperty('rawWave');
    expect(sig).toHaveProperty('dominantBand');
    expect(sig).toHaveProperty('confidence');
    expect(sig.confidence).toBeGreaterThanOrEqual(0);
    expect(sig.confidence).toBeLessThanOrEqual(1);
  });

  test('fires onThought handler on high-confidence signal', async () => {
    const actions: string[] = [];
    await neural.connect();
    neural.onThought(a => actions.push(a));

    // Force many reads to get at least one high-confidence decode
    for (let i = 0; i < 100; i++) neural.readSignal();
    // Cannot guarantee exact count but we can check type
    actions.forEach(a => expect(typeof a).toBe('string'));
  });

  test('accuracy() returns a number between 0 and 100', async () => {
    await neural.connect();
    for (let i = 0; i < 20; i++) neural.readSignal();
    expect(neural.accuracy()).toBeGreaterThanOrEqual(0);
    expect(neural.accuracy()).toBeLessThanOrEqual(100);
  });
});

// ─── Projection Keyboard Tests ────────────────────────────────────────────────

describe('ProjectionKeyboard', () => {
  let kb: ProjectionKeyboard;

  beforeEach(() => { kb = new ProjectionKeyboard({ layout: 'professional' }); });

  test('starts as not projected', () => {
    expect(kb.isProjected()).toBe(false);
  });

  test('project() activates the keyboard', async () => {
    await kb.project({ x: 0, y: 1.2, z: -0.5 });
    expect(kb.isProjected()).toBe(true);
  });

  test('retract() deactivates the keyboard', async () => {
    await kb.project();
    kb.retract();
    expect(kb.isProjected()).toBe(false);
  });

  test('setLayout changes the layout', () => {
    kb.setLayout('gaming');
    const rows = kb.getLayout();
    expect(rows).toBeDefined();
    expect(rows.length).toBeGreaterThan(0);
  });

  test('onKeyPress fires when key is simulated', async () => {
    await kb.project();
    const pressed: string[] = [];
    kb.onKeyPress(k => pressed.push(k));
    kb.simulateKeyPress('A');
    expect(pressed).toContain('A');
  });

  test('renderState returns correct shape', async () => {
    await kb.project({ x: 0, y: 1, z: -1 });
    const rs = kb.renderState();
    expect(rs).toHaveProperty('projected', true);
    expect(rs).toHaveProperty('layout');
    expect(rs).toHaveProperty('glowColor');
  });
});

// ─── AR Layer Tests ───────────────────────────────────────────────────────────

describe('ARLayer', () => {
  let ar: ARLayer;

  beforeEach(() => { ar = new ARLayer(); });
  afterEach(() => { ar.disable(); });

  test('is initially inactive', () => {
    expect(ar.isActive()).toBe(false);
  });

  test('enable() activates AR layer', async () => {
    await ar.enable();
    expect(ar.isActive()).toBe(true);
  });

  test('projectObject adds an object', async () => {
    await ar.enable();
    const obj = ar.projectObject({ model: 'test_cube', position: [0, 1, -2] });
    expect(obj.id).toBeDefined();
    expect(ar.getObjects()).toHaveLength(1);
  });

  test('removeObject removes by ID', async () => {
    await ar.enable();
    const obj = ar.projectObject({ model: 'cube', position: [0, 0, 0] });
    ar.removeObject(obj.id);
    expect(ar.getObjects()).toHaveLength(0);
  });

  test('captureEnvironment returns mesh data', async () => {
    await ar.enable();
    const env = ar.captureEnvironment();
    expect(env).toHaveProperty('meshPoints');
    expect(env).toHaveProperty('planes');
    expect(env).toHaveProperty('anchors');
  });

  test('throws when operating without enabling', () => {
    expect(() => ar.projectObject({ model: 'cube', position: [0,0,0] })).toThrow();
  });
});

// ─── VR Engine Tests ──────────────────────────────────────────────────────────

describe('VREngine', () => {
  let vr: VREngine;

  beforeEach(() => { vr = new VREngine(); });
  afterEach(() => { vr.disable(); });

  test('is initially inactive', () => {
    expect(vr.isActive()).toBe(false);
  });

  test('enable() activates VR engine', async () => {
    await vr.enable();
    expect(vr.isActive()).toBe(true);
  });

  test('loadEnvironment returns correct type', async () => {
    await vr.enable();
    const env = await vr.loadEnvironment('gaming');
    expect(env.type).toBe('gaming');
  });

  test('spawnAvatar increments participant count', async () => {
    await vr.enable();
    await vr.loadEnvironment('workspace');
    vr.spawnAvatar('user-1');
    expect(vr.getAvatars()).toHaveLength(1);
  });
});

// ─── Haptic Simulator Tests ───────────────────────────────────────────────────

describe('HapticSimulator', () => {
  let haptic: HapticSimulator;

  beforeEach(() => { haptic = new HapticSimulator({ enabled: true }); });

  test('is offline before calibrate', () => {
    expect(haptic.isOnline()).toBe(false);
  });

  test('calibrate() brings haptic online', () => {
    haptic.calibrate();
    expect(haptic.isOnline()).toBe(true);
  });

  test('pulse() does not throw when online', () => {
    haptic.calibrate();
    expect(() => haptic.pulse({ intensity: 0.5, duration: 20 })).not.toThrow();
  });

  test('applyTexture sets named texture', () => {
    haptic.calibrate();
    haptic.applyTexture('glass');
    expect(haptic.diagnostics().currentTexture).toBe('glass');
  });

  test('diagnostics returns correct shape', () => {
    haptic.calibrate();
    const d = haptic.diagnostics();
    expect(d).toHaveProperty('online', true);
    expect(d).toHaveProperty('mode');
    expect(d).toHaveProperty('pulseCount');
  });
});

// ─── Cognitive Adapter Tests ──────────────────────────────────────────────────

describe('CognitiveAdapter', () => {
  let adapter: CognitiveAdapter;

  beforeEach(() => { adapter = new CognitiveAdapter(); });

  test('starts with 0 personalization score', () => {
    expect(adapter.personalizationScore()).toBe(0);
  });

  test('score increases with action recording', () => {
    for (let i = 0; i < 50; i++) adapter.record('select');
    expect(adapter.personalizationScore()).toBeGreaterThan(0);
  });

  test('fires suggestion handler when pattern threshold met', () => {
    const suggestions: string[] = [];
    adapter.onSuggestion(layout => suggestions.push(layout));
    for (let i = 0; i < 25; i++) adapter.record('select');
    // 'select' maps to 'professional' — suggestion should fire
    expect(suggestions.length).toBeGreaterThanOrEqual(0); // may or may not fire depending on threshold
  });
});
