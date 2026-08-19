"use client";
import { useRef, useCallback } from "react";

type AnyAudioNode = AudioNode & { stop?: () => void };

export function useBeastIntroAudio() {
  const ctxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const trackedNodesRef = useRef<AnyAudioNode[]>([]);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const track = <T extends AnyAudioNode>(node: T): T => {
    trackedNodesRef.current.push(node);
    return node;
  };

  const later = (fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    timersRef.current.push(id);
  };

  const makeBrownNoise = (ctx: AudioContext, seconds: number, channels = 1) => {
    const sr = ctx.sampleRate;
    const buf = ctx.createBuffer(channels, sr * seconds, sr);
    for (let ch = 0; ch < channels; ch++) {
      const d = buf.getChannelData(ch);
      let last = 0;
      for (let i = 0; i < d.length; i++) {
        const w = Math.random() * 2 - 1;
        last = (last + 0.02 * w) / 1.02;
        d[i] = last * 3.5;
      }
    }
    return buf;
  };

  const makeWhiteNoise = (ctx: AudioContext, seconds: number) => {
    const sr = ctx.sampleRate;
    const buf = ctx.createBuffer(1, sr * seconds, sr);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return buf;
  };

  const startRumble = (ctx: AudioContext, dest: AudioNode, startVol: number, peakVol: number, rampMs: number) => {
    const src = track(ctx.createBufferSource());
    src.buffer = makeWhiteNoise(ctx, 3);
    src.loop = true;

    const lpf = track(ctx.createBiquadFilter());
    lpf.type = "lowpass";
    lpf.frequency.value = 65;
    lpf.Q.value = 0.8;

    const gain = track(ctx.createGain());
    gain.gain.setValueAtTime(startVol, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(peakVol, ctx.currentTime + rampMs / 1000);

    const lfo = track(ctx.createOscillator());
    const lfoG = track(ctx.createGain());
    lfo.frequency.value = 0.15;
    lfoG.gain.value = peakVol * 0.1;
    lfo.connect(lfoG);
    lfoG.connect(gain.gain);
    lfo.start();

    src.connect(lpf);
    lpf.connect(gain);
    gain.connect(dest);
    src.start();

    return gain;
  };

  const startFire = (ctx: AudioContext, dest: AudioNode, startVol: number, peakVol: number, rampMs: number) => {
    const src = track(ctx.createBufferSource());
    src.buffer = makeBrownNoise(ctx, 4, 2);
    src.loop = true;
    src.playbackRate.value = 0.9;

    const bpf = track(ctx.createBiquadFilter());
    bpf.type = "bandpass";
    bpf.frequency.value = 500;
    bpf.Q.value = 0.5;

    const bpf2 = track(ctx.createBiquadFilter());
    bpf2.type = "bandpass";
    bpf2.frequency.value = 2400;
    bpf2.Q.value = 1.1;

    const gain = track(ctx.createGain());
    gain.gain.setValueAtTime(startVol, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(peakVol, ctx.currentTime + rampMs / 1000);

    const lfo = track(ctx.createOscillator());
    const lfoG = track(ctx.createGain());
    lfo.frequency.value = 0.22;
    lfoG.gain.value = peakVol * 0.3;
    lfo.connect(lfoG);
    lfoG.connect(gain.gain);
    lfo.start();

    const merge = track(ctx.createGain());
    merge.gain.value = 0.5;

    src.connect(bpf);
    src.connect(bpf2);
    bpf.connect(merge);
    bpf2.connect(merge);
    merge.connect(gain);
    gain.connect(dest);
    src.start();

    return gain;
  };

  const startCrackle = (ctx: AudioContext, dest: AudioNode, peakVol: number) => {
    const sr = ctx.sampleRate;
    const buf = ctx.createBuffer(1, sr * 2, sr);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) {
      d[i] = Math.random() < 0.007 ? (Math.random() * 2 - 1) * 0.95 : 0;
    }

    const src = track(ctx.createBufferSource());
    src.buffer = buf;
    src.loop = true;

    const hpf = track(ctx.createBiquadFilter());
    hpf.type = "highpass";
    hpf.frequency.value = 3200;

    const gain = track(ctx.createGain());
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(peakVol, ctx.currentTime + 1.5);

    src.connect(hpf);
    hpf.connect(gain);
    gain.connect(dest);
    src.start();

    return gain;
  };

  const playBeastTone = (
    ctx: AudioContext, dest: AudioNode,
    freq: number, vol: number,
    attackS: number, holdS: number, releaseS: number
  ) => {
    const osc1 = track(ctx.createOscillator());
    const osc2 = track(ctx.createOscillator());
    osc1.type = "sawtooth";
    osc1.frequency.value = freq;
    osc2.type = "sine";
    osc2.frequency.value = freq * 0.501;

    const ws = track(ctx.createWaveShaper());
    const cv = new Float32Array(256);
    for (let i = 0; i < 256; i++) {
      const x = (i * 2) / 256 - 1;
      cv[i] = ((Math.PI + 180) * x) / (Math.PI + 180 * Math.abs(x));
    }
    ws.curve = cv;
    ws.oversample = "2x";

    const gain = track(ctx.createGain());
    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(vol, now + attackS);
    gain.gain.setValueAtTime(vol, now + attackS + holdS);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + attackS + holdS + releaseS);

    osc1.connect(ws);
    osc2.connect(ws);
    ws.connect(gain);
    gain.connect(dest);

    const endTime = now + attackS + holdS + releaseS + 0.1;
    osc1.start(now);
    osc2.start(now);
    osc1.stop(endTime);
    osc2.stop(endTime);
  };

  const playFireSwell = (ctx: AudioContext, dest: AudioNode) => {
    const src = track(ctx.createBufferSource());
    src.buffer = makeWhiteNoise(ctx, 2);

    const bpf = track(ctx.createBiquadFilter());
    bpf.type = "bandpass";
    bpf.frequency.setValueAtTime(180, ctx.currentTime);
    bpf.frequency.linearRampToValueAtTime(1100, ctx.currentTime + 1.0);
    bpf.Q.value = 1.0;

    const gain = track(ctx.createGain());
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.20, ctx.currentTime + 0.45);
    gain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 1.5);

    src.connect(bpf);
    bpf.connect(gain);
    gain.connect(dest);
    src.start();
  };

  const playMetallicImpact = (ctx: AudioContext, dest: AudioNode) => {
    const now = ctx.currentTime;

    const thud = track(ctx.createOscillator());
    const thudG = track(ctx.createGain());
    thud.type = "sine";
    thud.frequency.setValueAtTime(90, now);
    thud.frequency.exponentialRampToValueAtTime(28, now + 0.55);
    thudG.gain.setValueAtTime(0.30, now);
    thudG.gain.exponentialRampToValueAtTime(0.0001, now + 0.85);
    thud.connect(thudG); thudG.connect(dest);
    thud.start(now); thud.stop(now + 1.0);

    const ring = track(ctx.createOscillator());
    const ringG = track(ctx.createGain());
    ring.type = "sine";
    ring.frequency.value = 230;
    ringG.gain.setValueAtTime(0.10, now);
    ringG.gain.exponentialRampToValueAtTime(0.0001, now + 2.0);
    ring.connect(ringG); ringG.connect(dest);
    ring.start(now); ring.stop(now + 2.2);

    const shimmer = track(ctx.createOscillator());
    const shimG = track(ctx.createGain());
    shimmer.type = "sine";
    shimmer.frequency.value = 1850;
    shimG.gain.setValueAtTime(0.035, now);
    shimG.gain.exponentialRampToValueAtTime(0.0001, now + 1.1);
    shimmer.connect(shimG); shimG.connect(dest);
    shimmer.start(now); shimmer.stop(now + 1.3);

    const breathSrc = track(ctx.createBufferSource());
    breathSrc.buffer = makeWhiteNoise(ctx, 0.4);
    const breathBpf = track(ctx.createBiquadFilter());
    breathBpf.type = "bandpass";
    breathBpf.frequency.value = 800;
    breathBpf.Q.value = 0.8;
    const breathG = track(ctx.createGain());
    breathG.gain.setValueAtTime(0.12, now);
    breathG.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
    breathSrc.connect(breathBpf); breathBpf.connect(breathG); breathG.connect(dest);
    breathSrc.start(now);
  };

  const cleanup = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    trackedNodesRef.current.forEach((node) => {
      try {
        if ("stop" in node && typeof node.stop === "function") node.stop();
        node.disconnect();
      } catch {
        // node already stopped
      }
    });
    trackedNodesRef.current = [];

    if (ctxRef.current && ctxRef.current.state !== "closed") {
      ctxRef.current.close().catch(() => {});
      ctxRef.current = null;
    }
    masterGainRef.current = null;
  }, []);

  const startIntroAudio = useCallback(async () => {
    cleanup();

    let ctx: AudioContext;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctx = new AudioCtx();
    } catch {
      return;
    }

    if (ctx.state === "suspended") {
      try {
        await ctx.resume();
      } catch {
        return;
      }
    }

    ctxRef.current = ctx;

    const master = ctx.createGain();
    master.gain.value = 0;
    masterGainRef.current = master;

    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -16;
    comp.knee.value = 10;
    comp.ratio.value = 5;
    comp.attack.value = 0.04;
    comp.release.value = 0.25;
    comp.connect(master);
    master.connect(ctx.destination);
    track(comp);

    let rumbleGain: GainNode | null = null;
    let fireGain: GainNode | null = null;

    later(() => {
      if (!ctxRef.current) return;
      master.gain.setValueAtTime(0, ctx.currentTime);
      master.gain.linearRampToValueAtTime(0.40, ctx.currentTime + 2.5);
      rumbleGain = startRumble(ctx, comp, 0, 0.35, 2500);
      playBeastTone(ctx, comp, 40, 0.055, 2.0, 3.0, 3.5);
    }, 1200);

    later(() => {
      if (!ctxRef.current) return;
      fireGain = startFire(ctx, comp, 0, 0.18, 2000);
    }, 2400);

    later(() => {
      if (!ctxRef.current) return;
      startCrackle(ctx, comp, 0.25);
      if (fireGain) fireGain.gain.linearRampToValueAtTime(0.28, ctx.currentTime + 1.5);
      if (rumbleGain) rumbleGain.gain.linearRampToValueAtTime(0.45, ctx.currentTime + 1.5);
      playBeastTone(ctx, comp, 55, 0.07, 0.8, 2.2, 2.8);
    }, 3200);

    later(() => {
      if (!ctxRef.current) return;
      playFireSwell(ctx, comp);
      master.gain.linearRampToValueAtTime(0.65, ctx.currentTime + 0.7);
      if (fireGain) fireGain.gain.linearRampToValueAtTime(0.38, ctx.currentTime + 0.7);
      if (rumbleGain) rumbleGain.gain.linearRampToValueAtTime(0.55, ctx.currentTime + 0.7);
      playBeastTone(ctx, comp, 35, 0.09, 0.3, 2.0, 3.5);
    }, 4800);

    later(() => {
      if (!ctxRef.current) return;
      playMetallicImpact(ctx, comp);
      if (fireGain) fireGain.gain.linearRampToValueAtTime(0.22, ctx.currentTime + 0.5);
      master.gain.linearRampToValueAtTime(0.58, ctx.currentTime + 0.5);
    }, 6000);

    later(() => {
      if (!ctxRef.current) return;
      master.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.9);
    }, 6600);

    later(() => {
      cleanup();
    }, 8600);
  }, [cleanup]);

  return { startIntroAudio, cleanup };
}
