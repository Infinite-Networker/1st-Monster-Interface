/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║      1st Monster Interface — Interactive Demo Engine         ║
 * ║      Cherry Computer Ltd. — Stardust Augmental               ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

'use strict';

// ─── State ───────────────────────────────────────────────────────────────────
const state = {
  startTime:      Date.now(),
  typedText:      '',
  hapticPulses:   0,
  hapticTexture:  'NONE',
  arObjects:      3,
  cognitiveScore: 0,
  neuralAcc:      97,
  actionCount:    0,
  gestureCount:   0,
};

// ─── Neural Bands & Intents ───────────────────────────────────────────────────
const NEURAL_BANDS   = ['DELTA','THETA','ALPHA','BETA','GAMMA'];
const NEURAL_INTENTS = {
  GAMMA: ['SELECT','EXECUTE','CONFIRM'],
  BETA:  ['NAVIGATE','SCROLL','TYPE'],
  ALPHA: ['PAUSE','IDLE','REST'],
  THETA: ['RECALL','SEARCH','DREAM'],
  DELTA: ['STANDBY','SLEEP','LOW-POWER'],
};
const GESTURES = [
  'SWIPE RIGHT','SWIPE LEFT','PINCH','EXPAND','WAVE','POINT',
  'GRAB','RELEASE','NOD','WINK','FIST','OPEN PALM',
];

// ─── Keyboard Layouts ─────────────────────────────────────────────────────────
const LAYOUTS = {
  professional: [
    ['`','1','2','3','4','5','6','7','8','9','0','-','='],
    ['Q','W','E','R','T','Y','U','I','O','P','[',']'],
    ['A','S','D','F','G','H','J','K','L',';',"'"],
    ['Z','X','C','V','B','N','M',',','.','/'],
    ['SPACE'],
  ],
  gaming: [
    ['ESC','F1','F2','F3','F4','F5'],
    ['TAB','Q','W','E','R','T'],
    ['CAPS','A','S','D','F','G'],
    ['SHIFT','Z','X','C','V'],
    ['CTRL','ALT','SPACE','↵'],
  ],
  casual: [
    ['Q','W','E','R','T','Y','U','I','O','P'],
    ['A','S','D','F','G','H','J','K','L'],
    ['Z','X','C','V','B','N','M'],
    ['SPACE','⌫'],
  ],
  creative: [
    ['PEN','BRUSH','ERASER','FILL','SELECT'],
    ['UNDO','REDO','LAYER+','LAYER-','BLEND'],
    ['ZOOM+','ZOOM-','FIT','ROTATE','FLIP'],
    ['COLOR','GRADIENT','SPACE'],
  ],
};

// ─── Neural Waveform ──────────────────────────────────────────────────────────
const neuralCanvas = document.getElementById('neuralCanvas');
const nCtx         = neuralCanvas.getContext('2d');
const waveData     = new Array(neuralCanvas.width).fill(0);
let  neuralOffset  = 0;

function drawNeural() {
  neuralCanvas.width = neuralCanvas.offsetWidth;
  const w = neuralCanvas.width, h = neuralCanvas.height;
  nCtx.clearRect(0, 0, w, h);

  // Background grid
  nCtx.strokeStyle = 'rgba(0,229,255,0.05)';
  nCtx.lineWidth = 1;
  for (let x = 0; x < w; x += 40) {
    nCtx.beginPath(); nCtx.moveTo(x, 0); nCtx.lineTo(x, h); nCtx.stroke();
  }
  for (let y = 0; y < h; y += 20) {
    nCtx.beginPath(); nCtx.moveTo(0, y); nCtx.lineTo(w, y); nCtx.stroke();
  }

  // Update waveform data
  waveData.shift();
  const amp = 28 + Math.sin(Date.now() / 300) * 12;
  waveData.push((Math.random() - 0.5) * amp * 2 + Math.sin(neuralOffset * 0.1) * 10);
  neuralOffset++;

  // Draw waveform
  const grad = nCtx.createLinearGradient(0, 0, w, 0);
  grad.addColorStop(0,   'rgba(0,229,255,0)');
  grad.addColorStop(0.2, '#00e5ff');
  grad.addColorStop(0.8, '#7c4dff');
  grad.addColorStop(1,   'rgba(124,77,255,0)');

  nCtx.beginPath();
  nCtx.strokeStyle = grad;
  nCtx.lineWidth   = 2;
  nCtx.shadowColor = '#00e5ff';
  nCtx.shadowBlur  = 8;
  const step = w / waveData.length;
  waveData.forEach((v, i) => {
    const x = i * step, y = h / 2 + v;
    i === 0 ? nCtx.moveTo(x, y) : nCtx.lineTo(x, y);
  });
  nCtx.stroke();
  nCtx.shadowBlur = 0;
}

