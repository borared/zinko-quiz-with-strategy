"""Generate cartoon prize-wheel SFX that match Zinko's funk / kids-game vibe."""
from __future__ import annotations

import math
import os
import random
import struct
import subprocess
import tempfile
import wave

SR = 44100
OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "audio")


def clamp(x: float, lo: float = -1.0, hi: float = 1.0) -> float:
    return lo if x < lo else hi if x > hi else x


def bezier_ease(t: float, x1: float, y1: float, x2: float, y2: float) -> float:
    """Solve cubic-bezier x(u)=t, return y(u). Matches CSS cubic-bezier()."""

    def bx(u: float) -> float:
        return 3 * (1 - u) * (1 - u) * u * x1 + 3 * (1 - u) * u * u * x2 + u * u * u

    def by(u: float) -> float:
        return 3 * (1 - u) * (1 - u) * u * y1 + 3 * (1 - u) * u * u * y2 + u * u * u

    def dbx(u: float) -> float:
        return (
            3 * (1 - u) * (1 - u) * x1
            + 6 * (1 - u) * u * (x2 - x1)
            + 3 * u * u * (1 - x2)
        )

    u = t
    for _ in range(10):
        d = dbx(u)
        if abs(d) < 1e-7:
            break
        u = max(0.0, min(1.0, u - (bx(u) - t) / d))
    return by(u)


def mix_at(buf: list[float], start: int, samples: list[float], gain: float = 1.0) -> None:
    for i, s in enumerate(samples):
        idx = start + i
        if 0 <= idx < len(buf):
            buf[idx] += s * gain


def sine(freq: float, t: float, phase: float = 0.0) -> float:
    return math.sin(2 * math.pi * freq * t + phase)


def exp_env(t: float, attack: float, decay: float) -> float:
    if t < 0:
        return 0.0
    if t < attack:
        return t / attack if attack > 0 else 1.0
    return math.exp(-(t - attack) / decay)


def noise() -> float:
    return random.uniform(-1.0, 1.0)


def lowpass_noise(n: int, cutoff: float) -> list[float]:
    """One-pole lowpass on white noise."""
    out = [0.0] * n
    x = 0.0
    rc = 1.0 / (2 * math.pi * cutoff)
    dt = 1.0 / SR
    a = dt / (rc + dt)
    for i in range(n):
        x += a * (noise() - x)
        out[i] = x
    return out


def peg_click(pitch: float = 1.0) -> list[float]:
    """Short plastic/wood peg tick with a tiny funk slap."""
    dur = 0.055
    n = int(SR * dur)
    out = [0.0] * n
    f1 = 1680.0 * pitch
    f2 = 920.0 * pitch
    f3 = 2450.0 * pitch
    for i in range(n):
        t = i / SR
        body = (
            0.55 * sine(f1, t) * math.exp(-t / 0.012)
            + 0.35 * sine(f2, t) * math.exp(-t / 0.018)
            + 0.18 * sine(f3, t) * math.exp(-t / 0.008)
        )
        slap = 0.22 * noise() * math.exp(-t / 0.004)
        out[i] = clamp(body + slap)
    return out


def whoosh(n: int) -> list[float]:
    noise_lp = lowpass_noise(n, 900)
    out = [0.0] * n
    for i in range(n):
        t = i / SR
        # Slow amplitude wobble so it feels like a spinning disc
        wobble = 0.55 + 0.45 * sine(18.0, t)
        fade = math.sin(math.pi * (i / max(n - 1, 1))) ** 0.6
        out[i] = noise_lp[i] * 1.8 * wobble * fade
    return out


def bass_thump() -> list[float]:
    n = int(SR * 0.18)
    out = [0.0] * n
    for i in range(n):
        t = i / SR
        freq = 92.0 * (1.0 - 0.35 * t / 0.18)
        out[i] = 0.9 * sine(freq, t) * math.exp(-t / 0.07)
    return out


def make_spin_sfx(duration: float = 5.5) -> list[float]:
    n = int(SR * duration) + int(SR * 0.25)
    buf = [0.0] * n
    mix_at(buf, 0, whoosh(int(SR * duration)), 0.22)

    # Match RewardWheel motion: 8 extra turns + landing, CSS ease [0.05, 0.95, 0.2, 1]
    total_deg = 360.0 * 8 + 180.0
    peg_deg = 12.0
    last_peg = -1
    rng = random.Random(67)

    for i in range(int(SR * duration)):
        t = i / (SR * duration)
        eased = bezier_ease(t, 0.05, 0.95, 0.2, 1.0)
        rot = eased * total_deg
        peg = int(rot / peg_deg)
        if peg != last_peg:
            last_peg = peg
            # Pitch falls as the wheel slows; late ticks get a chunkier wood tone
            speed = max(0.0, min(1.0, 1.0 - t))
            pitch = 1.12 - 0.38 * (1.0 - speed)
            click = peg_click(pitch)
            # Slight stereo-ish amplitude variation
            gain = 0.42 + 0.18 * speed + 0.05 * rng.uniform(-1, 1)
            mix_at(buf, i, click, gain)

    # Final ka-chunk when the pointer catches a peg
    land = int(SR * duration)
    mix_at(buf, land, bass_thump(), 0.7)
    mix_at(buf, land, peg_click(0.72), 0.9)
    mix_at(buf, land + int(0.03 * SR), peg_click(0.55), 0.45)
    return buf


