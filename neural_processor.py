"""
╔══════════════════════════════════════════════════════════════════╗
║         1st Monster Interface — Python Neural Processor          ║
║         Cherry Computer Ltd. — Stardust Augmental                ║
╚══════════════════════════════════════════════════════════════════╝

Python implementation of the 1st Monster Interface Neural Processing
pipeline. Handles BCI signal simulation, EEG band classification,
thought-to-action decoding, and session analytics.

Author:  Cherry Computer Ltd.
Version: 1.0.0
License: MIT
"""

from __future__ import annotations

import time
import random
import math
import json
from dataclasses import dataclass, field, asdict
from typing import Callable, Optional
from enum import Enum


# ─── Enums ────────────────────────────────────────────────────────────────────

class NeuralBand(str, Enum):
    DELTA = "delta"    # 0.5–4 Hz   — deep sleep / standby
    THETA = "theta"    # 4–8 Hz     — recall / search
    ALPHA = "alpha"    # 8–13 Hz    — idle / relaxed
    BETA  = "beta"     # 13–30 Hz   — navigate / type
    GAMMA = "gamma"    # 30–100 Hz  — select / execute


class MonsterLayout(str, Enum):
    PROFESSIONAL = "professional"
    GAMING       = "gaming"
    CASUAL       = "casual"
    CREATIVE     = "creative"


# ─── Band → Action Mapping ────────────────────────────────────────────────────

BAND_ACTIONS: dict[NeuralBand, list[str]] = {
    NeuralBand.GAMMA: ["select", "confirm", "execute", "activate"],
    NeuralBand.BETA:  ["navigate", "scroll", "type", "edit"],
    NeuralBand.ALPHA: ["pause", "idle", "meditate", "breathe"],
    NeuralBand.THETA: ["recall", "search", "dream", "visualise"],
    NeuralBand.DELTA: ["sleep-mode", "standby", "low-power"],
}


# ─── Data Classes ─────────────────────────────────────────────────────────────

@dataclass
class NeuralSignal:
    """A single EEG-like signal snapshot from the Stardust Augmental BCI."""
    timestamp:      float
    raw_wave:       list[float]
    dominant_band:  NeuralBand
    confidence:     float           # 0.0 – 1.0
    decoded_intent: Optional[str]   = None

    def to_dict(self) -> dict:
        d = asdict(self)
        d["dominant_band"] = self.dominant_band.value
        return d


@dataclass
class SessionStats:
    """Accumulated neural session analytics."""
    user_id:          str
    session_start:    float         = field(default_factory=time.time)
    total_signals:    int           = 0
    decoded_signals:  int           = 0
    band_counts:      dict          = field(default_factory=dict)
    top_intent:       Optional[str] = None
    intent_counts:    dict          = field(default_factory=dict)

    @property
    def accuracy(self) -> float:
        if self.total_signals == 0:
            return 0.0
        return round(self.decoded_signals / self.total_signals, 4)

    @property
    def uptime_seconds(self) -> float:
        return round(time.time() - self.session_start, 2)

    def record(self, signal: NeuralSignal) -> None:
        self.total_signals += 1
        band = signal.dominant_band.value
        self.band_counts[band] = self.band_counts.get(band, 0) + 1
        if signal.decoded_intent:
            self.decoded_signals += 1
            self.intent_counts[signal.decoded_intent] = (
                self.intent_counts.get(signal.decoded_intent, 0) + 1
            )
            self.top_intent = max(self.intent_counts, key=self.intent_counts.get)


# ─── NeuralProcessor ─────────────────────────────────────────────────────────