// ─── AR Viewport ──────────────────────────────────────────────────────────────
const arCanvas = document.getElementById('arCanvas');
const aCtx     = arCanvas.getContext('2d');
const arObjects = [
  { x: 0.3, y: 0.4, vx: 0.003, vy: 0.002, r: 28, label: 'HOLOGRAM_CUBE', color: '#7c4dff' },
  { x: 0.6, y: 0.3, vx: -0.002, vy: 0.004, r: 20, label: 'DATA_NODE',    color: '#00e5ff' },
  { x: 0.7, y: 0.65, vx: 0.004, vy: -0.003, r: 16, label: 'ANCHOR_PT',  color: '#f50057' },
];

function drawAR() {
  arCanvas.width  = arCanvas.offsetWidth;
  arCanvas.height = arCanvas.offsetHeight || 220;
  const w = arCanvas.width, h = arCanvas.height;
  aCtx.clearRect(0, 0, w, h);

  // Grid mesh
  aCtx.strokeStyle = 'rgba(124,77,255,0.08)';
  aCtx.lineWidth = 1;
  for (let x = 0; x < w; x += 32) {
    aCtx.beginPath(); aCtx.moveTo(x,0); aCtx.lineTo(x,h); aCtx.stroke();
  }
  for (let y = 0; y < h; y += 32) {
    aCtx.beginPath(); aCtx.moveTo(0,y); aCtx.lineTo(w,y); aCtx.stroke();
  }

  // AR objects
  arObjects.forEach(obj => {
    obj.x += obj.vx; obj.y += obj.vy;
    if (obj.x < 0.1 || obj.x > 0.9) obj.vx *= -1;
    if (obj.y < 0.1 || obj.y > 0.9) obj.vy *= -1;

    const cx = obj.x * w, cy = obj.y * h;

    // Glow ring
    const grad = aCtx.createRadialGradient(cx, cy, 0, cx, cy, obj.r * 2);
    grad.addColorStop(0, obj.color + '30');
    grad.addColorStop(1, 'transparent');
    aCtx.fillStyle = grad;
    aCtx.beginPath();
    aCtx.arc(cx, cy, obj.r * 2, 0, Math.PI * 2);
    aCtx.fill();

    // Object circle
    aCtx.strokeStyle = obj.color;
    aCtx.lineWidth   = 2;
    aCtx.shadowColor = obj.color;
    aCtx.shadowBlur  = 12;
    aCtx.beginPath();
    aCtx.arc(cx, cy, obj.r, 0, Math.PI * 2);
    aCtx.stroke();

    // Label
    aCtx.shadowBlur = 0;
    aCtx.fillStyle  = obj.color;
    aCtx.font       = '9px "Share Tech Mono"';
    aCtx.textAlign  = 'center';
    aCtx.fillText(obj.label, cx, cy + obj.r + 14);

    // Crosshair
    aCtx.strokeStyle = obj.color + '60';
    aCtx.lineWidth = 1;
    [-1, 1].forEach(s => {
      aCtx.beginPath();
      aCtx.moveTo(cx + s * (obj.r + 4), cy);
      aCtx.lineTo(cx + s * (obj.r + 10), cy);
      aCtx.stroke();
      aCtx.beginPath();
      aCtx.moveTo(cx, cy + s * (obj.r + 4));
      aCtx.lineTo(cx, cy + s * (obj.r + 10));
      aCtx.stroke();
    });
  });
}

// ─── Gesture Canvas ───────────────────────────────────────────────────────────
const gestureCanvas = document.getElementById('gestureCanvas');
const gCtx          = gestureCanvas.getContext('2d');
let   gesturePoints = [];

