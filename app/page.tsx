"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import clsx from "clsx";
import Image from "next/image";

type Palette = {
  name: string;
  colors: [string, string, string];
};

type HistoryItem = {
  id: string;
  dataUrl: string;
  prompt: string;
  style: string;
  palette: string;
  timestamp: number;
};

const palettes: Palette[] = [
  { name: "Aurora", colors: ["#13f1fc", "#0470dc", "#1f1a3a"] },
  { name: "Solar Burst", colors: ["#ffe29f", "#ffa99f", "#ff719a"] },
  { name: "Jade Circuit", colors: ["#00f5a0", "#00d9f5", "#0067f5"] },
  { name: "Neon Noir", colors: ["#7f5af0", "#2cb1bc", "#16161a"] },
  { name: "Sunset Bloom", colors: ["#ff9a8b", "#ff6a88", "#ff99ac"] },
  { name: "Digital Forest", colors: ["#a0ff9d", "#16c79a", "#132a13"] }
];

const styles = [
  "Abstract Flow",
  "Polygon Nebula",
  "Fractal Bloom",
  "Chromatic Storm",
  "Synthwave Horizon",
  "Liquid Aurora"
];

const resolutions = [
  { label: "Square 1024x1024", width: 1024, height: 1024 },
  { label: "Landscape 1280x720", width: 1280, height: 720 },
  { label: "Portrait 720x1280", width: 720, height: 1280 }
];

class RNG {
  private seed: number;

  constructor(seedString: string) {
    this.seed = RNG.hash(seedString);
  }

