import { PITCH_DETECTION_PARAMS, detectPitch, type Detection } from "./pitchDetection";

export interface Frame extends Detection {
  sampleRate: number;
  isRefPlaying: boolean;
}

interface PitchStatus {
  isStarted: boolean;
  error: string | null;
}

type FrameSubscriber = (frame: Frame) => void;

const silentFrame: Frame = {
  frequencyInHertz: -1,
  clarity: 0,
  rootMeanSquare: 0,
  sampleRate: 0,
  isRefPlaying: false,
};

const pluckHarmonics = [0, 1, 0.55, 0.4, 0.25, 0.18, 0.12, 0.08, 0.05];

function messageFromStartError(e: unknown): string {
  if (e instanceof DOMException) {
    if (e.name === "NotAllowedError" || e.name === "SecurityError") {
      return "L'accès au micro doit être autorisé dans les réglages du navigateur.";
    }

    if (e.name === "NotFoundError" || e.name === "OverconstrainedError") {
      return "Aucun micro détecté sur cet appareil.";
    }

    if (e.name === "NotReadableError") {
      return "Le micro est déjà utilisé par une autre application.";
    }
  }

  if (e instanceof Error && e.message !== "") {
    return e.message;
  }

  return "Le micro est nécessaire pour utiliser l'application.";
}

export interface PitchEngine {
  start: () => Promise<void>;
  subscribe: (cb: FrameSubscriber) => () => void;
  subscribeStatus: (cb: () => void) => () => void;
  getStatus: () => PitchStatus;
  getFrame: () => Frame;
  getAudioContext: () => AudioContext | null;
  playReference: (freq: number, dur?: number) => void;
  dispose: () => void;
}

export function createPitchEngine(): PitchEngine {
  let ctx: AudioContext | null = null;
  let analyser: AnalyserNode | null = null;
  let buffer: Float32Array<ArrayBuffer> = new Float32Array(0);
  let isStarted = false;
  let isRefPlaying = false;
  let timerRef = 0;
  let animationFrameRef = 0;
  let isLooping = false;
  let error: string | null = null;
  let currentFrame: Frame = silentFrame;
  let pluckWave: PeriodicWave | null = null;
  const frameSubscribers = new Set<FrameSubscriber>();

  let status: PitchStatus = { isStarted: false, error: null };
  const statusSubscribers = new Set<() => void>();

  function emitStatus(): void {
    status = { isStarted, error };
    statusSubscribers.forEach((notify) => {
      notify();
    });
  }

  function shouldAnalyze(): boolean {
    return isStarted && frameSubscribers.size > 0 && document.visibilityState === "visible";
  }

  const loop = (): void => {
    if (analyser === null || ctx === null || !shouldAnalyze()) {
      isLooping = false;

      return;
    }

    animationFrameRef = requestAnimationFrame(loop);
    analyser.getFloatTimeDomainData(buffer);
    const detection = detectPitch(buffer, ctx.sampleRate);
    currentFrame = { ...detection, sampleRate: ctx.sampleRate, isRefPlaying };
    frameSubscribers.forEach((notify) => {
      notify(currentFrame);
    });
  };

  function syncLoop(): void {
    if (shouldAnalyze()) {
      if (!isLooping) {
        isLooping = true;
        loop();
      }
    } else if (isLooping) {
      isLooping = false;
      cancelAnimationFrame(animationFrameRef);
      currentFrame = silentFrame;
    }
  }

  function handleVisibilityChange(): void {
    syncLoop();
  }

  async function start(): Promise<void> {
    if (isStarted) {
      return;
    }

    try {
      const audioGlobal = window as unknown as {
        AudioContext?: typeof AudioContext;
        webkitAudioContext?: typeof AudioContext;
      };
      const audioContextImplementation = audioGlobal.AudioContext ?? audioGlobal.webkitAudioContext;
      if (audioContextImplementation === undefined) {
        throw new Error("Web Audio API non supportée par ce navigateur");
      }

      const mediaDevices = (navigator as { mediaDevices?: MediaDevices }).mediaDevices;
      if (mediaDevices === undefined) {
        throw new Error(
          window.isSecureContext
            ? "Ce navigateur ne permet pas l'accès au micro."
            : "Le micro nécessite une connexion sécurisée (https).",
        );
      }

      const audioContext = new audioContextImplementation();
      const stream = await mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });
      const source = audioContext.createMediaStreamSource(stream);
      const analyserNode = audioContext.createAnalyser();
      analyserNode.fftSize = PITCH_DETECTION_PARAMS.nbSamplesPerAnalysisFrame;
      source.connect(analyserNode);

      ctx = audioContext;
      analyser = analyserNode;
      buffer = new Float32Array(analyserNode.fftSize);
      isStarted = true;
      error = null;
      emitStatus();
      document.addEventListener("visibilitychange", handleVisibilityChange);
      syncLoop();
    } catch (e) {
      console.error(e);
      error = messageFromStartError(e);
      emitStatus();
    }
  }

  function subscribe(cb: FrameSubscriber): () => void {
    frameSubscribers.add(cb);
    syncLoop();

    return () => {
      frameSubscribers.delete(cb);
      syncLoop();
    };
  }

  function subscribeStatus(cb: () => void): () => void {
    statusSubscribers.add(cb);

    return () => {
      statusSubscribers.delete(cb);
    };
  }

  function getStatus(): PitchStatus {
    return status;
  }

  function getFrame(): Frame {
    return currentFrame;
  }

  function getAudioContext(): AudioContext | null {
    return ctx;
  }

  function playReference(frequency: number, duration = 1.0): void {
    if (ctx === null) {
      return;
    }

    const audioContext = ctx;
    const now = audioContext.currentTime;

    pluckWave ??= audioContext.createPeriodicWave(
      new Float32Array(pluckHarmonics.length),
      Float32Array.from(pluckHarmonics),
    );
    const oscillator = audioContext.createOscillator();
    oscillator.setPeriodicWave(pluckWave);
    oscillator.frequency.value = frequency;

    const lowpass = audioContext.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.Q.value = 1;
    lowpass.frequency.setValueAtTime(Math.min(frequency * 6, 8000), now);
    lowpass.frequency.exponentialRampToValueAtTime(Math.max(frequency * 2, 200), now + duration);

    const peakGain = 0.3;
    const attackSeconds = 0.005;
    const silenceGain = 0.0001;
    const gain = audioContext.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(peakGain, now + attackSeconds);
    gain.gain.exponentialRampToValueAtTime(silenceGain, now + duration);

    oscillator.connect(lowpass).connect(gain).connect(audioContext.destination);
    isRefPlaying = true;
    oscillator.start(now);
    oscillator.stop(now + duration + 0.05);

    clearTimeout(timerRef);
    timerRef = window.setTimeout(() => {
      isRefPlaying = false;
    }, (duration + 0.25) * 1000);
  }

  function dispose(): void {
    clearTimeout(timerRef);
    cancelAnimationFrame(animationFrameRef);
    isLooping = false;
    document.removeEventListener("visibilitychange", handleVisibilityChange);

    if (ctx !== null) {
      ctx.close().catch(() => undefined);
    }
  }

  return { start, subscribe, subscribeStatus, getStatus, getFrame, getAudioContext, playReference, dispose };
}