function drawGesture() {
  gestureCanvas.width  = gestureCanvas.offsetWidth;
  gestureCanvas.height = gestureCanvas.offsetHeight || 200;
  const w = gestureCanvas.width, h = gestureCanvas.height;
  gCtx.clearRect(0, 0, w, h);

  // Silhouette hand skeleton
  const cx = w * 0.5, cy = h * 0.72;
  const t  = Date.now() / 800;

  // Palm
  gCtx.fillStyle = 'rgba(245,0,87,0.08)';
  gCtx.beginPath();
  gCtx.ellipse(cx, cy, 38, 30, 0, 0, Math.PI*2);
  gCtx.fill();

  // Fingers
  const fingers = [
    {angle: -0.6, len: 55}, {angle: -0.2, len: 65},
    {angle:  0.1, len: 62}, {angle:  0.4, len: 55},
    {angle:  0.8, len: 38},
  ];
  fingers.forEach((f, i) => {
    const wave = Math.sin(t + i) * 4;
    const x2   = cx + Math.cos(-Math.PI/2 + f.angle) * (f.len + wave);
    const y2   = cy + Math.sin(-Math.PI/2 + f.angle) * (f.len + wave);

    gCtx.strokeStyle = '#f50057';
    gCtx.lineWidth   = 3;
    gCtx.shadowColor = '#f50057';
    gCtx.shadowBlur  = 8;
    gCtx.beginPath();
    gCtx.moveTo(cx + Math.cos(-Math.PI/2 + f.angle) * 20, cy + Math.sin(-Math.PI/2 + f.angle) * 20);
    gCtx.lineTo(x2, y2);
    gCtx.stroke();

    gCtx.fillStyle = '#f50057';
    gCtx.beginPath();
    gCtx.arc(x2, y2, 4, 0, Math.PI*2);
    gCtx.fill();
  });
  gCtx.shadowBlur = 0;

  // Tracking points
  gesturePoints = gesturePoints.filter(p => Date.now() - p.t < 1200);
  gesturePoints.forEach(p => {
    const age = (Date.now() - p.t) / 1200;
    gCtx.fillStyle = `rgba(245,0,87,${1 - age})`;
    gCtx.beginPath();
    gCtx.arc(p.x, p.y, 4 * (1 - age), 0, Math.PI * 2);
    gCtx.fill();
  });
}

// ─── Keyboard Render ──────────────────────────────────────────────────────────
let currentLayout = 'professional';

function renderKeyboard(layout) {
  currentLayout = layout;
  const container = document.getElementById('keyboard-render');
  container.innerHTML = '';
  const rows = LAYOUTS[layout];
  rows.forEach(row => {
    const rowEl = document.createElement('div');
    rowEl.className = 'kb-row';
    row.forEach(key => {
      const keyEl = document.createElement('div');
      keyEl.className = 'kb-key' + (key === 'SPACE' ? ' space' : '');
      keyEl.textContent = key;
      keyEl.addEventListener('click', () => pressKey(key, keyEl));
      rowEl.appendChild(keyEl);
    });
    container.appendChild(rowEl);
  });
}

function pressKey(key, el) {
  el.classList.add('pressed');
  setTimeout(() => el.classList.remove('pressed'), 150);

  if (key === 'SPACE') { state.typedText += ' '; }
  else if (key === '⌫') { state.typedText = state.typedText.slice(0, -1); }
  else if (key.length === 1) { state.typedText += key; }
  if (state.typedText.length > 60) state.typedText = state.typedText.slice(-60);

  document.getElementById('typed-text').textContent = state.typedText + '|';
  state.hapticPulses++;
  document.getElementById('haptic-pulses').textContent = state.hapticPulses;
  addAction(`key:${key}`);
}

// ─── Layout Switcher ─────────────────────────────────────────────────────────
document.querySelectorAll('.layout-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.layout-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderKeyboard(btn.dataset.layout);
  });
});

// ─── Haptic Controls ──────────────────────────────────────────────────────────
function triggerHaptic(type) {
  state.hapticPulses++;
  document.getElementById('haptic-pulses').textContent = state.hapticPulses;
  addAction(`haptic:${type}`);
  // Visual flash
  document.querySelectorAll(`.haptic-btn[data-haptic="${type}"]`).forEach(btn => {
    btn.style.boxShadow = '0 0 20px #00e5ff';
    setTimeout(() => btn.style.boxShadow = '', 300);
  });
}

function applyTexture(tex) {
  state.hapticTexture = tex.toUpperCase();
  document.getElementById('haptic-texture').textContent = state.hapticTexture;
  addAction(`haptic:texture:${tex}`);
  document.querySelectorAll(`.haptic-btn[data-tex="${tex}"]`).forEach(btn => {
    btn.style.boxShadow = '0 0 20px #7c4dff';
    setTimeout(() => btn.style.boxShadow = '', 300);
  });
}

