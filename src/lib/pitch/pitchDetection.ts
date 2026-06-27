export const PITCH_DETECTION_PARAMS = {
  nbSamplesPerAnalysisFrame: 4096,
  minFrequencyInHertz: 70,
  maxFrequencyInHertz: 1000,
  minClarity: 0.55,
  minRootMeanSquare: 0.006,
  peakThresholdRatio: 0.9,
};

export interface Detection {
  frequencyInHertz: number;
  clarity: number;
  rootMeanSquare: number;
}

export function detectPitch(buffer: Float32Array, sampleRate: number): Detection {
  const length = buffer.length;

  let rootMeanSquare = 0;
  for (let i = 0; i < length; i++) {
    rootMeanSquare += buffer[i] * buffer[i];
  }

  rootMeanSquare = Math.sqrt(rootMeanSquare / length);
  if (rootMeanSquare < PITCH_DETECTION_PARAMS.minRootMeanSquare) {
    return { frequencyInHertz: -1, clarity: 0, rootMeanSquare: rootMeanSquare };
  }

  const maxTau = Math.min(length - 1, Math.floor(sampleRate / PITCH_DETECTION_PARAMS.minFrequencyInHertz));
  const minTau = Math.max(2, Math.floor(sampleRate / PITCH_DETECTION_PARAMS.maxFrequencyInHertz));
  const nsdf = computeNsdf(buffer, minTau, maxTau);

  const peakLag = selectPeakLag(nsdf, minTau, maxTau);
  if (peakLag < 0) {
    return { frequencyInHertz: -1, clarity: 0, rootMeanSquare: rootMeanSquare };
  }

  const refinedLag = peakLag + parabolicPeakOffset(nsdf, peakLag, maxTau);

  return {
    frequencyInHertz: sampleRate / refinedLag,
    clarity: Math.max(0, Math.min(1, nsdf[peakLag])),
    rootMeanSquare: rootMeanSquare,
  };
}

function computeNsdf(buffer: Float32Array, minTau: number, maxTau: number): Float32Array {
  const nsdf = new Float32Array(maxTau + 1);
  const length = buffer.length;
  for (let tau = minTau; tau <= maxTau; tau++) {
    let autoCorrelation = 0;
    let magnitude = 0;
    for (let i = 0; i + tau < length; i++) {
      const sample = buffer[i];
      const lagShiftedSample = buffer[i + tau];
      autoCorrelation += sample * lagShiftedSample;
      magnitude += sample * sample + lagShiftedSample * lagShiftedSample;
    }
    nsdf[tau] = magnitude > 0 ? (2 * autoCorrelation) / magnitude : 0;
  }

  return nsdf;
}

function selectPeakLag(nsdf: Float32Array, minTau: number, maxTau: number): number {
  let tau = minTau;

  // ignore the initial positive lobe
  while (tau <= maxTau && nsdf[tau] > 0) {
    tau++;
  }

  const peakLags: number[] = [];
  while (tau <= maxTau) {
    if (nsdf[tau] > 0) {
      let peakLag = tau;
      let peakValue = nsdf[tau];
      while (tau <= maxTau && nsdf[tau] > 0) {
        if (nsdf[tau] > peakValue) {
          peakValue = nsdf[tau];
          peakLag = tau;
        }
        tau++;
      }
      peakLags.push(peakLag);
    } else {
      tau++;
    }
  }

  if (peakLags.length === 0) {
    return -1;
  }

  let maxPeak = 0;
  for (const lag of peakLags) {
    if (nsdf[lag] > maxPeak) {
      maxPeak = nsdf[lag];
    }
  }

  const peakThreshold = PITCH_DETECTION_PARAMS.peakThresholdRatio * maxPeak;
  for (const lag of peakLags) {
    if (nsdf[lag] >= peakThreshold) {
      return lag;
    }
  }

  return peakLags[0];
}

function parabolicPeakOffset(nsdf: Float32Array, peakLag: number, maxTau: number): number {
  const nsdfBeforePeak = peakLag > 0 ? nsdf[peakLag - 1] : nsdf[peakLag];
  const nsdfAtPeak = nsdf[peakLag];
  const nsdfAfterPeak = peakLag < maxTau ? nsdf[peakLag + 1] : nsdf[peakLag];
  const curvature = nsdfBeforePeak - 2 * nsdfAtPeak + nsdfAfterPeak;

  return curvature !== 0 ? (0.5 * (nsdfBeforePeak - nsdfAfterPeak)) / curvature : 0;
}