class NeuralProcessor:
    """
    1st Monster Interface — Neural Processor
    ────────────────────────────────────────
    Simulates EEG signal reading, band classification, and thought-to-action
    decoding for the Cherry Computer Stardust Augmental platform.

    Example usage:
        proc = NeuralProcessor(user_id="alice", sensitivity=0.88)
        proc.on_thought(lambda action: print(f"Action: {action}"))
        proc.connect()

        for _ in range(20):
            sig = proc.read_signal()
            print(sig.to_dict())
            time.sleep(0.1)

        proc.disconnect()
        print(proc.stats)
    """

    def __init__(
        self,
        user_id:     str   = "anonymous",
        sensitivity: float = 0.90,
        frequency:   int   = 256,          # samples per second
        cognitive_filter: bool = True,
    ) -> None:
        self.user_id          = user_id
        self.sensitivity      = sensitivity
        self.frequency        = frequency
        self.cognitive_filter = cognitive_filter

        self._connected: bool = False
        self._thought_handlers: list[Callable[[str], None]] = []
        self._stats = SessionStats(user_id=user_id)

    # ─── Connection ─────────────────────────────────────────────────────────

    def connect(self, timeout: float = 2.0) -> bool:
        """Establish BCI link to Stardust Augmental hardware (simulated)."""
        print(f"[Neural] 🧠 Connecting BCI for user '{self.user_id}'...")
        time.sleep(min(timeout, 0.15))          # Simulated handshake
        self._connected = True
        self._stats.session_start = time.time()
        print(f"[Neural] ✅ Connected @ {self.frequency}Hz | sensitivity={self.sensitivity}")
        return True

    def disconnect(self) -> None:
        self._connected = False
        print(f"[Neural] 🔌 Disconnected. Session uptime: {self._stats.uptime_seconds}s")

    @property
    def is_connected(self) -> bool:
        return self._connected

    # ─── Signal Reading ─────────────────────────────────────────────────────

    def read_signal(self) -> NeuralSignal:
        """Read and decode a single EEG signal snapshot."""
        if not self._connected:
            raise RuntimeError("[Neural] Not connected. Call connect() first.")

        band       = random.choice(list(NeuralBand))
        confidence = round(random.uniform(0.55, 0.99), 3)
        raw_wave   = self._generate_wave(band)
        intent     = self._decode(band, confidence)

        signal = NeuralSignal(
            timestamp      = time.time(),
            raw_wave       = raw_wave,
            dominant_band  = band,
            confidence     = confidence,
            decoded_intent = intent,
        )

        self._stats.record(signal)

        if intent and confidence >= self.sensitivity:
            for handler in self._thought_handlers:
                handler(intent)

        return signal

    def read_burst(self, count: int = 32) -> list[NeuralSignal]:
        """Read a burst of N signals."""
        return [self.read_signal() for _ in range(count)]

    # ─── Event Handlers ──────────────────────────────────────────────────────

    def on_thought(self, handler: Callable[[str], None]) -> None:
        """Register a callback fired when a thought-action is decoded."""
        self._thought_handlers.append(handler)

    # ─── Stats ───────────────────────────────────────────────────────────────

    @property
    def stats(self) -> SessionStats:
        return self._stats

    def summary(self) -> str:
        s = self._stats
        return (
            f"\n{'═'*50}\n"
            f"  1st Monster Neural Session Summary\n"
            f"  Cherry Computer Ltd.\n"
            f"{'─'*50}\n"
            f"  User:          {s.user_id}\n"
            f"  Uptime:        {s.uptime_seconds}s\n"
            f"  Total Signals: {s.total_signals}\n"
            f"  Decoded:       {s.decoded_signals}\n"
            f"  Accuracy:      {s.accuracy * 100:.1f}%\n"
            f"  Top Intent:    {s.top_intent or 'N/A'}\n"
            f"  Band Counts:   {json.dumps(s.band_counts)}\n"
            f"{'═'*50}"
        )

    # ─── Internals ───────────────────────────────────────────────────────────

    def _generate_wave(self, band: NeuralBand) -> list[float]:
        """Generate a synthetic EEG waveform for the given frequency band."""
        freq_map = {
            NeuralBand.DELTA: 2,
            NeuralBand.THETA: 6,
            NeuralBand.ALPHA: 10,
            NeuralBand.BETA:  20,
            NeuralBand.GAMMA: 50,
        }
        f    = freq_map[band]
        n    = 64
        wave = []
        for i in range(n):
            t     = i / self.frequency
            noise = random.gauss(0, 0.08) if self.cognitive_filter else random.uniform(-0.2, 0.2)
            val   = math.sin(2 * math.pi * f * t) * 0.7 + noise
            wave.append(round(val, 4))
        return wave

    def _decode(self, band: NeuralBand, confidence: float) -> Optional[str]:
        """Classify band + confidence into a device action string."""
        if confidence < self.sensitivity:
            return None
        actions = BAND_ACTIONS.get(band, [])
        return random.choice(actions) if actions else None