  private static hash(input: string) {
    let h = 1779033703;
    for (let i = 0; i < input.length; i += 1) {
      h = Math.imul(h ^ input.charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    return (h >>> 0) / 4294967296;
  }

  next() {
    let t = (this.seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  range(min: number, max: number) {
    return min + this.next() * (max - min);
  }
}

export default function Page() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [prompt, setPrompt] = useState("dreamscape of floating islands with neon rivers");
  const [selectedStyle, setSelectedStyle] = useState(styles[0]);
  const [selectedPalette, setSelectedPalette] = useState(palettes[0].name);
  const [selectedResolution, setSelectedResolution] = useState(resolutions[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const palette = useMemo(
    () => palettes.find((p) => p.name === selectedPalette) ?? palettes[0],
    [selectedPalette]
  );

  const drawBackdrop = useCallback(
    (ctx: CanvasRenderingContext2D, rng: RNG, width: number, height: number) => {
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, palette.colors[0]);
      gradient.addColorStop(0.6, palette.colors[1]);
      gradient.addColorStop(1, palette.colors[2]);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      const rings = 8;
      for (let i = 0; i < rings; i += 1) {
        const radius = Math.max(width, height) * rng.range(0.1, 0.6);
        const x = rng.range(-width * 0.2, width * 1.2);
        const y = rng.range(-height * 0.2, height * 1.2);
        const radial = ctx.createRadialGradient(x, y, radius * 0.2, x, y, radius);
        radial.addColorStop(0, `${palette.colors[i % 3]}88`);
        radial.addColorStop(1, `${palette.colors[(i + 1) % 3]}00`);
        ctx.fillStyle = radial;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    },
    [palette]
  );

  const drawPolygons = useCallback(
    (ctx: CanvasRenderingContext2D, rng: RNG, width: number, height: number) => {
      const layers = 12;
      ctx.globalCompositeOperation = "lighter";
      for (let i = 0; i < layers; i += 1) {
        const points = Math.floor(rng.range(3, 8));
        ctx.beginPath();
        for (let j = 0; j < points; j += 1) {
          const angle = (Math.PI * 2 * j) / points + rng.range(-0.5, 0.5);
          const radius = Math.min(width, height) * rng.range(0.2, 0.5);
          const x = width / 2 + Math.cos(angle) * radius * rng.range(0.6, 1.2);
          const y = height / 2 + Math.sin(angle) * radius * rng.range(0.6, 1.2);
          if (j === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fillStyle = `${palette.colors[i % 3]}${Math.floor(rng.range(40, 90)).toString(16)}`;
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";
    },
    [palette.colors]
  );

  const drawFluid = useCallback(
    (ctx: CanvasRenderingContext2D, rng: RNG, width: number, height: number) => {
      const blobs = 60;
      for (let i = 0; i < blobs; i += 1) {
        const x = rng.range(-0.2, 1.2) * width;
        const y = rng.range(-0.2, 1.2) * height;
        const radius = Math.max(width, height) * rng.range(0.05, 0.25);
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, `${palette.colors[i % 3]}dd`);
        gradient.addColorStop(1, `${palette.colors[(i + 1) % 3]}00`);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    },
    [palette.colors]
  );

  const drawParticles = useCallback(
    (ctx: CanvasRenderingContext2D, rng: RNG, width: number, height: number) => {
      const particleCount = 800;
      ctx.fillStyle = "#ffffff11";
      for (let i = 0; i < particleCount; i += 1) {
        const x = rng.range(0, width);
        const y = rng.range(0, height);
        const size = rng.range(0.5, 2);
        ctx.fillRect(x, y, size, size);
      }
    },
    []
  );

  const drawScanlines = useCallback(
    (ctx: CanvasRenderingContext2D, height: number) => {
      const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
      for (let y = 0; y < height; y += 1) {
        if (y % 2 === 0) {
          const offset = y * ctx.canvas.width * 4;
          for (let x = 0; x < ctx.canvas.width; x += 1) {
            const idx = offset + x * 4;
            imageData.data[idx] *= 0.95;
            imageData.data[idx + 1] *= 0.95;
            imageData.data[idx + 2] *= 0.95;
          }
        }
      }
      ctx.putImageData(imageData, 0, 0);
    },
    []
  );

  const renderArt = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const { width, height } = selectedResolution;
    canvas.width = width;
    canvas.height = height;

    const seedBase = `${prompt}-${selectedStyle}-${selectedPalette}-${Date.now()}`;
    const rng = new RNG(seedBase);

    drawBackdrop(ctx, rng, width, height);

    switch (selectedStyle) {
      case "Polygon Nebula":
        drawPolygons(ctx, rng, width, height);
        drawParticles(ctx, rng, width, height);
        break;
      case "Fractal Bloom":
        drawFluid(ctx, rng, width, height);
        drawParticles(ctx, rng, width, height);
        break;
      case "Chromatic Storm":
        drawPolygons(ctx, rng, width, height);
        drawFluid(ctx, rng, width, height);
        drawParticles(ctx, rng, width, height);
        break;
      case "Synthwave Horizon":
        drawFluid(ctx, rng, width, height);
        drawScanlines(ctx, height);
        break;
      case "Liquid Aurora":
        drawFluid(ctx, rng, width, height);
        drawParticles(ctx, rng, width, height);
        break;
      default:
        drawFluid(ctx, rng, width, height);
        drawPolygons(ctx, rng, width, height);
        drawParticles(ctx, rng, width, height);
        break;
    }

    if (selectedStyle !== "Synthwave Horizon") {
      drawScanlines(ctx, height);
    }

    return canvas.toDataURL("image/png");
  }, [
    drawBackdrop,
    drawFluid,
    drawParticles,
    drawPolygons,
    drawScanlines,
    prompt,
    selectedPalette,
    selectedResolution,
    selectedStyle
  ]);

  const handleGenerate = useCallback(async () => {
    if (isGenerating) return;
    setIsGenerating(true);

    try {
      const dataUrl = await renderArt();
      if (!dataUrl) return;
      setHistory((prev) => [
        {
          id: crypto.randomUUID(),
          dataUrl,
          prompt,
          style: selectedStyle,
          palette: selectedPalette,
          timestamp: Date.now()
        },
        ...prev
      ]);
    } finally {
      setIsGenerating(false);
    }
  }, [isGenerating, prompt, renderArt, selectedPalette, selectedStyle]);

  const handleDownload = useCallback((item: HistoryItem) => {
    const link = document.createElement("a");
    link.href = item.dataUrl;
    link.download = `${item.style.toLowerCase().replace(/\s+/g, "-")}-${item.id.slice(0, 8)}.png`;
    link.click();
  }, []);

  const currentImage = history[0];

  return (
    <main className="min-h-screen pb-24">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 pt-16 lg:flex-row">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="glass flex-1 rounded-3xl p-8"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold text-white">SpectraForge</h1>
              <p className="mt-2 text-sm text-white/70">
                Craft mesmerizing visuals with algorithmic artistry inspired by your imagination.
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                setPrompt("bioluminescent coral reefs under moonlit skies");
                setSelectedStyle(styles[Math.floor(Math.random() * styles.length)]);
                setSelectedPalette(palettes[Math.floor(Math.random() * palettes.length)].name);
              }}
              className="rounded-full border border-white/20 px-4 py-2 text-xs uppercase tracking-widest text-white/80 transition hover:border-white hover:bg-white/10"
            >
              Surprise Me
            </motion.button>
          </div>

          <div className="mt-8 grid gap-6">
            <label className="grid gap-2 text-sm text-white/70">
              Prompt
              <textarea
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                rows={3}
                className="glass w-full rounded-2xl border border-transparent bg-white/5 px-4 py-3 text-base text-white outline-none transition focus:border-brand-400 focus:bg-white/10"
                placeholder="Describe the scene you want to evoke..."
              />
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm text-white/70">
                Visual Style
                <div className="grid gap-2">
                  {styles.map((style) => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => setSelectedStyle(style)}
                      className={clsx(
                        "rounded-2xl border px-4 py-3 text-left text-sm transition",
                        selectedStyle === style
                          ? "border-brand-400 bg-brand-500/20 text-white shadow-glow"
                          : "border-white/10 bg-white/5 text-white/80 hover:border-white/25 hover:bg-white/10"
                      )}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </label>

              <label className="grid gap-2 text-sm text-white/70">
                Palette
                <div className="grid gap-3 sm:grid-cols-2">
                  {palettes.map((option) => (
                    <button
                      key={option.name}
                      type="button"
                      onClick={() => setSelectedPalette(option.name)}
                      className={clsx(
                        "flex flex-col gap-3 rounded-2xl border p-4 transition",
                        selectedPalette === option.name
                          ? "border-brand-300 bg-white/10 text-white shadow-glow"
                          : "border-white/10 bg-white/5 text-white/80 hover:border-white/25 hover:bg-white/10"
                      )}
                    >
                      <span className="text-sm font-medium">{option.name}</span>
                      <div className="flex overflow-hidden rounded-full">
                        {option.colors.map((color) => (
                          <div key={color} className="h-3 w-1/3" style={{ backgroundColor: color }} />
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              </label>
            </div>

            <div className="grid gap-2 text-sm text-white/70">
              Resolution
              <div className="flex flex-wrap gap-2">
                {resolutions.map((res) => (
                  <button
                    key={res.label}
                    type="button"
                    onClick={() => setSelectedResolution(res)}
                    className={clsx(
                      "rounded-full border px-4 py-2 text-xs uppercase tracking-wide transition",
                      selectedResolution.label === res.label
                        ? "border-brand-400 bg-brand-500/30 text-white shadow-glow"
                        : "border-white/10 bg-white/5 text-white/70 hover:border-white/25 hover:bg-white/10"
                    )}
                  >
                    {res.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleGenerate}
            disabled={isGenerating}
            className="mt-8 flex w-full items-center justify-center gap-3 rounded-full border border-brand-300 bg-brand-500 px-6 py-3 text-sm font-semibold uppercase tracking-widest text-white shadow-lg shadow-brand-700/30 transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isGenerating ? (
              <svg
                className="h-5 w-5 animate-spin text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
            ) : (
              <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 5v14m0 0l-5-5m5 5l5-5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M5 12a7 7 0 0114 0"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
            {isGenerating ? "Synthesizing..." : "Generate Artwork"}
          </motion.button>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="glass flex w-full max-w-xl flex-col gap-6 rounded-3xl p-6"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Live Canvas</h2>
            {currentImage && (
              <button
                type="button"
                onClick={() => handleDownload(currentImage)}
                className="rounded-full border border-white/20 px-4 py-2 text-xs uppercase tracking-widest text-white/80 transition hover:border-white hover:bg-white/10"
              >
                Download PNG
              </button>
            )}
          </div>

          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl border border-white/10 bg-black/40">
            <canvas ref={canvasRef} className="h-full w-full object-cover" />
            {!currentImage && (
              <div className="absolute inset-0 grid place-content-center text-center text-white/60">
                <p className="text-sm uppercase tracking-widest">Your creation will appear here</p>
              </div>
            )}
          </div>

          <div>
            <h3 className="text-sm uppercase tracking-[0.3em] text-white/60">Recent Creations</h3>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {history.length === 0 && (
                <p className="text-xs text-white/50">Generate artwork to populate your gallery.</p>
              )}
              {history.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  className="glass flex flex-col gap-3 rounded-2xl border border-white/10 p-4"
                >
                  <div className="relative aspect-square overflow-hidden rounded-xl border border-white/10">
                    <Image
                      src={item.dataUrl}
                      alt={item.prompt}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleDownload(item)}
                      className="absolute bottom-2 right-2 rounded-full bg-black/60 px-3 py-1 text-[11px] uppercase tracking-widest text-white/80 transition hover:bg-black/80"
                    >
                      Save
                    </button>
                  </div>
                  <div className="space-y-1 text-xs text-white/70">
                    <p className="font-medium text-white">{item.style}</p>
                    <p className="line-clamp-2 text-[11px] text-white/60">{item.prompt}</p>
                    <p className="text-[10px] uppercase tracking-widest text-white/40">
                      {new Date(item.timestamp).toLocaleString()}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>
      </div>
    </main>
  );
}