// ─── Neural Updates ───────────────────────────────────────────────────────────
function updateNeural() {
  const band      = NEURAL_BANDS[Math.floor(Math.random() * NEURAL_BANDS.length)];
  const intents   = NEURAL_INTENTS[band];
  const intent    = intents[Math.floor(Math.random() * intents.length)];
  const conf      = Math.floor(Math.random() * 15 + 82);
  state.neuralAcc = Math.min(99, Math.max(80, state.neuralAcc + (Math.random() - 0.5) * 2));

  document.getElementById('neural-band').textContent  = band;
  document.getElementById('neural-conf').textContent  = conf + '%';
  document.getElementById('neural-intent').textContent = intent;
  document.getElementById('neural-acc').textContent   = Math.round(state.neuralAcc) + '%';
  document.getElementById('stat-neural-acc').textContent = Math.round(state.neuralAcc) + '%';
  document.getElementById('last-thought').textContent = `» Neural decoded: [${band}] → "${intent}" (${conf}% confidence)`;
}

// ─── Gesture Log ─────────────────────────────────────────────────────────────
function addGestureLog(gesture) {
  const log  = document.getElementById('gesture-log');
  const entry = document.createElement('div');
  entry.className = 'gesture-entry';
  entry.textContent = `» ${gesture} detected`;
  log.insertBefore(entry, log.firstChild);
  while (log.children.length > 8) log.removeChild(log.lastChild);
  addAction(`gesture:${gesture}`);

  // Add tracking point
  const gc = gestureCanvas;
  gesturePoints.push({
    x: Math.random() * gc.offsetWidth,
    y: Math.random() * gc.offsetHeight,
    t: Date.now(),
  });
}

// ─── Action Log ──────────────────────────────────────────────────────────────
function addAction(action) {
  state.actionCount++;
  state.cognitiveScore = Math.min(100, Math.floor(state.actionCount / 2));
  document.getElementById('stat-cognitive').textContent = state.cognitiveScore;
  document.getElementById('stat-ar-obj').textContent   = state.arObjects;

  const log = document.getElementById('action-log');
  const entry = document.createElement('div');
  entry.className = 'log-entry';
  const now = new Date();
  entry.innerHTML = `<span class="log-time">${now.toTimeString().slice(0,8)}</span><span class="log-action">${action}</span>`;
  log.insertBefore(entry, log.children[1]);
  while (log.children.length > 12) log.removeChild(log.lastChild);
}

// ─── Uptime ──────────────────────────────────────────────────────────────────
function updateUptime() {
  const ms  = Date.now() - state.startTime;
  const s   = Math.floor(ms / 1000);
  const hh  = String(Math.floor(s / 3600)).padStart(2, '0');
  const mm  = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
  const ss  = String(s % 60).padStart(2, '0');
  document.getElementById('uptime').textContent = `${hh}:${mm}:${ss}`;
}

// ─── Gauge Animations ─────────────────────────────────────────────────────────
function updateGauges() {
  const rand = (min, max) => Math.floor(Math.random() * (max - min) + min);
  document.getElementById('g-neural').style.width  = rand(65, 95) + '%';
  document.getElementById('g-ar').style.width      = rand(50, 80) + '%';
  document.getElementById('g-vr').style.width      = rand(35, 65) + '%';
  document.getElementById('g-gesture').style.width = rand(80, 99) + '%';
}

// ─── AR Stats ─────────────────────────────────────────────────────────────────
function updateARStats() {
  document.getElementById('ar-mesh').textContent    = (Math.floor(Math.random() * 3000) + 11000).toLocaleString();
  document.getElementById('ar-anchors').textContent = Math.floor(Math.random() * 5) + 7;
  document.getElementById('ar-objects').textContent = state.arObjects;
}

// ─── Main Loop ────────────────────────────────────────────────────────────────
function loop() {
  drawNeural();
  drawAR();
  drawGesture();
  requestAnimationFrame(loop);
}

// ─── Timed Events ─────────────────────────────────────────────────────────────
setInterval(updateUptime, 1000);
setInterval(updateGauges, 1500);
setInterval(updateNeural, 2200);
setInterval(updateARStats, 3000);
setInterval(() => {
  const g = GESTURES[Math.floor(Math.random() * GESTURES.length)];
  addGestureLog(g);
}, 3500);

// ─── Boot ────────────────────────────────────────────────────────────────────
renderKeyboard('professional');
loop();
updateNeural();
addAction('system:boot');
console.log('%c1st Monster Interface', 'color:#00e5ff;font-size:24px;font-weight:bold;font-family:monospace');
console.log('%cCherry Computer Ltd. — Stardust Augmental v1.0.0', 'color:#7c4dff;font-family:monospace');
