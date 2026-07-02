import { useEffect, useRef, useState } from "react";
import { usePitch } from "./usePitch";
import { useLatest } from "./useLatest";

const lookaheadMs = 25;
const scheduleAheadTimeSeconds = 0.1;
const accentFrequencyHz = 1500;
const beatFrequencyHz = 1000;
const clickDurationSeconds = 0.05;

interface Options {
  bpm: number;
  beatsPerMeasure: number;
  isSoundEnabled: boolean;
}

interface Metronome {
  isRunning: boolean;
  currentBeat: number;
  start: () => void;
  stop: () => void;
}

export function useMetronome({ bpm, beatsPerMeasure, isSoundEnabled }: Options): Metronome {
  const { engine } = usePitch();
  const [isRunning, setIsRunning] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(-1);

  const bpmRef = useLatest(bpm);
  const beatsPerMeasureRef = useLatest(beatsPerMeasure);
  const isSoundEnabledRef = useLatest(isSoundEnabled);

  const nextNoteTimeRef = useRef(0);
  const nextBeatRef = useRef(0);
  const schedulerTimerRef = useRef(0);
  const animationFrameRef = useRef(0);
  const scheduledBeatsRef = useRef<{ beat: number; time: number }[]>([]);

  function playClick(beat: number, time: number): void {
    const ctx = engine.getAudioContext();
    if (ctx === null || !isSoundEnabledRef.current) {
      return;
    }

    const isDownbeat = beat === 0;
    const oscillator = ctx.createOscillator();
    oscillator.frequency.value = isDownbeat ? accentFrequencyHz : beatFrequencyHz;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(isDownbeat ? 0.5 : 0.3, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + clickDurationSeconds);

    oscillator.connect(gain).connect(ctx.destination);
    oscillator.start(time);
    oscillator.stop(time + clickDurationSeconds + 0.02);
  }

  function scheduleDueBeats(): void {
    const ctx = engine.getAudioContext();
    if (ctx === null) {
      return;
    }

    while (nextNoteTimeRef.current < ctx.currentTime + scheduleAheadTimeSeconds) {
      playClick(nextBeatRef.current, nextNoteTimeRef.current);
      scheduledBeatsRef.current.push({ beat: nextBeatRef.current, time: nextNoteTimeRef.current });
      nextNoteTimeRef.current += 60 / bpmRef.current;
      nextBeatRef.current = (nextBeatRef.current + 1) % beatsPerMeasureRef.current;
    }
  }

  function syncVisualBeat(): void {
    animationFrameRef.current = requestAnimationFrame(syncVisualBeat);
    const ctx = engine.getAudioContext();
    if (ctx === null) {
      return;
    }

    const queue = scheduledBeatsRef.current;
    while (queue.length > 0 && queue[0].time <= ctx.currentTime) {
      setCurrentBeat(queue[0].beat);
      queue.shift();
    }
  }

  function start(): void {
    const ctx = engine.ensureAudioContext();
    if (isRunning || ctx === null) {
      return;
    }

    nextBeatRef.current = 0;
    nextNoteTimeRef.current = ctx.currentTime + 0.1;
    scheduledBeatsRef.current = [];
    schedulerTimerRef.current = window.setInterval(scheduleDueBeats, lookaheadMs);
    syncVisualBeat();
    setIsRunning(true);
  }

  function stop(): void {
    clearInterval(schedulerTimerRef.current);
    cancelAnimationFrame(animationFrameRef.current);
    scheduledBeatsRef.current = [];
    setIsRunning(false);
    setCurrentBeat(-1);
  }

  useEffect(() => {
    return () => {
      clearInterval(schedulerTimerRef.current);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  return { isRunning, currentBeat, start, stop };
}