def fm_bell(freq: float, dur: float, amp: float = 0.4) -> list[float]:
    n = int(SR * dur)
    out = [0.0] * n
    for i in range(n):
        t = i / SR
        mod = sine(freq * 2.0, t) * math.exp(-t / 0.18) * freq * 1.4
        car = math.sin(2 * math.pi * freq * t + mod / freq)
        out[i] = amp * car * math.exp(-t / 0.32) * exp_env(t, 0.004, 0.4)
    return out


def square_soft(freq: float, t: float) -> float:
    # Band-limited-ish by mixing odd harmonics, not a raw square
    s = 0.0
    for h, g in ((1, 1.0), (3, 0.28), (5, 0.12), (7, 0.06)):
        s += g * sine(freq * h, t)
    return s / 1.46


def make_win_sfx() -> list[float]:
    n = int(SR * 1.35)
    buf = [0.0] * n
    mix_at(buf, 0, bass_thump(), 0.85)

    # Bright C6 funk stab — yellow / Zinko energy
    chord = [261.63, 329.63, 392.00, 523.25, 659.25]  # C E G C E
    for freq in chord:
        n_note = int(SR * 0.55)
        note = [0.0] * n_note
        for i in range(n_note):
            t = i / SR
            tone = 0.55 * square_soft(freq, t) + 0.45 * sine(freq, t)
            note[i] = tone * exp_env(t, 0.008, 0.22)
        mix_at(buf, 0, note, 0.16)

    # Sparkle arpeggio
    sparkle = [523.25, 659.25, 783.99, 1046.50, 1318.51]
    for k, freq in enumerate(sparkle):
        start = int(SR * (0.05 + k * 0.07))
        mix_at(buf, start, fm_bell(freq, 0.55, 0.28), 1.0)

    # Second punch for "you won"
    mix_at(buf, int(SR * 0.22), bass_thump(), 0.45)
    return buf


def wah(freq: float, dur: float, drop: float) -> list[float]:
    n = int(SR * dur)
    out = [0.0] * n
    for i in range(n):
        t = i / SR
        f = freq * (1.0 - drop * (t / dur))
        formant = 0.5 + 0.5 * sine(6.0, t)
        out[i] = (
            (0.7 * sine(f, t) + 0.3 * sine(f * 2.02, t))
            * exp_env(t, 0.02, 0.18)
            * formant
        )
    return out


def make_lose_sfx() -> list[float]:
    n = int(SR * 1.15)
    buf = [0.0] * n
    # Playful sad trombone, not a fail buzzer
    mix_at(buf, 0, wah(330.0, 0.38, 0.18), 0.55)
    mix_at(buf, int(SR * 0.28), wah(277.0, 0.42, 0.22), 0.5)
    mix_at(buf, int(SR * 0.58), wah(220.0, 0.5, 0.12), 0.48)
    mix_at(buf, int(SR * 0.62), bass_thump(), 0.35)
    # Tiny bounce so it stays cartoon
    mix_at(buf, int(SR * 0.88), peg_click(0.8), 0.5)
    return buf


def normalize(buf: list[float], peak: float = 0.89) -> list[float]:
    m = max((abs(x) for x in buf), default=1.0)
    if m < 1e-9:
        return buf
    g = peak / m
    return [clamp(x * g) for x in buf]


def to_stereo(buf: list[float], width: float = 0.12) -> list[tuple[float, float]]:
    delay = int(SR * 0.008)
    stereo = []
    for i, s in enumerate(buf):
        other = buf[i - delay] if i >= delay else 0.0
        l = clamp(s + width * other)
        r = clamp(s - width * other)
        stereo.append((l, r))
    return stereo


def write_wav(path: str, buf: list[float]) -> None:
    stereo = to_stereo(normalize(buf))
    with wave.open(path, "w") as wf:
        wf.setnchannels(2)
        wf.setsampwidth(2)
        wf.setframerate(SR)
        frames = bytearray()
        for l, r in stereo:
            frames += struct.pack("<hh", int(l * 32767), int(r * 32767))
        wf.writeframes(frames)


def wav_to_mp3(wav_path: str, mp3_path: str) -> None:
    subprocess.check_call(
        [
            "ffmpeg",
            "-y",
            "-hide_banner",
            "-loglevel",
            "error",
            "-i",
            wav_path,
            "-codec:a",
            "libmp3lame",
            "-b:a",
            "192k",
            mp3_path,
        ]
    )


def main() -> None:
    out_dir = os.path.abspath(OUT_DIR)
    os.makedirs(out_dir, exist_ok=True)
    jobs = {
        "wheel-spin-sfx.mp3": make_spin_sfx(),
        "wheel-win.mp3": make_win_sfx(),
        "wheel-lose.mp3": make_lose_sfx(),
    }
    with tempfile.TemporaryDirectory() as tmp:
        for name, buf in jobs.items():
            wav_path = os.path.join(tmp, name.replace(".mp3", ".wav"))
            mp3_path = os.path.join(out_dir, name)
            write_wav(wav_path, buf)
            wav_to_mp3(wav_path, mp3_path)
            print(f"wrote {mp3_path} ({os.path.getsize(mp3_path)} bytes)")


if __name__ == "__main__":
    main()
