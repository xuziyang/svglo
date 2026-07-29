// Runs the VTracer 1.0 wasm inside a dedicated Web Worker so the main thread
// stays responsive while long synchronous traces (200-600ms on mid-size
// images) are happening. The wasm is byte-stable across module reloads, so
// the worker init promise is memoised and resolved exactly once.
//
// Pixels are sent as a transferable ArrayBuffer to avoid the ~5-15ms
// structured-clone cost on a 1024x768 RGBA buffer.

import init, { vectorize_rgba } from 'vtracer-wasm';
import wasmUrl from 'vtracer-wasm/vtracer_wasm_bg.wasm?url';
import type { VTracerOptions } from '../lib/vtracer-shared';

interface ConvertRequest {
  id: number;
  pixels: ArrayBuffer;
  width: number;
  height: number;
  options: VTracerOptions;
}

interface ConvertOk {
  id: number;
  svg: string;
}
interface ConvertErr {
  id: number;
  error: string;
}

let initPromise: Promise<void> | null = null;
function ensureWasm(): Promise<void> {
  if (!initPromise) {
    initPromise = init({ module_or_path: wasmUrl })
      .then(() => undefined)
      .catch((err) => {
        // Allow retry on the next call; otherwise one bad network blip locks
        // the worker permanently.
        initPromise = null;
        throw err;
      });
  }
  return initPromise;
}

self.onmessage = async (event: MessageEvent<ConvertRequest>) => {
  const { id, pixels, width, height, options } = event.data;
  try {
    await ensureWasm();
    const rgba = new Uint8Array(pixels);
    const svg = vectorize_rgba(rgba, width, height, options);
    const ok: ConvertOk = { id, svg };
    (self as unknown as Worker).postMessage(ok);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    const fail: ConvertErr = { id, error: msg };
    (self as unknown as Worker).postMessage(fail);
  }
};

// Type module worker — should never reach here since we only listen for messages.
export {};