# ─── CognitiveAdapter ────────────────────────────────────────────────────────

class CognitiveAdapter:
    """
    Lightweight online adaptive learner that monitors action patterns
    and recommends interface layout changes to the 1st Monster.
    """

    ACTION_LAYOUT_MAP: dict[str, MonsterLayout] = {
        "select":    MonsterLayout.PROFESSIONAL,
        "execute":   MonsterLayout.GAMING,
        "navigate":  MonsterLayout.PROFESSIONAL,
        "type":      MonsterLayout.CASUAL,
        "recall":    MonsterLayout.PROFESSIONAL,
        "visualise": MonsterLayout.CREATIVE,
        "dream":     MonsterLayout.CREATIVE,
        "activate":  MonsterLayout.GAMING,
    }

    def __init__(self, window_size: int = 100, threshold: float = 0.30) -> None:
        self.window_size = window_size
        self.threshold   = threshold
        self._history:  list[str] = []
        self._handlers: list[Callable[[MonsterLayout], None]] = []

    def record(self, action: str) -> None:
        self._history.append(action)
        if len(self._history) > self.window_size:
            self._history.pop(0)
        self._analyze()

    def on_suggestion(self, handler: Callable[[MonsterLayout], None]) -> None:
        self._handlers.append(handler)

    @property
    def personalization_score(self) -> int:
        n = len(self._history)
        if n == 0:
            return 0
        unique    = len(set(self._history))
        diversity = 1 - (unique / n)
        return min(int(diversity * 100 + (n / self.window_size) * 20), 100)

    def _analyze(self) -> None:
        if len(self._history) < 20:
            return
        counts: dict[str, int] = {}
        for a in self._history:
            counts[a] = counts.get(a, 0) + 1
        total = len(self._history)
        for action, count in counts.items():
            if count / total >= self.threshold:
                layout = self.ACTION_LAYOUT_MAP.get(action)
                if layout:
                    for h in self._handlers:
                        h(layout)
                    break


# ─── CLI Demo ─────────────────────────────────────────────────────────────────

def run_demo() -> None:
    print("╔══════════════════════════════════════════════╗")
    print("║   1st Monster Interface — Neural Demo        ║")
    print("║   Cherry Computer Ltd.                       ║")
    print("╚══════════════════════════════════════════════╝\n")

    proc    = NeuralProcessor(user_id="demo_user", sensitivity=0.85)
    adapter = CognitiveAdapter()

    adapter.on_suggestion(
        lambda layout: print(f"[Cognitive] 🧩 Suggested layout: {layout.value}")
    )
    proc.on_thought(lambda action: adapter.record(action))

    proc.connect()

    print("\n── Reading 30 neural signals ──\n")
    for i in range(30):
        sig = proc.read_signal()
        bar = "█" * int(sig.confidence * 20)
        print(
            f"  [{i+1:02d}] {sig.dominant_band.value.upper():6s} "
            f"| {bar:<20s} {sig.confidence:.2f} "
            f"| → {sig.decoded_intent or '—'}"
        )
        time.sleep(0.05)

    proc.disconnect()
    print(proc.summary())
    print(f"\n  Personalization Score: {adapter.personalization_score}/100")


if __name__ == "__main__":
    run_demo()
