import { PITCH_DETECTION_PARAMS, detectPitch, type Detection } from "./pitchDetection";

export interface Frame extends Detection {
  isRefPlaying: boolean;
}

interface PitchStatus {
  isStarted: boolean;
  error: string | null;
  isPermissionDenied: boolean;
}

type FrameSubscriber = (frame: Frame) => void;

const silentFrame: Frame = {
  frequencyInHertz: -1,
  clarity: 0,
  rootMeanSquare: 0,
  isRefPlaying: false,
};

interface PluckBuffer {
  buffer: AudioBuffer;
  producedFrequency: number;
}

const pickPositionRatio = 0.25;
const attackSoftness = 0.3;
const bodyResonanceHz = 100;
const bodyResonanceGainDb = 3;

function createPluckBuffer(
  audioContext: AudioContext,
  frequency: number,
  duration: number,
): PluckBuffer {
  const { sampleRate } = audioContext;
  const period = Math.max(2, Math.round(sampleRate / frequency));
  const length = Math.floor(sampleRate * (duration + 0.1));
  const buffer = audioContext.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);

  const endAmplitude = 0.02;
  const decay = Math.exp(Math.log(endAmplitude) / (sampleRate * duration));

  const noise = new Float32Array(period);
  let smoothed = 0;
  for (let i = 0; i < period; i++) {
    smoothed = (1 - attackSoftness) * (Math.random() * 2 - 1) + attackSoftness * smoothed;
    noise[i] = smoothed;
  }

  const pickDelay = Math.max(1, Math.round(period * pickPositionRatio));
  let peak = 0;
  for (let i = 0; i < period; i++) {
    data[i] = noise[i] - (i >= pickDelay ? noise[i - pickDelay] : 0);
    peak = Math.max(peak, Math.abs(data[i]));
  }

  if (peak > 0) {
    for (let i = 0; i < period; i++) {
      data[i] /= peak;
    }
  }

  for (let i = period; i < length; i++) {
    const previous = data[i - period];
    const previousBefore = i - period - 1 >= 0 ? data[i - period - 1] : previous;
    data[i] = decay * 0.5 * (previous + previousBefore);
  }

  return { buffer, producedFrequency: sampleRate / period };
}

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
  ensureAudioContext: () => AudioContext | null;
  checkPermission: () => void;
  subscribe: (cb: FrameSubscriber) => () => void;
  subscribeStatus: (cb: () => void) => () => void;
  getStatus: () => PitchStatus;
  getFrame: () => Frame;
  getAudioContext: () => AudioContext | null;
  playReference: (freq: number, dur?: number) => void;
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
  let isPermissionDenied = false;
  let currentFrame: Frame = silentFrame;
  const frameSubscribers = new Set<FrameSubscriber>();

  let status: PitchStatus = { isStarted: false, error: null, isPermissionDenied: false };
  const statusSubscribers = new Set<() => void>();

  function emitStatus(): void {
    status = { isStarted, error, isPermissionDenied };
    statusSubscribers.forEach((notify) => {
      notify();
    });
  }

  function resolveAudioContextImplementation(): typeof AudioContext | undefined {
    const audioGlobal = window as unknown as {
      AudioContext?: typeof AudioContext;
      webkitAudioContext?: typeof AudioContext;
    };

    return audioGlobal.AudioContext ?? audioGlobal.webkitAudioContext;
  }

  function ensureAudioContext(): AudioContext | null {
    if (ctx !== null) {
      if (ctx.state === "suspended") {
        ctx.resume().catch(() => undefined);
      }

      return ctx;
    }

    const audioContextImplementation = resolveAudioContextImplementation();
    if (audioContextImplementation === undefined) {
      error = "La lecture audio n'est pas supportée par ce navigateur.";
      emitStatus();

      return null;
    }

    ctx = new audioContextImplementation();
    emitStatus();

    return ctx;
  }

  function checkPermission(): void {
    const permissions = (navigator as { permissions?: Permissions }).permissions;
    if (permissions === undefined) {
      return;
    }

    permissions
      .query({ name: "microphone" })
      .then((result) => {
        function apply(): void {
          isPermissionDenied = result.state === "denied";
          emitStatus();
        }

        apply();
        result.onchange = apply;
      })
      .catch(() => undefined);
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
    currentFrame = { ...detection, isRefPlaying };
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

    const audioContext = ensureAudioContext();
    if (audioContext === null) {
      return;
    }

    try {
      const mediaDevices = (navigator as { mediaDevices?: MediaDevices }).mediaDevices;
      if (mediaDevices === undefined) {
        throw new Error(
          window.isSecureContext
            ? "Ce navigateur ne permet pas l'accès au micro."
            : "Le micro nécessite une connexion sécurisée (https).",
        );
      }

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
      if (e instanceof DOMException && (e.name === "NotAllowedError" || e.name === "SecurityError")) {
        isPermissionDenied = true;
      }

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

  function playReference(frequency: number, duration = 0.75): void {
    const audioContext = ensureAudioContext();
    if (audioContext === null) {
      return;
    }

    const now = audioContext.currentTime;

    const { buffer, producedFrequency } = createPluckBuffer(audioContext, frequency, duration);
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = frequency / producedFrequency;

    const lowpass = audioContext.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.Q.value = 0.7;
    lowpass.frequency.value = Math.min(frequency * 8, 8000);

    const bodyResonance = audioContext.createBiquadFilter();
    bodyResonance.type = "peaking";
    bodyResonance.frequency.value = bodyResonanceHz;
    bodyResonance.Q.value = 1.0;
    bodyResonance.gain.value = bodyResonanceGainDb;

    const peakGain = 0.6;
    const attackSeconds = 0.004;
    const releaseSeconds = 0.03;
    const gain = audioContext.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(peakGain, now + attackSeconds);
    gain.gain.setValueAtTime(peakGain, now + Math.max(duration - releaseSeconds, attackSeconds));
    gain.gain.linearRampToValueAtTime(0, now + duration);

    source.connect(lowpass).connect(bodyResonance).connect(gain).connect(audioContext.destination);
    isRefPlaying = true;
    source.start(now);
    source.stop(now + duration + 0.05);

    clearTimeout(timerRef);
    timerRef = window.setTimeout(() => {
      isRefPlaying = false;
    }, (duration + 0.25) * 1000);
  }

  return {
    start,
    ensureAudioContext,
    checkPermission,
    subscribe,
    subscribeStatus,
    getStatus,
    getFrame,
    getAudioContext,
    playReference,
  };
}
