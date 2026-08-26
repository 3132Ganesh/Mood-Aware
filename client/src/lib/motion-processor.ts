/**
 * motion-processor.ts
 * Converts raw DeviceMotionEvent accelerometer readings into step counts
 * and infers sedentary/active periods for sleep detection.
 */

export interface MotionSample {
  x: number;
  y: number;
  z: number;
  t: number; // timestamp ms
}

export interface DailyMotionSummary {
  date: string;           // YYYY-MM-DD
  stepsCount: number;
  activeMinutes: number;
  sedentaryMinutes: number;
  peakActivityHour: number | null; // 0-23
  inferredSleepStart: string | null; // ISO
  inferredWakeTime: string | null;   // ISO
}

// Threshold for peak magnitude to count as a step event
const STEP_THRESHOLD = 1.2; // m/s²
const STEP_COOLDOWN_MS = 350; // min ms between steps

let _buffer: MotionSample[] = [];
let _stepCount = 0;
let _lastStepTime = 0;
let _hourBuckets: number[] = new Array(24).fill(0); // steps per hour
let _lastActivityTime = Date.now();
let _sedentaryMs = 0;
let _activeMs = 0;
let _sessionStartMs = Date.now();

export function processSample(x: number, y: number, z: number): void {
  const now = Date.now();
  const mag = Math.sqrt(x * x + y * y + z * z);
  // Subtract gravity (≈9.81) to get dynamic acceleration
  const dynamic = Math.abs(mag - 9.81);

  if (dynamic > STEP_THRESHOLD && now - _lastStepTime > STEP_COOLDOWN_MS) {
    _stepCount++;
    _lastStepTime = now;
    const hour = new Date(now).getHours();
    _hourBuckets[hour]++;
    _lastActivityTime = now;
  }

  // Track sedentary vs active time (activity within last 60s = active)
  const elapsedSinceLastActivity = now - _lastActivityTime;
  if (elapsedSinceLastActivity < 60_000) {
    _activeMs += 16; // ~16ms per frame at 60fps
  } else {
    _sedentaryMs += 16;
  }

  _buffer.push({ x, y, z, t: now });
  // Keep buffer to last 200 samples
  if (_buffer.length > 200) _buffer.shift();
}

export function getStepCount(): number {
  return _stepCount;
}

export function resetDailyCounters(): void {
  _stepCount = 0;
  _hourBuckets = new Array(24).fill(0);
  _sedentaryMs = 0;
  _activeMs = 0;
  _sessionStartMs = Date.now();
  _buffer = [];
}

export function getDailySummary(date: string): DailyMotionSummary {
  const peakHour = _hourBuckets.reduce(
    (maxIdx, val, idx, arr) => (val > arr[maxIdx] ? idx : maxIdx),
    0
  );

  return {
    date,
    stepsCount: _stepCount,
    activeMinutes: Math.round(_activeMs / 60_000),
    sedentaryMinutes: Math.round(_sedentaryMs / 60_000),
    peakActivityHour: _hourBuckets[peakHour] > 0 ? peakHour : null,
    inferredSleepStart: null,  // Set by use-motion-tracker when inactivity > 45min post-9pm
    inferredWakeTime: null,
  };
}

/** Returns true if device has been stationary for `thresholdMs` milliseconds */
export function isStationary(thresholdMs = 45 * 60 * 1000): boolean {
  return Date.now() - _lastActivityTime >= thresholdMs;
}

export function getLastActivityTime(): number {
  return _lastActivityTime;
}
